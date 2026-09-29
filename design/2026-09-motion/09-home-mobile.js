/* 09 · D — the mobile desk. A horizontal, natively snapped strip of five shots; its scroll
   position drives one continuous camera (translate + scale) over the same drawing, so the desk
   is never cut into cards. When the camera settles on an object, that object's sprite reacts
   once, on the hand's clock. The finger is the only thing that moves the camera. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  // Framings in image fractions: centre x/y and how much of the drawing's width fills the screen.
  var SHOTS = [{ cx: .52, cy: .575, vw: .70 }, { cx: .355, cy: .39, vw: .40 }, { cx: .63, cy: .425, vw: .30 }, { cx: .775, cy: .72, vw: .34 }, { cx: .465, cy: .73, vw: .36 }];
  // Overview doors, image %: left, top, width, height, label side (same boxes as index.html hotspots)
  var DOORS = [[20, 23, 31, 32, 'top', 50], [56.5, 33, 12.5, 19, 'top', 50], [68.5, 63, 18, 18, 'bottom', 78], [36, 62, 21, 22, 'bottom', 50]];

  // Parent board's "preview reduced motion" switch reaches into the frame.
  function syncRM() { var on = false; try { on = parent !== window && parent.document.documentElement.classList.contains('rm'); } catch (e) {} document.documentElement.classList.toggle('rm', on); }
  syncRM(); try { if (parent !== window) parent.document.addEventListener('mock:rm', syncRM); } catch (e) {}

  var track = $('.track'), view = $('.view'), layer = $('.layer'), panels = [].slice.call(document.querySelectorAll('.panel'));
  var btns = [].slice.call(document.querySelectorAll('.idx button'));
  var W = 0, H = 0, cur = -1, arrived = -1, raf = 0, ovWin = $('.panel[data-i="0"] .win');

  // Real facts from the manifests.
  var post = FY_POSTS.slice().sort(function (a, b) { return b.date.localeCompare(a.date); })[0];
  var proj = BUILDING_PROJECTS.slice().sort(function (a, b) { return (b.updated || '').localeCompare(a.updated || '') || b.sortDate.localeCompare(a.sortDate); })[0];
  var photo = FY_PHOTOS.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; })[0];
  function nw(t) { return '<span class="nw">' + t + '</span>'; }
  $('[data-fact="build"]').innerHTML = BUILDING_PROJECTS.length + ' projects on the board<br>latest <b>' + proj.title + '</b> · updated ' + nw(proj.updated);
  $('[data-fact="photo"]').innerHTML = FY_PHOTOS.length + ' frames on the line<br>newest <b>' + photo.loc + '</b> · ' + nw(photo.date);
  $('[data-fact="post"]').innerHTML = FY_POSTS.length + ' essays on the shelf<br>newest <b lang="zh">' + post.titleZh + '</b> ' + post.title + ' · ' + nw(post.date);

  function place(p) {
    var i = Math.max(0, Math.min(SHOTS.length - 1, Math.floor(p))), j = Math.min(SHOTS.length - 1, i + 1), f = Math.max(0, Math.min(1, p - i));
    var a = SHOTS[i], b = SHOTS[j];
    var cx = a.cx + (b.cx - a.cx) * f, cy = a.cy + (b.cy - a.cy) * f, vw = a.vw * Math.pow(b.vw / a.vw, f);
    var s = W / (vw * 1000), tx = W / 2 - cx * 1000 * s, ty = H / 2 - cy * 750 * s;
    layer.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    ovWin.style.setProperty('--ov', Math.max(0, 1 - p * 3).toFixed(2));   // the overview's labels belong to shot 00 only
  }
  function layoutDoors() {                                  // overview tap targets sit exactly on the objects in shot 00
    var a = SHOTS[0], s = W / (a.vw * 1000), tx = W / 2 - a.cx * 1000 * s, ty = H / 2 - a.cy * 750 * s;
    [].slice.call(document.querySelectorAll('.ov-hot')).forEach(function (el, k) {
      var d = DOORS[k];
      el.style.left = (tx + d[0] * 10 * s) + 'px'; el.style.top = (ty + d[1] * 7.5 * s) + 'px';
      el.style.width = (d[2] * 10 * s) + 'px'; el.style.height = (d[3] * 7.5 * s) + 'px'; el.dataset.lbl = d[4]; el.style.setProperty('--ax', '-' + d[5] + '%');
    });
  }
  function viewfinder() {                                   // four pencil corners: this is a camera frame, not a crop
    var svg = $('.vf'), w = svg.clientWidth, h = svg.clientHeight, L = 16, r = Pen.rng('vf');
    svg.innerHTML = '';
    [[0, 0, 1, 1], [w, 0, -1, 1], [0, h, 1, -1], [w, h, -1, -1]].forEach(function (c) {
      var d = Pen.smooth([[c[0], c[1] + c[3] * L], [c[0] + r() * .8, c[1] + c[3] * (1 + r())], [c[0] + c[2] * L, c[1] + r() * .8]]);
      svg.appendChild(Pen.path(d, { color: 'var(--pencil)', width: 1.4 }));
    });
  }
  function measure() {
    W = view.clientWidth; H = view.clientHeight;
    layoutDoors(); viewfinder(); place(track.scrollLeft / (track.clientWidth || 1));
  }

  // The index: the current shot is underlined by the pen; the old mark retracts faster than it drew.
  var marks = btns.map(function (b) { return Pen.annotate(b.querySelector('.t'), 'underline', { manual: true, width: 2, gap: 2, seed: 'idx' + b.dataset.to }); });
  function mark(i) {
    if (i === cur) return;
    if (cur >= 0) { marks[cur].hide(); btns[cur].removeAttribute('aria-current'); }
    cur = i; marks[i].show(); btns[i].setAttribute('aria-current', 'true');
  }

  // Arrival: the object reacts once when the camera settles on it.
  var screen = $('.m-typed'), frame = $('.m-fframe'), typeTok = 0;
  function setF(k) { frame.style.backgroundPosition = (k * 100 / 3) + '% 0'; }
  async function typeScreen() {
    var tok = ++typeTok, cmd = 'git log -1 building/', rm = Pen.reduced(), r = Pen.rng('m' + Date.now());
    screen.innerHTML = '$ ';
    if (!rm) {
      await sleep(260);
      for (var i = 0; i < cmd.length; i++) {
        if (tok !== typeTok) return;
        screen.textContent += cmd[i];
        var t = 48 + r() * 62; if (cmd[i - 1] === ' ') t += 50 + r() * 90; if (/[-\/]/.test(cmd[i])) t += 60;
        await sleep(t);
      }
      await sleep(220);
    } else screen.textContent += cmd;
    if (tok !== typeTok) return;
    screen.innerHTML = '$ ' + cmd + '\n<span class="o">' + proj.title + '</span>\nupdated ' + proj.updated + ' · ' + proj.lifecycle + '\n$ ';
  }
  async function arrive(i) {
    if (i === arrived) return; arrived = i;
    if (i === 1) typeScreen();
    if (Pen.reduced()) return;
    if (i === 2) { setF(1); await sleep(130); setF(3); await sleep(1300); setF(1); await sleep(120); setF(0); }
    if (i === 3) { layer.classList.remove('snap'); void layer.offsetWidth; layer.classList.add('snap'); }
    if (i === 4) { layer.classList.remove('flip'); void layer.offsetWidth; layer.classList.add('flip'); }
  }

  var endT = 0;
  function onScroll() {
    if (!raf) raf = requestAnimationFrame(function () {
      raf = 0; var p = track.scrollLeft / track.clientWidth; place(p); mark(Math.round(p));
      if (Math.abs(p - Math.round(p)) > .35) arrived = -1;
    });
    clearTimeout(endT); endT = setTimeout(settled, 140);      // scrollend fallback
  }
  function settled() { var p = track.scrollLeft / track.clientWidth; if (Math.abs(p - Math.round(p)) < .02) arrive(Math.round(p)); }
  track.addEventListener('scroll', onScroll, { passive: true });
  if ('onscrollend' in window) track.addEventListener('scrollend', settled);

  function go(i) { i = Math.max(0, Math.min(panels.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: Pen.reduced() ? 'auto' : 'smooth' }); }
  btns.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.to); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
  });

  // The bird keeps hopping on the tabletop, but only while the whole desk is in shot.
  var bird = $('.m-bird'), bfr = $('.m-bframe'), bx = 18, bdir = -1;
  bird.style.left = bx + '%';
  function bset(k) { bfr.style.backgroundPosition = (k * 20) + '% 0'; }
  (async function birdLoop() {
    await sleep(1600);
    for (;;) {
      await sleep(600 + Math.random() * 1400);
      if (cur !== 0 || Pen.reduced() || document.hidden) continue;
      if (bx < 15) bdir = 1; else if (bx > 26) bdir = -1; else if (Math.random() < .45) bdir = -bdir;
      bird.style.transform = bdir > 0 ? 'scaleX(-1)' : '';
      for (var h = 0, n = 2 + Math.floor(Math.random() * 3); h < n && cur === 0; h++) {
        var seq = [[1, 90, 0], [2, 95, .3], [3, 105, .4], [4, 90, .3], [5, 70, 0], [0, 90, 0]];
        for (var s = 0; s < seq.length; s++) { bset(seq[s][0]); bx += seq[s][2] * 1.5 * bdir; bird.style.left = bx + '%'; await sleep(seq[s][1]); }
        await sleep(130);
      }
    }
  })();

  addEventListener('resize', measure);
  measure(); mark(0);
  window.replayD = function () { arrived = -1; go(0); };
  window.goShot = go;                                       // used by the board's verification script
})();
