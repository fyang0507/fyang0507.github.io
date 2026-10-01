// Building's board at rest, then flung. Before (#17): the corkboard as round one left it. After (#23, #28, #33): the
// same board as a static page, in Fraunces, and every project with chapters keeps its dossier pinned behind its card:
// its index tabs peek past the card's right edge (five for Fred Agent, three for NJJoe), hang from the same pin and
// swing with the paper when the board is flung. (A take from the page load showed both boards arriving together on a
// warm local server, so the segment starts at rest.) The lead card's 小红花 is set as already applied
// (fy-flower-fred-agent), so the first-view press stays out of it.
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  await page.goto(ctx.base + '/Building.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2400);
  // press, pull the board with rising speed, and let go while it is still moving (a fling)
  const fling = async ([x0, y0], [x1, y1], ms) => {
    await ctx.move(x0, y0, 300); await page.mouse.down(); await page.waitForTimeout(80);
    const n = Math.round(ms / 16), t0 = Date.now();
    for (let i = 1; i <= n; i++) {
      const t = i / n, e = t * t * (1.6 - 0.6 * t);
      await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e);
      await page.waitForTimeout(Math.max(0, t0 + ms * t - Date.now()));
    }
    await page.mouse.up();
    await ctx.move(x1, y1, 0);   // resync ctx's pointer position with where the mouse is
  };
  await ctx.move(1150, 300, 200);
  ctx.mark('start');
  // 1 · point along the lead card to its right edge, where the dossier's tabs peek out
  await ctx.at(0.3); await ctx.move(640, 700, 900);
  await ctx.at(1.5); await ctx.move(800, 600, 800);
  // 2 · fling the board left, so NJJoe's card and its three tabs come in; then bring it back
  await ctx.at(3.0); await ctx.move(1060, 900, 500);
  await ctx.at(3.8); await fling([1060, 900], [360, 890], 650);
  await ctx.at(7.0); await fling([360, 890], [1080, 900], 650);
  await ctx.at(9.4); await ctx.move(1150, 300, 900);
  await ctx.at(10.8); ctx.mark('end');
};
