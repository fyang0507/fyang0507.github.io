// evidence.mjs — the Building sub-sites' evidence images, served from the derived ladder (images/derived/evidence/).
//   node /tmp/fyshot/run.mjs scripts/verify/evidence.mjs
//   env: VT_ORIGIN (after, :4173) · VT_BEFORE (main, :4174) · EV_W (1440,390) · EV_DPR (1) · EV_PAGES (comma list; empty: crawl only)
// 1. EV_PAGES against main: a cold first visit on Fast 4G (9 Mbps, 165 ms RTT), measured before any scroll and again
//    after a full scroll at a skimming pace. Demos must transfer under 1.5 MB before any scroll (the budget PR 2 set, as
//    project-pages.mjs does; this PR's first gate, a quarter of main's, measured against the PNG captures); no page's
//    CLS through the scroll may exceed the larger of main's and 0.01, plus 0.002 of run-to-run noise. The Demos
//    recording is left out of the bytes: python's http.server has no Range support, so a preload streams it whole.
// 2. Demos' loupes, on the branch: at rest each frames its target from the file its image already shows; opening one
//    lays the zoom tier over its figure's loupes, and nothing fetches the zoom tier before that.
// 3. Every building/ page, on the branch, fully scrolled:
//    - every evidence <img> and <source> points only at derived files; its width and height are the original's, as in
//      content/image-dimensions.json (the email demo's are its display size, which email clients honour, so there
//      they need only give the original's ratio); once loaded it is not undersized for its box at the DPR;
//    - nothing from images/evidence/ or the old PNG captures, and nothing from apa.njjoegroup.com: the only hosts
//      besides the site's own are Google Fonts' and unpkg's; every request returns 200.
import { readFileSync, readdirSync } from 'fs';
import { ORIGIN, check } from './vt-lib.mjs';

const MAIN = process.env.VT_BEFORE || 'http://127.0.0.1:4174', DPR = +(process.env.EV_DPR || 1);
const WIDTHS = (process.env.EV_W || '1440,390').split(',').map(Number);
const PAGES = (process.env.EV_PAGES ?? 'building/fred-agent/demos.html,building/njjoe/microsite.html,building/njjoe/apa.html,building/fred-agent/index.html').split(',').filter(Boolean);
const ROOT = new URL('../../', import.meta.url);
const CRAWL = readdirSync(new URL('building/', ROOT), { recursive: true }).filter((f) => f.endsWith('.html')).map((f) => 'building/' + f).sort();
const DIMS = JSON.parse(readFileSync(new URL('content/image-dimensions.json', ROOT), 'utf8'));
const HOSTS = /^(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com)$/;
const FORBIDDEN = /\/images\/evidence\/|\/assets\/fred-agent\/demo\/[^?]*\.png|\/assets\/njjoe\/[^?]*\.png|apa\.njjoegroup\.com/;
const EVIDENCE = /images\/derived\/evidence\/|fred-agent\/demo\/[^?]*\.png|assets\/njjoe\/[^?]*\.png|apa\.njjoegroup\.com/;
const MB = (b) => (b / 1048576).toFixed(2) + ' MB';

// images/derived/evidence/<project>/<stem>-<w|zoom>.jpg → the original's key in image-dimensions.json
function original(url) {
  const m = (url || '').match(/images\/derived\/evidence\/([^/]+)\/(.+)-(?:\d+|zoom)\.jpg$/);
  return m && Object.keys(DIMS).find((k) => k.replace(/\.[^.]+$/, '') === `images/evidence/${m[1]}/${m[2]}`);
}

