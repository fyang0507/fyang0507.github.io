// Building. Before: a scrolling strip of cards; a + opens a torn note with the details.
// After: a corkboard with physics. On first view the lead card gets its 小红花 (pressed on); pointing
// at the card pops it up and presses it again; drag the board and the cards swing on their pins; a card
// unpins to be read and is pushed back onto its pin, which sends a ripple through the cork.
// The segment starts at the page load (on a paper-coloured blank) so the first-view press is in frame.
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.setContent('<html style="background:#FBF6EC"></html>');
  await page.waitForTimeout(400);
  const box = async (sel) => { const b = await ctx.box(sel); return b && [b.x + b.width / 2, b.y + b.height / 2, b]; };
  // before: a horizontal wheel on the board (a trackpad swipe), spread over ms
  const wheel = async (dx, ms) => {
    const n = Math.round(ms / 33), t0 = Date.now(), e = (k) => 1 - Math.pow(1 - k / n, 2);
    for (let i = 1; i <= n; i++) {
      await page.mouse.wheel(dx * (e(i) - e(i - 1)), 0);
      await page.waitForTimeout(Math.max(0, t0 + ms * i / n - Date.now()));
    }
  };
  // after: press, pull the board with rising speed, and let go while it is still moving (a fling)
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
  await ctx.move(1150, 175, 0);   // park the pointer outside the lead card, so its entry at beat 2 is a real one
  ctx.mark('start');
  // 1 · the page arrives (after: the flower is pressed onto the lead card on first view)
  await page.goto(ctx.base + '/Building.dc.html', { waitUntil: 'load' });
  // 2 · point at the lead card: the flower pops up and is pressed again
  await ctx.at(2.4); { const [, , b] = await box(ctx.after ? '.slot--lead .highlighted-title' : '.card-slot--highlighted .highlighted-title'); await ctx.move(b.x + 170, b.y + 40, 800); }
  // 3 · drag the board, let it go; then bring it back
  await ctx.at(4.6); await ctx.move(1060, 890, 600);
  if (ctx.after) {
    await ctx.at(5.4); await fling([1060, 890], [420, 880], 650);
    await ctx.at(8.2); await fling([420, 880], [1080, 890], 650);
  } else {
    await ctx.at(5.5); await wheel(640, 800);
    await ctx.at(8.2); await ctx.move(420, 880, 300); await wheel(-660, 800);
  }
  // 4 · open the Audio Processing card: unpin it to read (before: its + opens the note)
  await ctx.at(10.8);
  if (ctx.after) { const [, , b] = await box('.slot--instrument'); await ctx.move(b.x + b.width * .5, b.y + b.height * .72, 800); }
  else { const t = await page.$$('.morph-toggle'); const b = await t[0].boundingBox(); await ctx.move(b.x + b.width / 2, b.y + b.height / 2, 800); }
  await ctx.at(11.8); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 5 · pin it back (before: close the note)
  await ctx.at(14.4);
  if (ctx.after) { const [x, y] = await box('.unpin-close .pen-t'); await ctx.move(x, y, 800); }
  else { const t = await page.$$('.morph-toggle'); const b = await t[0].boundingBox(); await ctx.move(b.x + b.width / 2 + 40, b.y + b.height / 2 - 30, 400); await ctx.move(b.x + b.width / 2, b.y + b.height / 2, 400); }
  await ctx.at(15.6); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(16.6); await ctx.move(1150, 175, 900);
  await ctx.at(18.2); ctx.mark("end");
};
