// s1 · home → Writing → Reading, one fresh session, real input.
// After (origin/main): the first visit's OP (弗 / 雷 / 德 / FRED), the objects fall, the camera eases back, the motto
// is written and the seals stamped; the book is clicked and the desk becomes the nav (the table folds into the
// header rule, each object flies into its tab); a spine pulled toward you turns its cover out under the obi;
// 中文 → EN retitles the spines; the book in your hand opens Reading, whose halftone hero dissolves as you scroll,
// the title flies into the header, and a footnote gets the pen's gesture and its slip.
// Before (6237120): the old loading screen, the static home with the typeset lockup; a hard cut to the flat
// shelf, whose preview card swaps on hover (nothing to switch); the old Reading, whose cover slides under a
// transparent nav, citations in the margin.
const POST_A = '2026-08-29_google-just-wants-to-coast-to-a-win', POST_B = '2025-12-06_the-stories-we-live-05';
async function wheelTo(page, y1, ms) {
  const y0 = await page.evaluate(() => scrollY);
  const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
  let sent = 0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const d = Math.round((y1 - y0) * e) - sent;
    if (d) { await page.mouse.wheel(0, d); sent += d; }
    await page.waitForTimeout(Math.max(0, ts + ms * t - Date.now()));
  }
}
export default async (page, ctx) => {
  // the OP's end, heard in the page (after only), so the film can time the seals from it
  await ctx.context.addInitScript(() => { document.addEventListener('opx:done', (e) => { try { sessionStorage.setItem('film-opx', JSON.stringify({ at: Date.now(), d: e.detail })); } catch {} }); });
  await page.goto('about:blank');
  await page.evaluate(() => { document.documentElement.style.background = '#FBF6EC'; });
  await page.waitForTimeout(400);
  await ctx.move(820, 420, 0);
  ctx.mark('start');
  ctx.beat('home-first-visit', 'nav', 'a fresh session opens home');
  await page.goto(ctx.base + '/', { waitUntil: 'commit' });
  await page.waitForLoadState('load');
  // 1 · the book on the desk
  const b = await ctx.box(ctx.after ? '.hot.hot-book' : '.hot.bookwrap');
  const bx = b.x + b.width * .5, by = b.y + b.height * .5;
  await ctx.at(8.0);
  const opx = await page.evaluate(() => sessionStorage.getItem('film-opx'));
  if (opx) { const o = JSON.parse(opx); ctx.beat('op-done', 'event', 'the OP ends: the motto is written, then the two seals are stamped', null, o.at / 1000); }
  ctx.beat('hover-book', 'hover', 'the pointer goes to the book'); await ctx.move(bx, by, 900);
  await ctx.at(9.6); ctx.beat('click-book', 'click', 'the book: after, the desk becomes the nav; before, a hard cut'); await ctx.click(bx, by, 0);
  await page.waitForURL(/Writing/, { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount=writing][data-ready]', { timeout: 15000 });
  const spine = (post) => page.evaluate(({ post, after }) => {
    const e = after ? document.querySelector(`.bk-hit[data-post="${post}"]`)
      : [...document.querySelectorAll('.shelf-row a.book')].find((a) => a.getAttribute('href').includes(post));
    const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .35];
  }, { post, after: ctx.after });
  const sw = async (lang) => ctx.after
    ? page.$eval(`.lang-b[data-lang="${lang}"]`, (b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })
    : [lang === 'en' ? 1220 : 1180, 390];
  // 2 · a spine pulled toward you: the cover turns out under the obi (before: the preview card swaps)
  await ctx.at(12.4); { const p = await spine(POST_B); ctx.beat('hover-spine', 'hover', 'a book pulled toward you, its cover turns out', p); await ctx.move(...p, 900); }
  // 3 · 中文 → EN: the spines retitle (before: the same place on the page, nothing there)
  await ctx.at(15.4); { const p = await sw('en'); ctx.beat('to-switch', 'hover', 'to the 中文 · EN switch', p); await ctx.move(...p, 1000); }
  await ctx.at(16.8); ctx.beat('switch-en', 'click', 'EN: the spines retitle in English'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 4 · the latest essay, in English, taken off the shelf and opened
  await ctx.at(18.4); { const p = await spine(POST_A); ctx.beat('hover-spine-2', 'hover', 'the latest essay pulled out, its cover in English', p); await ctx.move(...p, 1000); }
  await ctx.at(21.0); ctx.beat('open-book', 'click', 'the book in your hand opens Reading (a same-tab cut on both)'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForURL(/Reading/, { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await ctx.move(1238, 640, 400);
  // 5 · scroll off the cover: after, the halftone dissolve and the title flying into the header
  await ctx.at(24.4); ctx.beat('scroll-hero', 'scroll', 'off the cover: the hero dissolves into halftone, the title flies into the header'); await wheelTo(page, 600, 4000);
  await ctx.at(29.0); ctx.beat('scroll-text', 'scroll', 'into the text; after, the margin rail'); await wheelTo(page, 1150, 2200);
  // 6 · a footnote: the pen's gesture and its slip (before: the hand-set citation in the margin)
  await ctx.at(31.8);
  const r = await page.evaluate(() => { const a = [...document.querySelectorAll('.fnref a')].find((x) => x.offsetParent && x.getBoundingClientRect().top > 120 && x.getBoundingClientRect().top < 900); const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  ctx.beat('hover-footnote', 'hover', 'a footnote: the pen brackets the claim, loops the number, the slip is tugged over', r); await ctx.move(...r, 700);
  await ctx.at(35.4); await ctx.move(1150, 560, 900);
  await ctx.at(36.8); ctx.mark('end');
};
