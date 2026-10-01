// Unpinning Fred Agent, and pinning it back. Before (#17): the card comes to your hand with a thin field note under
// it (one link in, one to the repository). After (#28): the dossier slides out from under the card on a spring, open
// at its contents sheet: five chapters with a line each, the one figure, status and dates, and the index tabs down its
// fore-edge. The peeking tabs tuck behind the card while it is out. "Pin it back" slides the dossier up behind the
// card, the pin goes in, the cork ripples, and the tabs spring back out.
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  await page.goto(ctx.base + '/Building.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2400);
  await ctx.move(1150, 300, 200);
  ctx.mark('start');
  // 1 · point at the title, then take the card down
  await ctx.at(0.3); { const b = await ctx.box('.slot--lead .unpin-trigger'); await ctx.move(...mid(b, .45, .55), 900); }
  await ctx.at(1.6); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForSelector('.unpin-close');
  // 2 · the sheet: after, a chapter on the contents (the pen underlines its title); before, the note's one link in
  await ctx.at(4.0); {
    const b = ctx.after ? await page.$$eval('.dos-list .dl-t .pen-t', (e) => { const r = e[2].getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }) : await ctx.box('.unpin-cta');
    await ctx.move(...mid(b, .6, .5), 800);
  }
  // 3 · after, down the fore-edge to a tab; before, across to the repository link
  await ctx.at(5.8); { const b = ctx.after ? (await page.$$('.dos-tabs .dos-tab'))[1] : await page.$('.unpin-panel .github-link, .unpin-layer .github-link'); await ctx.move(...mid(await b.boundingBox(), .5, .5), 800); }
  // 4 · pin it back
  await ctx.at(7.6); { const b = await ctx.box('.unpin-close .pen-t'); await ctx.move(...mid(b), 800); }
  await ctx.at(8.8); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await ctx.at(10.4); await ctx.move(1150, 300, 900);
  await ctx.at(12.0); ctx.mark('end');
};
