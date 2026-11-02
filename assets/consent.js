/* Souhlas s měřením návštěvnosti.
   Měření (assets/track.js) se načte až po souhlasu – ukládá stav návštěvy
   do sessionStorage, což podle § 89 odst. 3 zákona o elektronických
   komunikacích vyžaduje souhlas. Volba se pamatuje v localStorage
   (nezbytné úložiště). Odkaz s data-cookies kdekoli na stránce lištu znovu otevře. */
(function () {
  'use strict';
  var KEY = 'kp_consent';          // 'granted' | 'denied'
  var TRACK = '/assets/track.js';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadTracking() {
    if (document.querySelector('script[data-kt]')) return;
    var s = document.createElement('script');
    s.src = TRACK; s.defer = true; s.setAttribute('data-kt', '');
    document.head.appendChild(s);
  }

  var css = '.kc{position:fixed;z-index:1000;left:16px;right:16px;bottom:16px;max-width:460px;box-sizing:border-box;' +
    'padding:22px 22px 20px;background:#fffaf1;color:#1c1a17;border:2px solid #1c1a17;font:400 14px/1.55 Montserrat,system-ui,sans-serif;' +
    'transform:translateY(12px);opacity:0;transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .45s cubic-bezier(.16,1,.3,1)}' +
    '.kc.in{transform:none;opacity:1}' +
    '.kc h2{margin:0 0 8px;font:400 1.35rem/1.15 Gloock,Georgia,serif}' +
    '.kc p{margin:0;color:#5c564d}.kc p a{color:#1c1a17}' +
    '.kc-b{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
    '.kc button{flex:1 1 140px;min-height:46px;padding:10px 22px 10px 16px;border:2px solid #1c1a17;border-radius:0 9999px 9999px 0;' +
    'font:600 13px/1 Montserrat,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;background:none;color:#1c1a17}' +
    '.kc button.y{background:#1c1a17;color:#fffaf1}.kc button:hover{background:#0f3b2a;border-color:#0f3b2a;color:#2bd47f}' +
    '.kc button:focus-visible{outline:3px solid #0d6b3e;outline-offset:3px}' +
    '@media (prefers-reduced-motion:reduce){.kc{transition:none}}';

  function show() {
    if (document.querySelector('.kc')) return;
    if (!document.getElementById('kc-css')) {
      var st = document.createElement('style'); st.id = 'kc-css'; st.textContent = css; document.head.appendChild(st);
    }
    var box = document.createElement('div');
    box.className = 'kc'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'kc-t');
    box.innerHTML = '<h2 id="kc-t">Smím měřit návštěvnost?</h2>' +
      '<p>S vaším souhlasem zaznamenám, odkud jste přišli a co jste si na webu prohlédli. Bez jména, bez reklamních cookies a bez předávání dál. ' +
      '<a href="/gdpr.html#cookies">Podrobnosti</a></p>' +
      '<div class="kc-b"><button type="button" class="n">Odmítnout</button><button type="button" class="y">Povolit</button></div>';
    document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('in'); }); });
    box.querySelector('.y').onclick = function () { choose('granted', box); };
    box.querySelector('.n').onclick = function () { choose('denied', box); };
  }

  function choose(v, box) {
    var before = get();
    set(v);
    box.remove();
    if (v === 'granted') loadTracking();
    else if (before === 'granted') location.reload();   // zastaví již běžící měření
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cookies]');
    if (a) { e.preventDefault(); show(); }
  });

  var c = get();
  if (c === 'granted') loadTracking();
  else if (c !== 'denied') {
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  }
})();
