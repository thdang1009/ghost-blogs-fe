// Builds prerender-routes.txt by enumerating every public post slug from the
// backend. Run before `ng build` so Angular's prerender builder can emit a
// static HTML file for each URL.
//
// Usage:
//   node scripts/generate-prerender-routes.mjs
//
// Env:
//   PRERENDER_API_BASE   default: https://dangtrinh.site/api
//   PRERENDER_OUTPUT     default: prerender-routes.txt
//   PRERENDER_PAGE_SIZE  default: 200

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_BASE = process.env.PRERENDER_API_BASE || 'https://dangtrinh.site/api';
const OUTPUT = process.env.PRERENDER_OUTPUT || 'prerender-routes.txt';
const PAGE_SIZE = Number(process.env.PRERENDER_PAGE_SIZE || 200);

const STATIC_ROUTES = [
  '/',
  '/home',
  '/post-by-series',
  '/donation',
  '/data-deletion',
];

async function fetchPostSlugs() {
  const slugs = new Set();
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const url = `${API_BASE}/v1/post/public?page=${page}&limit=${PAGE_SIZE}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    const body = await res.json();
    const posts = body?.posts ?? [];
    for (const post of posts) {
      const ref = post.postReference || post.slug;
      if (ref) slugs.add(`/blogs/${ref}`);
    }
    const pagination = body?.pagination;
    hasNext = !!pagination?.hasNextPage;
    page += 1;
    if (page > 1000) break; // hard safety cap
  }

  return [...slugs];
}

async function main() {
  let postRoutes = [];
  try {
    postRoutes = await fetchPostSlugs();
    console.log(`[prerender] discovered ${postRoutes.length} post slugs`);
  } catch (err) {
    console.warn(`[prerender] could not reach API (${err.message}). Falling back to static routes only.`);
  }

  const all = [...new Set([...STATIC_ROUTES, ...postRoutes])];
  const outputPath = resolve(process.cwd(), OUTPUT);
  writeFileSync(outputPath, all.join('\n') + '\n', 'utf8');
  console.log(`[prerender] wrote ${all.length} routes -> ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