// every request of every frame (the email demo is a sandboxed, out-of-process iframe), with its transfer size
function track(page) {
  const reqs = new Map();
  page.on('request', (r) => reqs.set(r, { url: r.url() }));
  page.on('requestfinished', async (r) => {
    const rec = reqs.get(r), res = await r.response().catch(() => null), s = await r.sizes().catch(() => null);
    if (rec) Object.assign(rec, { status: res && res.status(), bytes: s ? s.responseBodySize + s.responseHeadersSize : 0, done: true });
  });
  page.on('requestfailed', (r) => { const rec = reqs.get(r); if (rec) Object.assign(rec, { failed: r.failure() && r.failure().errorText, done: true }); });
  return reqs;
}

async function quiet(page, reqs, ms = 1500, cap = 45000) {
  const t0 = Date.now();
  let last = Date.now(), n = -1;
  while (Date.now() - t0 < cap) {
    const pending = [...reqs.values()].filter((r) => !r.done && !/\.mp4/.test(r.url)).length;
    if (pending || reqs.size !== n) { last = Date.now(); n = reqs.size; }
    if (Date.now() - last > ms) return;
    await page.waitForTimeout(250);
  }
}

function tally(reqs) {
  const rows = [...reqs.values()].filter((r) => !/\.mp4/.test(r.url)), sum = (f) => rows.filter(f).reduce((a, r) => a + (r.bytes || 0), 0);
  return { total: sum(() => true), evidence: sum((r) => EVIDENCE.test(r.url)) };
}

async function visit(browser, base, path, w, { throttle = true, then } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: DPR });
  const page = await ctx.newPage(), reqs = track(page);
  if (throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  }
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(base + '/' + path, { waitUntil: 'load', timeout: 60000 });
  await quiet(page, reqs);
  const before = tally(reqs), clsLoad = await page.evaluate(() => window.__cls);
  // a full scroll at a skimming pace: most of a screen every 350 ms, as a reader looking for the next figure, then a
  // swipe to the end of every canvas wider than its box (on phones, Fig. 04's third panel is off to the right)
  await page.evaluate(async () => {
    const step = innerHeight * 0.8, wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = step; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await wait(350); }
    for (const el of document.querySelectorAll('.fa-evidence-scroll')) {
      if (el.scrollWidth <= el.clientWidth + 1) continue;
      el.scrollIntoView({ block: 'center' });
      for (let x = 0; x <= el.scrollWidth; x += el.clientWidth * 0.8) { el.scrollLeft = x; await wait(350); }
    }
  });
  await quiet(page, reqs);
  const after = tally(reqs), cls = await page.evaluate(() => window.__cls);
  const extra = then ? await then(page, reqs) : null;
  await ctx.close();
  return { before, after, clsLoad, cls, reqs, extra };
}

// every evidence <img> / <source> in the document: its URLs, width and height, and (for an img) what it loaded
const sizing = (page) => page.evaluate((dpr) => {
  const widths = (el) => (el.getAttribute('srcset') || '').split(',').map((c) => +((c.trim().split(/\s+/)[1] || '').replace('w', '')) || 0);
  return [...document.querySelectorAll('img, picture source')].filter((el) => /evidence|demo\/|njjoe/.test((el.getAttribute('src') || '') + (el.getAttribute('srcset') || ''))).map((el) => {
    const urls = [el.getAttribute('src'), ...(el.getAttribute('srcset') || '').split(',').map((c) => c.trim().split(/\s+/)[0])].filter(Boolean);
    const out = { tag: el.tagName.toLowerCase(), urls, w: +el.getAttribute('width'), h: +el.getAttribute('height'), zoom: el.getAttribute('data-zoom-src') };
    if (el.tagName === 'IMG') {
      const pic = el.parentElement.tagName === 'PICTURE' && [...el.parentElement.querySelectorAll('source')].find((s) => matchMedia(s.media).matches);
      // the chosen file's own pixel width is in its name (naturalWidth is divided by the candidate's density)
      const px = +((el.currentSrc.match(/-(\d+)\.jpg$/) || [])[1]) || el.naturalWidth;
      Object.assign(out, { loaded: el.complete && el.naturalWidth > 0, px, box: el.getBoundingClientRect().width, top: Math.max(...widths(pic || el)) || px, current: el.currentSrc.split('/').pop() });
    }
    return out;
  });
}, DPR);

