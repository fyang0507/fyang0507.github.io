// v1.1's single take: take.mjs with Demos (#37) between Principles and the way back, the pointer left to the film
// (record with CURSOR=0), and the seal and the footnote also shot at DPR 3 for their close-ups.
// The single take: one visit, one session, real input, on the virtual clock. Every beat is at an absolute time
// (s.until), so the before side (6237120) does the same thing at the same moment. The after side is shot whole;
// the before side only shoots its seven lift windows (the page lifted to show the old site's same click), and
// between them takes whatever real route keeps it on the matching page.
// Footage time, after side (film time adds the lifts and replays; see film/v1):
//   0 home, first visit: the OP, the objects fall, the motto and the seals  ·  7.4 the book: the desk becomes the nav
//   (180 fps)  ·  Writing: EN, the latest essay pulled, its cover  ·  13 → Reading (a same-tab cut: the film's match
//   cut)  ·  the hero dissolves, the title flies  ·  a footnote  ·  22.1 the building tab  ·  the flower, one fling
//   ·  27.7 the card into your hand, the dossier  ·  30.5 03: #35's tabs fly (180 fps), the rail  ·  down the rail
//   ·  37.3 the way back  ·  40.5 shooting: the prints develop  ·  the pass  ·  46.1 the print, peg and all  ·  back
//   ·  51 about: the sleeve, the lip, the tilt  ·  58.7 home: the nav falls back into a desk (180 fps)
export const init = () => {
  let a = 2 >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  document.addEventListener('opx:done', () => { window.__opx = performance.now(); });
};
const POST = '2026-08-29_google-just-wants-to-coast-to-a-win';
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
// the before side shoots only around its lifts
const LIFTS = { seals: 3.4, flight: 7.4, building: 23.1, card: 28.7, back: 46.00, print: 54.80, home: 67.40 };
export const lifts = LIFTS;

