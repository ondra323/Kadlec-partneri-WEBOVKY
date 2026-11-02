// /sitemap.xml – statické stránky + publikované články z Firestore (nový článek se objeví sám)
const { articlePath, listArticles } = require('./_blog');

const SITE = 'https://kadlec-partneri.cz';
const UPDATED = '2026-11-02';
const PAGES = [
  ['/', '1.0'], ['/pojisteni', '0.9'], ['/hypoteky', '0.9'], ['/penze', '0.9'], ['/investice', '0.9'],
  ['/o-mne', '0.8'], ['/blog', '0.7'], ['/informace', '0.3'], ['/gdpr', '0.2'],
];

module.exports = async (req, res) => {
  let list = [];
  try { list = await listArticles(); } catch (e) { /* bez článků je sitemapa pořád platná */ }
  const url = (loc, lastmod, priority) =>
    `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<priority>${priority}</priority></url>`;
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGES.map(([p, pr]) => url(SITE + p, UPDATED, pr)).concat(
      list.map((a) => url(SITE + articlePath(a), (a.updatedAt || a.publishedAt || '').slice(0, 10), '0.6'))).join('\n') + '\n</urlset>\n';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
