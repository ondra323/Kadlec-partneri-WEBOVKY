/* ═══════════════════════════════════════════════════════════════════════
   Kadlec — měření návštěv
   ───────────────────────────────────────────────────────────────────────
   Jeden dokument na návštěvu v kolekci `sessions`: odkud člověk přišel,
   kolik času na webu aktivně strávil, kam doscrolloval, na co klikal
   a jak daleko se dostal ve formulářích. Návštěva drží pohromadě i přes
   přechody mezi stránkami (stav žije v sessionStorage dané karty).

   Zapisuje se přes Firestore REST, ne přes SDK: skript tak funguje na
   každé stránce bez ohledu na to, jestli načítá Firebase, a díky
   `fetch(…, {keepalive:true})` doletí i poslední zápis při zavření karty.

   Co se NESBÍRÁ: obsah vyplněných polí, IP adresa, plný user-agent ani
   trvalý identifikátor návštěvníka. Respektuje Global Privacy Control
   a Do Not Track a nepočítá roboty ani návštěvy přihlášeného správce.

   Použití ze stránky (volání před načtením skriptu se uloží do fronty):
     kt('open',   'kviz')                 formulář se zobrazil
     kt('step',   'kviz', 2, 'Detail')    dosažený krok
     kt('error',  'kviz', 'telefon')      chyba validace (jen název pole)
     kt('submit', 'kviz', true, inqId)    odesláno / selhalo (+ id poptávky)
     kt('event',  'gate-zavren')          ostatní události
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PROJECT = 'blog-adbe8';
  var API_KEY = 'AIzaSyCMpXn3fBghTYqDaLrbjEN4NYz6Utlg8gI';
  var DOCS    = 'projects/' + PROJECT + '/databases/(default)/documents';
  var COMMIT  = 'https://firestore.googleapis.com/v1/' + DOCS + ':commit?key=' + API_KEY;

  var STORE_KEY   = 'kt_session_v1';
  var OPT_OUT_KEY = 'kt_off';            // nastavuje admin po přihlášení
  var IDLE_MS     = 120000;              // po 2 min bez pohybu se čas nepočítá
  var SESSION_MS  = 30 * 60000;          // 30 min nečinnosti = nová návštěva
  var BEAT_MS     = 15000;               // průběžný zápis
  var MAX_CLICKS  = 80, MAX_PAGES = 40, MAX_EVENTS = 60;

  var queue = (window.kt && window.kt.q) || [];

  /* ── kdy neměřit ─────────────────────────────────────────────────────── */
  function shouldSkip() {
    try { if (localStorage.getItem(OPT_OUT_KEY) === '1') return true; } catch (e) {}
    if (navigator.globalPrivacyControl === true) return true;
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true;
    if (navigator.webdriver) return true;
    if (/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent)) return true;
    return false;
  }

  if (shouldSkip()) {
    // Stránky volají kt() dál — musí to tiše projít.
    window.kt = function () {};
    window.KTrack = { id: null, off: true };
    return;
  }

  /* ── pomocné ─────────────────────────────────────────────────────────── */
  var now = function () { return Date.now(); };
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    var s = ''; for (var i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  function clip(s, n) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function pathNow() { return location.pathname.replace(/^.*\//, '/') + location.search + location.hash; }

  function classifySource(params, ref) {
    var utm = params.get('utm_source');
    if (utm) return { source: utm.toLowerCase(), medium: (params.get('utm_medium') || 'kampaň').toLowerCase() };
    if (params.get('fbclid')) return { source: 'facebook', medium: 'reklama' };
    if (params.get('gclid'))  return { source: 'google',   medium: 'reklama' };
    if (!ref) return { source: 'přímá', medium: 'přímá' };
    var host = '';
    try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch (e) {}
    if (host === location.hostname.replace(/^www\./, '')) return { source: 'web', medium: 'interní' };
    if (/instagram\./i.test(host))               return { source: 'instagram', medium: 'sociální' };
    if (/facebook\.|fb\.|messenger\./i.test(host)) return { source: 'facebook', medium: 'sociální' };
    if (/google\./i.test(host))                  return { source: 'google', medium: 'vyhledávač' };
    if (/seznam\./i.test(host))                  return { source: 'seznam', medium: 'vyhledávač' };
    if (/bing\.|duckduckgo\./i.test(host))       return { source: host.split('.')[0], medium: 'vyhledávač' };
    if (/linkedin\./i.test(host))                return { source: 'linkedin', medium: 'sociální' };
    return { source: host || 'odkaz', medium: 'odkaz' };
  }

  function deviceClass() {
    var w = Math.min(screen.width || innerWidth, innerWidth);
    return w < 768 ? 'mobil' : (w < 1100 ? 'tablet' : 'počítač');
  }

  /* ── stav návštěvy ──────────────────────────────────────────────────── */
  function freshState() {
    var p = new URLSearchParams(location.search);
    var src = classifySource(p, document.referrer);
    return {
      id: uid(), v: 1,
      startedAt: now(), lastActivity: now(), savedOk: false,
      landing: clip(pathNow(), 160),
      referrer: clip(document.referrer, 160),
      source: src.source, medium: src.medium,
      // utm_content (která reklama / který odkaz z adminu) jede v poli campaign
      // za lomítkem — pravidla Firestore nové pole nepustí, admin ho zase rozdělí
      campaign: clip([p.get('utm_campaign') || '', p.get('utm_content') || ''].filter(Boolean).join(' / '), 80),
      tema: clip(p.get('tema') || '', 40),
      device: deviceClass(), vw: innerWidth, vh: innerHeight,
      lang: (navigator.language || '').slice(0, 5),
      pages: [], active: 0, clicks: [], forms: {}, events: [],
      calls: 0, lead: false, inquiryId: ''
    };
  }

  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
      if (s && s.v === 1 && now() - s.lastActivity < SESSION_MS) return s;
    } catch (e) {}
    return freshState();
  }
  function persist() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }

  var S = load();
  var t0 = S.startedAt;
  var sec = function () { return Math.round((now() - t0) / 1000); };

  function addPage() {
    var p = clip(pathNow(), 160);
    var last = S.pages[S.pages.length - 1];
    if (last && last.p === p) return;
    if (S.pages.length >= MAX_PAGES) return;
    S.pages.push({ p: p, t: sec(), s: 0 });
    dirty = true;
  }
  function curPage() { return S.pages.length - 1; }

  /* ── zápis do Firestore (REST) ──────────────────────────────────────── */
  function fs(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number')  return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string')  return { stringValue: v };
    if (v instanceof Date)      return { timestampValue: v.toISOString() };
    if (Array.isArray(v))       return { arrayValue: { values: v.map(fs) } };
    var f = {}; Object.keys(v).forEach(function (k) { f[k] = fs(v[k]); });
    return { mapValue: { fields: f } };
  }

  var FIELDS = ['v', 'startedAtClient', 'landing', 'referrer', 'source', 'medium', 'campaign', 'tema',
                'device', 'vw', 'vh', 'lang', 'pages', 'active', 'total', 'maxScroll', 'clicks',
                'forms', 'events', 'calls', 'lead', 'inquiryId'];

  function snapshot() {
    var maxScroll = 0;
    S.pages.forEach(function (p) { if (p.s > maxScroll) maxScroll = p.s; });
    return {
      v: 1, startedAtClient: new Date(S.startedAt),
      landing: S.landing, referrer: S.referrer, source: S.source, medium: S.medium,
      campaign: S.campaign, tema: S.tema, device: S.device, vw: S.vw, vh: S.vh, lang: S.lang,
      pages: S.pages, active: S.active, total: sec(), maxScroll: maxScroll,
      clicks: S.clicks, forms: S.forms, events: S.events,
      calls: S.calls, lead: S.lead, inquiryId: S.inquiryId
    };
  }

  var dirty = true, inflight = false, lastWrite = 0, denied = false, pendingTimer = null;

  function post(body, unloading) {
    return fetch(COMMIT, {
      method: 'POST', keepalive: !!unloading,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  function flush(unloading) {
    if (denied || (!dirty && !unloading)) return;
    if (inflight && !unloading) { schedule(1500); return; }
    var data = snapshot(), fields = {};
    FIELDS.forEach(function (k) { fields[k] = fs(data[k]); });
    var transforms = [{ fieldPath: 'lastSeen', setToServerValue: 'REQUEST_TIME' }];
    // startedAt nastaví server jen napoprvé; další zápisy ho nechají být
    if (!S.savedOk) transforms.push({ fieldPath: 'startedAt', setToServerValue: 'REQUEST_TIME' });

    var body = { writes: [{
      update: { name: DOCS + '/sessions/' + S.id, fields: fields },
      updateMask: { fieldPaths: FIELDS },
      updateTransforms: transforms
    }] };

    dirty = false; inflight = true; lastWrite = now(); persist();
    post(body, unloading).then(function (r) {
      inflight = false;
      if (r.ok) { if (!S.savedOk) { S.savedOk = true; persist(); } return; }
      if (r.status === 403) return fallback();
      dirty = true;                      // jiná chyba (síť, kvóta) → zkusit znovu
    }).catch(function () { inflight = false; dirty = true; });
  }

  function schedule(ms) {
    if (pendingTimer) return;
    pendingTimer = setTimeout(function () { pendingTimer = null; flush(false); }, ms);
  }
  // Důležité okamžiky (krok formuláře, odeslání) se zapisují hned,
  // ale nejvýš jednou za 1,5 s — rychlé proklikávání se slije do jednoho.
  function soon() { dirty = true; var gap = now() - lastWrite; if (gap > 1500) flush(false); else schedule(1500 - gap); }

  /* Dokud správce nepovolí kolekci `sessions` v pravidlech Firestore, zápis
     skončí 403. Web pak nesmí přijít ani o to, co měřil doteď: zapíše jeden
     záznam do `pageviews` a kroky kvízu do `quiz_funnel` — přesně ve tvaru,
     jaký tam stránky zapisovaly dřív, takže je pravidla propustí. */
  function fallback() {
    if (denied) return;
    denied = true;
    if (window.console) console.info('[měření] Kolekce sessions není povolená v pravidlech Firestore — zapisuji jen základní návštěvu. Návod je v adminu.');
    legacyCreate('pageviews', {
      page: S.landing.replace(/^\//, '').replace(/\.html.*$/, '') || 'domu',
      source: S.source, referrer: S.referrer, ua: navigator.userAgent.substring(0, 120), duration: 0
    }, 'timestamp');
    legacyQueue.forEach(legacyFunnelWrite);
    legacyQueue = [];
  }
  var legacyQueue = [], legacySeen = {};
  function legacyFunnel(ev) {
    if (legacySeen[ev]) return; legacySeen[ev] = 1;
    // Dokud nevíme, jestli sessions projdou, jen si to poznamenat — při
    // úspěchu by se kroky započítaly dvakrát.
    if (!denied) { legacyQueue.push(ev); return; }
    legacyFunnelWrite(ev);
  }
  function legacyFunnelWrite(ev) {
    legacyCreate('quiz_funnel', { event: ev, tema: S.tema || 'obecne', source: S.source }, 'timestamp');
  }
  function legacyCreate(col, data, tsField) {
    var fields = {}; Object.keys(data).forEach(function (k) { fields[k] = fs(data[k]); });
    post({ writes: [{
      update: { name: DOCS + '/' + col + '/' + uid().slice(0, 20), fields: fields },
      currentDocument: { exists: false },
      updateTransforms: [{ fieldPath: tsField, setToServerValue: 'REQUEST_TIME' }]
    }] }, false).catch(function () {});
  }

  /* ── aktivní čas ────────────────────────────────────────────────────── */
  var lastInput = now();
  function poke() { lastInput = now(); S.lastActivity = lastInput; }
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove', 'wheel'].forEach(function (e) {
    addEventListener(e, poke, { passive: true, capture: true });
  });

  setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    if (now() - lastInput > IDLE_MS) return;
    S.active += 1;
    if (S.active % 15 === 0) dirty = true;
  }, 1000);

  setInterval(function () { if (document.visibilityState === 'visible') flush(false); }, BEAT_MS);

  /* ── hloubka scrollu ────────────────────────────────────────────────── */
  var scrollT = 0;
  function measureScroll() {
    var i = curPage(); if (i < 0) return;
    var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (h <= innerHeight + 4) { if (S.pages[i].s < 100) { S.pages[i].s = 100; dirty = true; } return; }
    var pct = Math.min(100, Math.round((scrollY + innerHeight) / h * 100));
    if (pct > S.pages[i].s) { S.pages[i].s = pct; dirty = true; }
  }
  addEventListener('scroll', function () {
    var t = now(); if (t - scrollT < 250) return; scrollT = t; measureScroll();
  }, { passive: true });

  /* ── kliky ───────────────────────────────────────────────────────────── */
  var CLICKABLE = 'a,button,summary,label,[role="button"],[data-track],input[type="submit"],input[type="checkbox"],input[type="radio"],.opt,.chip';

  function describe(el) {
    var label = el.getAttribute('data-track') || el.getAttribute('aria-label') || '';
    var kind = 'tlačítko';
    var tag = el.tagName;
    if (tag === 'A') {
      var href = el.getAttribute('href') || '';
      if (/^tel:/i.test(href))         { kind = 'telefon'; label = label || href.replace(/^tel:/i, ''); }
      else if (/^mailto:/i.test(href)) { kind = 'e-mail';  label = label || href.replace(/^mailto:/i, ''); }
      else { kind = (/^https?:/i.test(href) && el.host !== location.host) ? 'externí odkaz' : 'odkaz'; }
    } else if (tag === 'INPUT') {
      kind = 'volba';
      // nikdy hodnota pole — jen jeho popisek
      var lab = el.id && document.querySelector('label[for="' + el.id + '"]');
      label = label || (lab && lab.textContent) || el.name || el.id || el.type;
    } else if (tag === 'LABEL' || el.classList.contains('opt') || el.classList.contains('chip')) {
      kind = 'volba';
    }
    if (!label) label = el.innerText || el.textContent || el.id || tag.toLowerCase();
    return { l: clip(label, 60), k: kind };
  }

  // Klik na <label> prohlížeč zopakuje jako klik na přidružený input
  // (ať input obaluje, nebo je navázaný přes for=). Započítat jednou.
  var labelControl = null;
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(CLICKABLE) : null;
    if (!el) return;
    if (el.tagName === 'INPUT' && (el === labelControl || el.closest('label'))) { labelControl = null; return; }
    labelControl = el.tagName === 'LABEL' ? el.control : null;
    var d = describe(el);
    if (d.k === 'telefon') { S.calls += 1; soon(); }
    if (S.clicks.length < MAX_CLICKS) {
      S.clicks.push({ t: sec(), p: curPage(), l: d.l, k: d.k });
      dirty = true;
    }
  }, { capture: true, passive: true });

  /* ── formuláře ──────────────────────────────────────────────────────── */
  function form(id) {
    id = clip(id || 'formular', 30);
    if (!S.forms[id]) S.forms[id] = { open: -1, touch: -1, steps: {}, max: 0, err: 0, errs: {}, sent: -1, ok: null };
    return S.forms[id];
  }

  // Začal vyplňovat = první fokus do pole. Hodnoty se nečtou nikdy.
  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    if (el.type === 'hidden' || el.type === 'submit') return;
    var host = el.closest('[data-track-form]') || el.closest('form');
    if (!host) return;
    var f = form(host.getAttribute('data-track-form') || host.id);
    if (f.touch < 0) { f.touch = sec(); if (f.open < 0) f.open = f.touch; soon(); }
  }, true);

  var API = {
    // pushState nevyvolá hashchange ani popstate — SPA to musí ohlásit sama
    page: function () { addPage(); measureScroll(); soon(); },
    open: function (id) { var f = form(id); if (f.open < 0) { f.open = sec(); soon(); } if (id === 'kviz') legacyFunnel('otevreno'); },
    step: function (id, n, label) {
      var f = form(id); n = parseInt(n, 10) || 0;
      if (f.open < 0) f.open = sec();
      if (!(n in f.steps)) { f.steps[n] = sec(); if (label) f['l' + n] = clip(label, 30); }
      if (n > f.max) f.max = n;
      soon();
      if (id === 'kviz') legacyFunnel('krok-' + n);
    },
    error: function (id, field) {
      var f = form(id); f.err += 1;
      var k = clip(field || 'pole', 24); f.errs[k] = (f.errs[k] || 0) + 1;
      soon();
    },
    submit: function (id, ok, inquiryId) {
      var f = form(id);
      f.sent = sec(); f.ok = !!ok;
      if (ok) { S.lead = true; if (inquiryId) { S.inquiryId = clip(inquiryId, 40); f.inq = S.inquiryId; } }
      soon();
      if (id === 'kviz' && ok) legacyFunnel('lead');
    },
    event: function (name) {
      if (S.events.length < MAX_EVENTS) { S.events.push({ t: sec(), e: clip(name, 40), p: curPage() }); soon(); }
    }
  };

  function kt(cmd) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (API[cmd]) { try { API[cmd].apply(null, args); } catch (e) {} }
  }
  window.kt = kt;
  window.KTrack = { get id() { return S.id; }, off: false };

  /* ── životní cyklus ─────────────────────────────────────────────────── */
  addPage();
  measureScroll();
  addEventListener('hashchange', function () { addPage(); soon(); });
  addEventListener('popstate',   function () { addPage(); soon(); });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { measureScroll(); persist(); flush(true); }
  });
  addEventListener('pagehide', function () { measureScroll(); persist(); flush(true); });

  queue.forEach(function (a) { kt.apply(null, a); });
  persist();
  flush(false);
})();
