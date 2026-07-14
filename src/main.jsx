import { ViteReactSSG } from 'vite-react-ssg';
import App from './App';
import './styles.css';
import foodData from '../data/export.json';

const itemSlugs = foodData
  .filter((item) => item.free)
  .map((item) => item.image);

const staticItemRoutes = itemSlugs.flatMap((slug) => [`/item/${slug}/`, `/en/item/${slug}/`]);
const allStaticRoutes = ['/', '/en/', ...staticItemRoutes];

export function includedRoutes() {
  return allStaticRoutes;
}

export const createRoot = ViteReactSSG({
  routes: [
    { path: '/', Component: App },
    {
      path: '/:locale',
      Component: App,
      getStaticPaths: () => ['/en/'],
    },
    {
      path: '/item/:slug',
      Component: App,
      getStaticPaths: () => itemSlugs.map((slug) => `/item/${slug}/`),
    },
    {
      path: '/:locale/item/:slug',
      Component: App,
      getStaticPaths: () => itemSlugs.map((slug) => `/en/item/${slug}/`),
    },
  ],
}, undefined, {
  async onFinished(dir) {
    const { promises: fs } = await import('node:fs');
    const { join } = await import('node:path');

    const baseUrl = 'https://inseason-foods.com';
    const urls = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/en/', priority: '1.0', changefreq: 'weekly' },
      ...staticItemRoutes.map((path) => ({
        path,
        priority: '0.8',
        changefreq: 'monthly',
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

    await fs.writeFile(join(dir, 'sitemap.xml'), sitemap, 'utf8');
  },
});
