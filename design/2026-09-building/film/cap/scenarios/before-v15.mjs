// v1.5's part 2 (before-v13.mjs, with About): the site before #17 (6237120), one continuous take, real input, on the
// virtual clock, shot whole. It walks part 1's route (v1.5's promo): home, the book → Writing, the board and its lead
// card → the field notes and their Principles, the shooting tab → a print into the lightbox and out, the about tab →
// the old About, and home again. Up to the about tab it is v1.3's take, frame for frame (the clock is the same).
// Record with CURSOR=0 (the film draws the hand from the pointer track): node cap/rec.mjs <this> before <out>
export const init = () => {
  let a = 2 >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];

export default async (s) => {
  s.shoot(true);
  // ---- home, first visit: the old loading screen, then the desk
  s.beat('home', 'a fresh session opens the old home: its loading screen, then the desk', 'nav');
  await s.go('index.html');
  await s.until(5.0);
  // ---- the book: a hard cut to the old Writing
  await s.move(...mid(await s.box('.hot.bookwrap')), 0.9);
  await s.until(6.3);
  s.beat('click-book', 'the book: a hard cut to Writing', 'click');
  await s.clickNav(null, null);
  // ---- Writing, then the building tab: a hard cut to the old board
  await s.until(7.6);
  await s.move(...mid(await s.box('.site-tab--building'), .5, .45), 0.8);
  await s.until(8.6);
  s.beat('click-building', 'the building tab: a hard cut to the board', 'nav');
  await s.clickNav(null, null);
  // ---- the board's lead card: a hard cut into the field notes
  await s.until(9.4);
  await s.move(...mid(await s.box('.card-slot--highlighted .highlighted-title'), .4, .55), 0.8);
  await s.until(10.6);
  s.beat('take-card', 'the lead card: a hard cut into the field notes', 'click');
  await s.clickNav(null, null);
  // ---- the field notes' Principles: a hard cut
  await s.until(11.4);
  const pr = await s.eval(() => { const a = [...document.querySelectorAll('a[href$="principles.html"]')].find((x) => x.getBoundingClientRect().width); const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await s.move(...pr, 0.7);
  await s.until(12.5);
  s.beat('open-principles', 'Principles: a hard cut', 'nav');
  await s.clickNav(null, null);
  // ---- the shooting tab: a hard cut to the old Gallery
  await s.until(13.3);
  await s.move(...mid(await s.box('.site-tab--shooting'), .5, .45), 0.7);
  await s.until(14.3);
  s.beat('click-shooting', 'the shooting tab: a hard cut to the gallery', 'nav');
  await s.clickNav(null, null);
  // ---- a print: the dark lightbox, and out
  await s.until(15.1);
  const ph = await s.eval(() => { const e = [...document.querySelectorAll('.photo-img')][2]; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await s.move(...ph, 0.8);
  await s.until(16.3);
  s.beat('open-print', 'a print: the dark lightbox', 'click');
  await s.click(null, null);
  await s.until(17.3);
  await s.move(ph[0] + 260, ph[1] - 60, 0.5);
  await s.until(17.9);
  s.beat('close-print', 'a click anywhere closes it', 'click');
  await s.click(null, null);
  // ---- the about tab: a hard cut to the old About
  await s.until(18.4);
  await s.move(...mid(await s.box('.site-tab--about'), .5, .45), 0.7);
  await s.until(19.3);
  s.beat('click-about', 'the about tab: a hard cut to About', 'nav');
  await s.clickNav(null, null);
  // ---- home: a hard cut, the desk fades back in
  await s.until(20.6);
  await s.move(...mid(await s.box('.site-home'), .5, .45), 0.8);
  await s.until(21.6);
  s.beat('click-home', 'home: a hard cut, the desk fades in', 'nav');
  await s.clickNav(null, null);
  await s.until(23.2);
};
