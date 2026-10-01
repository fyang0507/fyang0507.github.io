/* b-machine/board.js — the storyboard of the whole film (index.html?board), drawn by the same machine.

   Each panel poses the test's three sheets with other prints, stamps, and a camera, renders one frame with the test's
   renderer and pastes it into a grid with its caption. kit/../b-machine/board-shot.mjs takes the screenshot. */
const SHOTS = '../../shots/';
const F = () => window.FILM;
const PANELS = [
  { cap: '0:00–0:06 · cold open: round one, one page on the bed; the machine hums', A: ['r1-home', 'r1-home'], pose: [{}], cam: [0, -1.5, 1.05], hide: [1, 2] },
  { cap: '0:06–0:14 · Home: the page closes into a fan and turns; the seals come out (#31)', A: ['r1-home', 'main-home'], pose: [{ gamma: 1.05, psi: Math.PI, creases: 1 }], cam: [0, -1.2, .95], hide: [1, 2] },
  { cap: '0:14–0:22 · Writing: 中文 · EN, and the book in your hand is sharp (#22, #27)', A: ['r1-writing', 'main-writing'], pose: [{ gamma: 1.4, psi: 1.3, creases: 1, lift: .5 }], cam: [0, -1.2, .9], hide: [1, 2] },
  { cap: '0:22–0:32 · Building: a static board, the dossier tabs, Fraunces (#23, #28, #33) · the test', A: ['r1-building', 'main-building'], pose: [{ psi: Math.PI, creases: 1, gamma: .035 }], cam: [0, -2.3, 1.02], labels: [0, 1], hide: [1, 2] },
  { cap: '0:32–0:38 · the dossier: the old gradient wordmark goes in, the card and its dossier come out (#28)', A: ['r0-building', 'main-dossier'], pose: [{ gamma: .75, creases: 1 }], cam: [0, -1.2, .95], hide: [1, 2] },
  { cap: "0:38–0:46 · Fred Agent's five chapters: Reading's rail is the TOC; Overview LCP 944 → 820 ms (#32)", A: ['r1-principles', 'main-principles-read'], pose: [{ gamma: .55, psi: Math.PI, creases: 1 }], cam: [0, -1.2, .95], hide: [1, 2] },
  { cap: '0:46–0:52 · NJJoe in the dossier: CLS 0.061–0.074 → 0.000–0.001 (#34)', A: ['main-njjoe', 'main-njjoe'], pose: [{ psi: Math.PI, creases: 1, gamma: .035 }], cam: [0, -2.3, 1.02], stamp: ['#34 · CLS 0.061–0.074 → 0.000–0.001'], hide: [1, 2] },
  { cap: '0:52–1:02 · the fixes at double time, one crease each: #18 #19 #20 #21 #25 #26 #29 #30', slips: true, cam: [22, -.6, 2.1] },
  { cap: "1:02–1:10 · how it was made: Fred picks among boards (A, B, C → the dossier); the rest fold away", A: [SHOTS + 'a-01-preview-fred-agent-1440.jpg', SHOTS + 'a-01-preview-fred-agent-1440.jpg'], A2: [SHOTS + 'b-01-preview-fred-agent-1440.jpg', SHOTS + 'b-01-preview-fred-agent-1440.jpg'], A3: [SHOTS + 'c-01-preview-fred-agent-1440.jpg', SHOTS + 'c-01-preview-fred-agent-1440.jpg'],
    pose: [{ gamma: 1.2, creases: 1 }, { gamma: .9, creases: 1 }, {}], cam: [22, -1.4, 2.45], band: 2 },
  { cap: '1:10–1:16 · a beat of near-silence; the seals are stamped on the kraft', final: true },
  { cap: '1:16–1:24 · credits, stamped: made with Claude Opus 5.5; round one\'s before: Claude Design (Fable 5) + GPT-5.6-sol', credits: true, cam: [22, -12.2, .95] }
];
const SLIPS = ['#18 · in-page links stay on their page', '#19 · the shared runtime in lib/shared/', '#20 · the WIP sticker removed', '#21 · the iPhone bookcase, back',
  '#25 · three pen bugs', '#26 · Demos: 14 MB → 1.1 MB before scroll', '#29 · 0 Google requests', '#30 · no layout shift on phones'];

