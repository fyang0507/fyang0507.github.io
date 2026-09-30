// gallery-phone.mjs — Gallery at 390 and 360 with touch (CDP): one swipe line per clothesline, vertical scroll still
// works, tap unclips, swipe in the viewer, a tap on a gliding line only stops it, stringing to all 107, idle loop;
// and the chips wait for the page's faces (Fraunces held back 1.5 s).
//   node /tmp/fyshot/run.mjs scripts/verify/gallery-phone.mjs
import { open, load, settle, rafOver, overflow, requestAudit, Report } from './gallery-lib.mjs';

async function swipe(cdp, x, y, dx, dy, speed = 900) {
  await cdp.send('Input.synthesizeScrollGesture', { x, y, xDistance: dx, yDistance: dy, speed, gestureSourceType: 'touch', repeatCount: 1 });
}
async function drag(cdp, x, y, dx, ms = 180) {
  const n = 10;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / n, y }] }); await new Promise((r) => setTimeout(r, ms / n)); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
const line = (p, k) => p.evaluate((k) => {
  const s = document.querySelectorAll('.mline')[k], sc = s.querySelector('.mscroll'), r = sc.getBoundingClientRect();
  return { y: r.top + r.height * 0.55, x: r.left + r.width / 2, sl: sc.scrollLeft, cw: sc.clientWidth, top: s.getBoundingClientRect().top };
}, k);

