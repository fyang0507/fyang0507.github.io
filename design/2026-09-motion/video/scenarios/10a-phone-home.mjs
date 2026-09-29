// Home on a phone. Before: a small drawing of the desk with four links under it; a swipe does nothing (its camera
// flash and laptop typing run on timers).
// After: one camera over the whole desk; each swipe walks it to the next object, which reacts once it arrives
// (the laptop types, the portrait pulls a face, the camera snaps, the book flips).
export const viewport = [390, 844];
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  const y = 300;                                   // on the drawing, both sides
  ctx.mark('start');
  for (const t of [0.6, 3.6, 5.2, 6.8]) { await ctx.at(t); await ctx.swipe([330, y], [70, y], 280); }
  await ctx.at(8.6); ctx.mark('end');
};
