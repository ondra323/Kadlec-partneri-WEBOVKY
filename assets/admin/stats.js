// Statistiky marketingu: co dlouhodobě přivádí lidi a poptávky.
// Zdroje: sessions (návštěvy z track.js), inquiries (všechny poptávky, i bez měření)
// a marketing_costs (náklady, které zapíše správce). Výpočty jsou čisté funkce,
// grafy jsou SVG — dají se stáhnout jako PNG a každý má i CSV a tabulku.
import { db, collection, getDocs, query, where, orderBy, limit, Timestamp, doc, addDoc, deleteDoc, serverTimestamp, isDenied } from './firebase.js';
import { html, raw, $, toDate, num, pct, dur, median, toast } from './util.js';
import { channelOf, TOPICS } from './links.js';

/* ─── barvy: kategorie v pevném pořadí, „ostatní“ šedě (ověřeno validátorem na #fff) ─ */
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const OTHER = '#9a978f';
// kanál má stálou barvu bez ohledu na pořadí v období
const CHANNEL_ORDER = ['Reklama FB / IG', 'Příspěvek na profilu', 'Klientům napřímo', 'Leták / vizitka', 'Přímý vstup', 'Google'];
const colorFor = (ch) => { const i = CHANNEL_ORDER.indexOf(ch); return i >= 0 ? SERIES[i] : OTHER; };

export const COST_CHANNELS = ['Reklama FB / IG', 'Příspěvek na profilu', 'Klientům napřímo', 'Leták / vizitka', 'Jiné'];

const st = { days: readDays(), data: null, loading: false };
function readDays() { try { return +localStorage.getItem('adm_stats_days') || 90; } catch (e) { return 90; } }

/* ─── načtení ───────────────────────────────────────────────────────────── */
function startOf(days) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (days - 1)); return d; }

async function load(days) {
  const from = Timestamp.fromDate(startOf(days));
  const out = { sessions: [], inquiries: [], costs: [], denied: [] };
  const tasks = [
    getDocs(query(collection(db, 'sessions'), where('startedAt', '>=', from), orderBy('startedAt', 'desc'), limit(10000)))
      .then((s) => { out.sessions = s.docs.map((d) => slim(d.data())); }),
    getDocs(query(collection(db, 'inquiries'), where('createdAt', '>=', from), orderBy('createdAt', 'desc'), limit(3000)))
      .then((s) => { out.inquiries = s.docs.map((d) => ({ at: toDate(d.data().createdAt), source: d.data().source || '' })); }),
    getDocs(collection(db, 'marketing_costs'))
      .then((s) => { out.costs = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.month || '').localeCompare(a.month || '')); })
  ];
  const names = ['návštěvy', 'poptávky', 'náklady'];
  (await Promise.allSettled(tasks)).forEach((r, i) => {
    if (r.status === 'rejected') { if (!isDenied(r.reason)) throw r.reason; out.denied.push(names[i]); }
  });
  return out;
}

