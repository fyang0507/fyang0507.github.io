// Usage: node montage.mjs <spec.json> <out-prefix>    → <out-prefix>-16x9.mp4 and <out-prefix>-9x16.mp4 (env LAYS=wide,tall)
// The 30 s cut: one spec, two layouts. wide (1920×1080) puts the sides next to each other; tall (1080×1920) puts
// one above the other with the headline between them. Phones stay side by side in both (stacked, a phone would
// shrink to a strip). A beat is one recording pair cut into pieces [t0, t1, rate] (seconds after its `from` mark),
// joined without a seam and identical on both sides; beats meet on hard cuts, and the last dips through paper into
// the end card. As a beat starts, the site's own pen underlines the headline's marked phrase; a slowed piece says so.
// Recordings come from $VIDEO_REC (default /tmp/fyvideo/rec, see record.sh); scratch goes to $VIDEO_WORK.
import { chromium } from '/tmp/fyshot/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ff, YUV, TAGS, loopPng, clips } from './cut.mjs';

const [specPath, outPrefix] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const here = path.dirname(new URL(import.meta.url).pathname);
const REC = path.resolve(process.env.VIDEO_REC || '/tmp/fyvideo/rec');
const WORK = path.resolve(process.env.VIDEO_WORK || '/tmp/fyvideo/work30'); fs.mkdirSync(WORK, { recursive: true });
const FPS = spec.fps || 60, PAPER = '0xFBF6EC', DIP = 0.22;
const LAYS = (process.env.LAYS || 'wide,tall').split(',');
// Pane rects keep the recordings' own aspect (1280 × 1000 desk, 390 × 844 phone). S: type sizes (px).
const GEO = {
  wide: { W: 1920, H: 1080, m: 36, brandY: 40, ruleY: 78, S: { brand: 20, lab: 20, en: 46, zh: 32 },
    desk: { labB: 96, labA: 96, panes: [{ x: 36, y: 132, w: 912, h: 712 }, { x: 972, y: 132, w: 912, h: 712 }], headY: 862, headH: 190 },
    phone: { labB: 96, labA: 96, labBRight: true, panes: [{ x: 600, y: 132, w: 334, h: 722 }, { x: 986, y: 132, w: 334, h: 722 }], headY: 872, headH: 180 },
    end: { x: 260, k: 19, h1: 84, zh: 46, p: 28, foot: 96 }, name: '16x9' },
  tall: { W: 1080, H: 1920, m: 48, brandY: 56, ruleY: 100, S: { brand: 26, lab: 24, en: 50, zh: 36 },
    desk: { labB: 118, labA: 1088, panes: [{ x: 90, y: 158, w: 900, h: 703 }, { x: 90, y: 1128, w: 900, h: 703 }], headY: 872, headH: 210 },
    phone: { labB: 566, labA: 566, labWrap: true, panes: [{ x: 48, y: 642, w: 480, h: 1039 }, { x: 552, y: 642, w: 480, h: 1039 }], headY: 310, headH: 230 },
    end: { x: 90, k: 24, h1: 88, zh: 50, p: 32, foot: 110 }, name: '9x16' },
};

const exe = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const browser = await chromium.launch({ executablePath: exe, headless: true });
async function layerPage(G, params) {
  const page = await browser.newPage({ viewport: { width: G.W, height: G.H } });
  await page.goto('file://' + path.join(here, 'montage.html') + '?' + new URLSearchParams(params));
  await page.waitForSelector('body[data-ready="1"]'); await page.waitForTimeout(120);
  return page;
}
async function still(G, params, png) {
  const page = await layerPage(G, params);
  await page.screenshot({ path: png, omitBackground: params.layer !== 'base' && params.layer !== 'end' });
  await page.close();
  return png;
}
// The pen's layer as a frame sequence in its own folder: every frame until the last stroke lands (then the sequence's
// last frame holds). The folder starts empty: frames left from a longer earlier sequence would play on after this one.
async function drawn(G, params, dir) {
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const page = await layerPage(G, params), end = await page.evaluate(() => window.at(0));
  const n = Math.ceil(end / 1000 * FPS) + 1;
  for (let i = 0; i <= n; i++) {
    await page.evaluate((ms) => window.at(ms), i * 1000 / FPS);
    await page.screenshot({ path: `${dir}/${String(i).padStart(3, '0')}.png`, omitBackground: params.layer !== 'end' });
  }
  await page.close();
  return `${dir}/%03d.png`;
}

// Both sides of every beat, cut once and shared by the layouts.
const cuts = spec.beats.map((b, i) => ['before', 'after'].map((side) => clips(path.join(REC, `${b.rec}-${side}`), b.from || 'start', b.to || 'end', b.pieces, path.join(WORK, `p${i}-${side}.mp4`), FPS)));
cuts.forEach(([b, a], i) => { if (Math.abs(b.t - a.t) > 1e-3) throw new Error(`beat ${i}: sides differ (${b.t} vs ${a.t})`); });

