/* c-shot/world.js — the paper theatre the one shot travels through.

   The desk is the home page's own drawing, cut into its layers (assets/derived/desk, placed by desk-geo.js) and stood
   on planes at staged depths, each scaled so the opening frame is the drawing exactly. The laptop's screen holds the
   Building page, and the Building page is a world of its own: the clean board, and the pieces lifted off it (the
   card, its peeking tabs, its pin), then the dossier and the chapter page, each at the box it had on the real page.
   Page space is css px, y down; P() puts it in the screen's group. Everything is unlit paper: MeshBasicMaterial,
   drawn in painter's order (renderOrder), no depth, no light, no fog. */
export const S = 357 / 1440;                 // the laptop's screen is 357 desk px wide: one page px in desk px
export const SCREEN = { x: 341, y: 278, w: 357, h: 206 };  // the screen's inside, in desk px (measured from laptop.webp)
export const CAM0 = { x: 724, y: -600, d: 1720 };          // the opening camera: the whole desk, the drawing's own framing

export function build(THREE, tex) {
  const scene = new THREE.Scene();
  let order = 0;
  const G = window.FY_DESK;
  const mat = (map, opt = {}) => new THREE.MeshBasicMaterial(Object.assign({ map, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide }, opt));
  // A plane w×h centred at (cx, cy) in its parent's units (y already flipped by the caller).
  function plane(parent, map, w, h, cx, cy, z, opt) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(map, opt));
    m.position.set(cx, cy, z); m.renderOrder = order++; parent.add(m); return m;
  }
  // Desk layers: depth from each object's foot on the table, scale compensated about the opening camera.
  const desk = new THREE.Group(); scene.add(desk);
  const depthOf = (foot) => Math.max(0, (foot - 470) * .28);
  function layer(src, box, z, cell) {
    const g = new THREE.Group(); const k = (CAM0.d - z) / CAM0.d;
    g.position.set(CAM0.x * (1 - k), CAM0.y * (1 - k), z); g.scale.setScalar(k); desk.add(g);
    const t = tex(src);
    if (cell) { t.repeat.set(1 / cell, 1); t.offset.set(0, 0); }
    const [x, y, w, h] = box; return { g, m: plane(g, t, w, h, x + w / 2, -(y + h / 2), 0) };
  }
  const O = G.obj, L = G.layers;
  layer('plate', L.plate.box, 0); layer('edge', L.edge.box, 0);
  const tones = { plant: 'tone-plant', laptop: 'tone-laptop', mug: 'tone-mug', camera: 'tone-camera' };
  for (const k in tones) layer(tones[k], L[tones[k]].box, depthOf(O[k].foot) - .5);
  const byFoot = ['frame', 'plant', 'laptop', 'mug', 'bird', 'camera', 'book'].sort((a, b) => O[a].foot - O[b].foot);
  const obj = {};
  for (const k of byFoot) {
    const z = depthOf(O[k].foot);
    if (k === 'frame') obj[k] = layer('strip-frame', O.frame.box, z, 4);
    else if (k === 'book') obj[k] = layer('strip-book', O.book.box, z, 6);
    else if (k === 'bird') obj[k] = layer('strip-bird', O.bird.box, z, 6);
    else obj[k] = layer(k, L[k].box, z);
    if (k === 'plant') layer('leaf', L.leaf.box, z + .1);
  }
  // The screen: its own group, at the laptop's depth and compensation, one unit a page px.
  const zl = depthOf(O.laptop.foot) + .3, kl = (CAM0.d - zl) / CAM0.d;
  const page = new THREE.Group();
  page.position.set(CAM0.x * (1 - kl) + SCREEN.x * kl, CAM0.y * (1 - kl) - SCREEN.y * kl, zl);
  page.scale.setScalar(S * kl); desk.add(page);
  const P = (x, y, z = 0) => new THREE.Vector3(x, -y, z);
  const part = (name, box, z, opt) => { const [x, y, w, h] = box; return plane(page, tex(name), w, h, x + w / 2, -(y + h / 2), z, opt); };
  const geo = window.PARTS;
  // The page as the screen shows it: its top 831 px (the screen's 1.73:1), the rest only ever seen through the card.
  const clean = tex('b-clean'); clean.repeat.set(1, 831 / 1100); clean.offset.set(0, 1 - 831 / 1100);
  plane(page, clean, 1440, 831, 720, -415.5, 0);
  const contact = plane(page, tex('dots'), 713, 490, 166 + 356.5 + 6, -(476 + 245 + 8), .1, { opacity: 0 });
  // The card: a pivot at its pin's tip, the paper and its peeking tabs hung from it.
  const pinTip = [516.5, 499.5];
  const card = new THREE.Group(); card.position.copy(P(pinTip[0], pinTip[1], .2)); page.add(card);
  const cardIn = (name, box, z) => { const [x, y, w, h] = box; return plane(card, tex(name), w, h, x + w / 2 - pinTip[0], -(y + h / 2 - pinTip[1]), z); };
  const peek = cardIn('b-peek', geo['b-peek'], -.1);
  const paper = cardIn('b-card', geo['b-card'], 0);
  const pin = part('b-pin', geo['b-pin'], .3);
  // The dossier: sheet and tabs at the boxes they had in the hand, slid up behind the card until it comes out.
  const dos = new THREE.Group(); page.add(dos);
  const dosIn = (name, box, z) => { const [x, y, w, h] = box; return plane(dos, tex(name), w, h, x + w / 2, -(y + h / 2), z); };
  const tabs = [1, 2, 3, 4, 5].map((i) => dosIn('d-tab' + i, geo['d-tab' + i], -.05));
  const sheet = dosIn('d-sheet', geo['d-sheet'], 0);
  const dosTone = plane(dos, tex('dots'), 520, 34, 720, -(356 + 16), .05, { opacity: 0 });
  // Card and dossier are lifted out of the screen: they draw after everything on the board, the card over its dossier.
  dos.children.forEach((m) => { m.renderOrder += 1000; }); card.children.forEach((m) => { m.renderOrder += 1500; });
  // The chapter page, laid over the dossier from the right; its fore-edge slot waits for the flying tab.
  const chap = new THREE.Group(); page.add(chap);
  const ptex = tex('p-page');
  const chapPaper = plane(chap, ptex, 1440, 1600, 720, -800, 0);
  const rail = plane(chap, tex('rail'), RAIL.w, RAIL.h, RAIL.x + RAIL.w / 2, -(RAIL.y + RAIL.h / 2), .1);
  const tag = plane(chap, tex('tag'), 168, 68, 132 + 84, -(34 + 34), .2);
  // The seals, split where the white-text seal ends: each is stamped on its own.
  const sealTex = [tex('p-seal'), tex('p-seal').clone()];
  sealTex[0].repeat.set(70 / 168, 1); sealTex[1].repeat.set(50 / 168, 1); sealTex[1].offset.set(70 / 168, 0); sealTex[1].needsUpdate = true;
  const seals = [plane(chap, sealTex[0], 70, 68, 132 + 35, -(34 + 34), .3), plane(chap, sealTex[1], 50, 68, 132 + 70 + 25, -(34 + 34), .31)];
  const slot = plane(chap, tex('p-tab3'), 151, 31, 1169 + 75.5, -(367 + 15.5), .15, { opacity: 0 });
  chap.children.forEach((m) => { m.renderOrder += 2000; });
  const flyer = plane(page, tex('d-tab3'), 118, 31, 0, 0, 0); flyer.renderOrder = 3000; flyer.visible = false;
  return { scene, desk, page, P, card, paper, peek, pin, contact, dos, dosTone, sheet, tabs, chap, chapPaper, rail, tag, seals, slot, flyer, obj };
}
// The rail's canvas: the page's margin, x 250–400, y 580–1460 (page px), drawn at 3×.
export const RAIL = { x: 250, y: 580, w: 150, h: 880, k: 3 };