// ze session jen to, co statistiky potřebují (rok dat se drží v paměti)
function slim(d) {
  const f = (d.forms && d.forms.kviz) || {};
  const i = (d.campaign || '').indexOf(' / ');
  return {
    at: toDate(d.startedAt) || toDate(d.startedAtClient),
    source: d.source || 'přímá', medium: d.medium || '', tema: d.tema || '',
    content: i < 0 ? '' : d.campaign.slice(i + 3),
    funnel: /^\/konzultace(\.html)?([?#]|$)/.test(d.landing || ''),
    active: +d.active || 0, lead: !!d.lead,
    cta: Array.isArray(d.clicks) && d.clicks.some((c) => /^CTA/.test(c.l || '')),
    touch: f.touch >= 0 || f.ok === true
  };
}

/* ─── výpočty ───────────────────────────────────────────────────────────── */
const monthKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
function weekStart(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
const MONTHS = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

/** Časové koše: do 90 dní po týdnech (od pondělí), déle po měsících. */
export function buckets(days) {
  const from = startOf(days), now = new Date(), out = [];
  if (days <= 90) {
    for (let w = weekStart(from); w <= now; w = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7))
      out.push({ key: w.toISOString().slice(0, 10), label: w.getDate() + '. ' + (w.getMonth() + 1) + '.', start: w });
  } else {
    for (let m = new Date(from.getFullYear(), from.getMonth(), 1); m <= now; m = new Date(m.getFullYear(), m.getMonth() + 1, 1))
      out.push({ key: monthKey(m), label: MONTHS[m.getMonth()] + (m.getMonth() === 0 || !out.length ? ' ' + String(m.getFullYear()).slice(2) : ''), start: m });
  }
  return out;
}
function bucketIndex(B, d) { if (!d) return -1; for (let i = B.length - 1; i >= 0; i--) if (d >= B[i].start) return i; return -1; }

export function compute(data, days) {
  const B = buckets(days);
  const S = data.sessions.map((s) => ({ ...s, ch: channelOf(s) }));
  const zero = () => B.map(() => 0);

  // kanály: návštěvy v čase (top 6 podle pevného pořadí, zbytek „Ostatní“)
  const byCh = new Map();
  S.forEach((s) => {
    if (!byCh.has(s.ch)) byCh.set(s.ch, []);
    byCh.get(s.ch).push(s);
  });
  const channels = [...byCh.entries()].map(([ch, list]) => ({
    ch, n: list.length, leads: list.filter((s) => s.lead).length,
    active: median(list.map((s) => s.active)),
    funnel: list.filter((s) => s.funnel).length,
    cta: list.filter((s) => s.cta).length, touch: list.filter((s) => s.touch).length
  })).sort((a, b) => b.n - a.n);

  const named = channels.filter((c) => CHANNEL_ORDER.includes(c.ch)).map((c) => c.ch);
  const series = CHANNEL_ORDER.filter((ch) => named.includes(ch)).map((ch) => ({ key: ch, label: ch, color: colorFor(ch), values: zero() }));
  const other = { key: 'Ostatní', label: 'Ostatní', color: OTHER, values: zero() };
  S.forEach((s) => {
    const i = bucketIndex(B, s.at); if (i < 0) return;
    const ser = series.find((x) => x.key === s.ch) || other;
    ser.values[i]++;
  });
  if (other.values.some(Boolean)) series.push(other);

  const leadsAll = zero(), leadsTracked = zero(), visits = zero();
  data.inquiries.forEach((q) => { const i = bucketIndex(B, q.at); if (i >= 0) leadsAll[i]++; });
  S.forEach((s) => { const i = bucketIndex(B, s.at); if (i < 0) return; visits[i]++; if (s.lead) leadsTracked[i]++; });
  const conv = B.map((_, i) => (visits[i] ? leadsTracked[i] / visits[i] * 100 : null));

  // témata (jen funnel) a konkrétní odkazy
  const group = (list, key) => {
    const m = new Map();
    list.forEach((s) => { const k = key(s); if (!k) return; if (!m.has(k)) m.set(k, { key: k, n: 0, cta: 0, touch: 0, leads: 0 }); const r = m.get(k); r.n++; if (s.cta) r.cta++; if (s.touch) r.touch++; if (s.lead) r.leads++; });
    return [...m.values()].sort((a, b) => b.n - a.n || b.leads - a.leads);
  };
  const topicName = (k) => (TOPICS.find((t) => t.k === k) || { label: k }).label;
  const fun = S.filter((s) => s.funnel);
  const topics = group(fun, (s) => topicName(s.tema || ''));
  const links = group(fun, (s) => (s.content ? s.content + ' · ' + s.ch : ''));

  // náklady v období: celé měsíce, které do období zasahují
  const from = startOf(days), firstMonth = monthKey(from);
  const costs = data.costs.filter((c) => (c.month || '') >= firstMonth);
  const costBy = new Map();
  costs.forEach((c) => costBy.set(c.channel, (costBy.get(c.channel) || 0) + (+c.amount || 0)));
  channels.forEach((c) => { c.cost = costBy.get(c.ch) || 0; });
  const costOnly = [...costBy.entries()].filter(([ch]) => !channels.some((c) => c.ch === ch));

  const total = {
    visits: S.length, funnel: fun.length, leadsTracked: S.filter((s) => s.lead).length, leadsAll: data.inquiries.length,
    cost: costs.reduce((a, c) => a + (+c.amount || 0), 0)
  };
  return { B, series, visits, leadsAll, leadsTracked, conv, channels, costOnly, topics, links, total, gran: days <= 90 ? 'týden' : 'měsíc' };
}

/* ─── SVG grafy ─────────────────────────────────────────────────────────── */
// W se nastaví podle grafu: široký 720, poloviční 420 (větší písmo na půlce stránky)
let W = 720;
const PADL = 40, PADR = 12, PADT = 34, PADB = 28;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function niceMax(v) { if (v <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = Math.ceil(v / p); return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }

function axes(B, max, H, fmt = (v) => num(v)) {
  const ih = H - PADT - PADB, iw = W - PADL - PADR;
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const y = PADT + ih - (ih * k) / 4;
    g += `<line x1="${PADL}" x2="${W - PADR}" y1="${y}" y2="${y}" stroke="#e3ded4" stroke-width="1"/>`;
    g += `<text x="${PADL - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="#50554f">${esc(fmt((max * k) / 4))}</text>`;
  }
  const step = Math.max(1, Math.ceil(B.length / (W < 600 ? 7 : 14)));
  B.forEach((b, i) => {
    if (i % step) return;
    const x = PADL + (iw * (i + 0.5)) / B.length;
    g += `<text x="${x}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#50554f">${esc(b.label)}</text>`;
  });
  return g;
}
function legend(series) {
  let x = PADL, g = '';
  series.forEach((s) => {
    g += `<rect x="${x}" y="8" width="10" height="10" rx="2" fill="${s.color}"/><text x="${x + 15}" y="17" font-size="12" fill="#1d1f1e">${esc(s.label)}</text>`;
    x += 22 + s.label.length * 6.6;
  });
  return g;
}
const svgOpen = (H, label) => `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg" font-family="Jost, system-ui, sans-serif">`;

/** Skládané sloupce: návštěvy v koši podle kanálu. 2px mezera mezi segmenty, zaoblený jen vrch. */
function stacked(B, series, label) {
  W = 720;
  const H = 260, ih = H - PADT - PADB, iw = W - PADL - PADR;
  const totals = B.map((_, i) => series.reduce((a, s) => a + s.values[i], 0));
  const max = niceMax(Math.max(1, ...totals));
  const bw = Math.min(42, (iw / B.length) * 0.66);
  let g = axes(B, max, H);
  B.forEach((b, i) => {
    let y = PADT + ih;
    const x = PADL + (iw * (i + 0.5)) / B.length - bw / 2;
    const parts = series.filter((s) => s.values[i] > 0);
    parts.forEach((s, j) => {
      const h = (s.values[i] / max) * ih;
      const top = j === parts.length - 1;
      const hh = Math.max(0, h - (top ? 0 : 2));
      y -= h;
      g += top && hh > 4
        ? `<path d="M${x},${y + hh} V${y + 4} Q${x},${y} ${x + 4},${y} H${x + bw - 4} Q${x + bw},${y} ${x + bw},${y + 4} V${y + hh} Z" fill="${s.color}"/>`
        : `<rect x="${x}" y="${y + (top ? 0 : 2)}" width="${bw}" height="${hh}" fill="${s.color}"/>`;
    });
    // průhledný zásah přes celý sloupec = bublina s rozpadem
    const tip = b.label + ': ' + totals[i] + ' návštěv' + (parts.length ? ' — ' + parts.map((s) => s.label + ' ' + s.values[i]).join(', ') : '');
    g += `<rect x="${PADL + (iw * i) / B.length}" y="${PADT}" width="${iw / B.length}" height="${ih}" fill="transparent" data-tip="${esc(tip)}" tabindex="0"/>`;
  });
  return svgOpen(H, label) + legend(series) + g + '</svg>';
}

/** Jedna řada sloupců (poptávky). */
function bars(B, values, color, label, unit) {
  W = 420;
  const H = 240, ih = H - PADT - PADB, iw = W - PADL - PADR;
  const max = niceMax(Math.max(1, ...values));
  const bw = Math.min(42, (iw / B.length) * 0.66);
  let g = axes(B, max, H);
  B.forEach((b, i) => {
    const v = values[i], h = (v / max) * ih, x = PADL + (iw * (i + 0.5)) / B.length - bw / 2, y = PADT + ih - h;
    if (v > 0) g += h > 4
      ? `<path d="M${x},${PADT + ih} V${y + 4} Q${x},${y} ${x + 4},${y} H${x + bw - 4} Q${x + bw},${y} ${x + bw},${y + 4} V${PADT + ih} Z" fill="${color}"/>`
      : `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${color}"/>`;
    if (v > 0 && B.length <= 14) g += `<text x="${x + bw / 2}" y="${y - 5}" text-anchor="middle" font-size="11" fill="#1d1f1e">${v}</text>`;
    g += `<rect x="${PADL + (iw * i) / B.length}" y="${PADT}" width="${iw / B.length}" height="${ih}" fill="transparent" data-tip="${esc(b.label + ': ' + v + ' ' + unit)}" tabindex="0"/>`;
  });
  return svgOpen(H, label) + g + '</svg>';
}

/** Čára v procentech (konverze); koše bez návštěv čáru přeruší. */
function line(B, values, color, label) {
  W = 420;
  const H = 240, ih = H - PADT - PADB, iw = W - PADL - PADR;
  const max = niceMax(Math.max(1, ...values.filter((v) => v != null)));
  const X = (i) => PADL + (iw * (i + 0.5)) / B.length, Y = (v) => PADT + ih - (v / max) * ih;
  let g = axes(B, max, H, (v) => (Math.round(v * 10) / 10).toString().replace('.', ',') + ' %'), d = '', pen = false;
  values.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i) + ',' + Y(v); pen = true; });
  g += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>`;
  values.forEach((v, i) => {
    if (v == null) return;
    g += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    g += `<rect x="${PADL + (iw * i) / B.length}" y="${PADT}" width="${iw / B.length}" height="${ih}" fill="transparent" data-tip="${esc(B[i].label + ': ' + v.toFixed(1).replace('.', ',') + ' % návštěv poslalo poptávku')}" tabindex="0"/>`;
  });
  return svgOpen(H, label) + g + '</svg>';
}

/* ─── vykreslení ────────────────────────────────────────────────────────── */
const kc = (v) => (v ? num(v) + ' Kč' : '—');
const tools = (id) => html`<span class="chart-tools"><button class="btn btn-small" data-action="stat-png" data-chart="${id}">PNG</button><button class="btn btn-small" data-action="stat-csv" data-chart="${id}">CSV</button></span>`;
function chartBlock(id, title, aside, body) {
  return html`<section class="block" id="chart-${id}" data-title="${title}">
    <header class="block-head"><h2>${title}</h2><span class="block-aside">${aside} ${raw(tools(id))}</span></header>${raw(body)}</section>`;
}

let last = null; // poslední výpočet pro export

export function render() {
  const box = $('#stats');
  if (!st.data) { box.innerHTML = '<p class="empty">Načítám statistiky…</p>'; return; }
  const R = last = compute(st.data, st.days);
  const T = R.total;
  const denied = st.data.denied.length ? html`<p class="empty">Bez oprávnění ke čtení: ${st.data.denied.join(', ')}. Ostatní čísla platí.</p>` : '';
  const cpl = T.cost && T.leadsAll ? Math.round(T.cost / T.leadsAll) : 0;
  const tile = (v, l, s, tone) => html`<div class="tile${tone ? ' tile-' + tone : ''}"><div class="tile-num">${v}</div><div class="tile-label">${l}</div>${s ? raw(html`<div class="tile-sub">${s}</div>`) : ''}</div>`;
  const tiles = [
    tile(num(T.visits), 'Návštěvy', 'z toho funnel ' + num(T.funnel)),
    tile(num(T.leadsAll), 'Poptávky', num(T.leadsTracked) + ' s dohledaným zdrojem', T.leadsAll ? 'good' : ''),
    tile(T.visits ? (T.leadsTracked / T.visits * 100).toFixed(1).replace('.', ',') + ' %' : '—', 'Konverze', 'měřené poptávky / návštěvy'),
    tile(kc(T.cost), 'Náklady', cpl ? num(cpl) + ' Kč za poptávku' : 'zapište níže')
  ].join('');

  const chRows = R.channels.map((c) => html`<tr>
      <th scope="row"><i class="swatch" style="background:${raw(colorFor(c.ch))}"></i>${c.ch}</th>
      <td class="t-num">${num(c.n)}</td><td class="t-num">${dur(c.active)}</td>
      <td class="t-num">${c.funnel ? raw(html`${num(c.cta)}<span class="t-conv">${pct(c.cta, c.funnel)} % z funnelu</span>`) : '—'}</td>
      <td class="t-num">${c.leads ? raw(html`<span class="lead-n">● ${c.leads}</span><span class="t-conv">${(c.leads / c.n * 100).toFixed(1).replace('.', ',')} %</span>`) : '—'}</td>
      <td class="t-num">${kc(c.cost)}</td><td class="t-num">${c.cost && c.leads ? kc(Math.round(c.cost / c.leads)) : '—'}</td>
    </tr>`).join('') + R.costOnly.map(([ch, v]) => html`<tr><th scope="row">${ch}</th><td class="t-num">0</td><td></td><td></td><td class="t-num">—</td><td class="t-num">${kc(v)}</td><td class="t-num">—</td></tr>`).join('');
  const chTable = html`<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Kanál</th><th scope="col" class="t-num">Návštěvy</th><th scope="col" class="t-num">Aktivní čas</th>
    <th scope="col" class="t-num">Klikli na tlačítko</th><th scope="col" class="t-num">Poptávky</th><th scope="col" class="t-num">Náklady</th><th scope="col" class="t-num">Kč / poptávka</th></tr></thead><tbody>${raw(chRows)}</tbody></table></div>`;

  const groupTable = (rows, head) => {
    if (!rows.length) return '<p class="empty">Žádná data za období.</p>';
    const max = rows[0].n;
    return html`<div class="table-wrap"><table class="data"><thead><tr><th scope="col">${head}</th><th scope="col">Návštěvy</th><th scope="col" class="t-num">Klikli na tlačítko</th><th scope="col" class="t-num">Začali vyplňovat</th><th scope="col" class="t-num">Poptávky</th></tr></thead>
      <tbody>${raw(rows.slice(0, 15).map((r) => html`<tr><th scope="row">${r.key}</th>
        <td class="t-bar"><span class="mini"><span style="width:${raw(((r.n / max) * 100).toFixed(1))}%"></span></span>${num(r.n)}</td>
        <td class="t-num">${num(r.cta)}<span class="t-conv">${pct(r.cta, r.n)} %</span></td><td class="t-num">${num(r.touch)}<span class="t-conv">${pct(r.touch, r.n)} %</span></td>
        <td class="t-num">${r.leads ? raw(html`<span class="lead-n">● ${r.leads}</span><span class="t-conv">${(r.leads / r.n * 100).toFixed(1).replace('.', ',')} %</span>`) : '—'}</td></tr>`).join(''))}</tbody></table></div>`;
  };

  box.innerHTML = html`${raw(denied)}<div class="tiles">${raw(tiles)}</div>
    ${raw(chartBlock('navstevy', 'Návštěvy podle kanálu', 'po ' + (R.gran === 'týden' ? 'týdnech' : 'měsících') + ' · najeďte na sloupec', stacked(R.B, R.series, 'Návštěvy podle kanálu')))}
    <div class="cols cols-2">
      ${raw(chartBlock('poptavky', 'Poptávky', 'všechny, i bez měření', bars(R.B, R.leadsAll, SERIES[0], 'Poptávky v čase', 'poptávek')))}
      ${raw(chartBlock('konverze', 'Konverze návštěv na poptávku', 'jen měřené návštěvy', line(R.B, R.conv, SERIES[0], 'Konverze v čase')))}
    </div>
    ${raw(chartBlock('kanaly', 'Co funguje: kanály', 'náklady z bloku Náklady níže', chTable))}
    ${raw(chartBlock('temata', 'Témata funnelu', 'podle ?tema=', groupTable(R.topics, 'Téma')))}
    ${raw(chartBlock('odkazy', 'Konkrétní odkazy a reklamy', 'podle utm_content', groupTable(R.links, 'Odkaz')))}
    ${raw(renderCosts())}`;
}

function renderCosts() {
  const list = st.data.costs.slice(0, 12).map((c) => html`<tr><td>${c.month}</td><th scope="row">${c.channel}</th><td class="t-num">${kc(+c.amount)}</td><td class="muted">${c.note || ''}</td>
    <td class="t-actions"><button class="btn btn-small btn-ghost" data-action="cost-del" data-id="${c.id}">Smazat</button></td></tr>`).join('');
  const now = monthKey(new Date());
  return html`<section class="block" id="costs">
    <header class="block-head"><h2>Náklady na marketing</h2><span class="block-aside">měsíčně za kanál · z toho se počítá cena za poptávku</span></header>
    <form class="cost-form" id="cost-form">
      <label class="field"><span>Měsíc</span><input class="input" type="month" name="month" value="${now}" required></label>
      <label class="field"><span>Kanál</span><select class="select" name="channel">${raw(COST_CHANNELS.map((c) => html`<option>${c}</option>`).join(''))}</select></label>
      <label class="field"><span>Částka v Kč</span><input class="input" type="number" name="amount" min="0" step="1" inputmode="numeric" required></label>
      <label class="field"><span>Poznámka <em class="opt">nepovinné</em></span><input class="input" type="text" name="note" maxlength="60" placeholder="např. reklama penze A/B"></label>
      <button class="btn btn-primary" type="submit">Přidat</button>
    </form>
    ${list ? raw(html`<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Měsíc</th><th scope="col">Kanál</th><th scope="col" class="t-num">Částka</th><th scope="col">Poznámka</th><th scope="col"></th></tr></thead><tbody>${raw(list)}</tbody></table></div>`)
      : raw('<p class="empty">Zatím žádné náklady. Zapište, kolik jste za měsíc dali do reklamy — admin pak spočítá cenu za poptávku.</p>')}
  </section>`;
}

export async function ensure(force) {
  syncRange();
  if (!force && st.data) return render();
  if (st.loading) return;
  st.loading = true;
  if (!st.data) render();
  try { st.data = await load(st.days); render(); }
  catch (e) { $('#stats').innerHTML = html`<p class="empty">Statistiky se nepodařilo načíst: ${e.message}</p>`; }
  finally { st.loading = false; }
}
export function setDays(d) { st.days = d; try { localStorage.setItem('adm_stats_days', d); } catch (e) {} ensure(true); }
function syncRange() {
  document.querySelectorAll('[data-action="stat-range"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.days === st.days));
}

/* ─── náklady ───────────────────────────────────────────────────────────── */
export async function addCost(form) {
  const f = new FormData(form);
  const amount = Math.round(+f.get('amount'));
  if (!f.get('month') || !(amount >= 0)) { toast('Vyplňte měsíc a částku.', 'err'); return; }
  try {
    await addDoc(collection(db, 'marketing_costs'), { month: f.get('month'), channel: f.get('channel'), amount, note: String(f.get('note') || '').slice(0, 60), createdAt: serverTimestamp() });
    toast('Náklad uložen.'); await ensure(true);
  } catch (e) { toast('Uložit se nepodařilo: ' + e.message, 'err'); }
}
export async function delCost(id) {
  if (!confirm('Smazat tento náklad?')) return;
  try { await deleteDoc(doc(db, 'marketing_costs', id)); await ensure(true); } catch (e) { toast('Smazat se nepodařilo: ' + e.message, 'err'); }
}

/* ─── export ────────────────────────────────────────────────────────────── */
const period = () => 'posledních ' + st.days + ' dní, do ' + new Date().toLocaleDateString('cs-CZ');
const fileStamp = () => new Date().toISOString().slice(0, 10);

function csvRows(id) {
  const R = last; if (!R) return [];
  if (id === 'navstevy') return [['Období', ...R.series.map((s) => s.label), 'Celkem'], ...R.B.map((b, i) => [b.key, ...R.series.map((s) => s.values[i]), R.series.reduce((a, s) => a + s.values[i], 0)])];
  if (id === 'poptavky') return [['Období', 'Poptávky'], ...R.B.map((b, i) => [b.key, R.leadsAll[i]])];
  if (id === 'konverze') return [['Období', 'Návštěvy', 'Měřené poptávky', 'Konverze %'], ...R.B.map((b, i) => [b.key, R.visits[i], R.leadsTracked[i], R.conv[i] == null ? '' : R.conv[i].toFixed(2).replace('.', ',')])];
  if (id === 'kanaly') return [['Kanál', 'Návštěvy', 'Aktivní čas medián (s)', 'Klikli na tlačítko', 'Poptávky', 'Konverze %', 'Náklady Kč', 'Kč za poptávku'],
    ...R.channels.map((c) => [c.ch, c.n, Math.round(c.active), c.cta, c.leads, (c.leads / c.n * 100).toFixed(2).replace('.', ','), c.cost, c.cost && c.leads ? Math.round(c.cost / c.leads) : ''])];
  const rows = id === 'temata' ? R.topics : R.links;
  return [[id === 'temata' ? 'Téma' : 'Odkaz', 'Návštěvy', 'Klikli na tlačítko', 'Začali vyplňovat', 'Poptávky'], ...rows.map((r) => [r.key, r.n, r.cta, r.touch, r.leads])];
}

function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function exportCsv(id) {
  const csv = csvRows(id).map((r) => r.map((v) => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
  // BOM + středník: Excel v češtině otevře soubor rovnou se správnou diakritikou
  download('kadlec-' + id + '-' + fileStamp() + '.csv', new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
}

/** PNG s nadpisem a obdobím. Tabulkové bloky se exportují jako CSV — PNG umí jen grafy. */
export async function exportPng(id) {
  const block = $('#chart-' + id), svg = block && block.querySelector('svg.chart');
  if (!svg) { exportCsv(id); toast('Tahle část je tabulka — stáhl jsem ji jako CSV.'); return; }
  const scale = 2, w = svg.viewBox.baseVal.width, h = svg.viewBox.baseVal.height, head = 56;
  const clone = svg.cloneNode(true);
  clone.querySelectorAll('[data-tip]').forEach((n) => n.remove());
  clone.setAttribute('width', w); clone.setAttribute('height', h);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  await img.decode();
  const c = document.createElement('canvas'); c.width = w * scale; c.height = (h + head) * scale;
  const x = c.getContext('2d'); x.scale(scale, scale);
  x.fillStyle = '#fff'; x.fillRect(0, 0, w, h + head);
  x.fillStyle = '#1d1f1e'; x.font = '600 16px Jost, system-ui, sans-serif'; x.fillText(block.dataset.title, 16, 26);
  x.fillStyle = '#50554f'; x.font = '12px Jost, system-ui, sans-serif'; x.fillText('Kadlec & partneři · ' + period(), 16, 44);
  x.drawImage(img, 0, head, w, h);
  c.toBlob((b) => download('kadlec-' + id + '-' + fileStamp() + '.png', b), 'image/png');
}

/** Textový souhrn (Markdown) — vložit do chatu k posouzení. */
export function summary() {
  const R = last; if (!R) return '';
  const T = R.total, p = (a, b) => (b ? (a / b * 100).toFixed(1).replace('.', ',') + ' %' : '—');
  const lines = [
    '# Marketing Kadlec & partneři — ' + period(), '',
    `Návštěvy ${T.visits} (funnel ${T.funnel}) · poptávky ${T.leadsAll} (s dohledaným zdrojem ${T.leadsTracked}) · konverze ${p(T.leadsTracked, T.visits)} · náklady ${T.cost} Kč${T.cost && T.leadsAll ? ' · ' + Math.round(T.cost / T.leadsAll) + ' Kč/poptávka' : ''}`, '',
    '## Kanály', '| Kanál | Návštěvy | Aktivní čas (medián) | Klik na tlačítko | Poptávky | Konverze | Náklady | Kč/poptávka |', '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...R.channels.map((c) => `| ${c.ch} | ${c.n} | ${dur(c.active)} | ${c.cta} | ${c.leads} | ${p(c.leads, c.n)} | ${c.cost || '—'} | ${c.cost && c.leads ? Math.round(c.cost / c.leads) : '—'} |`), '',
    '## Vývoj (' + R.gran + ')', '| Období | Návštěvy | Poptávky | Konverze |', '|---|---:|---:|---:|',
    ...R.B.map((b, i) => `| ${b.key} | ${R.visits[i]} | ${R.leadsAll[i]} | ${R.conv[i] == null ? '—' : R.conv[i].toFixed(1).replace('.', ',') + ' %'} |`), '',
    '## Témata funnelu', '| Téma | Návštěvy | Klik na tlačítko | Začali vyplňovat | Poptávky |', '|---|---:|---:|---:|---:|',
    ...R.topics.slice(0, 10).map((r) => `| ${r.key} | ${r.n} | ${r.cta} | ${r.touch} | ${r.leads} |`), '',
    '## Nejlepší odkazy', '| Odkaz | Návštěvy | Klik na tlačítko | Začali vyplňovat | Poptávky |', '|---|---:|---:|---:|---:|',
    ...R.links.slice(0, 10).map((r) => `| ${r.key} | ${r.n} | ${r.cta} | ${r.touch} | ${r.leads} |`)
  ];
  return lines.join('\n');
}
export async function copySummary(btn) {
  const text = summary(); if (!text) return;
  try { await navigator.clipboard.writeText(text); }
  catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); }
  const l = btn.textContent; btn.textContent = 'Zkopírováno'; toast('Souhrn je ve schránce — vložte ho do chatu.');
  setTimeout(() => { btn.textContent = l; }, 2500);
}
