/* lib/about/about.js — the About page's entry (a module, so nothing lands on window). The page's template renders
   inside the x-dc element once support.js has React; until then an inert copy of it sits in the DOM (hidden), and
   support.js then replaces it. So the host is selected with :not(x-dc *) — only the rendered one is ever wired —
   through FY.mount when site.js provides it, else a small wait of our own. Needs motion.js, pen.js, pen-tier.js. */
import { Rig } from './rig.js';
import { Hands } from './hands.js';
import { contacts } from './card.js';

function whenPresent(sel, fn) {
  if (window.FY && typeof FY.mount === 'function') return FY.mount(sel, function (el) { fn(el || document.querySelector(sel)); });
  var el = document.querySelector(sel);
  if (el) return fn(el);
  var mo = new MutationObserver(function () { var n = document.querySelector(sel); if (n) { mo.disconnect(); fn(n); } });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

whenPresent('[data-mount="about"]:not(x-dc *)', function (root) {
  if (root.dataset.wired) return;
  root.dataset.wired = '1';
  Hands(Rig(root), root);
  contacts(root);
});
