// project-rail.mjs — Reading's pencil margin on the long chapters (Principles, Components), and every section link on
// every chapter opened fresh (design/2026-09-building, PORT-PLAN §7, PR 2, R9).
//   node /tmp/fyshot/run.mjs scripts/verify/project-rail.mjs
//   env: BASE (default http://127.0.0.1:4173/) · RAIL_W (1440,390) · FRAG=0 skips the fresh section links
// The rail (reading-rail.mjs's criteria), at 1440 in the margin and at 390 on the strip:
//   · every landmark (section.fa-pr[id]) has a tick on the rail and on the strip, and a label linking to it;
//   · End reaches the last landmark and the end tick; overscroll past either end (a rubber band) un-draws nothing;
//   · the current landmark carries the pen's loop in the chosen wheat, not coral;
//   · 1440: a label moves the focus to its landmark; 390: the counter reads "k / N" at every point, on its own line
//     under the chapter tabs, inside the window, with the strip's ink on the line between them.
// Fresh section links: on a cold cache (a new context per link) and vt-lcp's Fast 4G, every section, article and
// heading id on every chapter, Demos' #trash-patrol and #unattended-recovery among them, lands between the bottom of
// whatever sticks at the top (the strip on phones, nothing on desktop) and 40 px below it, or, near the page's end,
// with the page scrolled to its end. 0 console or page errors throughout. Exit code 1 on any failure.
const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const DIR = 'building/fred-agent/';
const RAIL = ['principles', 'components'], ALL = ['index', 'system', 'principles', 'components', 'demos'];
const WIDTHS = (process.env.RAIL_W || '1440,390').split(',').map(Number);
const res = [];
const check = (name, ok, detail) => { res.push({ name, ok: !!ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function context(browser, w, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
  if (opts.throttle) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
  }
  return { ctx, page, errors };
}
const state = (page) => page.evaluate(() => {
  const r = document.querySelector('.rail'), html = document.documentElement;
  return { cur: +r.dataset.cur, done: r.dataset.done === 'true', mode: html.classList.contains('strip-mode') ? 'strip' : 'rail', count: (document.querySelector('.rc-no') || {}).textContent + (document.querySelector('.rc-of') || {}).textContent };
});
const scroll = async (page, y, ms = 1000) => { await page.evaluate((y) => scrollTo(0, y), y); await sleep(ms); };
// a rubber band: the browser reports a scroll past the end (Safari does), and the page must read it as the end
const band = (page, over) => page.evaluate((over) => {
  const max = document.documentElement.scrollHeight - innerHeight, v = over > 0 ? max + over : over;
  const own = Object.getOwnPropertyDescriptor(window, 'scrollY');
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => v });
  window.dispatchEvent(new Event('scroll'));
  const restore = () => { if (own) Object.defineProperty(window, 'scrollY', own); else delete window.scrollY; };
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => { restore(); r(); })));
}, over);

