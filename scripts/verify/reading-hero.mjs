// reading-hero.mjs — the hero invariants. On light and dark paper: no halftone at scroll 0 (and never under reduced
// motion), the halftone prints as soon as the page scrolls, the nav lands at sL and is opaque at every scroll
// position, and the language and theme toggles re-render nothing. Every text over the plate reads at rest and in flight,
// on both papers (the lightest, the darkest and a subtitled cover). On dark paper, where the light title flies over
// light dots, the title reads over every dot, and the lightest cover still shows as dark (reading.css --cap). A theme
// toggled mid-scroll repaints the plate exactly as a fresh load in that theme paints it; a cover whose srcset swaps
// files on a resize is screened again from the new file; a cover that fails prints no dots.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-hero.mjs      (env: see reading-lib.mjs)
import { textContrast } from './reading-contrast.mjs';
import { BASE, POSTS, url, context, watch, ready, scroll, geo, paperOnly, report, sleep } from './reading-lib.mjs';
const BASE_URL = BASE + 'Reading.dc.html';
const DARK = '&theme=dark';

// The title over the halftone: the worst contrast between the title's colour and any opaque pixel the plate's canvas
// holds (paper, dots and their edges on paper; the plate's cover is fainter than any dot). POSTS.cover is the
// lightest cover, so on dark paper it prints the brightest dots there are.
const titleOverDots = (page) => page.evaluate(() => {
  const lin = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const lum = (c) => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
  const T = lum(getComputedStyle(document.querySelector('.article-intro .title')).color.match(/[\d.]+/g).map(Number));
  const cv = document.querySelector('.plate canvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  let worst = 99;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 255) continue;
    const L = lum([d[i], d[i + 1], d[i + 2]]);
    worst = Math.min(worst, (Math.max(T, L) + .05) / (Math.min(T, L) + .05));
  }
  return +worst.toFixed(2);
});
// a digest of the plate's canvas pixels, to compare two pages
const plateDigest = (page) => page.evaluate(async () => {
  const cv = document.querySelector('.plate canvas'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', d))].slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join('');
});

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
  for (const [theme, w, h] of [['light', 1440, 900], ['light', 390, 844], ['dark', 1440, 900], ['dark', 390, 844]]) {
    const errors = [], c = await context(browser, w, h, { dark: theme === 'dark' }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.cover, theme === 'dark' ? DARK : '')); await ready(p);
    const t = w + (theme === 'dark' ? ' dark' : '');   // the row tag
    const g = await geo(p);
    const top = await paperOnly(p);
    rows.push([t + ' scroll 0: depth 0 and paper only', top.ok && +top.depth === 0, top]);
    await scroll(p, 1, 200);
    const one = await p.evaluate(() => +document.querySelector('.plate').dataset.depth);
    rows.push([t + ' 1px of scroll: depth > 0', one > 0, one]);
    await scroll(p, 180, 250);
    const mid = await paperOnly(p);
    const h1 = await p.evaluate(() => { const t = document.querySelector('.article-intro .title'), cs = getComputedStyle(t); return { vis: cs.visibility, op: cs.opacity, flying: getComputedStyle(document.querySelector('.fly')).visibility }; });
    rows.push([t + ' mid-flight: the h1 is only transparent, still in the accessibility tree', h1.flying === 'visible' && h1.vis === 'visible' && h1.op === '0', h1]);
    rows.push([t + ' 180px: the halftone prints (dots present)', !mid.ok && mid.bad > 200, { bad: mid.bad, depth: mid.depth }]);
    if (theme === 'dark') {   // the light title over the light dots: large text, 3:1 (light paper holds its dark dots back to ~2.3:1)
      const cr = [];
      for (const y of [60, 180, 300]) { await scroll(p, y, 250); cr.push(await titleOverDots(p)); }
      rows.push([t + ' the title reads over every dot (contrast >= 3 at 60, 180, 300px)', cr.every((x) => x >= 3), cr.join(' ')]);
    }
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await sleep(1200);
    const back = await paperOnly(p);
    rows.push([t + ' back at 0: clean again', back.ok && +back.depth === 0, back]);
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
    rows.push([t + ' nav opaque at every scroll position', navOk, seen.join(' ')]);
    rows.push([t + ' nav .landed exactly from sL', landOk, 'sL=' + Math.round(g.sL)]);
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
    rows.push([t + ' language and theme toggles remove no hero nodes', removed === 0, removed]);
    const after = await paperOnly(p);
    rows.push([t + ' after toggles at 0: still clean', after.ok, after]);
    rows.push([t + ' no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  // on both papers every text over the plate reads, at rest and in flight: on the lightest cover (POSTS.cover), on
  // one with a subtitle (POSTS.multi) and on the darkest (POSTS.darkest), the light paper's worst case
  for (const dark of [false, true]) for (const post of [POSTS.cover, POSTS.multi, POSTS.darkest]) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const errors = [], c = await context(browser, w, h, { dark, dpr: 2 }), p = await c.newPage(); watch(p, errors);
      await p.goto(url(post, dark ? DARK : '')); await ready(p);
      const worst = {};
      for (const y of [0, 90, 180, 300]) {
        await scroll(p, y, 300);
        for (const m of await textContrast(p)) if (!worst[m.kind] || m.ratio < worst[m.kind].ratio) worst[m.kind] = m;
      }
      const bad = Object.values(worst).filter((m) => m.ratio < m.min);
      rows.push([w + (dark ? ' dark ' : ' light ') + post.slice(0, 10) + ': every text over the plate reads (large 3:1, labels 4.5:1) at 0, 90, 180 and 300px', bad.length === 0 && 'title' in worst,
        Object.values(worst).map((m) => m.kind + ' ' + m.ratio).join(', ')]);
      rows.push([w + (dark ? ' dark ' : ' light ') + post.slice(0, 10) + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
      await c.close();
    }
  }
  // the dark ceiling: the lightest cover's plate, as shown, stays dark (its 97th-percentile brightness, 0-255; uncapped it is 115)
  {
    const c = await context(browser, 1440, 900, { dark: true }), p = await c.newPage();
    await p.goto(url(POSTS.cover, DARK)); await ready(p); await sleep(1200);
    const b = (await p.screenshot({ clip: { x: 0, y: 120, width: 1440, height: 400 } })).toString('base64');
    const q = await p.evaluate(async (b64) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
      const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height).data, L = [];
      for (let i = 0; i < d.length; i += 4) L.push((d[i] + d[i + 1] + d[i + 2]) / 3);
      return L.sort((x, y) => x - y)[Math.floor(L.length * .97)];
    }, b);
    rows.push(['dark: the lightest cover shows as dark paper (plate p97 brightness <= 76)', q <= 76, Math.round(q)]);
    await c.close();
  }
  // a theme toggled mid-scroll re-screens the cover in place: the plate is pixel for pixel what a fresh load in that
  // theme paints at that scroll. Every digest is its page's first canvas readback: Chrome changes how it rasterises a
  // canvas after a few readbacks, which moves its anti-aliasing by a level or two.
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const errors = [];
    const at180 = async (dark, toggles) => {
      const c = await context(browser, w, h, { dark }), p = await c.newPage(); watch(p, errors);
      await p.goto(url(POSTS.multi, dark ? DARK : '')); await ready(p);
      await scroll(p, 180, 300);
      for (let i = 0; i < toggles; i++) { await p.click('[data-act="theme"]'); await sleep(350); }
      const r = { digest: await plateDigest(p), dots: !(await paperOnly(p)).ok };
      await c.close();
      return r;
    };
    const light = await at180(false, 0), dark = await at180(true, 0), once = await at180(false, 1), twice = await at180(false, 2);
    rows.push([w + ' theme toggled at 180px: the plate equals a fresh dark load, still printing', once.digest === dark.digest && once.digest !== light.digest && once.dots, { light: light.digest, dark: dark.digest, once: once.digest }]);
    rows.push([w + ' toggled back: the plate equals a fresh light load', twice.digest === light.digest && twice.dots, { light: light.digest, twice: twice.digest }]);
    rows.push([w + ' mid-scroll toggles: no console errors', errors.length === 0, errors.slice(0, 3)]);
  }
  // the srcset swaps files on a resize (390 → 1440: the 560w cover for the 1600w): the layout that runs before the new
  // file arrives has nothing to screen and prints no dots; the file's load screens it, so the plate ends exactly as a
  // fresh load at 1440 paints it (each digest its page's first readback)
  {
    const errors = [], c = await context(browser, 390, 844, { dark: true }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(POSTS.multi, DARK)); await ready(p);
    const small = await p.evaluate(() => document.querySelector('.plate-img').currentSrc.replace(/^.*-/, ''));
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForFunction(() => { const i = document.querySelector('.plate-img'); return /-1600\.jpg$/.test(i.currentSrc) && i.complete && i.naturalWidth; }, null, { timeout: 15000 });
    await sleep(400);
    await scroll(p, 180, 300);
    const swapped = await plateDigest(p), dots = !(await paperOnly(p)).ok;
    const c2 = await context(browser, 1440, 900, { dark: true }), p2 = await c2.newPage(); watch(p2, errors);
    await p2.goto(url(POSTS.multi, DARK)); await ready(p2);
    await scroll(p2, 180, 300);
    const fresh = await plateDigest(p2);
    rows.push(['srcset swap 390 → 1440 (' + small + ' → 1600.jpg): the plate equals a fresh 1440 load, printing', swapped === fresh && dots, { swapped, fresh }]);
    rows.push(['srcset swap: no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close(); await c2.close();
  }
  // a cover that fails to load: the paper still rises over the empty plate, and prints no dots (nothing to screen).
  // reading-lib's ready() waits on the cover's load or error, which may have fired already, so this waits on its own.
  for (const dark of [false, true]) {
    const errors = [], c = await context(browser, 1440, 900, { dark }), p = await c.newPage(); watch(p, errors);
    await c.route('**/images/derived/covers/**', (r) => r.fulfill({ status: 404, body: '' }));
    await p.goto(url(POSTS.multi, dark ? DARK : ''));
    await p.waitForSelector('[data-mount="reading"][data-ready]', { timeout: 20000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForFunction(() => document.querySelector('.plate-img').complete, null, { timeout: 15000 });
    await sleep(400);
    await scroll(p, 180, 300);
    const s = await paperOnly(p);
    const only404 = errors.length > 0 && errors.every((e) => /404/.test(e));
    rows.push(['failed cover' + (dark ? ' dark' : '') + ': the paper rises (depth > 0) and prints no dots', s.ok && +s.depth > 0, s]);
    rows.push(['failed cover' + (dark ? ' dark' : '') + ': only the cover 404s', only404, errors.slice(0, 2)]);
    await c.close();
  }
  // reduced motion never prints dots, anywhere in the hero, on either paper
  for (const mode of ['reduced', 'reduced dark']) {
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      const dark = mode === 'reduced dark';
      const errors = [], c = await context(browser, w, h, { reduced: true, dark }), p = await c.newPage(); watch(p, errors);
      await p.goto(url(POSTS.cover, dark ? DARK : '')); await ready(p);
      const g = await geo(p);
      let ok = true; const r = [];
      for (const y of [0, 1, 60, 180, Math.round(g.sL / 2), Math.round(g.sL) - 10]) { await scroll(p, y, 250); const s = await paperOnly(p); if (!s.ok) ok = false; r.push(y + ':' + s.bad + (s.bad ? '/' + s.worst : '') + '@' + s.depth); }
      rows.push([w + ' ' + mode + ': never any dots', ok, r.join(' ')]);
      rows.push([w + ' ' + mode + ': no console errors', errors.length === 0, errors.slice(0, 3)]);
      await c.close();
    }
  }
  // a first visit on a slow link (Fast 4G, 165 ms RTT): React can render the skeleton long before the essay data
  // arrives, and the page must still end up whole, with no layout shift from the late fill
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const errors = [], c = await context(browser, w, h), p = await c.newPage(), cdp = await c.newCDPSession(p); watch(p, errors);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(url(POSTS.multi), { waitUntil: 'load', timeout: 60000 }); await ready(p); await sleep(800);
    const r = await p.evaluate(() => ({ title: document.querySelector('.article-intro .title').textContent.trim(), pn: document.querySelectorAll('.pn a').length, cls: +window.__cls.toFixed(3) }));
    rows.push([w + ' slow first visit: title and neighbours filled', r.title.length > 0 && r.pn === 2, r]);
    rows.push([w + ' slow first visit: no layout shift (CLS < 0.02)', r.cls < .02, r.cls]);
    rows.push([w + ' slow first visit: no console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  // ?post= resolution: missing or malformed → the newest essay with no extra error; a well-formed id the site does not
  // have → one 404 for its body file, then the newest essay
  for (const [q, want404] of [['', false], ['?post=../../etc', false], ['?post=2020-01-01_no-such-essay', true]]) {
    const errors = [], c = await context(browser, 1440, 900), p = await c.newPage(); watch(p, errors);
    await p.goto(BASE_URL + q); await ready(p);
    const r = await p.evaluate(() => ({ title: document.querySelector('.article-intro .title .zh').textContent, cover: !!document.querySelector('.plate'), newest: window.FY_POST_INDEX[0].titleZh, marks: document.querySelectorAll('.rail-tick').length }));
    const ok404 = want404 ? errors.length > 0 && errors.every((e) => /404/.test(e)) : errors.length === 0;   // the missing body's 404, nothing else
    rows.push(['post ' + JSON.stringify(q) + ': the newest essay, whole', r.title === r.newest && r.cover && r.marks > 0 && ok404, { r, errors }]);
    await c.close();
  }
  report(ctx.log, rows);
};
