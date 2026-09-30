// writing-criteria.mjs — P2-writing's success criteria on Writing.dc.html (PORT-PLAN §2 "P2-writing" + §5).
//   node /tmp/fyshot/run.mjs scripts/verify/writing-criteria.mjs
//   env: WRITING_BASE (default http://127.0.0.1:4173/) · WRITING_DRAFT=<file> serves that file as Writing.dc.html
//        (used before the page itself was integrated) · WRITING_SHOTS=<prefix> saves screenshots
// Checks, per width (1440, 1024, 390, 360): no console errors, every request 200, posts-index.js and never
// posts.js, nothing from /design/, no horizontal overflow, planks (2 / 3 / strip / strip); real pointer paths
// (hover a spine → the held book is under the pointer → a click there reaches Reading.dc.html?post=<id>&lang=zh),
// the phone's tap-tap; the book in your hand is laid out at its size there (its cover and spine are drawn at most
// 1.1x their layout size, so neither is enlarged from a smaller raster, and its cover image has a source pixel for
// every device pixel it is drawn at: lib/writing/case.js sh.hand); no book keeps that layout once it is back, when a
// returning book is caught again and let go inside the dwell (the pointer 200 and 350 ms after leaving; the keyboard's
// Right, Left, Right; a resize while one is held, then a re-hover); a filter reflows and the live readout says "N / 27"; a ledger drag selects a span and Esc
// clears it; the shelf is one tab stop with arrows and Enter; tabs are a radiogroup and the ledger a
// multiselectable listbox; a chosen tab is wheat with no coral at rest; keyboard focus draws coral 「 」;
// Back from Reading leaves no book held; under reduced motion a filter leaves no running animation after
// 50 ms; and an idle page makes no requestAnimationFrame calls. Exit code 1 on any failure.
import fs from 'fs';

const BASE = process.env.WRITING_BASE || 'http://127.0.0.1:4173/';
const URL = BASE + 'Writing.dc.html', DRAFT = process.env.WRITING_DRAFT, SHOTS = process.env.WRITING_SHOTS;
const CORAL = 'rgb(217, 105, 90)';
const LANG = '&lang=zh';   // a fresh context has no fy-lang, so every book leads to the essay in Chinese (lib/writing/lang.js)
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
// The book in your hand, drawn from a raster its own size: 'ok', or cover / spine enlargement and image px per device px.
const sharp = (page) => page.evaluate(() => {
  const b = document.querySelector('.book.held'); if (!b) return 'none held';
  const f = b.querySelector('.leaf-front'), s = b.querySelector('.f-spine'), img = b.querySelector('.cv-img img'), up = (e) => e.getBoundingClientRect().height / e.offsetHeight;
  const src = +(img.currentSrc.match(/-(\d+)\.jpg$/) || [0, 0])[1] * 25 / 16, r = [up(f), up(s), src / (up(f) * img.offsetHeight * 1.12 * devicePixelRatio)];
  return r[0] <= 1.1 && r[1] <= 1.1 && r[2] >= 1 ? 'ok' : r.map((v) => v.toFixed(2)).join('/');
});
// Books laid out for the hand (lib/writing/case.js sh.hand) though they are not in it: post and --z.
const stuck = (page) => page.evaluate(() => [...document.querySelectorAll('.book:not(.held)')].filter((b) => +(b.style.getPropertyValue('--z') || 1) !== 1)
  .map((b) => new URL(b.href).searchParams.get('post') + ' z=' + b.style.getPropertyValue('--z')));
const hover = async (page, p) => { await page.mouse.move(p.x - 30, p.y + 70); await page.mouse.move(p.x, p.y, { steps: 8 }); await page.waitForTimeout(1400); };
const at = async (page, t0, ms) => page.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
const heldAt = (page, p) => page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y), b = e && e.closest('.book'); return !!(b && b.classList.contains('held')); }, p);

