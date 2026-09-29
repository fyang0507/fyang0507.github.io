// building-board.mjs — Building's corkboard, static and keyboard criteria (PORT-PLAN §2 P2-building, §5).
//   node /tmp/fyshot/run.mjs scripts/verify/building-board.mjs
//   env: BASE (default http://127.0.0.1:4173/) · SHOTS (screenshot prefix, default /tmp/fyshot/p2b)
// At 1440×900, 390×844 and 360×800: 0 console errors, every request 200, no /design/, posts.js or font
// masters, no horizontal overflow, the project count, the F1 flower on the lead card with an ink pin, no
// arrow element, no coral stroke at rest, every interactive element reaching coral 「 」 by keyboard,
// the dialog (Enter unpins, Tab stays inside, Esc re-pins and returns focus), and reduced motion (no
// running animation after settle, the flower present, hover does nothing). Exit code 1 on any failure.

const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS || '/tmp/fyshot/p2b';
const CORAL = ['rgb(217, 105, 90)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)'];
const INK = 'rgb(51, 48, 43)';

async function open(browser, w, h, opts = {}) {
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: opts.rm ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const bad = [];
  page.on('pageerror', (e) => bad.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') bad.push('console.error: ' + m.text()); });
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && !u.endsWith('favicon.ico')) bad.push('HTTP ' + r.status() + ' ' + u);
    if (u.includes('/design/')) bad.push('requests /design/: ' + u);
    if (/\/content\/posts\.js/.test(u)) bad.push('requests posts.js');
    if (/\/fonts\/[^/]+\.woff2/.test(u)) bad.push('requests a font master: ' + u);
  });
  if (process.env.BUILDING_PRE) await (await import(process.env.BUILDING_PRE)).devSetup(page);
  await page.goto(BASE + 'Building.dc.html', { waitUntil: 'load' });
  await page.waitForSelector('.cork .slot--lead .stk', { state: 'attached', timeout: 10000 });
  await page.waitForTimeout(1800);   // fonts, the first-view press and the pendulums settle
  return { context, page, bad };
}

const staticFacts = (page) => page.evaluate(({ CORAL, INK }) => {
  const $ = (s) => document.querySelector(s), lead = $('.cork .slot--lead');
  const vis = (el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
  const coralStrokes = [...document.querySelectorAll('.cork svg path, .cork svg circle, .cork svg polyline')].filter((p) => {
    const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || cs.stroke === 'none' || !vis(p.ownerSVGElement)) return false;
    const L = p.getTotalLength ? p.getTotalLength() : 1, off = parseFloat(cs.strokeDashoffset) || 0;
    return CORAL.includes(cs.stroke) && !(cs.strokeDasharray !== 'none' && off >= L);
  }).length;
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    count: ($('[data-project-count]') || {}).textContent || '', projects: (window.BUILDING_PROJECTS || []).length, slots: document.querySelectorAll('.cork .slot').length,
    flower: !!(lead && lead.querySelector('.wm-mark .stk') && vis(lead.querySelector('.stk'))),
    leadPin: lead ? getComputedStyle(lead.querySelector('.pin-head')).fill === INK : false,
    arrow: document.querySelectorAll('svg.pt, .pt-s').length,
    coralStrokes
  };
}, { CORAL, INK });

// Tab through the page; for every focus stop inside the board or its dialog, is a coral 「 」 drawn?
async function focusWalk(page, limit = 40) {
  const miss = [], seen = [];
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.evaluate(() => { const h = document.querySelector('#building-title'); h.tabIndex = -1; h.focus(); });
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(260);
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.closest('.cork, .unpin-layer')) return { out: true };
      const fm = [...el.querySelectorAll(':scope > svg.fm path.fm-c')];
      const drawn = fm.length === 2 && fm.every((p) => getComputedStyle(p).visibility === 'visible');
      return { name: (el.getAttribute('aria-label') || el.textContent || el.className).trim().slice(0, 40), drawn, stroke: fm[0] ? getComputedStyle(fm[0]).stroke : '' };
    });
    if (r.out) { if (seen.length) break; continue; }
    seen.push(r.name);
    if (!r.drawn || !CORAL.includes(r.stroke)) miss.push(r.name);
  }
  return { seen, miss };
}

