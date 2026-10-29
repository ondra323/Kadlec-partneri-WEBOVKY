// Odkazy na funnel konzultace.html: generátor podle tématu a kanálu
// a výkon každého odkazu (návštěvy → klik na tlačítko → formulář → poptávka).
// Odkaz nese ?tema= (přepne nadpis, text i recenze) a utm_* (admin pozná,
// odkud člověk přišel). utm_content přenáší track.js v poli campaign za „ / ".
import { html, raw, $, num, pct, toast } from './util.js';

export const TOPICS = [
  { k: '',          label: 'Obecný',             head: 'Druhý názor na vaše smlouvy.' },
  { k: 'investice', label: 'Investice a úspory', head: 'Leží vaše úspory tam, kde jim inflace ubírá?' },
  { k: 'penze',     label: 'Penze',              head: 'Víte, kolik vám stát v penzi doopravdy pošle?' },
  { k: 'osoby',     label: 'Životní pojištění',  head: 'Vyplatí vaše pojistka, když to bude potřeba?' },
  { k: 'majetek',   label: 'Pojištění majetku',  head: 'Je váš dům pojištěný na dnešní ceny?' },
  { k: 'cestovni',  label: 'Cestovní pojištění', head: 'Zaplatí cestovní pojištění i nemocnici v zahraničí?' },
  { k: 'hypoteka',  label: 'Hypotéka',           head: 'Kolik by hypotéka stála u jiné banky?' },
  { k: 'uvery',     label: 'Úvěry',              head: 'Víc splátek jde někdy sloučit do jedné, levnější.' }
];

// src/med musí sedět s tím, jak track.js návštěvu zařadí (classifySource)
export const CHANNELS = {
  fb:     { label: 'Reklama FB / IG', src: 'facebook', med: 'paid',    ab: true,
            hint: 'Do pole „Webová stránka" v reklamě. Verze A a B odpovídají textům v REKLAMY-FB.md.' },
  post:   { label: 'Příspěvek na profilu', src: 'facebook', med: 'organic',
            hint: 'Do vlastního příspěvku nebo stories na Facebooku či Instagramu.' },
  klient: { label: 'Klientům napřímo', src: 'klient', med: 'primy',
            hint: 'Do SMS, WhatsAppu, Messengeru nebo e-mailu konkrétnímu člověku.' },
  tisk:   { label: 'Leták / vizitka', src: 'tisk', med: 'qr',
            hint: 'Pro QR kód na papír. Kód vygenerujete tlačítkem QR.' }
};
const CAMPAIGN = 'druhy-nazor';

const ui = { ch: 'fb', tag: '' };

/** „Jaro 2027 – Novák" → „jaro-2027-novak" (bez diakritiky, jen a–z, 0–9, pomlčky) */
export function slug(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
}

export function buildUrl(topic, chKey, variant, tag) {
  const ch = CHANNELS[chKey];
  const u = new URL('konzultace.html', location.origin + '/');
  if (topic) u.searchParams.set('tema', topic);
  u.searchParams.set('utm_source', ch.src);
  u.searchParams.set('utm_medium', ch.med);
  u.searchParams.set('utm_campaign', CAMPAIGN);
  const content = [topic || 'obecny', variant, slug(tag)].filter(Boolean).join('-');
  u.searchParams.set('utm_content', content);
  return u.toString();
}

