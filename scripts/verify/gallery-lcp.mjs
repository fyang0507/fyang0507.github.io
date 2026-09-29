// gallery-lcp.mjs — LCP sanity against main: Gallery's LCP element stays its <h1 class="display"> and isn't slower.
// Fresh context per run, Fast 4G (9 Mbps, 165 ms RTT) at 1440, plus 4× CPU at 390; median of RUNS.
//   node /tmp/fyshot/run.mjs scripts/verify/gallery-lcp.mjs     env: GALLERY_BEFORE (default http://127.0.0.1:4174/), RUNS (3)
import { Report, BASE } from './gallery-lib.mjs';

const BEFORE = process.env.GALLERY_BEFORE || 'http://127.0.0.1:4174/', RUNS = +(process.env.RUNS || 3);

async function lcp(page, base, w, h, cpu) {
  const ctx = await page.context().browser().newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await p.addInitScript(() => {
    window.__lcp = []; window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: e.startTime, size: e.size, el: e.element ? e.element.tagName.toLowerCase() + (e.element.className ? '.' + String(e.element.className).trim().split(/\s+/).join('.') : '') : '(gone)' }))).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await p.goto(base + 'Gallery.dc.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(6000);
  const all = await p.evaluate(() => window.__lcp), cls = await p.evaluate(() => window.__cls);
  await ctx.close();
  return Object.assign({ t: NaN, el: 'none' }, all[all.length - 1], { cls });
}
const median = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];

export default async (page, ctx) => {
  const R = Report(ctx, 'lcp');
  for (const [w, h, cpu] of [[1440, 900, 1], [390, 844, 4]]) {
    const out = {};
    for (const [name, base] of [['main', BEFORE], ['branch', BASE]]) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) runs.push(await lcp(page, base, w, h, cpu));
      out[name] = { t: median(runs.map((r) => r.t)), els: [...new Set(runs.map((r) => r.el))], runs: runs.map((r) => Math.round(r.t)), cls: Math.max(...runs.map((r) => r.cls)) };
      R.info(w + ' ' + name + ': LCP ' + Math.round(out[name].t) + ' ms (' + out[name].runs.join(', ') + ') · ' + out[name].els.join(' | ') + ' · CLS ≤ ' + out[name].cls.toFixed(4));
    }
    const h1 = out.branch.els.every((e) => /^h1\.display/.test(e)), wasH1 = out.main.els.every((e) => /^h1\.display/.test(e));
    if (wasH1) R.ok(w + ': the LCP element is still the h1', h1, out.branch.els.join(' | '));
    else R.info(w + ': on main the LCP element is ' + out.main.els.join(' | ') + ', so the h1 rule is checked at 1440 only');
    R.ok(w + ': LCP no slower than main (median, +5% noise allowance)', out.branch.t <= out.main.t * 1.05, Math.round(out.branch.t) + ' vs ' + Math.round(out.main.t) + ' ms');
    R.ok(w + ': no more layout shift than main', out.branch.cls <= Math.max(0.01, out.main.cls), out.branch.cls.toFixed(4) + ' vs ' + out.main.cls.toFixed(4));
  }
  R.done();
};
