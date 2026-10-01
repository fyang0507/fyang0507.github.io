// Opening a chapter from the board. Before (#17): the note's "Enter the field notes" opens the old sub-site's overview,
// and its own pill nav swaps Principles in place (a fetch-and-swap router). After (#28, #32): the dossier's "03
// principles" tab opens the chapter, a static page in the dossier's look: the sheet with its kraft edge, the typed file
// label, the card clipped to the corner, and the tabs down the fore-edge with the current one pulled out and banded.
// Until PR 3 the way in is a hard cut; re-record this one when the tabs fly to the page's fore-edge.
const mid = (b, fx = .5, fy = .5) => [b.x + b.width * fx, b.y + b.height * fy];
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  await page.goto(ctx.base + '/Building.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2400);
  await ctx.move(1150, 300, 200);
  ctx.mark('start');
  // 1 · take the card down
  await ctx.at(0.3); { const b = await ctx.box('.slot--lead .unpin-trigger'); await ctx.move(...mid(b, .45, .55), 800); }
  await ctx.at(1.3); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForSelector('.unpin-close');
  // 2 · after: the principles tab on the dossier's fore-edge; before: the note's way in
  await ctx.at(3.2); { const b = ctx.after ? (await page.$$('.dos-tabs .dos-tab'))[2] : await page.$('.unpin-cta'); await ctx.move(...mid(await b.boundingBox(), .5, .5), 800); }
  await ctx.at(4.4); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
  await page.waitForLoadState('load');
  // 3 · before: the overview; its pill nav swaps Principles in. After: already there; the pointer passes the next tab
  if (ctx.after) {
    await ctx.at(6.6); { const b = await page.waitForSelector('.pj-tabs .dos-tab:nth-child(4)'); await ctx.move(...mid(await b.boundingBox(), .5, .5), 900); }
    await ctx.at(8.2); await ctx.move(700, 620, 900);
  } else {
    await ctx.at(6.6); { const b = await page.waitForSelector('.fa-project-nav a[href$="principles.html"]'); await ctx.move(...mid(await b.boundingBox(), .5, .5), 900); }
    await ctx.at(7.8); await page.mouse.down(); await page.waitForTimeout(90); await page.mouse.up();
    await ctx.at(8.6); await ctx.move(700, 620, 500);
  }
  await ctx.at(10.4); ctx.mark('end');
};
