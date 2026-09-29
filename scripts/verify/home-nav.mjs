// Home · the four doors. Desktop (1440): hover then click each object's hotspot and its hand label → Building,
// Writing, About, Gallery. Phone (390): the overview doors, each panel's link, a touch swipe and the arrow keys.
//   node /tmp/fyshot/run.mjs scripts/verify/home-nav.mjs
const B = process.env.BASE || 'http://127.0.0.1:4173/', U = B + 'index.html?opx=1&opener=none';
const MAP = { laptop: 'Building.dc.html', book: 'Writing.dc.html', frame: 'About.dc.html', camera: 'Gallery.dc.html' };
const NOTE = { laptop: '.nav-build', book: '.nav-write', frame: '.nav-about', camera: '.nav-shoot' };
async function via(page, sel, how) {
  await page.goto(U, { waitUntil: 'load' }); await page.waitForTimeout(300);
  const el = page.locator(sel).first();
  await el.hover(); await page.waitForTimeout(150);
  await Promise.all([page.waitForURL((u) => !/index\.html/.test(u.pathname), { timeout: 8000 }), how === 'tap' ? el.tap() : el.click()]);
  return new URL(page.url()).pathname.split('/').pop();
}
export default async (page, ctx) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const k of Object.keys(MAP)) {
    const a = await via(page, '.hot-' + k), b = await via(page, NOTE[k]);
    ctx.log('1440', k.padEnd(6), 'hotspot →', a, a === MAP[k] ? 'ok' : 'WRONG', '· label →', b, b === MAP[k] ? 'ok' : 'WRONG');
  }
  const ctx2 = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx2.newPage();
  const DOOR = ['laptop', 'frame', 'camera', 'book'];
  for (let i = 0; i < 4; i++) {
    await p.goto(U, { waitUntil: 'load' }); await p.waitForTimeout(400);
    await Promise.all([p.waitForURL((u) => !/index\.html/.test(u.pathname), { timeout: 8000 }), p.locator('.ov-hot').nth(i).tap()]);
    const got = new URL(p.url()).pathname.split('/').pop();
    ctx.log('390 door', DOOR[i].padEnd(6), '→', got, got === MAP[DOOR[i]] ? 'ok' : 'WRONG');
  }
  const PANEL = ['laptop', 'frame', 'camera', 'book'];
  for (let i = 1; i <= 4; i++) {
    await p.goto(U, { waitUntil: 'load' }); await p.waitForTimeout(300);
    await p.locator('.idx button').nth(i).tap(); await p.waitForTimeout(900);
    const cur = await p.evaluate(() => [...document.querySelectorAll('.idx button')].findIndex((b) => b.getAttribute('aria-current') === 'true'));
    await Promise.all([p.waitForURL((u) => !/index\.html/.test(u.pathname), { timeout: 8000 }), p.locator('.panel').nth(i).locator('.lbl').tap()]);
    const got = new URL(p.url()).pathname.split('/').pop();
    ctx.log('390 panel', i, PANEL[i - 1].padEnd(6), '(index shot', cur + ')', '→', got, got === MAP[PANEL[i - 1]] ? 'ok' : 'WRONG');
  }
  // a touch swipe on the strip: one panel on
  await p.goto(U, { waitUntil: 'load' }); await p.waitForTimeout(400);
  const cdp = await ctx2.newCDPSession(p), y = 300;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y }] });
  for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 320 - k * 30, y }] }); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(1200);
  ctx.log('390 swipe → shot', await p.evaluate(() => Math.round(document.querySelector('.track').scrollLeft / document.querySelector('.track').clientWidth)));
  await p.screenshot({ path: '/tmp/fyshot/p3-home/nav-390-swipe.png' });
  // arrow keys on the focused strip
  await p.focus('.track');
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft']) { await p.keyboard.press(key); await p.waitForTimeout(700); }
  ctx.log('390 keys → shot', await p.evaluate(() => Math.round(document.querySelector('.track').scrollLeft / document.querySelector('.track').clientWidth)), '(from 1: → → ← = 2)');
  await ctx2.close();
};