export default async (s) => {
  const A = s.after;
  const win = async (name) => { if (A) return; await s.until(LIFTS[name] - 0.45); s.shoot(true); s.beat('lift-' + name, 'the before\'s window', 'lift'); };
  const endWin = async (name) => { if (A) return; await s.until(LIFTS[name] + 1.25); s.shoot(false); };
  const pt = (fn, arg) => s.eval(fn, arg);
  s.shoot(A);
  // ---- home, first visit
  s.beat('home', 'a fresh session opens home', 'nav');
  await s.go('index.html');
  await win('seals');
  if (A) s.region('seal', [40, 18, 230, 110], 3);
  await s.until(4.6);
  const opx = await pt(() => window.__opx || null);
  if (opx) s.beats.push({ t: opx / 1000, name: 'op-done', what: 'the OP ends: the motto is written, then the seals stamped', kind: 'event' });
  await endWin('seals');
  await s.until(6.0);
  if (A) s.region(null);
  const book = await s.box(A ? '.hot.hot-book' : '.hot.bookwrap');
  await s.move(...mid(book), 0.9);
  await s.until(7.3);
  await win('flight');
  if (A) s.fps(180);
  s.beat('click-book', 'the book: after, the desk becomes the nav; before, a hard cut', 'click');
  await s.clickNav(null, null);
  await s.until(8.6); s.fps(60);
  await endWin('flight');
  // ---- Writing
  await s.until(9.3);
  if (A) {
    const en = await pt(() => { const b = document.querySelector('.lang-b[data-lang="en"]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await s.move(...en, 0.8); await s.until(10.1); s.beat('switch-en', '中文 → EN: the spines retitle', 'click'); await s.click(null, null);
  }
  await s.until(11.0);
  const spine = await pt(({ post, A }) => {
    const e = A ? document.querySelector(`.bk-hit[data-post="${post}"]`) : [...document.querySelectorAll('.shelf-row a.book, a.book')].find((a) => (a.getAttribute('href') || '').includes(post));
    if (!e) return [640, 600]; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .35];
  }, { post: POST, A });
  await s.move(...spine, 0.8); s.beat('pull-book', 'the latest essay pulled toward you, its cover turned out under the obi', 'hover');
  await s.until(13.0);
  s.beat('open-book', 'the book in your hand opens Reading (a same-tab cut on the site)', 'click');
  await s.clickNav(null, null);
  // ---- Reading
  await s.until(14.0);
  await s.move(1238, 640, 0.3);
  s.beat('scroll-hero', 'off the cover: the hero dissolves into halftone, the title flies into the header', 'scroll');
  await s.wheel(600, 3.0);
  await s.until(17.5);
  await s.wheel(560, 1.0);
  await s.until(18.6);
  const fn = await pt(() => { const a = [...document.querySelectorAll('.fnref a, sup a, a[href^="#fn"]')].find((x) => x.offsetParent && x.getBoundingClientRect().top > 160 && x.getBoundingClientRect().top < 880); if (!a) return null; const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  if (A) s.region('footnote', [270, 400, 840, 480], 3);
  if (fn) { await s.move(...fn, 0.7); s.beat('footnote', 'a footnote: the pen brackets the claim, loops the number, the slip is tugged over', 'hover'); }
  await s.until(21.00);
  if (A) s.region(null);
  // back up to the page's head, where the nav is (Reading's compact header has none)
  s.beat('to-top', 'back up to the head of the page', 'scroll');
  const up = await pt(() => scrollY); await s.wheel(-up, 0.9);
  await s.until(22.00);
  // ---- the building tab
  const bt = mid(await s.box('.site-tab--building'), .5, .45);
  await s.move(...bt, 0.8);
  await s.until(22.95);
  await win('building');
  s.beat('click-building', 'building: after, the tab move and the board arriving, the flower pressed; before, a hard cut', 'nav');
  await s.clickNav(null, null);
  await s.until(24.80);
  await endWin('building');
  await s.until(25.00);
  await s.move(1060, 890, 0.5);
  s.beat('fling', 'the board flung, and brought back: the cards swing on their pins', 'drag');
  if (A) {
    await s.press(); await s.hold(0.08); await s.move(560, 880, 0.5); await s.release();
    await s.until(26.3);
    await s.press(); await s.hold(0.08); await s.move(1100, 885, 0.5); await s.release();
  }
  await s.until(27.2);
  let card = await s.box(A ? '.slot--lead .unpin-trigger' : '.card-slot--highlighted .highlighted-title');
  if (A && card && (card.x < 60 || card.x + card.width > 1240)) {
    // the board's own arrow brings the lead card back into view
    const arrow = await s.eval(() => { const b = [...document.querySelectorAll('button')].find((x) => /←|prev/i.test(x.textContent + (x.getAttribute('aria-label') || ''))); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    if (arrow) { await s.click(...arrow, 0.3); await s.hold(0.6); card = await s.box('.slot--lead .unpin-trigger'); }
  }
  await s.move(...(card ? mid(card, .45, .55) : [300, 650]), 0.7);
  await s.until(28.55);
  await win('card');
  s.beat('take-card', 'after: the pin pops, the card comes to your hand, the dossier slides out; before: a hard cut into the old field notes', 'click');
  if (A) await s.click(null, null); else await s.clickNav(null, null);
  await s.until(30.00);
  await endWin('card');
  // ---- 03: the tabs fly to the chapter's fore-edge (#35), the rail
  await s.until(30.60);
  if (A) {
    const tab = mid(await (await s.page.$$('.dos-tabs .dos-tab'))[2].boundingBox());
    await s.move(...tab, 0.7);
    await s.until(31.35); s.fps(180);
    s.beat('open-principles', 'the tabs fly to the chapter\'s fore-edge (#35), the rail is drawn', 'nav');
    await s.clickNav(null, null);
    await s.until(32.50); s.fps(60);
    await s.until(34.00);
    await s.move(700, 640, 0.3);
    s.beat('down-rail', 'down the chapter: the graphite follows, the loop moves down the rail', 'scroll');
    await s.wheel(1800, 2.4);
    // 05 demos on the fore-edge: #35's chapter move, the sheet in front pulled aside
    await s.until(36.90);
    const demo = mid(await (await s.page.$('.pj-tabs .dos-tab[href$="demos.html"]')).boundingBox());
    await s.move(...demo, 0.6);
    await s.until(37.55);
    s.beat('open-demos', '05 demos: the chapter move, the sheet in front pulled aside', 'nav');
    await s.clickNav(null, null);
    await s.until(38.90);
    const vy = await pt(() => Math.round(document.getElementById('trash-patrol-viewer').getBoundingClientRect().top - 150));
    await s.move(700, 640, 0.2);
    await s.wheel(vy, 0.8);
    await s.until(40.00);
    // the capture's own token for region 1: noticed (the pen's coral corners), chosen (the enlargement), stepped, put back
    const tok = mid(await s.box('#trash-patrol-viewer .rg-m[data-n="1"]'));
    await s.move(...tok, 0.5);
    s.beat('corners', 'a region noticed: the pen marks its four corners in coral', 'hover');
    await s.until(40.90);
    s.beat('enlarge', 'chosen: the enlargement grows out of the region\'s own place over the capture, its corners in coral', 'click');
    await s.click(null, null);
    await s.until(41.75);
    const nx = await s.box('#trash-patrol-viewer .zm-next, .zm-next');
    if (nx) await s.move(...mid(nx), 0.4);
    await s.until(42.20);
    s.beat('step', 'N →: the capture pans under the window to the next region, its note sliding in', 'click');
    if (nx) await s.click(null, null); else await s.key('ArrowRight', 'ArrowRight', 39);
    await s.until(42.95);
    const px = await s.box('#trash-patrol-viewer .zm-x, .zm-x');
    if (px) await s.move(...mid(px), 0.4);
    await s.until(43.40);
    s.beat('put-back', 'put it back · 放回: the opening reversed, landing on the capture pixel for pixel', 'click');
    if (px) await s.click(null, null); else await s.key('Escape', 'Escape', 27);
    await s.until(44.10);
    s.beat('to-top', 'back up to the nav', 'scroll');
    const up2 = await pt(() => scrollY); await s.wheel(-up2, 0.8);
    await s.until(45.00);
  } else {
    await s.until(45.10);
  }
  const back = await pt((A) => {
    const vis = (a) => { const r = a.getBoundingClientRect(); return r.width && r.top > 60 && r.bottom < innerHeight - 10; };
    // after: any link from a project's page to the board is the way back (transitions.js hands it to FYProject)
    const a = A ? document.querySelector('.site-tab--building') : [...document.querySelectorAll('a[href*="Building.dc.html"]')].filter(vis).pop();
    if (!a) return null; const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * (A ? .45 : .5)];
  }, A);
  await s.move(...(back || [640, 100]), 0.7);
  await s.until(45.85);
  await win('back');
  s.beat('way-back', 'after: the way back, the card brought into view, the tabs tuck under it, the pin pressed in; before: a hard cut', 'nav');
  if (back) await s.clickNav(null, null); else await s.go('Building.dc.html');
  await s.until(47.30);
  await endWin('back');
  // ---- shooting
  await s.until(48.20);
  await s.move(...mid(await s.box('.site-tab--shooting'), .5, .45), 0.8);
  await s.until(49.10);
  s.beat('click-shooting', 'shooting: the tab move; the prints develop on their lines', 'nav');
  await s.clickNav(null, null);
  await s.until(51.70);
  const row = await pt((A) => {
    const b = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top }; };
    const els = A ? [...(document.querySelectorAll('.line-host')[0] || document).querySelectorAll('.print')] : [...document.querySelectorAll('.photo-img')].slice(0, 6);
    return els.map(b);
  }, A);
  const ly = row[0] ? row[0].y : 500, target = row[2] || row[0] || { x: 640, y: 500, t: 450 };
  if (A) { await s.move(40, ly + 10, 0.7); s.beat('pass-line', 'a fast pass along the first line: the prints swing', 'hover'); await s.move(1250, ly + 20, 0.7); }
  await s.until(53.40);
  await s.move(target.x + 10, target.t - 70, 0.6);
  await s.move(target.x, target.y, 0.6);
  await s.until(54.65);
  await win('print');
  s.beat('open-print', 'after: unclipped into the viewer with its peg, the rope springs up; before: the dark lightbox', 'click');
  await s.click(null, null);
  await s.until(56.10);
  await endWin('print');
  await s.until(56.70);
  await s.move(target.x + 120, target.y - 40, 0.6);
  await s.until(57.40);
  s.beat('close-print', 'it flies home and clips back onto the rope', 'click');
  await s.click(null, null);
  // ---- about
  await s.until(58.70);
  await s.move(...mid(await s.box('.site-tab--about'), .5, .45), 0.8);
  await s.until(59.60);
  s.beat('click-about', 'about: the tab move', 'nav');
  await s.clickNav(null, null);
  await s.until(61.20);
  if (A) {
    const g = mid(await s.box('.grip'));
    await s.move(...g, 0.7);
    s.beat('pull-card', 'the specimen card pulled out of its sleeve: stick, the lip catches, it pops free', 'drag');
    await s.press(); await s.hold(0.12); await s.move(g[0] + 380, g[1] + 8, 1.3); await s.release();
    await s.until(64.70);
    const c = await s.box('.a-card');
    if (c) { await s.move(...mid(c, .62, .38), 0.7); s.beat('tilt', 'in the hand: a small tilt shows the card\'s thickness', 'hover'); await s.move(...mid(c, .4, .62), 0.8); }
  }
  // ---- home: the nav falls back into a desk
  await s.until(66.30);
  await s.move(...mid(await s.box('.site-home'), .5, .45), 0.9);
  await s.until(67.25);
  await win('home');
  if (A) s.fps(180);
  s.beat('click-home', 'home: after, the nav falls back into a desk; before, a hard cut', 'nav');
  await s.clickNav(null, null);
  await s.until(68.50); s.fps(60);
  await endWin('home');
  await s.until(70.20);
};
