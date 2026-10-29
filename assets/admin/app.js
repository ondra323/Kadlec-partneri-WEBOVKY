// Kostra adminu: přihlášení, záložky, období, obnovování a všechny akce.
// Žádné inline onclick — každé tlačítko nese data-action a obslouží ho jeden posluchač.
import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase.js';
import { $, $$, toast, setBusy, html } from './util.js';
import * as An from './analytics.js';
import * as Inq from './inquiries.js';
import * as Art from './articles.js';
import * as Ln from './links.js';
import * as St from './stats.js';
import * as Zn from './portal.js';

const TABS = ['prehled', 'navstevy', 'poptavky', 'statistiky', 'odkazy', 'zona', 'clanky'];
const OPT_OUT_KEY = 'kt_off';
const state = { tab: 'prehled', days: readDays(), data: null, loadedDays: 0, filter: 'vse', loading: false };

function readDays() { try { return +localStorage.getItem('adm_days') || 7; } catch (e) { return 7; } }

/* ─── Přihlášení ─────────────────────────────────────────────────────────── */
onAuthStateChanged(auth, (user) => {
  $('#view-login').hidden = !!user;
  $('#view-app').hidden = !user;
  if (!user) { stopAuto(); return; }
  $('#who').textContent = user.email;
  // Návštěvy správce by zkreslovaly čísla — na tomto zařízení se nepočítají.
  try { if (localStorage.getItem(OPT_OUT_KEY) === null) localStorage.setItem(OPT_OUT_KEY, '1'); } catch (e) {}
  syncOptOut();
  goTab(location.hash.replace('#', ''), true);
  Inq.loadInquiries();
  Art.loadArticles();
  resetIdle();
  startAuto();
});

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-error');
  err.hidden = true;
  setBusy(true);
  try {
    await signInWithEmailAndPassword(auth, $('#login-email').value.trim(), $('#login-password').value);
  } catch (ex) {
    err.textContent = 'Přihlášení se nepovedlo. Zkontrolujte e-mail a heslo.';
    err.hidden = false;
    $('#login-password').select();
  } finally { setBusy(false); }
});

async function logout(reason) {
  if (!Art.closeEditor(reason === 'idle')) return;
  clearTimeout(idle.warn); clearTimeout(idle.out);
  await signOut(auth);
  if (reason === 'idle') { const err = $('#login-error'); err.textContent = 'Po 30 minutách nečinnosti jste byl odhlášen.'; err.hidden = false; }
}

/* ─── Nečinnost ──────────────────────────────────────────────────────────── */
const idle = { warn: 0, out: 0 };
function resetIdle() {
  clearTimeout(idle.warn); clearTimeout(idle.out);
  $('#idle-warn').hidden = true;
  idle.warn = setTimeout(() => { $('#idle-warn').hidden = false; }, 25 * 60000);
  idle.out  = setTimeout(() => { if (auth.currentUser) logout('idle'); }, 30 * 60000);
}
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((e) =>
  document.addEventListener(e, () => { if (auth.currentUser) resetIdle(); }, { passive: true }));

/* ─── Záložky a období ──────────────────────────────────────────────────── */
function goTab(tab, replace) {
  if (!TABS.includes(tab)) tab = 'prehled';
  if (!$('#editor').hidden && !Art.closeEditor()) return;
  state.tab = tab;
  TABS.forEach((t) => {
    $('#panel-' + t).hidden = t !== tab;
    const b = $('[data-tab="' + t + '"]');
    b.setAttribute('aria-selected', t === tab);
    b.tabIndex = t === tab ? 0 : -1;
  });
  history[replace ? 'replaceState' : 'pushState'](null, '', '#' + tab);
  if (tab === 'odkazy' && !$('#links-gen').innerHTML) $('#links-gen').innerHTML = Ln.renderGenerator();
  if (tab === 'prehled' || tab === 'navstevy' || tab === 'odkazy') ensureData();
  if (tab === 'poptavky') Inq.loadInquiries();
  if (tab === 'statistiky') St.ensure();
  if (tab === 'zona') Zn.ensure();
}
addEventListener('popstate', () => { if (auth.currentUser) goTab(location.hash.replace('#', ''), true); });

