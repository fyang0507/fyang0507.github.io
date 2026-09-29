// A first visit to home in a fresh session. Before: the dark loading screen (a line of birds), then the iris.
// After: the OP (弗 / 雷 / 德 / FRED), the desk objects fall into place, the 日常 · ep.NN card, then the desk.
export default async (page, ctx) => {
  await page.goto('about:blank');
  await page.evaluate(() => { document.documentElement.style.background = '#FBF6EC'; });
  await page.waitForTimeout(400);
  ctx.mark('start');
  await page.goto(ctx.base + '/', { waitUntil: 'commit' });
  await ctx.at(4.6); await ctx.move(820, 420, 700);
  await ctx.at(6.2); ctx.mark('end');
};