export default async (page, ctx) => {
  // The gallery is built in its own faces (lib/gallery/app.js): with Fraunces held back, the chips wait for it
  // rather than wrap in a fallback and re-wrap when it lands, and Plex Mono and Caveat are in too.
  {
    const R = Report(ctx, 'faces');
    const { ctx: bc, page: p } = await open(page, { width: 390, height: 844, touch: true });
    await bc.route(/fraunces[^?]*\.woff2$/i, async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); await r.continue(); });
    await bc.addInitScript(() => new MutationObserver((l, mo) => {
      if (!document.querySelector('.g-chip')) return;
      mo.disconnect(); window.__faces = ['15px Fraunces', '11px "IBM Plex Mono"', '15px Caveat'].map((f) => document.fonts.check(f));
    }).observe(document, { childList: true, subtree: true }));
    await load(p);
    const f = await p.evaluate(() => window.__faces);
    R.ok('with Fraunces held back 1.5 s, the chips are built once it, Plex Mono and Caveat are in', !!f && f.every(Boolean), JSON.stringify(f));
    R.done();
    await bc.close();
  }
  for (const [W, H] of [[390, 844], [360, 780]]) {
    const R = Report(ctx, String(W));
    const { ctx: bc, page: p, errors, requests } = await open(page, { width: W, height: H, touch: true });
    const cdp = await bc.newCDPSession(p);
    await load(p);
    R.ok('phone layout', await p.evaluate(() => document.querySelector('.g-root').dataset.mode === 'phone'));
    R.ok('settles', await settle(p, 10000));
    let o = await overflow(p); R.ok('no horizontal overflow', o.sw <= o.iw, o.sw + ' ≤ ' + o.iw);
    const snap = await p.evaluate(() => [...document.querySelectorAll('.mscroll')].map((s) => getComputedStyle(s).scrollSnapType));
    R.ok('every line is scroll-snap-type: x mandatory', snap.length >= 3 && snap.every((s) => s === 'x mandatory'), snap.join(', '));

    // tap the next print, peeking in at the right edge of line 1 (never seen): it develops in the hand
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.mline').getBoundingClientRect().top + scrollY - 40));
    await p.waitForTimeout(300);
    const pk = await p.evaluate(() => { const b = document.querySelector('.mline').querySelectorAll('.print')[1], r = b.getBoundingClientRect();
      return { x: (r.left + innerWidth) / 2, y: r.top + r.height * 0.45, undev: b.classList.contains('undev'), vis: +((innerWidth - r.left) / r.width).toFixed(2) }; });
    await p.touchscreen.tap(pk.x, pk.y);
    await p.waitForTimeout(4500);
    const pd = await p.evaluate(() => ({ chem: getComputedStyle(document.querySelector('.vw .fly-chem')).opacity, hi: document.querySelector('.vw .fly-hi').classList.contains('on') }));
    const pb = await rafOver(p, 1000);
    R.ok('the peeking, unseen print develops in the viewer and the loop sleeps', pk.undev && pd.chem === '0' && pd.hi && pb === 0, (pk.vis * 100).toFixed(0) + '% visible · chemical ' + pd.chem + ', 2560 on ' + pd.hi + ', ' + pb + ' rAF in 1 s');
    await p.touchscreen.tap(W / 2, H / 2);
    await p.waitForFunction(() => document.querySelector('.vw').hidden, null, { timeout: 6000 }).catch(() => {});
    await settle(p);
    const big0 = requests.filter((u) => /-2560\.jpg$/.test(u)).length;

    // bring the first line up, then swipe it sideways
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.mline').getBoundingClientRect().top + scrollY - 40));
    await p.waitForTimeout(300);
    let L = await line(p, 0);
    const tf0 = await p.evaluate(() => [...document.querySelector('.mline').querySelectorAll('.hang')].map((h) => h.style.transform));
    const y0 = await p.evaluate(() => scrollY);
    await swipe(cdp, L.x + 80, L.y, -260, 0, 1200);
    const tf1 = await p.evaluate(() => [...document.querySelector('.mline').querySelectorAll('.hang')].map((h) => h.style.transform));
    await settle(p);
    const after = await p.evaluate(() => {
      const s = document.querySelector('.mline'), sc = s.querySelector('.mscroll'), hs = [...s.querySelectorAll('.hang')];
      const centres = hs.map((h) => parseFloat(/translate\(([-\d.]+)px/.exec(h.style.transform)[1]) + h.offsetWidth / 2 - sc.clientWidth / 2);
      return { sl: sc.scrollLeft, off: Math.min(...centres.map((c) => Math.abs(c - sc.scrollLeft))), read: s.querySelector('.mline-count').textContent, y: scrollY };
    });
    R.ok('a sideways swipe moves the line and snaps a print to the centre', after.sl > 50 && after.off < 12, 'scrollLeft ' + Math.round(after.sl) + ', ' + after.off.toFixed(1) + ' px off a print centre · "' + after.read + '"');
    R.ok('the swipe swings the prints (a cause)', tf1.some((t, i) => t !== tf0[i]));
    R.ok('a sideways swipe leaves the page where it was', Math.abs(after.y - y0) < 4);
    L = await line(p, 1);
    await swipe(cdp, L.x, L.y, 0, -320, 900);
    await p.waitForTimeout(400);
    const v = await p.evaluate(() => ({ y: scrollY, sl: document.querySelectorAll('.mscroll')[1].scrollLeft }));
    R.ok('a vertical swipe on a line still scrolls the page', v.y - after.y > 150 && v.sl === L.sl, 'page ' + Math.round(after.y) + ' → ' + Math.round(v.y) + ', line scrollLeft ' + v.sl);
    R.ok('settles after swiping', await settle(p));
    const big1 = requests.filter((u) => /-2560\.jpg$/.test(u)).length;
    R.ok('swipes and scrolls that start on prints fetch no 2560 file', big1 === big0, (big1 - big0) + ' fetched');
    const idle = await rafOver(p, 2000); R.ok('0 rAF callbacks at idle', idle === 0, idle + ' in 2 s');

    // tap unclips into the viewer; swipe for the next; tap puts it back
    await p.evaluate(() => { const s = document.querySelectorAll('.mline')[1]; window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 60); });
    await p.waitForTimeout(400);
    const pc = await p.evaluate(() => {
      const sc = document.querySelectorAll('.mscroll')[1], cx = sc.getBoundingClientRect().left + sc.clientWidth / 2;
      const hs = [...sc.querySelectorAll('.print')].map((b) => ({ b, r: b.getBoundingClientRect() })).sort((a, z) => Math.abs(a.r.left + a.r.width / 2 - cx) - Math.abs(z.r.left + z.r.width / 2 - cx));
      const r = hs[0].r; return { x: r.left + r.width / 2, y: r.top + r.height * 0.4, id: hs[0].b.closest('.hang').dataset.id };
    });
    await p.touchscreen.tap(pc.x, pc.y);
    await p.waitForTimeout(1300);
    const vw = await p.evaluate(() => { const v = document.querySelector('.vw'), f = v.querySelector('.fly'), r = f && f.getBoundingClientRect(), t = v.querySelector('.vw-hint .t');
      return { open: !v.hidden, peg: !!v.querySelector('.fly .peg'), fits: r && r.left >= 0 && r.right <= innerWidth + 1, w: r && Math.round(r.width), hint: t && getComputedStyle(t).display, id: v.dataset.id }; });
    R.ok('a tap unclips the print into the viewer, peg and all', vw.open && vw.peg && vw.fits, 'print ' + vw.w + ' px wide, touch hints ' + vw.hint);
    await p.screenshot({ path: `/tmp/fyshot/gallery-phone-${W}-viewer.png` });
    await drag(cdp, W / 2 + 60, H / 2, -170, 200);
    await p.waitForTimeout(900);
    const id = await p.evaluate(() => document.querySelector('.vw').dataset.id);
    R.ok('swiping the enlarged print takes the next one', id !== vw.id, 'photo ' + vw.id + ' → ' + id);
    await p.touchscreen.tap(W / 2, H / 2);
    await p.waitForFunction(() => document.querySelector('.vw').hidden, null, { timeout: 6000 }).catch(() => {});
    R.ok('a tap clips it back on its line', await p.evaluate(() => document.querySelector('.vw').hidden));
    await settle(p);

    // a tap on a line that is still gliding only stops it
    L = await line(p, 1);
    await swipe(cdp, L.x + 100, L.y, -200, 0, 2400);
    await p.touchscreen.tap(L.x, L.y);
    await p.waitForTimeout(500);
    R.ok('a tap while a line glides does not open anything', await p.evaluate(() => document.querySelector('.vw').hidden));
    await settle(p);

    // the next line is strung as you reach the end, until all 107 are up
    const tS = Date.now();
    while (Date.now() - tS < 70000) {
      await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await p.waitForTimeout(700);
      if (await p.evaluate(() => document.querySelector('.g-end').classList.contains('full') && !document.querySelector('.hang.unpegged'))) break;
    }
    const ids = await p.evaluate(() => new Set([...document.querySelectorAll('.hang:not(.unpegged)')].map((h) => h.dataset.id)).size);
    R.ok('scrolling strings a line at a time until all 107 are reachable', ids === 107, ids + ' prints on ' + (await p.evaluate(() => document.querySelectorAll('.mline').length)) + ' lines · ' + Math.round((Date.now() - tS) / 1000) + ' s');
    await p.screenshot({ path: `/tmp/fyshot/gallery-phone-${W}-end.png` });
    o = await overflow(p); R.ok('no overflow with every line strung', o.sw <= o.iw);
    const ra = requestAudit(requests); R.ok('no /design/, posts.js or font masters; photos only from images/derived', ra.ok, requests.length + ' requests' + (ra.bad.length ? ' · ' + ra.bad.slice(0, 3).join(' ') : ''));
    R.ok('0 console errors, every request 200', errors.length === 0, errors.slice(0, 3).join(' | '));
    R.done();
    await bc.close();
  }
};
