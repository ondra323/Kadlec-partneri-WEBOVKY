// Články blogu z Firestore (veřejné čtení publikovaných článků) – sdílí sitemap.js a clanek.js
const KEY = 'AIzaSyCMpXn3fBghTYqDaLrbjEN4NYz6Utlg8gI';
const DB = 'https://firestore.googleapis.com/v1/projects/blog-adbe8/databases/(default)/documents';

const val = (f) => f && (f.stringValue ?? f.timestampValue ?? f.integerValue ?? null);

function slugify(s) {
  s = String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const s2 = s.length > 60 ? s.slice(0, s.lastIndexOf('-', 60)) : s;   // řez jen mezi slovy
  return s2 || s.slice(0, 60);
}

// /blog/<titulek-jako-slug>-<id>; id z Firestore má 20 znaků
const articlePath = (a) => `/blog/${slugify(a.title)}-${a.id}`;
const idFromSlug = (slug) => (/([A-Za-z0-9]{20})$/.exec(slug || '') || [])[1] || null;

function fromDoc(d) {
  const f = d.fields || {};
  return {
    id: d.name.split('/').pop(), title: val(f.title) || '', excerpt: val(f.excerpt) || '',
    content: val(f.content) || '', category: val(f.category) || '', crossSell: val(f.crossSell) || '',
    imageUrl: val(f.imageUrl) || '', status: val(f.status), publishedAt: val(f.publishedAt), updatedAt: val(f.updatedAt),
  };
}

async function listArticles() {
  const r = await fetch(`${DB}:runQuery?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: 'articles' }],
      where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
      select: { fields: ['title', 'publishedAt', 'updatedAt'].map((fieldPath) => ({ fieldPath })) },
    } }),
  });
  if (!r.ok) return [];
  return (await r.json()).filter((x) => x.document).map((x) => fromDoc(x.document));
}

async function getArticle(id) {
  const r = await fetch(`${DB}/articles/${encodeURIComponent(id)}?key=${KEY}`);
  if (!r.ok) return null;
  const a = fromDoc(await r.json());
  return a.status === 'published' ? a : null;
}

module.exports = { slugify, articlePath, idFromSlug, listArticles, getArticle };