async function rail(browser, w, name) {
  const tag = w + ' ' + name, { ctx, page, errors } = await context(browser, w);
  await page.goto(BASE + DIR + name + '.html', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready); await sleep(1500);
  const lm = await page.evaluate(() => ({
    ids: [...document.querySelectorAll('.fa-prose .fa-pr[id]')].map((e) => e.id),
    ticks: document.querySelectorAll('.rail-tick').length, strip: document.querySelectorAll('.strip-tick').length,
    labels: [...document.querySelectorAll('.rail-lab')].map((a) => a.getAttribute('href').slice(1))
  }));
  check(tag + ': every landmark has a tick on the rail and the strip, and a label linking to it', lm.ids.length === (name === 'principles' ? 11 : 5) && lm.ticks === lm.ids.length && lm.strip === lm.ids.length && lm.labels.join() === lm.ids.join(), { landmarks: lm.ids.length, ticks: lm.ticks, strip: lm.strip, labels: lm.labels.length });
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const top0 = await state(page);
  check(tag + ': mode', top0.mode === (w > 1000 ? 'rail' : 'strip'), top0.mode);
  if (top0.mode === 'strip') {
    const seen = [];
    for (let i = 0; i <= 10; i++) { await scroll(page, Math.round(max * i / 10), 250); seen.push((await state(page)).count); }
    check(tag + ': the phone counter always reads "k / N"', seen.every((t) => /^\S+ \/ \d+$/.test(t)), [...new Set(seen)].join(' | '));
    await scroll(page, Math.round(max * 0.4), 800);
    const g = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('.pj-tabs .dos-tab')].map((t) => t.getBoundingClientRect()), c = document.querySelector('.rail-count').getBoundingClientRect();
      const ink = document.querySelector('.strip-ink').getBoundingClientRect(), line = document.querySelector('.pj-count').getBoundingClientRect();
      return { tabsBottom: Math.max(...tabs.map((t) => t.bottom)), count: [c.left, c.top, c.right, c.bottom], ink: [ink.left, ink.top, ink.bottom], line: line.top, vw: innerWidth, stuck: document.querySelector('.pj-tabs').getBoundingClientRect().top };
    });
    check(tag + ': the counter on its own line under the tabs, inside the window, the ink on the line between them', g.stuck === 0 && g.count[1] >= g.tabsBottom - 0.5 && g.count[2] <= g.vw && g.count[0] >= 0 && g.ink[1] <= g.line + 1 && g.ink[2] >= g.line - 1, g);
  }
  await scroll(page, max, 1200);
  const end = await state(page);
  check(tag + ': End reaches the last landmark and the end tick', end.cur === lm.ids.length - 1 && end.done, end);
  await band(page, 90); await sleep(300);
  const over = await state(page);
  check(tag + ': overscroll past the end un-draws nothing', over.cur === end.cur && over.done, over);
  await scroll(page, Math.round(max / 2), 1200);
  const loop = await page.evaluate(() => {
    const host = document.documentElement.classList.contains('strip-mode') ? document.querySelector('.rc-no') : document.querySelector('.rail-lab.cur .rail-lab-t');
    const path = host && host.querySelector('svg path'), probe = document.createElement('i');
    probe.style.color = 'var(--hl-ink)'; document.body.appendChild(probe); const wheat = getComputedStyle(probe).color; probe.remove();
    return { drawn: !!path && getComputedStyle(path).strokeDashoffset !== '', wheat: !!path && getComputedStyle(path).stroke === wheat };
  });
  check(tag + ': the current landmark carries the wheat loop', loop.drawn && loop.wheat, loop);
  if (top0.mode === 'rail') {
    await page.evaluate(() => document.querySelectorAll('.rail-lab')[2].click()); await sleep(1400);
    const f = await page.evaluate(() => ({ id: document.activeElement.id, want: document.querySelectorAll('.rail-lab')[2].getAttribute('href').slice(1), top: Math.round(document.activeElement.getBoundingClientRect().top) }));
    check(tag + ': a rail label moves the focus to its landmark, 28 px under the top', f.id === f.want && Math.abs(f.top - 28) <= 2, f);
  }
  await scroll(page, 0, 900); await band(page, -80); await sleep(300);
  const top = await state(page);
  check(tag + ': a rubber band at the top reads as the top', !top.done && top.cur <= 0, top);
  await page.screenshot({ path: '/tmp/building-2/suite/rail-' + name + '-' + w + '.png' });
  check(tag + ': 0 console or page errors', errors.length === 0, errors.slice(0, 3));
  await ctx.close();
}

async function fragments(browser, w) {
  const bad = [], errs = [];
  let n = 0;
  for (const name of ALL) {
    const probe = await context(browser, w);
    await probe.page.goto(BASE + DIR + name + '.html', { waitUntil: 'load' });
    const ids = await probe.page.evaluate(() => [...document.querySelectorAll('.pj-sheet :is(section, article, h1, h2)[id]')].map((e) => e.id));
    await probe.ctx.close();
    for (const id of ids) {
      const { ctx, page, errors } = await context(browser, w, { throttle: true });
      await page.goto(BASE + DIR + name + '.html#' + id, { waitUntil: 'load', timeout: 60000 });
      await sleep(2500);   // fonts and the images above the section come in; nothing above it may move it
      const at = await page.evaluate((id) => {
        const t = document.getElementById(id).getBoundingClientRect(), tabs = document.querySelector('.pj-tabs'), strip = getComputedStyle(tabs).flexDirection === 'row';
        const edge = strip ? tabs.getBoundingClientRect().bottom : 0, max = document.documentElement.scrollHeight - innerHeight;
        return { d: Math.round(t.top - edge), atEnd: scrollY >= max - 1 && t.top >= edge, y: Math.round(scrollY) };
      }, id);
      n++;
      if (!(at.d >= 0 && at.d <= 40) && !at.atEnd) bad.push(name + '#' + id + ' ' + JSON.stringify(at));
      errs.push(...errors);
      await ctx.close();
    }
  }
  check(w + ': every section link opened fresh lands under the strip, within 40 px (' + n + ' links)', bad.length === 0 && n > 40, bad.slice(0, 6));
  check(w + ': fresh section links: 0 console or page errors', errs.length === 0, errs.slice(0, 3));
}

export default async (page) => {
  const browser = page.context().browser();
  for (const w of WIDTHS) {
    for (const name of RAIL) await rail(browser, w, name);
    if (process.env.FRAG !== '0') await fragments(browser, w);
  }
  const failed = res.filter((r) => !r.ok);
  console.log(failed.length ? `\n${failed.length} FAILED of ${res.length}` : `\nALL PASSED (${res.length})`);
  if (failed.length) process.exitCode = 1;
};
