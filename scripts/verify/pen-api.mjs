// pen-api.mjs — the P1-pen success criteria (PORT-PLAN §2), on scripts/verify/pen-harness.html, and Pen.annotate:
// its layer adds no layout box, hide() never sweeps a stroke through, show() right after it draws (no pop).
//   node /tmp/fyshot/run.mjs scripts/verify/pen-api.mjs        (exit code 1 if any check fails)
// Screenshots: /tmp/fyshot/p1pen-*.png

const URL = (process.env.PEN_BASE || 'http://127.0.0.1:4173/') + 'scripts/verify/pen-harness.html';
const CORAL = 'rgb(217, 105, 90)', CORK = 'rgb(203, 94, 73)', WHEAT = 'rgb(200, 94, 71)', HL = 'rgb(220, 207, 152)';

// Before any page script: remember the window's keys, and count rAF callbacks that actually run.
function instrument() {
  Object.defineProperty(window, '__k0', { value: Object.keys(window), enumerable: false });
  let n = 0;
  const raf = window.requestAnimationFrame.bind(window);
  Object.defineProperty(window, '__raf', { get: () => n, set: (v) => { n = v; }, enumerable: false });
  window.requestAnimationFrame = (cb) => raf((t) => { n++; cb(t); });
}

// The coral and wheat layers of one wired host, as the eye would see them.
function layers(sel) {
  const h = document.querySelector(sel), hot = h.querySelector('.tm-hot'), band = h.querySelector('.tm-band'), fm = [...h.querySelectorAll('.fm-c')];
  const cs = getComputedStyle(hot), shown = (p) => getComputedStyle(p).visibility !== 'hidden';
  return {
    tier: h.getAttribute('data-pen-tier'), coral: shown(hot) && +cs.opacity > 0.01, opacity: +(+cs.opacity).toFixed(2), stroke: cs.stroke, width: cs.strokeWidth,
    band: shown(band), bandFill: getComputedStyle(band).fill, focus: fm.length ? fm.every(shown) : false, focusStroke: fm.length ? getComputedStyle(fm[0]).stroke : ''
  };
}

// The underline's local y at its start vs baseline + max(3, .18em), with the host's rotation removed
// only for the independent measurement.
function hangs([hostSel, targetSel]) {
  const host = document.querySelector(hostSel), t = targetSel ? host.querySelector(targetSel) : host;
  const keep = host.style.transform; host.style.transform = 'none';
  const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  t.appendChild(probe);
  const base = probe.getBoundingClientRect().top - host.getBoundingClientRect().top - host.clientTop; probe.remove();
  host.style.transform = keep;
  const fs = parseFloat(getComputedStyle(t).fontSize), want = base + Math.max(3, fs * 0.18);
  const g = host.querySelector('svg.tm g'), ty = +(g.getAttribute('transform').match(/translate\([^ ]+ ([^)]+)\)/) || [0, 0])[1];
  const got = host.querySelector('.tm-line').getPointAtLength(0).y + ty;
  return { want: +want.toFixed(2), got: +got.toFixed(2), diff: +Math.abs(got - want).toFixed(2), rotated: getComputedStyle(host).transform !== 'none' };
}

