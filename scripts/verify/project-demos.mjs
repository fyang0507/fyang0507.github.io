// project-demos.mjs — Fred Agent's Demos: the recording's play control and the evidence viewer (lib/fred-agent/evidence.js,
// corners.js; design/2026-09-building, the round-4 Demos board with Fred's corners).
//   node /tmp/fyshot/run.mjs scripts/verify/project-demos.mjs
//   env: BASE (default http://127.0.0.1:4173/) · DM_W (1440,1024,820,390,360)
// At each width, on Figs. 02–04:
//   · every region has its token on the capture, ≥ 30 px with a ≥ 44 px target, numbered as its legend entry, and each
//     entry is named by its region (its number and title) and described by its key and note;
//   · no coral at rest, before anything is touched and after it's all been put back;
//   · noticing an entry (a mouse over it above 760 px, keyboard focus below) draws the region's four corners in coral,
//     at 3.4 px, ≥ 3:1 against the capture under at least two thirds of what shows of them (not under a token): the
//     pen's coral holds on white and dark UI, and dips where a stroke crosses a glyph's edge, an avatar or a wallpaper;
//   · choosing it lays the enlargement over the capture's frame (the prints' box inside it; the screen's width on a
//     phone) and moves nothing on the page: no layout shift, every later part of the page where it was;
//   · the window fetches that print's zoom tier (200) and no other, and no zoom file is fetched before an enlargement opens;
//   · its region's four corners sit on the region's boundary, in the same coral at 3.4 px on a 5.8 px paper halo, ≥ 3:1
//     (coral or halo) against the capture under two thirds of them; while it's open they are the only coral in the
//     figures (Fred's exception to "no coral at rest", AGENTS.md), and nothing else is; its texts ≥ 4.5:1;
//   · its ← → and "put it back" take no pen line under a mouse (they lift a little, 1.5 px) and the pen's 「 」 by keyboard;
//   · → and ← step with an "n / N" counter, wrapping both ways, the note and the corners moving with it; on a phone a
//     swipe steps too, and inside the window (Fig. 02) a swipe at the edge it runs into, fast or slow, steps to the next
//     region and leaves it wholly in view with its token, no fling carrying the window on, while one away from that
//     edge pans the window instead;
//   · putting it back (Esc on Fig. 02, the button on Fig. 03, a click outside on Fig. 04) is opening reversed: as it
//     lands, its region lies on the capture's and its image on the print's, within 1 px; its paper and note are gone,
//     the region's corners and token wait there over it; then it is gone, nothing of it is left, and focus is on the
//     entry;
//   · no horizontal overflow, at rest and open.
// At 1440 also: with keyboard focus on an entry, a mouse on another token marks that region as well, and going leaves
// the focused one noticed; a drag selecting the note's text past the enlargement's edge doesn't put it back; a step to
// another print (Fig. 04) takes the old region's corners and token off at once; a zoom tier that fails leaves the
// print's own file showing, with no broken image over it.
// The recording: nothing of it fetched before play; the play disc (72 px, 64 on phones) at the poster's centre; pressing it
// plays in place with the player's controls. Reduced motion (1440, 390): opening, stepping and putting back land at once.
// Exit code 1 on any failure.
import { check } from './vt-lib.mjs';

