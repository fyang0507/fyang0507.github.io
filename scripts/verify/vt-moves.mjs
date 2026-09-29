// vt-moves.mjs — the three cross-document moves (transitions.js) in Chromium, at 1440 and 390.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-moves.mjs
//   env: VT_ORIGIN (:4173) · VT_HOME=real|harness (default: real once index.html loads the desk (desk-geo.js),
//        else the stub pages in scripts/verify/vt-harness/) · VT_W (default 1440,390)
// enter  home → Writing via the book: four obj-* groups with ≥ 10 sampled keyframes; the book's mid-flight y is
//        above the chord; settled ≤ 1.0 s; header readable at 0.75 s (every label ≥ 0.9 opaque, the tab drawn, the
//        line within 2.5 px of the rule: it may still be in its one small overshoot)
// leave  Gallery → home: every object ends lower than it starts (gravity); settled ≤ 1.1 s
// tab    Writing → Gallery: the tabmark rides a spring from tab to tab; the relay hops book, laptop, camera
// none   reduced motion, same tab (Writing ↔ Reading), 404, direct load and reload get no transition; fy-vt is
//        consumed every time. Plus: no console errors, no horizontal overflow after each move.
import { ORIGIN, hook, seek, xy, check } from './vt-lib.mjs';

const OBJS = ['obj-book', 'obj-laptop', 'obj-camera', 'obj-frame'];

async function arrive(page, go) {
  await Promise.all([page.waitForEvent('framenavigated', (f) => f === page.mainFrame()), go()]);
  await page.waitForFunction(() => window.__vt && window.__vt.vt !== null, null, { timeout: 5000 });
  const vt = await page.evaluate(() => window.__vt.vt);
  if (vt) await page.waitForFunction(() => window.__vt.fin || (window.__vt.freeze && window.__vt.ready), null, { timeout: 5000 }).catch(() => {});
  return page.evaluate(() => window.__vt);
}
async function clickVisible(page, sel) {
  const loc = page.locator(sel).filter({ visible: true }).first();
  return () => loc.click();
}
const custom = (r, pe) => r.anims.filter((a) => a.pe === pe && !a.ua);

