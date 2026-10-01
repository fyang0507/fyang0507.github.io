// Principles on a phone. Before (#17): the old sub-site's pill nav, sticky, with the "On this page" list under the
// title. After (#32): the fore-edge tabs become a strip above the sheet, every tab showing: numbers only, the current
// one named, and under it, on the sheet's edge, the rail's ticks and the reading counter ("03 / 11"), which counts as
// you read. A tap on the strip opens the next chapter (a hard cut until PR 3), where the strip names it.
export const viewport = [390, 844];
const centre = async (page, sel) => { const b = await page.waitForSelector(sel).then((e) => e.boundingBox()); return [b.x + b.width / 2, b.y + b.height / 2]; };
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/building/fred-agent/principles.html', { waitUntil: 'load' });
  await page.waitForSelector('#capture');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200);
  ctx.mark('start');
  // 1 · read down: four thumb swipes
  for (const t of [0.5, 2.0, 3.5, 5.0]) { await ctx.at(t); await ctx.swipe([200, 660], [200, 200], 420); }
  // 2 · the next chapter from the strip (before: the pill nav)
  await ctx.at(6.8); await ctx.tap(...await centre(page, ctx.after ? '.pj-tabs .dos-tab:nth-child(4)' : '.fa-project-nav a[href$="components.html"]'));
  await ctx.at(9.6); ctx.mark('end');
};
