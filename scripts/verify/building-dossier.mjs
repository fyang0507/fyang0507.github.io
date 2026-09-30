// building-dossier.mjs — Building's dossiers (design/2026-09-building, PORT-PLAN §5, PR 1b).
//   node /tmp/fyshot/run.mjs scripts/verify/building-dossier.mjs
//   env: BASE (default http://127.0.0.1:4173/) · SHOTS (screenshot prefix, default /tmp/fyshot/p1b)
// At 1440×900, 390×844 and 360×800:
//   · at rest, every card with chapters peeks with one kraft tab per chapter, numbers only, and once the card is in view
//     (the → button) every tab's number shows, uncovered, inside the cork; the ink on kraft reaches 4.5:1;
//   · a click unpins a card into a modal dialog, its dossier: a row per chapter (its own title and one line) linking
//     where its fore-edge tab links, the figure, status and source; a slip gets one sheet (its lines or note, its figure
//     where it has one) and one tab, to its repository. The tabs stand down the fore-edge at 1440 and on the top edge
//     on phones, overlap nothing and stay inside the window; nothing widens the page; the peek is tucked behind the
//     card; "pin it back" closes the dossier and the card is pinned again;
//   · contrast: tab text ≥ 4.5:1 and the pen's hover line and 「 」 ≥ 3:1 against the computed kraft, every text on the
//     sheet ≥ 4.5:1 against its computed background;
//   · no coral stroke at rest, on the board or in a dossier opened by a click;
// and: keyboard (Enter unpins the card in view; focus starts on "pin it back" and Tab walks pin it back → the rows →
// the repository → the tabs and wraps, Shift+Tab back, every stop with coral 「 」 in its paper's pen, a tab's clear of
// the sheet its edge is tucked under; Esc re-pins and returns focus); a phone's layer scrolls to the end of a tall dossier and the card still flies home to its pin;
// reduced motion shows and closes the dossier at once, nothing on the card or in it animating; every chapter link
// returns 200, and a tab is a plain navigation to its chapter; 0 console or page errors. Exit code 1 on any failure.

const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS || '/tmp/fyshot/p1b';
const CORAL = ['rgb(217, 105, 90)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)', 'rgb(165, 69, 58)'];
const PEN = { cream: 'rgb(217, 105, 90)', kraft: 'rgb(165, 69, 58)' };
const SIZES = [[1440, 900], [390, 844], [360, 800]];

async function open(browser, w, h, opts = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const bad = [];
  page.on('pageerror', (e) => bad.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bad.push('console.error: ' + m.text()); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) bad.push('HTTP ' + r.status() + ' ' + r.url()); });
  await page.goto(BASE + 'Building.dc.html', { waitUntil: 'load' });
  await page.waitForSelector('.cork .slot--lead .stk', { state: 'attached', timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);   // the first-view press and the pendulums settle
  await page.evaluate(() => document.querySelector('.cork').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  return { context, page, bad };
}

// In the page: WCAG contrast of two computed colours, and a text's effective background.
const LIB = () => {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = (c) => { const v = rgb(c).slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  window.__ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
  window.__bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor, a = rgb(c)[3]; if (a === undefined || a > 0.9) return c; } return 'rgb(255, 255, 255)'; };
};

// Coral strokes that show: drawn (not dashed away), in a visible svg, inside `scope`.
const coralShown = (page, scope) => page.evaluate(({ scope, CORAL }) => [...document.querySelectorAll(scope + ' svg path, ' + scope + ' svg circle, ' + scope + ' svg polyline')].filter((p) => {
  const cs = getComputedStyle(p), s = getComputedStyle(p.ownerSVGElement);
  if (cs.visibility === 'hidden' || cs.stroke === 'none' || s.visibility === 'hidden' || s.display === 'none') return false;
  const L = p.getTotalLength ? p.getTotalLength() : 1, off = parseFloat(cs.strokeDashoffset) || 0;
  return CORAL.includes(cs.stroke) && !(cs.strokeDasharray !== 'none' && off >= L);
}).length, { scope, CORAL });

