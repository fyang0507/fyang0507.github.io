// vt-lcp.mjs — LCP of every page against main (http://127.0.0.1:4174/), as a first visit: fresh context per run,
// Fast 4G (9 Mbps, 165 ms RTT) at 1440, plus 4× CPU at 390 (the throttling of gallery-lcp.mjs); median of RUNS.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-lcp.mjs     env: RUNS (5) · VT_W (1440,390) · VT_PAGES (comma list)
// A page passes when its median is no slower than main's by more than NOISE (max of 5% and 40 ms).
import { ORIGIN, check } from './vt-lib.mjs';

const MAIN = process.env.VT_BEFORE || 'http://127.0.0.1:4174', RUNS = +(process.env.RUNS || 5);
const PAGES = (process.env.VT_PAGES || 'index.html,Writing.dc.html,Building.dc.html,Gallery.dc.html,About.dc.html,Reading.dc.html?post=2025-12-06_the-stories-we-live-05').split(',');

async function lcp(browser, url, w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  if (w < 500) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript(() => {
    window.__lcp = []; window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: e.startTime, el: e.element ? e.element.tagName.toLowerCase() + (e.element.classList[0] ? '.' + e.element.classList[0] : '') : '(gone)' }))).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await p.goto(url, { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => Object.assign({ t: NaN, el: 'none' }, window.__lcp[window.__lcp.length - 1], { cls: window.__cls }));
  await ctx.close();
  return r;
}
const median = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];

export default async (page, ctx) => {
  const res = [], rows = [], browser = page.context().browser();
  for (const w of (process.env.VT_W || '1440,390').split(',').map(Number)) {
    for (const p of PAGES) {
      const out = {};
      for (const [name, base] of [['main', MAIN], ['branch', ORIGIN]]) {
        const runs = [];
        for (let i = 0; i < RUNS; i++) runs.push(await lcp(browser, base + '/' + p, w));
        out[name] = { t: median(runs.map((r) => r.t)), runs: runs.map((r) => Math.round(r.t)), el: [...new Set(runs.map((r) => r.el))].join('|'), cls: Math.max(...runs.map((r) => r.cls)) };
      }
      const d = out.branch.t - out.main.t, noise = Math.max(40, out.main.t * 0.05), name = p.split('?')[0];
      rows.push(`| ${name} | ${w} | ${Math.round(out.main.t)} (${out.main.el}) | ${Math.round(out.branch.t)} (${out.branch.el}) | ${d > 0 ? '+' : ''}${Math.round(d)} |`);
      ctx.log(`${w} ${name}: main ${Math.round(out.main.t)} [${out.main.runs}] · branch ${Math.round(out.branch.t)} [${out.branch.runs}] · CLS ${out.main.cls.toFixed(3)} → ${out.branch.cls.toFixed(3)}`);
      check(res, `${w} ${name}: LCP no slower than main beyond noise (${Math.round(noise)} ms)`, d <= noise, `${Math.round(out.branch.t)} vs ${Math.round(out.main.t)} ms`);
    }
  }
  ctx.log('\n| page | width | main LCP ms (element) | branch LCP ms (element) | Δ ms |\n|---|---|---|---|---|\n' + rows.join('\n'));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-lcp: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
