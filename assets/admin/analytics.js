// Návštěvnost: načtení návštěv, výpočet ukazatelů a jejich vykreslení.
// Výpočty (aggregate, funnel, journey) jsou čisté funkce bez DOM — dají se
// otestovat zvlášť a vykreslení je jen převádí na HTML.
import { db, collection, getDocs, query, orderBy, where, limit, Timestamp, isDenied } from './firebase.js';
import { esc, html, raw, $, toDate, num, pct, dur, clock, when, median, countBy } from './util.js';

/* ─── Formuláře, které web měří, a jejich kroky ─────────────────────────── */
export const FORMS = {
  kviz: {
    name: 'Kvíz', where: 'konzultace.html',
    steps: [['open', 'Otevřeno'], [1, 'Téma'], [2, 'Detail'], [3, 'Spěch'], [4, 'Kontakt'], ['ok', 'Odesláno']]
  },
  konzultace: {
    name: 'Formulář konzultace', where: 'hlavní stránka',
    steps: [['open', 'Otevřeno'], ['touch', 'Začal vyplňovat'], ['ok', 'Odesláno']]
  },
  'email-popup': {
    name: 'E-mailový pop-up', where: 'hlavní stránka',
    steps: [['open', 'Zobrazeno'], ['touch', 'Začal psát'], ['ok', 'Odesláno']]
  }
};

/* ─── Načtení ────────────────────────────────────────────────────────────── */
export function rangeStart(days) {
  const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (days - 1));
  return from;
}

/** Vrací {mode:'sessions', sessions} nebo {mode:'legacy', …} když pravidla sessions nepustí. */
export async function loadData(days) {
  const from = Timestamp.fromDate(rangeStart(days));
  try {
    const snap = await getDocs(query(collection(db, 'sessions'),
      where('startedAt', '>=', from), orderBy('startedAt', 'desc'), limit(3000)));
    return { mode: 'sessions', sessions: snap.docs.map((d) => normalize(d.id, d.data())) };
  } catch (e) {
    if (!isDenied(e)) throw e;
    return { mode: 'legacy', ...(await loadLegacy(from)) };
  }
}

async function loadLegacy(from) {
  const out = { pageviews: [], funnel: [], funnelDenied: false };
  try {
    const s = await getDocs(query(collection(db, 'pageviews'), where('timestamp', '>=', from), orderBy('timestamp', 'desc'), limit(3000)));
    out.pageviews = s.docs.map((d) => d.data());
  } catch (e) { /* ponecháme prázdné */ }
  try {
    const s = await getDocs(query(collection(db, 'quiz_funnel'), where('timestamp', '>=', from), limit(5000)));
    out.funnel = s.docs.map((d) => d.data());
  } catch (e) { out.funnelDenied = isDenied(e); }
  return out;
}

export async function sessionForInquiry(inquiryId) {
  const snap = await getDocs(query(collection(db, 'sessions'), where('inquiryId', '==', inquiryId), limit(1)));
  return snap.empty ? null : normalize(snap.docs[0].id, snap.docs[0].data());
}

function normalize(id, d) {
  return {
    id,
    startedAt: toDate(d.startedAt) || toDate(d.startedAtClient),
    lastSeen: toDate(d.lastSeen),
    landing: d.landing || '', referrer: d.referrer || '',
    source: d.source || 'přímá', medium: d.medium || '', campaign: d.campaign || '', tema: d.tema || '',
    device: d.device || '—',
    pages: Array.isArray(d.pages) ? d.pages : [],
    active: +d.active || 0, total: +d.total || 0, maxScroll: +d.maxScroll || 0,
    clicks: Array.isArray(d.clicks) ? d.clicks : [],
    forms: d.forms && typeof d.forms === 'object' ? d.forms : {},
    events: Array.isArray(d.events) ? d.events : [],
    calls: +d.calls || 0, lead: !!d.lead, inquiryId: d.inquiryId || ''
  };
}

