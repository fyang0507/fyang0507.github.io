// s2 · Writing → Building → Fred Agent's Principles → back to the board, one session, real input.
// After (origin/main): the tab move into Building; the first view presses the flower onto the lead card, pointing at
// it pops it again; the board flung and brought back, the cards swinging on their pins; Fred Agent unpinned into
// the hand, its dossier sliding out; the dossier's 03 tab flies the tabs to the chapter's fore-edge (#35) and the
// rail is drawn down the margin; scrolled, the loop moves down the rail; "← Building board" is the way back: the card
// brought into view, the tabs tucked under it, the pin pressed in.
// Before (6237120): a hard cut into a scrolling strip of cards (a trackpad swipe moves it); the Fred Agent card is a
// link into the old field notes; its pill nav swaps Principles in; the nav's building tab cuts back to the board.
async function wheelTo(page, y1, ms) {
  const y0 = await page.evaluate(() => scrollY);
  const steps = Math.max(2, Math.round(ms / 16)), ts = Date.now();
  let sent = 0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const d = Math.round((y1 - y0) * e) - sent;
    if (d) { await page.mouse.wheel(0, d); sent += d; }
    await page.waitForTimeout(Math.max(0, ts + ms * t - Date.now()));
  }
}
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.goto(ctx.base + '/Writing.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2600);
  await ctx.move(900, 560, 200);
  const tab = await ctx.box('.site-tab--building'); const [tx, ty] = mid(tab, .5, .45);
  // before: a horizontal wheel on the strip (a trackpad swipe); after: a fling of the board
  const wheel = async (dx, ms) => {
    const n = Math.round(ms / 33), t0 = Date.now(), e = (k) => 1 - Math.pow(1 - k / n, 2);
    for (let i = 1; i <= n; i++) { await page.mouse.wheel(dx * (e(i) - e(i - 1)), 0); await page.waitForTimeout(Math.max(0, t0 + ms * i / n - Date.now())); }
  };
  const fling = async ([x0, y0], [x1, y1], ms) => {
    await ctx.move(x0, y0, 300); await page.mouse.down(); await page.waitForTimeout(80);
    const n = Math.round(ms / 16), t0 = Date.now();
    for (let i = 1; i <= n; i++) { const t = i / n, e = t * t * (1.6 - 0.6 * t); await page.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e); await page.waitForTimeout(Math.max(0, t0 + ms * t - Date.now())); }
    await page.mouse.up(); await ctx.move(x1, y1, 0);
  };
  ctx.mark('start');
  // 1 · the nav's building tab
  await ctx.at(0.3); ctx.beat('to-building-tab', 'hover', 'to the nav\'s building tab', [tx, ty]); await ctx.move(tx, ty, 850);
  await ctx.at(1.9); ctx.beat('click-building', 'nav', 'building: after, the tab move (and the flower pressed on first view); before, a hard cut'); await ctx.click(tx, ty, 0);
  await page.waitForURL(/Building/, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
  // 2 · point at the lead card: the flower pops and is pressed again
  await ctx.at(4.6); { const b = await ctx.box(ctx.after ? '.slot--lead .highlighted-title' : '.card-slot--highlighted .highlighted-title'); const p = [b.x + 170, b.y + 40]; ctx.beat('point-lead', 'hover', 'pointing at the lead card: the flower pops and is pressed again', p); await ctx.move(...p, 800); }
  // 3 · fling the board and bring it back: the cards swing on their pins (before: the strip scrolls)
  await ctx.at(6.6); await ctx.move(1060, 890, 600);
  if (ctx.after) {
    await ctx.at(7.4); ctx.beat('fling', 'drag', 'the board flung left: the cards swing on their pins'); await fling([1060, 890], [420, 880], 650);
    await ctx.at(10.0); ctx.beat('fling-back', 'drag', 'and brought back'); await fling([420, 880], [1080, 890], 650);
  } else {
    await ctx.at(7.4); ctx.beat('fling', 'drag', 'the strip swiped left'); await wheel(640, 800);
    await ctx.at(10.0); ctx.beat('fling-back', 'drag', 'and back'); await ctx.move(420, 880, 300); await wheel(-660, 800);
  }
  // 4 · Fred Agent: after, unpinned into the hand, the dossier slides out; before, the card is a link into the field notes
  await ctx.at(12.6); { const b = await ctx.box(ctx.after ? '.slot--lead .unpin-trigger' : '.card-slot--highlighted .highlighted-title'); const p = mid(b, .45, .55); ctx.beat('to-card', 'hover', 'to the Fred Agent card', p); await ctx.move(...p, 800); }
  await ctx.at(13.6); ctx.beat('take-card', 'click', 'after: the pin pops, the card comes to your hand, the dossier slides out; before: into the old field notes'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  if (ctx.after) await page.waitForSelector('.unpin-close'); else await page.waitForURL(/fred-agent/, { waitUntil: 'load' });
  // 5 · into Principles: after, the dossier's 03 tab (the tabs fly to the chapter's fore-edge); before, the pill nav
  await ctx.at(16.4); {
    const b = ctx.after ? await (await page.$$('.dos-tabs .dos-tab'))[2].boundingBox() : await (await page.waitForSelector('.fa-project-nav a[href$="principles.html"]')).boundingBox();
    const p = mid(b); ctx.beat('to-principles', 'hover', ctx.after ? 'the dossier\'s 03 principles tab' : 'the pill nav\'s principles', p); await ctx.move(...p, 800);
  }
  await ctx.at(17.6); ctx.beat('open-principles', 'nav', 'after: the tabs fly to the chapter\'s fore-edge (#35), the rail is drawn; before: the pill nav swaps Principles in'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  if (ctx.after) await page.waitForURL(/principles/, { waitUntil: 'load' });
  await page.waitForSelector('#capture', { timeout: 15000 });
  await ctx.move(700, 640, 500);
  // 6 · read down to principle 03: the loop moves down the rail
  await ctx.at(21.2); { const y = await page.evaluate(() => Math.round(document.getElementById('capture').getBoundingClientRect().top + scrollY)); ctx.beat('scroll-principles', 'scroll', 'down to principle 03: the graphite follows, the loop moves down the rail'); await wheelTo(page, y - 140, 3200); }
  // 7 · on to the chapter's end, and the way back to the board ("← Building board" closes the chapter)
  await ctx.at(25.0); { const y = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight); ctx.beat('scroll-end', 'scroll', 'on down to the chapter\'s end'); await wheelTo(page, y, 2200); }
  await page.waitForTimeout(150);
  await ctx.at(27.6); {
    const p = await page.evaluate((after) => {
      const vis = (a) => { const r = a.getBoundingClientRect(); return r.width && r.top > 60 && r.bottom < innerHeight - 10; };
      const a = after ? document.querySelector('.pj-back') : [...document.querySelectorAll('a[href*="Building.dc.html"]')].filter(vis).pop();
      const r = a.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
    }, ctx.after);
    ctx.beat('to-back', 'hover', ctx.after ? '← Building board' : 'the old page\'s link back to Building', p); await ctx.move(...p, 800);
  }
  await ctx.at(28.8); ctx.beat('way-back', 'nav', 'after: the way back, the card brought into view, the tabs tuck under it, the pin pressed in; before: a hard cut'); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForURL(/Building\.dc/, { waitUntil: 'load' });
  await ctx.at(31.8); await ctx.move(1150, 330, 900);
  await ctx.at(33.4); ctx.mark('end');
};
