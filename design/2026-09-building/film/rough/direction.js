/* rough/direction.js — the direction, session by session: its tab, where the camera looks, and when the page is
   lifted to show the site before #17 underneath. Times are beats from the session's meta.json ('name', or
   'name@offset' in seconds), or plain seconds into the session. Positions are page px of the 1280 × 1000 recording;
   h is how much of the page's height the frame shows (1160 = the whole sheet with its margin). */
const F = window.FILM;

export const SESSIONS = (new URLSearchParams(location.search).get('sessions') || 's1-home-writing-reading,s2-building,s3-gallery-about-home').split(',');

export const DIRECTION = {
  's1-home-writing-reading': {
    tab: ['01 home · writing · reading', '#17 · #22 #27 #31'], label: 'HOME, WRITING, READING',
    cam: [
      [0, 640, 500, 1160, 6], ['op-done', 640, 500, 1160, 6],             // the OP, the one register break, whole
      ['op-done@0.7', 175, 90, 330, 3], ['op-done@3.6', 175, 90, 330, 3], // the motto written, the seals stamped
      ['hover-book@-0.5', 640, 500, 1160, 6],                              // the desk; under it, the old static home
      ['click-book@0.45', 640, 330, 760, 5], ['click-book@1.6', 640, 250, 700, 5], // the objects fly into their tabs
      ['hover-spine@-0.2', 430, 560, 700, 6], ['hover-spine@2.4', 430, 560, 700, 6], // a book pulled, its cover, the obi
      ['switch-en@-0.5', 900, 460, 860, 6], ['switch-en@1.2', 820, 500, 900, 6],     // 中文 → EN: the spines retitle
      ['hover-spine-2', 420, 560, 760, 6], ['open-book@-0.1', 420, 560, 760, 6],
      ['open-book@0.6', 640, 500, 1160, 6], ['scroll-hero@2.8', 640, 460, 1160, 7], // Reading: the hero dissolves
      ['scroll-text@0.4', 480, 520, 860, 6], ['hover-footnote@-0.3', 600, 640, 620, 6], ['hover-footnote@4.4', 600, 640, 620, 6]
    ],
    // [beat, lead (s), hold (s), amount]: the page flipped up to show the one under it, at the same moment
    lifts: [['op-done', 1.9, 1.5, 1], ['click-book', 1.25, 1.25, 1], ['scroll-hero', 1.6, 1.5, 1], ['hover-footnote', 2.2, 1.3, 1]]
  },
  's2-building': {
    tab: ['02 building · the dossier', '#17 · #23 #28 #32 #33 #35'], label: 'BUILDING, THE DOSSIER, FRED AGENT',
    cam: [
      [0, 640, 500, 1160, 6], ['to-building-tab@0.6', 900, 220, 700, 5], ['click-building@1.2', 900, 220, 700, 5], // the tab move
      ['point-lead@-0.2', 430, 580, 760, 6], ['point-lead@2.0', 430, 580, 760, 6],       // the flower pressed again
      ['fling@-0.3', 640, 580, 1100, 7], ['fling-back@2.2', 640, 580, 1100, 7],          // the cards swing on their pins
      ['take-card@-0.3', 480, 580, 900, 6], ['take-card@1.4', 640, 520, 1060, 6],        // the card in your hand, the dossier out
      ['to-principles@0.2', 900, 580, 760, 6], ['open-principles@0.1', 900, 560, 760, 6],
      ['open-principles@0.7', 700, 480, 1120, 6], ['open-principles@2.1', 380, 560, 820, 6], // #35: the tabs fly; the rail drawn
      ['scroll-principles@0.5', 480, 540, 900, 6], ['scroll-end@0.5', 640, 500, 1160, 6],
      ['to-back@0.1', 1000, 800, 760, 6], ['way-back@0.5', 640, 540, 1160, 6], ['way-back@1.6', 440, 580, 820, 6], ['way-back@4.2', 480, 560, 900, 6]
    ],
    lifts: [['click-building', 0.9, 1.1, 1], ['fling-back', 0.2, 1.4, 1], ['open-principles', 2.6, 1.4, 1], ['way-back', 2.4, 1.2, 1]]
  },
  's3-gallery-about-home': {
    tab: ['03 shooting · about · home', '#17 · #30'], label: 'SHOOTING, ABOUT, HOME',
    cam: [
      [0, 640, 500, 1160, 6], ['to-shooting-tab@0.6', 980, 220, 700, 5], ['click-shooting@1.1', 980, 220, 700, 5], // the tab move
      ['pass-line@-0.8', 640, 520, 1100, 7], ['pass-line@2.4', 640, 520, 1100, 7],       // the prints develop, the line swings
      ['to-print@0.3', 600, 640, 760, 6], ['open-print@0.2', 600, 640, 760, 6], ['open-print@0.9', 640, 500, 1160, 6], // unclipped, with its peg
      ['close-print@1.2', 640, 520, 1100, 6], ['to-about-tab@0.5', 1040, 220, 700, 5], ['click-about@1.1', 1040, 220, 700, 5],
      ['to-sleeve@0.2', 640, 560, 900, 6], ['pull-card@2.6', 700, 560, 900, 6],         // out of the sleeve: stick, the lip, free
      ['tilt@0.2', 760, 560, 880, 6], ['flip@1.8', 700, 560, 1000, 6], ['flip-back@2.0', 700, 560, 1000, 6],
      ['to-home@0.4', 330, 260, 760, 5], ['click-home@0.5', 640, 500, 1160, 6], ['click-home@4.0', 640, 500, 1160, 6] // the nav falls back into a desk
    ],
    lifts: [['click-shooting', 0.9, 1.1, 1], ['open-print', 1.3, 1.3, 1], ['click-about', 0.9, 1.1, 1], ['flip', 2.1, 1.2, 1]]
  }
};

