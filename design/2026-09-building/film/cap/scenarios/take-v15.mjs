// v1.5's second take: the site at origin/main 75e9790, from the Building board on, one session, real input, on the
// virtual clock. The promo joins it to take11 (the OP, the book, the tabs) with the sheet pull. Its route:
//   the board → the shooting tab: the tab move, the prints developing on their lines → a print, unclipped into the
//   viewer with its peg, and clipped back → the about tab: the tab move → the specimen card pulled out of its sleeve
//   (the stick, the lip catching, the pop free) and turned over in the hand → home: the nav falls back into a desk
//   (180 fps, for the ramp).
// Record with CURSOR=0 and SITE=main75:  SITE=main75 CURSOR=0 node cap/rec.mjs cap/scenarios/take-v15.mjs after /tmp/fyfilm/cap/take15-after
export const init = () => {
  let a = 2 >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];

export default async (s) => {
  s.shoot(true);
  // ---- the board (a fresh session opens it directly)
  s.beat('board', 'a fresh session opens the Building board', 'nav');
  await s.go('Building.dc.html');
  await s.until(2.0);
  // ---- shooting: the tab move, the prints develop on their lines
  await s.move(...mid(await s.box('.site-tab--shooting'), .5, .45), 0.6);
  await s.until(2.7);
  s.beat('click-shooting', 'shooting: the tab move; the prints develop on their lines', 'nav');
  await s.clickNav(null, null);
  await s.until(5.6);
  // ---- a print, peg and all, and back onto its rope
  const p = await s.eval(() => { const e = [...(document.querySelectorAll('.line-host')[0] || document).querySelectorAll('.print')][2]; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await s.move(...p, 0.5);
  await s.until(6.2);
  s.beat('open-print', 'unclipped into the viewer with its peg, the rope springs up', 'click');
  await s.click(null, null);
  await s.until(7.5);
  await s.move(p[0] + 120, p[1] - 40, 0.35);
  await s.until(8.0);
  s.beat('close-print', 'it flies home and clips back onto the rope', 'click');
  await s.click(null, null);
  // ---- about: the tab move
  await s.until(8.6);
  await s.move(...mid(await s.box('.site-tab--about'), .5, .45), 0.6);
  await s.until(9.3);
  s.beat('click-about', 'about: the tab move', 'nav');
  await s.clickNav(null, null);
  // ---- the specimen card: out of its sleeve, then turned over in the hand
  await s.until(10.3);
  const g = mid(await s.box('.grip'));
  await s.move(...g, 0.5);
  await s.until(10.9);
  s.beat('pull-card', 'the specimen card pulled out of its sleeve: stick, the lip catches, it pops free', 'drag');
  await s.press(); await s.hold(0.12); await s.move(g[0] + 380, g[1] + 8, 1.2); await s.release();
  await s.until(12.7);
  const c = await s.box('.a-card');
  await s.move(...mid(c, .55, .45), 0.4);
  await s.until(13.2);
  s.beat('flip', 'a tap turns the card over in the hand: its night face, the radar drawn', 'click');
  await s.click(null, null);
  // ---- home: the nav falls back into a desk
  await s.until(14.7);
  await s.move(...mid(await s.box('.site-home'), .5, .45), 0.7);
  await s.until(15.55);
  s.fps(180);
  s.beat('click-home', 'home: the nav falls back into a desk', 'nav');
  await s.clickNav(null, null);
  await s.until(16.9); s.fps(60);
  await s.until(17.6);
};