export default async (page, ctx) => {
  const res = [], errs = [];
  const watch = (p) => { p.on('pageerror', (e) => errs.push('pageerror ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(p.url() + ' ' + m.text()); }); };
  watch(page);
  const idx = await (await fetch(ORIGIN + '/index.html')).text();
  const useReal = process.env.VT_HOME === 'real' || (process.env.VT_HOME !== 'harness' && /desk-geo\.js|class="desk-in"/.test(idx));
  const B = ORIGIN + (useReal ? '/' : '/scripts/verify/vt-harness/');
  ctx.log('pages: ' + B);
  await hook(page.context(), OBJS.concat(['tabmark']));

  for (const w of (process.env.VT_W || '1440,390').split(',').map(Number)) {
    await page.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    const T = (n) => w + ' ' + n;

    // enter, sampled every frame
    await page.goto(B + 'index.html?opener=none'); await page.waitForTimeout(900);
    let r = await arrive(page, await clickVisible(page, 'a[href="Writing.dc.html"][aria-label]'));
    check(res, T('enter · a transition, kind enter'), r.vt && r.kind === 'enter', r.kind);
    const obj = OBJS.map((n) => custom(r, '::view-transition-group(' + n + ')')[0]);
    check(res, T('enter · four obj-* groups with ≥ 10 custom keyframes'), obj.every((a) => a && a.n >= 10), obj.map((a) => a && a.n));
    const book = r.samples.map((s) => xy(s['obj-book'])).filter(Boolean);
    if (book.length > 4) {
      const a = book[0], b = book[book.length - 1], mid = book.reduce((m, p) => Math.abs(p.x - (a.x + b.x) / 2) < Math.abs(m.x - (a.x + b.x) / 2) ? p : m);
      const chord = a.y + (b.y - a.y) * (mid.x - a.x) / ((b.x - a.x) || 1);
      check(res, T('enter · the book flies above its chord'), mid.y < chord - 5, { midY: +mid.y.toFixed(1), chordY: +chord.toFixed(1) });
    } else check(res, T('enter · the book flies above its chord'), false, 'no samples');
    check(res, T('enter · settles ≤ 1.0 s'), r.fin && r.finAt - r.readyAt <= 1000, Math.round(r.finAt - r.readyAt) + ' ms');
    check(res, T('enter · fy-vt consumed'), await page.evaluate(() => sessionStorage.getItem('fy-vt') === null));
    check(res, T('enter · no overflow after'), await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // enter, frozen at 0.75 s: is the header readable?
    await page.goto(B + 'index.html?opener=none'); await page.waitForTimeout(700);
    await page.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
    r = await arrive(page, await clickVisible(page, 'a[href="Writing.dc.html"][aria-label]'));
    await seek(page, 750);
    const at = await page.evaluate(() => {
      const labs = [...document.querySelectorAll('.site-index .site-nav-label')].map((l) => +getComputedStyle(l).opacity);
      const rule = document.querySelector('.site-rule').getBoundingClientRect(), live = document.querySelector('.fy-rule-live path');
      const d = live && live.getAttribute('d'), m = d && d.match(/-?\d*\.?\d+/g).map(Number);
      const p = document.querySelector('.site-tabmark path'), off = p ? parseFloat(getComputedStyle(p).strokeDashoffset) : null;
      return { labs, ruleY: rule.top + rule.height / 2, lineY: m ? [m[1], m[m.length - 1]] : null, off };
    });
    check(res, T('enter · header readable at 0.75 s'), at.labs.every((o) => o >= 0.9) && at.lineY && at.lineY.every((y) => Math.abs(y - at.ruleY) <= 2.5) && at.off != null && Math.abs(at.off) < 1, at);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));

    // leave
    await page.goto(B + 'Gallery.dc.html'); await page.waitForTimeout(900);
    r = await arrive(page, await clickVisible(page, '.site-home'));
    check(res, T('leave · a transition, kind leave'), r.vt && r.kind === 'leave', r.kind);
    const falls = OBJS.map((n) => { const s = r.samples.map((x) => xy(x[n])).filter(Boolean); return s.length > 1 ? +(s[s.length - 1].y - s[0].y).toFixed(1) : null; });
    check(res, T('leave · every object ends lower than it starts'), falls.every((d) => d > 0), falls);
    check(res, T('leave · settles ≤ 1.1 s'), r.fin && r.finAt - r.readyAt <= 1100, Math.round(r.finAt - r.readyAt) + ' ms');
    check(res, T('leave · fy-vt consumed'), await page.evaluate(() => sessionStorage.getItem('fy-vt') === null));

    // tab
    await page.goto(B + 'Writing.dc.html'); await page.waitForTimeout(900);
    r = await arrive(page, await clickVisible(page, '.site-tab--shooting'));
    const tm = r.samples.map((s) => xy(s.tabmark)).filter(Boolean);
    const hops = ['obj-book', 'obj-laptop', 'obj-camera'].map((n) => custom(r, '::view-transition-group(' + n + ')')[0]);
    check(res, T('tab · kind tab, tabmark on a custom spring'), r.vt && r.kind === 'tab' && custom(r, '::view-transition-group(tabmark)').length === 1 && tm.length > 2 && tm[tm.length - 1].x - tm[0].x > 100,
      tm.length ? { from: tm[0].x, to: tm[tm.length - 1].x, max: Math.max(...tm.map((p) => p.x)) } : null);
    check(res, T('tab · the relay hops book → laptop → camera, not the frame'), hops.every((a) => a && a.n >= 6) && !custom(r, '::view-transition-group(obj-frame)').length, hops.map((a) => a && a.n));
    check(res, T('tab · settles ≤ 0.8 s'), r.fin && r.finAt - r.readyAt <= 800, Math.round(r.finAt - r.readyAt) + ' ms');

    // no transition: same tab, 404, direct load, reload
    await page.goto(B + 'Writing.dc.html'); await page.waitForTimeout(500);
    r = await arrive(page, () => page.evaluate(() => { location.href = 'Reading.dc.html' + (document.querySelector('.hz-main') ? '' : '?post=2025-12-06_the-stories-we-live-05'); }));
    check(res, T('same tab (Writing → Reading): none'), r.vt === false);
    r = await arrive(page, () => page.evaluate(() => { location.href = 'Building.dc.html'; }));
    check(res, T('Reading → Building: tab'), r.vt && r.kind === 'tab', r.kind);
    r = await arrive(page, () => page.evaluate(() => { location.href = '404.html'; }));
    check(res, T('404 page: none'), r.vt === false);
    r = await arrive(page, () => page.goto(B + 'About.dc.html'));
    check(res, T('direct load: none, fy-vt clear'), r.vt === false && await page.evaluate(() => sessionStorage.getItem('fy-vt') === null));
    r = await arrive(page, () => page.reload());
    check(res, T('reload: none, fy-vt clear'), r.vt === false && await page.evaluate(() => sessionStorage.getItem('fy-vt') === null));
  }

  // reduced motion: no view transition at all
  const rm = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p2 = await rm.newPage(); watch(p2);
  await hook(rm, []);
  await p2.goto(B + 'index.html?opener=none'); await p2.waitForTimeout(700);
  let r2 = await arrive(p2, await clickVisible(p2, 'a[href="Writing.dc.html"][aria-label]'));
  check(res, 'reduced motion · home → Writing: none', r2.vt === false);
  r2 = await arrive(p2, await clickVisible(p2, '.site-tab--shooting'));
  check(res, 'reduced motion · Writing → Gallery: none', r2.vt === false);
  r2 = await arrive(p2, await clickVisible(p2, '.site-home'));
  check(res, 'reduced motion · Gallery → home: none', r2.vt === false);
  await rm.close();

  const real = errs.filter((e) => !/404\.html .*404|Reading\.dc\.html.*404 \(File not found\)/.test(e));
  check(res, 'no console or page errors', real.length === 0, real.slice(0, 6));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-moves: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
