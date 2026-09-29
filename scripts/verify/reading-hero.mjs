// reading-hero.mjs — the hero invariants: no halftone at scroll 0 (and never under reduced motion or in dark mode),
// the nav lands at sL and is opaque at every scroll position, and the language and theme toggles re-render nothing.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-hero.mjs      (env: see reading-lib.mjs)
import { POSTS, url, context, watch, ready, scroll, geo, paperOnly, report, sleep } from './reading-lib.mjs';

// The nav is opaque when its paper plate is shown, fills the bar and has an opaque background (reduced motion: the bar
// itself turns to paper the moment anything is under it). Then the pixels: once landed, the bar's empty middle is
// sampled from a screenshot and must be paper, whatever text is scrolling underneath.
const navCheck = (page) => page.evaluate(() => {
  const nav = document.querySelector('.rnav'), plate = nav.querySelector('.nav-plate'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const h = nav.classList.contains('landed') ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--n1')) : nav.offsetHeight;
  const opaque = (el) => { const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/); const p = m ? m[1].split(',') : []; return !!m && (p.length < 4 || +p[3] >= .999); };
  if (rm) return { ok: scrollY <= 1 || opaque(nav), h };
  const pr = plate.getBoundingClientRect();
  return { ok: getComputedStyle(plate).display !== 'none' && opaque(plate) && pr.top <= 0 && pr.bottom >= h - .5 && +getComputedStyle(nav).zIndex > 1, h };
});
async function barPixels(page, h) {
  const vw = await page.evaluate(() => innerWidth);
  const clip = { x: Math.round(vw * .2), y: 1, width: Math.round(vw * .6), height: 6 };   // the band above the bar's content
  const b64 = (await page.screenshot({ clip })).toString('base64');
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data, v = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().replace('#', '');
    const P = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
    let worst = 0; for (let i = 0; i < d.length; i += 4) worst = Math.max(worst, Math.abs(d[i] - P[0]), Math.abs(d[i + 1] - P[1]), Math.abs(d[i + 2] - P[2]));
    return worst;
  }, b64);
}

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.cover)); await ready(p);
    const g = await geo(p);
    const top = await paperOnly(p);
    rows.push([w + ' scroll 0: depth 0 and paper only', top.ok && +top.depth === 0, top]);
    await scroll(p, 1, 200);
    const one = await p.evaluate(() => +document.querySelector('.plate').dataset.depth);
    rows.push([w + ' 1px of scroll: depth > 0', one > 0, one]);
    await scroll(p, 180, 250);
    const mid = await paperOnly(p);
    rows.push([w + ' 180px: the halftone prints (dots present)', !mid.ok && mid.bad > 200, { bad: mid.bad, depth: mid.depth }]);
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(1200);
    const back = await paperOnly(p);
    rows.push([w + ' back at 0: clean again', back.ok && +back.depth === 0, back]);
    // nav: lands at sL, opaque at every position
    const ys = [0, 40, Math.round(g.sL / 2), Math.round(g.sL) - 2, Math.round(g.sL) + 2, Math.round(g.sL) + 400, Math.round(g.max / 2), g.max];
    let navOk = true, landOk = true; const seen = [];
    for (const y of ys) {
      await scroll(p, y, 700);
      const n = await navCheck(p), landed = await p.evaluate(() => document.querySelector('.rnav').classList.contains('landed'));
      const want = y >= g.sL - .5, px = landed ? await barPixels(p, n.h) : 0;   // paper ±12 (the page's 5% grain)
      if (!n.ok || px > 12) navOk = false;
      if (landed !== want) landOk = false;
      seen.push(y + ':' + (n.ok ? 'o' : 'X') + (landed ? 'L' + px : '-'));
    }
    rows.push([w + ' nav opaque at every scroll position', navOk, seen.join(' ')]);
    rows.push([w + ' nav .landed exactly from sL', landOk, 'sL=' + Math.round(g.sL)]);
    // toggles: nothing in the hero is removed, and the halftone state survives
    await scroll(p, 0, 400);
    await p.evaluate(() => {
      window.__removed = 0;
      const mo = new MutationObserver((l) => l.forEach((m) => { window.__removed += m.removedNodes.length; }));
      ['.article-intro', '.plate', '.nav-plate', '.post-body.zh', '.post-body.en'].forEach((s) => { const el = document.querySelector(s); if (el) mo.observe(el, { childList: true, subtree: true }); });
      window.__mo = mo;
    });
    for (const act of ['lang', 'theme', 'lang', 'theme']) { await p.click('[data-act="' + act + '"]'); await sleep(350); }
    const removed = await p.evaluate(() => { window.__mo.disconnect(); return window.__removed; });
    rows.push([w + ' language and theme toggles remove no hero nodes', removed === 0, removed]);
    const after = await paperOnly(p);
    rows.push([w + ' after toggles at 0: still clean', after.ok, after]);
    rows.push([w + ' no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  // reduced motion and dark mode never print dots, anywhere in the hero
  for (const mode of ['reduced', 'dark']) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const errors = [], c = await context(browser, w, h, { reduced: mode === 'reduced' }), p = await c.newPage(); watch(p, errors);
      await p.goto(url(POSTS.cover, mode === 'dark' ? '&theme=dark' : '')); await ready(p);
      const g = await geo(p);
      let ok = true; const r = [];
      for (const y of [0, 1, 60, 180, Math.round(g.sL / 2), Math.round(g.sL) - 10]) { await scroll(p, y, 250); const s = await paperOnly(p); if (!s.ok) ok = false; r.push(y + ':' + s.bad + (s.bad ? '/' + s.worst : '') + '@' + s.depth); }
      rows.push([w + ' ' + mode + ': never any dots', ok, r.join(' ')]);
      rows.push([w + ' ' + mode + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
      await c.close();
    }
  }
  report(ctx.log, rows);
};
