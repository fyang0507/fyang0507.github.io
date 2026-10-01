// Principles, read. Before (#17): the old sub-site, templated (it waits for React), with a gradient in the title and an
// "On this page" list in the left column. After (#32): the chapter as a static page, and Reading's pencil margin as its
// table of contents: the rail is drawn down the margin as the page opens, the graphite follows the reading, the pen's
// wheat loop rings the current principle, and pointing at a number slides out its preview slip.
// Both sides scroll to the same principles (their offsets differ), with real wheel input. The segment starts at the
// page load, on a paper-coloured blank.
const top = (page, id) => page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id);
export default async (page, ctx) => {
  await ctx.context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
  await page.setContent('<html style="background:#FBF6EC"></html>');
  await page.waitForTimeout(400);
  await ctx.move(1180, 640, 0);
  ctx.mark('start');
  // 1 · the page arrives (after: the rail is drawn down the margin)
  await page.goto(ctx.base + '/building/fred-agent/principles.html', { waitUntil: 'load' });
  await page.waitForSelector('#capture');
  // 2 · read down to principle 03
  await ctx.at(2.8); await ctx.wheelTo(await top(page, 'capture') - 140, 4200);
  // 3 · point at 05 in the table of contents (after: the rail's number, and its slip)
  await ctx.at(7.6); {
    const b = ctx.after
      ? await page.$$eval('.rail-lab', (as) => { const a = as.find((x) => x.textContent.trim() === '05'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })
      : await page.$$eval('a[href="#attention"]', (as) => { const a = as.find((x) => x.getBoundingClientRect().width); const r = a.getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 }; });
    await ctx.move(b.x, b.y, 900);
  }
  // 4 · back to the text, and on to principle 06 (after: the loop moves down the rail)
  await ctx.at(10.0); await ctx.move(1180, 640, 700);
  await ctx.at(10.8); await ctx.wheelTo(await top(page, 'shared-state') - 140, 2800);
  await ctx.at(15.0); ctx.mark('end');
};
