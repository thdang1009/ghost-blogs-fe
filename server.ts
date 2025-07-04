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

    // Pre-check blog post routes to prevent SSR hanging
    const blogPostMatch = req.path.match(/^\/blogs\/(.+)$/);
    if (blogPostMatch) {
      const postRef = blogPostMatch[1];
      console.log(`Checking post reference: ${postRef}`);
      
      try {
        // Check if post exists before rendering
        const backendUrl = 'https://dangtrinh.site/api';
        const apiUrl = `${backendUrl}/v1/post/ref/${postRef}`;
        console.log(`Making API call to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        console.log(`API response status: ${response.status}`);
        
        if (response.status === 404) {
          // Post doesn't exist, redirect to home immediately
          console.log(`Post ${postRef} not found, redirecting to home`);
          return res.redirect('/home');
        }
        
        // If response is not 200, also redirect
        if (response.status !== 200) {
          console.log(`Post ${postRef} returned status ${response.status}, redirecting to home`);
          return res.redirect('/home');
        }
        
        // Try to parse the response to make sure it's valid JSON
        const postData = await response.json();
        if (!postData || !postData._id) {
          console.log(`Post ${postRef} has invalid data, redirecting to home`);
          return res.redirect('/home');
        }
        
        console.log(`Post ${postRef} found, proceeding with SSR`);
        
      } catch (apiError) {
        console.error('API check failed for post:', postRef, apiError);
        // If API check fails, redirect to home
        return res.redirect('/home');
      }
    }

    try {
      const { protocol, originalUrl, baseUrl, headers } = req;
      const url = `${protocol}://${headers.host}${originalUrl}`;

      if (req.isBot) {
        res.setTimeout(30000);
      }

      // Add timeout to prevent SSR hanging
      const renderPromise = commonEngine.render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
        ],
        inlineCriticalCss: false
      });

      // Set a 10-second timeout for SSR rendering
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SSR timeout')), 10000);
      });

      const html = await Promise.race([renderPromise, timeoutPromise]);
      res.send(html);
    } catch (error) {
      console.error('SSR Error:', error);
      // Return a simple error page instead of hanging
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
          <h1>Something went wrong</h1>
          <p>Please try again later.</p>
          <script>window.location.href = '/home';</script>
        </body>
        </html>
      `);
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