const BASE = process.env.BASE || 'http://127.0.0.1:4173/', URL = BASE + 'building/fred-agent/demos.html';
const SIZES = [[1440, 900], [1024, 768], [820, 1180], [390, 844], [360, 800]].filter(([w]) => (process.env.DM_W || '1440,1024,820,390,360').split(',').map(Number).includes(w));
const FIGS = ['trash-patrol', 'discord-intake', 'unattended-recovery'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// in the page: WCAG ratios, the capture under a path, the corners' geometry
const LIB = () => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const lum = (v) => { const l = v.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const PAPER = [251, 246, 236], CORAL = ['rgb(217, 105, 90)', 'rgb(165, 69, 58)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)'];
  window.__dm = {
    ratio, rgb,
    // what shows coral: a visible stroke or fill, or an element's colour, border or outline, inside the figures
    coralEls() {
      const hits = [];
      document.querySelectorAll('.ex-fig *').forEach((e) => {
        const cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || cs.display === 'none' || !e.getClientRects().length) return;
        if (e instanceof SVGElement) { if (e.tagName !== 'svg' && e.tagName !== 'g' && (CORAL.includes(cs.stroke) || CORAL.includes(cs.fill))) hits.push(e); return; }
        if ([cs.color, cs.backgroundColor, cs.borderTopColor, cs.outlineStyle !== 'none' ? cs.outlineColor : ''].some((c) => CORAL.includes(c))) hits.push(e);
      });
      return hits;
    },
    coral() { return this.coralEls().map((e) => (e.getAttribute('class') || e.tagName)); },
    // the pixels under a corner set's strokes, from the image under them (the print's, or the enlargement's), paper
    // where they leave it; the ratio of each to the stroke (ink) or the better of ink and casing (cased)
    contrast(host, img, box) {
      const svg = host.querySelector(':scope > svg.cn'), cv = document.createElement('canvas');
      cv.width = Math.round(box.width); cv.height = Math.round(box.height);
      const g = cv.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, cv.width, cv.height);
      const ink = rgb(getComputedStyle(svg.querySelector('.cn-ink')).stroke), cased = getComputedStyle(svg.querySelector('.cn-case')).display !== 'none';
      const rs = [], med = [], tokens = [...host.closest('.print, .zm-img').querySelectorAll('.mk')].filter((t) => !t.hidden && getComputedStyle(t).visibility !== 'hidden').map((t) => t.getBoundingClientRect());
      svg.querySelectorAll('.cn-ink').forEach((p) => {
        const L = p.getTotalLength(), m = p.getScreenCTM(), one = [];
        for (let s = 0; s <= L; s += 2) {
          const q = p.getPointAtLength(s), X = m.a * q.x + m.c * q.y + m.e, Y = m.b * q.x + m.d * q.y + m.f, x = X - box.left, y = Y - box.top;
          if (tokens.some((t) => X > t.left - 4 && X < t.right + 4 && Y > t.top - 4 && Y < t.bottom + 4)) continue;   // under a token and its halo: not seen
          const px = x < 0 || y < 0 || x >= cv.width || y >= cv.height ? PAPER : [...g.getImageData(Math.floor(x), Math.floor(y), 1, 1).data].slice(0, 3);
          one.push(cased ? Math.max(ratio(ink, px), ratio(PAPER, px)) : ratio(ink, px));
        }
        if (!one.length) return;
        one.sort((a, b) => a - b); med.push(+one[one.length >> 1].toFixed(2)); rs.push(...one);
      });
      rs.sort((a, b) => a - b);
      return { min: +rs[0].toFixed(2), share: +(rs.filter((r) => r >= 3).length / rs.length).toFixed(3), med, n: rs.length, ink: getComputedStyle(svg.querySelector('.cn-ink')).stroke };
    },
    // a corner set: shown, its widths, and its vertices against its host's box (host px)
    corners(host) {
      const svg = host.querySelector(':scope > svg.cn'), inks = [...svg.querySelectorAll('.cn-ink')], cs = inks.map((p) => getComputedStyle(p));
      const v = inks.map((p) => { const n = p.getAttribute('d').match(/-?[\d.]+/g).map(Number); return [n[2], n[3]]; });
      return { shown: cs.every((c) => c.visibility === 'visible'), state: svg.dataset.state, ink: parseFloat(cs[0].strokeWidth), stroke: cs[0].stroke, casing: parseFloat(getComputedStyle(svg.querySelector('.cn-case')).strokeWidth), cased: getComputedStyle(svg.querySelector('.cn-case')).display !== 'none', v, w: host.offsetWidth, h: host.offsetHeight };
    },
    // where every part of the page after the capture sits, in document px
    after(fig) {
      const out = [];
      for (let e = fig.nextElementSibling; e; e = e.nextElementSibling) { const r = e.getBoundingClientRect(); out.push(Math.round((r.top + scrollY) * 2) / 2); }
      fig.querySelectorAll('.ex-note, .ex-cap').forEach((e) => { const r = e.getBoundingClientRect(); out.push(Math.round((r.top + scrollY) * 2) / 2, Math.round(r.left * 2) / 2); });
      return out.concat(document.documentElement.scrollHeight);
    }
  };
};

// the corners' vertices on the region's boundary: GAP (6) px outside it, or where it leaves its image, at the image's
// edge (inside its inset in the enlargement)
const onBoundary = (c, lim) => {
  const [tl, tr, br, bl] = c.v, ok = (a, want) => Math.abs(a - want) <= 1.2;   // offsets round to whole px
  const x0 = Math.max(0, lim.l) - 6, x1 = Math.min(c.w, lim.r) + 6, y0 = Math.max(0, lim.t) - 6, y1 = Math.min(c.h, lim.b) + 6;
  const X0 = lim.inset != null ? Math.max(x0, lim.l + lim.inset) : x0, X1 = lim.inset != null ? Math.min(x1, lim.r - lim.inset) : x1;
  const Y0 = lim.inset != null ? Math.max(y0, lim.t + lim.inset) : y0, Y1 = lim.inset != null ? Math.min(y1, lim.b - lim.inset) : y1;
  return ok(tl[0], X0) && ok(tl[1], Y0) && ok(tr[0], X1) && ok(tr[1], Y0) && ok(br[0], X1) && ok(br[1], Y1) && ok(bl[0], X0) && ok(bl[1], Y1);
};

