// reading-shelf.mjs — the end of an essay, Writing's shelf (lib/reading/shelf.js, shelf.css). On a middle essay, the
// newest (no next: the つづく ghost) and the oldest (no previous: the shelf ends), at 1440 and 390, light and dark,
// Chinese and English: the links go to the older and newer essays and the tag to Writing; nothing leaves the window
// or overlaps; text holds 4.5:1 on its paper; phone tap targets reach 44 px; nothing is coral at rest; the pen's
// underlines keep their spacing (pen-spacing.mjs's rule). Then the states: hover draws the coral line and lifts the
// book out of its lean, the tag swings square on a spring with one small overshoot and back; a press draws the band;
// keyboard focus draws 「 」; on touch the tag never swings; under reduced motion nothing moves; the language switch
// retitles the spines.
//   node /tmp/fyshot/run.mjs scripts/verify/reading-shelf.mjs      (env: see reading-lib.mjs)
import { url, context, watch, ready, report, sleep } from './reading-lib.mjs';

const ESSAYS = {   // posts-index is newest first: previous = the older essay, next = the newer
  middle: { id: '2025-03-23_hawaii-has-no-anger', prev: '2024-12-18_the-stories-we-live-04', next: '2025-07-27_workplace-vultures' },
  newest: { id: '2026-08-29_google-just-wants-to-coast-to-a-win', prev: '2026-06-21_nobody-likes-me-and-it-must-be-your-fault', next: null },
  oldest: { id: '2015-04-12_notes-on-resurrection-time-and-life-in-flow-and-superposition', prev: null, next: '2015-05-09_go-south-go-south' }
};
const shelf = (p) => p.waitForSelector('.pn-shelf', { timeout: 15000 });
const toEnd = async (p) => { await p.evaluate(() => document.querySelector('.pn').scrollIntoView({ block: 'center' })); await sleep(400); };

// Everything a static look can check, in the page: returns a list of what is wrong
const audit = (p, e) => p.evaluate((e) => {
  const out = [], pn = document.querySelector('.pn'), vw = document.documentElement.clientWidth, href = (id) => 'Reading.dc.html?post=' + id;
  const links = [...pn.querySelectorAll('a.pn-item')].map((a) => a.getAttribute('href')), want = [e.prev, e.next].filter(Boolean).map(href);
  if (JSON.stringify(links.sort()) !== JSON.stringify(want.sort())) out.push('neighbours ' + JSON.stringify(links));
  if (pn.querySelector('a.pn-prev') && pn.querySelector('a.pn-prev').getAttribute('href') !== href(e.prev)) out.push('previous is not the older essay');
  const tag = pn.querySelector('a.pn-tag');
  if (!tag || tag.getAttribute('href') !== 'Writing.dc.html') out.push('the tag does not go back to Writing');
  if (!e.next && !pn.querySelector('.pn-ghost')) out.push('no つづく ghost on the newest');
  if (!e.prev && !pn.querySelector('.pn-prev.pn-quiet .pn-q')) out.push('no note before the oldest');
  if (document.documentElement.scrollWidth > vw) out.push('page overflows');
  pn.querySelectorAll('*').forEach((el) => {
    if (el.closest('svg') && el.tagName !== 'svg') return;
    const b = el.getBoundingClientRect();
    if (b.width && b.height && (b.left < -0.5 || b.right > vw + 0.5)) out.push('outside the window: ' + (el.className.baseVal ?? el.className));
  });
  // text: contrast on the paper it sits on, no overlaps, no label on the plank
  const rgba = (s) => { const n = s.match(/[\d.]+/g).map(Number), srgb = /^color\(srgb/.test(s); return n.slice(0, 3).map((x) => (srgb ? x * 255 : x)).concat([n[3] == null ? 1 : n[3]]); };
  const lum = (c) => { const v = c.map((x) => x / 255).map((x) => (x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4))); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const bg = (el) => { for (let x = el; x; x = x.parentElement) { const c = rgba(getComputedStyle(x).backgroundColor); if (c[3] > .5) return c; } return rgba(getComputedStyle(document.body).backgroundColor); };
  const runs = [], rg = document.createRange(), tw = document.createTreeWalker(pn, NodeFilter.SHOW_TEXT), seen = new Set();
  for (let t = tw.nextNode(); t; t = tw.nextNode()) {
    const el = t.parentElement, cs = getComputedStyle(el);
    if (!t.nodeValue.trim() || cs.display === 'none' || !el.getClientRects().length) continue;
    if (!seen.has(el)) {
      seen.add(el);
      const a = lum(rgba(cs.color)), b = lum(bg(el)), r = (Math.max(a, b) + .05) / (Math.min(a, b) + .05), big = parseFloat(cs.fontSize) >= 24;
      if (r < (big ? 3 : 4.5)) out.push('contrast ' + r.toFixed(2) + ' "' + t.nodeValue.trim().slice(0, 16) + '"');
      if (/^rgb\((217, 105, 90|238, 142, 114|165, 69, 58)\)$/.test(cs.color)) out.push('coral text "' + t.nodeValue.trim().slice(0, 16) + '"');
    }
    if (el.closest('[aria-hidden="true"]')) continue;   // a spine's title is drawn, and clipped by its spine
    rg.selectNodeContents(t); for (const r of rg.getClientRects()) if (r.width > 2 && r.height > 4) runs.push({ el, r, s: t.nodeValue.trim().slice(0, 12) });
  }
  const hit = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 2 && b.top < a.bottom - 2;
  for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
    const A = runs[i], B = runs[j];
    if (A.el !== B.el && !A.el.contains(B.el) && !B.el.contains(A.el) && hit(A.r, B.r)) out.push('text overlaps: "' + A.s + '" × "' + B.s + '"');
  }
  const face = pn.querySelector('.pn-face').getBoundingClientRect().top;
  runs.forEach((o) => { if (o.el.closest('.pn-lab') && o.r.bottom > face + 1) out.push('label on the plank: "' + o.s + '"'); });
  // nothing coral at rest
  pn.querySelectorAll('.tm-hot').forEach((h) => { if (h.style.visibility === 'visible' && parseFloat(h.style.opacity || '1') > .05) out.push('coral line at rest'); });
  // phone: a finger's reach down the middle of every link
  if (vw < 700) pn.querySelectorAll('a').forEach((a) => {
    const b = a.getBoundingClientRect(), x = b.left + b.width / 2; let n = 0;
    for (let y = b.top - 24; y <= b.bottom + 24; y++) { const h = document.elementFromPoint(x, y); if (h && a.contains(h)) n++; }
    if (n < 44) out.push('tap reach ' + n + 'px ' + a.className);
  });
  // the pen's underlines: whatever follows sits ≥ 10 px and ≥ 2 × the drop below (pen-spacing.mjs), transforms off
  const moved = [];
  pn.querySelectorAll('*').forEach((el) => { if (el.closest('svg')) return; const t = getComputedStyle(el).transform; if (t !== 'none') { moved.push([el, el.style.transform, el.style.transition]); el.style.transition = 'none'; el.style.transform = 'none'; } });
  const texts = runs.map((o) => ({ el: o.el, r: o.el.getClientRects()[0] })).filter((o) => o.r);
  pn.querySelectorAll('svg.tm').forEach((svg) => {
    const host = svg.parentElement, line = svg.querySelector('.tm-line').getBoundingClientRect(), target = host.querySelector('[data-pen-t]') || host, drop = +svg.getAttribute('data-drop') || 3;
    if (line.width < 1) return;
    let below = Infinity;
    texts.forEach((o) => { if (target.contains(o.el)) return; const r = o.r; if (r.left < line.right - 1 && r.right > line.left + 1 && r.top > line.top) below = Math.min(below, r.top - line.bottom - 1.1); });
    if (below !== Infinity && (below < 10 || below < 2 * drop)) out.push('pen spacing ' + below.toFixed(1) + 'px under "' + target.textContent.trim().slice(0, 14) + '"');
  });
  moved.forEach(([el, t, tr]) => { el.style.transform = t; el.style.transition = tr; });
  return out;
}, e);

