// Gallery. Before: a static grid of prints, a dark lightbox. After: prints develop on first view (fresh
// session), a fast pass swings the line, the clicked print is unclipped into the viewer with its peg (the rope
// springs up where the weight left), and a click flies it home onto the rope, which sags again.
// Both sides are seeded (seed.mjs), so they open the same print.
import { seedRandom, GALLERY_SEED } from '../seed.mjs';
export default async (page, ctx) => {
  await ctx.context.addInitScript(seedRandom, GALLERY_SEED);
  await ctx.move(1150, 330, 10);
  await page.goto(ctx.base + '/Gallery.dc.html', { waitUntil: 'domcontentloaded' });
  // 1 · first view: the after side develops its prints (they mount blank), the before side just shows them
  if (ctx.after) await page.waitForSelector('.g-root[data-mode] .hang', { timeout: 15000 });
  else await page.waitForSelector('.photo-img', { timeout: 15000 });
  await page.waitForTimeout(400);   // let the first painted frame reach the screencast
  ctx.mark('start');
  const pick = await page.evaluate((after) => {
    const b = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top, h: r.height }; };
    const row = after ? [...document.querySelectorAll('.line-host')[0].querySelectorAll('.print')] : [...document.querySelectorAll('.photo-img')].slice(0, 6);
    return row.map(b);
  }, ctx.after);
  const y = pick[0].y, target = pick[2];
  // 2 · a fast pass along the first line: the after prints swing on the rope
  await ctx.at(3.6); await ctx.move(40, y + 10, 700);
  await ctx.at(4.5); await ctx.move(1250, y + 20, 700);
  // 3 · leave the line upward, then come down onto the third print (an aimed approach leaves it still)
  await ctx.at(5.9); await ctx.move(target.x + 10, target.t - 70, 800);
  await ctx.at(6.9); await ctx.move(target.x, target.y, 800);
  // 4 · click: unclipped into the viewer with its peg (after) / the lightbox (before)
  await ctx.at(8.3); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(10.1); await ctx.move(target.x + 120, target.y - 40, 900);
  // 5 · click again: it flies home and clips back onto the rope
  await ctx.at(11.9); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(13.0); await ctx.move(1150, 330, 900);
  await ctx.at(14.8); ctx.mark('end');
};
