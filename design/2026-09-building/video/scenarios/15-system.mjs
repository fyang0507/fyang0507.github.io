// System's map. Before (#17): outcomes on top, handles at the bottom; a hover lights the path's boxes and draws it in
// dashed red. After (#32): the columns read the way the argument is written, handles → protocols → outcomes; every
// link is a faint pencil line at rest; a hover draws the path's links in the pen's coral, one confident pass that
// retracts faster; a click locks the module: it is banded in wheat, its explainer opens, and its links cool into the
// band's edge and stay until "Clear path". The same modules on both sides, by id; the page opens at the map.
const node = async (page, id) => { const b = await page.$eval(`[data-node-id="${id}"]`, (n) => { const r = n.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }); return [b.x + Math.min(b.w * .4, 120), b.y + b.h * .6]; };
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/building/fred-agent/system.html', { waitUntil: 'load' });
  await page.waitForSelector('[data-node-id="u-house"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const m = document.querySelector('[data-system-map]'); scrollTo(0, m.getBoundingClientRect().top + scrollY - 90); });
  await page.waitForTimeout(1400);
  await ctx.move(1240, 560, 200);
  ctx.mark('start');
  // 1 · an outcome: its protocol and its handles
  await ctx.at(0.3); await ctx.move(...await node(page, 'u-house'), 900);
  // 2 · the cross-cutting protocol: every outcome it wraps
  await ctx.at(2.4); await ctx.move(...await node(page, 'p-recovery'), 800);
  // 3 · a handle, then lock it: the explainer opens
  await ctx.at(4.4); await ctx.move(...await node(page, 'c-outreach'), 800);
  await ctx.at(5.6); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 4 · leave the map; the locked path stays
  await ctx.at(7.2); await ctx.move(1240, 560, 900);
  // 5 · clear it
  await ctx.at(8.8); { const b = await ctx.box('[data-map-clear]'); await ctx.move(b.x + b.width / 2, b.y + b.height / 2, 800); }
  await ctx.at(10.0); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(11.4); await ctx.move(1240, 560, 700);
  await ctx.at(12.6); ctx.mark('end');
};
