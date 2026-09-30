// vt-project-load.mjs — the Building board ↔ a project's pages and its chapters under load, in Chromium with the
// back/forward cache on: CPU slowed (Emulation.setCPUThrottlingRate), the HTTP cache off (request interception turns it
// off), and one render-blocking file of the page you land on held back, as a slow phone on a slow network has it.
//   node /tmp/fyshot/run.mjs scripts/verify/vt-project-load.mjs
//   env: VT_ORIGIN (:4173) · VT_W (1440,390) · CPU (4) · HOLD (300 ms) · STALL (4500 ms; 0 skips the stall)
// The race it guards: Chrome decides whether the page you land on takes the move from the @view-transition opt-in it
// read when <body> went in, unless the page is restyled before its first frame. With the opt-in in a linked sheet, the
// moves ran only because site.js measured the nav before that frame; a late render-blocking file let the frame win,
// and the move was a hard cut with an uncaught "Transition was skipped" (Chrome rejects the move's ready itself). So:
//   · every move (the way in by a dossier tab and by a card's own link, Fred Agent's and NJJoe's; a chapter later and
//     earlier; the way back to the board), its landing page's own stylesheet or transitions.js held HOLD ms: the page
//     takes it (its kind; ready resolves; it finishes) and lands: no name left on, the chapter it went to current; back
//     on the board the card is inside the cork and its pin pushed in once;
//   · a move the page you land on can't take (a chapter move whose fy-vt is gone): a hard cut, no page error;
//   · a stall past Chrome's own 4 s limit (the page's stylesheet held STALL ms): a hard cut Chrome makes before any
//     script of ours has run, and the same end state, the card pinned without a press. Chrome reports that skip as an
//     uncaught "Transition was skipped" no script can reach (a minimal two-page site does the same); counted apart;
//   · no console or page error anywhere else.
// Read late on purpose: vt-lib's hook() reads every move's ready at pagereveal, which would handle the rejection this
// check is looking for, so here the page keeps the transition and its promises are read a second after the landing.
import { ORIGIN, check, bfcache } from './vt-lib.mjs';

const B = ORIGIN + '/', CPU = +(process.env.CPU || 4), HOLD = +(process.env.HOLD || 300), STALL = +(process.env.STALL ?? 4500);
const FA = 'building/fred-agent/', NJP = 'building/njjoe/', NJ = '.slot[data-id="njjoe"]', FAS = '.slot[data-id="fred-agent"]';
const FAC = 'lib/fred-agent/fred-agent.css', NJC = 'lib/njjoe/njjoe.css', BC = 'lib/building/building.css', TJ = 'lib/shared/transitions.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (page, sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
const toNJJoe = async (p) => { await p.focus('.cork-viewport'); await p.keyboard.press('ArrowRight'); await sleep(2000); };
const inHand = (card) => async (p) => { await click(p, card + ' .swing'); await p.waitForSelector('.dos-tabs .dos-tab', { state: 'visible' }); await sleep(1500); };
const MOVES = [
  ['in · a dossier tab', { from: 'Building.dc.html', prep: inHand(FAS), go: '.dos-tabs .dos-tab:nth-child(3)', url: /principles/, kind: 'in', hold: FAC }],
  ['in · the card\'s own link', { from: 'Building.dc.html', go: FAS + ' .project-cta', url: /fred-agent\/$/, kind: 'in', hold: TJ }],
  ['NJJoe in · its own link', { from: 'Building.dc.html', prep: toNJJoe, go: NJ + ' .featured-cta', url: /njjoe\/$/, kind: 'in', hold: NJC }],
  ['NJJoe in · a dossier tab', { from: 'Building.dc.html', prep: async (p) => { await toNJJoe(p); await inHand(NJ)(p); }, go: '.dos-tabs .dos-tab:nth-child(2)', url: /microsite/, kind: 'in', hold: TJ }],
  ['chapter · later', { from: FA + 'index.html', go: '.pj-tabs a[href*="principles"]', url: /principles/, kind: 'chapter', hold: FAC }],
  ['chapter · earlier', { from: FA + 'principles.html', go: '.pj-tabs a[href*="system"]', url: /system/, kind: 'chapter', hold: TJ }],
  ['NJJoe chapter · later', { from: NJP + 'index.html', go: '.pj-tabs a[href*="apa"]', url: /apa/, kind: 'chapter', hold: NJC }],
  ['out · the way back', { from: FA + 'components.html', go: '.pj-back', url: /Building/, kind: 'out', hold: BC, card: 'fred-agent' }],
  ['NJJoe out · the way back', { from: NJP + 'apa.html', go: '.pj-back', url: /Building/, kind: 'out', hold: TJ, card: 'njjoe' }]
];

