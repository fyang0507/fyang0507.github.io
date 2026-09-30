// project-map.mjs — System's map, drawn by the pen (design/2026-09-building, PORT-PLAN §7, PR 2; lib/fred-agent/map.js).
//   node /tmp/fyshot/run.mjs scripts/verify/project-map.mjs
//   env: BASE (default http://127.0.0.1:4173/) · SHOTS (screenshot prefix, default /tmp/fyshot/pjmap)
// At 1440 (three columns, handles → protocols → outcomes, the links side to side) and 390 (stacked in that order, the
// links running down), with motion and with reduced motion:
//   · at rest nothing is coral: every pen stroke is hidden past its cap, no module is on a path, the explainer rests;
//   · hovering a module draws exactly its path's links in the pen's coral, dims the modules off it, and inks its rails;
//     leaving retracts them;
//   · a click locks it: pressed and expanded, banded (tier 2), its links cooled to the band's edge, the explainer open
//     with its title; a second module is not pressed;
//   · Escape clears it and takes the focus to "Clear path"; keyboard focus on a module traces its path;
//   · Tab walks the modules in the order they read, handles → protocols → outcomes, top to bottom in each (DOM order
//     is reading order: no CSS order);
//   · reduced motion lands every state at once (no stroke animation runs);
//   · 0 console or page errors. Exit code 1 on any failure.
const BASE = process.env.BASE || 'http://127.0.0.1:4173/';
const SHOTS = process.env.SHOTS || '/tmp/fyshot/pjmap';
const URL_ = BASE + 'building/fred-agent/system.html';
const CORAL = ['rgb(217, 105, 90)', 'rgb(165, 69, 58)', 'rgb(203, 94, 73)', 'rgb(200, 94, 71)'];
const res = [];
const check = (name, ok, detail) => { res.push({ name, ok: !!ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  · ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// the map's state: which links the pen shows (and in what), the path, the locked module, the explainer
const state = (page) => page.evaluate((CORAL) => {
  const edges = [...document.querySelectorAll('.map-edge')].map((e) => e.dataset.from + '>' + e.dataset.to);
  const hot = [...document.querySelectorAll('.ml-hot')].map((p, i) => {
    const cs = getComputedStyle(p), off = parseFloat(cs.strokeDashoffset) || 0;
    return { e: edges[i], shown: off < p.getTotalLength() - 0.5, stroke: cs.stroke, cool: p.classList.contains('cool') };
  });
  const probe = document.createElement('i'); probe.style.color = 'var(--hl-ink)'; document.body.appendChild(probe);
  const wheat = getComputedStyle(probe).color; probe.remove();
  const nodes = [...document.querySelectorAll('.map-node')];
  return {
    shown: hot.filter((h) => h.shown).map((h) => h.e).sort(), coralShown: hot.filter((h) => h.shown && CORAL.includes(h.stroke)).length,
    wheatShown: hot.filter((h) => h.shown && h.stroke === wheat && h.cool).length,
    path: nodes.filter((n) => n.classList.contains('is-path')).map((n) => n.dataset.nodeId).sort(),
    dim: nodes.filter((n) => +getComputedStyle(n).opacity < 0.5).length, total: nodes.length,
    pressed: nodes.filter((n) => n.getAttribute('aria-pressed') === 'true').map((n) => n.dataset.nodeId),
    expanded: nodes.filter((n) => n.getAttribute('aria-expanded') === 'true').map((n) => n.dataset.nodeId),
    banded: nodes.filter((n) => n.getAttribute('data-pen-tier') === '2').map((n) => n.dataset.nodeId),
    rails: [...document.querySelectorAll('.map-rail.is-path')].map((r) => r.dataset.railId).sort(),
    title: document.querySelector('[data-detail-title]').textContent, open: document.querySelector('.map-detail').classList.contains('is-open'),
    running: document.getAnimations().filter((a) => a.effect && a.effect.target && a.effect.target.classList && a.effect.target.classList.contains('ml-hot') && a.playState === 'running').length,
    focus: document.activeElement && document.activeElement.matches('[data-map-clear]'),
    cols: getComputedStyle(document.querySelector('.map')).display === 'grid'
  };
}, CORAL);
// the path fred-agent.js always traced: an outcome back through its protocol to its handles, a handle forward to what
// it enables, a protocol both ways
const expect = (page, id) => page.evaluate((id) => {
  const E = [...document.querySelectorAll('.map-edge')].map((e) => ({ from: e.dataset.from, to: e.dataset.to }));
  const layer = document.querySelector(`[data-node-id="${id}"]`).dataset.layer, ids = new Set([id]);
  const inc = (x) => E.filter((e) => e.to === x), out = (x) => E.filter((e) => e.from === x);
  if (layer === 'use-case') inc(id).forEach((e) => { ids.add(e.from); inc(e.from).forEach((d) => ids.add(d.from)); });
  else if (layer === 'workflow') { inc(id).forEach((e) => ids.add(e.from)); out(id).forEach((e) => ids.add(e.to)); }
  else out(id).forEach((e) => { ids.add(e.to); out(e.to).forEach((o) => ids.add(o.to)); });
  return { nodes: [...ids].sort(), edges: E.filter((e) => ids.has(e.from) && ids.has(e.to)).map((e) => e.from + '>' + e.to).sort() };
}, id);
// every link leaves a module and arrives at the next layer's: to its right in columns, below it when stacked
const geometry = (page) => page.evaluate(() => [...document.querySelectorAll('.map-edge')].every((e) => {
  const a = document.querySelector(`[data-node-id="${e.dataset.from}"]`).getBoundingClientRect(), b = document.querySelector(`[data-node-id="${e.dataset.to}"]`).getBoundingClientRect();
  return getComputedStyle(document.querySelector('.map')).display === 'grid' ? a.right <= b.left : a.bottom <= b.top;
}));

export default async (page) => {
  const browser = page.context().browser();
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const rm of [false, true]) {
      const tag = w + (rm ? ' reduced' : '');
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: rm ? 'reduce' : 'no-preference' });
      const p = await ctx.newPage(), errors = [];
      p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
      p.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });
      await p.goto(URL_, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready); await sleep(1200);
      await p.evaluate(() => document.querySelector('.map').scrollIntoView({ block: 'center' })); await sleep(400);
      let s = await state(p);
      check(tag + ': at rest no pen stroke shows, no module on a path, the explainer rests', s.shown.length === 0 && s.path.length === 0 && !s.open && s.pressed.length === 0, s);
      check(tag + ': the links run ' + (s.cols ? 'left to right, column to column' : 'down, layer to layer'), await geometry(p) && s.cols === (w > 760), s.cols);
      const want = await expect(p, 'c-outreach');
      await p.hover('[data-node-id="c-outreach"]'); await sleep(rm ? 100 : 700);
      s = await state(p);
      check(tag + ': hovering Outreach draws its path\'s links in coral, dims the rest, inks its rails', s.shown.join() === want.edges.join() && s.coralShown === want.edges.length && s.path.join() === want.nodes.join() && s.dim === s.total - want.nodes.length && s.rails.join() === 'attention,evidence,state,time', { shown: s.shown.length, want: want.edges.length, coral: s.coralShown, path: s.path.length, dim: s.dim, rails: s.rails });
      if (rm) check(tag + ': reduced motion: no stroke animation runs', s.running === 0, s.running);
      await p.mouse.move(2, 2); await sleep(rm ? 100 : 500);
      s = await state(p);
      check(tag + ': leaving retracts them', s.shown.length === 0 && s.path.length === 0, s.shown);
      const lock = await expect(p, 'u-house');
      await p.click('[data-node-id="u-house"]'); await sleep(rm ? 150 : 900);
      s = await state(p);
      const title = await p.evaluate(() => document.querySelector('[data-node-id="u-house"]').dataset.title);
      check(tag + ': a click locks it: pressed, expanded, banded, its links cooled to the band\'s edge, the explainer open', s.pressed.join() === 'u-house' && s.expanded.join() === 'u-house' && s.banded.join() === 'u-house' && s.wheatShown === lock.edges.length && s.coralShown === 0 && s.open && s.title === title, { pressed: s.pressed, banded: s.banded, wheat: s.wheatShown, want: lock.edges.length, coral: s.coralShown, title: s.title });
      await p.screenshot({ path: `${SHOTS}-locked-${w}${rm ? '-rm' : ''}.png` });
      await p.keyboard.press('Escape'); await sleep(rm ? 150 : 600);
      s = await state(p);
      check(tag + ': Escape clears it and takes the focus to "Clear path"', s.pressed.length === 0 && s.banded.length === 0 && !s.open && s.title === 'Click any module' && s.shown.length === 0 && s.focus, { pressed: s.pressed, open: s.open, shown: s.shown.length, focus: s.focus });
      const walk = [];   // where each module is on the page, not in the window: Tab scrolls
      await p.focus('[data-map-clear]');
      for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); walk.push(await p.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return { id: a.dataset.nodeId || a.className, layer: a.dataset.layer, x: r.left + scrollX, y: r.top + scrollY }; })); }
      const layers = ['capability', 'workflow', 'use-case'], rank = walk.map((n) => layers.indexOf(n.layer));
      const reads = rank.every((r, i) => r >= 0 && (!i || r > rank[i - 1] || (r === rank[i - 1] && walk[i].y > walk[i - 1].y)));
      const cols = walk.every((n, i) => !i || rank[i] === rank[i - 1] || (s.cols ? n.x > walk[i - 1].x : n.y > walk[i - 1].y));
      check(tag + ': Tab walks the modules as they read, handles → protocols → outcomes', reads && cols && walk.length === 14, walk.map((n) => n.id).join(' '));
      await p.keyboard.press('Escape'); await p.mouse.move(2, 2); await sleep(rm ? 150 : 500);
      await p.focus('[data-node-id="p-intake"]');
      await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(rm ? 150 : 700);   // focus-visible, from the keyboard
      const traced = await expect(p, 'p-intake');
      s = await state(p);
      check(tag + ': keyboard focus on a module traces its path', s.shown.join() === traced.edges.join(), { shown: s.shown.length, want: traced.edges.length });
      await p.keyboard.press('Tab'); await p.mouse.move(2, 2); await p.evaluate(() => document.activeElement.blur()); await sleep(rm ? 150 : 600);
      s = await state(p);
      check(tag + ': no coral at rest once it clears', s.coralShown === 0 && s.shown.length === 0, s.coralShown);
      check(tag + ': 0 console or page errors', errors.length === 0, errors.slice(0, 3));
      await ctx.close();
    }
  }
  const failed = res.filter((r) => !r.ok);
  console.log(failed.length ? `\n${failed.length} FAILED of ${res.length}` : `\nALL PASSED (${res.length})`);
  if (failed.length) process.exitCode = 1;
};
