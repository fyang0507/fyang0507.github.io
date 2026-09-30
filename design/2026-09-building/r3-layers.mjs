// design/2026-09-building · round 3 · the layering check for C's moves (Fred, on Q2: "the order of layer should be correct
// at the first place"). Run from the repo root, with the repository served:
//   VT_ORIGIN=http://127.0.0.1:4193 node /tmp/fyshot/run.mjs design/2026-09-building/r3-layers.mjs    env: R3_BEFORE=1
// Each move is frozen as soon as r3-vt.js has built it (vt-lib.mjs's hook and seek) and posed every 40 ms from 0 to its
// end. At each pose, wherever a tab's group is drawn over the card's (their boxes intersect), the card must be its own
// group with a higher z-index, so the tabs that end under the card are under it in every frame, not only after it:
//   · the way back (NJJoe → board, the board bringing NJJoe into view), at 1440 and 390;
//   · the direct link's flight (Q8 a) and the way in from the dossier in your hand, at 1440 and 390;
//   · a chapter move, where nothing covers a tab at rest, so the tabs may draw over everything (checked at rest).
// R3_BEFORE=1 removes the card's name first (what round 3 shipped before the fix), to show the check catches it.
// Shots of the way back at its most-overlapped pose: /tmp/r3-layers-<w>-<before|after>.png
import { hook, seek, drawn, check } from '../../scripts/verify/vt-lib.mjs';

const B = (process.env.VT_ORIGIN || 'http://127.0.0.1:4193') + '/design/2026-09-building/', BEFORE = process.env.R3_BEFORE === '1';
const TABS = [1, 2, 3, 4, 5].map((n) => 'pj-tab-' + n), CARD = 'pj-board-card';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

async function frozen(page, go) {
  await page.evaluate(() => sessionStorage.setItem('vt-freeze', '1'));
  await go();
  await page.waitForFunction(() => window.__vt && window.__vt.ready, null, { timeout: 8000 });
  return page.evaluate(() => Math.max(...window.__vt.anims.map((a) => a.dur)));
}
// every pose of a frozen move: which tabs overlap the card, and whether the card is drawn above them there
async function poses(page, part, end) {
  const out = [];
  for (let t = 0; t <= end + 1; t += 40) {
    await seek(page, t);
    const info = await page.evaluate(([tabs, card]) => {
      const html = document.documentElement, has = (n) => document.getAnimations().some((a) => a.effect && /^::view-transition-(group|old|new|image-pair)\(/.test(a.effect.pseudoElement || '') && a.effect.pseudoElement.endsWith('(' + n + ')'));   // a group that only enters or leaves has no group animation of its own
      const z = (n) => { const v = getComputedStyle(html, '::view-transition-group(' + n + ')').zIndex; return v === 'auto' ? 0 : +v; };
      return { present: tabs.filter(has), card: has(card), z: Object.fromEntries(tabs.concat(card).map((n) => [n, z(n)])) };
    }, [TABS, CARD]);
    const box = await drawn(page, info.present.concat(info.card ? [CARD] : []), part);
    // without a group of its own the card is part of the page's snapshot, which every group draws above
    // (on the board it is where the page lays it out; on a project page the card isn't in the document, so a move in
    // without the card's group has nothing to measure against, and says so)
    const cardBox = info.card ? box[CARD] : await page.evaluate(() => { const c = document.querySelector('.slot[data-id="njjoe"] .swing'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    if (!cardBox) { out.push({ t, over: ['no card group'], cover: 0, tabs: info.present.length }); continue; }
    const over = info.present.filter((n) => area(box[n], cardBox) > 1 && !(info.card && info.z[CARD] > info.z[n]));
    const cover = info.present.reduce((s, n) => s + area(box[n], cardBox), 0);
    out.push({ t, over, cover, tabs: info.present.length });
  }
  return out;
}
const summary = (ps) => { const bad = ps.filter((p) => p.over.length); return { poses: ps.length, withOverlap: ps.filter((p) => p.cover > 1).length, tabsAbove: bad.length, firstBad: bad[0] ? bad[0].t + ' ms: ' + bad[0].over.join(',') : '-' }; };

export default async (page, ctx) => {
  const res = [], c = page.context();
  await hook(c, TABS.concat(CARD));
  if (BEFORE) await c.addInitScript(() => { const s = new CSSStyleSheet(); s.replaceSync('.r3-card{view-transition-name:none!important}'); document.adoptedStyleSheets = [s]; });
  ctx.log((BEFORE ? 'BEFORE the fix' : 'with the fix') + ' · ' + B);
  for (const w of [1440, 390]) {
    await page.setViewportSize({ width: w, height: w > 500 ? 900 : 844 });
    // the way back: in by NJJoe's direct link, then back
    await page.goto(B + 'r3-board.html?q2=a&q8=a&q7=a', { waitUntil: 'load' }); await sleep(900);
    await page.evaluate(() => document.querySelector('.slot[data-id="njjoe"] .featured-cta').click());
    await page.waitForURL(/r3-njjoe/); await sleep(1200);
    let end = await frozen(page, () => page.evaluate(() => document.querySelector('.pj-back').click()));
    let ps = await poses(page, 'new', end), s = summary(ps);
    check(res, `${w} way back: no tab drawn over the card it ends under`, !s.tabsAbove && s.withOverlap, s);
    const worst = ps.filter((p) => p.cover > 1).sort((a, b) => b.cover - a.cover)[0] || ps[Math.floor(ps.length / 2)];
    await seek(page, worst.t);
    await ctx.shot(`/tmp/r3-layers-${w}-${BEFORE ? 'before' : 'after'}.png`);
    await seek(page, end + 50); await sleep(400);
    // the direct link's flight: the peeking tabs come out from under the card
    await page.goto(B + 'r3-board.html?q2=a&q8=a', { waitUntil: 'load' }); await sleep(900);
    end = await frozen(page, () => page.evaluate(() => document.querySelector('.slot[data-id="fred-agent"] .project-cta').click()));
    s = summary(await poses(page, 'old', end));
    check(res, `${w} direct link: no tab drawn over the card it starts under`, !s.tabsAbove, s);
    // the way in from the dossier in your hand
    await page.goto(B + 'r3-board.html?q2=a&q8=a', { waitUntil: 'load' }); await sleep(900);
    await page.evaluate(() => document.querySelector('.slot[data-id="fred-agent"] .swing').click()); await sleep(1600);
    end = await frozen(page, () => page.evaluate(() => document.querySelector('.dos-tabs .dos-tab').click()));
    s = summary(await poses(page, 'old', end));
    check(res, `${w} dossier way in: no tab drawn over the card in your hand`, !s.tabsAbove, s);
    // a chapter move: at rest nothing covers a tab, so tabs above the sheet in the move match the settled page
    await page.goto(B + 'r3-overview.html', { waitUntil: 'load' }); await sleep(700);
    await page.evaluate(() => document.querySelector('.pj-tabs a[href*="r3-principles"]').click());
    await page.waitForURL(/r3-principles/); await sleep(1500);
    const covered = await page.evaluate(() => [...document.querySelectorAll('.pj-tabs > a')].filter((a) => { const r = a.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false; const e = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width * .6), r.top + r.height / 2); return e && !a.contains(e); }).map((a) => a.textContent.trim()));
    check(res, `${w} chapter move: nothing covers a tab at rest`, !covered.length, covered.length ? covered : 'every tab on top');
  }
  const bad = res.filter((r) => !r.ok);
  ctx.log(`r3-layers: ${res.length - bad.length}/${res.length} pass`);
  if (bad.length) process.exitCode = 1;
};