// The board's arrows, card by card, until the whole card is inside the cork.
async function bringIntoView(page, id) {
  for (let i = 0; i < 8; i++) {
    const at = await page.evaluate((id) => { const r = document.querySelector(`.slot[data-id="${id}"]`).getBoundingClientRect(), v = document.querySelector('.cork-viewport').getBoundingClientRect(); return r.left < v.left ? -1 : r.right > v.right ? 1 : 0; }, id);
    if (!at) return true;
    await page.click(`.cork-btn[data-step="${at}"]`); await page.waitForTimeout(1300);
  }
  return false;
}

// The peek of one card: every number shows, uncovered, inside the cork; tabs don't overlap; ink on kraft.
const peekFacts = (page, id) => page.evaluate((id) => {
  const s = document.querySelector(`.slot[data-id="${id}"]`), peek = s.querySelector('.dos-peek'), p = window.BUILDING_PROJECTS.find((x) => x.id === id);
  const v = document.querySelector('.cork-viewport').getBoundingClientRect(), edges = [...peek.querySelectorAll('.dos-edge')], rg = document.createRange();
  peek.style.pointerEvents = 'auto';   // hit-testing only: the peek never takes the pointer
  const out = edges.map((e) => {
    rg.selectNodeContents(e); const t = rg.getBoundingClientRect(), hit = document.elementFromPoint(t.left + t.width / 2, t.top + t.height / 2);
    return { n: e.textContent, inside: t.left >= v.left && t.right <= v.right && t.top >= v.top && t.bottom <= v.bottom, shown: !!hit && e.contains(hit), t: [t.top, t.bottom], ink: window.__ratio(getComputedStyle(e).color, window.__bg(e)) };
  });
  peek.style.pointerEvents = '';
  return { want: p.chapters.map((c) => c.n), out, apart: out.every((o, i) => !i || o.t[0] >= out[i - 1].t[1]) };
}, id);

