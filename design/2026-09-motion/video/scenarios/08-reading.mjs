// Reading a cover-image essay. Before: the sticky nav is transparent, so the cover and then the text slide under it;
// citations sit in the margin in a hand font. After: the cover dissolves into halftone as you scroll and the title
// lands in the header; a pencil rail draws the essay's sections in the left margin; hovering a footnote plays the
// pen gesture and tugs its paper slip over.
const POST = '2026-08-29_google-just-wants-to-coast-to-a-win';

// Real wheel input, eased over `ms`: small per-frame deltas so the page scrolls like a trackpad, not a jump.
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
const refAt = (page, n) => page.evaluate((n) => {
  const a = [...document.querySelectorAll('.fnref a')].find((x) => x.offsetParent && x.textContent.trim() === String(n));
  const r = a.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, n);

export default async (page, ctx) => {
  await page.goto(ctx.base + '/Reading.dc.html?post=' + POST, { waitUntil: 'load' });
  if (ctx.after) await page.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2200);
  await ctx.move(1238, 640, 200);
  ctx.mark('start');
  // beat 1: scroll off the cover
  await ctx.at(0.5); await wheelTo(page, 600, 4000);
  // beat 2: into the text; the nav, the rail
  await ctx.at(5.1); await wheelTo(page, 1150, 2200);
  // beat 3: hover footnote 2
  await ctx.at(7.9);
  const r = await refAt(page, 2);
  await ctx.move(r.x, r.y, 700);
  // beat 4: after, hover a rail label for its peek; before, the hand-set citation in the margin
  await ctx.at(10.6);
  const pick = ctx.after
    ? await page.$$eval('.rail-lab', (as) => { const a = as.find((x) => x.textContent.trim() === '4.0') || as[3]; const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })
    : await page.$$eval('.mn', (ms) => { const m = ms.find((x) => { const r = x.getBoundingClientRect(); return r.width && r.top > 200 && r.top < 800; }); const r = m.getBoundingClientRect(); return { x: r.left + r.width * .45, y: r.top + 14 }; });
  await ctx.move(pick.x, pick.y, 800);
  await ctx.at(13.0); ctx.mark('end');
};
