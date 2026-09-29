// vt-nav.mjs — the static nav (site-nav.css) on every page that loads it, at 1440, 390 and 320.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-nav.mjs      env: VT_ORIGIN (after, :4173) · VT_BEFORE (:4174)
// Checks: labels ≥ 10px (10.5 on desktop; 9.5 in a header under 280 px, the plan's phone floor), opacity 1, ≥ 4.5:1 on paper, no overflow, ≥ 1px between labels; identity tag
// and title number ≥ 10.5px; the rule is a real .site-rule and no .site-index::after draws; the current tab is the
// tabmark (pen-inked where transitions.js runs), with no CSS border or dot on the tab itself; the rule's gap under
// the current tab matches the before site (origin/main) ±1px, measured in pixels; no horizontal overflow; no
// console errors (the fred-agent font 404 is pre-existing on main and reported apart).
import { ORIGIN, check } from './vt-lib.mjs';

const BEFORE = process.env.VT_BEFORE || 'http://127.0.0.1:4174';
const GATEWAY = ['Writing.dc.html', 'Building.dc.html', 'Gallery.dc.html', 'About.dc.html', 'Reading.dc.html?post=2025-12-06_the-stories-we-live-05'];
const SUBSITES = ['building/njjoe/index.html', 'building/njjoe/microsite.html', 'building/njjoe/apa.html',
  'building/fred-agent/index.html', 'building/fred-agent/system.html', 'building/fred-agent/principles.html',
  'building/fred-agent/components.html', 'building/fred-agent/demos.html'];
// pre-existing on main: assets/fred-agent/fred-agent.css points at ./fonts/*.woff2, which were never shipped
const KNOWN = /assets\/fred-agent\/fonts\/|building\/fred-agent\/\S+ Failed to load resource: the server responded with a status of 404/;

function lum(c) { const v = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
function contrast(a, b) { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

async function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s), cs = (e, p) => getComputedStyle(e, p || null), r = (e) => e.getBoundingClientRect();
    const labels = [...document.querySelectorAll('.site-index .site-nav-label')].map((l) => {
      const t = l.querySelector('.en') || l, rg = document.createRange(); rg.selectNodeContents(t);
      const b = rg.getBoundingClientRect();
      return { text: t.textContent.trim(), size: parseFloat(cs(l).fontSize), op: +cs(l).opacity, color: cs(l).color, fits: l.scrollWidth <= l.clientWidth + 0.5, x0: b.left, x1: b.right };
    });
    const tab = q('.site-tab[aria-current="page"]'), tm = q('.site-tabmark'), rule = q('.site-rule'), idx = q('.site-index');
    return {
      paper: cs(document.body).backgroundColor, labels,
      tag: q('.site-identity-tag') && parseFloat(cs(q('.site-identity-tag')).fontSize),
      num: q('.subpage-title-number') && parseFloat(cs(q('.subpage-title-number')).fontSize),
      after: idx ? cs(idx, '::after').content : 'none', dot: tab ? cs(tab, '::before').content : 'none',
      tabBorder: tab ? parseFloat(cs(tab).borderTopWidth) : 0,
      rule: rule && { h: r(rule).height, bg: cs(rule).backgroundColor, y: r(rule).top },
      tab: tab && [r(tab).left, r(tab).right], tm: tm && { inked: tm.classList.contains('is-inked'), path: !!tm.querySelector('svg path'), box: [r(tm).left, r(tm).right] },
      hw: q('.site-shell-header') ? r(q('.site-shell-header')).width : innerWidth,
      names: [...document.querySelectorAll('.site-identity, .site-index a')].map((a) => (a.getAttribute('aria-label') || a.textContent).replace(/\s+/g, ' ').trim()),
      cjkLabel: [...document.querySelectorAll('.site-identity[aria-label], .site-index a[aria-label]')].some((a) => /[\u3000-\u9fff]/.test(a.getAttribute('aria-label'))),
      overflow: document.documentElement.scrollWidth - innerWidth
    };
  });
}
// the rule's gap under the current tab, in pixels: the longest paper run on the rule's middle row near the tab,
// as offsets from the tab's own left and right edges (so a header that moved on the page still compares)
async function gap(page) {
  const g = await page.evaluate(() => {
    const idx = document.querySelector('.site-index'), tab = document.querySelector('.site-tab[aria-current="page"]');
    if (!idx || !tab) return null;
    const n = idx.getBoundingClientRect(), t = tab.getBoundingClientRect();
    return { y: n.bottom - 0.75, x0: t.left - 12, x1: t.right + 12 };
  });
  if (!g) return null;
  const clip = { x: Math.floor(g.x0), y: Math.floor(g.y), width: Math.ceil(g.x1 - g.x0), height: 1 };
  const png = (await page.screenshot({ clip })).toString('base64');
  return page.evaluate(async ([png, x0]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = 1;
    const k = c.getContext('2d'); k.drawImage(img, 0, 0); const d = k.getImageData(0, 0, img.width, 1).data;
    let best = [0, 0], s = -1;
    for (let i = 0; i <= img.width; i++) {
      const light = i < img.width && d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2] > 3 * 200;
      if (light && s < 0) s = i;
      if (!light && s >= 0) { if (i - s > best[1] - best[0]) best = [s, i]; s = -1; }
    }
    return [x0 + best[0], x0 + best[1]];
  }, [png, clip.x]).then((r) => [+(r[0] - g.x0 - 12).toFixed(1), +(r[1] - g.x1 + 12).toFixed(1)]);
}