/* ─── Výkon: čisté výpočty ──────────────────────────────────────────────── */
const isFunnel = (s) => /^\/konzultace(\.html)?([?#]|$)/.test(s.landing || '');

export function channelOf(s) {
  const src = s.source, med = s.medium;
  if (src === 'facebook' && (med === 'paid' || med === 'reklama')) return 'Reklama FB / IG';
  if (src === 'facebook' || src === 'instagram') return med === 'organic' ? 'Příspěvek na profilu' : 'Facebook / Instagram';
  if (src === 'klient') return 'Klientům napřímo';
  if (src === 'tisk') return 'Leták / vizitka';
  if (src === 'přímá') return 'Přímý vstup';
  return src;
}
const contentOf = (s) => { const i = (s.campaign || '').indexOf(' / '); return i < 0 ? '' : s.campaign.slice(i + 3); };
const clickedCta = (s) => s.clicks.some((c) => /^CTA/.test(c.l || ''));

function stats(list) {
  const f = (s) => s.forms.kviz || {};
  return {
    n: list.length,
    cta: list.filter(clickedCta).length,
    seen: list.filter((s) => f(s).open >= 0 || f(s).touch >= 0 || f(s).ok === true).length,
    touch: list.filter((s) => f(s).touch >= 0 || f(s).ok === true).length,
    leads: list.filter((s) => s.lead).length
  };
}

export function performance(sessions) {
  const fun = sessions.filter(isFunnel);
  const m = new Map();
  fun.forEach((s) => {
    const content = contentOf(s);
    const key = [s.tema, channelOf(s), content].join('|');
    if (!m.has(key)) m.set(key, { tema: s.tema, channel: channelOf(s), content, list: [] });
    m.get(key).list.push(s);
  });
  const rows = [...m.values()].map((r) => ({ ...r, ...stats(r.list) }))
    .sort((a, b) => b.n - a.n || b.leads - a.leads);
  // kde se na tlačítko klikají nejčastěji
  const where = new Map();
  fun.forEach((s) => new Set(s.clicks.filter((c) => /^CTA/.test(c.l || '')).map((c) => c.l))
    .forEach((l) => where.set(l, (where.get(l) || 0) + 1)));
  const reviews = new Map();
  fun.forEach((s) => s.events.forEach((e) => { const k = /^recenze: (.+)$/.exec(e.e || ''); if (k) reviews.set(k[1], (reviews.get(k[1]) || 0) + 1); }));
  return { total: stats(fun), rows, where: [...where.entries()].sort((a, b) => b[1] - a[1]), reviews: [...reviews.entries()].sort((a, b) => b[1] - a[1]) };
}

/* ─── Vykreslení ────────────────────────────────────────────────────────── */
const topicLabel = (k) => (TOPICS.find((t) => t.k === k) || { label: k || 'Obecný' }).label;

function rowsHtml() {
  const ch = CHANNELS[ui.ch];
  return TOPICS.map((t) => {
    const variants = ch.ab ? ['a', 'b'] : [''];
    const url = buildUrl(t.k, ui.ch, variants[0], ui.tag);
    const copy = variants.map((v) => html`<button class="btn btn-small" data-action="link-copy" data-url="${buildUrl(t.k, ui.ch, v, ui.tag)}">${v ? 'Kopírovat ' + v.toUpperCase() : 'Kopírovat'}</button>`).join('');
    return html`<tr>
      <th scope="row">${t.label}<div class="s-sub">${t.head}</div></th>
      <td class="l-url"><code title="${url}">${url.replace(/^https?:\/\//, '')}</code></td>
      <td class="t-actions">${raw(copy)}<button class="btn btn-small" data-action="link-qr" data-url="${url}" data-name="${t.k || 'obecny'}">QR</button><a class="btn btn-small btn-ghost" href="${url}" target="_blank" rel="noopener">Otevřít</a></td>
    </tr>`;
  }).join('');
}
function hintHtml() {
  return html`${CHANNELS[ui.ch].hint}${ui.tag && slug(ui.tag) ? ' Označení „' + slug(ui.tag) + '" pak uvidíte ve výkonu níže.' : ''}`;
}

export function renderGenerator() {
  const chips = Object.entries(CHANNELS).map(([k, c]) =>
    html`<button type="button" data-action="link-ch" data-ch="${k}" aria-pressed="${k === ui.ch}">${c.label}</button>`).join('');
  return html`<section class="block">
    <header class="block-head"><h2>Odkaz pro každé téma</h2><span class="block-aside">nadpis stránky se přepne podle tématu</span></header>
    <div class="link-controls">
      <div class="field"><span>Kam odkaz dáte</span><div class="seg seg-wrap" role="group" aria-label="Kanál">${raw(chips)}</div></div>
      <label class="field"><span>Vlastní označení <em class="opt">nepovinné</em></span>
        <input class="input" id="link-tag" type="text" maxlength="40" value="${ui.tag}" placeholder="např. jaro-2027 nebo jméno doporučitele" autocomplete="off"></label>
    </div>
    <p class="hint link-hint" id="link-hint">${raw(hintHtml())}</p>
    <div class="table-wrap"><table class="data links"><thead><tr><th scope="col">Téma</th><th scope="col">Odkaz</th><th scope="col" class="t-num">Akce</th></tr></thead>
      <tbody id="link-rows">${raw(rowsHtml())}</tbody></table></div>
  </section>`;
}

export function renderPerformance(data, days, rangeLabel) {
  if (!data) return html`<p class="empty">Načítám…</p>`;
  if (data.mode === 'legacy') return html`<section class="block"><p class="empty">Výkon odkazů se ukáže, až bude v databázi povolená kolekce sessions — návod je v Přehledu.</p></section>`;
  const P = performance(data.sessions), T = P.total;
  const tile = (v, l, s, tone) => html`<div class="tile${tone ? ' tile-' + tone : ''}"><div class="tile-num">${v}</div><div class="tile-label">${l}</div>${s ? raw(html`<div class="tile-sub">${s}</div>`) : ''}</div>`;
  const tiles = [
    tile(num(T.n), 'Přišli na funnel', rangeLabel(days)),
    tile(num(T.cta), 'Klikli na tlačítko', pct(T.cta, T.n) + ' % návštěv'),
    tile(num(T.touch), 'Začali vyplňovat', pct(T.touch, T.n) + ' % návštěv'),
    tile(num(T.leads), 'Poptávky', (T.n ? (T.leads / T.n * 100).toFixed(1).replace('.', ',') : '0') + ' % návštěv', T.leads ? 'good' : '')
  ].join('');
  if (!T.n) return html`<div class="tiles">${raw(tiles)}</div><section class="block"><p class="empty">Za vybrané období na funnel nikdo nepřišel. Jakmile někdo klikne na odkaz, objeví se tady do minuty.</p></section>`;

  const cell = (part, whole) => html`${num(part)}<span class="t-conv">${pct(part, whole)} %</span>`;
  const body = P.rows.slice(0, 60).map((r) => html`<tr>
      <th scope="row">${topicLabel(r.tema)}<div class="s-sub">${r.channel}${r.content ? ' · ' + r.content : ''}</div></th>
      <td class="t-num">${num(r.n)}</td>
      <td class="t-num">${raw(cell(r.cta, r.n))}</td>
      <td class="t-num">${raw(cell(r.seen, r.n))}</td>
      <td class="t-num">${raw(cell(r.touch, r.n))}</td>
      <td class="t-num">${r.leads ? raw(html`<span class="lead-n">● ${r.leads}</span><span class="t-conv">${(r.leads / r.n * 100).toFixed(1).replace('.', ',')} %</span>`) : '—'}</td>
    </tr>`).join('');
  const list = (rows, empty) => rows.length
    ? html`<ul class="kv">${raw(rows.map(([k, v]) => html`<li><span>${k}</span><b>${num(v)} · ${pct(v, T.n)} %</b></li>`).join(''))}</ul>`
    : html`<p class="empty">${empty}</p>`;

  return html`<div class="tiles">${raw(tiles)}</div>
    <section class="block">
      <header class="block-head"><h2>Výkon jednotlivých odkazů</h2><span class="block-aside">lidé, ne počet kliků · procenta z návštěv odkazu</span></header>
      <div class="table-wrap"><table class="data">
        <thead><tr><th scope="col">Odkaz</th><th scope="col" class="t-num">Návštěvy</th><th scope="col" class="t-num">Klikli na tlačítko</th>
          <th scope="col" class="t-num">Viděli formulář</th><th scope="col" class="t-num">Začali vyplňovat</th><th scope="col" class="t-num">Poptávky</th></tr></thead>
        <tbody>${raw(body)}</tbody></table></div>
      <p class="hint">Kolik lidí kliklo přímo na reklamu, ukazuje Správce reklam na Facebooku. Tady jsou ti, kdo stránku opravdu otevřeli. Lidé s blokováním měření (Do Not Track) se nepočítají — jejich poptávky jsou ale vždy v záložce Poptávky.</p>
    </section>
    <div class="cols cols-2">
      <section class="block"><header class="block-head"><h2>Které tlačítko lidi berou</h2></header>${raw(list(P.where, 'Zatím nikdo neklikl.'))}</section>
      <section class="block"><header class="block-head"><h2>Recenze, které si přepnuli</h2></header>${raw(list(P.reviews, 'Zatím nikdo nepřepínal témata recenzí.'))}</section>
    </div>`;
}

/* ─── Akce ──────────────────────────────────────────────────────────────── */
export function setChannel(k) {
  if (!CHANNELS[k]) return;
  ui.ch = k;
  document.querySelectorAll('[data-action="link-ch"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ch === k));
  $('#link-rows').innerHTML = rowsHtml(); $('#link-hint').innerHTML = hintHtml();
}
// při psaní se přepisují jen řádky a nápověda, pole s kurzorem zůstává
export function setTag(v) { ui.tag = v; $('#link-rows').innerHTML = rowsHtml(); $('#link-hint').innerHTML = hintHtml(); }

export async function copy(url, btn) {
  const label = btn.textContent;
  try { await navigator.clipboard.writeText(url); }
  catch (e) {
    const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (x) {} t.remove();
  }
  btn.textContent = 'Zkopírováno'; toast('Odkaz je ve schránce.');
  setTimeout(() => { btn.textContent = label; }, 2000);
}

// QR knihovna se načte až při prvním použití (20 kB, jen z cdnjs)
let qrLib = null;
function loadQr() {
  if (qrLib) return qrLib;
  qrLib = new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = () => ok(window.qrcode); s.onerror = () => { qrLib = null; fail(new Error('QR knihovna se nenačetla')); };
    document.head.appendChild(s);
  });
  return qrLib;
}

export async function showQr(url, name) {
  let make;
  try { make = await loadQr(); } catch (e) { toast(e.message, 'err'); return; }
  const q = make(0, 'M'); q.addData(url); q.make();
  const n = q.getModuleCount(), cell = 12, pad = cell * 4, size = n * cell + pad * 2;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size); x.fillStyle = '#1d1f1e';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(pad + k * cell, pad + r * cell, cell, cell);

  const dlg = $('#qr-dialog');
  $('#qr-img').src = c.toDataURL('image/png');
  $('#qr-url').textContent = url.replace(/^https?:\/\//, '');
  const a = $('#qr-download'); a.href = $('#qr-img').src; a.download = 'qr-konzultace-' + name + '.png';
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
}

