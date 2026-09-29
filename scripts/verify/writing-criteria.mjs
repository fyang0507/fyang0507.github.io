// writing-criteria.mjs — P2-writing's success criteria on Writing.dc.html (PORT-PLAN §2 "P2-writing" + §5).
//   node /tmp/fyshot/run.mjs scripts/verify/writing-criteria.mjs
//   env: WRITING_BASE (default http://127.0.0.1:4173/) · WRITING_DRAFT=<file> serves that file as Writing.dc.html
//        (used before the page itself was integrated) · WRITING_SHOTS=<prefix> saves screenshots
// Checks, per width (1440, 1024, 390, 360): no console errors, every request 200, posts-index.js and never
// posts.js, nothing from /design/, no horizontal overflow, planks (2 / 3 / strip / strip); real pointer paths
// (hover a spine → the held book is under the pointer → a click there reaches Reading.dc.html?post=<id>), the
// phone's tap-tap; a filter reflows and the live readout says "N / 27"; a ledger drag selects a span and Esc
// clears it; the shelf is one tab stop with arrows and Enter; tabs are a radiogroup and the ledger a
// multiselectable listbox; a chosen tab is wheat with no coral at rest; keyboard focus draws coral 「 」;
// Back from Reading leaves no book held; under reduced motion a filter leaves no running animation after
// 50 ms; and an idle page makes no requestAnimationFrame calls. Exit code 1 on any failure.
import fs from 'fs';

const BASE = process.env.WRITING_BASE || 'http://127.0.0.1:4173/';
const URL = BASE + 'Writing.dc.html', DRAFT = process.env.WRITING_DRAFT, SHOTS = process.env.WRITING_SHOTS;
const CORAL = 'rgb(217, 105, 90)';
let fails = 0;
function check(ctx, name, ok, info) { if (!ok) fails++; ctx.log((ok ? '  ✓ ' : '  ✗ ') + name + (info ? '  ' + info : '')); }

async function open(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-mount=writing][data-ready]', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}
const state = (page) => page.evaluate(() => { const h = document.querySelector('[data-mount=writing]'); return { ...h.dataset, planks: h.querySelector('.wr-case').dataset.planks }; });
async function toCase(page, off = 20) { await page.evaluate((o) => { const c = document.querySelector('.wr-case'); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - o); }, off); await page.waitForTimeout(350); }
// A spot on book n's spine (visible books only), 35% down it, in viewport coordinates.
async function spine(page, n) {
  return page.evaluate((n) => {
    const hs = [...document.querySelectorAll('.bk-hit:not(.is-out)')].filter((a) => { const r = a.getBoundingClientRect(); return r.bottom > 40 && r.top < innerHeight - 40 && r.left > 0 && r.right < innerWidth; });
    const a = hs[n % hs.length], r = a.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.35), id: a.dataset.post };
  }, n);
}
const heldAt = (page, p) => page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y), b = e && e.closest('.book'); return !!(b && b.classList.contains('held')); }, p);

async function pointerPaths(ctx, page, w) {
  const got = [];
  for (const n of [1, 5, 9, 14]) {
    await open(page, w, 900); await toCase(page);
    const p = await spine(page, n);
    await page.mouse.move(p.x - 30, p.y + 70); await page.mouse.move(p.x, p.y, { steps: 8 });
    await page.waitForTimeout(1400);
    const under = await heldAt(page, p), held = (await state(page)).held;
    if (SHOTS && n === 5) await ctx.shot(`${SHOTS}-${w}-held.png`);
    await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 6000 }).catch(() => {}), page.mouse.click(p.x, p.y)]);
    const url = page.url(), ok = under && held === p.id && url.endsWith('Reading.dc.html?post=' + encodeURIComponent(p.id));
    got.push(ok ? 'ok' : `✗ under=${under} held=${held} id=${p.id} url=${url.split('/').pop()}`);
  }
  check(ctx, `pointer paths: held book under the pointer, click reaches Reading ?post=<id> (${w})`, got.every((g) => g === 'ok'), got.join(' · '));
}
async function phoneTaps(ctx, page, w) {
  const cdp = await page.context().newCDPSession(page), got = [];
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await page.waitForTimeout(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  for (const n of [1, 3]) {
    await open(page, w, 844); await toCase(page, 120);
    const p = await spine(page, n);
    await tap(p.x, p.y); await page.waitForTimeout(1500);
    const under = await heldAt(page, p);
    await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 6000 }).catch(() => {}), tap(p.x, p.y)]);
    const ok = under && page.url().endsWith('Reading.dc.html?post=' + encodeURIComponent(p.id));
    got.push(ok ? 'ok' : `✗ under=${under} url=${page.url().split('/').pop()}`);
  }
  check(ctx, `phone: tap a spine, tap the book it becomes → Reading ?post=<id> (${w})`, got.every((g) => g === 'ok'), got.join(' · '));
}