export default async (page, ctx) => {
  const res = [], errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(page.url() + ' ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  const before = await page.context().browser().newPage();
  for (const w of [1440, 390, 320]) {
    await page.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    await before.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    for (const p of [...GATEWAY, ...SUBSITES]) {
      await page.goto(ORIGIN + '/' + p, { waitUntil: 'load' });
      await page.waitForSelector('.site-index', { timeout: 8000 }).catch(() => {});
      await page.evaluate(() => document.fonts && document.fonts.ready); await page.waitForTimeout(500);
      const s = await state(page), tag = w + ' ' + p, gw = GATEWAY.includes(p);
      if (!s.labels.length) { check(res, tag + ' nav renders', false); continue; }
      const min = Math.min(...s.labels.map((l) => l.size)), lo = Math.min(...s.labels.map((l) => contrast(l.color, s.paper)));
      const overlap = s.labels.slice(1).some((l, i) => l.x0 < s.labels[i].x1 + 1);   // ≥ 1 px of air between labels
      check(res, tag + ' labels legible', min >= (w > 640 ? 10.5 : s.hw < 280 ? 9.5 : 10) && s.labels.every((l) => l.op === 1) && lo >= 4.5 && s.labels.every((l) => l.fits) && !overlap,
        { minPx: min, contrast: +lo.toFixed(2), overlap });
      check(res, tag + ' identity tag / title number ≥ 10.5px', (s.tag == null ? /Reading/.test(p) : s.tag >= 10.5) && (s.num == null || s.num >= 10.5), { tag: s.tag, num: s.num });
      check(res, tag + ' real .site-rule, no ::after', s.rule && Math.abs(s.rule.h - 1.5) < 0.01 && (s.after === 'none' || s.after === 'normal'), s.rule);
      check(res, tag + ' current tab = tabmark, no CSS border or dot', s.tm && s.tabBorder === 0 && (s.dot === 'none' || s.dot === 'normal') && (!gw || (s.tm.inked && s.tm.path)) &&
        Math.abs(s.tm.box[0] - s.tab[0]) < 0.5 && Math.abs(s.tm.box[1] - s.tab[1]) < 0.5, s.tm);
      check(res, tag + ' header names: every link named, no Chinese aria-label under lang=en', s.names.every((n) => n.length > 1) && !s.cjkLabel, s.names.join(' | '));
      check(res, tag + ' no horizontal overflow', s.overflow <= 0, s.overflow);
      if (gw) {
        const now = await gap(page);
        await before.goto(BEFORE + '/' + p, { waitUntil: 'load' });
        await before.waitForSelector('.site-index', { timeout: 8000 }).catch(() => {}); await before.waitForTimeout(700);
        const was = await gap(before);
        check(res, tag + ' rule gap (from the tab edges) matches before ±1px', now && was && Math.abs(now[0] - was[0]) <= 1 && Math.abs(now[1] - was[1]) <= 1, { now, before: was });
        await ctx.shot('/tmp/fyshot/p1nav/nav-' + w + '-' + p.replace(/[\/?=]/g, '_') + '.png', { clip: { x: 0, y: 0, width: w, height: w > 500 ? 240 : 230 } });
      }
    }
  }
  await before.close();
  const real = errs.filter((e) => !KNOWN.test(e));
  check(res, 'no console errors or failed requests', real.length === 0, real.slice(0, 6));
  if (errs.length > real.length) ctx.log('known, pre-existing on main: ' + [...new Set(errs.filter((e) => /^HTTP/.test(e) && KNOWN.test(e)).map((e) => e.replace(/^HTTP \d+ /, '')))].join(', '));
  const bad = res.filter((r) => !r.ok);
  ctx.log(`vt-nav: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
