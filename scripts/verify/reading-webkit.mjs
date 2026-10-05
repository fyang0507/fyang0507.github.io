// reading-webkit.mjs — WebKit smoke pass (Playwright's WebKit build, the Safari engine): the page mounts, the top is
// clean, the hero prints (on light and dark paper) and lands, a note opens (margin at 1440, slip at 390), both toggles
// work; 0 errors.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-webkit.mjs      (env: see reading-lib.mjs)
import { createRequire } from 'module';
import { POSTS, url, context, watch, ready, scroll, geo, paperOnly, report, sleep } from './reading-lib.mjs';

export default async (page, ctx) => {
  const req = createRequire(process.argv[1]), pw = await import(req.resolve('playwright-core'));
  const wk = await (pw.webkit || pw.default.webkit).launch({ headless: true }), rows = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const errors = [], c = await context(wk, w, h, { touch: w < 700 }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.multi)); await ready(p);
    const top = await paperOnly(p), g = await geo(p);
    rows.push(['webkit ' + w + ': clean at scroll 0', top.ok, top]);
    await scroll(p, 180, 400);
    const mid = await paperOnly(p);
    rows.push(['webkit ' + w + ': prints on scroll', !mid.ok, { bad: mid.bad, depth: mid.depth }]);
    await scroll(p, Math.round(g.sL) + 200, 900);
    rows.push(['webkit ' + w + ': lands', await p.evaluate(() => document.querySelector('.rnav').classList.contains('landed')), '']);
    const r = await p.evaluate(() => { const a = document.querySelector('.post-body.zh .fnref a[data-ref]'); a.scrollIntoView({ block: 'center' }); const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    await sleep(300);
    if (w < 700) await p.touchscreen.tap(r.x, r.y); else await p.mouse.move(r.x, r.y, { steps: 4 });
    await sleep(1400);
    rows.push(['webkit ' + w + ': a note opens', await p.evaluate(() => !!document.querySelector('.mn.on') || document.querySelector('.fs-root').classList.contains('open')), '']);
    await p.click('[data-act="lang"]'); await sleep(300); await p.click('[data-act="theme"]'); await sleep(300);
    rows.push(['webkit ' + w + ': toggles flip', await p.evaluate(() => document.documentElement.classList.contains('lang-en') && document.documentElement.classList.contains('dark')), '']);
    rows.push(['webkit ' + w + ': 0 errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  for (const [w, h] of [[1440, 900], [390, 844]]) {   // dark paper prints too
    const errors = [], c = await context(wk, w, h, { touch: w < 700, dark: true }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.multi, '&theme=dark')); await ready(p);
    const top = await paperOnly(p);
    await scroll(p, 180, 400);
    const mid = await paperOnly(p);
    rows.push(['webkit ' + w + ' dark: clean at scroll 0, prints on scroll', top.ok && !mid.ok, { top: top.bad, mid: mid.bad, depth: mid.depth }]);
    rows.push(['webkit ' + w + ' dark: 0 errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  await wk.close();
  report(ctx.log, rows);
};
