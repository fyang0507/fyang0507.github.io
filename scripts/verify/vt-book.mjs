// vt-book.mjs — the book move (FYBook, transitions-book.js): the book in your hand on Writing → its essay on Reading, and
// the way back. In Chromium with the back/forward cache on, at 1440 and 390.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-book.mjs      env: VT_ORIGIN (:4173) · VT_W (default 1440,390)
// in     pull a book, click it: a view transition of kind book, ready and finished; every animation the move adds changes only
//        transform or opacity and Chrome composites it (compositeFailed 0); one element per view-transition name, at pageswap and
//        at ready, with book-cover and book-obi among them; fy-vt consumed; no horizontal overflow after
// back   Back, the page restored from the back/forward cache: the same, the book put back afterwards (no data-opening, no data-vt)
// link   "← 全部文章" (the top bar's, and the tag on the end-of-essay shelf) on an essay opened from the shelf is Back (restored from the cache, the book move); on an essay opened fresh (nothing before it
//        but Writing's URL typed) it stays a plain link: the paper swap onto a fresh shelf, composited
// frames every frame the compositor presents in the move, in and back: none bare paper (almost no variance) and none that jumps
//        (mean change from the frame before) past what the move's own speed makes
// dark   all of it again with the essay in dark (its plate is dimmer, under a ceiling; the move lands on that one)
// none   reduced motion: no transition either way, and the book is put back
// Plus: no console errors.
import { writeFileSync } from 'fs';
import { ORIGIN, hook, bfcache, check, seek, drawn } from './vt-lib.mjs';

const WS = (process.env.VT_W || '1440,390').split(',').map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const POST = '2025-12-06_the-stories-we-live-05';

