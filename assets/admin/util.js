// Drobnosti sdílené všemi moduly adminu.

/** Vše, co přišlo z webu (jméno, poznámka, štítek kliku…), jde do HTML jen přes esc().
 *  Dřív se to vkládalo přes innerHTML napřímo — kdokoli mohl do formuláře poslat
 *  <img onerror=…> a spustit kód v přihlášeném adminu. */
export function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Šablona, která escapuje každou dosazenou hodnotu. Hotové HTML se předá přes raw(). */
export function html(strings, ...vals) {
  return strings.reduce((out, s, i) => {
    if (i >= vals.length) return out + s;
    const v = vals[i];
    const part = v && v.__raw !== undefined ? v.__raw
      : Array.isArray(v) ? v.map((x) => (x && x.__raw !== undefined ? x.__raw : esc(x))).join('')
      : esc(v);
    return out + s + part;
  }, '');
}
export const raw = (s) => ({ __raw: String(s) });

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const toDate = (ts) => (ts && typeof ts.toDate === 'function' ? ts.toDate() : (ts instanceof Date ? ts : null));

const nf = new Intl.NumberFormat('cs-CZ');
export const num = (n) => nf.format(Math.round(n || 0));
export const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** 47 → „47 s", 135 → „2 min 15 s", 3700 → „1 h 1 min" */
export function dur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  if (sec < 60) return sec + ' s';
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return m + ' min' + (s ? ' ' + s + ' s' : '');
  return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
}
/** Časová značka uvnitř návštěvy: 0:07, 2:15 */
export function clock(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

export function when(d) {
  if (!d) return '—';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  const t = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  if (d >= today) return 'dnes ' + t;
  if (d >= yest)  return 'včera ' + t;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) + ' ' + t;
}

export function median(arr) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y), m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

export function countBy(list, keyFn) {
  const m = new Map();
  list.forEach((x) => { const k = keyFn(x); if (k == null || k === '') return; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Krátká hláška v rohu (místo alert()). */
export function toast(msg, kind = 'ok') {
  let box = $('#toast');
  if (!box) { box = document.createElement('div'); box.id = 'toast'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  box.textContent = msg;
  box.className = 'toast on ' + kind;
  clearTimeout(box._t);
  box._t = setTimeout(() => { box.className = 'toast'; }, 4200);
}

export function setBusy(on) { const l = $('#loading'); if (l) l.classList.toggle('on', !!on); }