/* ─── Výpočty ────────────────────────────────────────────────────────────── */
function reachedStep(f, key) {
  if (!f) return false;
  if (key === 'open')  return f.open >= 0 || f.touch >= 0 || f.max > 0 || f.sent >= 0;
  if (key === 'touch') return f.touch >= 0 || f.ok === true;
  if (key === 'ok')    return f.ok === true;
  return (f.max || 0) >= key;   // číselný krok; s ?tema= kvíz začíná až u 2, 1 se počítá jako splněný
}

export function funnel(sessions, formId) {
  const def = FORMS[formId];
  const list = sessions.map((s) => s.forms[formId]).filter(Boolean);
  const counts = def.steps.map(([key]) => list.filter((f) => reachedStep(f, key)).length);
  // monotónní: kdo došel dál, prošel i předchozím krokem
  for (let i = counts.length - 2; i >= 0; i--) counts[i] = Math.max(counts[i], counts[i + 1]);

  const steps = def.steps.map(([key, label], i) => ({ key, label, n: counts[i] }));
  let worst = -1, worstDrop = 0;
  for (let i = 1; i < steps.length; i++) {
    const drop = steps[i - 1].n - steps[i].n;
    steps[i].drop = drop;
    if (drop > worstDrop) { worstDrop = drop; worst = i; }
  }
  const errFields = {};
  let errors = 0, failed = 0;
  const times = [];
  list.forEach((f) => {
    errors += f.err || 0;
    if (f.ok === false) failed++;
    Object.entries(f.errs || {}).forEach(([k, v]) => { errFields[k] = (errFields[k] || 0) + v; });
    if (f.ok === true && f.sent >= 0 && f.open >= 0) times.push(f.sent - f.open);
  });
  return {
    id: formId, def, steps, worst: worstDrop > 0 ? worst : -1,
    errors, failed, errFields: Object.entries(errFields).sort((a, b) => b[1] - a[1]),
    medianTime: median(times), used: list.length
  };
}

const DURATION_BUCKETS = [[0, 10, 'do 10 s'], [10, 30, '10–30 s'], [30, 120, '30 s – 2 min'], [120, 300, '2–5 min'], [300, Infinity, 'přes 5 min']];
const SCROLL_BUCKETS   = [[0, 25, 'do 25 %'], [25, 50, '25–50 %'], [50, 75, '50–75 %'], [75, 101, '75–100 %']];
const bucketize = (vals, buckets) => buckets.map(([a, b, label]) => ({ label, n: vals.filter((v) => v >= a && v < b).length }));

function groupBy(sessions, keyFn) {
  const m = new Map();
  sessions.forEach((s) => {
    const k = keyFn(s); if (!k) return;
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(s);
  });
  return [...m.entries()].map(([key, list]) => ({
    key, n: list.length,
    leads: list.filter((s) => s.lead).length,
    active: median(list.map((s) => s.active))
  })).sort((a, b) => b.n - a.n);
}

