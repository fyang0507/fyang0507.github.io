/* lib/reading/hero.js — the hero settles. The cover is a plate pinned behind the top of the window; reading pulls
   the page's paper up over it, and the paper prints: just ahead of its hand-cut edge the cover is re-screened as a
   coarse colour halftone (one dot per cell, colour sampled from the cover, size from its tone) that steps down band
   by band until only paper is left. The halftone has a depth D(y) that is part of the scroll mapping: D(0) = 0, so
   the top of the page is the clean cover ending in one smooth cut edge; D grows 1:1 with the first pixels of scroll
   and eases to the full wedge Z by y = R = min(2Z, sL). Scroll back to the top and the cover is whole again.
   The title rides slower than the page, shrinks and flies into the nav; when the paper reaches the top the nav
   settles from n0 to n1 and a pencil hairline is drawn outward from the title, then the pen goes on to the margin.
   Dark mode is the papered path: the same plate and flight, D ≡ 0 (no dots). Reduced motion: the plate scrolls with
   the page, never any dots, and the nav turns to paper in one step.
   Test hooks: plate[data-depth] (current D), .rnav.landed. Ported from design/2026-09-motion r3-08a-hero.js. */
import { esc } from './notes.js';

const NS = 'http://www.w3.org/2000/svg', CJK = /[　-〿㐀-鿿＀-￯]/;
const smooth = (t) => Motion.smooth(Motion.clamp(t, 0, 1));