export default async (page0, ctx) => {
  const browser = page0.context().browser();
  const fails = [], note = (ok, what) => { ctx.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails.push(what); };

  for (const [w, h] of [[1440, 900], [390, 844], [360, 800]]) {
    const { context, page, bad } = await open(browser, w, h);
    const f = await staticFacts(page);
    note(f.overflow <= 0, `${w}: no horizontal overflow (${f.overflow}px)`);
    note(f.slots === f.projects && f.count.includes(f.projects + ' 件'), `${w}: data-project-count "${f.count}" = ${f.projects} projects on the board`);
    note(f.flower, `${w}: F1 flower on the lead card`);
    note(f.leadPin, `${w}: lead pin is ink`);
    note(f.arrow === 0, `${w}: no arrow element`);
    note(f.coralStrokes === 0, `${w}: no coral stroke at rest in the board (${f.coralStrokes})`);
    await page.evaluate(() => document.querySelector('.cork').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}-board-${w}.png` });
    {
      const fw = await focusWalk(page);
      note(fw.seen.length >= 8 && !fw.miss.length, `${w}: keyboard reaches ${fw.seen.length} stops, each with coral 「 」${fw.miss.length ? ' — missing: ' + fw.miss.join(' | ') : ''}`);
      ctx.log('     stops: ' + fw.seen.join(' · '));
    }
    note(!bad.length, `${w}: 0 errors, all requests 200, nothing from /design/, no posts.js, no font masters${bad.length ? ' — ' + bad.join(' ; ') : ''}`);
    await context.close();
  }

  // The dialog, by keyboard: Enter on the lead title unpins; Tab stays in the note; Esc pins it back and returns focus.
  {
    const { context, page, bad } = await open(browser, 1440, 900);
    await page.evaluate(() => { const t = document.querySelector('.slot--lead .unpin-trigger'); t.focus(); });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    const opened = await page.evaluate(() => {
      const el = document.activeElement, fm = [...el.querySelectorAll(':scope > svg.fm path.fm-c')];
      return { layer: !document.querySelector('.unpin-layer').hidden, modal: document.querySelector('.unpin-panel[role=dialog][aria-modal=true]') !== null, inside: !!el.closest('.unpin-panel'),
        brackets: fm.length === 2 && fm.every((p) => getComputedStyle(p).visibility === 'visible') };
    });
    note(opened.layer && opened.modal && opened.inside && opened.brackets, `Enter unpins the lead card into a modal dialog, focus inside with coral 「 」 (${JSON.stringify(opened)})`);
    await page.screenshot({ path: `${SHOTS}-dialog-1440.png` });
    let trapped = true;
    for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement.closest('.unpin-panel')))) trapped = false; }
    note(trapped, 'Tab stays inside the field note');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
    const back = await page.evaluate(() => ({ closed: document.querySelector('.unpin-layer').hidden, home: !document.querySelector('.slot--lead').classList.contains('unpinned'), focus: document.activeElement === document.querySelector('.slot--lead .unpin-trigger') }));
    note(back.closed && back.home && back.focus, 'Esc pins it back and returns focus to the title');
    note(!bad.length, 'dialog run: 0 errors' + (bad.length ? ' — ' + bad.join(' ; ') : ''));
    await context.close();
  }

  // Reduced motion: nothing runs after settle, the flower is simply there, hover and re-pin do nothing.
  for (const [w, h] of [[1440, 900], [390, 844], [360, 800]]) {
    const { context, page, bad } = await open(browser, w, h, { rm: true });
    await page.waitForTimeout(100);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    const f = await staticFacts(page);
    if (w === 1440) {
      const b = await page.evaluate(() => { const r = document.querySelector('.slot--lead .highlighted-title').getBoundingClientRect(); return [r.x + 40, r.y + 20]; });
      await page.mouse.move(b[0], b[1]); await page.waitForTimeout(60);
    }
    const afterHover = await page.evaluate(() => document.querySelectorAll('.cork .stk').length && document.querySelector('.cork .stk').getAnimations({ subtree: true }).length);
    note(running === 0 && f.flower && !afterHover, `${w} reduced motion: ${running} running animations, flower present, hover presses nothing`);
    note(!bad.length, `${w} reduced motion: 0 errors` + (bad.length ? ' — ' + bad.join(' ; ') : ''));
    await context.close();
  }

  ctx.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
  if (fails.length) process.exitCode = 1;
};