async function loupes(page, reqs, res, label) {
  const zooms = () => [...reqs.values()].filter((r) => /-zoom\.jpg/.test(r.url));
  check(res, `${label}: no zoom tier fetched before a loupe opens`, zooms().length === 0, zooms().map((r) => r.url.split('/').pop()).join(', ') || 'none');
  const rest = await page.evaluate(() => [...document.querySelectorAll('.fa-evidence-shot-wrap')].flatMap((wrap) => {
    const img = wrap.querySelector('.fa-evidence-shot img');
    return [...wrap.querySelectorAll('.fa-evidence-loupe[data-scope-target-x]')].map((s) => {
      const [bw, bh] = s.style.backgroundSize.split(' ').map(parseFloat), [px, py] = s.style.backgroundPosition.split(' ').map(parseFloat);
      const tx = s.dataset.scopeTargetX / 100, ty = s.dataset.scopeTargetY / 100;
      return { id: s.getAttribute('aria-controls'), bg: s.style.backgroundImage, current: img.currentSrc, dx: px + tx * bw - s.offsetWidth / 2, dy: py + ty * bh - s.offsetHeight / 2 };
    });
  }));
  const framed = rest.filter((l) => l.current && l.bg === `url("${l.current}")` && Math.abs(l.dx) < 1 && Math.abs(l.dy) < 1);
  check(res, `${label}: every loupe at rest shows its image's own file, centred on its target`, rest.length === 10 && framed.length === rest.length, `${framed.length}/${rest.length}` + (framed.length < rest.length ? ' · ' + JSON.stringify(rest.filter((l) => !framed.includes(l)).slice(0, 2)) : ''));
  // open one loupe per figure: the loupes of its figure (Fig. 04's three panels open together) lay the zoom tier on top
  for (const id of ['trash-note-capture', 'discord-note-audio', 'recovery-note-task']) {
    await page.click(`[aria-controls="${id}"]`);
    await quiet(page, reqs, 800, 20000);
    const open = await page.evaluate((id) => {
      const scope = document.querySelector(`[aria-controls="${id}"]`), group = scope.closest('[data-evidence-focus-group]');
      return (group ? [...group.querySelectorAll('.fa-evidence-shot-wrap')] : [scope.closest('.fa-evidence-shot-wrap')]).map((w) => {
        const img = w.querySelector('img');
        return { open: w.classList.contains('is-focus-mode'), bg: [...w.querySelectorAll('.fa-evidence-loupe')].map((s) => s.style.backgroundImage), want: `url("${img.getAttribute('data-zoom-src')}"), url("${img.currentSrc}")`, zoom: new URL(img.getAttribute('data-zoom-src'), location.href).href };
      });
    }, id);
    const got = zooms().filter((r) => open.some((w) => r.url === w.zoom));
    check(res, `${label}: opening ${id} lays the zoom tier over its figure's loupes, each fetched 200`, open.every((w) => w.open && w.bg.every((b) => b === w.want)) && got.length === open.length && got.every((r) => r.status === 200), got.map((r) => r.status + ' ' + r.url.split('/').pop()).join(', '));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

function audit(res, label, path, imgs, reqs) {
  const email = /email-demo\//.test(path);
  const sized = (i) => { const d = DIMS[original(i.urls[0])]; return d && (email ? Math.abs(i.w * d[1] / d[0] - i.h) <= 1 : i.w === d[0] && i.h === d[1]); };
  const bad = imgs.filter((i) => i.urls.some((u) => !/images\/derived\/evidence\//.test(u)) || (i.zoom && !original(i.zoom)) || !sized(i));
  if (imgs.length) check(res, `${label}: every evidence img/source is derived and sized as its original (${imgs.length})`, bad.length === 0, bad.map((i) => i.urls[0] + ' ' + i.w + 'x' + i.h).join(', ') || 'ok');
  const loaded = imgs.filter((i) => i.tag === 'img'), small = loaded.filter((i) => !i.loaded || i.px < Math.min(i.box * DPR, i.top) * 0.98);   // 2%: sub-pixel boxes
  if (loaded.length) check(res, `${label}: every evidence image loaded and is not undersized at ${DPR}x`, small.length === 0, small.map((i) => `${i.current || 'unloaded ' + i.urls[0]} ${i.px}px for ${Math.round(i.box)}px`).join(', ') || loaded.map((i) => `${i.current}@${Math.round(i.box)}`).join(' '));
  const all = [...reqs.values()], forbidden = all.filter((r) => FORBIDDEN.test(r.url));
  check(res, `${label}: nothing from images/evidence/, the old PNG captures or apa.njjoegroup.com`, forbidden.length === 0, forbidden.map((r) => r.url).join(', ') || 'none');
  const origin = new URL(ORIGIN).host, hosts = [...new Set(all.map((r) => new URL(r.url).host).filter((h) => h && h !== origin))];
  check(res, `${label}: no host besides the site's own, Google Fonts' and unpkg's`, hosts.every((h) => HOSTS.test(h)), hosts.join(', ') || 'none');
  // a media element aborts its own fetch once it has what it needs (the Demos recording's preload="metadata")
  const failed = all.filter((r) => (r.failed && !(/\.mp4/.test(r.url) && /ERR_ABORTED/.test(r.failed))) || (r.status && r.status !== 200 && r.status !== 206));
  check(res, `${label}: every request returns 200`, failed.length === 0, failed.map((r) => (r.status || r.failed) + ' ' + r.url).join(', ') || 'ok');
}

export default async (page, ctx) => {
  const res = [], browser = page.context().browser(), rows = [];
  for (const w of WIDTHS) {
    for (const path of PAGES) {
      const label = `${w} ${path.replace(/^building\//, '')}`, demos = /demos\.html/.test(path);
      const main = await visit(browser, MAIN, path, w);
      const branch = await visit(browser, ORIGIN, path, w, { then: demos ? (p, reqs) => loupes(p, reqs, res, label) : null });
      rows.push(`| ${path.replace(/^building\//, '')} | ${w} | ${MB(main.before.total)} → ${MB(branch.before.total)} | ${MB(main.after.total)} → ${MB(branch.after.total)} | ${MB(main.after.evidence)} → ${MB(branch.after.evidence)} | ${main.clsLoad.toFixed(3)} → ${branch.clsLoad.toFixed(3)} | ${main.cls.toFixed(3)} → ${branch.cls.toFixed(3)} |`);
      ctx.log(rows[rows.length - 1]);
      if (demos) check(res, `${label}: Demos under 1.5 MB before any scroll`, branch.before.total < 1.5 * 1048576, `${MB(branch.before.total)} (main ${MB(main.before.total)})`);
      check(res, `${label}: CLS through the scroll no worse than max(main, 0.01)`, branch.cls <= Math.max(main.cls, 0.01) + 0.002, `${branch.cls.toFixed(4)} vs ${main.cls.toFixed(4)}`);
    }
    for (const path of CRAWL) {
      const label = `${w} ${path.replace(/^building\//, '')}`;
      const v = await visit(browser, ORIGIN, path, w, { throttle: false, then: (p) => sizing(p) });
      audit(res, label, path, v.extra, v.reqs);
    }
  }
  ctx.log(`\n| page | width | before scroll | after full scroll | evidence after scroll | CLS at load | CLS scrolled |\n|---|---|---|---|---|---|---|\n` + rows.join('\n'));
  const failed = res.filter((x) => !x.ok);
  ctx.log(`evidence: ${res.length - failed.length}/${res.length} pass`);
  if (failed.length) process.exitCode = 1;
};
