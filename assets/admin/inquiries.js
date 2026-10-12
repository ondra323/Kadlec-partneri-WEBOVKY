// Poptávky: seznam, vyřízení, smazání a dohledání cesty návštěvníka.
import { db, collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, isDenied } from './firebase.js';
import { html, raw, $, toDate, when, toast } from './util.js';
import { sessionForInquiry, renderJourney } from './analytics.js';

let cache = [];

export async function loadInquiries() {
  const box = $('#inquiries');
  box.innerHTML = '<p class="empty">Načítám…</p>';
  try {
    const snap = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(300)));
    cache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
  } catch (e) {
    box.innerHTML = html`<p class="empty">Poptávky se nepodařilo načíst${isDenied(e) ? ' — chybí oprávnění.' : ': ' + e.message}</p>`;
  }
  return cache;
}

export const newCount = () => cache.filter((i) => i.status === 'new').length;

function telHref(p) { return 'tel:' + String(p || '').replace(/[^\d+]/g, ''); }

function render() {
  const box = $('#inquiries');
  updateBadge();
  if (!cache.length) { box.innerHTML = '<p class="empty">Zatím žádná poptávka.</p>'; return; }

  const rows = cache.map((i) => {
    const isNew = i.status === 'new';
    const contact = [
      i.phone ? html`<a href="${telHref(i.phone)}">${i.phone}</a>` : '',
      i.email ? html`<a href="mailto:${i.email}">${i.email}</a>` : ''
    ].filter(Boolean).join('<br>') || '<span class="muted">—</span>';
    return html`
      <tr class="${isNew ? 'is-new' : ''}">
        <td><strong>${i.name || '—'}</strong>${i.source ? raw(html`<div class="s-sub">${i.source}</div>`) : ''}</td>
        <td>${raw(contact)}</td>
        <td><span class="chip">${i.service || '—'}</span>${i.term ? raw(html`<div class="s-sub">volat: ${i.term}</div>`) : ''}</td>
        <td class="t-nowrap">${when(toDate(i.createdAt))}</td>
        <td>${isNew ? raw('<span class="chip chip-good">● Nová</span>') : raw('<span class="chip chip-quiet">Vyřízeno</span>')}</td>
        <td class="t-actions">
          <button class="btn btn-small" data-action="inq-journey" data-id="${i.id}">Cesta</button>
          ${isNew ? raw(html`<button class="btn btn-small btn-primary" data-action="inq-done" data-id="${i.id}">Vyřízeno</button>`) : ''}
          <button class="btn btn-small btn-ghost" data-action="inq-delete" data-id="${i.id}" aria-label="Smazat poptávku od ${i.name || 'neznámého'}">Smazat</button>
        </td>
      </tr>
      ${i.note ? raw(html`<tr class="note-row"><td colspan="6"><span class="note-k">Poznámka</span> ${i.note}</td></tr>`) : ''}
      <tr class="j-row" data-for-inq="${i.id}" hidden><td colspan="6"></td></tr>`;
  }).join('');

  box.innerHTML = html`<div class="table-wrap"><table class="data inquiries">
    <thead><tr><th scope="col">Jméno</th><th scope="col">Kontakt</th><th scope="col">Služba</th><th scope="col">Kdy</th><th scope="col">Stav</th><th scope="col"><span class="sr-only">Akce</span></th></tr></thead>
    <tbody>${raw(rows)}</tbody></table></div>`;
}

export function updateBadge() {
  const b = $('#badge-inquiries'); if (!b) return;
  const n = newCount();
  b.textContent = n > 99 ? '99' : n;
  b.setAttribute('aria-label', n + ' nových poptávek');
  b.hidden = !n;
}

export async function markDone(id) {
  try {
    await updateDoc(doc(db, 'inquiries', id), { status: 'processed' });
    const i = cache.find((x) => x.id === id); if (i) i.status = 'processed';
    render(); toast('Označeno jako vyřízené.');
  } catch (e) { toast('Nepodařilo se uložit: ' + e.message, 'err'); }
}

export async function remove(id) {
  const i = cache.find((x) => x.id === id);
  if (!confirm('Smazat poptávku' + (i && i.name ? ' od ' + i.name : '') + '? Nejde to vrátit.')) return;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
    cache = cache.filter((x) => x.id !== id);
    render(); toast('Poptávka smazána.');
  } catch (e) { toast('Smazání selhalo: ' + e.message, 'err'); }
}

export async function toggleJourney(id, btn) {
  const row = document.querySelector('tr[data-for-inq="' + CSS.escape(id) + '"]');
  if (!row) return;
  if (!row.hidden) { row.hidden = true; btn.setAttribute('aria-expanded', 'false'); return; }
  row.hidden = false; btn.setAttribute('aria-expanded', 'true');
  const cell = row.firstElementChild;
  if (cell.dataset.loaded) return;
  cell.innerHTML = '<p class="empty">Hledám návštěvu…</p>';
  try {
    const s = await sessionForInquiry(id);
    cell.dataset.loaded = '1';
    cell.innerHTML = s ? renderJourney(s)
      : '<p class="empty">K této poptávce návštěva není. Buď vznikla dřív, než web začal měřit cestu, nebo databáze zatím nepouští kolekci sessions (návod je v Přehledu).</p>';
  } catch (e) {
    cell.innerHTML = html`<p class="empty">${isDenied(e) ? 'Cesty návštěvníků se ukážou, až bude v databázi povolená kolekce sessions — návod je v Přehledu.' : 'Chyba: ' + e.message}</p>`;
  }
}