for (const lay of LAYS) {
  const L = GEO[lay], segs = [], of = String(spec.beats.length).padStart(2, '0');
  for (const [i, b] of spec.beats.entries()) {
    const mode = b.mode || 'desk', G = { W: L.W, H: L.H, m: L.m, brandY: L.brandY, ruleY: L.ruleY, S: L.S, mode, ...L[mode] };
    const geo = JSON.stringify(G), tag = `${lay}-${i}`, [cb, ca] = cuts[i], D = ca.t, last = i === spec.beats.length - 1;
    const base = await still(G, { lay, layer: 'base', geo, n: String(i + 1).padStart(2, '0'), of, bw: spec.credits.before, aw: spec.credits.after }, path.join(WORK, `${tag}-base.png`));
    const top = await still(G, { lay, layer: 'top', geo }, path.join(WORK, `${tag}-top.png`));
    const head = await drawn(G, { lay, layer: 'head', geo, h: b.h, hzh: b.hzh }, path.join(WORK, `${tag}-head`));
    const slow = ca.at.filter(([, , r]) => r !== 1);
    const tagPng = slow.length ? await still(G, { lay, layer: 'tag', geo, tag: `${slow[0][2]}× speed` }, path.join(WORK, `${tag}-tag.png`)) : null;
    const [pb, pa] = G.panes;
    const side = (n, p, lbl) => `[${n}:v]scale=${p.w}:${p.h}:flags=lanczos,format=rgb24,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=1[${lbl}]`;
    const fc = [side(1, pb, 'b'), side(2, pa, 'a'), '[0:v]format=rgb24[bg]', `[bg][b]overlay=${pb.x}:${pb.y}:format=rgb[v0]`, `[v0][a]overlay=${pa.x}:${pa.y}:format=rgb[v1]`,
      '[v1][3:v]overlay=0:0:format=rgb[v2]', `[4:v]format=rgba,tpad=stop_mode=clone:stop_duration=${(D + 1).toFixed(3)}[h]`, '[v2][h]overlay=0:0:format=rgb[v3]'];
    let out = 'v3';
    if (tagPng) { fc.push('[5:v]format=rgba[t]', `[v3][t]overlay=0:0:format=rgb:enable='${slow.map(([s, e]) => `between(t,${s.toFixed(3)},${e.toFixed(3)})`).join('+')}'[v4]`); out = 'v4'; }
    fc.push(`[${out}]${last ? `fade=t=out:st=${(D - DIP).toFixed(3)}:d=${DIP}:color=${PAPER},` : ''}${YUV}[v]`);
    const mp4 = path.join(WORK, `${tag}.mp4`);
    ff([...loopPng(base, D, FPS), '-i', cb.mp4, '-i', ca.mp4, ...loopPng(top, D, FPS), '-framerate', String(FPS), '-i', head, ...(tagPng ? loopPng(tagPng, D, FPS) : []),
      '-filter_complex', fc.join(';'), '-map', '[v]', '-t', D.toFixed(3), '-r', String(FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', ...TAGS, mp4]);
    segs.push(mp4);
    console.log(lay, 'beat', i + 1, b.rec, D.toFixed(2) + ' s');
  }
  // the end card: the pen underlines the name, then it holds
  const E = spec.end, G = { W: L.W, H: L.H, end: L.end }, d = E.dur || 3;
  const card = await drawn(G, { lay, layer: 'end', geo: JSON.stringify(G), k: E.k, h: E.h, hzh: E.hzh, was: E.was, waszh: E.waszh, at: String(E.at || 380) }, path.join(WORK, `${lay}-end`));
  const endMp4 = path.join(WORK, `${lay}-end.mp4`);
  ff(['-framerate', String(FPS), '-i', card, '-filter_complex', `[0:v]format=rgb24,tpad=stop_mode=clone:stop_duration=${d.toFixed(3)},fade=t=in:st=0:d=${DIP}:color=${PAPER},${YUV}[v]`,
    '-map', '[v]', '-t', d.toFixed(3), '-r', String(FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'fast', ...TAGS, endMp4]);
  segs.push(endMp4);
  const list = path.join(WORK, `${lay}-concat.txt`), outPath = `${outPrefix}-${L.name}.mp4`;
  fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'libx264', '-profile:v', 'high', '-crf', String(spec.crf || 20), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', String(FPS), ...TAGS, '-movflags', '+faststart', outPath]);
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', outPath]).toString().trim();
  console.log('wrote', outPath, `${(+dur).toFixed(1)} s`, `${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB`);
}
await browser.close();
