// Building on a phone. Before (#17): a tap on Fred Agent brings the card to your hand with its thin field note.
// After (#28): the dossier slides out under the card; with no room beside the sheet, its index tabs stand on its top
// edge, numbers only, as tabs (the contents below name them); the hand's layer scrolls so the whole dossier fits.
// The board's cards are narrower, so the peeking tabs sit inside the cork.
export const viewport = [390, 844];
const centre = async (page, sel) => { const b = await page.waitForSelector(sel).then((e) => e.boundingBox()); return [b.x + b.width / 2, b.y + b.height / 2]; };
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); sessionStorage.setItem('fy-flower-fred-agent', '1'); } catch {} });
  await page.goto(ctx.base + '/Building.dc.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2600);
  ctx.mark('start');
  // 1 · take Fred Agent down
  await ctx.at(0.6); await ctx.tap(...await centre(page, '.slot--lead .unpin-trigger'));
  // 2 · read down the sheet, and back up
  await ctx.at(3.0); await ctx.swipe([200, 700], [200, 260], 520);
  await ctx.at(5.2); await ctx.swipe([200, 300], [200, 760], 520);
  // 3 · pin it back
  await ctx.at(7.0); await ctx.tap(...await centre(page, '.unpin-close .pen-t'));
  await ctx.at(9.4); ctx.mark('end');
};
