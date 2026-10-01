// v1.5/checks/probe.mjs (v1.4's, for this folder) — every output frame of a film page, without rendering it: which footage frame each sheet
// shows, the speed, and the camera's view-projection. Written as JSON for the checks in this folder.
//   node v1.5/checks/probe.mjs index.html /tmp/fyfilm/v15-check/probe-promo.json   (from design/2026-09-building/film)
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import fs from 'fs';

const [pg, out] = process.argv.slice(2);
const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:4218/design/2026-09-building/film/v1.5/' + pg, { waitUntil: 'load' });
await page.waitForFunction(() => window.READY !== undefined, null, { timeout: 60000 });
const res = await page.evaluate(() => {
  const n = Math.round(window.DUR * 60), frames = [];
  for (let i = 0; i < n; i++) { const t = i / 60, p = window.probe(t); if (window.camMatrix) p.vp = Array.from(window.camMatrix(t)).map((v) => +v.toFixed(6)); frames.push(p); }
  return { dur: window.DUR, timeline: window.TIMELINE.map(({ map, ...s }) => s), captions: window.CAPTIONS, layout: window.LAYOUT, frames };
});
fs.mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
fs.writeFileSync(out, JSON.stringify(res));
console.log('wrote', out, res.frames.length, 'frames');
await browser.close();
