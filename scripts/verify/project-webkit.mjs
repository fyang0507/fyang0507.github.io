// project-webkit.mjs — WebKit pass (Playwright's WebKit build, the Safari engine) on Fred Agent's chapters
// (design/2026-09-building, PORT-PLAN §7, PR 2): the pages that measure (the rail, the map, the card) mount on a styled
// page, the chapter tabs stick (down the fore-edge at 1440, a strip at the top at 390), the rail stands in the margin
// or on the strip with its counter, the board's card is clipped on, a section link opened fresh lands under the strip,
// and nothing widens the page; 0 console or page errors.
//   node /tmp/fyshot/run.mjs scripts/verify/project-webkit.mjs      env: BASE (default http://127.0.0.1:4173/)
import { webkit, check } from './vt-lib.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:4173/', DIR = BASE + 'building/fred-agent/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async () => {
  const wk = await webkit(), res = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await wk.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage(), errors = [];
    p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
    for (const name of ['index', 'system', 'principles', 'components', 'demos']) {
      const tag = 'webkit ' + w + ' ' + name;
      await p.goto(DIR + name + '.html', { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready); await sleep(1500);
      await p.evaluate(() => scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.5))); await sleep(900);
      const s = await p.evaluate(() => {
        const tabs = document.querySelector('.pj-tabs'), r = tabs.getBoundingClientRect(), cur = tabs.querySelector('[aria-current="page"]');
        const rail = document.querySelector('.rail'), html = document.documentElement;
        return {
          strip: getComputedStyle(tabs).flexDirection === 'row', top: Math.round(r.top), banded: cur.getAttribute('data-pen-tier') === '2',
          card: !!document.querySelector('.pj-cover .slot--lead .stk'), overflow: html.scrollWidth - innerWidth,
          rail: rail ? { mode: html.classList.contains('strip-mode') ? 'strip' : 'rail', on: rail.classList.contains('on'), labels: rail.querySelectorAll('.rail-lab').length, count: (document.querySelector('.rc-no') || {}).textContent + (document.querySelector('.rc-of') || {}).textContent } : null,
          map: !!document.querySelector('.map-lines path')
        };
      });
      check(res, tag + ': the tabs stick ' + (w > 1000 ? 'down the fore-edge' : 'at the top'), s.strip === (w <= 1000) && s.top === (w > 1000 ? 26 : 0) && s.banded, s);
      check(res, tag + ': the board\'s card is clipped on, nothing widens the page', s.card && s.overflow <= 0, { card: s.card, overflow: s.overflow });
      if (s.rail) check(res, tag + ': the rail ' + (w > 1000 ? 'in the margin' : 'on the strip, with its counter'), s.rail.mode === (w > 1000 ? 'rail' : 'strip') && s.rail.on && (w > 1000 ? s.rail.labels === (name === 'principles' ? 11 : 5) : /^\S+ \/ \d+$/.test(s.rail.count)), s.rail);
      if (name === 'system') check(res, tag + ': the map lays out its links', s.map, s.map);
    }
    for (const [name, id] of [['principles', 'capture'], ['demos', 'unattended-recovery']]) {
      const c2 = await wk.newContext({ viewport: { width: w, height: h } }), q = await c2.newPage();
      await q.goto(DIR + name + '.html#' + id, { waitUntil: 'load' }); await sleep(2000);
      const d = await q.evaluate((id) => { const tabs = document.querySelector('.pj-tabs'), edge = getComputedStyle(tabs).flexDirection === 'row' ? tabs.getBoundingClientRect().bottom : 0; return Math.round(document.getElementById(id).getBoundingClientRect().top - edge); }, id);
      check(res, 'webkit ' + w + ' ' + name + '#' + id + ' opened fresh lands under the strip, within 40 px', d >= 0 && d <= 40, d);
      await c2.close();
    }
    check(res, 'webkit ' + w + ': 0 console or page errors', errors.length === 0, errors.slice(0, 3));
    await ctx.close();
  }
  await wk.close();
  const failed = res.filter((r) => !r.ok);
  console.log(`project-webkit: ${res.length - failed.length}/${res.length} pass`);
  if (failed.length) process.exitCode = 1;
};
