// scripts/verify/about-gestures.mjs — the r7 gesture suite on the production About page, with a mouse.
//   node /tmp/fyshot/run.mjs scripts/verify/about-gestures.mjs            (1440, 390 and 360)
//   VP=390 node /tmp/fyshot/run.mjs scripts/verify/about-gestures.mjs     (one size)
// Every flip case asserts the card's untransformed centre moves ≤ 2 px on every sampled frame, during the drag
// and after release (it should be 0.0). Cases that pass the pointer through the sleeve zone may take the card to
// the mouth, but must end exactly where they started. Put-backs must end tucked.
import { open, S, settle, pullOut, zone, card, path, sampleArm, sampleRead, docW } from './about-lib.mjs';
const SIZES = { 1440: [1440, 900], 390: [390, 844], 360: [360, 740] };

export default async (page, ctx) => {
  let total = 0, failed = 0;
  for (const key of (process.env.VP ? [process.env.VP] : ['1440', '390', '360'])) {
    const [w, h] = SIZES[key];
    await open(page, w, h);
    await page.evaluate(() => sessionStorage.clear());
    let pass = 0, fail = 0;
    const run = async (name, fn, want, travel = false) => {
      await pullOut(page); await page.waitForTimeout(120);
      const s0 = await S(page); await sampleArm(page);
      const ms = await fn(); await settle(page); await page.waitForTimeout(200);
      const s1 = await S(page), d = await sampleRead(page);
      const m = /([+-]?\d+)$/.exec(s1.rel), turn = m ? +m[1] : 0;
      const got = s1.st === 'tucked' ? 'putback' : s1.face !== s0.face ? (turn > 0 ? 'flip→' : 'flip←') : 'nothing';
      const outcome = want === got || (want === 'flip' && got.startsWith('flip'));
      const still = want === 'putback' ? true : travel ? d.end <= 1 : d.max <= 2;
      const dw = await docW(page), wide = dw > w;
      const ok = outcome && still && !wide; ok ? pass++ : fail++;
      ctx.log(`${ok ? 'PASS' : 'FAIL'} [${key}] ${name.padEnd(54)} want ${want.padEnd(7)} got ${got.padEnd(7)} | centre max ${d.max.toFixed(1)}px end ${d.end.toFixed(1)}px · ${d.frames} frames | ${s1.rel}${ms ? ' | ' + ms + 'ms' : ''}${wide ? ' | OVERFLOW ' + dw : ''}`);
    };
    await pullOut(page);
    const b = await card(page), cx = b.x + b.width / 2, cy = b.y + b.height / 2, z = await zone(page);
    const zx = Math.max(4, (Math.max(z.x0, 2) + z.x1) / 2), T = cx - z.x1;
    ctx.log(`[${key}] pointer travel from the card's centre to the zone: ${Math.round(T)} px · zone ${Math.round(Math.max(0, z.x0))}–${Math.round(z.x1)} (${Math.round(z.x1 - Math.max(0, z.x0))} px wide)`);
    await run('(f1) short slow drag right, 40px / 400ms', () => path(page, cx, cy, cx + 40, cy + 3, 400), 'flip→');
    await run('(f2) short fast drag left, 40px / 60ms', () => path(page, cx, cy, cx - 40, cy - 2, 60, { profile: 'flick' }), 'flip←');
    await run('(f3) long slow drag right, 260px / 900ms, pause', () => path(page, cx - 60, cy, cx + 200, cy + 20, 900, { pause: 150 }), 'flip→');
    await run('(f4) long fast drag right, 260px / 170ms', () => path(page, cx - 60, cy, cx + 200, cy + 10, 170, { profile: 'flick' }), 'flip→');
    await run('(f5) long slow drag left, stops 0.8 of the way', () => path(page, cx, cy + 30, cx - T * .8, cy + 40, 800, { pause: 150 }), 'flip←');
    await run('(f6) fast drag left, stops 0.85 of the way', () => path(page, cx, cy, cx - T * .85, cy - 6, 120, { profile: 'flick' }), 'flip←');
    await run('(f7) nearly vertical drag down, 160px', () => path(page, cx, cy - 100, cx + 6, cy + 60, 500), 'flip→');
    await run('(e1) starts next to the sleeve, moves away', () => path(page, b.x + 10, cy - 80, b.x + 120, cy - 76, 300), 'flip→');
    await run('(s1) toward the sleeve, stops just short of the zone', () => path(page, cx, cy, z.x1 + 10, cy, 700, { pause: 200 }), 'flip←');
    if (w >= 720) await run('(p1) over the sleeve, ends past its far side', () => path(page, cx, cy, z.x0 - 40, cy, 1000), 'flip←', true);
    else await run('(p1) through the zone, ends past it (below)', () => path(page, cx, cy, zx, z.y1 + 30, 1000, { via: [zx, cy] }), 'flip←', true);
    await run('(i1) into the zone and back out', () => path(page, cx, cy, cx + 30, cy + 6, 1100, { via: [zx, cy] }), 'flip→', true);
    await run('(b1) pointer into the zone slowly, stop, release', () => path(page, cx, cy, zx, cy, 800, { pause: 150 }), 'putback');
    await run('(b2) pointer into the zone fast, released moving', () => path(page, cx, cy, z.x1 - 16, cy - 10, 110, { profile: 'linear' }), 'putback');
    await run('(b3) pointer into the zone, 600ms pause, release', () => path(page, cx, cy + 50, zx, cy + 60, 500, { pause: 600 }), 'putback');
    await run('(t1) tap the card', async () => { await page.mouse.click(cx, cy); return 0; }, 'flip→');
    const fb = await (await page.$('.sl-front')).boundingBox();
    await run('(t2) tap the sleeve while holding the card', async () => { await page.mouse.click(Math.max(fb.x + fb.width - 12, 8), fb.y + fb.height * .5); await page.waitForTimeout(300); return 0; }, 'nothing');
    const dw = await docW(page);
    if (dw > w) { fail++; ctx.log(`FAIL [${key}] horizontal overflow: scrollWidth ${dw} > ${w}`); }
    ctx.log(`[${key}] ${pass} pass, ${fail} fail · scrollWidth ${dw} of ${w}`);
    total += pass + fail; failed += fail;
  }
  ctx.log(`about-gestures: ${total - failed}/${total} pass`);
};
