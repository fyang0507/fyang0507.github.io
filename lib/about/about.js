/* lib/about/about.js — the About page's entry (a module, so nothing lands on window). The page's template renders
   inside the x-dc element once support.js has React; FY.mount (site.js) waits for the rendered host.
   Needs motion.js, pen.js, pen-tier.js, site.js. */
import { Rig } from './rig.js';
import { Hands } from './hands.js';
import { contacts } from './card.js';

FY.mount('[data-mount="about"]', function (root) {
  if (root.dataset.wired) return;
  root.dataset.wired = '1';
  Hands(Rig(root), root);
  contacts(root);
});
