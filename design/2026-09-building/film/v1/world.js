/* v1/world.js — the film's one world (from rough/world.js): a kraft dossier on the desk, and in it a stack of live sheets.

   Each session of real footage is a pair of sheets: the site today on top, and underneath it, the site before #17
   (6237120), playing the same input at the same moment. The before is never shown beside the after: the top page is
   lifted from its bottom edge and rolled up over the top, as you'd flip up a pad's top page to look at the one under
   it (a cylinder curl in the vertex shader, on a spring), and it falls back. Between sessions the finished pair is pulled aside to the left, the way a Fred Agent chapter gives way to
   the next (#35's chapter move), and the next pair is already there.

   Units: 1 = 100 page px. A page is 12.8 × 10 (the 1280 × 1000 recordings), printed on a sheet with a 0.3 margin.
   Colour management is off: every hex and every footage pixel is written as it is. No light, no gradient; the only
   tone is countable dots: on a curling page, and on the page under it where the curl hovers (contact). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const PW = 12.8, PH = 10, M = 0.3, MT = 0.78, SW = PW + 2 * M, SH = PH + M + MT;   // a top margin for the pen's chapter names
export const OFF = (MT - M) / 2;   // the page's centre sits this far below the sheet's
const hex = (h) => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
export const COL = { paper: '#FBF6EC', paper2: '#F3ECDD', slip: '#FCF8EF', ink: '#33302B', soft: '#6D6559', pencil: '#736A5D', line: '#E4DAC7', lineStrong: '#CFC1A9',
  kraft: '#C9AE83', kraftDeep: '#B39468', kraftEdge: '#A88B5E', hl: '#DCCF98', hlInk: '#AD9650', mark: '#D9695A', desk: '#EFE6D4' };

const VERT = `
uniform vec2 uDir; uniform float uP; uniform float uR; uniform float uPhi;
varying vec2 vUv; varying float vTh; varying float vS;
void main() {
  vUv = uv; vec3 p = position; float s = dot(p.xy, uDir) - uP; float th = 0.0;
  if (s > 0.0) {
    // round the cylinder up to uPhi, then straight on along the tangent: a page held up, not pressed flat
    th = s / uR; vec2 base = p.xy - uDir * s;
    if (th < uPhi) { p.xy = base + uDir * (uR * sin(th)); p.z += uR * (1.0 - cos(th)); }
    else { float r = s - uPhi * uR; p.xy = base + uDir * (uR * sin(uPhi) + r * cos(uPhi)); p.z += uR * (1.0 - cos(uPhi)) + r * sin(uPhi); th = uPhi; }
  }
  vTh = th; vS = dot(position.xy, uDir);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FRAG = `
uniform sampler2D uMap; uniform sampler2D uLabel; uniform sampler2D uBackLabel; uniform float uHasMap; uniform vec3 uPaper; uniform vec3 uBack; uniform vec3 uInk;
uniform vec4 uInset; uniform vec2 uCDir; uniform float uCP; uniform float uCAmt; uniform float uCell;
varying vec2 vUv; varying float vTh; varying float vS;
float dotsAt(float tone) {
  vec2 g = gl_FragCoord.xy / uCell; vec2 c = floor(g) + 0.5; vec2 f = g - c;
  float r = 0.5 * sqrt(clamp(tone, 0.0, 0.33));
  return 1.0 - smoothstep(r - 0.06, r + 0.06, length(f));
}
void main() {
  vec3 col;
  if (gl_FrontFacing) {
    col = uPaper;
    vec2 q = (vUv - uInset.xy) / (uInset.zw - uInset.xy);
    if (uHasMap > 0.5 && q.x >= 0.0 && q.x <= 1.0 && q.y >= 0.0 && q.y <= 1.0) col = texture2D(uMap, vec2(q.x, 1.0 - q.y)).rgb;
    vec4 L = texture2D(uLabel, vUv); col = mix(col, L.rgb, L.a);
  } else {
    // the underside: plain paper, with its typed label (read upright once the page is up)
    col = uBack; vec4 B = texture2D(uBackLabel, vec2(vUv.x, 1.0 - vUv.y)); col = mix(col, B.rgb, B.a);
  }
  // tone marks contact only: one short run of dots on the page below, just where the lifted page leaves it
  float contact = 0.0;
  if (uCAmt > 0.0) { float d = (vS - uCP); contact = uCAmt * (1.0 - smoothstep(0.0, 0.55, d)) * step(0.0, d) * 0.3; }
  float tone = contact;
  if (tone > 0.02) col = mix(col, uInk, 0.62 * dotsAt(tone));
  gl_FragColor = vec4(col, 1.0);
}`;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.needsUpdate = true; t.userData.canvas = c; return t;
}
const blank = canvasTex(4, 4, () => {});
const K = 180; // label canvases: px per unit (the pen's notes are read in close-up)

// a sheet: the curl mesh with its footage texture and a label layer (typed margin labels)
export function sheet(opt) {
  const geo = new THREE.PlaneGeometry(SW, SH, 96, 80); geo.translate(0, OFF, 0);
  const map = new THREE.Texture(); map.colorSpace = THREE.NoColorSpace; map.flipY = false; map.generateMipmaps = true; map.minFilter = THREE.LinearMipmapLinearFilter; map.anisotropy = 8;
  const label = canvasTex(Math.round(SW * K), Math.round(SH * K), (x, w, h) => { if (opt.label) opt.label(x, w, h); });
  const backLabel = canvasTex(Math.round(SW * 60), Math.round(SH * 60), (x, w, h) => { if (opt.back) opt.back(x, w, h); });
  const dir = new THREE.Vector2(0.22, -1).normalize();   // lifted from the bottom edge, a little from the right: a pad's top page
  const u = {
    uMap: { value: map }, uLabel: { value: label }, uBackLabel: { value: backLabel }, uHasMap: { value: 0 }, uPaper: { value: hex(COL.slip) }, uBack: { value: hex(COL.paper2) }, uInk: { value: hex(COL.ink) },
    uInset: { value: new THREE.Vector4(M / SW, M / SH, 1 - M / SW, 1 - MT / SH) }, uDir: { value: dir }, uP: { value: 99 }, uR: { value: 0.55 }, uPhi: { value: 3.14159 },
    uCDir: { value: dir }, uCP: { value: 99 }, uCAmt: { value: 0 }, uCell: { value: 7 }
  };
  const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = { u, map, label, backLabel, frame: -1 };
  return mesh;
}
// the extent of dot(P, dir) over the sheet: the curl starts past the far corner
const D0 = new THREE.Vector2(0.22, -1).normalize();
export const CURL_MAX = Math.abs(D0.x) * SW / 2 + Math.abs(D0.y) * SH / 2 + Math.abs(D0.y) * OFF + 0.05;

// the folder: kraft, a back cover the stack lies on, a front cover on a hinge along the left edge, and a label
export function folder(scene) {
  const g = new THREE.Group(); scene.add(g);
  const FW = SW + 1.6, FH = SH + 1.3;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ color: COL.kraft }));
  back.position.set(0.35, 0, 0.0); g.add(back);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(FW + 0.08, FH + 0.08), new THREE.MeshBasicMaterial({ color: COL.kraftEdge }));
  edge.position.set(0.35, -0.04, -0.03); g.add(edge);
  // the front cover: hinge at its left edge
  const hinge = new THREE.Group(); hinge.position.set(0.35 - FW / 2, 0, 0.6); g.add(hinge);
  const coverTex = canvasTex(Math.round(FW * K), Math.round(FH * K), (x, w, h) => {
    x.fillStyle = '#CDB287'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(51,48,43,.25)'; x.lineWidth = 2; x.strokeRect(12, 12, w - 24, h - 24);
    // the typed file label, a pasted slip
    const lx = w * .5 - 330, ly = h * .38;
    x.fillStyle = COL.slip; x.fillRect(lx, ly, 660, 250); x.strokeStyle = COL.lineStrong; x.lineWidth = 2; x.strokeRect(lx, ly, 660, 250);
    x.fillStyle = COL.ink; x.font = '500 30px "IBM Plex Mono"'; x.letterSpacing = '3px';
    x.fillText('FIELD NOTES · FYANG0507.GITHUB.IO', lx + 36, ly + 70);
    x.font = '600 58px "Noto Serif SC"'; x.letterSpacing = '0px'; x.fillText('改版', lx + 34, ly + 150); x.font = '500 58px Fraunces'; x.fillText('· The redesign', lx + 34 + 128, ly + 150);
    x.font = '500 26px "IBM Plex Mono"'; x.fillStyle = COL.soft; x.letterSpacing = '2px';
    x.fillText('#17 → #35 · 29–30 SEP 2026', lx + 36, ly + 205);
  });
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: coverTex, side: THREE.FrontSide }));
  cover.position.set(FW / 2, 0, 0); hinge.add(cover);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ color: '#C4A87C', side: THREE.BackSide }));
  inside.position.set(FW / 2, 0, -0.01); hinge.add(inside);
  return { g, hinge, back, FW, FH };
}

// load one footage frame into a sheet (ImageBitmap; the shader flips v)
const cache = new Map();
export async function frameInto(mesh, url, idx) {
  const d = mesh.userData; if (d.frame === idx && d.url === url) return;
  let bmp = cache.get(url);
  if (!bmp) { const r = await fetch(url); if (!r.ok) return; bmp = await createImageBitmap(await r.blob()); cache.set(url, bmp); if (cache.size > 24) cache.delete(cache.keys().next().value); }
  d.map.image = bmp; d.map.needsUpdate = true; d.u.uHasMap.value = 1; d.frame = idx; d.url = url;
}

export { canvasTex };