export default async (page, ctx) => {
  const browser = page.context().browser(), rows = [];
  /* ---- every essay, width, theme and language: the static audit ---- */
  for (const [name, e] of Object.entries(ESSAYS)) for (const [w, h] of [[1440, 900], [390, 844]]) for (const theme of ['light', 'dark']) for (const lang of ['zh', 'en']) {
    const errors = [], c = await context(browser, w, h), p = await c.newPage(); watch(p, errors);
    await p.goto(url(e.id, '&lang=' + lang + '&theme=' + theme)); await ready(p); await shelf(p); await toEnd(p);
    const bad = await audit(p, e), tag = name + ' ' + w + ' ' + theme + ' ' + lang;
    rows.push([tag + ': links, layout, contrast, reach, spacing', bad.length === 0, bad.slice(0, 4)]);
    rows.push([tag + ': 0 console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- the states, on the desk ---- */
  {
    const errors = [], c = await context(browser, 1440, 900), p = await c.newPage(); watch(p, errors);
    await p.goto(url(ESSAYS.middle.id, '&lang=zh')); await ready(p); await shelf(p); await toEnd(p);
    const state = (sel, part) => p.evaluate(([sel, part]) => {
      const a = document.querySelector(sel), hot = a.querySelector('.tm-hot'), band = a.querySelector('.tm-band'), fm = [...a.querySelectorAll('.fm-c')];
      return { tier: a.getAttribute('data-pen-tier'), hot: hot.style.visibility === 'visible' && +(hot.style.opacity || 1) > .5, band: band.style.visibility === 'visible',
        focus: fm.length > 0 && fm.every((q) => q.style.visibility === 'visible'), t: getComputedStyle(part ? a.querySelector(part) : a).transform };
    }, [sel, part]);
    const rest = await state('a.pn-next', '.pn-book');
    await p.hover('a.pn-next'); await sleep(900);
    const over = await state('a.pn-next', '.pn-book');
    rows.push(['hover a book: the coral line, and it comes up out of its lean', over.tier === '1' && over.hot && over.t === 'matrix(1, 0, 0, 1, 0, -10)' && rest.t !== over.t, { rest: rest.t, over }]);
    await p.mouse.move(5, 5); await sleep(900);
    rows.push(['let go: no line, back in its lean', (await state('a.pn-next', '.pn-book')).t === rest.t && (await state('a.pn-next')).tier === '0', '']);
    const tag0 = (await state('a.pn-tag')).t;
    await p.hover('a.pn-tag');
    // the swing's baked spring (a linear() easing; Chrome may write each stop with a % after its value)
    const swing = await p.evaluate(() => { const a = document.querySelector('a.pn-tag').getAnimations()[0], t = a && a.effect.getTiming(); const ys = t ? t.easing.slice(7, -1).split(',').map((s) => parseFloat(s)) : []; return t ? { easing: t.easing.slice(0, 7), peak: Math.max(...ys), duration: t.duration } : null; });
    await sleep(1300);
    const up = await state('a.pn-tag');
    rows.push(['hover the tag: a spring with one small overshoot (peak 1–1.2), then square', !!swing && swing.easing === 'linear(' && swing.peak > 1.01 && swing.peak < 1.2 && up.t === 'none' && up.hot, { rest: tag0, swing, up: up.t }]);
    await p.mouse.move(5, 5); await sleep(1400);
    rows.push(['let go: it swings back to hang askew', (await state('a.pn-tag')).t === tag0, '']);
    await p.dispatchEvent('a.pn-prev', 'pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true }); await sleep(450);
    const press = await state('a.pn-prev');
    rows.push(['press: the wheat band', press.tier === '2' && press.band, press.tier]);
    await p.dispatchEvent('a.pn-prev', 'pointerup', { pointerType: 'mouse', button: 0, isPrimary: true }); await p.dispatchEvent('a.pn-prev', 'pointerleave', { pointerType: 'mouse' }); await sleep(900);
    await p.keyboard.press('Tab');
    const kb = {};
    for (const sel of ['a.pn-prev', 'a.pn-next', 'a.pn-tag']) { await p.focus(sel); await sleep(400); kb[sel] = (await state(sel)).focus; }
    rows.push(['keyboard: every link on the shelf gets 「 」', Object.values(kb).every(Boolean), kb]);
    // the language switch retitles the spines
    const st = () => p.evaluate(() => [...document.querySelectorAll('.pn-st')].map((s) => s.textContent + '|' + s.lang));
    const zh = await st(); await p.click('[data-act="lang"]'); await sleep(500); const en = await st();
    rows.push(['the switch retitles the spines', zh.every((s) => s.endsWith('|zh')) && en.every((s) => s.endsWith('|en')) && zh[0] !== en[0], { zh, en }]);
    rows.push(['states: 0 console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- touch: no hover, so the tag just hangs; a press is the pen's ---- */
  {
    const errors = [], c = await context(browser, 390, 844, { touch: true }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(ESSAYS.middle.id)); await ready(p); await shelf(p); await toEnd(p);
    const t0 = await p.evaluate(() => getComputedStyle(document.querySelector('a.pn-tag')).transform);
    await p.dispatchEvent('a.pn-tag', 'pointerenter', { pointerType: 'touch' }); await p.dispatchEvent('a.pn-tag', 'pointerdown', { pointerType: 'touch', button: 0, isPrimary: true }); await sleep(450);
    const r = await p.evaluate(() => { const a = document.querySelector('a.pn-tag'); return { t: getComputedStyle(a).transform, up: a.classList.contains('up'), tier: a.getAttribute('data-pen-tier') }; });
    rows.push(['touch: the tag hangs still, the press draws the band', r.t === t0 && !r.up && r.tier === '2', r]);
    rows.push(['touch: 0 console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  /* ---- reduced motion: nothing moves, the pen still marks ---- */
  {
    const errors = [], c = await context(browser, 1440, 900, { reduced: true }), p = await c.newPage(); watch(p, errors);
    await p.goto(url(ESSAYS.middle.id)); await ready(p); await shelf(p); await toEnd(p);
    const before = await p.evaluate(() => [getComputedStyle(document.querySelector('a.pn-next .pn-book')).transform, getComputedStyle(document.querySelector('a.pn-tag')).transform]);
    await p.hover('a.pn-next'); await sleep(300);
    const book = await p.evaluate(() => [getComputedStyle(document.querySelector('a.pn-next .pn-book')).transform, document.querySelector('a.pn-next').getAttribute('data-pen-tier')]);
    await p.hover('a.pn-tag'); await sleep(300);
    const tag = await p.evaluate(() => [getComputedStyle(document.querySelector('a.pn-tag')).transform, document.querySelector('a.pn-tag').getAttribute('data-pen-tier'), document.querySelector('a.pn-tag').getAnimations().length]);
    rows.push(['reduced motion: the book keeps its lean, the tag hangs, the pen marks both', book[0] === before[0] && tag[0] === before[1] && book[1] === '1' && tag[1] === '1' && tag[2] === 0, { before, book, tag }]);
    rows.push(['reduced motion: 0 console errors', errors.length === 0, errors.slice(0, 3)]);
    await c.close();
  }
  report(ctx.log, rows);
};