export default async (page, ctx) => {
  const errors = [], reqs = [], bad = [];
  if (DRAFT) { const html = fs.readFileSync(DRAFT, 'utf8'); await page.route('**/Writing.dc.html', (r) => r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' })); }
  await page.addInitScript(() => { const raf = window.requestAnimationFrame; window.__raf = 0; window.requestAnimationFrame = function (f) { window.__raf++; return raf.call(window, f); }; });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { let from = ''; try { from = r.frame().url(); } catch (e) { /* detached */ } if (/Writing\.dc\.html/.test(from) || /Writing\.dc\.html/.test(r.url())) reqs.push(r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) bad.push(r.status() + ' ' + r.url()); });

  for (const [w, h, planks] of [[1440, 900, '2'], [1024, 800, '3'], [390, 844, '1'], [360, 780, '1']]) {
    ctx.log(`— ${w}×${h}`);
    await open(page, w, h);
    const s = await state(page);
    check(ctx, `planks = ${planks === '1' ? 'one strip' : planks}`, s.planks === planks && (planks !== '1' || !!(await page.$('.sh-view.strip'))), 'got ' + s.planks);
    check(ctx, 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check(ctx, 'readout says 27 / 27', /27 \/ 27/.test(await page.textContent('.ro')));
    // a filter reflows the books and the live readout says N / 27
    const tab = await page.$('.tb[data-cat="travel log"]');
    await tab.click(); await page.waitForTimeout(1500);
    const f = await page.evaluate(() => ({ live: document.querySelector('.ro').getAttribute('aria-live'), text: document.querySelector('.ro').textContent, shown: document.querySelectorAll('.book:not(.is-out)').length, count: document.querySelector('[data-mount=writing]').dataset.count }));
    check(ctx, 'filter: travel log reflows to 15 and aria-live reads "15 / 27"', f.live === 'polite' && /15 \/ 27/.test(f.text) && f.shown === 15 && f.count === '15', JSON.stringify({ shown: f.shown, count: f.count }));
    // a chosen tab is wheat, and no coral stroke is left at rest
    await page.mouse.move(2, 2); await page.waitForTimeout(900);
    const pen = await page.evaluate((CORAL) => {
      const t = document.querySelector('.tb[data-cat="travel log"]'), band = t.querySelector('.tm-band');
      const coral = [...document.querySelectorAll('svg path')].filter((p) => { const cs = getComputedStyle(p); return cs.visibility !== 'hidden' && cs.stroke === CORAL && +cs.opacity > 0.05 && p.closest('.wr'); }).length;
      return { tier: t.dataset.penTier, band: band && getComputedStyle(band).visibility, coral };
    }, CORAL);
    check(ctx, 'chosen tab = wheat band, no coral stroke at rest', pen.tier === '2' && pen.band === 'visible' && pen.coral === 0, JSON.stringify(pen));
    // the ledger: a drag selects a span, Esc gives every year back (the sticky index is in view by the case)
    if (w >= 760) await toCase(page);
    const rows = await page.$$('.lg-row');
    const a = await rows[8].boundingBox(), b = await rows[11].boundingBox(), horiz = w < 760;
    const from = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, to = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(from.x + (horiz ? 10 : 0), from.y + (horiz ? 0 : 10), { steps: 3 }); await page.mouse.move(to.x, to.y, { steps: 10 }); await page.mouse.up();
    await page.waitForTimeout(900);
    const span = (await state(page)).years;
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    check(ctx, 'ledger: a drag selects a span; Esc clears it', /^\d{4}–\d{4}$/.test(span) && (await state(page)).years === 'all', `span ${span} → ${(await state(page)).years}`);
    if (SHOTS) await ctx.shot(`${SHOTS}-${w}.png`);
  }

  ctx.log('— the sticky index at 1440×800');
  await open(page, 1440, 800); await toCase(page, 16);          // the case (and the index beside it) in view
  const ix = await page.evaluate(() => { const r = document.querySelector('.wr-index').getBoundingClientRect(), l = document.querySelector('.lg-track').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(l.bottom), vh: innerHeight }; });
  check(ctx, 'the whole year ledger fits in view beside the case (sticky index)', ix.top >= 0 && ix.bottom <= ix.vh, JSON.stringify(ix));

  ctx.log('— roles and keyboard (1440)');
  await open(page, 1440, 900);
  const roles = await page.evaluate(() => ({
    stops: [...document.querySelectorAll('.bk-hit')].filter((a) => a.tabIndex === 0).length,
    radio: document.querySelector('.tb-group').getAttribute('role') === 'radiogroup' && [...document.querySelectorAll('.tb')].every((t) => t.getAttribute('role') === 'radio' && t.hasAttribute('aria-checked')),
    listbox: (() => { const l = document.querySelector('.lg-track'); return l.getAttribute('role') === 'listbox' && l.getAttribute('aria-multiselectable') === 'true' && [...l.querySelectorAll('.lg-row')].every((o) => o.getAttribute('role') === 'option'); })()
  }));
  check(ctx, 'the shelf is one tab stop; tabs are a radiogroup; the ledger is a multiselectable listbox', roles.stops === 1 && roles.radio && roles.listbox, JSON.stringify(roles));
  await page.evaluate(() => [...document.querySelectorAll('.bk-hit')].find((a) => a.tabIndex === 0).focus());
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  const moved = await page.evaluate(() => document.activeElement.classList.contains('bk-hit') && document.activeElement.dataset.i === '1');
  const id = await page.evaluate(() => document.activeElement.dataset.post);
  await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 6000 }).catch(() => {}), page.keyboard.press('Enter')]);
  check(ctx, 'arrow walks the shelf, Enter opens the focused book', moved && page.url().endsWith('?post=' + encodeURIComponent(id)), page.url().split('/').pop());
  await page.goBack({ waitUntil: 'load' }); await page.waitForTimeout(900);
  const back = await page.evaluate(() => ({ persisted: performance.getEntriesByType('navigation')[0]?.type, held: document.querySelector('[data-mount=writing]').dataset.held || '', open: document.querySelectorAll('.book.held').length, opening: document.querySelector('[data-mount=writing]').hasAttribute('data-opening') }));
  check(ctx, 'Back from Reading leaves no book held', !back.held && !back.open && !back.opening, JSON.stringify(back));
  // Headless Chromium may not restore from the bfcache, so also hold the navigation (the book stays open in
  // the hand) and fire the pageshow a bfcache restore would: the reset must put everything back.
  await open(page, 1440, 900); await toCase(page);
  await page.route('**/Reading.dc.html*', (r) => r.fulfill({ status: 204, body: '' }));   // 204: the browser stays put
  const q = await spine(page, 3);
  await page.mouse.move(q.x, q.y + 60); await page.mouse.move(q.x, q.y, { steps: 6 }); await page.waitForTimeout(1300);
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(1600);
  const opened = await page.evaluate(() => document.querySelector('[data-mount=writing]').dataset.opening || '');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ held: document.querySelector('[data-mount=writing]').dataset.held || '', opening: document.querySelector('[data-mount=writing]').hasAttribute('data-opening'), open: document.querySelectorAll('.book.held').length, anims: document.getAnimations().filter((a) => a.playState === 'running').length }));
  await page.unroute('**/Reading.dc.html*');
  check(ctx, 'bfcache restore (pageshow.persisted) puts the opened book back', opened === q.id && !after.held && !after.opening && !after.open, JSON.stringify({ opened: !!opened, ...after }));
  await open(page, 1440, 900);
  await page.focus('.tb[aria-checked="true"]'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(500);
  const focus = await page.evaluate((CORAL) => { const t = document.activeElement, ps = [...t.querySelectorAll('.fm-c')]; return { radio: t.getAttribute('role'), corners: ps.length === 2 && ps.every((p) => getComputedStyle(p).visibility === 'visible' && getComputedStyle(p).stroke === CORAL) }; }, CORAL);
  check(ctx, 'keyboard focus draws coral 「 」', focus.radio === 'radio' && focus.corners, JSON.stringify(focus));

  ctx.log('— idle and reduced motion');
  await open(page, 1440, 900);
  await page.mouse.move(2, 2); await page.waitForTimeout(1500);
  const r0 = await page.evaluate(() => window.__raf); await page.waitForTimeout(2000);
  const r1 = await page.evaluate(() => window.__raf);
  check(ctx, 'idle: 0 requestAnimationFrame calls over 2 s', r1 === r0, `${r1 - r0} calls`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 1440, 900);
  await page.click('.tb[data-cat="commentary"]'); await page.waitForTimeout(50);
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  check(ctx, 'reduced motion: a filter change leaves no running animation after 50 ms', running === 0, running + ' running');
  await page.emulateMedia({ reducedMotion: null });

  ctx.log('— pointer paths and taps');
  await pointerPaths(ctx, page, 1440);
  await pointerPaths(ctx, page, 1024);
  await phoneTaps(ctx, page, 390);
  await phoneTaps(ctx, page, 360);

  ctx.log('— network');
  check(ctx, 'posts-index.js loaded, posts.js never (requests made by Writing)', reqs.some((u) => /content\/posts-index\.js/.test(u)) && !reqs.some((u) => /content\/posts\.js/.test(u)));
  check(ctx, 'nothing requested from /design/ (by Writing)', !reqs.some((u) => u.includes('/design/')));
  check(ctx, 'every request returns 200', !bad.length, bad.slice(0, 3).join(' · '));
  check(ctx, '0 console errors', !errors.length, errors.slice(0, 3).join(' · '));
  ctx.log(`writing-criteria: ${fails ? fails + ' FAILED' : 'all passed'}`);
  if (fails) process.exitCode = 1;
};