export default async (page, ctx) => {
  const results = [];
  const check = (name, ok, detail) => { results.push([name, !!ok]); ctx.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); };
  await page.addInitScript(instrument);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(URL);
  await page.waitForSelector('html[data-ready]');
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(600);

  const g = await page.evaluate(() => Object.keys(window).filter((k) => window.__k0.indexOf(k) < 0).sort());
  check('globals: only Motion, Pen, TierMark, FocusMark, Tier', g.filter((k) => k !== 'HX').join() === 'FocusMark,Motion,Pen,Tier,TierMark', g.join(', '));

  // hover → coral 2.2 px var(--pen)
  await page.hover('[data-f="travel"]'); await page.waitForTimeout(700);
  let s = await page.evaluate(layers, '[data-f="travel"]');
  check('hover draws a coral 2.2px line in var(--pen)', s.tier === '1' && s.coral && s.stroke === CORAL && s.width === '2.2px' && !s.band, JSON.stringify(s));
  await page.screenshot({ path: '/tmp/fyshot/p1pen-hover.png', clip: { x: 0, y: 40, width: 900, height: 220 } });

  // choose → wheat band, no coral at rest
  await page.mouse.down(); await page.waitForTimeout(120);
  await page.screenshot({ path: '/tmp/fyshot/p1pen-sweep.png', clip: { x: 0, y: 40, width: 900, height: 220 } });
  await page.mouse.up(); await page.waitForTimeout(700); await page.mouse.move(1, 1); await page.waitForTimeout(500);
  s = await page.evaluate(layers, '[data-f="travel"]');
  const prev = await page.evaluate(layers, '[data-f="all"]');
  check('choose leaves a wheat band with no coral stroke at rest', s.tier === '2' && s.band && s.bandFill === HL && !s.coral && prev.tier === '0' && !prev.band, JSON.stringify(s));
  await page.screenshot({ path: '/tmp/fyshot/p1pen-chosen.png', clip: { x: 0, y: 40, width: 900, height: 220 } });

  // un-choose under the pointer → the line warms back to coral
  await page.hover('#toggle'); await page.waitForTimeout(500); await page.click('#toggle'); await page.waitForTimeout(800);
  const on = await page.evaluate(layers, '#toggle');
  await page.click('#toggle'); await page.waitForTimeout(90);
  const mid = await page.evaluate(layers, '#toggle');
  await page.waitForTimeout(600);
  s = await page.evaluate(layers, '#toggle');
  check('un-choosing under the pointer warms the line back', on.band && !on.coral && mid.opacity > 0 && mid.opacity < 1 && s.tier === '1' && s.coral && s.opacity === 1 && !s.band, `chosen ${JSON.stringify([on.band, on.coral])} · mid opacity ${mid.opacity} · after ${JSON.stringify([s.tier, s.coral, s.band])}`);
  await page.mouse.move(1, 1); await page.waitForTimeout(400);

  // keyboard focus → coral 「 」 (and a mouse press never draws them)
  await page.click('h1'); await page.keyboard.press('Tab'); await page.waitForTimeout(400);
  s = await page.evaluate(layers, '[data-f="all"]');
  check(':focus-visible shows coral 「 」', s.focus && s.focusStroke === CORAL, JSON.stringify([s.focus, s.focusStroke]));
  await page.keyboard.press('Tab'); await page.waitForTimeout(300);
  const left = await page.evaluate(layers, '[data-f="all"]');
  await page.mouse.click(1, 1); await page.click('[data-f="poem"]'); await page.waitForTimeout(400);
  const mouseFocus = await page.evaluate(layers, '[data-f="poem"]');
  check('「 」 leave with focus, and a pointer press never draws them', !left.focus && !mouseFocus.focus, JSON.stringify([left.focus, mouseFocus.focus]));
  await page.focus('#toggle'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  const plain = await page.evaluate(() => { const b = document.querySelector('#plain'); return [document.activeElement === b, b.matches(':focus-visible'), getComputedStyle(b).outlineStyle, b.hasAttribute('data-pen-focus')]; });
  check('focus:false keeps the browser focus ring (no 「 」, no outline removed)', plain[0] && plain[1] && plain[2] !== 'none' && !plain[3], JSON.stringify(plain));
  await page.mouse.click(1, 1);

  // per-paper coral
  const papers = await page.evaluate(() => [getComputedStyle(document.querySelector('.cork')).getPropertyValue('--pen').trim(), getComputedStyle(document.querySelector('#card')).getPropertyValue('--pen').trim()]);
  const card = await page.$('#card'); await card.scrollIntoViewIfNeeded(); await page.hover('#card'); await page.waitForTimeout(700);
  const cs = await page.evaluate(layers, '#card');
  await page.hover('#scroll'); await page.waitForTimeout(600);
  const ss = await page.evaluate(layers, '#scroll');
  check('data-paper=cork|wheat resolves --pen to #CB5E49 / #C85E47', papers[0] === '#CB5E49' && papers[1] === '#C85E47' && cs.stroke === WHEAT && ss.stroke === CORK, JSON.stringify([papers, cs.stroke, ss.stroke]));
  await page.hover('#card'); await page.waitForTimeout(600);
  await card.screenshot({ path: '/tmp/fyshot/p1pen-rotated.png' });
  await page.mouse.move(1, 1); await page.waitForTimeout(300);

  // baseline hang, on a 3° host and a level one
  const rot = await page.evaluate(hangs, ['#card', '.ct .t']), lvl = await page.evaluate(hangs, ['#twin', null]), ann = await page.evaluate(() => {
    const el = document.querySelector('#ann'), p = document.createElement('span'); p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(p); const base = p.getBoundingClientRect().top - el.getBoundingClientRect().top; p.remove();
    const want = base + Math.max(3, parseFloat(getComputedStyle(el).fontSize) * 0.18), got = el.querySelector('svg path').getPointAtLength(0).y;
    return { want: +want.toFixed(2), got: +got.toFixed(2), diff: +Math.abs(got - want).toFixed(2) };
  });
  check('on a host rotated 3°, underline y = baseline + max(3, .18em) ± .5px', rot.rotated && rot.diff <= 0.5 && lvl.diff <= 0.5 && ann.diff <= 0.5, `rotated ${JSON.stringify(rot)} · level ${JSON.stringify(lvl)} · annotate ${JSON.stringify(ann)}`);

  // seeded, stable strokes
  const d1 = await page.evaluate(() => [document.querySelector('[data-f="travel"] .tm-line').getAttribute('d'), document.querySelector('#twin .tm-line').getAttribute('d'), document.querySelector('#card .tm-line').getAttribute('d')]);
  await page.reload(); await page.waitForSelector('html[data-ready]'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
  const d2 = await page.evaluate(() => [document.querySelector('[data-f="travel"] .tm-line').getAttribute('d'), document.querySelector('#card .tm-line').getAttribute('d')]);
  check('the same text gives an identical path d (and again after reload)', d1[0] === d1[1] && d1[0] === d2[0] && d1[2] === d2[1] && d1[0] !== d1[2]);

  // reduced motion switched on mid-gesture finishes the tweens
  await page.hover('[data-f="stories"]'); await page.mouse.down(); await page.waitForTimeout(60);
  const before = await page.evaluate(() => { const v = HX.w.stories.mark.v; return [+v.sw.toFixed(2), Motion.tween.busy(v)]; });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(20);
  const after = await page.evaluate(() => { const v = HX.w.stories.mark.v; return [v.sw, v.E, Motion.tween.busy(v), Motion.reduced()]; });
  await page.mouse.up(); await page.waitForTimeout(100);
  await page.hover('[data-f="poem"]'); await page.waitForTimeout(30);
  const instant = await page.evaluate(() => { const v = HX.w.poem.mark.v; return [v.E, Motion.tween.busy(v)]; });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check('toggling emulated reduced motion finishes in-flight tweens', before[1] && before[0] < 1 && after[0] === 1 && after[1] === 1 && !after[2] && after[3] && instant[0] === 1 && !instant[1], `before ${before} · after ${after} · next hover under rm ${instant}`);

  // an idle page costs nothing
  await page.mouse.move(1, 1); await page.waitForTimeout(1200);
  await page.evaluate(() => { window.__raf = 0; });
  await page.waitForTimeout(2000);
  const idle = await page.evaluate(() => window.__raf);
  const loop = await page.evaluate(async () => {
    let ticks = 0; const L = Motion.Loop(() => ++ticks < 6); L.kick();
    await new Promise((r) => setTimeout(r, 300)); window.__raf = 0; await new Promise((r) => setTimeout(r, 500));
    return [ticks, window.__raf, L.running];
  });
  check('Loop runs 0 rAF callbacks over 2s when idle', idle === 0 && loop[0] === 6 && loop[1] === 0 && !loop[2], `page idle ${idle} · loop ticks ${loop[0]}, then ${loop[1]} callbacks, running ${loop[2]}`);

  const se = await page.evaluate(() => { const e = Motion.springEase(300, 20.8, 1); return [CSS.supports('animation-timing-function', e), Motion.springEase.duration(300, 20.8, 1)]; });
  check("CSS.supports('animation-timing-function', springEase(...))", se[0], `settles in ${se[1]} ms`);

  // Pen.annotate on a word made for each check: HX.vis is the stroke's visible fraction, HX.sample [ms, fraction] per frame
  await page.evaluate(() => {
    HX.vis = (a) => { const p = a.svg.querySelector('path'), L = p.getTotalLength(), o = parseFloat(getComputedStyle(p).strokeDashoffset) || 0; return Math.max(0, Math.min(L, L - o) - Math.max(0, -o)) / L; };
    HX.sample = (a, ms, t0 = performance.now()) => new Promise((done) => { const s = []; (function f() { s.push([Math.round(performance.now() - t0), +HX.vis(a).toFixed(3)]); if (performance.now() - t0 < ms) requestAnimationFrame(f); else done(s); })(); });
    HX.word = (css) => { const el = document.createElement('span'); el.textContent = 'annotated'; el.style.cssText = 'position:absolute;top:120px;font:16px/1.3 var(--text);' + css; document.body.appendChild(el); return el; };
    HX.frames = (n) => new Promise((r) => { (function f(k) { if (k) requestAnimationFrame(() => f(k - 1)); else r(); })(n); });
  });
  const wide = await page.evaluate(async () => {
    const el = HX.word('right:8px'), a = Pen.annotate(el, 'loop', { manual: true }); a.show(); await HX.frames(2);
    const b = a.svg.getBoundingClientRect(), r = [document.documentElement.scrollWidth, innerWidth, Math.round(b.width) + 'x' + Math.round(b.height)];
    a.destroy(); el.remove(); return r;
  });
  check('annotate adds no layout box: a loop at the right edge leaves the page as wide as the window', wide[0] === wide[1], `scrollWidth ${wide[0]} · window ${wide[1]} · svg ${wide[2]}`);

  const hides = await page.evaluate(async () => {
    const el = HX.word('left:40px'), a = Pen.annotate(el, 'loop', { manual: true, duration: 400 }), max = (s) => Math.max(...s.map((x) => x[1])), o = {};
    await HX.frames(3); a.hide(); o.never = max(await HX.sample(a, 300));
    a.rebuild(); a.hide(); o.rebuiltNew = max(await HX.sample(a, 300));
    a.show(); await new Promise((r) => setTimeout(r, 600)); a.hide(); const end = await HX.sample(a, 500); o.shownEnd = end[end.length - 1][1];
    a.rebuild(); a.hide(); o.rebuilt = max(await HX.sample(a, 300));
    a.show(); await new Promise((r) => setTimeout(r, 120)); const at = HX.vis(a); a.hide(); o.mid = [+at.toFixed(3), max(await HX.sample(a, 300))];
    a.destroy(); el.remove(); return o;
  });
  check('hide() never sweeps a stroke through: never shown, rebuilt or half drawn, it shows no more than it did',
    hides.never === 0 && hides.rebuiltNew === 0 && hides.rebuilt === 0 && hides.shownEnd === 0 && hides.mid[1] <= hides.mid[0] + 0.02,
    `max shown: never shown ${hides.never} · rebuilt before a show ${hides.rebuiltNew} · rebuilt after a hide ${hides.rebuilt} · half drawn ${hides.mid[0]} → ${hides.mid[1]} · a shown stroke ends at ${hides.shownEnd}`);

  // show() straight after annotate() draws over its 400 ms (nothing past 90% in the first half), and a box that
  // changes mid-draw rebuilds without popping the stroke in whole; under reduced motion the stroke is whole at once
  const draws = await page.evaluate(async () => {
    const early = (s) => s.filter((x) => x[0] < 200).map((x) => x[1]), o = {};
    let el = HX.word('left:40px'), a = Pen.annotate(el, 'loop', { manual: true, duration: 400 }); a.show();
    let s = await HX.sample(a, 520); o.fresh = { early: Math.max(...early(s)), mid: s.some((x) => x[1] > 0 && x[1] < 0.9), end: s[s.length - 1][1] };
    a.destroy(); el.remove();
    el = HX.word('left:40px'); a = Pen.annotate(el, 'loop', { manual: true, duration: 400 }); await HX.frames(3);
    const t0 = performance.now(); a.show(); await new Promise((r) => setTimeout(r, 120));
    const p0 = a.svg.querySelector('path'); el.style.width = el.offsetWidth + 24 + 'px';
    s = await HX.sample(a, 400, t0); o.resized = { rebuilt: a.svg.querySelector('path') !== p0, early: Math.max(...early(s)), end: s[s.length - 1][1] };
    a.destroy(); el.remove(); return o;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = await page.evaluate(async () => {
    const el = HX.word('left:40px'), a = Pen.annotate(el, 'loop', { manual: true, duration: 400 }); a.show();
    const s = await HX.sample(a, 120); a.hide(); const off = HX.vis(a); a.destroy(); el.remove();
    return { on: Math.min(...s.map((x) => x[1])), off };
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const f = draws.fresh, z = draws.resized;
  check('show() right after annotate() draws the stroke, a mid-draw resize carries the draw on, and reduced motion is whole at once',
    f.early <= 0.9 && f.mid && f.end === 1 && z.rebuilt && z.early <= 0.9 && z.end === 1 && still.on === 1 && still.off === 0,
    `fresh: max ${f.early} in the first 200 ms, ends ${f.end} · resized at 120 ms: rebuilt ${z.rebuilt}, max ${z.early} in the first 200 ms, ends ${z.end} · reduced: ${still.on} shown, ${still.off} after hide`);

  // destroy leaves nothing behind
  const gone = await page.evaluate(() => { HX.w.twin.destroy(); const h = document.querySelector('#twin'); return [h.querySelectorAll('svg').length, h.hasAttribute('data-pen-tier'), h.hasAttribute('data-pen-t'), h.hasAttribute('data-pen-focus')]; });
  check('destroy() removes its layers and attributes', gone[0] === 0 && !gone[1] && !gone[2] && !gone[3], JSON.stringify(gone));

  // touch: a tap is tier 2 at once (the 0 → 2 gesture) and leaves no hover behind
  const tc = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const tp = await tc.newPage(); await tp.goto(URL); await tp.waitForSelector('html[data-ready]'); await tp.waitForTimeout(400);
  await tp.tap('[data-f="poem"]'); await tp.waitForTimeout(700);
  const tap = await tp.evaluate(() => [...document.querySelectorAll('[data-f]')].map((b) => b.dataset.f + ':' + b.getAttribute('data-pen-tier')).join(' '));
  await tp.tap('#more .t'); await tp.waitForTimeout(900);
  const tapMore = await tp.evaluate(() => document.querySelector('#more').getAttribute('data-pen-tier'));
  await tc.close();
  check('touch: a tap chooses at once and leaves no hover (a momentary tap sinks back to 0)', tap === 'all:0 travel:0 stories:0 poem:2' && tapMore === '0', tap + ' · more:' + tapMore);

  const failed = results.filter((r) => !r[1]).length;
  ctx.log(`pen-api: ${results.length - failed}/${results.length} passed`);
  if (failed) process.exitCode = 1;
};
