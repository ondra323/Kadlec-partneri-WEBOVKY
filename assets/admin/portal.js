// Klientská zóna: přihlášení a pohyb klientů (zapisuje src/portal/track.ts v REA).
//  portal_auth     — přihlášení, neúspěšné pokusy, odhlášení, reset hesla
//  portal_activity — jedna návštěva přihlášeného klienta: části zóny, aktivní čas, scroll, kliky
import { db, collection, getDocs, query, where, orderBy, limit, Timestamp, doc, deleteDoc, isDenied } from './firebase.js';
import { html, raw, $, $$, toDate, num, dur, clock, when, median, toast } from './util.js';

const st = { days: readDays(), data: null, loading: false, open: new Set() };
function readDays() { try { return +localStorage.getItem('adm_zona_days') || 30; } catch (e) { return 30; } }

const AUTH = { login: 'Přihlášení', fail: 'Neúspěšný pokus', logout: 'Odhlášení', reset: 'Reset hesla', unverified: 'Nepotvrzený e-mail' };
// kódy Firebase → čitelně
const CODES = { 'invalid-credential': 'špatné heslo nebo e-mail', 'wrong-password': 'špatné heslo', 'user-not-found': 'účet neexistuje',
  'too-many-requests': 'zablokováno po mnoha pokusech', 'user-disabled': 'účet vypnutý', 'invalid-email': 'neplatný e-mail', 'network-request-failed': 'bez připojení' };

export const RULES = `match /portal_auth/{id} {
  allow create: if id.matches('^[a-f0-9]{32}$')
    && request.resource.data.keys().hasOnly(['type','email','code','device','at'])
    && request.resource.data.type in ['login','fail','logout','reset','unverified']
    && request.resource.data.email is string && request.resource.data.email.size() <= 80
    && request.resource.data.code is string && request.resource.data.code.size() <= 40
    && request.resource.data.at == request.time;
  allow read, delete: if isAdmin();
}
match /portal_activity/{id} {
  allow create, update: if request.auth != null
    && id.matches('^[a-f0-9]{32}$')
    && request.resource.data.keys().hasOnly(['v','uid','email','clientId','name','how','device','vw',
         'pages','events','active','total','logout','lastSeen','startedAt'])
    && request.resource.data.uid == request.auth.uid
    && (resource == null || resource.data.uid == request.auth.uid)
    && request.resource.data.v == 1
    && request.resource.data.lastSeen == request.time
    && request.resource.data.pages is list  && request.resource.data.pages.size() <= 60
    && request.resource.data.events is list && request.resource.data.events.size() <= 150
    && request.resource.data.active is int  && request.resource.data.active >= 0
    && (resource == null || !('startedAt' in resource.data)
        || request.resource.data.startedAt == resource.data.startedAt);
  allow read, delete: if isAdmin();
}`;

async function load(days) {
  const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (days - 1));
  const ts = Timestamp.fromDate(from);
  const out = { auth: [], visits: [], web: null, denied: false };
  // cesta z webu do zóny: kdo viděl sekci zóny a kdo klikl na odkaz do ní (sessions z track.js)
  try {
    const w = await getDocs(query(collection(db, 'sessions'), where('startedAt', '>=', ts), orderBy('startedAt', 'desc'), limit(5000)));
    out.web = w.docs.map((d) => { const x = d.data(); return { seen: Array.isArray(x.events) && x.events.some((e) => e.e === 'zona-sekce'),
      links: Array.isArray(x.clicks) ? [...new Set(x.clicks.map((c) => c.l || '').filter((l) => /^Zóna · /.test(l)))] : [] }; });
  } catch (e) { if (!isDenied(e)) throw e; }
  try {
    const [a, v] = await Promise.all([
      getDocs(query(collection(db, 'portal_auth'), where('at', '>=', ts), orderBy('at', 'desc'), limit(2000))),
      getDocs(query(collection(db, 'portal_activity'), where('startedAt', '>=', ts), orderBy('startedAt', 'desc'), limit(2000)))
    ]);
    out.auth = a.docs.map((d) => ({ id: d.id, ...d.data(), at: toDate(d.data().at) }));
    out.visits = v.docs.map((d) => {
      const x = d.data();
      return { id: d.id, email: x.email || '', name: x.name || '', how: x.how || '', device: x.device || '—',
        startedAt: toDate(x.startedAt), lastSeen: toDate(x.lastSeen), active: +x.active || 0, total: +x.total || 0,
        pages: Array.isArray(x.pages) ? x.pages : [], events: Array.isArray(x.events) ? x.events : [], logout: !!x.logout };
    });
  } catch (e) {
    if (!isDenied(e)) throw e;
    out.denied = true;
  }
  return out;
}

