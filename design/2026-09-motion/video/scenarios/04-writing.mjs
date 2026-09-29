// Writing. Before: a flat shelf, chips above it, a preview card that swaps on hover.
// After: the bookcase — a hovered book slides out and turns its cover under a paper obi; the fore-edge
// index tabs reflow the shelf; a drag on the 正 year ledger picks a span; the pen marks hover and choice.
const POST_A = '2025-12-06_the-stories-we-live-05';
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/Writing.dc.html', { waitUntil: 'networkidle' });
  if (ctx.after) await page.waitForSelector('[data-mount=writing][data-ready]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  const mid = (b, fy = .5) => [b.x + b.width / 2, b.y + b.height * fy];
  // a spot on a book's spine, 35% down it
  const spine = (post) => page.evaluate(({ post, after }) => {
    const e = after ? document.querySelector(`.bk-hit[data-post="${post}"]`)
      : [...document.querySelectorAll('.shelf-row a.book')].find((a) => a.getAttribute('href').includes(post));
    const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * .35];
  }, { post, after: ctx.after });
  const byText = async (sel, text) => { const h = await page.$$(sel); for (const e of h) if ((await e.textContent()).trim().startsWith(text)) return e.boundingBox(); return null; };
  const tab = (cat) => ctx.after ? ctx.box(`.tb[data-cat="${cat}"]`) : byText('.chip', cat === 'all' ? 'All ·' : cat);
  const row = (y) => byText('.lg-row', String(y));
  await ctx.move(1180, 330, 200);
  ctx.mark('start');
  // 1 · hover a spine: the book comes out and turns its cover to you
  await ctx.at(0.4); { const [x, y] = await spine(POST_A); await ctx.move(x, y, 900); }
  // 2 · a tab: hover draws the pen line, the click reflows the shelf
  await ctx.at(4.0); { const b = await tab('travel log'); const [x, y] = ctx.after ? [b.x + b.width * .8, b.y + b.height / 2] : mid(b); await ctx.move(x, y, 900); }
  await ctx.at(5.4); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  // 3 · a span of years (after: drag the ledger; before: one year chip, the closest the old page gets)
  if (ctx.after) {
    await ctx.at(8.2); { const a = await row(2025); await ctx.move(...mid(a), 800); }
    await ctx.at(9.2); { const a = await row(2025), b = await row(2021); await ctx.drag(mid(a), mid(b), 1300, { pre: 10 }); }
  } else {
    await ctx.at(8.2); { const b = await byText('.chip', '2025'); await ctx.move(...mid(b), 800); }
    await ctx.at(9.2); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  }
  // 4 · the pen: pass over the other tabs (coral line comes and goes), the chosen one keeps its wheat band
  await ctx.at(12.4); { const b = await tab('stories we live'); const [x, y] = ctx.after ? [b.x + b.width * .8, b.y + b.height / 2] : mid(b); await ctx.move(x, y, 800); }
  await ctx.at(13.6); { const b = await tab('everyday chronicles'); const [x, y] = ctx.after ? [b.x + b.width * .8, b.y + b.height / 2] : mid(b); await ctx.move(x, y, 600); }
  await ctx.at(14.8); { const b = await tab('all'); const [x, y] = ctx.after ? [b.x + b.width * .8, b.y + b.height / 2] : mid(b); await ctx.move(x, y, 600); }
  await ctx.at(15.8); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(18.6); ctx.mark('end');
};