// what each page reports: the move it was offered (kept, its promises unread), the kind transitions.js gave it, pins
function init() {
  if (sessionStorage.getItem('vt-drop') === '1') sessionStorage.removeItem('fy-vt');   // the record this page would take, gone
  addEventListener('pagereveal', (e) => {
    sessionStorage.removeItem('vt-drop');
    window.__rv = { vt: !!e.viewTransition, kind: null };
    window.__vtObj = e.viewTransition || null;
    requestAnimationFrame(() => { window.__rv.kind = document.documentElement.getAttribute('data-vt'); });   // transitions.js's, set at pagereveal
  });
  const animate = Element.prototype.animate;
  window.__pins = [];
  Element.prototype.animate = function (k, o) { if (this.classList && this.classList.contains('board-pin')) window.__pins.push(this.closest('.slot').dataset.id); return animate.call(this, k, o); };
}
// the move's promises, read now (a second after it landed): ready 'ok' or its rejection, and whether it has finished
const settle = (page) => page.evaluate(async () => {
  const v = window.__vtObj, st = (p) => Promise.race([p.then(() => 'ok', (e) => e.name + ': ' + e.message), new Promise((r) => setTimeout(() => r('pending'), 50))]);
  return Object.assign({}, window.__rv, v ? { ready: await st(v.ready), fin: await st(v.finished) } : {});
});
// where the move left the page: names on, the current chapter, the card in the cork and its pin
const landed = (page, card) => page.evaluate((card) => {
  const names = document.querySelectorAll('.fy-vt-tabs, .fy-vt-card, .fy-vt-sheet').length, cur = document.querySelector('.pj-tabs [aria-current="page"]');
  const out = { names, current: cur ? new URL(cur.href).pathname.replace(/.*\/|index\.html$/g, '') || 'index' : null };
  if (card) {
    const v = document.querySelector('.cork-viewport').getBoundingClientRect(), s = document.querySelector(`.slot[data-id="${card}"]`), b = [s, s.querySelector('.dos-peek')].map((n) => n.getBoundingClientRect());
    Object.assign(out, { l: Math.round(Math.min(...b.map((x) => x.left)) - v.left), r: Math.round(Math.max(...b.map((x) => x.right)) - v.right), pin: getComputedStyle(s.querySelector('.board-pin')).visibility, pressed: window.__pins.filter((id) => id === card).length });
  }
  return out;
}, card);
const inCork = (a) => a.l >= 0 && a.r <= 0 && a.pin === 'visible';

