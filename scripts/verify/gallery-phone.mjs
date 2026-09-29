// gallery-phone.mjs — Gallery at 390 and 360 with touch (CDP): one swipe line per clothesline, vertical scroll still
// works, tap unclips, swipe in the viewer, a tap on a gliding line only stops it, stringing to all 107, idle loop.
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
