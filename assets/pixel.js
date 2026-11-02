/* Meta Pixel – PageView na každé stránce, Lead po odeslání poptávky (konzultace.html).
   Pixel se nenačte, dokud není vyplněné ID níže (Meta Business → Events Manager → Zdroje dat). */
(function () {
  'use strict';
  var PIXEL_ID = '';

  if (!PIXEL_ID) return;
  try { if (localStorage.getItem('kt_off') === '1') return; } catch (e) {}   // admin
  if (/[?&]nahled\b/.test(location.search)) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
})();