export default async (_page, ctx) => {
  const res = [], errs = [], chrome = [], browser = await bfcache();
  ctx.log(`${B} · CPU ${CPU}× · the landing page's file held ${HOLD} ms · stall ${STALL} ms`);
  for (const w of (process.env.VT_W || '1440,390').split(',').map(Number)) {
    const c = await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 } }), page = await c.newPage(), T = (n) => w + ' ' + n;
    let hold = null, at = '', held = false;
    await c.addInitScript(init);
    // every request through here, so the HTTP cache is off; the one file held is the page you land on's
    await c.route('**/*', async (route) => {
      const h = hold;
      if (h && route.request().url().includes(h.file)) { hold = null; held = true; await sleep(h.ms); }
      route.continue().catch(() => {});
    });
    page.on('pageerror', (e) => (/^Transition was skipped/.test(e.message) && at.startsWith('stall') ? chrome : errs).push(T(at) + ': pageerror ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(T(at) + ': ' + m.text()); });
    const cdp = await c.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const go = async (m, ms, name) => {
      at = name;
      await page.goto(B + m.from, { waitUntil: 'load', timeout: 30000 }); await sleep(1500);
      if (m.prep) await m.prep(page);
      if (m.drop) await page.evaluate(() => sessionStorage.setItem('vt-drop', '1'));
      held = false; hold = { file: m.hold, ms };
      await click(page, m.go);
      await page.waitForURL(m.url, { timeout: 20000, waitUntil: 'commit' });
      await page.waitForFunction(() => window.__rv, null, { timeout: 20000 });
      await sleep(2500);
      if (m.card && ms < 1000) await page.waitForFunction((id) => window.__pins.includes(id), m.card, { timeout: 4000 }).catch(() => {});
      return Object.assign(await settle(page), { held });
    };

    for (const [name, m] of MOVES) {
      const r = await go(m, HOLD, name), a = await landed(page, m.card), want = String(m.url).match(/principles|system|apa|microsite/);
      check(res, T(name + `: taken with ${m.hold.replace(/.*\//, '')} ${HOLD} ms late, kind ${m.kind}, ready resolves, it finishes`), r.held && r.vt && r.kind === m.kind && r.ready === 'ok' && r.fin === 'ok', r);
      const ok = !a.names && (m.card ? inCork(a) && a.pressed === 1 : a.current === (want ? want[0] + '.html' : 'index'));
      check(res, T(name + ': lands' + (m.card ? ', the card inside the cork, its pin pushed in once' : ' on the chapter it went to') + ', no name left on'), ok, a);
    }

    // a move the page you land on can't take: its fy-vt record gone, so FYProject can't say which chapter it left
    {
      const m = MOVES.find(([n]) => n === 'chapter · later')[1];
      const r = await go(Object.assign({}, m, { drop: true }), 0, 'no record · chapter · later'), a = await landed(page);
      check(res, T('no record · a chapter move the page can\'t take: a hard cut it skips itself, landed, no page error'), r.vt && !r.kind && /^AbortError/.test(r.ready) && !a.names && a.current === 'principles.html' && !errs.some((e) => e.includes('no record')), Object.assign(r, a));
    }

    // a stall past Chrome's 4 s: Chrome skips the move before any script of ours has run
    if (STALL) for (const name of ['in · the card\'s own link', 'out · the way back']) {
      const m = MOVES.find(([n]) => n === name)[1], stall = Object.assign({}, m, { hold: m.card ? BC : FAC });
      const r = await go(stall, STALL, 'stall · ' + name); await sleep(1000);
      const a = await landed(page, m.card);
      check(res, T(`stall · ${name}, ${stall.hold.replace(/.*\//, '')} ${STALL} ms late: a hard cut, landed` + (m.card ? ', the card inside the cork and pinned, no press' : '') + ', no name left on'), r.held && !r.vt && !a.names && (m.card ? inCork(a) && a.pressed === 0 : a.current === 'index'), Object.assign(r, a));
    }
    await c.close();
  }
  await browser.close();
  if (STALL) ctx.log(`Chrome's own report of the stalled moves it skipped (not ours to catch): ${chrome.length}` + (chrome.length ? ' · ' + chrome[0] : ''));
  check(res, 'no console or page errors (the stalls\' own skip report apart)', errs.length === 0, errs.slice(0, 6));
  const bad = res.filter((x) => !x.ok);
  ctx.log(`vt-project-load: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
