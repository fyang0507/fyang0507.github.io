// building-motion.mjs — Building's corkboard, motion criteria (PORT-PLAN §2 P2-building, §5 named invariants).
//   node /tmp/fyshot/run.mjs scripts/verify/building-motion.mjs
//   env: BASE (default http://127.0.0.1:4173/) · SHOTS (default /tmp/fyshot/p2b)
// The flower is pressed by each cause — first view (once per session, fy-flower-<id>), mouse entry (once
// per entry), keyboard focus from outside, return into view, re-pin — and any two presses are ≥ 1.4 s
// apart. Held frames: the press keyframes carry steps(1,end) per keyframe and three samples of the pin's
// re-pin press show ≥ 2 distinct frames. Touch (CDP): a > 6 px horizontal move drags the board, a
// vertical one leaves it to the page, a tap unpins, a swipe away and back presses the flower. Idle: 0 rAF.

const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS || '/tmp/fyshot/p2b';
const COOL = 1400;
const held = (e) => e === 'steps(1)' || e === 'steps(1, end)';   // the browser writes steps(1, end) as steps(1)

async function open(browser, o) {
  const context = await browser.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: 1, hasTouch: !!o.touch, isMobile: !!o.touch });
  const page = await context.newPage();
  const bad = [];
  page.on('pageerror', (e) => bad.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bad.push('console.error: ' + m.text()); });
  await page.addInitScript(() => {   // test instruments: rAF calls, and the time of every flower press
    const raf = window.requestAnimationFrame.bind(window);
    window.__rafN = 0; window.requestAnimationFrame = (cb) => { window.__rafN++; return raf(cb); };
    window.__presses = [];
    new MutationObserver((ms) => ms.forEach((m) => { if (m.attributeName === 'data-flower-presses') window.__presses.push([Math.round(performance.now()), m.target.dataset.flowerCause]); }))
      .observe(document, { attributes: true, subtree: true, attributeFilter: ['data-flower-presses'] });
  });
  if (process.env.BUILDING_PRE) await (await import(process.env.BUILDING_PRE)).devSetup(page);
  await page.goto(BASE + 'Building.dc.html', { waitUntil: 'load' });
  await page.waitForSelector('.cork .slot--lead .stk', { state: 'attached', timeout: 10000 });
  return { context, page, bad };
}
const presses = (page) => page.evaluate(() => window.__presses.slice());
const box = (page, sel) => page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, sel);
const trackX = (page) => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.cork-track')).transform).m41);

