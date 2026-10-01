// Probe: can headless-shell render the real site deterministically, frame by frame, on a virtual clock?
// chrome-headless-shell with begin-frame control: the compositor draws only when told, at the frame time we give it,
// and virtual time moves performance.now, Date, timers and rAF by exactly one frame between draws.
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import fs from 'fs';
const shell = process.env.HOME + '/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const out = process.argv[2] || '/tmp/fyfilm/probe';
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: shell, headless: true, args: ['--deterministic-mode', '--enable-begin-frame-control', '--run-all-compositor-stages-before-draw', '--disable-threaded-animation', '--disable-threaded-scrolling', '--disable-checker-imaging', '--disable-image-animation-resync'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
await context.addInitScript(() => { try { sessionStorage.setItem('fy-opener', '1'); } catch {} });
const bs = await browser.newBrowserCDPSession();
const { browserContextIds } = await bs.send('Target.getBrowserContexts');
console.log('contexts', browserContextIds);
const pageP = context.waitForEvent('page');
const { targetId } = await bs.send('Target.createTarget', { url: 'about:blank', enableBeginFrameControl: true, browserContextId: browserContextIds[browserContextIds.length - 1], width: 1280, height: 1000 });
const page = await pageP;
console.log('page', targetId, page.url());
const cdp = await context.newCDPSession(page);
let t = 1000; const dt = 1000 / 60;
const frame = async (shot) => {
  const r = await cdp.send('HeadlessExperimental.beginFrame', { frameTimeTicks: t, interval: dt, noDisplayUpdates: false, ...(shot ? { screenshot: { format: 'png' } } : {}) });
  t += dt; return r;
};
// pump frames while the page loads (real time passes; virtual time off for now)
const nav = page.goto('http://127.0.0.1:4219/main/index.html', { waitUntil: 'load' }).then(() => 'loaded');
let done = false; nav.then(() => { done = true; });
let n = 0;
while (!done && n < 600) { await frame(false); n++; await new Promise((r) => setTimeout(r, 16)); }
console.log('loaded after frames', n);
for (let i = 0; i < 60; i++) await frame(false);
const r0 = await frame(true);
console.log('shot', !!r0.screenshotData, r0.hasDamage);
if (r0.screenshotData) fs.writeFileSync(out + '/rest.png', Buffer.from(r0.screenshotData, 'base64'));
await browser.close();
