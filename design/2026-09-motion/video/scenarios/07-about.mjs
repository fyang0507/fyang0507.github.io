// About. Before: the flat field card tilts toward the pointer with a white glare, and FLIP is a button whose
// shimmer never stops. After: the specimen card comes out of its kraft sleeve (stick, lip catch, pop), turns over
// in place when dragged, turns back, and goes home when the pointer carries it onto the sleeve.
export default async (page, ctx) => {
  await page.goto(ctx.base + '/About.dc.html', { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount="about"][data-state="tucked"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200);
  const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
  await ctx.move(1080, 620, 200);
  ctx.mark('start');
  if (ctx.after) {
    const grip = await ctx.box('.grip');
    const [gx, gy] = mid(grip, .5, .5);
    // 1 · hover the sleeve (the lip answers), then pull the card out by its edge
    await ctx.at(0.3); await ctx.move(gx, gy, 900);
    await ctx.at(1.9); await page.mouse.down(); await page.waitForTimeout(120);
    await ctx.move(gx + 380, gy + 8, 1300);
    await page.mouse.up();
    // 2 · in the hand: a little hover tilt shows the card's thickness
    await page.waitForSelector('[data-mount="about"][data-state="free"]');
    await page.waitForTimeout(500);
    const c = await ctx.box('.a-card');
    await ctx.at(4.6); await ctx.move(...mid(c, .62, .38), 700);
    await ctx.move(...mid(c, .4, .62), 800);
    // 3 · drag right on the card: it turns over where it is (night face, the radar draws)
    await ctx.at(6.6); await ctx.move(...mid(c, .38, .5), 400);
    await page.mouse.down(); await page.waitForTimeout(100);
    await ctx.move(...mid(c, .8, .53), 750);
    await page.waitForTimeout(80); await page.mouse.up();
    // 4 · drag left: it turns back
    await ctx.at(10.4); await ctx.move(...mid(c, .72, .5), 400);
    await page.mouse.down(); await page.waitForTimeout(100);
    await ctx.move(...mid(c, .34, .52), 750);
    await page.waitForTimeout(80); await page.mouse.up();
    // 5 · carry the pointer onto the sleeve: it takes the card half in; release and it slides home
    const z = await page.evaluate(() => { const r = document.querySelector('[data-mount="about"]'), g = document.querySelector('.rig').getBoundingClientRect(), v = r.dataset.zone.split(',').map(Number); return [g.left + (v[0] + v[1]) / 2, g.top + (v[2] + v[3]) / 2]; });
    await ctx.at(13.4); await ctx.move(...mid(c, .5, .5), 450);
    await page.mouse.down(); await page.waitForTimeout(100);
    await ctx.move(z[0] + 20, z[1], 1200);
    await page.waitForTimeout(650); await page.mouse.up();
    await ctx.move(1080, 620, 900);
  } else {
    const card = await ctx.box('.field-card-wrap'), flip = await ctx.box('.flip-control');
    // 1 · hover the card: it tilts toward the pointer and a glare follows
    await ctx.at(0.3); await ctx.move(...mid(card, .7, .35), 900);
    await ctx.at(1.9); await ctx.move(...mid(card, .3, .45), 1300);
    await ctx.at(4.6); await ctx.move(...mid(card, .62, .3), 700);
    await ctx.move(...mid(card, .4, .5), 800);
    // 3 · FLIP is a button (its shimmer runs the whole time); the click lands when the after side releases
    await ctx.at(6.6); await ctx.move(...mid(flip), 850);
    await ctx.at(7.9); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    // 4 · press it again to flip back
    await ctx.at(10.4); await ctx.move(...mid(flip, .6, .45), 300);
    await ctx.at(11.7); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    // 5 · nothing to put away: the card just sits there
    await ctx.at(13.4); await ctx.move(...mid(card, .5, .4), 900);
    await ctx.at(15.8); await ctx.move(1080, 620, 900);
  }
  await ctx.at(17.6); ctx.mark('end');
};