/* ─── výpočty ───────────────────────────────────────────────────────────── */
export function aggregate(D) {
  const clients = new Map();
  const get = (email) => {
    if (!clients.has(email)) clients.set(email, { email, name: '', visits: [], logins: 0, fails: 0, last: null, active: 0, sections: new Map() });
    return clients.get(email);
  };
  D.visits.forEach((v) => {
    const c = get(v.email); c.visits.push(v); if (v.name) c.name = v.name; c.active += v.active;
    if (!c.last || (v.lastSeen && v.lastSeen > c.last)) c.last = v.lastSeen;
    v.pages.forEach((p) => c.sections.set(p.p, (c.sections.get(p.p) || 0) + (+p.a || 0)));
  });
  D.auth.forEach((a) => {
    const c = get(a.email);
    if (a.type === 'login') c.logins++;
    if (a.type === 'fail') c.fails++;
    if (!c.last || (a.at && a.at > c.last)) c.last = a.at;
  });

  const sec = new Map();
  D.visits.forEach((v) => {
    const seen = new Set();
    v.pages.forEach((p) => {
      if (!sec.has(p.p)) sec.set(p.p, { key: p.p, people: new Set(), visits: 0, active: 0, scroll: [] });
      const r = sec.get(p.p); r.active += +p.a || 0; r.scroll.push(+p.s || 0); r.people.add(v.email);
      if (!seen.has(p.p)) { seen.add(p.p); r.visits++; }
    });
  });
  const clicks = new Map();
  D.visits.forEach((v) => {
    const seen = new Set();
    v.events.forEach((e) => { const k = e.e + '|' + e.l; if (seen.has(k)) return; seen.add(k); clicks.set(k, (clicks.get(k) || 0) + 1); });
  });

  // podezřelé: 3+ neúspěšné pokusy na jeden e-mail během 24 h
  const alerts = [];
  const fails = D.auth.filter((a) => a.type === 'fail' && a.at).sort((a, b) => a.at - b.at);
  const byEmail = new Map(); fails.forEach((f) => { if (!byEmail.has(f.email)) byEmail.set(f.email, []); byEmail.get(f.email).push(f); });
  byEmail.forEach((list, email) => {
    for (let i = 0; i + 2 < list.length; i++) if (list[i + 2].at - list[i].at < 864e5) {
      const ok = D.auth.some((a) => a.email === email && a.type === 'login' && a.at > list[i + 2].at);
      alerts.push({ email, n: list.length, last: list[list.length - 1].at, ok }); break;
    }
  });

  return {
    clients: [...clients.values()].sort((a, b) => (b.last || 0) - (a.last || 0)),
    sections: [...sec.values()].map((r) => ({ ...r, people: r.people.size, scroll: median(r.scroll) })).sort((a, b) => b.active - a.active),
    clicks: [...clicks.entries()].map(([k, n]) => { const [e, l] = k.split('|'); return { e, l, n }; }).sort((a, b) => b.n - a.n),
    alerts,
    logins: D.auth.filter((a) => a.type === 'login').length,
    fails: fails.length,
    resets: D.auth.filter((a) => a.type === 'reset').length,
    activeMedian: median(D.visits.map((v) => v.active)),
    people: new Set(D.visits.map((v) => v.email)).size
  };
}

