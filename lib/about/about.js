/* lib/about/about.js — the About page's entry (a module, so nothing lands on window). The page's template renders
   inside the x-dc element once support.js has React, so the card is wired through FY.mount (site.js), which waits
   for the rendered host and calls this once per element. Needs motion.js, pen.js, pen-tier.js, site.js. */
import { Rig } from './rig.js';
import { Hands } from './hands.js';
import { contacts } from './card.js';

FY.mount('[data-mount="about"]', function (root) {
  Hands(Rig(root), root);
  contacts(root);
});
