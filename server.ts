import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Bot detection middleware
  server.use((req: any, res, next) => {
    const userAgent = req.get('user-agent') || '';
    req.isBot = /bot|crawler|spider|facebook|twitter|linkedin|slack|discord/i.test(userAgent);
    next();
  });

  // Dynamic routes first
  server.get('*', async (req: any, res, next) => {
    // Skip static files
    if (req.path.match(/\.(jpg|jpeg|png|gif|ico|css|js|svg)$/i)) {
      return next();
    }

    try {
      const { protocol, originalUrl, baseUrl, headers } = req;
      const url = `${protocol}://${headers.host}${originalUrl}`;

      if (req.isBot) {
        res.setTimeout(30000);
      }

      const html = await commonEngine.render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
        ],
        inlineCriticalCss: false
      });

      res.send(html);
    } catch (error) {
      next(error);
    }
  });

  // Static files after
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

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
