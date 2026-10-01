/* v1/end.js — the last sheet: 继续写，继续造 written with the header lockup's own strokes, the two seals stamped on
   cream (where the site's coral holds), and the credits set line by line, every line in --ink. Each fact is taken
   from `gh pr list --state merged` (merge times in Fred's EDT). */
const F = window.FILM;
const CREDITS = [
  ['第一轮 #17 · 动效与交互改版 · 9 月 29 日 12:59', 'Round one #17 · the motion and interaction redesign · 29 Sep 12:59'],
  ['第二轮 #18–#35 · 18 个 PR · 9 月 29 日 16:04 → 9 月 30 日 10:21', 'Round two #18–#35 · 18 PRs · 29 Sep 16:04 → 30 Sep 10:21'],
  ['每一页都是真实录制、真实操作', 'Every page recorded live, with real input'],
  ['改版之前（6237120）：Claude Design (Fable 5) + GPT-5.6-sol', 'Before (6237120): Claude Design (Fable 5) + GPT-5.6-sol'],
  ['用 Claude Opus 5.5 制作', 'Made with Claude Opus 5.5']
];
const PEN0 = 1.55, PEN1 = 2.65, STAMP = [3.3, 3.62], LINE0 = 4.15, LINE = 0.42;   // 0.65 s of quiet between the pen and the stamps
let L = null;
export const endCard = {
  async load() {
    const svg = await fetch('../a-night/lockup.svg').then((r) => r.text());
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const tag = [].concat(...[].map.call(doc.querySelectorAll('.site-identity-tag > g'), (g) => [].map.call(g.querySelectorAll('path'), (p) => p.getAttribute('d'))));
    const seals = await Promise.all([].map.call(doc.querySelectorAll('.site-identity-seal'), (g) => {
      const s = new XMLSerializer().serializeToString(g).replace(/class="seal-body"/g, 'fill="#D9695A"')
        .replace(/class="seal-cut"/g, 'fill="none" stroke="#FEFAEE" stroke-linecap="square" stroke-linejoin="miter"')
        .replace(/class="seal-line"/g, 'fill="none" stroke="#D9695A" stroke-linecap="square" stroke-linejoin="miter"');
      return F.img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 68" width="2520" height="1020">' + s + '</svg>'));
    }));
    L = { tag, seals }; return L;
  },
  cues(t0, short) {
    const all = L ? L.tag : [];
    const c = [{ t: t0, type: 'pull', dur: 1.4 }];
    const lens = all.map(F.len), tot = lens.reduce((a, b) => a + b + 3, 0); let at = 0;
    all.forEach((d, i) => { c.push({ t: t0 + PEN0 + at / tot * (PEN1 - PEN0), type: 'stroke', dur: lens[i] / tot * (PEN1 - PEN0) }); at += lens[i] + 3; });
    c.push({ t: t0 + STAMP[0], type: 'stamp', k: 1 }, { t: t0 + STAMP[1], type: 'stamp', k: .6 });
    (short ? CREDITS.slice(-1) : CREDITS).forEach((_, i) => c.push({ t: t0 + LINE0 + i * LINE, type: 'line' }));
    return c;
  },
  draw(tex, u, short) {
    const c = tex.userData.canvas, x = c.getContext('2d'), key = Math.floor(u * 60);
    if (tex.userData.key === key) return; tex.userData.key = key;
    x.clearRect(0, 0, c.width, c.height);
    if (u < 1.2 || !L) { tex.needsUpdate = true; return; }
    const k = 4.4, ox = 700 - 84 * k, oy = 150;
    x.save(); x.translate(ox, oy); x.scale(k, k);
    F.strokes(x, L.tag, F.clamp((u - PEN0) / (PEN1 - PEN0)), { w: 3.0 / k, color: '#33302B', gap: 3 });
    [[33, 34], [97, 44]].forEach((cc, i) => {
      const a = u - STAMP[i]; if (a < 0) return; const s = a < 2 / 60 ? 1.035 : 1;
      x.save(); x.translate(cc[0], cc[1]); x.scale(s, s); x.translate(-cc[0], -cc[1]); x.drawImage(L.seals[i], 0, 0, 168, 68); x.restore();
    });
    x.restore();
    let y = short ? 640 : 560;
    (short ? CREDITS.slice(-1) : CREDITS).forEach(([zh, en], i) => {
      const p = F.held(F.seg(u, LINE0 + i * LINE, LINE0 + i * LINE + 0.1));
      if (p > 0) {
        F.text(x, zh, 700, y, '500 23px "Noto Serif SC", Fraunces', '#33302B', { align: 'center' });
        F.text(x, en, 700, y + 27, '500 17px "IBM Plex Mono"', '#33302B', { align: 'center', spacing: 1 });
      }
      y += 78;
    });
    tex.needsUpdate = true;
  }
};