function timeline(v) {
  const ev = [];
  v.pages.forEach((p) => ev.push({ t: p.t, mark: 'mk-sq', text: 'Otevřel ' + p.p, sub: 'aktivně ' + dur(p.a) + ' · doscrolloval ' + (p.s || 0) + ' %' }));
  v.events.forEach((e) => ev.push({ t: e.t, mark: e.e === 'telefon' || e.e === 'e-mail' ? 'mk-ci' : 'mk-sq mk-line', text: e.l || '—', sub: e.e }));
  if (v.logout) ev.push({ t: v.total, mark: 'mk-dot', text: 'Odhlásil se' });
  ev.sort((a, b) => a.t - b.t);
  return html`<div class="j-head"><span>${v.how === 'přihlášení' ? 'přihlásil se heslem' : 'vrátil se s uloženým přihlášením'} · ${v.device}</span>
      <span>celkem ${dur(v.total)}, aktivně ${dur(v.active)}</span></div>
    ${ev.length ? raw(html`<ol class="timeline">${raw(ev.map((e) => html`<li><time>${clock(e.t)}</time><i class="${e.mark}" aria-hidden="true"></i>
      <span class="tl-text">${e.text}${e.sub ? raw(html` <span class="tl-sub">${e.sub}</span>`) : ''}</span></li>`).join(''))}</ol>`) : raw('<p class="empty">Bez zaznamenaných akcí.</p>')}`;
}

function webBlock(W) {
  if (!W) return '';
  const all = W.length, seen = W.filter((s) => s.seen).length, went = W.filter((s) => s.links.length).length;
  const by = new Map(); W.forEach((s) => s.links.forEach((l) => by.set(l, (by.get(l) || 0) + 1)));
  const rows = [...by.entries()].sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1;
  const pc = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
  return html`<section class="block"><header class="block-head"><h2>Z webu do zóny</h2><span class="block-aside">návštěvy hlavní stránky za období</span></header>
    <div class="bars">
      <div class="bar-row"><span class="bar-label">Návštěvy webu</span><span class="bar-track"><span class="bar-fill" style="width:100%"></span></span><span class="bar-val">${num(all)}</span></div>
      <div class="bar-row"><span class="bar-label">Viděli ukázku zóny</span><span class="bar-track"><span class="bar-fill" style="width:${raw(all ? (seen / all * 100).toFixed(1) : 0)}%"></span></span><span class="bar-val">${num(seen)} · ${pc(seen, all)}</span></div>
      <div class="bar-row is-good"><span class="bar-label">Otevřeli zónu</span><span class="bar-track"><span class="bar-fill" style="width:${raw(all ? (went / all * 100).toFixed(1) : 0)}%"></span></span><span class="bar-val">${num(went)} · ${pc(went, seen || all)}</span></div>
    </div>
    ${rows.length ? raw(html`<ul class="kv">${raw(rows.map(([l, n]) => html`<li><span>${l.replace('Zóna · ', '')}</span><b>${num(n)}</b></li>`).join(''))}</ul>`) : raw('<p class="empty">Zatím nikdo z webu do zóny neklikl.</p>')}
  </section>`;
}

