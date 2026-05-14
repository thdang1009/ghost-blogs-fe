import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// CDN-friendly cache profile per route class.
// Public reading surface: cache at the edge for 60s, serve stale for up to 10min
// while a background revalidation fetches a fresh copy. Private/auth routes
// must never be cached at a shared cache.
const CACHE_RULES: Array<{ test: RegExp; header: string }> = [
  {
    test: /^\/blogs\//,
    header: 'public, s-maxage=60, stale-while-revalidate=600',
  },
  {
    test: /^\/(home|post-by-series)(\/|$|\?)/,
    header: 'public, s-maxage=60, stale-while-revalidate=600',
  },
  {
    test: /^\/$/,
    header: 'public, s-maxage=60, stale-while-revalidate=600',
  },
];

const PRIVATE_PATHS = /^\/(admin|me|login|logout|register|reset-password|confirm-email|tool|apps|operation|user|file|dashboard)(\/|$|\?)/;

function pickCacheControl(pathname: string): string {
  if (PRIVATE_PATHS.test(pathname)) {
    return 'private, no-store';
  }
  for (const rule of CACHE_RULES) {
    if (rule.test.test(pathname)) return rule.header;
  }
  // Default: small TTL so other public pages still benefit from the CDN
  return 'public, s-maxage=30, stale-while-revalidate=300';
}

// In-process render cache so the SSR engine isn't invoked again before the CDN
// asks for revalidation. The /internal/revalidate webhook clears entries.
interface CacheEntry {
  html: string;
  expiresAt: number;
}
const RENDER_CACHE = new Map<string, CacheEntry>();
const RENDER_CACHE_TTL_MS = 60_000;
const RENDER_CACHE_MAX_ENTRIES = 500;

function cacheKey(pathname: string): string | null {
  if (PRIVATE_PATHS.test(pathname)) return null;
  return pathname;
}

function readRenderCache(pathname: string): string | null {
  const key = cacheKey(pathname);
  if (!key) return null;
  const hit = RENDER_CACHE.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    RENDER_CACHE.delete(key);
    return null;
  }
  return hit.html;
}

function writeRenderCache(pathname: string, html: string): void {
  const key = cacheKey(pathname);
  if (!key) return;
  if (RENDER_CACHE.size >= RENDER_CACHE_MAX_ENTRIES) {
    const firstKey = RENDER_CACHE.keys().next().value;
    if (firstKey) RENDER_CACHE.delete(firstKey);
  }
  RENDER_CACHE.set(key, { html, expiresAt: Date.now() + RENDER_CACHE_TTL_MS });
}

export function invalidateRenderCache(pathname?: string): number {
  if (!pathname) {
    const size = RENDER_CACHE.size;
    RENDER_CACHE.clear();
    return size;
  }
  return RENDER_CACHE.delete(pathname) ? 1 : 0;
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.json({ limit: '64kb' }));

  // Bot detection middleware
  server.use((req: any, res, next) => {
    const userAgent = req.get('user-agent') || '';
    req.isBot =
      /bot|crawler|spider|facebook|twitter|linkedin|slack|discord/i.test(
        userAgent
      );
    next();
  });

  // Revalidation webhook: called by the backend when a post is created/updated.
  // Drops the in-process cache entry so the next request re-renders fresh HTML
  // and the CDN's stale-while-revalidate window pulls the new copy.
  server.post('/internal/revalidate', (req, res) => {
    const expected = process.env['REVALIDATE_SECRET'];
    const provided = req.get('x-revalidate-secret') || '';
    if (!expected || provided !== expected) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    const path = (req.body?.path as string | undefined) || (req.query['path'] as string | undefined);
    const cleared = invalidateRenderCache(path);
    return res.json({ ok: true, cleared, path: path ?? '*' });
  });

  // Dynamic routes first
  server.get('*', async (req: any, res, next) => {
    // Skip static files
    if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|svg)$/i)) {
      return next();
    }

    try {
      const { protocol, originalUrl, baseUrl, headers, path: pathname } = req;
      const url = `${protocol}://${headers.host}${originalUrl}`;
      const cacheControl = pickCacheControl(pathname);

      res.setHeader('Cache-Control', cacheControl);
      // Helpful for CDN debugging and avoids cookie-keyed caches mis-serving
      // logged-out users with logged-in HTML.
      res.setHeader('Vary', 'Accept-Encoding, Cookie');

      const cached = readRenderCache(pathname);
      if (cached) {
        res.setHeader('X-Render-Cache', 'HIT');
        return res.send(cached);
      }

      if (req.isBot) {
        res.setTimeout(30000);
      }

      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
        inlineCriticalCss: true,
      });

      writeRenderCache(pathname, html);
      res.setHeader('X-Render-Cache', 'MISS');
      res.send(html);
    } catch (error) {
      next(error);
    }
  });

  // Static files after
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    })
  );

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4500;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
