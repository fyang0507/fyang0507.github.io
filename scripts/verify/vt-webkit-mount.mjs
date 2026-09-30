// vt-webkit-mount.mjs — WebKit (Playwright's WebKit build, the Safari engine): every page module mounts on a styled page.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-webkit-mount.mjs      env: VT_ORIGIN
// WebKit runs deferred scripts without waiting for the head's stylesheets, and may hold back even the loaded ones until
// the last is in, so FY.mount and FY.styled (site.js) must hold each mount until every stylesheet is in. Each page is
// loaded cold twice at 1440 and 390: once with every stylesheet held back until the page's script is in (React, which
// renders the template; on Building, which has none, board.js, which builds the board), once with that script held
// back until the sheets are in. Per page and width: every FY.mount and FY.styled callback runs with every link sheet
// applied; both loads lay out every box under the mount host (Building's .board-host) within 24 px of each other;
// Building has every card by pagereveal, where a view transition captures the page; 0 console or page errors.
import { ORIGIN, webkit, check } from './vt-lib.mjs';

// [name, path, ready, script]: script is what races the stylesheets, React unless given
const PAGES = [
  ['Writing', 'Writing.dc.html', '[data-mount=writing][data-ready]'],
  ['Building', 'Building.dc.html', '.board-host .cork-track[style]', '**/lib/building/board.js'],
  ['Gallery', 'Gallery.dc.html', '[data-mount=gallery][data-filtered]'],
  ['About', 'About.dc.html', '[data-mount="about"] [data-ready]'],
  ['Reading', 'Reading.dc.html?post=2026-08-29_google-just-wants-to-coast-to-a-win', '[data-mount="reading"][data-ready]']
];
const SHEETS = '**/*.css', REACT = 'https://unpkg.com/react-dom@**', TOL = 24;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Before any page script: Math.random pinned, so Gallery shuffles its prints the same way in both loads (React draws
// from it too as it loads, which would shift a seeded sequence), FY.mount and FY.styled wrapped so that each callback
// records the link sheets not yet applied (not loaded, or not in document.styleSheets) when it runs, and the cards on
// the board at pagereveal.
function probe() {
  Math.random = () => 0.5;
  const rec = window.__mounts = [], FY = window.FY = {};
  addEventListener('pagereveal', () => { window.__reveal = { slots: document.querySelectorAll('.board-host .slot').length, projects: (window.BUILDING_PROJECTS || []).length }; });
  [['mount', 1], ['styled', 0]].forEach(([name, at]) => {   // where each takes its callback
    let real = null;
    Object.defineProperty(FY, name, {
      configurable: true,
      set(v) { real = v; },
      get() {
        return real && function (...a) {
          const fn = a[at], sel = at ? a[0] : 'FY.styled';
          a[at] = function () {
            const all = [...document.styleSheets];
            rec.push({ sel, off: [...document.querySelectorAll('link[rel=stylesheet]')].filter((l) => !l.sheet || !all.includes(l.sheet)).map((l) => l.href.replace(/\?.*$/, '').split('/').pop()) });
            return fn.apply(this, arguments);
          };
          return real.apply(this, a);
        };
      }
    });
  });
}
// Every box under the mount hosts, in page px, keyed by its tag.class path
function boxes() {
  scrollTo(0, 0);
  const out = {}, seen = {}, name = (e) => e.tagName.toLowerCase() + (e.classList.length ? '.' + e.classList[0] : '');
  document.querySelectorAll('[data-mount], .board-host').forEach((host) => [host, ...host.querySelectorAll('*')].forEach((el) => {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    let k = '';
    for (let e = el; e && e !== document.body; e = e.parentElement) k = name(e) + (k ? '>' + k : '');
    seen[k] = (seen[k] || 0) + 1;
    out[seen[k] > 1 ? k + '#' + seen[k] : k] = [r.left + scrollX, r.top + scrollY, r.width, r.height].map(Math.round);
  }));
  return out;
}
// first: 'script' (it runs while every stylesheet is still loading) or 'sheets' (they are all in first)
async function load(browser, [, path, sel, script = REACT], w, first, errs) {
  const c = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, hasTouch: w < 700, isMobile: w < 700 });
  await c.addInitScript(probe);
  let open;
  const gate = new Promise((r) => { open = r; });
  const pass = async (route) => { const res = await route.fetch(); await route.fulfill({ response: res }); open(); };
  const hold = async (route) => { const res = await route.fetch(); await gate; await sleep(600); await route.fulfill({ response: res }); };
  if (first === 'script') { await c.route(script, pass); await c.route(SHEETS, hold); }
  else await c.route(script, hold);
  const p = await c.newPage();
  // The second load's sheets can come from WebKit's memory cache, which no route sees, so a finished sheet opens the gate.
  if (first === 'sheets') p.on('requestfinished', (r) => { if (r.resourceType() === 'stylesheet') open(); });
  p.on('pageerror', (e) => errs.push(path + ' ' + w + ' pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(path + ' ' + w + ' ' + m.text()); });
  await p.goto(ORIGIN + '/' + path, { waitUntil: 'load' });
  await p.waitForSelector(sel, { timeout: 20000 });
  await p.evaluate(() => document.fonts.ready);
  await sleep(1500);
  const out = { mounts: await p.evaluate(() => window.__mounts), boxes: await p.evaluate(boxes), reveal: await p.evaluate(() => window.__reveal) };
  await c.close();
  return out;
}
function apart(a, b) {
  const far = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = a[k] && b[k] ? Math.max(...a[k].map((v, i) => Math.abs(v - b[k][i]))) : Infinity;
    if (d > TOL) far.push([d, k.split('>').slice(-2).join('>') + ' ' + (a[k] || '-') + ' vs ' + (b[k] || '-')]);
  }
  return far.sort((x, y) => y[0] - x[0]);
}

export default async (_page, ctx) => {
  const res = [], errs = [], browser = await webkit();
  ctx.log('WebKit ' + browser.version() + ' · ' + ORIGIN);
  for (const pg of PAGES) {
    for (const w of [1440, 390]) {
      const early = await load(browser, pg, w, 'script', errs), ref = await load(browser, pg, w, 'sheets', errs), js = pg[3] ? pg[3].split('/').pop() : 'React';
      const off = early.mounts.filter((m) => m.off.length);
      check(res, `webkit ${pg[0]} ${w}: every mount on a styled page`, early.mounts.length && !off.length,
        off.length ? off.map((m) => m.sel + ' before ' + m.off.join(', ')).join(' · ') : early.mounts.length + ' mount(s)');
      const far = apart(early.boxes, ref.boxes);
      check(res, `webkit ${pg[0]} ${w}: lays out the same whether ${js} or the sheets come first`, Object.keys(ref.boxes).length && !far.length,
        far.length ? far.length + '/' + Object.keys(ref.boxes).length + ' boxes > ' + TOL + ' px apart: ' + far.slice(0, 3).map((f) => f[1]).join(' · ') : Object.keys(ref.boxes).length + ' boxes');
      if (pg[0] === 'Building') {
        const r = [early.reveal, ref.reveal];
        check(res, `webkit Building ${w}: every card on the board at pagereveal, whether ${js} or the sheets come first`, r.every((x) => x && x.projects && x.slots === x.projects),
          r.map((x) => x ? x.slots + '/' + x.projects + ' slots' : 'no pagereveal').join(' · '));
      }
    }
  }
  await browser.close();
  check(res, 'webkit · no console or page errors', errs.length === 0, errs.slice(0, 8));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-webkit-mount: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