/* ─── vykreslení ────────────────────────────────────────────────────────── */
export function render() {
  const box = $('#zona');
  if (!st.data) { box.innerHTML = '<p class="empty">Načítám klientskou zónu…</p>'; return; }
  if (st.data.denied) {
    box.innerHTML = html`<section class="setup"><div class="setup-mark" aria-hidden="true"></div><div>
      <h2>Měření klientské zóny čeká na pravidla v databázi</h2>
      <p>Zóna už měření obsahuje, ale databáze zatím kolekce <code>portal_auth</code> a <code>portal_activity</code> nepustí. Pravidla jsou v repozitáři REA v souboru <code>firestore.rules</code> (celý soubor), nebo vložte jen blok níže vedle ostatních.</p>
      <ol><li>Otevřete <a href="https://console.firebase.google.com/project/blog-adbe8/firestore/rules" target="_blank" rel="noopener">Firebase → Firestore → Pravidla</a>.</li>
        <li>Blok vložte dovnitř <code>match /databases/{database}/documents { … }</code>. Funkce <code>isAdmin()</code> už v pravidlech je.</li>
        <li>Klikněte na <strong>Publikovat</strong> a obnovte tuto stránku.</li></ol>
      <div class="code-wrap"><pre><code id="zona-rules">${RULES}</code></pre><button class="btn btn-secondary" data-action="zona-rules">Zkopírovat pravidlo</button></div>
    </div></section>`;
    return;
  }
  const A = aggregate(st.data);
  const tile = (v, l, s, tone) => html`<div class="tile${tone ? ' tile-' + tone : ''}"><div class="tile-num">${v}</div><div class="tile-label">${l}</div>${s ? raw(html`<div class="tile-sub">${s}</div>`) : ''}</div>`;
  const tiles = [
    tile(num(A.people), 'Klienti v zóně', num(st.data.visits.length) + ' návštěv'),
    tile(num(A.logins), 'Přihlášení heslem', 'další se vrátili přihlášení'),
    tile(dur(A.activeMedian), 'Aktivní čas', 'medián na návštěvu'),
    tile(num(A.fails), 'Neúspěšné pokusy', A.resets + '× reset hesla', A.alerts.some((x) => !x.ok) ? 'warn' : '')
  ].join('');

  const alerts = A.alerts.length ? html`<section class="block alert-block"><header class="block-head"><h2>Potřebují pomoct s přihlášením?</h2><span class="block-aside">3 a více neúspěšných pokusů za 24 h</span></header>
    <ul class="kv">${raw(A.alerts.map((a) => html`<li><span>▲ ${a.email} · ${a.n}× · naposledy ${when(a.last)}</span><b>${a.ok ? 'pak se přihlásil' : 'zatím se nepřihlásil — zavolat?'}</b></li>`).join(''))}</ul>
    <p class="hint">Neznámý e-mail s mnoha pokusy může být i cizí pokus o přístup. Firebase po mnoha pokusech účet dočasně zablokuje sám.</p></section>` : '';

  const rows = A.clients.map((c) => {
    const top = [...c.sections.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => k + ' ' + dur(v)).join(', ');
    const open = st.open.has(c.email);
    const visits = c.visits.slice(0, 20).map((v) => html`<details class="z-visit"><summary>${when(v.startedAt)} · ${v.pages.map((p) => p.p).join(' → ') || 'bez stránek'} · aktivně ${dur(v.active)}</summary>${raw(timeline(v))}</details>`).join('');
    return html`<tr class="s-row" data-action="zona-toggle" data-email="${c.email}" tabindex="0" aria-expanded="${open}">
        <th scope="row">${c.name || c.email}${c.name ? raw(html`<div class="s-sub">${c.email}</div>`) : ''}</th>
        <td class="t-nowrap">${when(c.last)}</td><td class="t-num">${num(c.visits.length)}</td><td class="t-num">${num(c.logins)}</td>
        <td class="t-num">${dur(c.active)}</td><td>${top || '—'}</td>
        <td class="t-num">${c.fails ? raw(html`<span class="z-fail">▲ ${c.fails}</span>`) : '—'}</td></tr>
      <tr class="j-row" data-for="${c.email}"${open ? '' : ' hidden'}><td colspan="7">${visits ? raw(visits) : raw('<p class="empty">Žádná návštěva zóny, jen pokusy o přihlášení.</p>')}</td></tr>`;
  }).join('');

  const secMax = A.sections.length ? A.sections[0].active : 1;
  const secRows = A.sections.map((s) => html`<tr><th scope="row">${s.key}</th>
    <td class="t-bar"><span class="mini"><span style="width:${raw(((s.active / (secMax || 1)) * 100).toFixed(1))}%"></span></span>${dur(s.active)}</td>
    <td class="t-num">${num(s.people)}</td><td class="t-num">${num(s.visits)}</td><td class="t-num">${Math.round(s.scroll)} %</td></tr>`).join('');

  const log = st.data.auth.slice(0, 60).map((a) => html`<tr><td class="t-nowrap">${when(a.at)}</td><td>${a.type === 'fail' ? raw('<span class="z-fail">▲</span> ') : ''}${AUTH[a.type] || a.type}</td>
    <th scope="row">${a.email}</th><td>${a.device || '—'}</td><td class="muted">${CODES[a.code] || a.code || ''}</td></tr>`).join('');

  box.innerHTML = html`<div class="tiles">${raw(tiles)}</div>${raw(alerts)}${raw(webBlock(st.data.web))}
    <section class="block"><header class="block-head"><h2>Klienti</h2><span class="block-aside">klikněte na řádek — ukáže se každá návštěva krok za krokem</span></header>
      ${rows ? raw(html`<div class="table-wrap"><table class="data sessions"><thead><tr><th scope="col">Klient</th><th scope="col">Naposledy</th><th scope="col" class="t-num">Návštěvy</th>
        <th scope="col" class="t-num">Přihlášení</th><th scope="col" class="t-num">Aktivně celkem</th><th scope="col">Nejvíc času</th><th scope="col" class="t-num">Chyby</th></tr></thead><tbody>${raw(rows)}</tbody></table></div>`)
        : raw('<p class="empty">Za období se do zóny nikdo nepřihlásil.</p>')}</section>
    <div class="cols cols-2">
      <section class="block"><header class="block-head"><h2>Kde v zóně tráví čas</h2></header>
        ${secRows ? raw(html`<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Část</th><th scope="col">Aktivní čas</th><th scope="col" class="t-num">Klienti</th><th scope="col" class="t-num">Návštěvy</th><th scope="col" class="t-num">Scroll</th></tr></thead><tbody>${raw(secRows)}</tbody></table></div>`) : raw('<p class="empty">Žádná data.</p>')}</section>
      <section class="block"><header class="block-head"><h2>Na co v zóně klikají</h2><span class="block-aside">návštěvy, ne počet kliků</span></header>
        ${A.clicks.length ? raw(html`<ul class="kv">${raw(A.clicks.slice(0, 14).map((c) => html`<li><span>${c.l} <span class="muted">· ${c.e}</span></span><b>${num(c.n)}</b></li>`).join(''))}</ul>`) : raw('<p class="empty">Zatím žádné kliky.</p>')}</section>
    </div>
    <section class="block"><header class="block-head"><h2>Přihlášení a pokusy</h2><span class="block-aside">posledních 60 záznamů</span></header>
      ${log ? raw(html`<div class="table-wrap"><table class="data"><thead><tr><th scope="col">Kdy</th><th scope="col">Co</th><th scope="col">E-mail</th><th scope="col">Zařízení</th><th scope="col">Detail</th></tr></thead><tbody>${raw(log)}</tbody></table></div>`) : raw('<p class="empty">Žádné záznamy.</p>')}</section>`;
}