export function aggregate(sessions) {
  const n = sessions.length;
  const leads = sessions.filter((s) => s.lead).length;
  const nowMs = Date.now();

  // kliky: kolik různých návštěv na prvek kliklo (ne kolikrát celkem — jeden
  // zmatený člověk by jinak přebil deset rozhodnutých)
  const clickMap = new Map();
  sessions.forEach((s) => {
    const seen = new Set();
    s.clicks.forEach((c) => {
      const key = (c.k || '') + '|' + (c.l || '');
      if (!clickMap.has(key)) clickMap.set(key, { label: c.l || '—', kind: c.k || '', people: 0, total: 0 });
      const row = clickMap.get(key);
      row.total++;
      if (!seen.has(key)) { seen.add(key); row.people++; }
    });
  });

  return {
    n, leads,
    conv: n ? leads / n : 0,
    activeMedian: median(sessions.map((s) => s.active)),
    activeAvg: n ? sessions.reduce((a, s) => a + s.active, 0) / n : 0,
    scrollMedian: median(sessions.map((s) => s.maxScroll)),
    quick: sessions.filter((s) => s.active < 10).length,
    callers: sessions.filter((s) => s.calls > 0).length,
    online: sessions.filter((s) => s.lastSeen && nowMs - s.lastSeen.getTime() < 120000).length,
    sources: groupBy(sessions, (s) => s.source + (s.medium && s.medium !== s.source ? ' · ' + s.medium : '')),
    temas: groupBy(sessions, (s) => s.tema),
    landings: groupBy(sessions, (s) => (s.landing || '').replace(/[?#].*$/, '') || '/'),
    devices: countBy(sessions, (s) => s.device),
    duration: bucketize(sessions.map((s) => s.active), DURATION_BUCKETS),
    scroll: bucketize(sessions.map((s) => s.maxScroll), SCROLL_BUCKETS),
    clicks: [...clickMap.values()].sort((a, b) => b.people - a.people || b.total - a.total),
    funnels: Object.keys(FORMS).map((id) => funnel(sessions, id)).filter((f) => f.used > 0)
  };
}

/** Časová osa jedné návštěvy — stránky, kliky, kroky formulářů, odeslání. */
export function journey(s) {
  const ev = [];
  s.pages.forEach((p) => ev.push({ t: p.t || 0, mark: 'page', text: 'Otevřel ' + (p.p || '/'), sub: 'doscrolloval ' + (p.s || 0) + ' %' }));
  s.clicks.forEach((c) => ev.push({ t: c.t || 0, mark: c.k === 'telefon' ? 'call' : 'click', text: c.l || '—', sub: c.k || 'klik' }));
  Object.entries(s.forms).forEach(([id, f]) => {
    const name = (FORMS[id] && FORMS[id].name) || id;
    if (f.open >= 0)  ev.push({ t: f.open,  mark: 'step', text: name + ': otevřel' });
    if (f.touch >= 0) ev.push({ t: f.touch, mark: 'step', text: name + ': začal vyplňovat' });
    Object.entries(f.steps || {}).forEach(([k, t]) => ev.push({ t, mark: 'step', text: name + ': krok ' + k + (f['l' + k] ? ' · ' + f['l' + k] : '') }));
    if (f.err > 0) ev.push({ t: f.sent >= 0 ? f.sent - 0.5 : (f.touch >= 0 ? f.touch + 1 : 0), mark: 'warn',
      text: name + ': ' + f.err + '× chyba ve formuláři', sub: Object.keys(f.errs || {}).join(', ') });
    if (f.sent >= 0) ev.push({ t: f.sent, mark: f.ok ? 'ok' : 'warn', text: name + (f.ok ? ': odesláno' : ': odeslání selhalo') });
  });
  s.events.forEach((e) => ev.push({ t: e.t || 0, mark: 'event', text: e.e || '' }));
  return ev.sort((a, b) => a.t - b.t);
}

/* ─── Vykreslení: stavební kousky ───────────────────────────────────────── */
const MARK = { page: 'mk-sq', step: 'mk-sq mk-fill', click: 'mk-sq mk-line', call: 'mk-ci', ok: 'mk-ci', warn: 'mk-tr', event: 'mk-dot' };

function tile(value, label, sub, tone) {
  return html`<div class="tile${tone ? ' tile-' + tone : ''}">
    <div class="tile-num">${value}</div>
    <div class="tile-label">${label}</div>
    ${sub ? raw(html`<div class="tile-sub">${sub}</div>`) : ''}
  </div>`;
}

/** Vodorovný sloupec: hodnota je vždy i textem, barva jen nese stav navíc. */
function bar(label, n, max, opts = {}) {
  const w = max > 0 ? Math.max(n > 0 ? 1.5 : 0, (n / max) * 100) : 0;
  return html`<div class="bar-row${opts.tone ? ' is-' + opts.tone : ''}" tabindex="0" data-tip="${opts.tip || ''}">
    <div class="bar-label">${label}${opts.note ? raw(html`<span class="bar-note">${opts.note}</span>`) : ''}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${raw(w.toFixed(1))}%"></div></div>
    <div class="bar-val">${opts.value != null ? opts.value : num(n)}</div>
  </div>`;
}

function block(title, body, aside) {
  return html`<section class="block">
    <header class="block-head"><h2>${title}</h2>${aside ? raw(html`<span class="block-aside">${aside}</span>`) : ''}</header>
    ${raw(body)}
  </section>`;
}

const empty = (msg) => html`<p class="empty">${msg}</p>`;

/* ─── Přehled ────────────────────────────────────────────────────────────── */
export function renderOverview(A, days) {
  if (!A.n) {
    return html`<div class="tiles">${raw(tile('0', 'Návštěvy', rangeLabel(days)))}</div>
      ${raw(empty('Za vybrané období zatím žádná návštěva. Jakmile někdo otevře web, objeví se tady do pár vteřin.'))}`;
  }
  const tiles = [
    tile(num(A.n), 'Návštěvy', A.online ? A.online + ' právě na webu' : rangeLabel(days)),
    tile(dur(A.activeMedian), 'Aktivní čas', 'medián · průměr ' + dur(A.activeAvg)),
    tile(Math.round(A.scrollMedian) + ' %', 'Doscrolluje', 'medián · ' + pct(A.quick, A.n) + ' % odešlo do 10 s'),
    tile(num(A.callers), 'Klikli na telefon', pct(A.callers, A.n) + ' % návštěv'),
    tile(num(A.leads), 'Poptávky', (A.conv * 100).toFixed(1).replace('.', ',') + ' % návštěv', A.leads ? 'good' : '')
  ].join('');

  const funnels = A.funnels.length
    ? A.funnels.map(renderFunnel).join('')
    : empty('Zatím nikdo neotevřel žádný formulář.');

  return html`
    <div class="tiles">${raw(tiles)}</div>
    <div class="cols">
      <div class="col-wide">${raw(block('Jak daleko se dostanou ve formulářích', funnels, 'kolik návštěv došlo do kroku'))}</div>
    </div>
    <div class="cols cols-2">
      ${raw(block('Odkud chodí', renderGroupTable(A.sources, A.n, 'Zdroj')))}
      ${raw(block('Témata reklam', A.temas.length ? renderGroupTable(A.temas, A.n, 'Téma (?tema=)') : empty('Žádná návštěva z tematické reklamy. Odkazy s ?tema=hypoteka apod. se zobrazí tady.')))}
    </div>
    <div class="cols cols-2">
      ${raw(block('Jak dlouho zůstanou', renderBuckets(A.duration, A.n), 'aktivní čas, bez nečinnosti'))}
      ${raw(block('Jak daleko scrollují', renderBuckets(A.scroll, A.n), 'nejhlubší místo za návštěvu'))}
    </div>
    <div class="cols cols-2">
      ${raw(block('Na co klikají', renderClicks(A.clicks, A.n), 'lidé, ne počet kliků'))}
      ${raw(block('Vstupní stránky a zařízení', renderLandings(A)))}
    </div>`;
}

export function rangeLabel(days) {
  return days === 1 ? 'dnes' : 'za ' + days + ' dní';
}

function renderFunnel(F) {
  const top = F.steps[0].n || 1;
  const rows = F.steps.map((st, i) => {
    const isWorst = i === F.worst;
    const isDone = st.key === 'ok';
    const share = pct(st.n, top);
    const note = isWorst ? '▼ největší propad −' + st.drop : (isDone && st.n ? '● poptávka' : '');
    const tip = i === 0 ? st.n + ' návštěv otevřelo formulář'
      : st.n + ' z ' + top + ' (' + share + ' %) · z předchozího kroku odpadlo ' + (st.drop || 0);
    return bar(st.label, st.n, top, {
      tone: isWorst ? 'warn' : (isDone ? 'good' : ''), note, tip,
      value: num(st.n) + (i ? '  ·  ' + share + ' %' : '')
    });
  }).join('');

  const facts = [];
  if (F.medianTime) facts.push('vyplnění trvá ' + dur(F.medianTime) + ' (medián)');
  if (F.errors) facts.push(F.errors + '× chyba — nejčastěji ' + F.errFields.slice(0, 2).map(([k, v]) => k + ' (' + v + ')').join(', '));
  if (F.failed) facts.push(F.failed + '× odeslání selhalo');

  return html`<div class="funnel">
    <div class="funnel-head"><strong>${F.def.name}</strong><span>${F.def.where}</span></div>
    <div class="bars">${raw(rows)}</div>
    ${facts.length ? raw(html`<p class="funnel-facts">${facts.join(' · ')}</p>`) : ''}
  </div>`;
}

function renderGroupTable(rows, total, head) {
  if (!rows.length) return empty('Žádná data.');
  const max = rows[0].n;
  const body = rows.slice(0, 10).map((r) => html`<tr>
      <th scope="row">${r.key}</th>
      <td class="t-bar"><span class="mini"><span style="width:${raw(((r.n / max) * 100).toFixed(1))}%"></span></span>${num(r.n)}</td>
      <td class="t-num">${dur(r.active)}</td>
      <td class="t-num">${r.leads ? raw(html`<span class="lead-n">● ${r.leads}</span><span class="t-conv">${(r.leads / r.n * 100).toFixed(1).replace('.', ',')} %</span>`) : '—'}</td>
    </tr>`).join('');
  return html`<div class="table-wrap"><table class="data">
    <thead><tr><th scope="col">${head}</th><th scope="col">Návštěvy</th><th scope="col" class="t-num">Aktivní čas</th><th scope="col" class="t-num">Poptávky</th></tr></thead>
    <tbody>${raw(body)}</tbody></table></div>`;
}

function renderBuckets(buckets, total) {
  const max = Math.max(...buckets.map((b) => b.n), 1);
  return html`<div class="bars">${raw(buckets.map((b) =>
    bar(b.label, b.n, max, { value: num(b.n) + '  ·  ' + pct(b.n, total) + ' %', tip: b.n + ' návštěv (' + pct(b.n, total) + ' %)' })).join(''))}</div>`;
}

function renderClicks(rows, total) {
  if (!rows.length) return empty('Zatím žádné kliky.');
  const max = rows[0].people;
  return html`<div class="bars">${raw(rows.slice(0, 12).map((r) =>
    bar(r.label, r.people, max, {
      note: r.kind, tone: r.kind === 'telefon' ? 'good' : '',
      value: num(r.people) + '  ·  ' + pct(r.people, total) + ' %',
      tip: r.people + ' lidí, ' + r.total + ' kliků celkem'
    })).join(''))}</div>`;
}

function renderLandings(A) {
  const max = A.landings.length ? A.landings[0].n : 1;
  const land = A.landings.slice(0, 6).map((r) => bar(r.key, r.n, max, {
    value: num(r.n), tip: r.n + ' návštěv začalo tady · ' + r.leads + ' poptávek'
  })).join('');
  const dev = A.devices.map(([k, v]) => html`<li><span>${k}</span><b>${num(v)} · ${pct(v, A.n)} %</b></li>`).join('');
  return html`<div class="bars">${raw(land)}</div><ul class="kv">${raw(dev)}</ul>`;
}

/* ─── Návštěvy (seznam + cesta) ─────────────────────────────────────────── */
export const SESSION_FILTERS = {
  vse:       ['Vše', () => true],
  poptavka:  ['S poptávkou', (s) => s.lead],
  rozprac:   ['Nedokončený formulář', (s) => !s.lead && Object.values(s.forms).some((f) => f.touch >= 0 || f.max > 0)],
  telefon:   ['Klikli na telefon', (s) => s.calls > 0],
  rychle:    ['Odešli do 10 s', (s) => s.active < 10]
};

function formChip(s) {
  const out = [];
  Object.entries(s.forms).forEach(([id, f]) => {
    const name = (FORMS[id] && FORMS[id].name) || id;
    if (f.ok === true) out.push(html`<span class="chip chip-good">● ${name}: odesláno</span>`);
    else if (f.ok === false) out.push(html`<span class="chip chip-warn">▲ ${name}: selhalo</span>`);
    else if (id === 'kviz' && f.max) out.push(html`<span class="chip">${name}: krok ${f.max}/4</span>`);
    else if (f.touch >= 0) out.push(html`<span class="chip">${name}: rozepsaný</span>`);
    else if (f.open >= 0) out.push(html`<span class="chip chip-quiet">${name}: otevřel</span>`);
  });
  return out.join('') || '<span class="muted">—</span>';
}

export function renderSessions(list, filterKey) {
  const [, fn] = SESSION_FILTERS[filterKey] || SESSION_FILTERS.vse;
  const rows = list.filter(fn);
  const chips = Object.entries(SESSION_FILTERS).map(([k, [label, f]]) =>
    html`<button class="filter${k === filterKey ? ' on' : ''}" data-action="session-filter" data-filter="${k}" aria-pressed="${k === filterKey}">${label} <span>${list.filter(f).length}</span></button>`).join('');

  const body = rows.slice(0, 300).map((s) => html`
    <tr class="s-row" data-action="toggle-journey" data-id="${s.id}" tabindex="0" aria-expanded="false">
      <td class="t-nowrap">${when(s.startedAt)}</td>
      <td><div class="s-landing">${(s.landing || '/').replace(/^\//, '/')}</div>${s.tema ? raw(html`<div class="s-sub">téma: ${s.tema}</div>`) : ''}</td>
      <td>${s.source}${s.campaign ? raw(html`<div class="s-sub">${s.campaign}</div>`) : ''}</td>
      <td>${s.device}</td>
      <td class="t-num">${dur(s.active)}</td>
      <td class="t-num">${s.maxScroll} %</td>
      <td class="t-num">${s.clicks.length}${s.calls ? raw(html`<div class="s-sub s-call">${s.calls}× telefon</div>`) : ''}</td>
      <td>${raw(formChip(s))}</td>
    </tr>
    <tr class="j-row" data-for="${s.id}" hidden><td colspan="8">${raw(renderJourney(s))}</td></tr>`).join('');

  return html`<div class="filters" role="group" aria-label="Filtr návštěv">${raw(chips)}</div>
    ${rows.length ? raw(html`<div class="table-wrap"><table class="data sessions">
      <thead><tr><th scope="col">Kdy</th><th scope="col">Vstup</th><th scope="col">Zdroj</th><th scope="col">Zařízení</th>
      <th scope="col" class="t-num">Aktivně</th><th scope="col" class="t-num">Scroll</th><th scope="col" class="t-num">Kliky</th><th scope="col">Formulář</th></tr></thead>
      <tbody>${raw(body)}</tbody></table></div>
      ${rows.length > 300 ? raw(html`<p class="empty">Zobrazeno prvních 300 z ${num(rows.length)}. Zužte období nebo filtr.</p>`) : ''}`)
    : raw(empty('Žádná návštěva neodpovídá filtru.'))}`;
}

export function renderJourney(s) {
  const ev = journey(s);
  const head = html`<div class="j-head">
    <span>${s.referrer ? 'přišel z ' + s.referrer : 'přímý vstup'}</span>
    <span>celkem ${dur(s.total)}, z toho aktivně ${dur(s.active)}</span>
    ${s.inquiryId ? raw(html`<span class="j-lead">● propojeno s poptávkou</span>`) : ''}
  </div>`;
  if (!ev.length) return head + empty('Bez zaznamenaných akcí.');
  return head + html`<ol class="timeline">${raw(ev.map((e) => html`<li>
      <time>${clock(e.t)}</time><i class="${MARK[e.mark] || 'mk-dot'}" aria-hidden="true"></i>
      <span class="tl-text">${e.text}${e.sub ? raw(html` <span class="tl-sub">${e.sub}</span>`) : ''}</span>
    </li>`).join(''))}</ol>`;
}

/* ─── Režim bez povolené kolekce sessions ───────────────────────────────── */
export const RULES = `match /sessions/{sid} {
  // číst a mazat smí jen přihlášený správce (admin.html)
  allow read, delete: if request.auth != null;

  // zapisovat smí web anonymně — ale jen ve tvaru, který posílá assets/track.js
  allow create, update: if sid.matches('^[a-f0-9]{32}$')
    && request.resource.data.keys().hasOnly([
         'v','startedAt','startedAtClient','lastSeen','landing','referrer','source','medium',
         'campaign','tema','device','vw','vh','lang','pages','active','total','maxScroll',
         'clicks','forms','events','calls','lead','inquiryId'])
    && request.resource.data.v == 1
    && request.resource.data.lastSeen == request.time
    && request.resource.data.clicks is list && request.resource.data.clicks.size() <= 80
    && request.resource.data.pages is list  && request.resource.data.pages.size() <= 40
    && request.resource.data.events is list && request.resource.data.events.size() <= 60
    && request.resource.data.active is int  && request.resource.data.active >= 0
    && request.resource.data.forms is map
    && (resource == null || !('startedAt' in resource.data)
        || request.resource.data.startedAt == resource.data.startedAt);
}`;

export function renderSetup() {
  return html`<section class="setup">
    <div class="setup-mark" aria-hidden="true"></div>
    <div>
      <h2>Podrobné měření čeká na jedno pravidlo v databázi</h2>
      <p>Web už měří dobu, scroll, kliky i postup ve formulářích, ale databáze zatím zápis do kolekce <code>sessions</code> nepustí. Do té doby se ukládá jen to, co dřív — základní návštěva a kroky kvízu (níže).</p>
      <ol>
        <li>Otevřete <a href="https://console.firebase.google.com/project/blog-adbe8/firestore/rules" target="_blank" rel="noopener">Firebase → Firestore → Pravidla</a>.</li>
        <li>Blok níže vložte <strong>dovnitř</strong> <code>match /databases/{database}/documents { … }</code>, vedle ostatních pravidel. Nic jiného neměňte.</li>
        <li>Klikněte na <strong>Publikovat</strong> a obnovte tuto stránku.</li>
      </ol>
      <div class="code-wrap"><pre><code id="rules-code">${RULES}</code></pre>
        <button class="btn btn-secondary" data-action="copy-rules">Zkopírovat pravidlo</button></div>
    </div>
  </section>`;
}

export function renderLegacy(L, days) {
  const pv = L.pageviews;
  const src = countBy(pv, (v) => v.source || 'přímá');
  const pages = countBy(pv, (v) => v.page || 'domu');
  const maxS = src.length ? src[0][1] : 1, maxP = pages.length ? pages[0][1] : 1;

  // stará data kvízu: každý krok je samostatný záznam bez vazby na člověka
  const ev = countBy(L.funnel, (f) => f.event);
  const get = (k) => (ev.find(([e]) => e === k) || [0, 0])[1];
  const steps = [['otevreno', 'Otevřeno'], ['krok-1', 'Téma'], ['krok-2', 'Detail'], ['krok-3', 'Spěch'], ['krok-4', 'Kontakt'], ['lead', 'Odesláno']];
  const top = Math.max(get('otevreno'), 1);
  const funnelBars = steps.map(([k, l]) => bar(l, get(k), top, { value: num(get(k)) + (k !== 'otevreno' ? '  ·  ' + pct(get(k), top) + ' %' : ''), tone: k === 'lead' ? 'good' : '' })).join('');

  return html`
    <div class="tiles">${raw(tile(num(pv.length), 'Návštěvy', rangeLabel(days)))}${raw(tile('—', 'Aktivní čas', 'čeká na pravidlo'))}${raw(tile(num(get('lead')), 'Odeslané kvízy', rangeLabel(days)))}</div>
    <div class="cols cols-2">
      ${raw(block('Kvíz — kroky (starý záznam)', L.funnelDenied ? empty('Kolekce quiz_funnel není pro admin čitelná.') : (L.funnel.length ? html`<div class="bars">${raw(funnelBars)}</div>` : empty('Žádná data.'))))}
      ${raw(block('Odkud chodí', src.length ? html`<div class="bars">${raw(src.slice(0, 8).map(([k, v]) => bar(k, v, maxS)).join(''))}</div>` : empty('Žádná data.')))}
    </div>
    ${raw(block('Stránky', pages.length ? html`<div class="bars">${raw(pages.slice(0, 8).map(([k, v]) => bar(k, v, maxP)).join(''))}</div>` : empty('Žádná data.')))}`;
}