async function open(browser, w, h, o = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 760, reducedMotion: o.reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage(), reqs = [], bad = [];
  page.on('request', (r) => reqs.push(r));
  page.on('pageerror', (e) => bad.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bad.push('console.error: ' + m.text()); });
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => { window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true }); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (const i of document.querySelectorAll('.viewer img')) { i.loading = 'eager'; await i.decode().catch(() => {}); } });
  await sleep(900);
  await page.evaluate(LIB);
  return { context, page, reqs, bad };
}

async function viewer(res, page, reqs, w, id) {
  const tag = `${w} ${id}`, phone = w <= 760, fig = `#${id}-viewer`;
  const N = await page.$$eval(`${fig} .ex-note`, (b) => b.length);
  const tok = await page.$$eval(`${fig} .rg`, (rs) => rs.map((r) => { const m = r.querySelector('.rg-m'), b = m.getBoundingClientRect(), a = getComputedStyle(m, '::after'); return { n: r.dataset.n, mn: m.dataset.n, w: b.width, h: b.height, t: b.width - 2 * parseFloat(a.left), shows: getComputedStyle(m).visibility === 'visible' }; }));
  check(res, `${tag}: a token on every region, ≥ 30 px with a ≥ 44 px target, numbered as its entry`, tok.length === N && tok.every((t) => t.n === t.mn && t.w >= 30 && t.h >= 30 && t.t >= 44 && t.shows), tok.map((t) => t.n + ':' + t.w.toFixed(0) + '/' + t.t.toFixed(0)).join(' '));
  const names = await page.$$eval(`${fig} .ex-note`, (bs) => bs.map((b) => {
    const txt = (ids) => (ids || '').split(' ').map((i) => (document.getElementById(i) || {}).textContent || '?').join(' ');
    return { name: txt(b.getAttribute('aria-labelledby')), want: b.dataset.n + ' ' + b.querySelector('.en-t').textContent, desc: txt(b.getAttribute('aria-describedby')), wantD: b.querySelector('.en-k').textContent + ' ' + b.querySelector('.en-p').textContent };
  }));
  check(res, `${tag}: each entry is named by its region's number and title, and described by its key and note`, names.every((x) => x.name === x.want && x.desc === x.wantD), names.map((x) => x.name));
  // notice the first entry: its region's corners, coral
  const note = `${fig} .ex-note[data-n="1"]`;
  await page.$eval(note, (b) => b.scrollIntoView({ block: 'center' }));
  await sleep(300);
  if (phone) { await page.focus(note); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); }   // keyboard focus, so :focus-visible
  else await page.hover(note);
  // the pen has drawn them: the four strokes whole (or 2 s have passed)
  await page.waitForFunction((fig) => { const s = document.querySelector(fig + ' .rg[data-n="1"] > svg.cn'); return s && s.dataset.state === '1' && [...s.querySelectorAll('.cn-ink')].every((p) => getComputedStyle(p).visibility === 'visible' && parseFloat(p.style.strokeDasharray) >= p.getTotalLength() - 0.5); }, fig, { timeout: 2000 }).catch(() => {});
  const noticed = await page.evaluate((fig) => { const rg = document.querySelector(fig + ' .rg[data-n="1"]'), img = rg.closest('.print').querySelector('img'), a = document.activeElement; return { c: __dm.corners(rg), k: __dm.contrast(rg, img, img.getBoundingClientRect()), focus: a.classList.contains('ex-note') && a.closest(fig) ? a.dataset.n + (a.matches(':focus-visible') ? ' visible' : '') : a.tagName + '.' + a.className }; }, fig);
  check(res, `${tag}: noticing entry 1 (${phone ? 'keyboard focus' : 'a mouse'}) draws its region's four corners in coral at 3.4 px, ≥ 3:1 on the capture under ⅔ of them`,
    noticed.c.shown && noticed.c.state === '1' && Math.abs(noticed.c.ink - 3.4) < 0.01 && !noticed.c.cased && noticed.k.share >= 2 / 3, { shown: noticed.c.shown, state: noticed.c.state, cased: noticed.c.cased, focus: noticed.focus, ink: noticed.k.ink, w: noticed.c.ink, ...noticed.k });
  // choose it
  const before = await page.evaluate((fig) => { window.__cls = 0; return __dm.after(document.querySelector(fig).closest('figure')); }, fig);
  const zoomsBefore = reqs.filter((r) => /-zoom\.jpg/.test(r.url()));
  await page.click(note);
  await sleep(1300);
  await page.mouse.move(1, 1); await sleep(400);   // no pointer over an entry: what's coral now is at rest
  const o = await page.evaluate((fig) => {
    const v = document.querySelector(fig), zm = v.querySelector('.zm'), z = zm.getBoundingClientRect(), p = v.querySelector('.prints').getBoundingClientRect();
    const box = [...zm.querySelectorAll('.zm-rg')].find((b) => !b.hidden && !b.querySelector('.mk').hidden), size = zm.querySelector('.zm-size'), img = zm.querySelector('.zm-img img');
    const x0 = box.offsetLeft, y0 = box.offsetTop, lim = { l: -x0, t: -y0, r: size.offsetWidth - x0, b: size.offsetHeight - y0, inset: 4 };   // whole px, as corners.js measures
    const low = [...zm.querySelectorAll('.zm-k, .zm-t, .zm-p, .zm-n, .zm-bar button')].map((e) => ({ e: e.className, r: __dm.ratio(__dm.rgb(getComputedStyle(e).color), [251, 246, 236]) })).filter((x) => x.r < 4.5);
    return { shown: !zm.hidden, layout: zm.dataset.layout, z: [z.left, z.top, z.right, z.bottom], p: [p.left, p.top, p.right, p.bottom], vw: document.documentElement.clientWidth,
      n: zm.querySelector('.zm-n').textContent, t: zm.querySelector('.zm-t').textContent, want: v.querySelector('.ex-note[data-n="1"] .en-t').textContent, focus: zm.contains(document.activeElement),
      only: (() => { const hits = __dm.coralEls(); return { n: hits.length, all: hits.every((e) => box.contains(e) && e.classList.contains('cn-ink')), what: hits.map((e) => e.getAttribute('class') || e.className).slice(0, 6) }; })(),
      c: __dm.corners(box), lim, k: img.complete && img.naturalWidth ? __dm.contrast(box, img, size.getBoundingClientRect()) : null, zoom: img.src, low, overflow: document.documentElement.scrollWidth - innerWidth };
  }, fig);
  const after = await page.evaluate((fig) => __dm.after(document.querySelector(fig).closest('figure')), fig), cls = await page.evaluate(() => window.__cls);
  const over = phone ? o.z[0] >= 7 && o.z[2] <= o.vw - 7 && o.z[2] - o.z[0] >= o.vw - 17 : o.z[0] <= o.p[0] + 0.5 && o.z[1] <= o.p[1] + 0.5 && o.z[2] >= o.p[2] - 0.5;
  check(res, `${tag}: choosing it lays the enlargement over the capture's frame (${o.layout}), focus inside, "1 / ${N}"`, o.shown && over && o.focus && o.n === `1 / ${N}` && o.t === o.want, { z: o.z.map(Math.round), p: o.p.map(Math.round), n: o.n });
  check(res, `${tag}: nothing on the page moves as it opens`, cls === 0 && before.length === after.length && before.every((y, i) => Math.abs(y - after[i]) <= 0.5), { cls, moved: before.map((y, i) => y - after[i]).filter((d) => Math.abs(d) > 0.5).slice(0, 4) });
  const zooms = reqs.filter((r) => /-zoom\.jpg/.test(r.url()) && !zoomsBefore.includes(r)), got = zooms.find((r) => r.url() === o.zoom), st = got && (await got.response()) ? (await got.response()).status() : 0;
  check(res, `${tag}: the window fetches its print's zoom tier (${o.zoom.split('/').pop()}), 200, and no other`, !zoomsBefore.some((r) => r.url() === o.zoom) && zooms.length === 1 && st === 200, { opened: zooms.map((r) => r.url().split('/').pop()), st });
  check(res, `${tag}: its corners sit on the region's boundary, in coral at 3.4 px on a 5.8 px paper halo, ≥ 3:1 on the capture under ⅔ of them`,
    o.c.shown && o.c.state === '2' && o.c.stroke === noticed.k.ink && Math.abs(o.c.ink - 3.4) < 0.01 && o.c.cased && Math.abs(o.c.casing - 5.8) < 0.01 && onBoundary(o.c, o.lim) && o.k && o.k.share >= 2 / 3, { stroke: o.c.stroke, v: o.c.v.map((p) => p.map(Math.round)), w: o.c.w, h: o.c.h, k: o.k });
  check(res, `${tag}: while it's open the only coral in the figures is its region's four corners`, o.only.n === 4 && o.only.all, o.only);
  check(res, `${tag}: the enlargement's texts ≥ 4.5:1, no horizontal overflow while it's open`, o.low.length === 0 && o.overflow <= 0, { low: o.low, overflow: o.overflow });
  // its controls: no pen line under a mouse, a small lift; the pen's 「 」 by keyboard
  const lines = await page.$$eval(`${fig} .zm-bar button`, (bs) => bs.filter((b) => b.querySelector('svg.tm')).length);
  let lift = null;
  if (!phone) {
    await page.hover(`${fig} .zm-x`); await sleep(600);
    lift = await page.evaluate((fig) => ({ t: new DOMMatrix(getComputedStyle(document.querySelector(fig + ' .zm-x')).transform).f, coral: __dm.coralEls().filter((e) => e.closest('.zm-bar')).length }), fig);
    await page.mouse.move(1, 1); await sleep(300);
  }
  await page.keyboard.press('Tab'); await sleep(400);
  const kb = await page.evaluate((fig) => { const a = document.activeElement, m = [...a.querySelectorAll(':scope > svg.fm path')]; return { on: a.className, zm: !!a.closest(fig + ' .zm-bar'), drawn: m.length === 2 && m.every((p) => getComputedStyle(p).visibility !== 'hidden') }; }, fig);
  check(res, `${tag}: its ← → and put back take no pen line${phone ? '' : ' under a mouse, but lift 1.5 px'}, and the pen's 「 」 by keyboard`, lines === 0 && (phone || (Math.abs(lift.t + 1.5) < 0.01 && lift.coral === 0)) && kb.zm && kb.drawn, { lines, lift, kb });
  // step through, and wrap both ways
  const seen = [];
  for (let i = 0; i < N; i++) {
    await page.keyboard.press('ArrowRight'); await sleep(700);
    seen.push(await page.evaluate((fig) => {
      const zm = document.querySelector(fig + ' .zm'), box = [...zm.querySelectorAll('.zm-rg')].find((b) => !b.hidden && !b.querySelector('.mk').hidden), n = box.querySelector('.mk').textContent;
      return { n: zm.querySelector('.zm-n').textContent, mk: n, t: zm.querySelector('.zm-t').textContent === document.querySelector(fig + ` .ex-note[data-n="${n}"] .en-t`).textContent, c: __dm.corners(box).shown, exp: document.querySelector(fig + ` .ex-note[data-n="${n}"]`).getAttribute('aria-expanded') };
    }, fig));
  }
  await page.keyboard.press('ArrowLeft'); await sleep(700);
  const back = await page.$eval(`${fig} .zm-n`, (e) => e.textContent);
  const want = [...Array(N)].map((_, i) => `${(i + 1) % N + 1} / ${N}`);
  check(res, `${tag}: → steps ${want.join(', ')} (wrapping), ← wraps back to ${N} / ${N}; the note, the token and the corners go with it`, seen.every((s, i) => s.n === want[i] && s.t && s.c && s.exp === 'true') && back === `${N} / ${N}`, { seen: seen.map((s) => s.n + (s.t && s.c ? '' : '✗')), back });
  if (phone) {   // a swipe on the note steps on
    const r = await page.$eval(`${fig} .zm-note`, (e) => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + 30]; });
    const cdp = await page.context().newCDPSession(page), T = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y: r[1] }] });
    await T('touchStart', r[0] + 90); for (let i = 1; i <= 6; i++) { await T('touchMove', r[0] + 90 - i * 30); await sleep(16); } await T('touchEnd');
    await sleep(700);
    const n = await page.$eval(`${fig} .zm-n`, (e) => e.textContent);
    check(res, `${tag}: a swipe left on the note steps on (${N} / ${N} → 1 / ${N})`, n === `1 / ${N}`, n);
  }
  // put it back, each figure its own way, held where it lands
  const at = await page.$eval(`${fig} .zm-n`, (e) => e.textContent.split(' / ')[0]), how = { 'trash-patrol': 'Esc', 'discord-intake': 'the button', 'unattended-recovery': 'a click outside' }[id];
  await page.evaluate((fig) => document.querySelector(fig + ' .zm').focus({ preventScroll: true }), fig);
  if (how === 'Esc') await page.keyboard.press('Escape');
  else if (how === 'the button') { await page.$eval(`${fig} .zm-x`, (b) => b.scrollIntoView({ block: 'nearest' })); await sleep(200); await page.click(`${fig} .zm-x`); }
  else await page.mouse.click(4, (await page.evaluate(() => innerHeight)) - 4);
  await page.evaluate((fig) => {
    const v = document.querySelector(fig);
    window.__put = document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.closest && (a.effect.target.closest(fig + ' .zm') || a.effect.target.closest(fig + ' .zm-home')));
    const end = Math.max(...window.__put.map((a) => a.effect.getComputedTiming().endTime));
    window.__put.forEach((a) => { a.pause(); a.currentTime = end; });
  }, fig);
  await sleep(450);   // the pen draws the region's corners where it lands meanwhile
  const land = await page.evaluate(([fig, i]) => {
    const v = document.querySelector(fig), zm = v.querySelector('.zm'), rg = v.querySelector(`.rg[data-n="${i}"]`), d = (a, b) => Math.max(Math.abs(a.left - b.left), Math.abs(a.top - b.top), Math.abs(a.right - b.right), Math.abs(a.bottom - b.bottom));
    const box = [...zm.querySelectorAll('.zm-rg')].find((b) => !b.hidden && !b.querySelector('.mk').hidden), home = v.querySelector('.zm-home'), at = home && [...home.querySelectorAll('.zm-at')].find((x) => x.querySelector('svg.cn'));
    return { region: +d(box.getBoundingClientRect(), rg.getBoundingClientRect()).toFixed(2), image: +d(zm.querySelector('.zm-img').getBoundingClientRect(), rg.closest('.print').querySelector('img').getBoundingClientRect()).toFixed(2),
      paper: +getComputedStyle(zm.querySelector('.zm-paper')).opacity, note: +getComputedStyle(zm.querySelector('.zm-note')).opacity, zm: +getComputedStyle(zm).opacity,
      home: !!at && __dm.corners(at).shown && __dm.corners(at).state === '2' && d(at.getBoundingClientRect(), rg.getBoundingClientRect()) < 0.5 };
  }, [fig, +at]);
  await page.evaluate(() => window.__put.forEach((a) => a.finish())); await sleep(300);
  const shut = await page.evaluate(([fig, i]) => { const v = document.querySelector(fig), n = v.querySelectorAll('.ex-note')[i - 1]; return { hidden: v.querySelector('.zm').hidden, left: !!v.querySelector('.zm-home'), focus: document.activeElement === n, expanded: [...v.querySelectorAll('.ex-note')].some((b) => b.getAttribute('aria-expanded') === 'true') }; }, [fig, +at]);
  check(res, `${tag}: ${how} puts it back: as it lands its region is on the capture's and its image on the print's within 1 px, its paper and note gone, the region's corners waiting there`,
    land.region <= 1 && land.image <= 1 && land.paper === 0 && land.note === 0 && land.zm === 1 && land.home, land);
  check(res, `${tag}: then nothing of it is left, and focus is on entry ${at}`, shut.hidden && !shut.left && shut.focus && !shut.expanded, shut);
}