// The open dossier: its parts against the data, where its tabs sit, and the contrast on kraft and on the sheet.
const dossierFacts = (page, id) => page.evaluate((id) => {
  const p = window.BUILDING_PROJECTS.find((x) => x.id === id), panel = document.querySelector('.unpin-panel'), d = panel.querySelector('.dos'), layer = document.querySelector('.unpin-layer');
  const tabs = [...panel.querySelectorAll('.dos-tab')], rows = [...panel.querySelectorAll('.dos-list a')], abs = (a) => new URL(a, location.href).href;
  const tr = tabs.map((t) => t.getBoundingClientRect()), within = tr.every((r) => r.left >= 0 && r.right <= innerWidth);
  const apart = tr.every((a, i) => tr.every((b, j) => j <= i || a.right <= b.left + 0.5 || b.right <= a.left + 0.5 || a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5));
  const kraft = tabs.map((t) => window.__bg(t)), ink = tabs.map((t, i) => window.__ratio(getComputedStyle(t.querySelector('.pen-t')).color, kraft[i]));
  const sheet = [], w = document.createTreeWalker(panel.querySelector('.dos-sheet'), NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim() && !n.parentElement.closest('svg')) { const el = n.parentElement; sheet.push({ t: n.nodeValue.trim().slice(0, 24), r: window.__ratio(getComputedStyle(el).color, window.__bg(el)) }); }
  const peek = document.querySelector(`.slot[data-id="${id}"] .dos-peek`);
  return {
    dialog: panel.getAttribute('role') === 'dialog' && panel.getAttribute('aria-modal') === 'true' && panel.getAttribute('aria-label') === p.title && !layer.hidden,
    shown: panel.classList.contains('open') && getComputedStyle(d).transform === 'none',
    top: d.classList.contains('dos--top'), one: d.classList.contains('dos--one'),
    rows: rows.map((a) => [a.href, a.querySelector('.dl-t').textContent, a.querySelector('.dl-l').textContent]),
    tabs: tabs.map((a) => [a.href, a.textContent.trim(), a.target, a.dataset.paper]),
    want: p.chapters ? p.chapters.map((c) => [abs(c.href), c.title, c.line, c.n + ' ' + c.tab]) : null,
    repo: p.repo, lines: [...panel.querySelectorAll('.dos-p')].map((x) => x.textContent), wantLines: p.chapters ? [] : (p.lines || [p.note]),
    fig: [...panel.querySelectorAll('.fig-step')].map((x) => x.textContent), wantFig: p.figure ? p.figure.steps : [],
    meta: [...panel.querySelectorAll('.dos-foot .project-meta span')].map((x) => x.textContent),
    within, apart, overflow: Math.max(document.documentElement.scrollWidth - innerWidth, layer.scrollWidth - layer.clientWidth),
    kraft, ink, pen: tabs.map((t, i) => window.__ratio(getComputedStyle(t).getPropertyValue('--pen').trim().replace(/^#(..)(..)(..)$/i, (m, r, g, b) => `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`), kraft[i])),
    sheetLow: sheet.filter((x) => x.r < 4.5), sheetN: sheet.length,
    tucked: peek ? new DOMMatrix(getComputedStyle(peek).transform).m41 <= -20 : null
  };
}, id);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default async (page0, ctx) => {
  const browser = page0.context().browser();
  const fails = [], note = (ok, what) => { ctx.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails.push(what); };
  const hrefs = new Set();

  /* ---- at rest and with each dossier open, by pointer ---- */
  for (const [w, h] of SIZES) {
    const { context, page, bad } = await open(browser, w, h);
    await page.evaluate(LIB);
    const ids = await page.evaluate(() => [...document.querySelectorAll('.cork .slot')].map((s) => [s.dataset.id, s.classList.contains('slot--peek')]));   // in board order
    note(await coralShown(page, '.cork') === 0, `${w}: no coral stroke at rest on the board`);
    if (w !== 360) await page.screenshot({ path: `${SHOTS}-board-${w}.png` });
    for (const [id] of ids.filter((x) => x[1])) {
      note(await bringIntoView(page, id), `${w} ${id}: the card comes into view`);
      const f = await peekFacts(page, id);
      note(same(f.out.map((o) => o.n), f.want), `${w} ${id}: peeks with one tab per chapter, numbers only (${f.out.map((o) => o.n).join(' ')})`);
      note(f.out.every((o) => o.inside && o.shown) && f.apart, `${w} ${id}: every number shows, uncovered, inside the cork, the tabs apart (${JSON.stringify(f.out.map((o) => [o.n, o.inside, o.shown]))})`);
      note(f.out.every((o) => o.ink >= 4.5), `${w} ${id}: peek ink on kraft ≥ 4.5:1 (${[...new Set(f.out.map((o) => o.ink))].join(', ')})`);
      if (w === 390) await page.screenshot({ path: `${SHOTS}-rest-${id}-${w}.png` });
    }
    await page.evaluate(() => document.querySelector('.cork-viewport').focus()); await page.keyboard.press('Home'); await page.waitForTimeout(1400);
    for (const [id, pages] of ids) {
      await bringIntoView(page, id);
      await page.evaluate(() => document.querySelector('.cork').scrollIntoView({ block: 'start' }));
      await page.click(`.slot[data-id="${id}"] .unpin-trigger`);
      await page.waitForTimeout(1500);
      await page.mouse.move(3, 3); await page.waitForTimeout(500);
      const f = await dossierFacts(page, id);
      note(f.dialog && f.shown, `${w} ${id}: a click unpins it into a modal dialog, its dossier out`);
      if (pages) {
        const got = f.rows.map((r, i) => [r[0], r[1], r[2], f.tabs[i] && f.tabs[i][1]]);
        note(same(got, f.want) && f.tabs.every((t, i) => t[0] === f.rows[i][0] && t[3] === 'kraft' && !t[2]), `${w} ${id}: a row per chapter with its title and line, and a kraft tab per chapter linking where its row does`);
        note(same(f.fig, f.wantFig) && f.meta.length >= 2, `${w} ${id}: the figure (${f.fig.join(' → ')}), status and source (${f.meta.join(' / ')})`);
        f.rows.forEach((r) => hrefs.add(r[0]));
      } else {
        note(f.one && f.tabs.length === (f.repo ? 1 : 0) && (!f.repo || (f.tabs[0][0] === f.repo && f.tabs[0][2] === '_blank')), `${w} ${id}: one sheet and one tab, to its repository`);
        note(same(f.lines, f.wantLines) && same(f.fig, f.wantFig), `${w} ${id}: the sheet reads its lines${f.wantFig.length ? ' and its figure' : ''}`);
      }
      note(f.top === (w < 700) && f.within && f.apart && f.overflow <= 0, `${w} ${id}: tabs on the ${f.top ? 'top edge' : 'fore-edge'}, inside the window, overlapping nothing, the page no wider (${f.overflow}px)`);
      note(pages ? f.tucked === true : true, `${w} ${id}: the peek is tucked behind the card`);
      note(f.ink.every((r) => r >= 4.5) && f.pen.every((r) => r >= 3), `${w} ${id}: on kraft ${f.kraft[0]}, tab text ${[...new Set(f.ink)].join('/')}:1 ≥ 4.5, pen ${[...new Set(f.pen)].join('/')}:1 ≥ 3`);
      note(!f.sheetLow.length, `${w} ${id}: every text on the sheet ≥ 4.5:1 (${f.sheetN} runs${f.sheetLow.length ? '; low: ' + JSON.stringify(f.sheetLow) : ''})`);
      note(await coralShown(page, '.unpin-layer') === 0, `${w} ${id}: no coral at rest in the dossier`);
      if (w !== 360 && ['fred-agent', 'njjoe', 'tsugi'].includes(id)) await page.screenshot({ path: `${SHOTS}-${id}-${w}.png` });
      if (id === 'fred-agent') {   // the pen on kraft, drawn: the hover line and 「 」 against the tab's kraft
        const box = await page.evaluate(() => { const r = document.querySelector('.dos-tab').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
        await page.mouse.move(box[0], box[1]); await page.waitForTimeout(700);
        const hot = await page.evaluate(() => { const t = document.querySelector('.dos-tab'), p = t.querySelector('.tm-hot'); return { s: getComputedStyle(p).stroke, v: getComputedStyle(p).visibility, r: window.__ratio(getComputedStyle(p).stroke, window.__bg(t)) }; });
        note(hot.v === 'visible' && hot.s === PEN.kraft && hot.r >= 3, `${w}: hover draws the pen on kraft in --mark-deep (${hot.s}, ${hot.r}:1 ≥ 3)`);
        await page.mouse.move(3, 3); await page.waitForTimeout(500);
      }
      await page.click('.unpin-close');
      await page.waitForTimeout(1500);
      const back = await page.evaluate((id) => { const s = document.querySelector(`.slot[data-id="${id}"]`); return { closed: document.querySelector('.unpin-layer').hidden, home: !s.classList.contains('unpinned') && s.contains(s.querySelector('.swing')), peek: !s.querySelector('.dos-peek.out') }; }, id);
      note(back.closed && back.home && back.peek, `${w} ${id}: pin it back closes the dossier and pins the card again`);
    }
    note(!bad.length, `${w}: 0 errors, every request 200${bad.length ? ' — ' + bad.join(' ; ') : ''}`);
    await context.close();
  }

  /* ---- keyboard: Enter, the Tab loop and its 「 」, Esc ---- */
  for (const [w, h, id] of [[1440, 900, 'fred-agent'], [390, 844, 'njjoe']]) {
    const { context, page, bad } = await open(browser, w, h);
    await bringIntoView(page, id);
    await page.evaluate(() => document.querySelector('.cork-viewport').focus());
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1400);
    const stop = () => page.evaluate(() => {
      const el = document.activeElement, fm = [...el.querySelectorAll(':scope > svg.fm path.fm-c')];
      const kind = el.matches('.unpin-close') ? 'close' : el.matches('.dos-list a') ? 'row' : el.matches('.dos-tab') ? 'tab' : el.matches('.github-link') ? 'repo' : 'outside: ' + el.className;
      // a tab sits under the sheet: neither bracket may be drawn where the sheet covers it
      const sh = document.querySelector('.unpin-panel .dos-sheet').getBoundingClientRect(), under = (r) => r.left < sh.right - 0.5 && r.right > sh.left + 0.5 && r.top < sh.bottom - 0.5 && r.bottom > sh.top + 0.5;
      const hidden = kind === 'tab' && fm.some((p) => under(p.getBoundingClientRect()));
      return { kind, drawn: fm.length === 2 && fm.every((p) => getComputedStyle(p).visibility === 'visible') && !hidden, stroke: fm[0] ? getComputedStyle(fm[0]).stroke : '' };
    });
    const first = await stop(), p = await page.evaluate((id) => window.BUILDING_PROJECTS.find((x) => x.id === id), id);
    note(first.kind === 'close' && (await page.evaluate(() => document.querySelector('.unpin-panel').getAttribute('aria-label'))) === p.title, `${w}: Enter unpins ${p.title}, the card in view, focus on pin it back`);
    const want = ['close'].concat(p.chapters.map(() => 'row'), p.repo ? ['repo'] : [], p.chapters.map(() => 'tab'), ['close']);
    const seen = [first];
    for (let i = 1; i < want.length; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(220); seen.push(await stop()); }
    note(same(seen.map((s) => s.kind), want), `${w}: Tab walks ${want.join(' → ')} (${seen.map((s) => s.kind).join(' → ')})`);
    note(seen.every((s) => s.drawn && s.stroke === (s.kind === 'tab' ? PEN.kraft : PEN.cream)), `${w}: every stop draws coral 「 」, --mark-deep on kraft (${[...new Set(seen.map((s) => s.kind + ' ' + s.stroke + (s.drawn ? '' : ' undrawn')))].join(' · ')})`);
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(220);
    note((await stop()).kind === 'tab', `${w}: Shift+Tab from pin it back wraps to the last tab`);
    if (w === 1440) await page.screenshot({ path: `${SHOTS}-focus-tab-${w}.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
    const back = await page.evaluate((id) => ({ closed: document.querySelector('.unpin-layer').hidden, focus: document.activeElement === document.querySelector(`.slot[data-id="${id}"] .unpin-trigger`) }), id);
    note(back.closed && back.focus, `${w}: Esc pins it back and returns focus to the card`);
    note(!bad.length, `${w} keyboard: 0 errors${bad.length ? ' — ' + bad.join(' ; ') : ''}`);
    await context.close();
  }

  /* ---- a short window: the layer scrolls to the end of the dossier, and the card still flies home to its pin ---- */
  {
    const { context, page, bad } = await open(browser, 390, 844);
    await page.click('.slot--lead .unpin-trigger'); await page.waitForTimeout(1500);
    const s = await page.evaluate(() => { const l = document.querySelector('.unpin-layer'); l.scrollTop = l.scrollHeight; return { tall: l.scrollHeight > l.clientHeight + 20, top: l.scrollTop }; });
    await page.waitForTimeout(200);
    const last = await page.evaluate(() => { const r = [...document.querySelectorAll('.unpin-panel .github-link')].pop().getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0; });
    note(s.tall && s.top > 0 && last, `390: a tall dossier scrolls the layer (${s.top}px) to its last link`);
    await page.evaluate(() => {   // the paper's box every frame: at the hand-over from the layer to its slot it must not jump
      const s = document.querySelector('.slot--lead'), sw = document.querySelector('.unpin-fly .swing'), f = window.__fly = [];
      (function tick() { const r = sw.getBoundingClientRect(); f.push([s.contains(sw), r.left, r.top]); if (!s.contains(sw) || f.length < 3) requestAnimationFrame(tick); })();
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(1600);
    const home = await page.evaluate(() => {
      const s = document.querySelector('.slot--lead'), f = window.__fly, k = f.findIndex((x, i) => i && x[0] && !f[i - 1][0]);
      return { home: !s.classList.contains('unpinned') && s.contains(s.querySelector('.swing')), jump: k > 0 ? +Math.hypot(f[k][1] - f[k - 1][1], f[k][2] - f[k - 1][2]).toFixed(1) : null };
    });
    note(home.home && home.jump !== null && home.jump < 4, `390: after the scroll the card flies home to its pin, no jump as it lands (${home.jump}px)`);
    note(!bad.length, '390 scroll: 0 errors' + (bad.length ? ' — ' + bad.join(' ; ') : ''));
    await context.close();
  }

  /* ---- reduced motion: the dossier at once, nothing animating; closed at once ---- */
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { context, page, bad } = await open(browser, w, h, { rm: true });
    await page.click('.slot--lead .unpin-trigger'); await page.waitForTimeout(120);
    const r = await page.evaluate(() => { const p = document.querySelector('.unpin-panel'), d = p.querySelector('.dos'); return { open: p.classList.contains('open'), still: getComputedStyle(d).transform === 'none', running: document.getAnimations().filter((a) => a.playState === 'running' && a.effect.target && a.effect.target.closest('.unpin-layer, .slot--lead .swing, .slot--lead .board-pin')).length, tucked: new DOMMatrix(getComputedStyle(document.querySelector('.slot--lead .dos-peek')).transform).m41 }; });
    note(r.open && r.still && r.running === 0 && r.tucked <= -20, `${w} reduced motion: the dossier is out at once, nothing on the card or in it animating (${JSON.stringify(r)})`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(120);
    const c = await page.evaluate(() => ({ closed: document.querySelector('.unpin-layer').hidden, running: document.getAnimations().filter((a) => a.playState === 'running' && a.effect.target && a.effect.target.closest('.unpin-layer, .slot--lead .swing, .slot--lead .board-pin')).length }));
    note(c.closed && c.running === 0, `${w} reduced motion: Esc closes it at once (${JSON.stringify(c)})`);
    note(!bad.length, `${w} reduced motion: 0 errors${bad.length ? ' — ' + bad.join(' ; ') : ''}`);
    await context.close();
  }

  /* ---- the chapters: every link 200, and a tab is a plain navigation ---- */
  {
    const { context, page, bad } = await open(browser, 1440, 900);
    const codes = [];
    for (const u of hrefs) codes.push([u.replace(BASE, ''), (await page.request.get(u)).status()]);
    note(codes.length >= 8 && codes.every((c) => c[1] === 200), `every chapter link returns 200 (${codes.map((c) => c[1] + ' ' + c[0]).join(', ')})`);
    await page.click('.slot--lead .unpin-trigger'); await page.waitForTimeout(1500);
    const before = bad.slice();   // the chapter pages' own errors are theirs (vt-nav covers them)
    const [res] = await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.dos-tab:nth-child(2)')]);
    note(res && res.status() === 200 && page.url() === BASE + 'building/fred-agent/system.html', `a tab goes straight to its chapter (${page.url().replace(BASE, '')}, ${res && res.status()})`);
    note(!before.length, 'chapters: 0 errors on the board' + (before.length ? ' — ' + before.join(' ; ') : ''));
    await context.close();
  }

  ctx.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  if (fails.length) process.exitCode = 1;
};
