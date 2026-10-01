/* v1.4/caption.js — the film's own voice. Captions never sit on the page: the frame gives the picture (the desk, the
   dossier, the take) one part of itself and keeps a strip for the film's words, so a caption can't cover the action,
   and can't pass for the site (the site never sets type in these places, or reversed out of ink).
   One bilingual caption at a time: Chinese first, then English. No pen, no slips, no coral.
   Three treatments, compared in captions/index.html. TREATMENT is the one the film is rendered with; ?cap=column or
   ?cap=slate re-renders it with another.
     band    an ink strip under the picture, the words reversed out of it in paper, on one centred line   (recommended)
     column  a kraft column right of the picture, the words stacked in ink, left-aligned, like a catalogue label
     slate   a paper strip over the picture with a hairline, the words on one left-aligned line, the English in caps */
export const TREATMENT = 'band';
export const pick = () => new URLSearchParams(location.search).get('cap') || TREATMENT;

const INK = '#33302B', PAPER = '#FBF6EC', PAPER2 = '#F3ECDD', KRAFT = '#C9AE83', RULE = '#CFC1A9';
const ZH = (px) => `600 ${px}px "Noto Serif SC"`;

function wrap(x, s, w) {
  const out = []; let line = '';
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (x.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; }
  if (line) out.push(line); return out;
}

const T = {
  band: (W, H, s) => {
    const bh = Math.round(136 * s), strip = { x: 0, y: H - bh, w: W, h: bh };
    return {
      pic: { x: 0, y: 0, w: W, h: H - bh }, strip,
      ground(x) { x.fillStyle = INK; x.fillRect(strip.x, strip.y, strip.w, strip.h); },
      words(x, [zh, en]) {
        const zs = 60 * s, es = 50 * s, gap = 32 * s, dot = 7 * s, base = strip.y + bh / 2 + zs * 0.36;
        x.font = ZH(zs); const w1 = x.measureText(zh).width;
        x.font = `italic 500 ${es}px Fraunces`; const w2 = x.measureText(en).width;
        let cx = (W - (w1 + gap + dot + gap + w2)) / 2;
        x.fillStyle = PAPER; x.font = ZH(zs); x.fillText(zh, cx, base); cx += w1 + gap;
        x.fillStyle = '#9C9282'; x.beginPath(); x.arc(cx + dot / 2, base - zs * 0.33, dot / 2, 0, Math.PI * 2); x.fill(); cx += dot + gap;
        x.fillStyle = '#EAE1CE'; x.font = `italic 500 ${es}px Fraunces`; x.fillText(en, cx, base);
      }
    };
  },
  column: (W, H, s) => {
    const cw = Math.round(480 * s), strip = { x: W - cw, y: 0, w: cw, h: H };
    return {
      pic: { x: 0, y: 0, w: W - cw, h: H }, strip,
      ground(x) { x.fillStyle = KRAFT; x.fillRect(strip.x, 0, cw, H); x.fillStyle = INK; x.fillRect(strip.x, 0, 3 * s, H); },
      words(x, [zh, en]) {
        const zs = 52 * s, es = 26 * s, l = strip.x + 46 * s, w = cw - 80 * s;
        x.font = `500 ${es}px "IBM Plex Mono"`; const lines = wrap(x, en, w);
        const blockH = zs + 30 * s + lines.length * es * 1.35, top = H * 0.5 - blockH / 2;
        x.fillStyle = INK; x.font = ZH(zs); x.fillText(zh, l, top + zs * 0.88);
        x.fillRect(l, top + zs + 12 * s, 40 * s, 2.5 * s);
        x.font = `500 ${es}px "IBM Plex Mono"`; lines.forEach((ln, i) => x.fillText(ln, l, top + zs + 30 * s + es * (1 + i * 1.35)));
      }
    };
  },
  slate: (W, H, s) => {
    const sh = Math.round(124 * s), strip = { x: 0, y: 0, w: W, h: sh };
    return {
      pic: { x: 0, y: sh, w: W, h: H - sh }, strip,
      ground(x) { x.fillStyle = PAPER2; x.fillRect(0, 0, W, sh); x.fillStyle = RULE; x.fillRect(0, sh - 2 * s, W, 2 * s); },
      words(x, [zh, en]) {
        const zs = 54 * s, es = 30 * s, base = sh / 2 + zs * 0.36; let cx = 72 * s;
        x.fillStyle = INK; x.font = ZH(zs); x.fillText(zh, cx, base); cx += x.measureText(zh).width + 34 * s;
        x.fillRect(cx, sh / 2 - 18 * s, 2 * s, 36 * s); cx += 34 * s;
        x.fillStyle = '#4A453E'; x.font = `500 ${es}px "IBM Plex Mono"`; x.letterSpacing = 3 * s + 'px'; x.fillText(en.toUpperCase(), cx, base - 2 * s); x.letterSpacing = '0px';
      }
    };
  }
};

// the frame's layout for a treatment, and the strip's own canvas laid over the WebGL picture
export function layout(name, W, H) {
  const L = (T[name] || T[TREATMENT])(W, H, W / 1920);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  c.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
  document.body.appendChild(c);
  const x = c.getContext('2d'); let key = null;
  L.name = name; L.canvas = c;
  // words: [zh, en] or null; a: 0..1
  L.draw = (words, a) => {
    const k = words ? words[0] + '|' + a.toFixed(3) : '-';
    if (k === key) return; key = k;
    x.clearRect(0, 0, W, H); L.ground(x);
    if (words && a > 0) { x.save(); x.globalAlpha = a; x.textBaseline = 'alphabetic'; L.words(x, words); x.restore(); }
  };
  return L;
}
