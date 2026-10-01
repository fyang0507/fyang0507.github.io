/* v1.1/hand.js — two things the film now draws for itself.
   · The hand: a small ink cursor at the pen's weight (≈ 22 px tall on a 1080 frame, whatever the zoom), with the
     site's three impact ticks around its tip for 180 ms after each press. It follows the take's pointer track, which
     the recorder writes beside every frame (the page itself shows no cursor: CURSOR=0), and while the page is lifted,
     the before's own track, on the before's sheet.
   · The close-ups at DPR 3: where the take shot a region again at 3× (the seal, the footnote), that crop is laid on the
     sheet exactly over its own place, so a close-up magnifies true pixels. Off during a lift (the crop can't curl). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const P = (x, y) => [(x - 640) / 100, (500 - y) / 100];
function tex(draw, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t;
}
// drawn at 8× its size: the tip at (16, 12) of a 160 × 200 canvas
const S = 8, TIP = [16, 12];
function arrow(x, ticks) {
  x.lineJoin = 'round'; x.lineCap = 'round';
  x.beginPath(); x.moveTo(TIP[0], TIP[1]); x.lineTo(TIP[0] + 1.2 * S, TIP[1] + 16.5 * S); x.lineTo(TIP[0] + 5.2 * S, TIP[1] + 12.4 * S); x.lineTo(TIP[0] + 11.6 * S, TIP[1] + 11.6 * S); x.closePath();
  x.fillStyle = '#FEFAEE'; x.fill(); x.strokeStyle = '#33302B'; x.lineWidth = 1.7 * S; x.stroke();
  if (ticks) {   // the three impact ticks, the site's (lib/shared: the press marks)
    x.lineWidth = 1.6 * S;
    [[-2.5, -1.2, -7.2, -3.0], [0.8, -3.2, 0.9, -8.2], [3.6, -2.1, 7.6, -5.6]].forEach(([a, b, c, d]) => { x.beginPath(); x.moveTo(TIP[0] + a * S, TIP[1] + b * S); x.lineTo(TIP[0] + c * S, TIP[1] + d * S); x.stroke(); });
  }
}
export const hand = {
  build(scene) {
    this.plain = tex((x) => { x.translate(60, 60); arrow(x, false); }, 220, 240);
    this.tick = tex((x) => { x.translate(60, 60); arrow(x, true); }, 220, 240);
    const g = new THREE.PlaneGeometry(1, 240 / 220); g.translate(0.5, -0.5 * 240 / 220, 0);   // origin at the canvas' top-left
    this.m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: this.plain, transparent: true, depthTest: false, depthWrite: false }));
    this.m.renderOrder = 999; this.m.visible = false; scene.add(this.m);
  },
  // f: the frame record [t, file, x, y, down]; presses: press times (s); u: that take's time; sheet: whose page
  frame(f, presses, u, sheet, cam, H) {
    if (!f || f[2] == null) { this.m.visible = false; return; }
    const W = Math.min(innerWidth, H);
    const size = 22 * (W / 1080) * (cam.h / H);            // the arrow ≈ 22 px tall on a 1080 frame, at every zoom
    const sc = size * 220 / (16.5 * S);                     // 1 world unit of the plane = 220 canvas px at scale 1
    const [lx, ly] = P(f[2], f[3]);
    const p = sheet.localToWorld(new THREE.Vector3(lx, ly, 0.03));
    this.m.scale.set(sc, sc, 1);
    this.m.position.set(p.x - (60 + TIP[0]) * sc / 220, p.y + (60 + TIP[1]) * sc / 220, p.z + 0.1);   // the tip on the pointer
    const hot = presses && presses.some((q) => u - q >= 0 && u - q < 0.18);
    this.m.material.map = hot ? this.tick : this.plain; this.m.visible = true;
  }
};

const cache = new Map();
// an ImageBitmap ignores a texture's flipY, so the crop is flipped as it's decoded
async function bitmap(url) { let b = cache.get(url); if (!b) { const r = await fetch(url); b = await createImageBitmap(await r.blob(), { imageOrientation: 'flipY' }); cache.set(url, b); if (cache.size > 12) cache.delete(cache.keys().next().value); } return b; }
export const overlays = {
  list: [],
  build(sheet, regions, base) {
    for (const [name, r] of Object.entries(regions)) {
      const [x, y, w, h] = r.rect, [cx, cy] = P(x + w / 2, y + h / 2);
      const t = new THREE.Texture(); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w / 100, h / 100), new THREE.MeshBasicMaterial({ map: t }));
      m.position.set(cx, cy, 0.004); m.visible = false; sheet.add(m);
      this.list.push({ name, m, t, base, frames: r.frames, t0: r.frames[0][1], t1: r.frames[r.frames.length - 1][1], shown: null });
    }
  },
  frame(u, loads) {
    for (const o of this.list) {
      if (u == null || u < o.t0 - 1e-4 || u > o.t1 + 1e-4) { o.m.visible = false; continue; }
      let lo = 0, hi = o.frames.length - 1; while (lo < hi) { const md = (lo + hi + 1) >> 1; if (o.frames[md][1] <= u + 1e-4) lo = md; else hi = md - 1; }
      const f = o.frames[lo][0];
      if (o.shown !== f) loads.push(bitmap(o.base + f).then((b) => { o.t.image = b; o.t.needsUpdate = true; o.shown = f; o.m.visible = true; }));
      else o.m.visible = true;
    }
  }
};
