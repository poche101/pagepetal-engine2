import { createFileRoute } from '@tanstack/react-router';

const BASE = 'https://braconwire.com';

const STATIC_PATHS = [
  '/',
  '/about',
  '/products',
  '/services',
  '/projects',
  '/quality',
  '/distributors',
  '/insights',
  '/faq',
  '/contact',
  '/quote',
  '/privacy',
  '/terms',
];

// Add service slugs here until we find where they are defined
const SERVICE_SLUGS: string[] = ['custom-design', 'wooden-drums', 'cable-rewinding'];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { mergeProducts } = await import('../lib/site-data');

        let content: { key: string; title: string; body: string; category: string }[] = [];
        try {
          const { getStore } = await import('../lib/store.server');
          content = (await (await getStore()).listContent(true)).map(
            ({ key, title, body, category }) => ({ key, title, body, category }),
          );
        } catch (e) {
          console.error('sitemap: could not load content, using built-in products only:', e);
        }

        const paths = [
          ...STATIC_PATHS,
          ...mergeProducts(content).map((p) => `/products/${encodeURIComponent(p.slug)}`),
          ...SERVICE_SLUGS.map((s) => `/services/${encodeURIComponent(s)}`),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${esc(BASE + p)}</loc></url>`).join('\n')}
</urlset>`;

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
