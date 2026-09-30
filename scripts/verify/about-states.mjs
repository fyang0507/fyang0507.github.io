// scripts/verify/about-states.mjs — keyboard, the focus-only put-back, the cue's once-per-session rule, reduced motion,
// no infinite animations, an idle page (0 rAF callbacks at rest), no overflow, and the WeChat QR fetched only when its
// slip first opens, on the production About page.
import { URL, sleep, open, S, settle, pullOut, docW } from './about-lib.mjs';

export default async (page0, ctx) => {
  let pass = 0, fail = 0;
  const check = (name, ok, detail) => { ok ? pass++ : fail++; ctx.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };
  const browser = page0.context().browser();
  // Counts rAF callbacks the page itself schedules (installed before any page script runs).
  const RAF = () => { window.__raf = 0; const r = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = f => r(t => { window.__raf++; f(t); }); };
  const fresh = async (w, h, reduced) => {
    const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await c.addInitScript(RAF);
    const p = await c.newPage();
    p.on('pageerror', e => check('no page errors', false, e.message));
    p.on('console', m => { if (m.type() === 'error') check('no console errors', false, m.text()); });
    await open(p, w, h, { reduced });
    return [c, p];
  };
  const act = p => p.evaluate(() => { const a = document.activeElement; return (a.className && a.className.baseVal === undefined ? a.className : a.tagName) + (a.id ? '#' + a.id : ''); });
  const cueOn = p => p.evaluate(() => { const c = document.querySelector('.cue'), s = c.querySelector('.pt-s'); return c.classList.contains('on') && !!s && getComputedStyle(c).opacity === '1' && getComputedStyle(s).stroke; });

  /* ---- 1 · keyboard, cue, idle (1440) ---- */
  let [c, p] = await fresh(1440, 900);
  await sleep(900);
  const cue0 = await cueOn(p);
  check('cue is coral on first view', !!cue0 && /217, 105, 90|d9695a/i.test(cue0), 'stroke ' + cue0);
  check('the cue is drawn with the pen glyph (two .pt-s paths)', await p.evaluate(() => document.querySelectorAll('.cue .pt-s').length === 2));
  await p.focus('.ctl-pull'); await p.keyboard.press('Tab'); await sleep(250);
  check('Tab reaches the sliver after PULL', /grip/.test(await act(p)), await act(p));
  check('the sliver shows a coral 「 」 on focus', await p.evaluate(() => [...document.querySelectorAll('.grip .fm-c')].some(e => getComputedStyle(e).visibility === 'visible')));
  await p.keyboard.press('Enter'); await settle(p, 6000);
  check('Enter on the sliver pulls; focus moves to the card', (await S(p)).st === 'free' && /fred-field-card/.test(await act(p)), (await S(p)).st + ' · ' + await act(p));
  check('the first pull spends fy-point-about', await p.evaluate(() => sessionStorage.getItem('fy-point-about') === '1'));
  await p.keyboard.press('Enter'); await settle(p);
  check('Enter flips the card', (await S(p)).face === 'night');
  await p.keyboard.press('Space'); await settle(p);
  check('Space flips it back', (await S(p)).face === 'day');
  const wHidden = await p.evaluate(() => document.querySelector('.ctl-put').getBoundingClientRect().width);
  check('PUT BACK is not visible without focus', wHidden <= 1, wHidden + 'px');
  await p.keyboard.press('Escape'); await settle(p, 6000);
  check('Esc puts the card back; focus returns to the sliver', (await S(p)).st === 'tucked' && /grip/.test(await act(p)));
  await p.keyboard.press('Enter'); await settle(p, 6000);
  await p.focus('.ctl-flip'); await p.keyboard.press('Tab'); await sleep(300);
  const wFocus = await p.evaluate(() => document.querySelector('.ctl-put').getBoundingClientRect().width);
  check('Tab from FLIP reaches PUT BACK, visible on focus and labelled', /ctl-put/.test(await act(p)) && wFocus > 60 && await p.evaluate(() => /Put the specimen card back/.test(document.querySelector('.ctl-put').getAttribute('aria-label'))), wFocus + 'px');
  await p.keyboard.press('Enter'); await settle(p, 6000);
  check('Enter on PUT BACK puts the card back', (await S(p)).st === 'tucked');
  await p.reload(); await p.waitForSelector('[data-mount="about"][data-state]'); await sleep(1200);
  check('after the first pull a reload shows no cue', !(await cueOn(p)));
  await pullOut(p); await sleep(400);
  const idle = await p.evaluate(async () => { const a = window.__raf; await new Promise(r => setTimeout(r, 1200)); return window.__raf - a; });
  check('idle: 0 rAF callbacks at rest (1.2 s, card in hand)', idle === 0, idle + ' callbacks');
  const inf = await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations === Infinity).length);
  check('no infinite animations', inf === 0, inf + ' infinite');
  check('no horizontal overflow at 1440', await docW(p) <= 1440);
  await c.close();
  [c, p] = await fresh(1440, 900); await sleep(900);
  check('a new context shows the cue again', !!(await cueOn(p)));
  await c.close();

  /* ---- 2 · reduced motion (1440, 390) ---- */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    [c, p] = await fresh(w, h, true); await sleep(300);
    check(`[${w}] reduced motion: the card is presented out of the sleeve`, (await S(p)).st === 'free');
    const b = await (await p.$('.a-card')).boundingBox();
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2);
    await sleep(60);
    const mid = await p.evaluate(() => document.querySelector('.a-card').style.transform);
    check(`[${w}] reduced motion: no turn while dragging`, /rotateY\(0(\.0+)?deg\)/.test(mid), mid);
    await p.mouse.up(); await sleep(40);
    const t1 = await p.evaluate(() => [document.querySelector('[data-mount="about"]').dataset.face, document.querySelector('.a-card').style.transform]);
    check(`[${w}] reduced motion: the flip is instant`, t1[0] === 'night' && /rotateY\(180deg\)/.test(t1[1]), t1.join(' · '));
    const dots = await p.evaluate(() => [...document.querySelectorAll('.rd-pts circle')].every(e => getComputedStyle(e).opacity === '1'));
    check(`[${w}] reduced motion: the radar is already drawn`, dots);
    const running = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 100)); return document.getAnimations().filter(a => a.playState === 'running').length; });
    check(`[${w}] reduced motion: nothing running 100 ms after settle`, running === 0, running + ' running');
    await p.keyboard.press('Tab');
    await p.focus('.a-card'); await p.keyboard.press('Escape'); await sleep(40);
    check(`[${w}] reduced motion: Esc puts back instantly`, (await S(p)).st === 'tucked');
    check(`[${w}] reduced motion: no horizontal overflow`, await docW(p) <= w);
    await c.close();
  }

  /* ---- 3 · the phone's strip (390, 360) ---- */
  for (const [w, h] of [[390, 844], [360, 740]]) {
    [c, p] = await fresh(w, h); await pullOut(p); await sleep(300);
    const sl = await p.evaluate(() => { const s = document.querySelector('.sl-front').getBoundingClientRect(), a = document.querySelector('.a-card').getBoundingClientRect(); return { right: s.right, left: s.left, cardLeft: a.left, cardRight: a.right }; });
    check(`[${w}] the sleeve steps aside to the left strip (≥ 44 px showing, left of the card)`, sl.right >= 44 && sl.left < 0 && sl.right <= sl.cardLeft, JSON.stringify(sl));
    check(`[${w}] the card stays inside the page`, sl.cardRight <= w - 2, sl.cardRight.toFixed(1));
    check(`[${w}] no horizontal overflow`, await docW(p) <= w);
    await c.close();
  }

  /* ---- 4 · the WeChat QR comes with its slip (1440, 390): out of layout while closed, so lazy defers it ---- */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); p = await c.newPage();
    const qr = [];
    p.on('request', r => { if (/wechat-qr/.test(r.url())) qr.push(r.url()); });
    await open(p, w, h); await sleep(1500);
    const before = qr.length;
    await p.click('.soc-wx .soc'); await sleep(700);
    const img = await p.evaluate(() => { const i = document.querySelector('.qr-slip img'); return i.complete ? i.naturalWidth : 0; });
    check(`[${w}] the WeChat QR is fetched only when its slip first opens`, before === 0 && qr.length === 1 && img > 0, `${before} before, ${qr.length} after, ${img} px`);
    await c.close();
  }
  ctx.log(`about-states: ${pass}/${pass + fail} pass`);
};
