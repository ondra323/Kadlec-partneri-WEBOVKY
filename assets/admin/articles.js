// Články: seznam a editor. Datový model i vložený CTA blok jsou beze změny
// proti původnímu adminu, aby šly upravovat i dřív uložené články.
import { db, storage, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
         query, orderBy, storageRef, uploadBytes, getDownloadURL } from './firebase.js';
import { html, raw, $, toDate, num, toast, setBusy } from './util.js';

let quill = null, all = [], currentId = null, currentStatus = 'published', currentImage = '', dirty = false;

/* Texty CTA bloků, které se vkládají do článků na blogu. Hlas je první osoba
   a slovo „zdarma" se nepoužívá — láká lidi, kteří nemají co řešit (PRODUCT.md). */
const CTA = {
  hypoteky:  { text: 'Chcete poradit s hypotékou? Spočítám vám, která varianta dává smysl.', btn: 'Domluvit konzultaci', href: '/index.html?popup=Hypotéka' },
  investice: { text: 'Zajímá vás, jak zhodnotit úspory? Vyzkoušejte investiční kalkulačku.',  btn: 'Otevřít kalkulačku',  href: '/index.html#investice' },
  penze:     { text: 'Plánujete klidné stáří? Spočítejte si, kolik budete potřebovat.',      btn: 'Penzijní kalkulačka', href: '/index.html#penze' },
  uvery:     { text: 'Potřebujete úvěr? Porovnám nabídky z celého trhu.',                    btn: 'Spočítat splátku',    href: '/index.html#uvery' },
  pojisteni: { text: 'Chcete mít jistotu, že je vaše rodina a majetek chráněn?',              btn: 'Domluvit konzultaci', href: '/index.html?popup=Pojištění' },
  kontakt:   { text: 'Máte otázky ke svým financím? Rád se na ně podívám.',                   btn: 'Napište mi',          href: 'mailto:kadlec.ondrej@insia.com' }
};

/* Markup bloku zůstává přesně jako dřív: saveArticle podle začátku
   `<div style="background:#113225` starý blok najde a nahradí novým. */
function ctaHtml(key) {
  const c = CTA[key]; if (!c) return '';
  return '<div style="background:#113225;padding:32px;margin-top:32px;text-align:center"><p style="font-family:Playfair Display,serif;font-size:1.2rem;color:#F9F7F3;margin-bottom:16px;line-height:1.4">' + c.text + '</p><a href="' + c.href + '" target="_blank" rel="noopener" style="display:inline-block;padding:14px 32px;background:#b5935a;color:#113225;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none">' + c.btn + '</a></div>';
}

/* ─── Seznam ─────────────────────────────────────────────────────────────── */
export async function loadArticles() {
  const box = $('#articles');
  try {
    const snap = await getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc')));
    all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList();
  } catch (e) { box.innerHTML = html`<p class="empty">Články se nepodařilo načíst: ${e.message}</p>`; }
}

function renderList() {
  const pub = all.filter((a) => a.status === 'published').length;
  const views = all.reduce((s, a) => s + (a.views || 0), 0);
  $('#articles-meta').textContent = all.length
    ? `${all.length} článků · ${pub} publikováno · ${all.length - pub} konceptů · ${num(views)} zobrazení`
    : '';
  const box = $('#articles');
  if (!all.length) { box.innerHTML = '<p class="empty">Zatím žádný článek.</p>'; return; }
  const rows = all.map((a) => html`<tr>
      <td><strong>${a.title || '(bez názvu)'}</strong><div class="s-sub">${a.category || ''}</div></td>
      <td class="t-num">${num(a.views || 0)}</td>
      <td class="t-nowrap">${toDate(a.createdAt) ? toDate(a.createdAt).toLocaleDateString('cs-CZ') : '—'}</td>
      <td>${a.status === 'published' ? raw('<span class="chip chip-good">● Publikováno</span>') : raw('<span class="chip chip-quiet">Koncept</span>')}</td>
      <td class="t-actions">
        <button class="btn btn-small" data-action="art-edit" data-id="${a.id}">Upravit</button>
        <button class="btn btn-small btn-ghost" data-action="art-delete" data-id="${a.id}">Smazat</button>
      </td>
    </tr>`).join('');
  box.innerHTML = html`<div class="table-wrap"><table class="data">
    <thead><tr><th scope="col">Název</th><th scope="col" class="t-num">Zobrazení</th><th scope="col">Vytvořeno</th><th scope="col">Stav</th><th scope="col"><span class="sr-only">Akce</span></th></tr></thead>
    <tbody>${raw(rows)}</tbody></table></div>`;
}

export async function removeArticle(id) {
  const a = all.find((x) => x.id === id);
  if (!confirm('Smazat článek „' + ((a && a.title) || '') + '"? Nejde to vrátit.')) return;
  setBusy(true);
  try { await deleteDoc(doc(db, 'articles', id)); toast('Článek smazán.'); await loadArticles(); }
  catch (e) { toast('Smazání selhalo: ' + e.message, 'err'); }
  finally { setBusy(false); }
}

/* ─── Editor ─────────────────────────────────────────────────────────────── */
export const isDirty = () => dirty;