export async function ensure(force) {
  $$('[data-action="zona-range"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.days === st.days));
  if (!force && st.data) return render();
  if (st.loading) return;
  st.loading = true;
  if (!st.data) render();
  try { st.data = await load(st.days); render(); }
  catch (e) { $('#zona').innerHTML = html`<p class="empty">Data zóny se nepodařilo načíst: ${e.message}</p>`; }
  finally { st.loading = false; }
}
export function setDays(d) { st.days = d; try { localStorage.setItem('adm_zona_days', d); } catch (e) {} ensure(true); }
export function toggle(email) {
  const row = $('tr[data-for="' + CSS.escape(email) + '"]'), head = $('tr.s-row[data-email="' + CSS.escape(email) + '"]');
  if (!row) return;
  row.hidden = !row.hidden; head.setAttribute('aria-expanded', !row.hidden);
  if (row.hidden) st.open.delete(email); else st.open.add(email);
}
/** Zásady (gdpr.html) slibují nejvýš 12 měsíců pro údaje o používání — tohle je ten úklid. */
const RETENTION = [['sessions', 'startedAt'], ['portal_activity', 'startedAt'], ['portal_auth', 'at'], ['pageviews', 'timestamp'], ['quiz_funnel', 'timestamp']];
export async function purgeOld(btn) {
  const cut = new Date(); cut.setMonth(cut.getMonth() - 12);
  if (!confirm('Smazat návštěvy webu a záznamy klientské zóny starší než ' + cut.toLocaleDateString('cs-CZ') + '? Poptávky, články a náklady zůstanou. Nejde to vrátit.')) return;
  btn.disabled = true; let n = 0;
  try {
    for (const [col, field] of RETENTION) {
      for (;;) {
        const snap = await getDocs(query(collection(db, col), where(field, '<', Timestamp.fromDate(cut)), limit(300)));
        if (snap.empty) break;
        await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, col, d.id))));
        n += snap.size;
        if (snap.size < 300) break;
      }
    }
    toast('Smazáno ' + num(n) + ' starých záznamů.');
  } catch (e) { toast('Úklid se nedokončil: ' + e.message, 'err'); }
  finally { btn.disabled = false; ensure(true); }
}
export const _test = { aggregate, timeline };
