/* Reading's entry module: once the DC article exists, the bus pours the essay in, then the hero, the pencil margin,
   the footnotes (model, phone slip, pen), the pen's states and the shelf at the end attach to it. */
import { start } from './bus.js';
import { initHero } from './hero.js';
import { initRail } from './rail.js';
import { prepare } from './notes.js';
import { initPenNote } from './pen-note.js';
import { Slip } from './slip.js';
import { initStates } from './states.js';
import { initShelf } from './shelf.js';

start((ctx) => {
  initRail(ctx);          // first: its phone counter settles its width before the hero measures the nav title's slot
  initHero(ctx);
  const model = prepare(ctx);
  initPenNote(ctx, model, Slip(ctx));
  initStates();
  initShelf(ctx);
});
