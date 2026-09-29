/* 01 · C — "Nichijou cut / 日常式转场".
   The iris closes onto the thing you clicked and *holds* it for a beat (the subject acknowledged),
   snaps shut, cuts to an episode card with one bird hopping on the hand's clock (stepped frames,
   held poses), then opens on the same object where it now lives — its nav tab. Budget ≈1.1 s,
   which is exactly why it cannot be the default: see the board's verdict. Tab→tab drops the card. */
(function () {
  var M = window.Motion, OBJ = MiniSite.OBJ, DEST = MSPages.DEST;
  var uid = 0;
  var R = 1000; // the hole is a circle of radius 1000 scaled by transform: works everywhere, unlike animating r

  function overlay(site) {
    var id = 'ms-iris-' + (++uid);
    return '<div class="ms-iris" aria-hidden="true"><svg><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">' +
      '<rect width="100%" height="100%" fill="#fff"/><circle class="hole" r="' + R + '" fill="#000"/></mask></defs>' +
      '<rect width="100%" height="100%" fill="#17120C" mask="url(#' + id + ')"/></svg>' +
      '<div class="ms-ep"><span class="n"></span><span class="t"></span></div><div class="ms-ep-bird"><i></i></div></div>';
  }
  function T(c, r) { return 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px) scale(' + Math.max(r / R, 0.0001).toFixed(5) + ')'; }
  function far(site, c) { return Math.hypot(Math.max(c.x, site.W - c.x), Math.max(c.y, site.H - c.y)) + 8; }
  function center(site, el) { var r = site.rel(el); return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: Math.max(r.w, r.h) * 0.6 + 6 }; }
  function deskTarget(site, k) { var b = site.drawnBox(k); return { x: b.x + b.w / 2, y: b.y + b.h / 2, r: Math.max(b.w, b.h) * 0.58 + 8 }; }
  function navTarget(site, k) { var b = site.navBox(k); return { x: b.x + b.w / 2, y: b.y + b.h / 2 + 2, r: Math.max(b.w, b.h) * 0.75 + 8 }; }

  // close: sweep in, hold the subject in a small circle, snap shut
  function close(hole, site, c, short) {
    var R0 = far(site, c), tIn = short ? 190 : 220, hold = short ? 70 : 100, snap = 60, D = tIn + hold + snap;
    var a = hole.animate([
      { offset: 0, transform: T(c, R0), easing: 'cubic-bezier(.55,.05,.3,1)' },
      { offset: tIn / D, transform: T(c, c.r) },
      { offset: (tIn + hold) / D, transform: T(c, c.r), easing: 'cubic-bezier(.6,0,1,1)' },
      { offset: 1, transform: T(c, 0) }], { duration: D, fill: 'both' });
    return M.done(a);
  }
  // open: the hole appears on the object, holds, then opens out
  function open(hole, site, c, short) {
    var R1 = far(site, c), tA = 60, hold = short ? 60 : 80, tOut = short ? 210 : 230, D = tA + hold + tOut;
    var a = hole.animate([
      { offset: 0, transform: T(c, 0), easing: 'cubic-bezier(.2,.7,.3,1)' },
      { offset: tA / D, transform: T(c, c.r) },
      { offset: (tA + hold) / D, transform: T(c, c.r), easing: 'cubic-bezier(.55,0,.75,.35)' },
      { offset: 1, transform: T(c, R1) }], { duration: D, fill: 'both' });
    return M.done(a);
  }
  // the black beat: the card cuts on (no fade), one bird hops across on held poses
  async function beat(site, iris, no, title) {
    var ep = iris.querySelector('.ms-ep'), bird = iris.querySelector('.ms-ep-bird'), face = bird.querySelector('i');
    ep.querySelector('.n').textContent = no;
    ep.querySelector('.t').innerHTML = title;
    var er = site.rel(ep.querySelector('.t'));
    var x0 = site.W / 2 - 60, y = er.y + er.h + (site.mobile ? 22 : 30);
    bird.style.left = x0 + 'px'; bird.style.top = y + 'px';
    ep.style.visibility = 'visible'; bird.style.visibility = 'visible';
    // the live desk bird's hop cycle, at ~16 fps: [frame, hold ms, forward step]
    var seq = [[0, 30, 0], [1, 50, 0], [2, 50, 9], [3, 55, 12], [4, 50, 9], [5, 45, 0], [0, 50, 0]], x = 0;
    for (var i = 0; i < seq.length; i++) {
      face.style.backgroundPosition = (seq[i][0] * 20) + '% 0';
      x += seq[i][2]; bird.style.transform = 'translateX(' + x + 'px)';
      await M.sleep(seq[i][1]);
    }
    ep.style.visibility = 'hidden'; bird.style.visibility = 'hidden'; bird.style.transform = '';
  }
  function done(iris, hole) {
    hole.getAnimations().forEach(function (a) { a.cancel(); });
    iris.classList.remove('on');
  }

  async function toPage(site, k) {
    var iris = site.vp.querySelector('.ms-iris'), hole = iris.querySelector('.hole'), d = DEST[k];
    iris.classList.add('on');
    await close(hole, site, deskTarget(site, k), false);
    site.renderPage(k); site.setView('page');
    await beat(site, iris, '日常 · ep.' + d.no, d.zh + ' <span>' + d.en + '</span>');
    await open(hole, site, navTarget(site, k), false);
    done(iris, hole);
  }
  async function toHome(site) {
    var iris = site.vp.querySelector('.ms-iris'), hole = iris.querySelector('.hole'), k = site.dest;
    iris.classList.add('on');
    // going back is not a new episode: no card, just the cut — closes on the peeking sticker, opens on the object you left
    await close(hole, site, center(site, site.q('.site-home-object')), true);
    site.setView('home');
    await M.sleep(90);
    await open(hole, site, deskTarget(site, k), true);
    done(iris, hole);
  }
  async function tab(site, to) {
    var iris = site.vp.querySelector('.ms-iris'), hole = iris.querySelector('.hole');
    iris.classList.add('on');
    await close(hole, site, navTarget(site, to), true);
    site.renderPage(to);
    await M.sleep(60);
    await open(hole, site, navTarget(site, to), true);
    done(iris, hole);
  }

  window.T01C = { toPage: toPage, toHome: toHome, tab: tab, overlay: overlay };
})();