export function openEditor(id) {
  $('#panels').hidden = true;
  $('#editor').hidden = false;
  window.scrollTo(0, 0);
  currentId = id || null; currentImage = '';

  if (!quill) {
    quill = new window.Quill('#quill-editor', {
      theme: 'snow', placeholder: 'Začněte psát text článku…',
      modules: { toolbar: { container: [[{ header: [2, 3, false] }], ['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'link', 'image'], ['clean']],
                            handlers: { image: quillImage } } }
    });
    quill.on('text-change', () => { dirty = true; });
    ['#f-title', '#f-excerpt', '#f-category', '#f-crosssell', '#img-url-input'].forEach((s) => $(s).addEventListener('input', () => { dirty = true; }));
  }

  const a = id ? all.find((x) => x.id === id) : null;
  $('#editor-heading').textContent = a ? 'Upravit článek' : 'Nový článek';
  $('#f-title').value = a ? a.title || '' : '';
  $('#f-excerpt').value = a ? a.excerpt || '' : '';
  $('#f-category').value = a ? a.category || 'Hypotéky' : 'Hypotéky';
  $('#f-crosssell').value = a ? a.crossSell || '' : '';
  currentImage = a ? a.imageUrl || '' : '';
  $('#img-url-input').value = currentImage;
  quill.root.innerHTML = a ? a.content || '' : '';
  setStatus(a ? a.status || 'published' : 'published');
  showImage(currentImage); previewCta();
  $('#save-feedback').textContent = '';
  dirty = false;
  $('#f-title').focus();
}

export function closeEditor(force) {
  if (!force && dirty && !confirm('Máte neuložené změny. Opravdu odejít bez uložení?')) return false;
  $('#editor').hidden = true;
  $('#panels').hidden = false;
  dirty = false;
  return true;
}

export function setStatus(s) {
  currentStatus = s;
  $('#status-published').setAttribute('aria-pressed', s === 'published');
  $('#status-draft').setAttribute('aria-pressed', s === 'draft');
  dirty = true;
}

export function switchImgTab(tab) {
  ['upload', 'url'].forEach((t) => {
    $('#img-panel-' + t).hidden = t !== tab;
    $('#img-tab-' + t).setAttribute('aria-pressed', t === tab);
  });
}

// Obrázek náhledu vzniká až s adresou — element bez src je nevalidní HTML
function showImage(url) {
  const slot = $('#img-preview-slot'), rm = $('#img-remove');
  rm.hidden = !url;
  if (!url) { slot.replaceChildren(); return; }
  let img = slot.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    img.className = 'img-preview';
    img.alt = 'Náhled obrázku článku';
    slot.appendChild(img);
  }
  img.src = url;
}
export function removeImage() { currentImage = ''; $('#img-url-input').value = ''; showImage(''); dirty = true; }
export function imageFromUrl() {
  const url = $('#img-url-input').value.trim();
  if (/^https?:\/\//.test(url)) { currentImage = url; showImage(url); }
}

async function upload(file) {
  if (file.size > 2 * 1024 * 1024) { toast('Obrázek je větší než 2 MB.', 'err'); return null; }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast('Povolené formáty: JPG, PNG, WebP.', 'err'); return null; }
  setBusy(true);
  try {
    const name = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const r = storageRef(storage, 'images/' + name);
    await uploadBytes(r, file, { contentType: file.type });
    return await getDownloadURL(r);
  } catch (e) { toast('Nahrání selhalo: ' + e.message, 'err'); return null; }
  finally { setBusy(false); }
}
export async function imageFromFile(input) {
  const f = input.files && input.files[0]; if (!f) return;
  const url = await upload(f);
  if (url) { currentImage = url; showImage(url); dirty = true; }
  input.value = '';
}
function quillImage() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp';
  input.onchange = async () => {
    const f = input.files && input.files[0]; if (!f) return;
    const url = await upload(f); if (!url) return;
    const r = quill.getSelection(true);
    quill.insertEmbed(r.index, 'image', url); quill.setSelection(r.index + 1);
  };
  input.click();
}

export function previewCta() {
  const c = CTA[$('#f-crosssell').value], box = $('#cta-preview');
  box.hidden = !c;
  if (c) { $('#cta-preview-text').textContent = c.text; $('#cta-preview-btn').textContent = c.btn; }
}

export async function saveArticle() {
  const fb = $('#save-feedback');
  const title = $('#f-title').value.trim();
  if (!title) { fb.textContent = 'Nadpis je povinný.'; fb.className = 'feedback err'; $('#f-title').focus(); return; }
  const key = $('#f-crosssell').value;
  const content = quill.root.innerHTML.replace(/<div style="background:#113225[^]*?<\/div><\/div>/g, '');
  const data = { title, excerpt: $('#f-excerpt').value.trim(), category: $('#f-category').value,
                 imageUrl: currentImage, content: content + ctaHtml(key), crossSell: key, status: currentStatus };
  const btn = $('#btn-save'); btn.disabled = true; setBusy(true);
  try {
    if (currentId) {
      data.updatedAt = serverTimestamp();
      await updateDoc(doc(db, 'articles', currentId), data);
    } else {
      data.createdAt = data.updatedAt = serverTimestamp();
      data.publishedAt = currentStatus === 'published' ? serverTimestamp() : null;
      const ref = await addDoc(collection(db, 'articles'), data);
      currentId = ref.id;
      $('#editor-heading').textContent = 'Upravit článek';
    }
    dirty = false;
    fb.textContent = 'Uloženo ' + new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    fb.className = 'feedback ok';
    loadArticles();
  } catch (e) {
    fb.textContent = 'Uložení selhalo: ' + e.message; fb.className = 'feedback err';
  } finally { btn.disabled = false; setBusy(false); }
}