export function initHero(ctx) {
  const html = document.documentElement, root = ctx.root, post = ctx.post;
  const nav = document.querySelector('.rnav'), navPlate = nav.querySelector('.nav-plate');
  const navTitle = nav.querySelector('.nav-title'), navTitleT = navTitle.querySelector('.nav-title-t'), backT = nav.querySelector('.back-t');
  const h1 = root.querySelector('.article-intro .title'), eyebrow = root.querySelector('.article-intro .eyebrow');
  const H = { W: 0, B0: 0, c: 14, band: 28, Z: 200, R: 400, D: 0, J: 20, cols: 0, rows: 0, col: null, rad: null, jit: null, dpr: 1,
    lastF: NaN, lastD: NaN, landed: false, rmState: '', f: null, paper: '', P: [0, 0, 0] };   // paper: read from --paper at layout

  // the plate (page layer) and its registered slice inside the nav; no cover, no plate
  let plate = null, img = null, cv = null, ncv = null;
  if (post.cover) {
    const art = '<div class="plate-art"><img class="plate-img" src="' + post.cover + '" srcset="' + (post.coverSrcset || '') + '" sizes="100vw" alt="" decoding="async"></div>';
    plate = document.createElement('div');
    plate.className = 'plate'; plate.setAttribute('aria-hidden', 'true');
    plate.innerHTML = art + '<canvas class="plate-cv"></canvas>';
    document.body.insertBefore(plate, document.body.firstChild);
    navPlate.innerHTML = '<div class="nav-plate-in">' + art + '<canvas class="plate-cv"></canvas></div>';
    img = plate.querySelector('.plate-img'); cv = plate.querySelector('canvas'); ncv = navPlate.querySelector('canvas');
    if (!img.complete) img.addEventListener('load', ctx.layout, { once: true });
  }
  const fly = document.createElement('div');
  fly.className = 'fly'; fly.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fly);
  const hair = document.createElementNS(NS, 'svg');
  hair.setAttribute('class', 'nav-hair'); hair.setAttribute('aria-hidden', 'true');
  hair.innerHTML = '<path/><path/>';
  nav.appendChild(hair);
  const hairL = hair.firstChild, hairR = hair.lastChild;

  function readPaper() {
    const v = getComputedStyle(html).getPropertyValue('--paper').trim(), m = v.match(/^#([0-9a-f]{6})$/i);
    H.paper = v;
    if (m) H.P = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  }

  /* ---- the plate's halftone screen ---- */
  function sample() {
    const c = H.c, cols = H.cols, rows = H.rows, n = cols * rows, P = H.P;
    H.col = new Array(n); H.rad = new Float32Array(n);
    let data = null;
    if (img && img.complete && img.naturalWidth) {
      const oc = document.createElement('canvas'); oc.width = cols; oc.height = rows;
      const o = oc.getContext('2d', { willReadFrequently: true });
      // the <img>'s own geometry: object-fit cover, object-position 50% 42%, scale(1.14) about the centre
      const iw = img.naturalWidth, ih = img.naturalHeight, s0 = Math.max(H.W / iw, H.B0 / ih), S = 1.14;
      const w0 = iw * s0, h0 = ih * s0, x0 = (H.W - w0) * .5, y0 = (H.B0 - h0) * .42;
      const x = H.W / 2 - (H.W / 2 - x0) * S, y = H.B0 / 2 - (H.B0 / 2 - y0) * S;
      o.drawImage(img, (x + c) / c, y / c, w0 * S / c, h0 * S / c);   // cell i is centred at i·c − c/2
      try { data = o.getImageData(0, 0, cols, rows).data; } catch (e) { data = null; }
    }
    for (let i = 0; i < n; i++) {
      let r = 200, g = 190, b = 175;
      if (data) { r = data[i * 4]; g = data[i * 4 + 1]; b = data[i * 4 + 2]; }
      const L = (.299 * r + .587 * g + .114 * b) / 255;
      r += (L * 255 - r) * .22; g += (L * 255 - g) * .22; b += (L * 255 - b) * .22;   // the <img>'s saturate(.78)
      const a = .8 - Math.max(0, .42 - L) * .5;                                   // dark cells held back so type over them reads
      H.col[i] = 'rgb(' + Math.round(P[0] + (r - P[0]) * a) + ',' + Math.round(P[1] + (g - P[1]) * a) + ',' + Math.round(P[2] + (b - P[2]) * a) + ')';
      H.rad[i] = c * .6 * Math.sqrt(.18 + .82 * Math.min(1, Math.max(.1, (.97 - L) / .78)));
    }
  }
  function jitter() {
    // a hand-cut edge, not a ruler: a slow wobble per column, seeded per essay (stable, never re-rolled)
    const r = Pen.rng('plate-' + post.id), a = r() * 6, b = r() * 6;
    H.jit = new Float32Array(H.cols);
    for (let i = 0; i < H.cols; i++) {
      const w = .5 + .5 * (.62 * Math.sin(i * .19 + a) + .38 * Math.sin(i * .053 + b));
      H.jit[i] = -H.J * Math.min(1, Math.max(0, w + (r() - .5) * .16));
    }
  }
  // the edge between columns, cosine-interpolated, so the cut is one smooth line rather than a staircase of cells
  function edge(x) {
    const u = (x + H.c / 4) / H.c, i = Math.max(0, Math.min(H.cols - 2, Math.floor(u))), t = (1 - Math.cos(Math.max(0, Math.min(1, u - i)) * Math.PI)) / 2;
    return H.jit[i] + (H.jit[i + 1] - H.jit[i]) * t;
  }
  function depth(y) {
    if (ctx.g.rm || ctx.dark() || !plate) return 0;
    const t = Math.min(1, Math.max(0, y / H.R));
    return H.Z * (1 - (1 - t) * (1 - t));
  }
  // F = window y of the paper's solid edge; D = how far above it the cover is re-screened. Above F − D: the cover.
  function draw(F, D) {
    if (!plate || (Math.abs(F - H.lastF) < .5 && Math.abs(D - H.lastD) < .5 && (D > 0) === (H.lastD > 0))) return;
    H.lastF = F; H.lastD = D; plate.dataset.depth = D.toFixed(1);
    const g2 = cv.getContext('2d'), c = H.c, W = H.W, B0 = H.B0, NB = Math.ceil(H.Z / H.band), bandE = H.band * D / H.Z;
    g2.setTransform(H.dpr, 0, 0, H.dpr, 0, 0);
    g2.clearRect(0, 0, W, B0);
    g2.fillStyle = H.paper;
    g2.beginPath(); g2.moveTo(-c, B0);
    for (let x = -c; x <= W + c; x += c / 2) g2.lineTo(x, F + edge(x) - D);
    g2.lineTo(W + c, B0); g2.closePath(); g2.fill();
    if (D >= 1) {
      const r0 = Math.max(0, Math.floor((F - D - H.J) / c) - 1), r1 = Math.min(H.rows - 1, Math.ceil(F / c) + 1);
      for (let row = r0; row <= r1; row++) {
        const y = row * c + c / 2, off = row % 2 ? c / 2 : 0;
        for (let i = 0; i < H.cols; i++) {
          const x = i * c + off - c / 2, d = F + edge(x) - y;          // how far this cell sits above the paper edge
          if (d < 0 || d >= D) continue;
          const u = Math.min(1, (Math.floor(d / bandE) + 1) / NB), k = row * H.cols + i;   // band by band, the wedge compressed to D
          g2.fillStyle = H.col[k]; g2.beginPath(); g2.arc(x, y, H.rad[k] * u, 0, 6.2832); g2.fill();
        }
      }
    }
    const n2 = ncv.getContext('2d');                // the nav shows the same plate, printed over by the same edge
    n2.setTransform(1, 0, 0, 1, 0, 0);
    n2.clearRect(0, 0, ncv.width, ncv.height);
    n2.drawImage(cv, 0, 0, ncv.width, ncv.height, 0, 0, ncv.width, ncv.height);
  }

  /* ---- the title's flight: every line of the title travels to its own place in the one-line nav title ---- */
  const vis = (el) => el.querySelector(ctx.lang() === 'en' ? '.en' : '.zh') || el;
  function textRect(el) {
    const r = document.createRange(); r.selectNodeContents(el);
    return [].slice.call(r.getClientRects()).filter((x) => x.width > 1)[0] || el.getBoundingClientRect();
  }
  function layoutFly() {
    const g = ctx.g, r = h1.getBoundingClientRect(), f = H.f = { ox: r.left, oy: r.top + scrollY, lines: [] };
    fly.style.left = f.ox + 'px'; fly.style.top = f.oy + 'px'; fly.style.width = r.width + 'px';
    const toks = vis(h1).textContent.match(/[　-〿㐀-鿿＀-￯]|[^\s　-〿㐀-鿿＀-￯]+|\s+/g) || [];
    fly.innerHTML = '<div class="title fly-measure">' + toks.map((t) => (/^\s+$/.test(t) ? t : '<span>' + esc(t) + '</span>')).join('') + '</div>';
    const groups = [], measure = fly.firstChild;
    let cur = null;
    [].forEach.call(measure.childNodes, (n) => {                     // words grouped by the line the h1 puts them on
      if (n.nodeType === 3) { if (cur) cur.text += n.textContent; return; }
      const b = n.getBoundingClientRect();
      if (!cur || Math.abs(b.top - cur.top) > 4) groups.push(cur = { top: b.top, left: b.left, right: b.right, text: '' });
      cur.text += n.textContent; cur.right = Math.max(cur.right, b.right);
    });
    measure.remove();
    if (g.narrow) {
      const ar = nav.querySelector('.back-arrow').getBoundingClientRect(), rt = nav.querySelector('.right').getBoundingClientRect();
      html.style.setProperty('--nt-l', Math.round(ar.right + 1) + 'px');
      html.style.setProperty('--nt-r', Math.round(g.vw - rt.left + 12) + 'px');
    }
    const tgt = textRect(vis(navTitleT)), nr = navTitle.getBoundingClientRect(), fs = parseFloat(getComputedStyle(h1).fontSize);
    const slotR = nr.right - parseFloat(getComputedStyle(navTitle).paddingRight);
    f.k = parseFloat(getComputedStyle(navTitleT).fontSize) / fs;
    f.tx = tgt.left; f.ty = tgt.top; f.cx = g.narrow ? tgt.left + tgt.width / 2 : g.vw / 2;
    let off = 0;
    groups.forEach((gp, j) => {
      const d = document.createElement('div'), txt = gp.text.replace(/\s+$/, '');
      d.className = 'title fly-line'; d.innerHTML = '<span>' + esc(txt) + '</span>';
      fly.appendChild(d);
      d.style.left = (gp.left - f.ox) + 'px'; d.style.top = (gp.top - f.oy) + 'px';
      const sr = d.firstChild.getBoundingClientRect(), sx = sr.left - gp.left, sy = sr.top - gp.top;   // half-leading inside the box
      const L = { el: d, bx: gp.left - f.ox - sx, by: gp.top - f.oy - sy, sx: sx, sy: sy, ax: gp.left, ay: gp.top };
      d.style.left = L.bx + 'px'; d.style.top = L.by + 'px';
      if (j) off += CJK.test(groups[j - 1].text.trim().slice(-1)) ? 0 : fs * .26;
      L.tx = f.tx + off * f.k; L.ty = f.ty;
      L.fits = L.tx + (gp.right - gp.left) * f.k <= slotR + 2;         // a line that would land past an ellipsis bows out
      off += gp.right - gp.left;
      f.lines.push(L);
    });
    if (eyebrow) {
      const eb = document.createElement('div');
      eb.className = 'fly-eb'; eb.appendChild(eyebrow.cloneNode(true)); fly.appendChild(eb);
      f.eb = { el: eb, bx: eyebrow.offsetLeft - h1.offsetLeft, by: eyebrow.offsetTop - h1.offsetTop, last: f.lines[f.lines.length - 1] };
      eb.style.left = f.eb.bx + 'px'; eb.style.top = f.eb.by + 'px';
    }
  }
  function flyAt(t) {
    const f = H.f;
    if (!f || !f.lines.length || t <= 0 || t >= 1 || ctx.g.rm) {
      fly.style.visibility = 'hidden'; h1.style.opacity = ''; if (eyebrow) eyebrow.style.opacity = '';
      backT.style.opacity = ''; return;
    }
    fly.style.visibility = 'visible'; h1.style.opacity = '0'; if (eyebrow) eyebrow.style.opacity = '0';   // hidden to the eye, still the page's heading
    const k = 1 + (f.k - 1) * smooth(t), ey = smooth(t), ex = smooth((t - .12) / .88);   // y lags the page, never leads it
    // later lines hang off the first line at the current scale: they slide beside it, then rise into the one line
    const mx = smooth((t - .28) / .38), my = smooth((t - .56) / .34), L0 = f.lines[0];
    f.lines.forEach((L, j) => {
      if (!j) { L.px = L.ax + (L.tx - L.ax) * ex; L.py = L.ay + (L.ty - L.ay) * ey; }
      else {
        L.px = L0.px + ((L.ax - L0.ax) + ((L.tx - L0.tx) / f.k - (L.ax - L0.ax)) * mx) * k;
        L.py = L0.py + (L.ay - L0.ay) * (1 - my) * k;
      }
      const X = L.px - (f.ox + L.bx + L.sx * k), Y = L.py - (f.oy + L.by + L.sy * k);
      L.el.style.transform = 'translate(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
      L.el.style.opacity = L.fits ? '' : (1 - smooth((t - .6) / .25)).toFixed(3);
    });
    if (f.eb) {                                                      // the subtitle rides under the last line and lets go early
      const E = f.eb, Lz = E.last, hx = f.ox + E.bx, hy = f.oy + E.by;
      E.el.style.transform = 'translate(' + (Lz.px + (hx - Lz.ax) * k - hx).toFixed(2) + 'px,' + (Lz.py + (hy - Lz.ay) * k - hy).toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
      E.el.style.opacity = (1 - smooth(t / .35)).toFixed(3);
    }
    backT.style.opacity = ctx.g.narrow ? (1 - smooth((t - .52) / .26)).toFixed(3) : '';   // makes room for the arriving title
  }

  /* ---- landing: the nav settles, a hairline is drawn outward from the title ---- */
  function hairPaths() {
    const g = ctx.g, cx = H.f ? H.f.cx : g.vw / 2, rL = Pen.rng('hair-l'), rR = Pen.rng('hair-r');
    hair.setAttribute('width', g.vw); hair.setAttribute('height', 6);
    const line = (x0, x1, r) => {
      const pts = [], n = Math.max(2, Math.round(Math.abs(x1 - x0) / 60));
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, 3 + (r() - .5) * .9 + Math.sin(t * 5 + r()) * .35]); }
      return Pen.smooth(pts);
    };
    hairL.setAttribute('d', line(cx, -4, rL)); hairR.setAttribute('d', line(cx, g.vw + 4, rR));
    [hairL, hairR].forEach((p) => {
      const L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L);
      p.getAnimations().forEach((a) => a.cancel());
      p.style.strokeDashoffset = H.landed || H.rmState === 'paper' ? 0 : Pen.hiddenAt(p, L);
    });
  }
  function setLanded(on) {
    if (on === H.landed) return;
    H.landed = on;
    nav.classList.toggle('landed', on);
    [hairL, hairR].forEach((p) => (on ? Pen.draw(p, { duration: 460 }) : Pen.erase(p, { duration: 160 })));
    ctx.land(on);
  }

  function layout() {
    const g = ctx.g;
    readPaper();
    H.W = g.vw; H.B0 = g.b0; H.c = g.cell; H.band = g.cell * 2; H.Z = g.z; H.R = Math.min(2 * g.z, g.sL); H.J = Math.round(g.cell * 1.6);
    H.dpr = Math.min(2, window.devicePixelRatio || 1);
    H.cols = Math.ceil(H.W / H.c) + 2; H.rows = Math.ceil(H.B0 / H.c) + 1;
    if (plate) {
      cv.width = Math.round(H.W * H.dpr); cv.height = Math.round(H.B0 * H.dpr);
      ncv.width = cv.width; ncv.height = Math.round(g.n0 * H.dpr);
      sample(); jitter(); H.lastF = H.lastD = NaN;
    }
    if (g.rm) { nav.classList.remove('landed'); H.landed = false; }
    else { nav.classList.remove('papered', 'titled'); H.rmState = ''; }
    layoutFly(); hairPaths();
    if (g.rm && plate) { plate.style.visibility = ''; draw(H.B0 - g.pad, 0); }   // the clean cover and its cut edge, never dots
  }
  function update(y) {
    const g = ctx.g;
    if (g.rm) {
      // discrete states: paper and a hairline drawn in place the moment anything scrolls under the nav
      const st = y > 1 ? 'paper' : 'top';
      if (st !== H.rmState) { H.rmState = st; nav.classList.toggle('papered', st === 'paper'); hairPaths(); }
      nav.classList.toggle('titled', y > ctx.top(h1) + h1.offsetHeight - g.n0);
      flyAt(0); return;
    }
    const F = H.B0 - g.pad - y;
    H.D = depth(y);
    if (plate) { plate.style.visibility = F < -H.J - H.c ? 'hidden' : ''; draw(Math.max(-H.J - H.c - 1, F), H.D); }
    flyAt(y / g.sL);
    if (!H.landed && y >= g.sL - .5) setLanded(true);
    else if (H.landed && y < g.sL - 6) setLanded(false);
  }

  ctx.onLayout(layout);
  ctx.onScroll(update);
  // the theme is a paper change: repaint the canvas in the new paper (and, in the dark, without dots); no nodes move
  ctx.onTheme(() => { readPaper(); if (plate) { sample(); H.lastF = H.lastD = NaN; if (ctx.g.rm) draw(H.B0 - ctx.g.pad, 0); } update(ctx.y()); });
}
