// gallery-rm.mjs — Gallery under prefers-reduced-motion at 1440 and 390: prints shown developed, no develop, swing
// or flight, the viewer opens and closes in place, filters and new lines peg at once, nothing left running.
//   node /tmp/fyshot/run.mjs scripts/verify/gallery-rm.mjs
import { open, load, rafOver, overflow, Report } from './gallery-lib.mjs';

const running = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.animationName || (a.effect && a.effect.target && a.effect.target.className && String(a.effect.target.className.baseVal ?? a.effect.target.className)) || '?'));

export default async (page, ctx) => {
  for (const [W, H] of [[1440, 900], [390, 844]]) {
    const R = Report(ctx, 'rm ' + W);
    const { ctx: bc, page: p, errors } = await open(page, { width: W, height: H, touch: W < 800, reduced: true });
    await load(p);
    R.ok('no print starts undeveloped', await p.evaluate(() => document.querySelectorAll('.undev').length === 0));
    await p.waitForTimeout(1500);
    R.ok('no develop animation, nothing running 100 ms after load settles', (await running(p)).length === 0, (await running(p)).join(', '));
    R.ok('prints shown developed', await p.evaluate(() => document.querySelectorAll('.undev').length === 0 && [...document.querySelectorAll('.win img')].every((i) => !i.getAnimations().length)));
    const idle = await rafOver(p, 2000); R.ok('0 rAF callbacks at idle', idle === 0, idle + ' in 2 s');
    const o = await overflow(p); R.ok('no overflow', o.sw <= o.iw);

    // the viewer: no flight, the peg already clipped
    const pr = await p.evaluate(() => {
      const b = [...document.querySelectorAll('.print')].find((x) => { const r = x.getBoundingClientRect(); return r.top > 0 && r.bottom < innerHeight && r.left > 0 && r.right < innerWidth; })
        || document.querySelector('.print');
      b.scrollIntoView({ block: 'center', inline: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: b.closest('.hang').dataset.id };
    });
    await p.waitForTimeout(200);
    if (W < 800) await p.touchscreen.tap(pr.x, pr.y); else await p.mouse.click(pr.x, pr.y);
    await p.waitForTimeout(80);
    // full size = the print fills the screen's width or height (a portrait photo is height-bound)
    const size = () => p.evaluate(() => { const r = document.querySelector('.vw .fly').getBoundingClientRect(); return { w: r.width, fill: Math.max(r.width / innerWidth, r.height / innerHeight) }; });
    const a = Object.assign(await size(), await p.evaluate(() => ({ veil: +getComputedStyle(document.querySelector('.vw-veil')).opacity, peg: !document.querySelector('.vw .fly-peg').classList.contains('open') })));
    await p.waitForTimeout(400);
    const b = await size();
    R.ok('the viewer opens in place: full size at once, peg clipped', a.fill > 0.6 && Math.abs(a.w - b.w) < 60 && a.veil === 1 && a.peg, Math.round(a.w) + ' → ' + Math.round(b.w) + ' px (fills ' + Math.round(a.fill * 100) + '% of the screen), veil ' + a.veil);
    if (W > 800) {
      await p.keyboard.press('Escape'); await p.waitForTimeout(150);
      const back = await p.evaluate(() => ({ hidden: document.querySelector('.vw').hidden, id: document.activeElement.closest && document.activeElement.closest('.hang') && document.activeElement.closest('.hang').dataset.id }));
      R.ok('Esc closes at once and returns focus', back.hidden && back.id === pr.id, JSON.stringify(back));
    } else {
      await p.touchscreen.tap(W / 2, H / 2); await p.waitForTimeout(150);
      R.ok('a tap closes at once', await p.evaluate(() => document.querySelector('.vw').hidden));
    }

    // filters and stringing peg at once
    await p.evaluate(() => { window.scrollTo(0, 0); [...document.querySelectorAll('.g-chip')].find((c) => c.textContent.startsWith('People')).click(); });
    await p.waitForTimeout(100);
    const f = await p.evaluate(() => ({ filt: document.querySelector('.g-root').dataset.filtered, up: document.querySelectorAll('.hang:not(.unpegged)').length, down: document.querySelectorAll('.hang.unpegged').length, band: getComputedStyle([...document.querySelectorAll('.g-chip')].find((c) => c.textContent.startsWith('People')).querySelector('.tm-band')).visibility }));
    R.ok('a filter restrings at once; the chosen chip is the wheat band', +f.filt > 0 && f.up === Math.min(+f.filt, 18) && f.down === 0 && f.band === 'visible', JSON.stringify(f));
    R.ok('nothing running after the filter', (await running(p)).length === 0, (await running(p)).join(', '));
    await p.evaluate(() => [...document.querySelectorAll('.g-chip')].find((c) => c.textContent.startsWith('All ·')).click());
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(400);
    const s = await p.evaluate(() => ({ shown: +document.querySelector('.g-root').dataset.shown, down: document.querySelectorAll('.hang.unpegged').length }));
    R.ok('reaching the end strings the next line without motion', s.shown > 18 && s.down === 0, s.shown + ' up');
    R.ok('0 console errors, every request 200', errors.length === 0, errors.slice(0, 3).join(' | '));
    R.done();
    await bc.close();
  }
};
