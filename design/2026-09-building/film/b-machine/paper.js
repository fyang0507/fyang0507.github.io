/* b-machine/paper.js — the machine's paper: sheets printed on both sides, folded as an accordion.

   A sheet is N strips side by side. Closing the accordion tilts them alternately (+γ, −γ) about their shared creases,
   so the sheet crimps into a zigzag that stays on the table, then stands as a thin fan. Turning the fan end over end
   about a horizontal axis through its middle and opening it again leaves the sheet turned over: the page printed on its
   back faces up. (A zigzag is symmetric, so it never has to pass through the table.)

   One shader for every strip: the front face shows the before capture, the back face the after capture with u mirrored.
   Tone is countable marks, never a gradient: an ink dot grid printed in the sheet's own uv (so the dots travel with the
   paper), whose dots grow with the strip's tilt away from the eye and near a crease where two faces close on each
   other. Once a sheet has been folded its creases stay, as hairlines. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export const SHEET_W = 16, SHEET_H = 11;

const VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  vUv = uv; vW = mat3(modelMatrix) * normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalMatrix * normal; vV = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D tA; uniform sampler2D tB;
uniform float u0; uniform float uw; uniform float close; uniform float creases; uniform float n;
uniform vec3 ink; uniform float aspect;
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vW;
float dotAt(vec2 p, float tone){
  // a 45-degree screen of ink dots in the sheet's uv; dot area follows tone
  vec2 g = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
  vec2 f = fract(g) - 0.5; float d = length(f);
  float r = 0.5 * sqrt(clamp(tone, 0.0, 0.36));   // coverage stays under a third
  float aa = fwidth(d) * 0.9 + 1e-4;
  return 1.0 - smoothstep(r - aa, r + aa, d);
}
void main(){
  float su = u0 + vUv.x * uw;
  vec3 col = gl_FrontFacing ? texture2D(tA, vec2(su, vUv.y)).rgb : texture2D(tB, vec2(1.0 - su, vUv.y)).rgb;
  float facing = abs(dot(normalize(vN), normalize(-vV)));
  // tilt off the table (so a flat sheet carries no tone), darker as the face turns from the eye
  float tiltW = 1.0 - abs(normalize(vW).z);
  float tilt = smoothstep(0.08, 0.9, tiltW) * mix(0.35, 1.0, 1.0 - facing);
  // contact: two faces closing on each other near each crease of this strip
  float e = min(vUv.x, 1.0 - vUv.x);
  float contact = close * pow(1.0 - clamp(e / 0.5, 0.0, 1.0), 1.8) * 0.6;
  float tone = max(tilt * 0.5, contact);
  float cells = 72.0;
  float dt = dotAt(vec2(su * cells, vUv.y * cells / aspect), tone);
  col = mix(col, col * ink * 1.6, dt * 0.45);
  // the creases, once made, stay: a hairline at each inner edge
  float fw = fwidth(vUv.x) * 1.4;
  float edgeL = (u0 > 0.001) ? 1.0 - smoothstep(0.0, fw, vUv.x) : 0.0;
  float edgeR = (u0 + uw < 0.999) ? 1.0 - smoothstep(0.0, fw, 1.0 - vUv.x) : 0.0;
  col = mix(col, ink, max(edgeL, edgeR) * creases * 0.32);
  gl_FragColor = vec4(col, 1.0);
}`;

// A print: the capture on cream stock, with its caption in the bottom margin.
export function printTexture(img, left, right, renderer) {
  const W = 2048, H = Math.round(2048 * SHEET_H / SHEET_W);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#FEFAEE'; x.fillRect(0, 0, W, H);
  const m = 46, iw = W - 2 * m, ih = Math.round(iw * img.height / img.width);
  x.drawImage(img, m, 40, iw, Math.min(ih, H - 150));
  x.strokeStyle = 'rgba(51,48,43,.16)'; x.lineWidth = 2; x.strokeRect(m, 40, iw, Math.min(ih, H - 150));
  x.font = '500 30px "IBM Plex Mono"'; x.fillStyle = '#6D6559'; x.textBaseline = 'alphabetic';
  x.letterSpacing = '2px';
  x.fillText(left, m, H - 44);
  x.textAlign = 'right'; x.fillText(right, W - m, H - 44);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export class Sheet {
  constructor(tA, tB, n = 4) {
    this.n = n; this.w = SHEET_W / n;
    this.turn = new THREE.Group();          // position = the fan's middle; rotation.y = the turn
    this.zig = new THREE.Group(); this.turn.add(this.zig);
    this.strips = [];
    const ink = new THREE.Color('#33302B');
    for (let i = 0; i < n; i++) {
      // each strip runs a hair under its right-hand neighbour, so no crack opens along a crease
      const ov = i < n - 1 ? 0.03 : 0, g = new THREE.PlaneGeometry(this.w + ov, SHEET_H, 1, 1); g.translate((this.w + ov) / 2, 0, 0);
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, extensions: { derivatives: true },
        uniforms: { tA: { value: tA }, tB: { value: tB }, u0: { value: i / n }, uw: { value: (1 + (i < n - 1 ? 0.03 / this.w : 0)) / n }, close: { value: 0 }, creases: { value: 0 },
          n: { value: n }, ink: { value: new THREE.Vector3(ink.r, ink.g, ink.b) }, aspect: { value: SHEET_W / SHEET_H } }
      });
      const m = new THREE.Mesh(g, mat); this.zig.add(m); this.strips.push(m);
    }
  }
  // gamma: the accordion's tilt (0 flat .. ~1.47 a standing fan); psi: the turn (0 .. π); at: [x, y] of the sheet's
  // middle on the table; lift: height of the whole thing; creases: 0..1, the memory of having been folded.
  pose({ gamma = 0, psi = 0, at = [0, 0], lift = 0, creases = 0, rot = 0 }) {
    const { n, w } = this, cg = Math.cos(gamma), sg = Math.sin(gamma), h = w * sg;
    let x = -n * w * cg / 2, z = -h / 2;
    for (let i = 0; i < n; i++) {
      const a = i % 2 === 0 ? gamma : -gamma, s = this.strips[i];
      s.position.set(x, 0, z);
      s.rotation.set(0, -a, 0);
      x += w * Math.cos(a); z += w * Math.sin(a);
      s.material.uniforms.close.value = F_clamp((sg - 0.08) / 0.8);
      s.material.uniforms.creases.value = creases;
    }
    // the clearance a fan of this width needs to turn (and to wobble past π) without touching the bed
    this.turn.position.set(at[0], at[1], h / 2 + lift + 0.02 + (n * w * cg / 2) * Math.abs(Math.sin(psi)));
    this.turn.rotation.set(0, psi, rot);
  }
}
function F_clamp(x) { return Math.min(1, Math.max(0, x)); }

// A stamped outline label: ink box, IBM Plex Mono, on transparent ground.
export function labelTexture(text, { size = 40, pad = 26, color = '#33302B', box = true } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = `500 ${size}px "IBM Plex Mono", "Noto Serif SC"`; x.letterSpacing = '1px';
  const tw = Math.ceil(x.measureText(text).width);
  c.width = tw + pad * 2 + 8; c.height = Math.round(size * 1.9) + 8;
  x.font = `500 ${size}px "IBM Plex Mono", "Noto Serif SC"`; x.letterSpacing = '1px';
  x.strokeStyle = color; x.fillStyle = color; x.lineWidth = 3.2; x.lineJoin = 'round';
  if (box) { x.beginPath(); x.roundRect(4, 4, c.width - 8, c.height - 8, 5); x.stroke(); }
  x.textBaseline = 'middle'; x.fillText(text, 4 + pad, c.height / 2 + 1);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
  return { tex: t, aspect: c.width / c.height };
}

// The seals from the site's header (the white-text 弗雷德 and the red-text FRED YANG), without the written motto.
// The carved lines are cut out of the stone, so the ground shows through them.
export function sealTexture(svgText, color) {
  const body = svgText.match(/class="seal-body" d="([^"]+)"/)[1];
  const g1 = svgText.slice(svgText.indexOf('<g class="site-identity-seal"'), svgText.indexOf('<g class="site-identity-seal"', svgText.indexOf('<g class="site-identity-seal"') + 5));
  const g2 = svgText.slice(svgText.lastIndexOf('<g class="site-identity-seal"'), svgText.lastIndexOf('</svg>'));
  const cuts = [...g1.matchAll(/<g class="seal-cut" stroke-width="([\d.]+)">(.*?)<\/g>/g)].map((m) => `<g stroke="#000" stroke-width="${m[1]}" fill="none" stroke-linecap="square" stroke-linejoin="miter">${m[2]}</g>`).join('');
  const t1 = g1.match(/transform="([^"]+)"/)[1], t2 = g2.match(/transform="([^"]+)"/)[1];
  const inner2 = g2.slice(g2.indexOf('>') + 1).replace(/class="seal-line"/g, `fill="none" stroke="${color}" stroke-linecap="square" stroke-linejoin="miter"`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 126 72" width="1260" height="720">
    <g transform="${t1}"><mask id="m" maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120"><path d="${body}" fill="#fff"/>${cuts}</mask>
    <path d="${body}" fill="${color}" mask="url(#m)"/></g>
    <g transform="${t2}">${inner2}</svg>`;
  return new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = 1260; c.height = 720; c.getContext('2d').drawImage(im, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; ok({ tex: t, aspect: 126 / 72 });
    };
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