// ---- the end, on the folder's back: the motto written with the lockup's own strokes, the seals stamped, credits typed
const CREDITS = [
  ['ROUND ONE · #17 · THE MOTION AND INTERACTION REDESIGN · MERGED 29 SEP 12:59', '#6D6559'],
  ['ROUND TWO · #18–#35 · 18 PRS · 29 SEP 16:04 → 30 SEP 10:21', '#6D6559'],
  ['EVERY PAGE HERE WAS RECORDED LIVE, WITH REAL INPUT, BEFORE AND AFTER', '#6D6559'],
  ['BEFORE (6237120): CLAUDE DESIGN (FABLE 5) + GPT-5.6-SOL', '#33302B'],
  ['MADE WITH CLAUDE OPUS 5.5', '#33302B']
];
const PEN0 = 0.6, PEN1 = 2.3, STAMP = [2.6, 3.0], TYPE0 = 3.5, CPS = 55;
let L = null;
export const endCard = {
  async load() {
    const svg = await fetch('../a-night/lockup.svg').then((r) => r.text());
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const tag = [].concat(...[].map.call(doc.querySelectorAll('.site-identity-tag > g'), (g) => [].map.call(g.querySelectorAll('path'), (p) => p.getAttribute('d'))));
    const seals = await Promise.all([].map.call(doc.querySelectorAll('.site-identity-seal'), (g) => {
      const s = new XMLSerializer().serializeToString(g).replace(/class="seal-body"/g, 'fill="#D9695A"')
        .replace(/class="seal-cut"/g, 'fill="none" stroke="#C9AE83" stroke-linecap="square" stroke-linejoin="miter"')
        .replace(/class="seal-line"/g, 'fill="none" stroke="#D9695A" stroke-linecap="square" stroke-linejoin="miter"');
      return F.img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 68" width="1680" height="680">' + s + '</svg>'));
    }));
    L = { tag, seals }; return L;
  },
  cues(t0) {
    const c = [{ t: t0 + PEN0, type: 'motto', dur: PEN1 - PEN0 }, { t: t0 + STAMP[0], type: 'stamp', k: 1 }, { t: t0 + STAMP[1], type: 'stamp', k: .6 }];
    let t = t0 + TYPE0; CREDITS.forEach(([s]) => { c.push({ t, type: 'type', dur: s.length / CPS }); t += s.length / CPS + .25; });
    return c;
  },
  draw(tex, _, u) {
    const c = tex.userData.canvas, x = c.getContext('2d'), key = Math.floor(u * 30);
    if (tex.userData.key === key) return; tex.userData.key = key;
    x.clearRect(0, 0, c.width, c.height);
    if (u < 0 || !L) { tex.needsUpdate = true; return; }
    const k = 4.2, ox = 700 - 84 * k, oy = 170;
    x.save(); x.translate(ox, oy); x.scale(k, k);
    F.strokes(x, L.tag, F.clamp((u - PEN0) / (PEN1 - PEN0)), { w: 3.2 / k, color: '#33302B', gap: 3 });
    [[33, 34], [97, 44]].forEach((cc, i) => {
      const a = u - STAMP[i]; if (a < 0) return; const s = a < 2 / 30 ? 1.035 : 1;
      x.save(); x.translate(cc[0], cc[1]); x.scale(s, s); x.translate(-cc[0], -cc[1]); x.drawImage(L.seals[i], 0, 0, 168, 68); x.restore();
    });
    x.restore();
    // the credits, typed a character at a time (the hand's clock), in the site's utility face
    let t = TYPE0, y = 560;
    CREDITS.forEach(([s, col]) => {
      const n = Math.floor(F.clamp((u - t) * CPS, 0, s.length));
      x.save(); x.font = '500 22px "IBM Plex Mono"'; x.letterSpacing = '1.5px'; const w = x.measureText(s).width; x.restore();
      if (n > 0) F.text(x, s.slice(0, n), 700 - w / 2, y, '500 22px "IBM Plex Mono"', col, { spacing: 1.5 });
      t += s.length / CPS + .25; y += 48;
    });
    tex.needsUpdate = true;
  }
};