export default async (page0, ctx) => {
  const browser = page0.context().browser();
  const fails = [], note = (ok, what) => { ctx.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails.push(what); };

  /* ---- 1440, mouse and keyboard: every cause, the cooldown, held frames, idle ---- */
  {
    const { context, page, bad } = await open(browser, { w: 1440, h: 900 });
    await page.waitForTimeout(1500);
    let p = await presses(page);
    const key = await page.evaluate(() => sessionStorage.getItem('fy-flower-fred-agent'));
    note(p.length === 1 && p[0][1] === 'first view' && key === '1', `first view presses once and is remembered for the session (${JSON.stringify(p)}, key ${key})`);

    const t = await box(page, '.slot--lead .highlighted-title');
    await page.mouse.move(20, 20); await page.waitForTimeout(COOL);
    await page.mouse.move(t.x + 80, t.y + 30); await page.waitForTimeout(150);
    // the held frame, sampled three times inside the press
    const flowerKf = await page.evaluate(() => {
      const a = document.querySelector('.slot--lead .stk').getAnimations().find((x) => x.effect.getKeyframes().length > 3);
      return a ? a.effect.getKeyframes().map((k) => k.easing) : [];
    });
    note(flowerKf.some(held), `the flower's press holds its lifted pose on a steps(1,end) keyframe (${flowerKf.join(' | ')})`);
    await page.mouse.move(t.x + 300, t.y + 80); await page.waitForTimeout(600);        // moving inside the card: no second press
    await page.mouse.move(20, 20); await page.waitForTimeout(200);
    await page.mouse.move(t.x + 80, t.y + 30); await page.waitForTimeout(400);         // back in within the cooldown: no press
    p = await presses(page);
    note(p.length === 2 && p[1][1] === 'hover', `mouse entry presses once per entry, and the cooldown holds a quick re-entry (${p.map((x) => x[1]).join(', ')})`);
    await page.mouse.move(20, 20); await page.waitForTimeout(COOL);
    await page.mouse.move(t.x + 80, t.y + 30); await page.waitForTimeout(300);
    p = await presses(page);
    note(p.length === 3 && p[2][1] === 'hover', 'after the cooldown, a new entry presses again');

    // keyboard focus arriving from outside the card
    await page.mouse.move(20, 20); await page.waitForTimeout(COOL);
    await page.evaluate(() => document.querySelector('.cork-viewport').focus());
    await page.keyboard.press('Tab'); await page.waitForTimeout(300);
    p = await presses(page);
    const focused = await page.evaluate(() => document.activeElement.matches('.slot--lead .unpin-trigger'));
    note(focused && p.length === 4 && p[3][1] === 'focus', 'Tab onto the lead card presses it (focus-visible from outside)');
    await page.keyboard.press('Tab'); await page.waitForTimeout(300);
    note((await presses(page)).length === 4, 'Tab on to the card\'s own link does not press again');

    // return into view: End takes the lead off the board, Home brings it back; pressed once the board rests
    await page.waitForTimeout(COOL);
    await page.evaluate(() => document.querySelector('.cork-viewport').focus());
    await page.keyboard.press('End'); await page.waitForTimeout(1600);
    await page.keyboard.press('Home'); await page.waitForTimeout(1900);
    p = await presses(page);
    note(p.length === 5 && p[4][1] === 'return', `the card coming back into view presses it (${p.map((x) => x[1]).join(', ')})`);

    // re-pin: the pin's thump presses the flower; the pin's press steps through held frames
    await page.waitForTimeout(COOL);
    await page.mouse.click(t.x + 400, t.y + 170);   // the card body, below the title: unpins
    await page.waitForTimeout(1300);
    note(await page.evaluate(() => !document.querySelector('.unpin-layer').hidden), 'a click on the card body unpins it');
    await page.evaluate(() => {   // sample the pin while it is pushed back in (hand's clock: three held frames)
      window.__pin = [];
      const pin = document.querySelector('.slot--lead .board-pin'), t0 = { v: 0 };
      new MutationObserver(function (ms, mo) {
        if (!document.querySelector('.slot--lead').contains(document.querySelector('.slot--lead .swing'))) return;
        mo.disconnect(); t0.v = performance.now();
        (function f() { const a = pin.getAnimations()[0]; window.__pin.push([Math.round(performance.now() - t0.v), getComputedStyle(pin).transform, a ? a.effect.getKeyframes().map((k) => k.easing).join('|') : '']); if (performance.now() - t0.v < 240) requestAnimationFrame(f); })();
      }).observe(document.querySelector('.slot--lead'), { childList: true });
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
    p = await presses(page);
    note(p[p.length - 1][1] === 're-pin', `pinning it back presses it (${p.map((x) => x[1]).join(', ')})`);
    const pin = await page.evaluate(() => window.__pin);
    const inPress = pin.filter((s) => s[0] < 210), picks = [inPress[1], inPress[Math.floor(inPress.length / 2)], inPress[inPress.length - 2]].filter(Boolean);
    const distinct = new Set(picks.map((s) => s[1])).size, kf = (inPress.find((s) => s[2]) || [])[2] || '';
    note(distinct >= 2 && kf.split('|').slice(0, -1).every(held), `the pin's re-pin press: steps(1,end) on each keyframe (${kf}), 3 samples show ${distinct} distinct frames`);

    const gaps = p.slice(1).map((x, i) => x[0] - p[i][0]);
    note(gaps.every((g) => g >= COOL), `any two presses are ≥ 1.4 s apart (gaps ${gaps.join(', ')} ms)`);

    // idle: nothing asks for a frame once everything has settled
    await page.mouse.move(20, 20); await page.waitForTimeout(2000);
    await page.evaluate(() => { window.__rafN = 0; });
    await page.waitForTimeout(2000);
    const n = await page.evaluate(() => window.__rafN);
    note(n === 0, `idle: ${n} rAF callbacks in 2 s`);
    note(!bad.length, '1440 motion run: 0 errors' + (bad.length ? ' — ' + bad.join(' ; ') : ''));
    await context.close();
  }

  /* ---- phones, touch (CDP): drag threshold, vertical scroll, tap unpins, swipe away and back ---- */
  for (const [W, H] of [[390, 844], [360, 800]]) {
    const { context, page, bad } = await open(browser, { w: W, h: H, touch: true });
    await page.evaluate(() => document.querySelector('.cork').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(2200);
    const cdp = await context.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y })) });
    const vp = await box(page, '.cork-viewport'), y = vp.y + 330, x0 = vp.x + vp.w - 60;
    const tx0 = await trackX(page);
    await touch('touchStart', [[x0, y]]); await touch('touchMove', [[x0 - 4, y]]); await page.waitForTimeout(50);
    const tx4 = await trackX(page);
    await touch('touchMove', [[x0 - 12, y]]); await touch('touchMove', [[x0 - 40, y]]); await page.waitForTimeout(50);
    const tx40 = await trackX(page);
    await touch('touchEnd', []); await page.waitForTimeout(900);
    note(tx4 === tx0 && tx40 < tx0 - 20, `${W} touch: 4 px moves nothing, past 6 px the board follows the thumb (${tx0} → ${tx4} → ${tx40})`);

    await page.evaluate(() => window.__presses.length = 0);
    await page.waitForTimeout(1500);   // let the drag's fling come to rest
    const sy0 = await page.evaluate(() => scrollY), txv = await trackX(page);
    await touch('touchStart', [[vp.x + 150, y]]);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', [[vp.x + 150, y - i * 12]]); await page.waitForTimeout(16); }
    await touch('touchEnd', []); await page.waitForTimeout(700);
    const sy1 = await page.evaluate(() => scrollY), txv1 = await trackX(page);
    note(txv1 === txv && sy1 !== sy0, `${W} touch: a vertical move scrolls the page (${sy0} → ${sy1}) and leaves the board (${txv} → ${txv1})`);

    // swipe the lead away and back: pressed once the board rests
    await page.evaluate(() => document.querySelector('.cork').scrollIntoView({ block: 'start' })); await page.waitForTimeout(COOL);
    const v2 = await box(page, '.cork-viewport'), y2 = v2.y + 330;
    const swipe = async (a, b) => { await touch('touchStart', [[a, y2]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[a + (b - a) * i / 10, y2]]); await page.waitForTimeout(16); } await touch('touchEnd', []); };
    await swipe(vp.x + vp.w - 20, vp.x + 20); await page.waitForTimeout(600);
    await swipe(vp.x + vp.w - 20, vp.x + 20); await page.waitForTimeout(1200);
    for (let i = 0; i < 4; i++) { await swipe(vp.x + 20, vp.x + vp.w - 20); await page.waitForTimeout(450); }   // back to the start: the edge holds it
    await page.waitForTimeout(1800);
    const pt = await presses(page);
    note(pt.some((q) => q[1] === 'return') && !pt.some((q) => q[1] === 'hover'), `${W} touch: swiping the lead away and back presses it, and touch never counts as hover (${pt.map((q) => q[1]).join(', ')})`);

    // a tap on a card unpins it (a tap is never a press)
    const lead = await box(page, '.slot--lead .highlighted-note');
    await touch('touchStart', [[lead.x + 40, lead.y + 10]]); await touch('touchEnd', []); await page.waitForTimeout(1200);
    const tapped = await page.evaluate(() => ({ open: !document.querySelector('.unpin-layer').hidden, n: window.__presses.filter((q) => q[1] !== 'return').length }));
    note(tapped.open && tapped.n === 0, W + ' touch: a tap on the card unpins it and does not press the flower');
    await page.screenshot({ path: `${SHOTS}-tap-${W}.png` });
    note(!bad.length, W + ' touch run: 0 errors' + (bad.length ? ' — ' + bad.join(' ; ') : ''));
    await context.close();
  }

  ctx.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  if (fails.length) process.exitCode = 1;
};
