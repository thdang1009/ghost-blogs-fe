import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { request as httpRequest, IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import bootstrap from './src/main.server';

// Backend host used by the SSR Express process to look up post metadata for
// social-share previews. Direct loopback to the API on the same EC2 box —
// nginx + cookies + the Angular HTTP backend are all out of the picture, so
// this works regardless of whether the Angular SSR resolver happens to pick
// the response up before serialisation.
const SSR_API_BASE = process.env['SSR_API_BASE'] || 'http://127.0.0.1:3000';
const SITE_ORIGIN = 'https://dangtrinh.site';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/img/ghost.png`;

interface PostSeo {
  title: string;
  description: string;
  image: string;
  author: string;
  tags: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

// Uses node:http directly instead of global fetch because EC2's Node runtime
// is older than 18.17 and `fetch` is not defined — that was the actual reason
// the SSR meta-tag injection silently produced default fallbacks.
function httpGetJson(
  url: string,
  timeoutMs: number
): Promise<{ status: number; body: any }> {
  const requestFn = url.startsWith('https:') ? httpsRequest : httpRequest;
  return new Promise((resolveP, rejectP) => {
    const req = requestFn(
      url,
      { method: 'GET', headers: { Accept: 'application/json' } },
      (res: IncomingMessage) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let body: any = null;
          try {
            body = text ? JSON.parse(text) : null;
          } catch (e: any) {
            return rejectP(
              new Error(`json parse failed: ${e?.message || e}`)
            );
          }
          resolveP({ status: res.statusCode || 0, body });
        });
        res.on('error', rejectP);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`timeout after ${timeoutMs}ms`));
    });
    req.on('error', rejectP);
    req.end();
  });
}

async function fetchPostSeo(ref: string): Promise<PostSeo | null> {
  const url = `${SSR_API_BASE}/v1/post/ref/${encodeURIComponent(ref)}`;
  const started = Date.now();
  try {
    const { status, body: post } = await httpGetJson(url, 5000);
    if (status < 200 || status >= 300) {
      console.warn(
        `[seo] fetchPostSeo ${ref}: status=${status} url=${url} time=${Date.now() - started}ms`
      );
      return null;
    }
    if (!post || !post.title) {
      console.warn(
        `[seo] fetchPostSeo ${ref}: empty/invalid body keys=${post ? Object.keys(post).join(',') : 'null'} time=${Date.now() - started}ms`
      );
      return null;
    }
    console.log(
      `[seo] fetchPostSeo ${ref}: ok title="${String(post.title).slice(0, 60)}" img=${post.postBackgroundImg ? 'yes' : 'no'} time=${Date.now() - started}ms`
    );
    return {
      title: String(post.title),
      description: String(post.description || ''),
      image: toAbsoluteAssetUrl(post.postBackgroundImg) || DEFAULT_OG_IMAGE,
      author: String(post.author || 'Dang Trinh'),
      tags: Array.isArray(post.tags)
        ? post.tags
            .map((t: any) => (t && typeof t.name === 'string' ? t.name : null))
            .filter((name: string | null): name is string => !!name)
        : [],
      publishedTime: post.createdAt ? String(post.createdAt) : undefined,
      modifiedTime: post.updatedAt ? String(post.updatedAt) : undefined,
    };
  } catch (e: any) {
    console.error(
      `[seo] fetchPostSeo ${ref}: error url=${url} time=${Date.now() - started}ms message=${e?.message || e} code=${e?.code || ''}`
    );
    return null;
  }
}

function toAbsoluteAssetUrl(maybeUrl?: string | null): string {
  if (!maybeUrl) return '';
  const trimmed = String(maybeUrl).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `${SITE_ORIGIN}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function escapeAttr(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMeta(
  html: string,
  attr: 'name' | 'property',
  key: string,
  content: string
): string {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `<meta\\s+${attr}="${escapedKey}"\\s+content="[^"]*"\\s*\\/?>`,
    'i'
  );
  const replacement = `<meta ${attr}="${key}" content="${escapeAttr(content)}">`;
  if (re.test(html)) return html.replace(re, replacement);
  return html.replace(/<\/head>/i, `${replacement}</head>`);
}

function injectPostSeo(
  html: string,
  post: PostSeo,
  canonicalUrl: string
): string {
  let out = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeAttr(post.title)}</title>`
  );
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(post.description)}">`
  );
  out = setMeta(out, 'property', 'og:type', 'article');
  out = setMeta(out, 'property', 'og:title', post.title);
  out = setMeta(out, 'property', 'og:description', post.description);
  out = setMeta(out, 'property', 'og:image', post.image);
  out = setMeta(out, 'property', 'og:image:alt', post.title);
  out = setMeta(out, 'property', 'og:url', canonicalUrl);
  out = setMeta(out, 'name', 'twitter:title', post.title);
  out = setMeta(out, 'name', 'twitter:description', post.description);
  out = setMeta(out, 'name', 'twitter:image', post.image);
  out = setMeta(out, 'name', 'twitter:image:alt', post.title);
  out = setMeta(out, 'property', 'article:author', post.author);
  if (post.publishedTime) {
    out = setMeta(out, 'property', 'article:published_time', post.publishedTime);
  }
  if (post.modifiedTime) {
    out = setMeta(out, 'property', 'article:modified_time', post.modifiedTime);
  }
  if (post.tags.length) {
    const tagMetas = post.tags
      .map(t => `<meta property="article:tag" content="${escapeAttr(t)}">`)
      .join('');
    // Strip any prior article:tag occurrences first to avoid duplicates from
    // cached / pre-existing renders.
    out = out.replace(
      /<meta\s+property="article:tag"\s+content="[^"]*"\s*\/?>/gi,
      ''
    );
    out = out.replace(/<\/head>/i, `${tagMetas}</head>`);
  }
  return out;
}

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
        console.log(`[ssr] HIT ${pathname}`);
        return res.send(cached);
      }
      console.log(`[ssr] MISS ${pathname} ua="${(req.get('user-agent') || '').slice(0, 40)}"`);

      if (req.isBot) {
        res.setTimeout(30000);
      }

      // Run the post-metadata fetch alongside the Angular SSR render. Whatever
      // the Angular pipeline emits, we rewrite the OG/Twitter meta tags from
      // the authoritative post record here so social-share unfurlers always
      // see the right title/image/description/tags.
      const blogMatch = pathname.match(/^\/blogs\/([^/?#]+)\/?$/);
      const postSeoPromise: Promise<PostSeo | null> = blogMatch
        ? fetchPostSeo(blogMatch[1])
        : Promise.resolve(null);

      const [renderedHtml, postSeo] = await Promise.all([
        commonEngine.render({
          bootstrap,
          documentFilePath: indexHtml,
          url,
          publicPath: browserDistFolder,
          providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
          inlineCriticalCss: true,
        }),
        postSeoPromise,
      ]);

      const canonicalUrl = `${SITE_ORIGIN}${pathname}`;
      let html: string;
      if (postSeo) {
        html = injectPostSeo(renderedHtml, postSeo, canonicalUrl);
        console.log(
          `[seo] injected ${pathname} title="${postSeo.title.slice(0, 60)}" tags=${postSeo.tags.length}`
        );
      } else {
        html = renderedHtml;
        if (blogMatch) {
          console.warn(
            `[seo] no injection for ${pathname} (postSeo was null — fetch failed or no match)`
          );
        }
      }

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