// On a phone, Fig. 02: open its region 2, pan the window to the edge a swipe runs into and swipe inside it, fast and
// slow, each way: the next region wholly in the window (as much of it as its capture holds), its token inside it,
// still so a moment later (no fling carried on); then a swipe away from that edge pans and doesn't step.
async function swipes(res, page, w) {
  const cdp = await page.context().newCDPSession(page), zm = '#trash-patrol-zm';
  const openAt2 = async () => {
    if (await page.$eval(zm, (z) => !z.hidden)) { await page.keyboard.press('Escape'); await sleep(700); }
    await page.$eval('#trash-patrol-viewer .ex-note[data-n="2"]', (b) => b.scrollIntoView({ block: 'center' }));
    await page.tap('#trash-patrol-viewer .ex-note[data-n="2"]'); await sleep(1200);
  };
  const swipe = async (x, y, d, n, gap) => {
    const T = (type, px) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y }] });
    await T('touchStart', x - d * 100);
    for (let i = 1; i <= n; i++) { await T('touchMove', x - d * 100 + d * i * (200 / n)); await sleep(gap); }
    await T('touchEnd');
  };
  const view = () => page.evaluate((zm) => {
    const z = document.querySelector(zm), win = z.querySelector('.zm-win'), wr = win.getBoundingClientRect(), im = z.querySelector('.zm-size').getBoundingClientRect();
    const box = [...z.querySelectorAll('.zm-rg')].find((b) => !b.hidden && !b.querySelector('.mk').hidden), b = box.getBoundingClientRect(), m = box.querySelector('.mk').getBoundingClientRect();
    const l = Math.max(b.left, im.left), t = Math.max(b.top, im.top), r = Math.min(b.right, im.right), btm = Math.min(b.bottom, im.bottom);   // the region, as far as its capture goes
    const seen = Math.max(0, Math.min(r, wr.right) - Math.max(l, wr.left)) * Math.max(0, Math.min(btm, wr.bottom) - Math.max(t, wr.top)) / ((r - l) * (btm - t));
    return { n: z.querySelector('.zm-n').textContent, scroll: Math.round(win.scrollLeft), seen: +seen.toFixed(3), token: m.left >= wr.left - 0.5 && m.right <= wr.right + 0.5 && m.top >= wr.top - 0.5 && m.bottom <= wr.bottom + 0.5 };
  }, zm);
  for (const [speed, n, gap] of [['fast', 4, 8], ['slow', 14, 30]]) {
    for (const [dir, d, want] of [['left', -1, '3 / 3'], ['right', 1, '1 / 3']]) {
      await openAt2();
      const at = await page.evaluate(([zm, dir]) => { const win = document.querySelector(zm + ' .zm-win'); win.scrollLeft = dir === 'left' ? win.scrollWidth : 0; const r = win.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, [zm, dir]);
      await sleep(300);
      await swipe(at[0], at[1], d, n, gap); await sleep(1100);
      const a = await view(); await sleep(700);
      const b = await view();
      check(res, `${w} trash-patrol: a ${speed} swipe ${dir} at the window's edge steps to ${want}, the region wholly in view with its token, and it stays`, a.n === want && a.seen >= 0.99 && a.token && b.scroll === a.scroll, { a, later: b.scroll });
    }
  }
  await openAt2();
  const at = await page.evaluate((zm) => { const win = document.querySelector(zm + ' .zm-win'); win.scrollLeft = Math.round((win.scrollWidth - win.clientWidth) / 2); const r = win.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, win.scrollLeft]; }, zm);
  await sleep(300);
  await swipe(at[0], at[1], -1, 8, 16); await sleep(1100);
  const p = await view();
  check(res, `${w} trash-patrol: a swipe inside the window away from its edge pans it and doesn't step`, p.n === '2 / 3' && p.scroll > at[2], { ...p, from: at[2] });
  await page.keyboard.press('Escape'); await sleep(700);
}