function slipTexture(THREE, text) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 704; const x = c.getContext('2d');
  x.fillStyle = '#FEFAEE'; x.fillRect(0, 0, 1024, 704);
  x.font = '500 50px "IBM Plex Mono"'; x.fillStyle = '#33302B'; x.textBaseline = 'middle';
  const [no, ...rest] = text.split(' · ');
  x.font = '500 150px "IBM Plex Mono"'; x.fillText(no, 70, 260);
  x.font = '500 46px "IBM Plex Mono"'; x.fillStyle = '#6D6559'; x.fillText(rest.join(' · '), 74, 470);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

export const boardPanels = {
  extraImages: ['main-home', 'r1-home', 'r1-writing', 'main-writing', 'main-njjoe', SHOTS + 'a-01-preview-fred-agent-1440.jpg', SHOTS + 'b-01-preview-fred-agent-1440.jpg', SHOTS + 'c-01-preview-fred-agent-1440.jpg'],
  async draw(w, api) {
    const { THREE, renderer, scene, sheets, imgs, labels, seal, colophon } = w;
    const PW = 470, PH = Math.round(PW * 9 / 16), G = 22, CAPH = 64, COLS = 4, ROWS = Math.ceil(PANELS.length / COLS);
    const board = document.createElement('canvas'); board.width = COLS * PW + (COLS + 1) * G; board.height = ROWS * (PH + CAPH) + G * 2 + 70;
    const b = board.getContext('2d'); b.fillStyle = '#FBF6EC'; b.fillRect(0, 0, board.width, board.height);
    b.font = '500 20px "IBM Plex Mono"'; b.fillStyle = '#33302B'; b.letterSpacing = '1.5px';
    b.fillText('B · 纸机器 · PAPER MACHINE — THE FULL FILM, ~84 S AT 100 BPM (STORYBOARD, RENDERED BY THE TEST\'S ENGINE)', G, 44);
    const tex = (n) => api.printTexture(imgs[n], n.includes('/') ? 'DESIGN BOARD · ' + n.split('/').pop().slice(0, 1).toUpperCase() : n.startsWith('main') ? 'ROUND TWO' : 'ROUND ONE', n.startsWith('main') ? '5c13009' : '', renderer);
    const setTex = (sh, a, bb) => sh.strips.forEach((s) => { s.material.uniforms.tA.value = tex(a); s.material.uniforms.tB.value = tex(bb); });
    const extras = [];
    for (let k = 0; k < PANELS.length; k++) {
      const P = PANELS[k];
      extras.splice(0).forEach((m) => scene.remove(m));
      labels.forEach((l) => { l.m.visible = false; }); seal.visible = false; colophon.visible = false;
      sheets.forEach((sh, i) => { sh.turn.visible = true; sh.turn.scale.set(1, 1, 1); sh.pose({ at: [api.SHEETS[i].x, 0], creases: 1, gamma: .035, psi: Math.PI }); });
      if (P.A) setTex(sheets[0], ...P.A);
      if (P.A2) setTex(sheets[1], ...P.A2);
      if (P.A3) setTex(sheets[2], ...P.A3);
      (P.pose || []).forEach((p, i) => sheets[i].pose({ at: [api.SHEETS[i].x, 0], ...p }));
      (P.hide || []).forEach((i) => { sheets[i].turn.visible = false; });
      (P.labels || []).forEach((i) => { labels[i].m.visible = true; labels[i].m.scale.set(1, 1, 1); });
      if (P.stamp) P.stamp.forEach((text, i) => { const L = api.labelTexture(text), h = .82; const m = new THREE.Mesh(new THREE.PlaneGeometry(h * L.aspect, h), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, depthWrite: false })); m.position.set(-8 + h * L.aspect / 2, -6.6 - i * 1.15, .003); scene.add(m); extras.push(m); });
      if (P.band != null) { const m = new THREE.Mesh(new THREE.PlaneGeometry(17.4, 12.4), new THREE.MeshBasicMaterial({ color: '#DCCF98' })); m.position.set(api.SHEETS[P.band].x, 0, .0015); scene.add(m); extras.push(m); const e = new THREE.Mesh(new THREE.PlaneGeometry(17.4, .08), new THREE.MeshBasicMaterial({ color: '#AD9650' })); e.position.set(api.SHEETS[P.band].x, -6.2, .0018); scene.add(e); extras.push(e); }
      if (P.slips) {
        sheets.forEach((sh) => { sh.turn.visible = false; });
        SLIPS.forEach((s, i) => {
          const sh = new api.Sheet(slipTexture(THREE, s), slipTexture(THREE, s), 2); sh.turn.scale.set(.42, .42, .42);
          sh.pose({ at: [-1 + (i % 4) * 15.5, (i < 4 ? 3.3 : -3.5)], gamma: [0, .9, 0, 1.3, .5, 0, 1.1, 0][i], creases: 1 });
          scene.add(sh.turn); extras.push(sh.turn);
        });
      }
      if (P.final) {
        setTex(sheets[0], 'r1-building', 'main-building'); setTex(sheets[1], 'r1-principles', 'main-principles-read'); setTex(sheets[2], 'r0-building', 'main-dossier');
        labels.forEach((l) => { l.m.visible = true; l.m.scale.set(1, 1, 1); }); seal.visible = true; colophon.visible = true;
        api.place({ tx: 22, ty: -3.2, s: 2.6, shake: 0 });
      } else if (P.credits) {
        sheets.forEach((sh) => { sh.turn.visible = false; });
        ['Made with Claude Opus 5.5', "Round one's before: Claude Design (Fable 5) + GPT-5.6-sol", 'fyang0507.github.io · round two · #18–#34'].forEach((text, i) => {
          const L = api.labelTexture(text, { size: 40, box: i < 2 }), h = i < 2 ? .9 : .7;
          const m = new THREE.Mesh(new THREE.PlaneGeometry(h * L.aspect, h), new THREE.MeshBasicMaterial({ map: L.tex, transparent: true, depthWrite: false }));
          m.position.set(22, -17.2 - i * 1.4, .003); scene.add(m); extras.push(m);
        });
        seal.visible = true;
        api.place({ tx: 22, ty: -15.6, s: 1.08, shake: 0 });
      } else {
        api.place({ tx: P.cam[0], ty: P.cam[1], s: P.cam[2], shake: 0 });
      }
      renderer.render(scene, w.camera);
      const col = k % COLS, row = Math.floor(k / COLS), x = G + col * (PW + G), y = 70 + row * (PH + CAPH);
      b.drawImage(renderer.domElement, x, y, PW, PH);
      b.font = '400 13.5px "IBM Plex Mono", "Noto Serif SC"'; b.fillStyle = '#33302B'; b.letterSpacing = '0px';
      wrap(b, P.cap, x, y + PH + 20, PW, 17);
    }
    renderer.domElement.style.display = 'none';
    board.style.cssText = 'display:block'; document.body.appendChild(board);
    window.BOARD = { w: board.width, h: board.height }; window.READY = true;
  }
};
function wrap(ctx, s, x, y, w, lh) {
  const words = s.split(' '); let line = '';
  for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (ctx.measureText(t).width > w && line) { ctx.fillText(line, x, y); y += lh; line = wd; } else line = t; }
  ctx.fillText(line, x, y);
}