async function pointerPaths(ctx, page, w) {
  const got = [], crisp = [];
  for (const n of [1, 5, 9, 14]) {
    await open(page, w, 900); await toCase(page);
    const p = await spine(page, n);
    await page.mouse.move(p.x - 30, p.y + 70); await page.mouse.move(p.x, p.y, { steps: 8 });
    await page.waitForTimeout(1400);
    const under = await heldAt(page, p), held = (await state(page)).held;
    crisp.push(await sharp(page));
    if (SHOTS && n === 5) await ctx.shot(`${SHOTS}-${w}-held.png`);
    await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 6000 }).catch(() => {}), page.mouse.click(p.x, p.y)]);
    const url = page.url(), ok = under && held === p.id && url.endsWith('Reading.dc.html?post=' + encodeURIComponent(p.id) + LANG);
    got.push(ok ? 'ok' : `✗ under=${under} held=${held} id=${p.id} url=${url.split('/').pop()}`);
  }
  check(ctx, `pointer paths: held book under the pointer, click reaches Reading ?post=<id> (${w})`, got.every((g) => g === 'ok'), got.join(' · '));
  check(ctx, `the book in your hand is drawn from a raster its size, its cover image sharp (${w})`, crisp.every((g) => g === 'ok'), crisp.join(' · '));
}
async function phoneTaps(ctx, page, w) {
  const cdp = await page.context().newCDPSession(page), got = [], crisp = [];
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await page.waitForTimeout(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  for (const n of [1, 3]) {
    await open(page, w, 844); await toCase(page, 120);
    const p = await spine(page, n);
    await tap(p.x, p.y); await page.waitForTimeout(1500);
    const under = await heldAt(page, p);
    crisp.push(await sharp(page));
    await Promise.all([page.waitForURL(/Reading\.dc\.html\?post=/, { timeout: 6000 }).catch(() => {}), tap(p.x, p.y)]);
    const ok = under && page.url().endsWith('Reading.dc.html?post=' + encodeURIComponent(p.id) + LANG);
    got.push(ok ? 'ok' : `✗ under=${under} url=${page.url().split('/').pop()}`);
  }
  check(ctx, `phone: tap a spine, tap the book it becomes → Reading ?post=<id> (${w})`, got.every((g) => g === 'ok'), got.join(' · '));
  check(ctx, `phone: the book in your hand is drawn from a raster its size, its cover image sharp (${w})`, crisp.every((g) => g === 'ok'), crisp.join(' · '));
}

// A book on its way back, caught again and let go inside the 110 ms dwell, must still come home 1:1.
async function handBack(ctx, page) {
  const got = [];
  for (const d of [200, 350]) {
    await open(page, 1440, 900); await toCase(page);
    const p = await spine(page, 5); await hover(page, p);
    const t0 = Date.now(); await page.mouse.move(700, 5); await at(page, t0, d);
    await page.mouse.move(p.x, p.y); await page.waitForTimeout(30); await page.mouse.move(700, 5); await page.waitForTimeout(2600);
    got.push(`pointer ${d} ms: ` + ((await stuck(page)).join(', ') || 'ok'));
  }
  await open(page, 1440, 900); await toCase(page);
  await page.evaluate(() => document.querySelector('.bk-hit').focus()); await page.waitForTimeout(300);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1400);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150);
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(40);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(2000);
  got.push('keys: ' + ((await stuck(page)).join(', ') || 'ok'));
  await open(page, 1440, 900); await toCase(page);
  const p = await spine(page, 5); await hover(page, p);
  const t0 = Date.now(); await page.setViewportSize({ width: 1420, height: 900 }); await at(page, t0, 220);
  const q = await page.evaluate((id) => { const r = document.querySelector('.bk-hit[data-post="' + id + '"]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.35) }; }, p.id);
  await page.mouse.move(q.x, q.y); await page.waitForTimeout(30); await page.mouse.move(700, 5); await page.waitForTimeout(2600);
  got.push('resize: ' + ((await stuck(page)).join(', ') || 'ok'));
  check(ctx, 'a returning book caught again and let go inside the dwell comes home 1:1 (no --z left on it)', got.every((g) => g.endsWith(': ok')), got.join(' · '));
}
export default async (page, ctx) => {
  const errors = [], reqs = [], bad = [];
  if (DRAFT) { const html = fs.readFileSync(DRAFT, 'utf8'); await page.route('**/Writing.dc.html', (r) => r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' })); }
  await page.addInitScript(() => { const raf = window.requestAnimationFrame; window.__raf = 0; window.requestAnimationFrame = function (f) { window.__raf++; return raf.call(window, f); }; });
  // Live Motion.onReduced subscriptions: a re-mount must hand back every one the old instance took.
  await page.addInitScript(() => {
    let M; window.__subs = 0;
    Object.defineProperty(window, 'Motion', { configurable: true, get: () => M, set: (v) => {
      const on = v.onReduced; v.onReduced = (fn) => { window.__subs++; const off = on(fn); let live = true; return () => { if (live) { live = false; window.__subs--; } off(); }; }; M = v;
    } });
  });
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
  check(ctx, 'arrow walks the shelf, Enter opens the focused book', moved && page.url().endsWith('?post=' + encodeURIComponent(id) + LANG), page.url().split('/').pop());
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

  ctx.log('— review fixes');
  // the spine type scale applies (titles ×1.45 on the desk)
  await open(page, 1440, 900);
  const fs = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.bk-title')).fontSize));
  check(ctx, 'spine titles use the case type scale (≥ 15 px at 1440)', fs >= 15, fs + 'px');
  // the books are drawings; the links name them, the Chinese in lang="zh"
  const aria = await page.evaluate(() => ({ faces: [...document.querySelectorAll('.sh-world > .b3')].every((b) => b.getAttribute('aria-hidden') === 'true'),
    zh: [...document.querySelectorAll('.bk-hit')].every((a) => a.querySelector('[lang="zh"]') && !a.hasAttribute('aria-label')) }));
  check(ctx, 'book faces are aria-hidden; each spine link carries its Chinese title in lang="zh"', aria.faces && aria.zh, JSON.stringify(aria));
  // a dimmed (empty) year stays ≥ 4.5:1 while it can still be pressed
  await page.click('.tb[data-cat="commentary"]'); await page.waitForTimeout(900);
  const dim = await page.evaluate(() => {
    const L = (c) => { const v = c.match(/[\d.]+/g).slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const y = document.querySelector('.lg-row.is-dim .lg-y'), cs = getComputedStyle(y), a = L(cs.color), b = L(getComputedStyle(document.body).backgroundColor);
    return { ratio: +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2), opacity: cs.opacity };
  });
  check(ctx, 'a dimmed year is ≥ 4.5:1 and fully opaque', dim.ratio >= 4.5 && dim.opacity === '1', JSON.stringify(dim));
  // clear gives focus to the tab that is now chosen
  await page.focus('.ro-clear'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const focused = await page.evaluate(() => { const a = document.activeElement; return a.classList.contains('tb') && a.getAttribute('aria-checked') === 'true' ? a.dataset.cat : a.tagName; });
  check(ctx, 'clear moves focus to the chosen tab (all)', focused === 'all', focused);
  // a modifier-click on the held book opens the essay in a new tab and leaves this page alone
  await toCase(page);
  const m = await spine(page, 6);
  await page.mouse.move(m.x, m.y + 60); await page.mouse.move(m.x, m.y, { steps: 6 }); await page.waitForTimeout(1400);
  const link = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y), a = e && e.closest('a.book.held'); return a ? a.getAttribute('href') : null; }, m);
  const popup = page.context().waitForEvent('page', { timeout: 4000 }).catch(() => null);
  await page.keyboard.down('Meta'); await page.mouse.click(m.x, m.y); await page.keyboard.up('Meta');
  const tab = await popup; await page.waitForTimeout(300);
  const tabUrl = tab ? tab.url() : ''; if (tab) await tab.close();
  check(ctx, 'the held book is a link; ⌘-click opens the essay in a new tab', link === 'Reading.dc.html?post=' + encodeURIComponent(m.id) + LANG && /Reading\.dc\.html\?post=/.test(tabUrl) && /Writing\.dc\.html/.test(page.url()) && !(await page.evaluate(() => document.querySelector('[data-mount=writing]').hasAttribute('data-opening'))), `href ${link} · new tab ${tabUrl.split('/').pop()}`);
  // the keyboard's book is kept in view, obi included
  for (const [w, h] of [[1280, 800], [1024, 700]]) {
    await open(page, w, h);
    await page.focus('.site-tab--about'); await page.keyboard.press('Tab'); await page.waitForTimeout(1500);
    const first = await page.evaluate(() => { const b = document.querySelector('.book.held'), o = b && b.querySelector('.obi'); if (!o) return null; const r = o.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight }; });
    await page.keyboard.press('End'); await page.waitForTimeout(1600);
    const end = await page.evaluate(() => { const b = document.querySelector('.book.held'), o = b && b.querySelector('.obi'); if (!o) return null; const r = o.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, y: Math.round(scrollY) }; });
    const inView = (r) => r && r.top >= 0 && r.bottom <= r.vh;
    check(ctx, `keyboard: the held book's obi is in view on Tab and after End (${w}×${h})`, inView(first) && inView(end), JSON.stringify({ first, end }));
  }
  // a re-layout keeps the filter and disposes the old instance
  await open(page, 1440, 900);
  const subs0 = await page.evaluate(() => window.__subs);
  await page.click('.tb[data-cat="travel log"]'); await page.waitForTimeout(1200);
  const kept = [];
  for (const w of [1100, 600, 1440]) {
    await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(900);
    kept.push(await page.evaluate(() => { const h = document.querySelector('[data-mount=writing]'); return h.dataset.cat + '/' + h.dataset.count + '/' + document.querySelector('.tb[aria-checked="true"]').dataset.cat + '/' + document.querySelectorAll('.wr-body').length; }));
  }
  const subs1 = await page.evaluate(() => window.__subs);
  check(ctx, 're-layouts (1440 → 1100 → 600 → 1440) keep travel log and leak no subscriptions', kept.every((k) => k === 'travel log/15/travel log/1') && subs1 === subs0, JSON.stringify({ kept, subs0, subs1 }));
  // on a phone the index comes before the shelf in the DOM, as on screen
  await open(page, 390, 844);
  const orderOk = await page.evaluate(() => !!(document.querySelector('.wr-index').compareDocumentPosition(document.querySelector('.wr-case')) & Node.DOCUMENT_POSITION_FOLLOWING));
  check(ctx, 'phone: the index precedes the shelf in the DOM (Tab order = visual order)', orderOk);

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
  await handBack(ctx, page);

  ctx.log('— network');
  check(ctx, 'posts-index.js loaded, posts.js never (requests made by Writing)', reqs.some((u) => /content\/posts-index\.js/.test(u)) && !reqs.some((u) => /content\/posts\.js/.test(u)));
  check(ctx, 'nothing requested from /design/ (by Writing)', !reqs.some((u) => u.includes('/design/')));
  check(ctx, 'every request returns 200', !bad.length, bad.slice(0, 3).join(' · '));
  check(ctx, '0 console errors', !errors.length, errors.slice(0, 3).join(' · '));
  ctx.log(`writing-criteria: ${fails ? fails + ' FAILED' : 'all passed'}`);
  if (fails) process.exitCode = 1;
};