// At 1440: selecting the note's text by dragging past the enlargement's edge; a step to another print; a zoom tier
// that fails to load
async function edges(res, browser) {
  const { context, page } = await open(browser, 1440, 900), tag = '1440';
  await page.$eval('#trash-patrol-viewer .ex-note[data-n="1"]', (b) => b.scrollIntoView({ block: 'center' }));
  await page.focus('#trash-patrol-viewer .ex-note[data-n="1"]'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
  const drawn = (ns) => page.waitForFunction((ns) => ns.every((n) => { const s = document.querySelector(`#trash-patrol-viewer .rg[data-n="${n}"] > svg.cn`); return s.dataset.state === '1' && [...s.querySelectorAll('.cn-ink')].every((p) => getComputedStyle(p).visibility === 'visible' && parseFloat(p.style.strokeDasharray) >= p.getTotalLength() - 0.5); }), ns, { timeout: 2000 }).then(() => true, () => false);
  await page.hover('#trash-patrol-viewer .rg-m[data-n="2"]');
  const both = await drawn([1, 2]);
  await page.mouse.move(1, 1); await sleep(400);
  const held = await drawn([1]), gone = await page.$$eval('#trash-patrol-viewer .rg[data-n="2"] > svg.cn .cn-ink', (ps) => ps.every((p) => getComputedStyle(p).visibility === 'hidden'));
  check(res, `${tag}: with keyboard focus on entry 1, a mouse on token 2 marks region 2 as well, and going leaves region 1 noticed`, both && held && gone, { both, held, gone });
  await page.click('#trash-patrol-viewer .ex-note[data-n="1"]'); await sleep(1000);
  const p = await page.$eval('#trash-patrol-zm .zm-p', (e) => { const r = e.getBoundingClientRect(); return [r.left + 20, r.top + 8]; });
  await page.mouse.move(p[0], p[1]); await page.mouse.down(); await page.mouse.move(p[0] + 200, p[1] + 300, { steps: 8 }); await page.mouse.move(1300, 880, { steps: 8 }); await page.mouse.up();
  await sleep(700);
  const sel = await page.evaluate(() => ({ open: !document.querySelector('#trash-patrol-zm').hidden, text: getSelection().toString().length }));
  check(res, `${tag}: a drag selecting the note's text past the enlargement's edge doesn't put it back`, sel.open && sel.text > 0, sel);
  await page.keyboard.press('Escape'); await sleep(700);
  // Fig. 04: region 1 is on the first print, region 2 on the second
  await page.$eval('#unattended-recovery-viewer .ex-note[data-n="1"]', (b) => b.scrollIntoView({ block: 'center' }));
  await page.click('#unattended-recovery-viewer .ex-note[data-n="1"]'); await sleep(1000);
  await page.keyboard.press('ArrowRight');
  const jump = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('#unattended-recovery-zm .zm-rg')], old = boxes.find((b) => b.querySelector('.mk').hidden);
    return { n: document.querySelector('#unattended-recovery-zm .zm-n').textContent, left: old ? [...old.querySelectorAll('.cn-ink')].filter((p) => getComputedStyle(p).visibility !== 'hidden').length : -1 };
  });
  check(res, `${tag}: a step to another print (Fig. 04, 1 → 2) takes the old region's corners and token off at once`, jump.n === '2 / 4' && jump.left === 0, jump);
  await context.close();
  // a zoom tier that fails: the print's own file stays, with no broken image over it
  const f = await open(browser, 1440, 900);
  await f.context.route(/-zoom\.jpg$/, (r) => r.abort());
  await f.page.$eval('#trash-patrol-viewer .ex-note[data-n="2"]', (b) => b.scrollIntoView({ block: 'center' }));
  await f.page.click('#trash-patrol-viewer .ex-note[data-n="2"]'); await sleep(1200);
  const z = await f.page.evaluate(() => { const l = document.querySelector('#trash-patrol-zm .zm-img'), i = l.querySelector('img'); return { failed: i.complete && !i.naturalWidth, img: getComputedStyle(i).visibility, under: /derived\/evidence\/fred-agent\/trash-patrol-\d+\.jpg/.test(l.style.backgroundImage) }; });
  check(res, `${tag}: a zoom tier that fails leaves the print's own file under it, with no broken image`, z.failed && z.img === 'hidden' && z.under, z);
  await f.context.close();
}

