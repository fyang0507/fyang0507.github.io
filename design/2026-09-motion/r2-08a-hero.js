/* r2-08a-hero.js — D · the hero settles, made salient.
   The cover is a plate pinned behind the top of the window. Reading pulls the page's paper up over it, and the paper
   does not wipe: it prints. Just ahead of the paper edge the cover is re-screened as a coarse colour halftone (one dot
   per cell, dot colour sampled from the cover underneath, dot size from its tone), and the dots step down band by band
   until only paper is left. The screen is registered to the plate, so each dot shrinks in place as the edge passes it.
   The title rides slower than the page, shrinks and travels into the nav; the nav's own slice of the plate is printed
   over last; when the paper reaches the top, the title lands, the nav settles to its reading height and a pencil hairline
   is drawn outward from the title. One number ties it together: the paper edge sits `pad` above the first line of text,
   so the body always starts on solid paper, and it reaches y = 0 exactly when the first line is `pad` below the top.
   Reduced motion: the plate scrolls with the page, the wedge is a static halftone edge, nav turns to paper as a step. */
(function () {
  var ctx = RP, root = ctx.root, html = document.documentElement, NS = 'http://www.w3.org/2000/svg';
  var nav = root.querySelector('.rnav'), plate = root.querySelector('.plate');
  var cv = root.querySelector('.main-cv'), ncv = root.querySelector('.nav-cv'), img = plate.querySelector('.plate-img');
  var fly = root.querySelector('.fly'), navTitle = root.querySelector('.nav-title'), navTitleT = navTitle.querySelector('.nav-title-t');
  var h1 = root.querySelector('.article-intro .title'), eyebrow = root.querySelector('.article-intro .eyebrow');

  var hair = document.createElementNS(NS, 'svg');
  hair.setAttribute('class', 'nav-hair'); hair.setAttribute('aria-hidden', 'true');
  hair.innerHTML = '<path class="hair-l"/><path class="hair-r"/>';
  nav.appendChild(hair);
  var hairL = hair.querySelector('.hair-l'), hairR = hair.querySelector('.hair-r');

  var H = { W: 0, B0: 0, c: 14, band: 28, Z: 200, J: 20, cols: 0, rows: 0, col: null, rad: null, jit: null, dpr: 1, lastF: NaN,
    landed: false, rmState: '', f: null };

  // ---- the plate's halftone screen ----------------------------------------------------------------------------
  function sample() {
    var c = H.c, cols = H.cols, rows = H.rows, n = cols * rows;
    H.col = new Array(n); H.rad = new Float32Array(n);
    var data = null;
    if (img && img.complete && img.naturalWidth) {
      var oc = document.createElement('canvas'); oc.width = cols; oc.height = rows;
      var o = oc.getContext('2d', { willReadFrequently: true });
      // the same geometry as the <img>: object-fit cover, object-position 50% 42%, scale(1.14) about the centre
      var iw = img.naturalWidth, ih = img.naturalHeight, s0 = Math.max(H.W / iw, H.B0 / ih), S = 1.14;
      var w0 = iw * s0, h0 = ih * s0, x0 = (H.W - w0) * .5, y0 = (H.B0 - h0) * .42;
      var x = H.W / 2 - (H.W / 2 - x0) * S, y = H.B0 / 2 - (H.B0 / 2 - y0) * S;
      o.drawImage(img, (x + c) / c, y / c, w0 * S / c, h0 * S / c);   // cell i is centred at i·c − c/2
      try { data = o.getImageData(0, 0, cols, rows).data; } catch (e) { data = null; }
    }
    var P = [251, 246, 236];
    for (var i = 0; i < n; i++) {
      var r = 200, g = 190, b = 175;
      if (data) { r = data[i * 4]; g = data[i * 4 + 1]; b = data[i * 4 + 2]; }
      var L = (.299 * r + .587 * g + .114 * b) / 255;
      r = r + (L * 255 - r) * .22; g = g + (L * 255 - g) * .22; b = b + (L * 255 - b) * .22;   // the <img>'s saturate(.78)
      var a = .8 - Math.max(0, .42 - L) * .5;                                             // denser than the .5 wash; dark cells held back so type over them still reads
      H.col[i] = 'rgb(' + Math.round(P[0] + (r - P[0]) * a) + ',' + Math.round(P[1] + (g - P[1]) * a) + ',' + Math.round(P[2] + (b - P[2]) * a) + ')';
      var tone = Math.min(1, Math.max(.1, (.97 - L) / .78));
      H.rad[i] = c * .6 * Math.sqrt(.18 + .82 * tone);
    }
  }
  function jitter() {
    // the paper edge is a hand-cut edge, not a ruler: a slow wobble per column, seeded per essay (stable, never re-rolled)
    var r = Pen.rng('plate-' + ctx.post.id), a = r() * 6, b = r() * 6;
    H.jit = new Float32Array(H.cols);
    for (var i = 0; i < H.cols; i++) {
      var w = .5 + .5 * (.62 * Math.sin(i * .19 + a) + .38 * Math.sin(i * .053 + b));
      H.jit[i] = -H.J * Math.min(1, Math.max(0, w + (r() - .5) * .16));
    }
  }

  // F = window y of the paper's solid edge. Cells more than Z above it are untouched cover; cells below it are paper.
  function draw(F) {
    if (Math.abs(F - H.lastF) < .5) return;
    H.lastF = F;
    var g2 = cv.getContext('2d'), c = H.c, W = H.W, B0 = H.B0, dpr = H.dpr, Z = H.Z, band = H.band, nb = Math.ceil(Z / band);
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, W, B0);
    g2.fillStyle = '#FBF6EC';
    if (F < B0) g2.fillRect(0, Math.max(0, F), W, B0 - Math.max(0, F));
    var r0 = Math.max(0, Math.floor((F - Z - H.J) / c) - 1), r1 = Math.min(H.rows - 1, Math.ceil(F / c) + 1);
    for (var row = r0; row <= r1; row++) {
      var y = row * c + c / 2, off = row % 2 ? c / 2 : 0;
      for (var i = 0; i < H.cols; i++) {
        var d = F + H.jit[i] - y;                 // how far this cell sits above its column's paper edge
        if (d >= Z) continue;
        var x = i * c + off - c / 2;
        if (d < 0) { g2.fillStyle = '#FBF6EC'; g2.fillRect(x - c / 2 - .5, y - c / 2 - .5, c + 1, c + 1); continue; }
        var u = (Math.floor(d / band) + 1) / nb;  // band-by-band: every dot in a band shares one step of the wedge
        var k = row * H.cols + i;
        g2.fillStyle = '#FBF6EC'; g2.fillRect(x - c / 2 - .5, y - c / 2 - .5, c + 1, c + 1);
        g2.fillStyle = H.col[k]; g2.beginPath(); g2.arc(x, y, H.rad[k] * u, 0, 6.2832); g2.fill();
      }
    }
    var n2 = ncv.getContext('2d');                 // the nav shows the same plate, printed over by the same edge
    n2.setTransform(1, 0, 0, 1, 0, 0);
    n2.clearRect(0, 0, ncv.width, ncv.height);
    n2.drawImage(cv, 0, 0, ncv.width, ncv.height, 0, 0, ncv.width, ncv.height);
  }

  // ---- the title's flight: every line of the title travels to its own place in the one-line nav title ---------
  // (a wrapped English title visibly condenses into one line; a one-line title simply shrinks into the slot)
  var backT = root.querySelector('.back-t');
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function vis(el) { return el.querySelector(ctx.lang() === 'en' ? '.en' : '.zh') || el; }
  function textRect(el) {
    var r = document.createRange(); r.selectNodeContents(el);
    return [].slice.call(r.getClientRects()).filter(function (x) { return x.width > 1; })[0] || el.getBoundingClientRect();
  }
  var CJK = /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/;
  function layoutFly() {
    var g = ctx.g, r = h1.getBoundingClientRect(), f = H.f = { ox: r.left, oy: r.top + scrollY, lines: [] };
    fly.style.left = f.ox + 'px'; fly.style.top = f.oy + 'px'; fly.style.width = r.width + 'px';
    var toks = vis(h1).textContent.match(/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]|[^\s\u3000-\u303f\u3400-\u9fff\uff00-\uffef]+|\s+/g) || [];
    fly.innerHTML = '<div class="title fly-measure">' + toks.map(function (t) { return /^\s+$/.test(t) ? t : '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
    var groups = [], cur = null, measure = fly.firstChild;
    [].forEach.call(measure.childNodes, function (n) {                 // words grouped by the line the h1 puts them on
      if (n.nodeType === 3) { if (cur) cur.text += n.textContent; return; }
      var b = n.getBoundingClientRect();
      if (!cur || Math.abs(b.top - cur.top) > 4) groups.push(cur = { top: b.top, left: b.left, right: b.right, text: '' });
      cur.text += n.textContent; cur.right = Math.max(cur.right, b.right);
    });
    measure.remove();
    if (g.narrow) {
      var ar = root.querySelector('.back-arrow').getBoundingClientRect(), rt = root.querySelector('.rnav .right').getBoundingClientRect();
      html.style.setProperty('--nt-l', Math.round(ar.right + 1) + 'px');
      html.style.setProperty('--nt-r', Math.round(g.vw - rt.left + 12) + 'px');
    }
    var tgt = textRect(vis(navTitleT)), nr = navTitle.getBoundingClientRect();
    var slotR = nr.right - parseFloat(getComputedStyle(navTitle).paddingRight);
    f.k = parseFloat(getComputedStyle(navTitleT).fontSize) / parseFloat(getComputedStyle(h1).fontSize);
    f.tx = tgt.left; f.ty = tgt.top; f.cx = g.narrow ? tgt.left + tgt.width / 2 : g.vw / 2;
    var off = 0, fs = parseFloat(getComputedStyle(h1).fontSize);
    groups.forEach(function (gp, j) {
      var d = document.createElement('div'), txt = gp.text.replace(/\s+$/, '');
      d.className = 'title fly-line'; d.innerHTML = '<span>' + esc(txt) + '</span>';
      fly.appendChild(d);
      d.style.left = (gp.left - f.ox) + 'px'; d.style.top = (gp.top - f.oy) + 'px';
      var sr = d.firstChild.getBoundingClientRect(), sx = sr.left - gp.left, sy = sr.top - gp.top;   // half-leading inside the box
      var L = { el: d, bx: gp.left - f.ox - sx, by: gp.top - f.oy - sy, sx: sx, sy: sy, ax: gp.left, ay: gp.top };
      d.style.left = L.bx + 'px'; d.style.top = L.by + 'px';
      if (j) off += CJK.test(groups[j - 1].text.trim().slice(-1)) ? 0 : fs * .26;
      L.tx = f.tx + off * f.k; L.ty = f.ty;
      L.fits = L.tx + (gp.right - gp.left) * f.k <= slotR + 2;        // a line that would land past an ellipsis bows out
      off += gp.right - gp.left;
      f.lines.push(L);
    });
    if (eyebrow) {
      var eb = document.createElement('div'), last = f.lines[f.lines.length - 1];
      eb.className = 'fly-eb'; eb.appendChild(eyebrow.cloneNode(true)); fly.appendChild(eb);   // keeps its own -2deg tilt inside
      f.eb = { el: eb, bx: eyebrow.offsetLeft - h1.offsetLeft, by: eyebrow.offsetTop - h1.offsetTop, last: last };
      eb.style.left = f.eb.bx + 'px'; eb.style.top = f.eb.by + 'px';
    }
    f.multi = f.lines.length > 1;
  }
  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function flyAt(t) {
    var f = H.f;
    if (t <= 0 || t >= 1 || ctx.g.rm) {
      fly.style.visibility = 'hidden'; h1.style.visibility = ''; if (eyebrow) eyebrow.style.visibility = '';
      backT.style.opacity = ''; return;
    }
    fly.style.visibility = 'visible'; h1.style.visibility = 'hidden'; if (eyebrow) eyebrow.style.visibility = 'hidden';
    var k = 1 + (f.k - 1) * smooth(t), ey = smooth(t), ex = smooth((t - .12) / .88);   // y lags the page, never leads it
    // later lines hang off the first line at the current scale: they slide beside it, then rise into the one line
    var mx = smooth((t - .28) / .38), my = smooth((t - .56) / .34), L0 = f.lines[0];
    f.lines.forEach(function (L, j) {
      if (!j) { L.px = L.ax + (L.tx - L.ax) * ex; L.py = L.ay + (L.ty - L.ay) * ey; }
      else {
        L.px = L0.px + ((L.ax - L0.ax) + ((L.tx - L0.tx) / f.k - (L.ax - L0.ax)) * mx) * k;
        L.py = L0.py + (L.ay - L0.ay) * (1 - my) * k;
      }
      var X = L.px - (f.ox + L.bx + L.sx * k), Y = L.py - (f.oy + L.by + L.sy * k);
      L.el.style.transform = 'translate(' + X.toFixed(2) + 'px,' + Y.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
      L.el.style.opacity = L.fits ? '' : (1 - smooth((t - .6) / .25)).toFixed(3);
    });
    if (f.eb) {                                                     // the subtitle rides under the last line and lets go early
      var E = f.eb, Lz = E.last, hx = f.ox + E.bx, hy = f.oy + E.by;
      var X2 = Lz.px + (hx - Lz.ax) * k - hx, Y2 = Lz.py + (hy - Lz.ay) * k - hy;
      E.el.style.transform = 'translate(' + X2.toFixed(2) + 'px,' + Y2.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';
      E.el.style.opacity = (1 - smooth(t / .35)).toFixed(3);
    }
    backT.style.opacity = ctx.g.narrow ? (1 - smooth((t - .52) / .26)).toFixed(3) : '';   // makes room for the arriving title
  }

  // ---- landing: nav settles, hairline drawn outward from the title -------------------------------------------
  function hairPaths() {
    var g = ctx.g, cx = H.f ? H.f.cx : g.vw / 2, rL = Pen.rng('hair-l'), rR = Pen.rng('hair-r');
    hair.setAttribute('width', g.vw); hair.setAttribute('height', 6);
    function line(x0, x1, r) {
      var pts = [], n = Math.max(2, Math.round(Math.abs(x1 - x0) / 60));
      for (var i = 0; i <= n; i++) { var t = i / n; pts.push([x0 + (x1 - x0) * t, 3 + (r() - .5) * .9 + Math.sin(t * 5 + r()) * .35]); }
      return Pen.smooth(pts);
    }
    hairL.setAttribute('d', line(cx, -4, rL)); hairR.setAttribute('d', line(cx, g.vw + 4, rR));
    [hairL, hairR].forEach(function (p) {
      var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L);
      p.getAnimations().forEach(function (a) { a.cancel(); });
      p.style.strokeDashoffset = H.landed || H.rmState === 'paper' ? 0 : Pen.hiddenAt(p, L);
    });
  }
  function setLanded(on) {
    if (on === H.landed) return;
    H.landed = on;
    nav.classList.toggle('landed', on);
    [hairL, hairR].forEach(function (p) { on ? Pen.draw(p, { duration: 460 }) : Pen.erase(p, { duration: 160 }); });
    document.dispatchEvent(new CustomEvent('rp:land', { detail: on }));
  }

  function layout() {
    var g = ctx.g;
    H.W = g.vw; H.B0 = g.b0; H.c = g.cell; H.band = g.cell * 2; H.Z = g.z; H.J = Math.round(g.cell * 1.6);
    H.dpr = Math.min(2, window.devicePixelRatio || 1);
    H.cols = Math.ceil(H.W / H.c) + 2; H.rows = Math.ceil(H.B0 / H.c) + 1;
    cv.width = Math.round(H.W * H.dpr); cv.height = Math.round(H.B0 * H.dpr);
    ncv.width = cv.width; ncv.height = Math.round(g.n0 * H.dpr);
    sample(); jitter(); H.lastF = NaN;
    if (g.rm) { nav.classList.remove('landed'); H.landed = false; }
    else { nav.classList.remove('papered', 'titled'); H.rmState = ''; }
    layoutFly(); hairPaths();
    if (g.rm) { plate.style.visibility = ''; draw(H.B0 - g.pad); }
  }

  function update(y) {
    var g = ctx.g;
    if (g.rm) {
      // discrete states: paper and a drawn-in-place hairline the moment anything scrolls under the nav
      var st = y > 1 ? 'paper' : 'top';
      if (st !== H.rmState) { H.rmState = st; nav.classList.toggle('papered', st === 'paper'); hairPaths(); }
      nav.classList.toggle('titled', y > ctx.top(h1) + h1.offsetHeight - g.n0);
      flyAt(0); return;
    }
    var F = H.B0 - g.pad - y;
    plate.style.visibility = F < -H.J - H.c ? 'hidden' : '';
    draw(Math.max(-H.J - H.c - 1, F));
    flyAt(y / g.sL);
    if (!H.landed && y >= g.sL - .5) setLanded(true);
    else if (H.landed && y < g.sL - 6) setLanded(false);
  }

  ctx.onLayout(layout);
  ctx.onScroll(update);
  window.__hero = H;
})();
