// vt-webkit.mjs — WebKit smoke pass (Playwright's WebKit build, the Safari engine) for the nav and the moves.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-webkit.mjs      env: VT_ORIGIN · VT_HOME=real|harness
// Every page loads and every move lands on the right URL with 0 console or page errors, whether or not this
// engine runs cross-document View Transitions (it reports which). Reduced motion gets none either way.
import { ORIGIN, hook, webkit, check } from './vt-lib.mjs';

export default async (_page, ctx) => {
  const res = [], errs = [], browser = await webkit();
  const idx = await (await fetch(ORIGIN + '/index.html')).text();
  const useReal = process.env.VT_HOME === 'real' || (process.env.VT_HOME !== 'harness' && /desk-geo\.js|class="desk-in"/.test(idx));
  const B = ORIGIN + (useReal ? '/' : '/scripts/verify/vt-harness/');
  ctx.log('WebKit ' + browser.version() + ' · pages: ' + B);
  for (const [label, opts] of [['motion', {}], ['reduced', { reducedMotion: 'reduce' }]]) {
    for (const w of [1440, 390]) {
      const c = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, ...opts }), p = await c.newPage();
      p.on('pageerror', (e) => errs.push(label + ' ' + w + ' pageerror ' + e.message));
      p.on('console', (m) => { if (m.type() === 'error') errs.push(label + ' ' + w + ' ' + p.url() + ' ' + m.text()); });
      await hook(c, []);
      await p.goto(B + 'index.html?opx=1&opener=none'); await p.waitForTimeout(900);
      const seen = [];
      for (const [sel, url] of [['a[href="Writing.dc.html"][aria-label]', /Writing/], ['.site-tab--shooting', /Gallery/], ['.site-tab--about', /About/], ['.site-home', /index\.html/]]) {
        await p.locator(sel).filter({ visible: true }).first().click();
        await p.waitForURL(url, { timeout: 8000 });
        await p.waitForTimeout(1400);
        const r = await p.evaluate(() => window.__vt && { vt: window.__vt.vt, kind: window.__vt.kind || null, fin: window.__vt.fin });
        seen.push(url.source.replace(/\\/g, '') + ':' + (r && r.vt ? r.kind + (r.fin ? '✓' : '…') : 'cut'));
        if (label === 'reduced') check(res, `webkit ${label} ${w} → ${url.source} no transition`, r && !r.vt);
      }
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      check(res, `webkit ${label} ${w} moves land, no overflow`, ov <= 0, seen.join(' · '));
      await c.close();
    }
  }
  await browser.close();
  check(res, 'webkit · no console or page errors', errs.length === 0, errs.slice(0, 8));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-webkit: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