export default async (page0) => {
  const browser = page0.context().browser(), res = [];
  for (const [w, h] of SIZES) {
    const { context, page, reqs, bad } = await open(browser, w, h);
    const rest = await page.evaluate(() => ({ coral: __dm.coral(), overflow: document.documentElement.scrollWidth - innerWidth }));
    check(res, `${w}: no coral at rest, no horizontal overflow`, rest.coral.length === 0 && rest.overflow <= 0, rest);
    check(res, `${w}: nothing of the recording and no zoom tier fetched before anything is touched`, !reqs.some((r) => /\.mp4|-zoom\.jpg/.test(r.url())), reqs.filter((r) => /\.mp4|-zoom\.jpg/.test(r.url())).map((r) => r.url().split('/').pop()));
    for (const id of FIGS) await viewer(res, page, reqs, w, id);
    if (w <= 760) await swipes(res, page, w);
    await page.mouse.move(1, 1); await page.evaluate(() => document.activeElement.blur()); await sleep(600);
    const end = await page.evaluate(() => ({ coral: __dm.coral(), overflow: document.documentElement.scrollWidth - innerWidth }));
    check(res, `${w}: no coral at rest once all is put back, no horizontal overflow`, end.coral.length === 0 && end.overflow <= 0, end);
    // the recording
    await page.$eval('.print--video', (p) => p.scrollIntoView({ block: 'center' })); await sleep(400);
    const pl = await page.evaluate(() => { const p = document.querySelector('.print--video video').getBoundingClientRect(), d = document.querySelector('.ex-play-d').getBoundingClientRect(); return { dx: d.left + d.width / 2 - (p.left + p.width / 2), dy: d.top + d.height / 2 - (p.top + p.height / 2), d: d.width }; });
    check(res, `${w}: the play disc (${w <= 760 ? 64 : 72} px) at the poster's centre`, Math.abs(pl.dx) <= 1 && Math.abs(pl.d - (w <= 760 ? 64 : 72)) < 0.5 && pl.dy < 0 && pl.dy > -40, pl);
    await page.click('.ex-play'); await sleep(1200);
    const v = await page.evaluate(() => { const v = document.querySelector('.print--video video'); return { paused: v.paused, controls: v.controls, hidden: getComputedStyle(document.querySelector('.ex-play')).display === 'none' }; });
    check(res, `${w}: pressing play plays it in place, with the player's controls`, !v.paused && v.controls && v.hidden && reqs.some((r) => /\.mp4/.test(r.url())), v);
    check(res, `${w}: 0 console or page errors`, bad.length === 0, bad.slice(0, 3));
    await context.close();
  }
  if (SIZES.some(([w]) => w === 1440)) await edges(res, browser);
  // reduced motion: every state lands at once
  for (const [w, h] of SIZES.filter(([w]) => w === 1440 || w === 390)) {
    const { context, page } = await open(browser, w, h, { reduced: true });
    const note = '#trash-patrol-viewer .ex-note[data-n="2"]';
    await page.$eval(note, (b) => b.scrollIntoView({ block: 'center' }));
    await page.click(note);
    const a = await page.evaluate(() => { const zm = document.querySelector('#trash-patrol-zm'); return { shown: !zm.hidden, anims: zm.getAnimations().length + zm.querySelector('.zm-img').getAnimations().length, tf: getComputedStyle(zm).transform }; });
    await page.keyboard.press('ArrowRight');
    const b = await page.evaluate(() => { const zm = document.querySelector('#trash-patrol-zm'), box = [...zm.querySelectorAll('.zm-rg')].find((x) => !x.hidden && !x.querySelector('.mk').hidden); return { n: zm.querySelector('.zm-n').textContent, anims: zm.querySelector('.zm-img').getAnimations().length + zm.querySelector('.zm-txt').getAnimations().length, corners: [...box.querySelectorAll('.cn-ink')].every((p) => getComputedStyle(p).visibility === 'visible' && parseFloat(p.style.strokeDasharray) >= p.getTotalLength() - 0.5) }; });
    await page.keyboard.press('Escape');
    const c = await page.evaluate(() => document.querySelector('#trash-patrol-zm').hidden && !document.querySelector('.zm-home'));
    check(res, `${w} reduced motion: it opens, steps (the corners drawn whole) and is put back at once`, a.shown && a.anims === 0 && a.tf === 'none' && b.n === '3 / 3' && b.anims === 0 && b.corners && c, { a, b, closed: c });
    await context.close();
  }
  const failed = res.filter((r) => !r.ok);
  console.log(`project-demos: ${res.length - failed.length}/${res.length} pass`);
  if (failed.length) process.exitCode = 1;
};
