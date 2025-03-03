import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';

interface CustomRequest extends express.Request {
  isBot?: boolean;
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

  // Serve static files
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y',
    index: false
  }));

  // Add bot detection middleware
  server.use((req: CustomRequest, res, next) => {
    const userAgent = req.get('user-agent') || '';
    req.isBot = /bot|crawler|spider|facebook|twitter|linkedin|slack|discord/i.test(userAgent);
    next();
  });

  // All regular routes use the Angular engine
  server.get('*', async (req: CustomRequest, res, next) => {
    try {
      const { protocol, originalUrl, baseUrl, headers } = req;
      const url = `${protocol}://${headers.host}${originalUrl}`;

      // Increase timeout for bots
      const renderTimeout = req.isBot ? 10000 : 5000;
      res.setTimeout(renderTimeout);

      const html = await commonEngine.render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
        ],
      });

      // Add cache control for bots
      if (req.isBot) {
        res.setHeader('Cache-Control', 'public, max-age=300');
      }

      res.send(html);
    } catch (error) {
      console.error('Error rendering page:', error);
      next(error);
    }
  });

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
