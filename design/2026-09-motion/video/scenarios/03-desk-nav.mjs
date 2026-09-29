// Home → Writing through the book. Before: a hard cut, then the page's fade-and-rise.
// After: the desk becomes the nav (the table folds into the rule, the objects fly into their tabs).
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await ctx.move(1010, 330, 200);
  const b = await ctx.box(ctx.after ? '.hot.hot-book' : '.hot.bookwrap');
  const bx = b.x + b.width * .5, by = b.y + b.height * .5;
  ctx.mark('start');
  await ctx.at(0.3); await ctx.move(bx, by, 900);
  await ctx.at(2.0); await ctx.click(bx, by, 0);
  await ctx.at(5.2); ctx.mark('end');
};
