// s3 · Writing → Gallery → About → home, one session, real input. Seeded (seed.mjs) so both Galleries hang the
// same prints and open the same one.
// After (origin/main): the tab move into Gallery; the prints develop on the lines on first view; a fast pass swings a
// line; a print is unclipped into the viewer with its peg (the rope springs up where the weight left), and a click
// flies it home onto the rope. The tab move into About: the specimen card pulled out of its kraft sleeve, turned
// over in place by a drag, turned back. Home: the nav falls back into a desk (the gravity return).
// Before (6237120): hard cuts; a static grid of prints and a dark lightbox; the field card tilting toward the pointer
// under a glare, its FLIP button; a hard cut home.
import { seedRandom, GALLERY_SEED } from '../seed.mjs';
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await ctx.context.addInitScript(seedRandom, GALLERY_SEED);
  await page.goto(ctx.base + '/Writing.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2600);
  await ctx.move(900, 560, 200);
  const shoot = mid(await ctx.box('.site-tab--shooting'), .5, .45);
  ctx.mark('start');
  // 1 · the nav's shooting tab
  await ctx.at(0.3); ctx.beat('to-shooting-tab', 'hover', 'to the nav\'s shooting tab', shoot); await ctx.move(...shoot, 850);
  await ctx.at(1.9); ctx.beat('click-shooting', 'nav', 'shooting: after, the tab move, the prints develop on the lines; before, a hard cut to a grid'); await ctx.click(...shoot, 0);
  await page.waitForURL(/Gallery/, { waitUntil: 'domcontentloaded' });
  if (ctx.after) await page.waitForSelector('.g-root[data-mode] .hang', { timeout: 15000 });
  else await page.waitForSelector('.photo-img', { timeout: 15000 });
  await page.waitForTimeout(300);
  const pick = await page.evaluate((after) => {
    const b = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: r.top, h: r.height }; };
    const row = after ? [...document.querySelectorAll('.line-host')[0].querySelectorAll('.print')] : [...document.querySelectorAll('.photo-img')].slice(0, 6);
    return row.map(b);
  }, ctx.after);
  const y = pick[0].y, target = pick[2];
  // 2 · a fast pass along the first line: the prints swing on the rope
  await ctx.at(5.4); ctx.beat('pass-line', 'hover', 'a fast pass along the first line: the prints swing'); await ctx.move(40, y + 10, 700);
  await ctx.at(6.3); await ctx.move(1250, y + 20, 700);
  // 3 · onto the third print, and click: unclipped into the viewer with its peg (before: the lightbox)
  await ctx.at(7.7); await ctx.move(target.x + 10, target.t - 70, 800);
  await ctx.at(8.7); ctx.beat('to-print', 'hover', 'onto the third print', [target.x, target.y]); await ctx.move(target.x, target.y, 800);
  await ctx.at(10.1); ctx.beat('open-print', 'click', 'after: unclipped into the viewer with its peg, the rope springs up; before: the dark lightbox'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(11.9); await ctx.move(target.x + 120, target.y - 40, 900);
  await ctx.at(13.7); ctx.beat('close-print', 'click', 'after: it flies home and clips back onto the rope, which sags again'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 4 · the nav's about tab
  await ctx.at(15.4); { const p = mid(await ctx.box('.site-tab--about'), .5, .45); ctx.beat('to-about-tab', 'hover', 'to the nav\'s about tab', p); await ctx.move(...p, 900); }
  await ctx.at(16.9); ctx.beat('click-about', 'nav', 'about: after, the tab move; before, a hard cut'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForURL(/About/, { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount="about"][data-state="tucked"]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  if (ctx.after) {
    const [gx, gy] = mid(await ctx.box('.grip'));
    // 5 · the sleeve: hover (the lip answers), then pull the card out by its edge
    await ctx.at(19.6); ctx.beat('to-sleeve', 'hover', 'the sleeve: the lip answers the pointer', [gx, gy]); await ctx.move(gx, gy, 900);
    await ctx.at(21.2); ctx.beat('pull-card', 'drag', 'the specimen card pulled out of its sleeve: stick, the lip catches, it pops free'); await page.mouse.down(); await page.waitForTimeout(120);
    await ctx.move(gx + 380, gy + 8, 1300); await page.mouse.up();
    await page.waitForSelector('[data-mount="about"][data-state="free"]');
    await page.waitForTimeout(400);
    const c = await ctx.box('.a-card');
    await ctx.at(24.2); ctx.beat('tilt', 'hover', 'in the hand: a small tilt shows the card\'s thickness'); await ctx.move(...mid(c, .62, .38), 700); await ctx.move(...mid(c, .4, .62), 800);
    // 6 · drag right: it turns over in place (the night face, the radar drawn); drag left: it turns back
    await ctx.at(26.2); await ctx.move(...mid(c, .38, .5), 400);
    ctx.beat('flip', 'drag', 'dragged right: the card turns over where it is'); await page.mouse.down(); await page.waitForTimeout(100);
    await ctx.move(...mid(c, .8, .53), 750); await page.waitForTimeout(80); await page.mouse.up();
    await ctx.at(29.8); await ctx.move(...mid(c, .72, .5), 400);
    ctx.beat('flip-back', 'drag', 'dragged left: it turns back'); await page.mouse.down(); await page.waitForTimeout(100);
    await ctx.move(...mid(c, .34, .52), 750); await page.waitForTimeout(80); await page.mouse.up();
  } else {
    const card = await ctx.box('.field-card-wrap'), flip = await ctx.box('.flip-control');
    await ctx.at(19.6); ctx.beat('to-sleeve', 'hover', 'the field card tilts toward the pointer under a glare'); await ctx.move(...mid(card, .7, .35), 900);
    await ctx.at(21.2); ctx.beat('pull-card', 'drag', 'the card follows the pointer'); await ctx.move(...mid(card, .3, .45), 1300);
    await ctx.at(24.2); ctx.beat('tilt', 'hover', 'tilt and glare'); await ctx.move(...mid(card, .62, .3), 700); await ctx.move(...mid(card, .4, .5), 800);
    await ctx.at(26.2); await ctx.move(...mid(flip), 850);
    await ctx.at(27.4); ctx.beat('flip', 'click', 'FLIP is a button'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    await ctx.at(29.8); await ctx.move(...mid(flip, .6, .45), 300);
    await ctx.at(31.0); ctx.beat('flip-back', 'click', 'and again'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  }
  // 7 · home: after, the nav falls back into a desk
  await ctx.at(32.8); { const p = mid(await ctx.box('.site-home'), .5, .45); ctx.beat('to-home', 'hover', 'to home', p); await ctx.move(...p, 900); }
  await ctx.at(34.2); ctx.beat('click-home', 'nav', 'home: after, the nav falls back into a desk; before, a hard cut'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForURL(/index\.html|\/$/, { waitUntil: 'load' });
  await ctx.at(37.2); await ctx.move(820, 420, 900);
  await ctx.at(38.6); ctx.mark('end');
};
