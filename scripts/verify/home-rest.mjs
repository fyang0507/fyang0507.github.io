// Home · the desk at rest against today's (origin/main on :4174): both settled, every animation paused at its
// resting frame, the desk box diffed pixel by pixel. Criterion: ≤ 0.5 % of the desk's pixels differ at 1440.
//   node /tmp/fyshot/run.mjs scripts/verify/home-rest.mjs   then   uv run --with pillow --with numpy python scripts/verify/home-diff.py
// (1440 only: at 390 the phone desk is a different composition, the 09 D camera, by design.)
// env: BEFORE (:4174) · BASE (:4173). Since #17 merged, today's desk is #desk too (the redesign's own reference was .scene).
import fs from 'fs';
const BEFORE = process.env.BEFORE || 'http://127.0.0.1:4174/', BASE = process.env.BASE || 'http://127.0.0.1:4173/';
async function rest(page, url, sel) {
  await page.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch (e) {} });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);                 // entrances done (≤ 1.4 s), before either bird's first hop (≥ 2.5 s)
  await page.evaluate(() => document.getAnimations().forEach((a) => {
    const it = a.effect.getTiming().iterations;
    if (it === Infinity) { a.currentTime = 0; a.pause(); } else a.finish();
  }));
  await page.mouse.move(2, 2);
  await page.waitForTimeout(200);
  return page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); }, sel);
}
export default async (page, ctx) => {
  for (const [w, h] of [[1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    // today: its bird idles from x=14 facing left; ours rests the same way when nothing has played (?opx=1&opener=none)
    const a = await rest(page, BEFORE + 'index.html?opx=1&opener=none', '#desk, .scene');
    await ctx.shot(`/tmp/fyshot/p3-home/rest-before-${w}.png`);
    const b = await rest(page, BASE + 'index.html?opx=1&opener=none', '#desk');
    await ctx.shot(`/tmp/fyshot/p3-home/rest-after-${w}.png`);
    ctx.log(w, 'desk box before', JSON.stringify(a), 'after', JSON.stringify(b));
    fs.writeFileSync(`/tmp/fyshot/p3-home/rest-${w}.json`, JSON.stringify({ before: a, after: b }));
  }
};