async function instrument(c) {
  await hook(c, []);
  await c.addInitScript(() => {
    const count = () => { const n = {}; document.querySelectorAll('*').forEach((el) => { const v = getComputedStyle(el).viewTransitionName; if (v && v !== 'none') n[v] = (n[v] || 0) + 1; }); return n; };
    addEventListener('load', () => addEventListener('pageswap', () => { try { sessionStorage.setItem('vt-names-old', JSON.stringify(count())); } catch (e) { /* storage off */ } }));
    addEventListener('pagereveal', (e) => { if (e.viewTransition) e.viewTransition.ready.then(() => { window.__names = count(); }, () => {}); });
    addEventListener('pageshow', (e) => { window.__persisted = e.persisted; });
    addEventListener('pageswap', () => { const h = document.querySelector('.wr[data-mount=writing]'), k = h && h.getAttribute('data-opening'), hit = k && document.querySelector('.bk-hit[data-post="' + k + '"]'), e = hit && document.querySelectorAll('.sh-world > .book')[+hit.dataset.i].querySelector('.leaf-front'), r = e && e.getBoundingClientRect(); try { sessionStorage.setItem('vt-live', r ? JSON.stringify({ x: r.left, y: r.top, w: r.width, h: r.height }) : ''); } catch (x) { /* storage off */ } });
    addEventListener('pagereveal', () => { window.__rv = (window.__rv || 0) + 1; const w = document.querySelector('[data-mount=writing]'); window.__langAt = w ? w.dataset.lang : null; });
  });
}
// the move as Chrome traces it: every animation's compositor record, and every frame it presents (decoded in a scratch page)
async function traced(page, scratch, go) {
  const cdp = await page.context().newCDPSession(page), ev = [];
  cdp.on('Tracing.dataCollected', (d) => ev.push(...d.value));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.animations,disabled-by-default-devtools.screenshot', transferMode: 'ReportEvents' });
  const r = await go();
  await sleep(600);
  const done = new Promise((res) => cdp.once('Tracing.tracingComplete', res));
  await cdp.send('Tracing.end'); await done;
  const by = {};
  ev.filter((e) => e.name === 'Animation').forEach((e) => { const k = e.pid + ':' + (e.id2 ? e.id2.local || e.id2.global : e.id); Object.assign(by[k] = by[k] || {}, e.args && e.args.data); });
  r.trace = Object.values(by).filter((d) => /^::view-transition/.test(d.nodeName || '') && !d.displayName);
  const shots = ev.filter((e) => e.name === 'Screenshot' && e.args && e.args.snapshot).sort((a, b) => a.ts - b.ts).map((e) => e.args.snapshot);
  r.shots = shots;
  r.frames = await scratch.evaluate(async (list) => {
    const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true }); c.width = 160; c.height = 100;
    let prev = null; const out = [];
    for (const b of list) {
      const bm = await createImageBitmap(await (await fetch('data:image/jpeg;base64,' + b)).blob());
      x.drawImage(bm, 0, 0, 160, 100);
      const d = x.getImageData(0, 0, 160, 100).data, y = new Float32Array(16000);
      let s = 0, q = 0, df = 0;
      for (let i = 0; i < 16000; i++) { y[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; s += y[i]; q += y[i] * y[i]; if (prev) df += Math.abs(y[i] - prev[i]); }
      out.push({ sd: Math.sqrt(q / 16000 - (s / 16000) ** 2), diff: prev ? df / 16000 : 0 });
      prev = y;
    }
    return out;
  }, shots);
  return r;
}
async function pull(page, W) {
  const hit = page.locator('.bk-hit').nth(3);
  await hit.scrollIntoViewIfNeeded();
  const bb = await hit.boundingBox();
  if (W > 500) await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 4 });
  else await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await sleep(1400);
  await page.evaluate(() => { const r = document.querySelector('.book.held .leaf-front').getBoundingClientRect(); if (r.bottom > innerHeight - 90) scrollBy(0, r.bottom - innerHeight + 110); });
  await sleep(400);
  return page.evaluate(() => { const r = document.querySelector('.book.held .leaf-front').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.6 }; });
}
const state = (page) => page.evaluate(() => Object.assign({}, window.__vt, { names: window.__names, old: JSON.parse(sessionStorage.getItem('vt-names-old') || 'null'), left: sessionStorage.getItem('fy-vt'), persisted: window.__persisted, langAt: window.__langAt, vtAttr: document.documentElement.getAttribute('data-vt') }));
// n: the page's pagereveal count before it was left, so a page back from the cache is waited for until its new reveal has finished
const reveals = (page) => page.evaluate(() => window.__rv || 0);
async function settle(page, n = 0) {
  await page.waitForFunction((n) => window.__vt && window.__vt.vt !== null && (window.__rv || 0) > n, n, { timeout: 9000 });
  if (await page.evaluate(() => window.__vt.vt)) await page.waitForFunction(() => window.__vt.fin || window.__vt.err, null, { timeout: 9000 }).catch(() => {});
  return state(page);
}
function judge(res, T, r, names) {
  check(res, T + ': a book move, ready and finished', r.vt && r.ready && r.fin && !r.err && r.kind === 'book', { vt: r.vt, ready: r.ready, fin: r.fin, err: r.err, kind: r.kind });
  const mine = r.anims.filter((a) => !a.ua), bad = mine.filter((a) => a.moving.some((p) => p !== 'transform' && p !== 'opacity')).map((a) => a.pe + ': ' + a.moving.join(','));
  const failed = r.trace.filter((d) => d.compositeFailed).map((d) => d.nodeName + ' ' + d.compositeFailed + ' ' + (d.unsupportedProperties || ''));
  check(res, T + ': every animation moves only transform or opacity, and Chrome composites it', mine.length > 5 && !bad.length && !failed.length && r.trace.some((d) => d.compositeFailed === 0),
    bad.length || failed.length ? bad.concat(failed).slice(0, 5) : mine.length + ' animations, ' + r.trace.filter((d) => d.compositeFailed === 0).length + ' composited');
  const dup = (n) => n && Object.keys(n).filter((k) => n[k] > 1);
  check(res, T + ': one element per name (pageswap and ready), the move\'s names present', r.names && r.old && !dup(r.names).length && !dup(r.old).length && names.every((n) => r.names[n] || r.old[n]),
    { old: r.old && Object.keys(r.old).filter((k) => /^book/.test(k)), now: r.names && Object.keys(r.names).filter((k) => /^book/.test(k)) });
  check(res, T + ': fy-vt consumed, nothing left on the page', r.left === null && r.vtAttr === null, { left: r.left, vt: r.vtAttr });
}
// no frame bare paper, none that jumps (the move's own fastest step is under 10; the browser's first frame at the end pose was 20+;
// to and from a dark essay the page's own change from dark to light is some 18 in a frame, so the limit there is 24)
function frames(res, T, r, max = 16) {   // VT_DUMP=<dir> writes the frames around the biggest jump when it fails
  const f = r.frames, still = f.filter((x) => x.sd < 6).length, jump = Math.max(...f.map((x) => x.diff));
  const top = f.map((x, i) => [i, +x.diff.toFixed(1)]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (process.env.VT_DUMP && jump >= max) top.slice(0, 1).forEach(([i]) => [i - 1, i, i + 1].forEach((k) => writeFileSync(`${process.env.VT_DUMP}/${T.replace(/ /g, '-')}-${k}.jpg`, Buffer.from(r.shots[k], 'base64'))));
  check(res, T + ': no bare-paper frame, no jump', f.length > 20 && !still && jump < max, { frames: f.length, bare: still, biggest: top });
}

export default async (_p, ctx) => {
  const res = [], errs = [], browser = await bfcache();
  for (const [W, dark] of WS.flatMap((w) => [[w, false], [w, true]])) {   // Writing is light only; the essay follows the colour scheme, and its plate is dimmer in dark
    const tag = W + (dark ? ' dark' : ''), H = W > 500 ? 900 : 844, context = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: dark ? 'dark' : 'light' });
    await instrument(context);
    const page = await context.newPage(), scratch = await context.newPage();
    await scratch.goto('about:blank');
    page.on('pageerror', (e) => errs.push(page.url().split('/').pop() + ' ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(page.url().split('/').pop() + ' ' + m.text()); });
    await page.goto(ORIGIN + '/Writing.dc.html', { waitUntil: 'load' }); await sleep(1500);
    const at = await pull(page, W);
    let n = await reveals(page);
    let r = await traced(page, scratch, async () => { await Promise.all([page.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), page.mouse.click(at.x, at.y)]); return settle(page); });
    judge(res, tag + ' in', r, ['book-cover', 'book-obi']); frames(res, tag + ' in', r, dark ? 24 : 16);
    check(res, tag + ' in: no overflow after', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await sleep(800);
    r = await traced(page, scratch, async () => { await page.goBack({ waitUntil: 'commit' }); return settle(page, n); });
    check(res, tag + ' back: restored from the back/forward cache', r.persisted === true);
    judge(res, tag + ' back', r, ['book-cover', 'book-obi']); frames(res, tag + ' back', r, dark ? 24 : 16);
    await sleep(900);
    check(res, tag + ' back: the book is put back afterwards', await page.evaluate(() => !document.querySelector('[data-opening]') && !document.documentElement.hasAttribute('data-vt-go')));
    // "← all writing" on an essay opened from the shelf: Back (the book move, from the cache)
    const at2 = await pull(page, W);
    n = await reveals(page);
    await Promise.all([page.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), page.mouse.click(at2.x, at2.y)]);
    await settle(page); await sleep(900);
    r = await traced(page, scratch, async () => { await page.evaluate(() => document.querySelector('.rnav .back').click()); await page.waitForFunction(() => /Writing\.dc\.html$/.test(location.pathname), null, { timeout: 9000 }); return settle(page, n); });
    check(res, tag + ' link back: it is Back (restored from the cache, the book move)', r.persisted === true && r.kind === 'book' && !!r.names && !!r.names['book-cover'], { persisted: r.persisted, kind: r.kind, names: r.names && Object.keys(r.names) });
    await sleep(900);
    check(res, tag + ' link back: the shelf as you left it, the book put back', await page.evaluate(() => !document.querySelector('[data-opening]')));
    // the tag hanging from the end-of-essay shelf says the same and does the same, from the foot of the essay: Back, from the cache
    const at3 = await pull(page, W);
    n = await reveals(page);
    await Promise.all([page.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), page.mouse.click(at3.x, at3.y)]);
    await settle(page); await sleep(900);
    await page.waitForSelector('.pn-tag', { timeout: 15000 });
    await page.evaluate(() => document.querySelector('.pn').scrollIntoView({ block: 'center' })); await sleep(400);
    r = await traced(page, scratch, async () => { await page.evaluate(() => document.querySelector('.pn-tag').click()); await page.waitForFunction(() => /Writing\.dc\.html$/.test(location.pathname), null, { timeout: 9000 }); return settle(page, n); });
    check(res, tag + ' shelf tag: it is Back (restored from the cache, a book move), the book put back', r.persisted === true && r.kind === 'book' && await page.evaluate(() => !document.querySelector('[data-opening]')), { persisted: r.persisted, kind: r.kind });
    // the move's first frame is the book as it stands: the front board, drawn at 0 ms, is where the live one was (no pop as it begins)
    const fp = await context.newPage();
    await fp.goto(ORIGIN + '/Writing.dc.html', { waitUntil: 'load' }); await sleep(1500);
    const at5 = await pull(fp, W);
    await fp.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
    await Promise.all([fp.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), fp.mouse.click(at5.x, at5.y)]);
    await fp.waitForFunction(() => window.__vt && window.__vt.ready, null, { timeout: 9000 });
    await seek(fp, 0);
    const live = await fp.evaluate(() => JSON.parse(sessionStorage.getItem('vt-live') || 'null')), d0 = (await drawn(fp, ['book-cover'], 'old'))['book-cover'];
    const off = live && d0 ? Math.max(...['x', 'y', 'w', 'h'].map((k) => Math.abs(live[k] - d0[k]))) : null;
    check(res, tag + ' first frame: the front board drawn at 0 ms is where the live one stood (within 1 px)', off !== null && off < 1, { live, drawn: d0, off });
    await fp.close();
    // the language chosen on Reading is the one the shelf shows when Back restores it from the cache: already at the first frame of the move
    const lg = await context.newPage();
    await lg.goto(ORIGIN + '/Writing.dc.html', { waitUntil: 'load' }); await lg.evaluate(() => localStorage.setItem('fy-lang', 'zh')); await lg.reload({ waitUntil: 'load' }); await sleep(1500);
    const at4 = await pull(lg, W), n4 = await reveals(lg);
    await Promise.all([lg.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), lg.mouse.click(at4.x, at4.y)]);
    await settle(lg); await sleep(900);
    await lg.click('[data-act=lang]'); await lg.waitForFunction(() => localStorage.getItem('fy-lang') === 'en', null, { timeout: 4000 });
    await lg.goBack({ waitUntil: 'commit' }); r = await settle(lg, n4); await sleep(900);
    const sh = await lg.evaluate(() => ({ lang: document.querySelector('[data-mount=writing]').dataset.lang, shows: document.querySelector('.wr-sign').dataset.shows, open: !!document.querySelector('[data-opening]') }));
    check(res, tag + ' language chosen on Reading: Back shows English on the shelf and the sign, from the move\'s first frame', r.persisted === true && r.langAt === 'en' && sh.lang === 'en' && sh.shows === 'en' && !sh.open, { persisted: r.persisted, atReveal: r.langAt, ...sh });
    await lg.close();
    // an essay opened with nothing from the shelf before it (a page of its own): the link is a plain link (a fresh shelf, the paper swap)
    const lone = await context.newPage();
    lone.on('pageerror', (e) => errs.push(e.message));
    await lone.goto(ORIGIN + '/Reading.dc.html?post=' + POST, { waitUntil: 'load' }); await sleep(1200);
    r = await traced(lone, scratch, async () => { await lone.evaluate(() => document.querySelector('.rnav .back').click()); await lone.waitForURL(/Writing\.dc\.html/, { timeout: 9000 }); return settle(lone); });
    check(res, tag + ' link back, nothing before it: the paper swap onto a fresh shelf, composited',
      r.vt && r.fin && r.persisted !== true && r.anims.filter((a) => !a.ua).every((a) => a.moving.every((p) => p === 'transform' || p === 'opacity')) && !r.trace.some((d) => d.compositeFailed), { vt: r.vt, persisted: r.persisted, kind: r.kind });
    const lone2 = await context.newPage();
    await lone2.goto(ORIGIN + '/Reading.dc.html?post=' + POST, { waitUntil: 'load' }); await lone2.waitForSelector('.pn-tag', { timeout: 15000 }); await sleep(800);
    await lone2.evaluate(() => document.querySelector('.pn-tag').click()); await lone2.waitForFunction(() => /Writing\.dc\.html$/.test(location.pathname), null, { timeout: 9000 });
    check(res, tag + ' shelf tag, nothing before it: a plain link (a fresh page)', await lone2.evaluate(() => window.__persisted !== true && !!document.querySelector('.wr')));
    await context.close();
    if (dark) continue;
    // reduced motion: no transition either way
    const rm = await browser.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
    await instrument(rm);
    const p2 = await rm.newPage();
    p2.on('pageerror', (e) => errs.push('rm ' + e.message));
    await p2.goto(ORIGIN + '/Writing.dc.html', { waitUntil: 'load' }); await sleep(1500);
    const a2 = await pull(p2, W);
    await Promise.all([p2.waitForURL(/Reading\.dc\.html/, { timeout: 9000 }), p2.mouse.click(a2.x, a2.y)]);
    r = await settle(p2);
    check(res, tag + ' reduced motion: in, no transition', r.vt === false);
    await sleep(600);
    await p2.goBack({ waitUntil: 'commit' });
    r = await settle(p2);
    check(res, tag + ' reduced motion: back, no transition, the book put back', r.vt === false && await p2.evaluate(() => !document.querySelector('[data-opening]')));
    await rm.close();
  }
  await browser.close();
  const real = errs.filter((e) => !/Access is denied for this document/.test(e));
  check(res, 'no console or page errors', !real.length, real.slice(0, 6));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-book: ${res.length - bad.length}/${res.length} pass`);
};
