// About on a phone. Before: the card with a FLIP button above it. After: the card sits in a kraft sleeve; a sideways
// drag pulls it out and the sleeve steps aside to the left edge; a tap turns the card over where it is; a thumb
// drag to the sleeve's strip puts it back.
export const viewport = [390, 844];
const centre = async (ctx, sel) => { const b = await ctx.box(sel); return [b.x + b.width / 2, b.y + b.height / 2]; };
export default async (page, ctx) => {
  await page.goto(ctx.base + '/About.dc.html', { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount="about"][data-state]', { timeout: 20000 });
  await page.waitForTimeout(2200);
  ctx.mark('start');
  // beat 1: pull (after: sideways drag on the card's sliver; before: the same drag across the card)
  await ctx.at(0.5);
  if (ctx.after) { const [gx, gy] = await centre(ctx, '.grip'); await ctx.swipe([gx, gy], [gx + 200, gy + 4], 520); }
  else await ctx.swipe([150, 520], [350, 524], 520);
  // beat 2: turn it over (after: tap the card; before: tap FLIP)
  await ctx.at(2.8);
  if (ctx.after) { const [cx, cy] = await centre(ctx, '.a-card'); await ctx.tap(cx, cy); }
  else { const [fx, fy] = await centre(ctx, 'button'); await ctx.tap(fx, fy); }
  // beat 3: put it back (after: thumb to the sleeve strip; before: FLIP again)
  await ctx.at(5.2);
  if (ctx.after) {
    const [cx, cy] = await centre(ctx, '.a-card');
    const zx = await page.evaluate(() => { const r = document.querySelector('[data-mount="about"]'), g = document.querySelector('.rig').getBoundingClientRect(), z = r.dataset.zone.split(',').map(Number); return Math.max(6, (g.left + z[1]) / 2); });
    await ctx.swipe([cx, cy], [zx, cy + 10], 520, { settle: 120 });
  } else { const [fx, fy] = await centre(ctx, 'button'); await ctx.tap(fx, fy); }
  await ctx.at(7.6); ctx.mark('end');
};
