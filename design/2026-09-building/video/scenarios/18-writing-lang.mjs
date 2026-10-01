// Writing: the book in your hand, and the language. Before (#17): a hovered book slides out and turns its cover, but
// the cover is a small face scaled up, so it is soft in your hand; the spines are Chinese only, with no switch. After
// (#22, #27): the book in your hand is laid out at its own size, so it is sharp; and a 中文 · EN switch at the index's
// head retitles every spine and cover in English (the choice carries to Reading). The before side makes the same
// moves over the same spot, where there is nothing to switch.
const POST_A = '2026-08-29_google-just-wants-to-coast-to-a-win', POST_B = '2025-12-06_the-stories-we-live-05';
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/Writing.dc.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mount=writing][data-ready]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  // a spot on a book's spine, 35% down it
  const spine = (post) => page.evaluate((post) => { const r = document.querySelector(`.bk-hit[data-post="${post}"]`).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .35]; }, post);
  // the switch's EN / 中文 on the after side; on the before side, the same place on the page (nothing is there)
  const sw = async (lang) => ctx.after
    ? page.$eval(`.lang-b[data-lang="${lang}"]`, (b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })
    : [lang === 'en' ? 1220 : 1180, 390];
  await ctx.move(1180, 300, 200);
  ctx.mark('start');
  // 1 · take the latest essay off the shelf: its cover turns to you
  await ctx.at(0.4); await ctx.move(...await spine(POST_A), 900);
  // 2 · put it back, and switch to English
  await ctx.at(3.6); await ctx.move(...await sw('en'), 1000);
  await ctx.at(5.0); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 3 · another book, in English
  await ctx.at(6.6); await ctx.move(...await spine(POST_B), 1000);
  // 4 · back to Chinese
  await ctx.at(9.6); await ctx.move(...await sw('zh'), 1000);
  await ctx.at(11.0); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(12.8); ctx.mark('end');
};
