/* rough/world.js — the film's one world: a kraft dossier on the desk, and in it a stack of live sheets.

   Each session of real footage is a pair of sheets: the site today on top, and underneath it, the site before #17
   (6237120), playing the same input at the same moment. The before is never shown beside the after: the top page is
   lifted from its bottom edge and rolled up over the top, as you'd flip up a pad's top page to look at the one under
   it (a cylinder curl in the vertex shader, on a spring), and it falls back. Between sessions the finished pair is pulled aside to the left, the way a Fred Agent chapter gives way to
   the next (#35's chapter move), and the next pair is already there.

   Units: 1 = 100 page px. A page is 12.8 × 10 (the 1280 × 1000 recordings), printed on a sheet with a 0.3 margin.
   Colour management is off: every hex and every footage pixel is written as it is. No light, no gradient; the only
   tone is countable dots: on a curling page, and on the page under it where the curl hovers (contact). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const PW = 12.8, PH = 10, M = 0.3, SW = PW + 2 * M, SH = PH + 2 * M;
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
uniform sampler2D uMap; uniform sampler2D uLabel; uniform float uHasMap; uniform vec3 uPaper; uniform vec3 uBack; uniform vec3 uInk;
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
  } else col = uBack;
  // a curling page carries tone where it turns away (its own tilt), a little on the way up, most at the side-on
  float tilt = sin(vTh) * 0.42;
  // contact: this page, where the page above it is lifted just over it
  float contact = 0.0;
  if (uCAmt > 0.0) { float d = (vS - uCP); contact = uCAmt * (1.0 - smoothstep(0.0, 1.6, d)) * step(0.0, d) * 0.5; }
  float tone = max(tilt, contact);
  if (tone > 0.02) col = mix(col, uInk, 0.62 * dotsAt(tone));
  gl_FragColor = vec4(col, 1.0);
}`;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.needsUpdate = true; t.userData.canvas = c; return t;
}
const blank = canvasTex(4, 4, () => {});
const K = 100; // label canvases: px per unit

// a sheet: the curl mesh with its footage texture and a label layer (typed margin labels)
export function sheet(opt) {
  const geo = new THREE.PlaneGeometry(SW, SH, 96, 76);
  const map = new THREE.Texture(); map.colorSpace = THREE.NoColorSpace; map.flipY = false; map.generateMipmaps = true; map.minFilter = THREE.LinearMipmapLinearFilter; map.anisotropy = 8;
  const label = canvasTex(Math.round(SW * K), Math.round(SH * K), (x, w, h) => { if (opt.label) opt.label(x, w, h); });
  const dir = new THREE.Vector2(0.22, -1).normalize();   // lifted from the bottom edge, a little from the right: a pad's top page
  const u = {
    uMap: { value: map }, uLabel: { value: label }, uHasMap: { value: 0 }, uPaper: { value: hex(COL.slip) }, uBack: { value: hex(COL.paper2) }, uInk: { value: hex(COL.ink) },
    uInset: { value: new THREE.Vector4(M / SW, M / SH, 1 - M / SW, 1 - M / SH) }, uDir: { value: dir }, uP: { value: 99 }, uR: { value: 0.55 }, uPhi: { value: 3.14159 },
    uCDir: { value: dir }, uCP: { value: 99 }, uCAmt: { value: 0 }, uCell: { value: 7 }
  };
  const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = { u, map, label, frame: -1 };
  return mesh;
}
// the extent of dot(P, dir) over the sheet: the curl starts past the far corner
const D0 = new THREE.Vector2(0.22, -1).normalize();
export const CURL_MAX = Math.abs(D0.x) * SW / 2 + Math.abs(D0.y) * SH / 2 + 0.05;

// the folder: kraft, a back cover the stack lies on, a front cover on a hinge along the left edge, and a label
export function folder(scene) {
  const g = new THREE.Group(); scene.add(g);
  const FW = SW + 1.6, FH = SH + 1.3;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ color: COL.kraft }));
  back.position.set(0.35, 0, 0.001); g.add(back);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(FW + 0.08, FH + 0.08), new THREE.MeshBasicMaterial({ color: COL.kraftEdge }));
  edge.position.set(0.35, -0.04, 0.0005); g.add(edge);
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
    x.font = '500 64px Fraunces'; x.letterSpacing = '0px'; x.fillText('The redesign', lx + 34, ly + 150);
    x.font = '500 26px "IBM Plex Mono"'; x.fillStyle = COL.soft; x.letterSpacing = '2px';
    x.fillText('#17 → #35 · 29–30 SEP 2026', lx + 36, ly + 205);
  });
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ map: coverTex, side: THREE.DoubleSide }));
  cover.position.set(FW / 2, 0, 0); hinge.add(cover);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), new THREE.MeshBasicMaterial({ color: '#C4A87C', side: THREE.BackSide }));
  inside.position.set(FW / 2, 0, -0.002); hinge.add(inside);
  return { g, hinge, back, FW, FH };
}

// an index tab on a sheet's fore-edge: kraft, a typed number and name, the PRs under it; banded in wheat when current
export function tab(text, prs) {
  const w = 3.1, h = 0.78;
  const tex = canvasTex(Math.round(w * K * 2), Math.round(h * K * 2), () => {});
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.userData = { tex, text, prs, band: -1, w, h };
  drawTab(m, 0);
  return m;
}
export function drawTab(m, band) {
  const d = m.userData; if (Math.abs(d.band - band) < 0.01) return; d.band = band;
  const c = d.tex.userData.canvas, x = c.getContext('2d'), w = c.width, h = c.height;
  x.clearRect(0, 0, w, h);
  x.fillStyle = '#D9C297'; x.beginPath(); x.moveTo(0, 6); x.lineTo(w - 24, 0); x.quadraticCurveTo(w, 0, w, 24); x.lineTo(w, h - 24); x.quadraticCurveTo(w, h, w - 24, h); x.lineTo(0, h - 6); x.closePath(); x.fill();
  x.strokeStyle = COL.kraftEdge; x.lineWidth = 3; x.stroke();
  if (band > 0) { x.fillStyle = COL.hl; x.globalAlpha = band; x.fillRect(46, 18, (w - 80) * band, 62); x.globalAlpha = 1; x.fillStyle = '#8F7A3C'; x.fillRect(46, 78, (w - 80) * band, 4); }
  x.fillStyle = COL.ink; x.font = '500 34px "IBM Plex Mono"'; x.fillText(d.text, 58, 62);
  x.fillStyle = COL.soft; x.font = '500 26px "IBM Plex Mono"'; x.fillText(d.prs, 58, 120);
  d.tex.needsUpdate = true;
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
