// Writing → Gallery through the nav, then Gallery → home. Two segments cut at 'mid'.
// Before: two hard cuts. After: the tab mark springs across and the objects hop (tab → tab),
// then the nav falls back into a desk (gravity return).
// Seeded like 06-gallery (seed.mjs), so the Gallery it leaves from is the one 06-gallery shows.
import { seedRandom, GALLERY_SEED } from '../seed.mjs';
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await ctx.context.addInitScript(seedRandom, GALLERY_SEED);
  await page.goto(ctx.base + '/Writing.dc.html', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await ctx.move(900, 560, 200);
  const c = async (sel) => { const b = await ctx.box(sel); return [b.x + b.width * .5, b.y + b.height * .45]; };
  const shoot = await c('.site-tab--shooting');
  ctx.mark('start');
  await ctx.at(0.3); await ctx.move(...shoot, 850);
  await ctx.at(1.9); await ctx.click(...shoot, 0);
  await ctx.at(4.4); ctx.mark('mid');
  const home = await c('.site-home');
  await ctx.at(4.6); await ctx.move(...home, 850);
  await ctx.at(6.2); await ctx.click(...home, 0);
  await ctx.at(9.2); ctx.mark('end');
};
