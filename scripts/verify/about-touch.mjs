// scripts/verify/about-touch.mjs — CDP touch on the production About page at 390×844 and 360×740 (W=, H= for one size).
// Vertical swipes scroll and leave the card alone; a sideways drag on the sliver pulls; taps and sideways drags flip
// the card in place (its untransformed centre ≤ 2 px); a thumb to the sleeve strip at the page edge puts it back.
import { URL, sleep, settle } from './about-lib.mjs';
const SIZES = process.env.W ? [[+process.env.W, +(process.env.H || 844)]] : [[390, 844], [360, 740]];

export default async (page0, ctx) => {
  let total = 0, failed = 0;
  for (const [W, H] of SIZES) {
    const context = await page0.context().browser().newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', e => { failed++; ctx.log('pageerror', e.message); });
    page.on('console', m => { if (m.type() === 'error') { failed++; ctx.log('console.error', m.text()); } });
    await page.goto(URL); await page.waitForSelector('[data-mount="about"][data-state]', { timeout: 20000 }); await sleep(600);
    await page.evaluate(() => sessionStorage.clear());
    const cdp = await context.newCDPSession(page);
    const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
    async function swipe(x0, y0, x1, y1, ms, prof = 'drag', pause = 0) {
      const ease = prof === 'flick' ? (t => (1 - Math.cos(t * .78 * Math.PI)) / (1 - Math.cos(.78 * Math.PI))) : (t => 1 - Math.pow(1 - t, 2.2));
      const n = Math.max(2, Math.round(ms / 8)); await T('touchStart', [{ x: x0, y: y0 }]); const t0 = Date.now();
      for (let i = 1; i <= n; i++) { const t = ease(i / n); T('touchMove', [{ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }]); const w = t0 + i * 8 - Date.now(); if (w > 0) await sleep(w); }
      if (pause) await sleep(pause);
      await T('touchEnd', []);
    }
    const top = async () => { await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300); };
    const info = () => page.evaluate(() => { const r = document.querySelector('[data-mount="about"]'); return { st: r.dataset.state, face: r.dataset.face, y: Math.round(scrollY), rel: r.dataset.release || '' }; });
    const free = async () => { await top(); if ((await info()).st !== 'free') { await page.touchscreen.tap(...(await centreOf('.ctl-pull'))); await settle(page, 6000); } };
    const centreOf = async sel => { const b = await (await page.$(sel)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
    const arm = () => page.evaluate(() => {
      const pos = document.querySelector('.card-pos'), b = pos.getBoundingClientRect();
      window.__c0 = [b.left + b.width / 2, b.top + b.height / 2 + scrollY]; window.__cmax = 0; window.__con = true;
      (function f() { if (!window.__con) return; const r = pos.getBoundingClientRect(); window.__cmax = Math.max(window.__cmax, Math.hypot(r.left + r.width / 2 - window.__c0[0], r.top + r.height / 2 + scrollY - window.__c0[1])); requestAnimationFrame(f); })();
    });
    let pass = 0, fail = 0;
    const run = async (name, fn, want) => {
      await arm(); const s0 = await info(); await fn(); await settle(page, 6000); await sleep(150); const s1 = await info();
      const dev = await page.evaluate(() => { window.__con = false; return window.__cmax; });
      const got = s1.st === 'tucked' && s0.st !== 'tucked' ? 'putback' : s1.st === 'free' && s0.st === 'tucked' ? 'pulled' : s1.face !== s0.face ? 'flip' : Math.abs(s1.y - s0.y) > 30 ? 'scroll' : 'nothing';
      const ok = got === want && (got !== 'flip' || dev <= 2); ok ? pass++ : fail++;
      ctx.log(`${ok ? 'PASS' : 'FAIL'} [${W}] ${name.padEnd(52)} want ${want.padEnd(7)} got ${got.padEnd(7)} | scrollΔ ${s1.y - s0.y}${got === 'flip' ? ' | centre max ' + dev.toFixed(1) + 'px' : ''} | ${s1.rel}`);
    };
    await top();
    let [gx, gy] = await centreOf('.grip');
    await run('(t0) vertical swipe on the sliver', () => swipe(gx, gy, gx, gy - 160, 220), 'scroll');
    await top(); [gx, gy] = await centreOf('.grip');
    await run('(t1) sideways drag on the sliver = pull', () => swipe(gx, gy, gx + 200, gy + 4, 500), 'pulled');
    await free();
    let [cx, cy] = await centreOf('.a-card');
    const zx = await page.evaluate(() => { const r = document.querySelector('[data-mount="about"]'), g = document.querySelector('.rig').getBoundingClientRect(), z = r.dataset.zone.split(',').map(Number); return Math.max(6, (g.left + z[1]) / 2); });
    await run('(t2) tap the card', () => page.touchscreen.tap(cx, cy), 'flip');
    await free(); await run('(t3) drag right on the card', () => swipe(cx - 40, cy, cx + 80, cy + 6, 300), 'flip');
    await free(); await run('(t4) quick flick right', () => swipe(cx, cy + 60, cx + 70, cy + 64, 80, 'flick'), 'flip');
    await free(); await run('(t5) drag left, half the way to the strip', () => swipe(cx, cy, cx - (cx - zx) * .5, cy - 4, 350), 'flip');
    await free(); await run('(t6) vertical swipe up on the card', () => swipe(cx, cy + 150, cx, cy - 60, 240), 'scroll');
    // Swiping down scrolls up, so it needs page above it: start 300 px down, with the card still under the finger.
    await free(); await page.evaluate(() => window.scrollTo(0, 300)); await sleep(250);
    let [dx7, dy7] = await centreOf('.a-card');
    await run('(t7) vertical swipe down on the card (from 300 px down)', () => swipe(dx7 + 30, dy7 - 60, dx7 + 26, dy7 + 160, 240), 'scroll');
    await free(); [cx, cy] = await centreOf('.a-card');
    await run('(t8) thumb to the sleeve strip, release', () => swipe(cx, cy, zx, cy + 10, 450), 'putback');
    await free(); [cx, cy] = await centreOf('.a-card');
    await run('(t9) thumb to the strip slowly, low on the card, pause', () => swipe(cx + 20, cy + 180, zx, cy + 190, 900, 'drag', 400), 'putback');
    await free(); [cx, cy] = await centreOf('.a-card');
    await run('(t10) fast thumb swipe to the strip', () => swipe(cx, cy, zx - 4, cy, 110, 'flick'), 'putback');
    await free(); await run('(t11) thumb toward the strip, stops short', () => swipe(cx, cy, cx - (cx - zx) * .8, cy, 400, 'drag', 150), 'flip');
    await free(); const fb = await (await page.$('.sl-front')).boundingBox();
    await run('(t12) tap the sleeve strip while holding the card', async () => { await page.touchscreen.tap(Math.max(fb.x + fb.width - 14, 24), fb.y + fb.height / 2); await sleep(300); }, 'nothing');
    await free(); await run('(t13) slow sideways drag right, released in open space', () => swipe(cx, cy, cx + 50, cy + 30, 800, 'drag', 250), 'flip');
    const dw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (dw > W) { fail++; ctx.log(`FAIL [${W}] horizontal overflow ${dw}`); }
    ctx.log(`[${W}] ${pass} pass, ${fail} fail · scrollWidth ${dw} of ${W}`);
    total += pass + fail; failed += fail;
    await context.close();
  }
  ctx.log(`about-touch: ${total - failed}/${total} pass`);
};
