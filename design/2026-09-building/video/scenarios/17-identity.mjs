// A first visit to home, in a fresh session: the OP, then the desk. Before (#17): the lockup is simply there when the
// OP ends: "Fred Yang | 弗雷德" set in type, the tagline under it and the ghost. After (#31): the new identity, the
// hand-carved seals of 弗雷德 and FRED YANG beside the vertical motto 继续写，继续造. It is taken off the paper under
// the OP; as the OP ends the pen writes the motto in stroke order, then the two seals are stamped on held frames
// with their impact ticks, the way the corkboard's pin is pressed.
export default async (page, ctx) => {
  await page.goto('about:blank');
  await page.evaluate(() => { document.documentElement.style.background = '#FBF6EC'; });
  await page.waitForTimeout(400);
  ctx.mark('start');
  await page.goto(ctx.base + '/', { waitUntil: 'commit' });
  await ctx.at(5.6); await ctx.move(820, 420, 700);
  await ctx.at(6.8); ctx.mark('end');
};
