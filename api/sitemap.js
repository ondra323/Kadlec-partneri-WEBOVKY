// /sitemap.xml – statické stránky + publikované články z Firestore (nový článek se objeví sám)
const SITE = 'https://kadlec-partneri.cz';
const KEY = 'AIzaSyCMpXn3fBghTYqDaLrbjEN4NYz6Utlg8gI';
const PAGES = [
  ['/', '1.0'], ['/investice', '0.9'], ['/penze', '0.9'], ['/pojisteni', '0.9'], ['/o-mne', '0.8'],
  ['/blog', '0.7'], ['/informace', '0.3'], ['/gdpr', '0.2'],
];
const UPDATED = '2026-11-02';

async function articles() {
  const r = await fetch(`https://firestore.googleapis.com/v1/projects/blog-adbe8/databases/(default)/documents:runQuery?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'articles' }],
      where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
      select: { fields: [{ fieldPath: 'publishedAt' }, { fieldPath: 'updatedAt' }] },
    } }),
  });
  if (!r.ok) return [];
  return (await r.json()).filter(x => x.document).map(({ document: d }) => ({
    id: d.name.split('/').pop(),
    date: ((d.fields.updatedAt || d.fields.publishedAt || {}).timestampValue || '').slice(0, 10),
  }));
}

module.exports = async (req, res) => {
  let list = [];
  try { list = await articles(); } catch (e) { /* bez článků je sitemapa pořád platná */ }
  const url = (loc, lastmod, priority) =>
    `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<priority>${priority}</priority></url>`;
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    PAGES.map(([p, pr]) => url(SITE + p, UPDATED, pr)).concat(
      list.map(a => url(`${SITE}/blog?clanek=${encodeURIComponent(a.id)}`, a.date, '0.6'))).join('\n') + '\n</urlset>\n';
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
};
