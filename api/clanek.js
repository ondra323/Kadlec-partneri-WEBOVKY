// /blog/<slug>-<id> – článek vykreslený na serveru, aby ho vyhledávače i AI četly bez JavaScriptu
const { articlePath, idFromSlug, getArticle } = require('./_blog');
const S = require('./_shell');

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const text = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const cut = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,.;:–-]+$/, '') + '…');
const czDate = (iso) => { const d = new Date(iso); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; };

// Obsah z administrace: bez staré výzvy (vkládá ji editor na konec) a bez prázdných odstavců
function clean(html) {
  const i = html.indexOf('<div style="background:#113225');
  html = (i >= 0 ? html.slice(0, i) : html).replace(/<p>(\s|<br\s*\/?>|&nbsp;)*<\/p>/g, '');
  // mezititulky začínají pod H1 článku: když editor použil jen H3, posuneme je na H2
  return /<h2/i.test(html) ? html : html.replace(/<(\/?)h3\b/gi, '<$1h2');
}

const sized = (u, w) => (/^https:\/\/images\.unsplash\.com\//.test(u) ? `${u.split('?')[0]}?w=${w}&q=72&auto=format&fit=crop` : u);

function related(a) {
  const key = S.services[a.crossSell] ? a.crossSell : (a.category || '').toLowerCase().startsWith('penz') ? 'penze' : null;
  return key ? S.services[key] : null;
}

function page(a) {
  const url = S.site + articlePath(a);
  const desc = cut(a.excerpt || text(a.content), 155);
  const date = a.publishedAt || a.updatedAt;
  const minutes = Math.max(1, Math.round(text(a.content).split(' ').length / 200));
  const rel = related(a);
  const tema = rel ? rel[2] : '';
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', '@id': url + '#clanek', headline: a.title, description: desc, image: a.imageUrl || undefined,
      datePublished: date, dateModified: a.updatedAt || date, inLanguage: 'cs', mainEntityOfPage: url,
      author: { '@type': 'Person', '@id': S.personId, name: 'Ondřej Kadlec', url: S.site + '/o-mne' },
      publisher: { '@id': S.orgId } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Úvod', item: S.site + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: S.site + '/blog' },
      { '@type': 'ListItem', position: 3, name: a.title, item: url }] }] };
  const services = Object.entries(S.services).filter(([k]) => k !== 'uvery')
    .map(([, s]) => `<a href="${s[0]}">${s[1]} →</a>`).join('');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(a.title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="Kadlec &amp; partneři">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(a.imageUrl || S.site + '/assets/ondrej-jemnice-1400.webp')}">
<meta property="article:published_time" content="${esc(date)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0f3b2a">
<link rel="preload" href="/assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link href="/assets/fonts/fonts.css" rel="stylesheet">
<link href="/assets/page.css" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script>window.kt=window.kt||function(){(kt.q=kt.q||[]).push(arguments)}</script>
<script src="/assets/track.js" defer></script>
<script src="/assets/pixel.js" defer></script>
</head>
<body>
${S.topbar}
<main>
<article>
<div class="hero">
  <p class="eyebrow"><a href="/blog">Blog</a>${a.category ? ' · ' + esc(a.category) : ''}</p>
  <h1 class="h1-article">${esc(a.title)}</h1>
  ${a.excerpt ? `<p class="answer">${esc(a.excerpt)}</p>` : ''}
  <p class="byline"><img src="/assets/ondrej-face-112.webp" alt="" width="56" height="56">
    <span><a href="/o-mne">Ondřej Kadlec</a>, finanční poradce v Jemnici<br>
    <time datetime="${esc(date)}">${czDate(date)}</time> · ${minutes} min čtení</span></p>
</div>
${a.imageUrl ? `<figure class="article-img"><img src="${esc(sized(a.imageUrl, 1600))}" srcset="${esc(sized(a.imageUrl, 800))} 800w, ${esc(sized(a.imageUrl, 1600))} 1600w" sizes="(max-width: 1160px) 100vw, 1100px" alt="" width="1600" height="900" fetchpriority="high"></figure>` : ''}
<div class="body">
  <div class="prose">
    ${clean(a.content)}
    ${rel ? `<p class="rel-box">Souvisí s tím: <a href="${rel[0]}">${rel[1]} v Jemnici a okolí →</a></p>` : ''}
  </div>
  <aside class="aside">
    <p>Máte podobnou otázku? Kancelář Havlíčkovo nám. 8, Jemnice. Přijedu i za vámi domů, nebo se sejdeme online.</p>
    <a class="tel" href="tel:${S.telHref}" data-track="Článek · telefon">${S.tel}</a>
    <a class="pill" href="/konzultace${tema}" data-track="Článek · bok">Krátký dotazník</a>
    <nav class="related" aria-label="Služby">${services}<a href="/blog">Všechny články →</a></nav>
  </aside>
</div>
</article>
</main>

<section class="cta"><div class="cta-in">
  <div>
    <h2>Chcete druhý názor na své smlouvy?</h2>
    <p>Ozvu se do 24 hodin. Na první schůzce se nic nepodepisuje.</p>
  </div>
  <div class="cta-act">
    <a class="tel" href="tel:${S.telHref}" data-track="Článek · výzva telefon">${S.tel}</a>
    <a class="pill solid" href="/konzultace${tema}" data-track="Článek · výzva">Domluvit schůzku</a>
  </div>
</div></section>
${S.footer}
</body>
</html>
`;
}

module.exports = async (req, res) => {
  const slug = (req.query && req.query.slug) || '';
  const id = idFromSlug(slug);
  let a = null;
  try { a = id && await getArticle(id); } catch (e) { a = null; }
  if (!a) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send('<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>Článek nenalezen</title><link href="/assets/page.css" rel="stylesheet"></head><body><div class="hero"><h1>Článek jsme nenašli.</h1><p class="answer"><a href="/blog">Zpět na blog</a></p></div></body></html>');
  }
  const canonical = articlePath(a);
  if ('/blog/' + slug !== canonical) {
    res.setHeader('Location', canonical);
    return res.status(308).end();
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  res.status(200).send(page(a));
};