function syncRange() {
  $$('[data-action="range"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.days === state.days));
  $$('.range-label').forEach((el) => { el.textContent = An.rangeLabel(state.days); });
}

/* ─── Data návštěv (jedno načtení pro Přehled i Návštěvy) ───────────────── */
async function ensureData(force) {
  syncRange();
  if (!force && state.data && state.loadedDays === state.days) return render();
  if (state.loading) return;
  state.loading = true;
  $('#overview').setAttribute('aria-busy', 'true');
  if (!state.data) { $('#overview').innerHTML = '<p class="empty">Načítám návštěvy…</p>'; $('#sessions').innerHTML = '<p class="empty">Načítám…</p>'; }
  try {
    state.data = await An.loadData(state.days);
    state.loadedDays = state.days;
    $('#updated').textContent = 'aktualizováno ' + new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    render();
  } catch (e) {
    $('#overview').innerHTML = html`<p class="empty">Data se nepodařilo načíst: ${e.message}</p>`;
  } finally {
    state.loading = false;
    $('#overview').removeAttribute('aria-busy');
  }
}

function render() {
  const d = state.data; if (!d) return;
  if (d.mode === 'legacy') {
    $('#setup-slot').innerHTML = An.renderSetup();
    $('#overview').innerHTML = An.renderLegacy(d, state.days);
    $('#sessions').innerHTML = '<p class="empty">Seznam návštěv s jejich cestou se zobrazí, až bude v databázi povolená kolekce sessions — návod je v Přehledu.</p>';
    $('#links-perf').innerHTML = Ln.renderPerformance(d, state.days, An.rangeLabel);
    return;
  }
  $('#setup-slot').innerHTML = '';
  $('#overview').innerHTML = An.renderOverview(An.aggregate(d.sessions), state.days);
  renderSessions();
  $('#links-perf').innerHTML = Ln.renderPerformance(d, state.days, An.rangeLabel);
}

function renderSessions() {
  // otevřené cesty po obnovení zachovat
  const open = $$('.j-row:not([hidden])', $('#sessions')).map((r) => r.dataset.for);
  $('#sessions').innerHTML = An.renderSessions(state.data.sessions, state.filter);
  open.forEach((id) => toggleSessionRow(id, true));
}

function toggleSessionRow(id, forceOpen) {
  const row = $('tr[data-for="' + CSS.escape(id) + '"]');
  const head = $('tr.s-row[data-id="' + CSS.escape(id) + '"]');
  if (!row || !head) return;
  const show = forceOpen || row.hidden;
  row.hidden = !show;
  head.setAttribute('aria-expanded', show);
}

/* Přehled se sám obnovuje jednou za minutu, když je karta vidět
   (ukazatel „právě na webu" jinak rychle zastará). */
let auto = 0;
function startAuto() { stopAuto(); auto = setInterval(() => {
  if (document.visibilityState === 'visible' && ['prehled', 'navstevy', 'odkazy'].includes(state.tab)) ensureData(true);
}, 60000); }
function stopAuto() { clearInterval(auto); }

/* ─── Měření návštěv správce ─────────────────────────────────────────────── */
function optedOut() { try { return localStorage.getItem(OPT_OUT_KEY) === '1'; } catch (e) { return false; } }
function syncOptOut() {
  const b = $('#optout');
  const off = optedOut();
  b.setAttribute('aria-pressed', off);
  b.textContent = off ? 'Moje návštěvy se nepočítají' : 'Moje návštěvy se počítají';
}

/* ─── Bublina s detailem u sloupců ──────────────────────────────────────── */
const tip = $('#tip');
function showTip(el) {
  const t = el.getAttribute('data-tip'); if (!t) return;
  tip.textContent = t; tip.hidden = false;
  const r = el.getBoundingClientRect(), w = tip.offsetWidth;
  tip.style.left = Math.min(innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2)) + 'px';
  tip.style.top = (r.top + scrollY - tip.offsetHeight - 8) + 'px';
}
const hideTip = () => { tip.hidden = true; };
document.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-tip]'); if (el) showTip(el); else hideTip(); });
document.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tip]'); if (el) showTip(el); else hideTip(); });
addEventListener('scroll', hideTip, { passive: true });

/* ─── Akce ───────────────────────────────────────────────────────────────── */
const ACTIONS = {
  tab: (b) => goTab(b.dataset.tab),
  range: (b) => {
    state.days = +b.dataset.days;
    try { localStorage.setItem('adm_days', state.days); } catch (e) {}
    ensureData(true);
  },
  refresh: () => { ensureData(true); if (state.tab === 'poptavky') Inq.loadInquiries(); },
  'session-filter': (b) => { state.filter = b.dataset.filter; renderSessions(); },
  'toggle-journey': (b) => toggleSessionRow(b.dataset.id),
  'copy-rules': async (b) => {
    try { await navigator.clipboard.writeText(An.RULES); b.textContent = 'Zkopírováno'; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($('#rules-code')); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = 'Označeno — zkopírujte Cmd+C'; }
    setTimeout(() => { b.textContent = 'Zkopírovat pravidlo'; }, 2500);
  },
  'toggle-optout': () => {
    try { localStorage.setItem(OPT_OUT_KEY, optedOut() ? '0' : '1'); } catch (e) {}
    syncOptOut();
    toast(optedOut() ? 'Vaše návštěvy webu z tohoto zařízení se nebudou počítat.' : 'Vaše návštěvy z tohoto zařízení se budou počítat.');
  },
  'link-ch': (b) => Ln.setChannel(b.dataset.ch),
  'link-copy': (b) => Ln.copy(b.dataset.url, b),
  'link-qr': (b) => Ln.showQr(b.dataset.url, b.dataset.name),
  'qr-close': () => $('#qr-dialog').close(),
  'stat-range': (b) => St.setDays(+b.dataset.days),
  'stat-refresh': () => St.ensure(true),
  'stat-summary': (b) => St.copySummary(b),
  'stat-png': (b) => St.exportPng(b.dataset.chart),
  'stat-csv': (b) => St.exportCsv(b.dataset.chart),
  'cost-del': (b) => St.delCost(b.dataset.id),
  'zona-range': (b) => Zn.setDays(+b.dataset.days),
  'zona-refresh': () => Zn.ensure(true),
  'zona-toggle': (b) => Zn.toggle(b.dataset.email),
  'purge-old': (b) => Zn.purgeOld(b),
  'zona-rules': async (b) => { try { await navigator.clipboard.writeText(Zn.RULES); b.textContent = 'Zkopírováno'; } catch (e) { b.textContent = 'Označte a zkopírujte ručně'; } },
  logout: () => logout(),
  'inq-done': (b) => Inq.markDone(b.dataset.id),
  'inq-delete': (b) => Inq.remove(b.dataset.id),
  'inq-journey': (b) => Inq.toggleJourney(b.dataset.id, b),
  'art-new': () => Art.openEditor(null),
  'art-edit': (b) => Art.openEditor(b.dataset.id),
  'art-delete': (b) => Art.removeArticle(b.dataset.id),
  'art-back': () => Art.closeEditor(),
  'art-save': () => Art.saveArticle(),
  'art-status': (b) => Art.setStatus(b.dataset.status),
  'img-tab': (b) => Art.switchImgTab(b.dataset.img),
  'img-pick': () => $('#img-file-input').click(),
  'img-remove': () => Art.removeImage()
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-action]');
  if (!b || b.disabled) return;
  const fn = ACTIONS[b.dataset.action];
  if (fn) { e.preventDefault(); fn(b); }
});

// řádky návštěv a záložky ovladatelné klávesnicí
document.addEventListener('keydown', (e) => {
  const row = e.target.closest && e.target.closest('tr.s-row');
  if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (row.dataset.email) Zn.toggle(row.dataset.email); else toggleSessionRow(row.dataset.id); return; }
  const tabBtn = e.target.closest && e.target.closest('[role="tab"]');
  if (tabBtn && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const i = TABS.indexOf(tabBtn.dataset.tab);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
    goTab(next); $('[data-tab="' + next + '"]').focus();
  }
  if (e.key === 's' && (e.metaKey || e.ctrlKey) && !$('#editor').hidden) { e.preventDefault(); Art.saveArticle(); }
});

$('#f-crosssell').addEventListener('change', Art.previewCta);
document.addEventListener('input', (e) => { if (e.target.id === 'link-tag') Ln.setTag(e.target.value); });
document.addEventListener('submit', (e) => { if (e.target.id === 'cost-form') { e.preventDefault(); St.addCost(e.target); } });
$('#img-url-input').addEventListener('input', Art.imageFromUrl);
$('#img-file-input').addEventListener('change', (e) => Art.imageFromFile(e.target));
addEventListener('beforeunload', (e) => { if (Art.isDirty()) { e.preventDefault(); e.returnValue = ''; } });
