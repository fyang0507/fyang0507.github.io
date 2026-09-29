/* r2-01 · A — "The desk becomes the nav / 桌子变成导航".
   Home → page: all four door objects lift off (the one you clicked first, the rest in a ripple outward),
   each carried on its own arc by a spring tuned to its mass, into its slot in the tab nav. The table folds
   up into its own front edge, and that edge straightens and rises to become the nav's 1.5px rule, sagging
   in the middle while it moves. The mug, the plant and the bird have no slot: they hang for a beat and
   drop. The pen draws the folder tab around the clicked object as it lands; the page lands under it.
   Page → home runs the other way on gravity: the rule drops and the table springs open from it, the
   objects fall onto it and bounce (the laptop thuds), the props drop back in, the pen redraws the notes.
   Tab → tab: the folder tab slides on a spring while a hop passes along the row, from the object you leave
   to the one you open (the objects' own hops are drawn on held frames: the hand's clock).
   Every channel keeps its value and velocity when retargeted, so any click mid-flight simply reverses or
   redirects the event already in motion. */
(function () {
  var X = Phys, D = R2Desk, R = R2Render, ORDER = MSPages.ORDER;
  function chan(x) { return new X.Chan(x); }
  // held poses at 12 fps: [lift px, lean deg]; leans are multiplied by the direction of travel
  var HOP = [[0, 0], [-4, 2], [-8, 3], [-5, 1], [0, 0]], HOP_BIG = [[0, 0], [-6, -2], [-13, 2], [-8, 3], [0, 0]];

  function make(opts) {
    opts = opts || {};

    function init(site) {
      var st = site.st = { view: site.view, t: 0, ev: {}, hopY: {}, hops: [], ghosts: [], penDir: 1, arrowDir: 1 };
      st.bodies = {}; st.flies = {};
      site.over.querySelectorAll('.r2-fly').forEach(function (e) { e.remove(); });
      var sk = site.sceneBox().k;
      ORDER.forEach(function (k) {
        st.bodies[k] = new X.Body();
        var f = D.fly(k, MSPages.DEST[k].sprite, !!opts.portal, sk);
        site.over.appendChild(f.el); st.flies[k] = f;
      });
      ['line', 'fold', 'thud', 'gap', 'pen', 'dot', 'tabx', 'arrows', 'notes', 'chrome', 'status', 'peek', 'title', 'note', 'strip'].forEach(function (n) { st[n] = chan(0); });
      st.labels = {}; ORDER.forEach(function (k) { st.labels[k] = chan(0); });
      st.props = {};
      Object.keys(D.PROPS).forEach(function (k) {
        var el = site.qh('[data-prop="' + k + '"]');
        st.props[k] = { el: el, face: el.querySelector('.face-bird'), frame: 0, dy: chan(0), rot: chan(0), al: chan(1), spin: D.PROPS[k].spin };
      });
      st.arrowEls = [].map.call(site.qh('.ms-arrows').querySelectorAll('path'), function (el) {
        var L = el.getTotalLength(); el.style.strokeDasharray = L + ' ' + (L + 6); return { el: el, L: L };
      });
      st.g = R.measure(site);
      placeMark(site);
      if (opts.init) opts.init(site);
      snap(site, st.view);
      R.all(site);
      rest(site);
    }

    // the pen's folder tab, one hand (fixed seed) for every tab; placed once, slid by transform
    function placeMark(site) {
      var st = site.st, t = st.g.tabs[site.dest], mark = site.q('.ms-tabmark'), ix = st.g.ix;
      var w = t.w, h = site.mobile ? 60 : 74, r = site.mobile ? 5 : 6, rnd = Pen.rng('folder-tab');
      var j = function () { return (rnd() - 0.5) * 0.9; };
      var d = 'M' + (0.5 + j()) + ' ' + h + ' L' + (0.3 + j()) + ' ' + (h * 0.5) + ' L0.6 ' + r + ' Q0.8 0.6 ' + r + ' 0.5' +
        ' L' + (w * 0.5) + ' ' + (0.2 + j()) + ' L' + (w - r) + ' 0.7 Q' + (w - 0.6) + ' 0.8 ' + (w - 0.5) + ' ' + r +
        ' L' + (w - 0.4 + j()) + ' ' + (h * 0.55) + ' L' + (w - 0.5) + ' ' + h;
      mark.style.left = '0px'; mark.style.top = (ix.h - h) + 'px'; mark.style.width = w + 'px'; mark.style.height = h + 'px';
      var svg = mark.querySelector('svg'), p = mark.querySelector('path');
      svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      p.setAttribute('d', d);
      st.markL = p.getTotalLength() + 3;
      p.style.strokeDasharray = st.markL + ' ' + (st.markL + 4);
    }

    // exact rest values for a view (build, reduced motion)
    function snap(site, v) {
      var st = site.st, g = st.g, on = v === 'page' ? 1 : 0;
      ORDER.forEach(function (k) { var a = on ? g.nav[k] : g.desk[k]; st.bodies[k].place({ x: a.x, y: a.y }, a.s); st.labels[k].set(on); });
      ['line', 'fold', 'gap', 'pen', 'dot', 'status', 'peek', 'title', 'note', 'strip'].forEach(function (n) { st[n].set(on); });
      ['arrows', 'notes', 'chrome'].forEach(function (n) { st[n].set(1 - on); });
      st.thud.set(0); st.tabx.set(g.tabs[site.dest].lx); st.penDir = 1; st.arrowDir = 1;
      Object.keys(st.props).forEach(function (k) { var p = st.props[k]; p.dy.set(0); p.rot.set(0); p.al.set(1 - on); p.frame = 0; });
      st.hops = []; st.hopY = {}; dropGhost(site);
      if (opts.snap) opts.snap(site, v);
    }

    function live(site) { site.vp.dataset.rest = ''; }
    function rest(site) {
      var st = site.st;
      site.vp.dataset.rest = st.view;
      R.clear(site);
      dropGhost(site);
      if (opts.rest) opts.rest(site);
    }
    function dropGhost(site) { var st = site.st; st.ghosts.forEach(function (g) { g.el.remove(); }); st.ghosts = []; }

    function toPage(site, k) {
      var st = site.st;
      st.view = 'page'; site.setView('page'); live(site);
      site.renderMain(k);
      st.g = R.measure(site); st.ev = {}; st.t = 0;
      var g = st.g, d0 = g.desk[k];
      // the clicked object leaves first; the others follow in a ripple by distance across the desk
      var order = ORDER.slice().sort(function (a, b) { return (a === k ? -1 : b === k ? 1 : Math.hypot(g.desk[a].x - d0.x, g.desk[a].y - d0.y) - Math.hypot(g.desk[b].x - d0.x, g.desk[b].y - d0.y)); });
      order.forEach(function (j, i) {
        var m = D.MASS[j], gn = g.nav[j], lift = m.lift * (site.mobile ? 0.45 : 1) * (j === k ? 1.3 : 1);
        st.bodies[j].carry({ x: gn.x, y: gn.y }, gn.s, function (P0) { return { x: X.lerp(P0.x, gn.x, 0.62), y: Math.min(P0.y, gn.y) - lift }; },
          'chase', { k: m.k, c: m.c, m: m.m, dur: m.dur, ease: j === k ? 'pick' : 'inout' }, 'tween', { dur: m.dur * 0.9, ease: 'inout' }, i ? 4 + i * 16 : 0);
      });
      st.line.go(1, 'spring', { k: 130, c: 19 }, 130);
      st.fold.go(1, 'tween', { dur: 250, ease: 'in' });
      st.gap.set(0); st.pen.set(0); st.dot.set(0); st.penDir = 1; st.tabx.set(g.tabs[k].lx);
      st.arrowDir = -1; st.arrows.go(0, 'tween', { dur: 160, ease: 'retract' });
      st.notes.go(0, 'tween', { dur: 110, ease: 'in' }); st.chrome.go(0, 'tween', { dur: 140, ease: 'in' });
      st.status.go(1, 'tween', { dur: 240 }, 380); st.strip.set(0); st.strip.go(1, 'tween', { dur: 320 }, 420);
      st.title.set(0); st.note.set(0);
      // the props have no slot: a held beat while the table goes, then gravity
      var w = { bird: 20, mug: 50, plant: 70 };
      Object.keys(st.props).forEach(function (n) {
        var p = st.props[n];
        p.frame = n === 'bird' ? 2 : 0;
        p.dy.go(1300, 'fall', { g: site.mobile ? 3600 : 7000, e: 0 }, w[n]);
        p.rot.go(p.spin, 'tween', { dur: 420, ease: 'in' }, w[n]);
        p.al.go(0, 'tween', { dur: 160, ease: 'in' }, w[n] + 90);
      });
      if (opts.toPage) opts.toPage(site, k);
      R.all(site);
    }

    function toHome(site) {
      var st = site.st, g;
      st.view = 'home'; site.setView('home'); live(site);
      st.g = g = R.measure(site); st.ev = {}; st.t = 0;
      st.penDir = -1; st.pen.go(0, 'tween', { dur: 170, ease: 'retract' });
      st.dot.go(0, 'tween', { dur: 110, ease: 'in' }); st.gap.go(0, 'tween', { dur: 130, ease: 'in' }, 40);
      st.title.go(0, 'tween', { dur: 150, ease: 'in' }); st.note.go(0, 'tween', { dur: 120, ease: 'in' });
      st.strip.go(0, 'tween', { dur: 190, ease: 'in' }); st.status.go(0, 'tween', { dur: 160, ease: 'in' });
      ORDER.forEach(function (k) { st.labels[k].go(0, 'tween', { dur: 140, ease: 'in' }); });
      st.peek.go(0, 'tween', { dur: 250, ease: 'lin' });
      var di = ORDER.indexOf(site.dest);
      var order = ORDER.slice().sort(function (a, b) { return Math.abs(ORDER.indexOf(a) - di) - Math.abs(ORDER.indexOf(b) - di); });
      // the rule was holding them up: when it drops they drop, on gravity (Galileo: mass changes the bounce, not the fall)
      order.forEach(function (j, i) {
        var gd = g.desk[j];
        var b = st.bodies[j], room = b.pos().y - Math.max(b.scale(), gd.s) * D.NAV[j][3] - 14;  // it grows as it falls
        b.throwTo({ x: gd.x, y: gd.y }, gd.s, site.mobile ? 3200 : 7000, site.mobile ? 4 : 9, D.MASS[j].e, 70 + i * 22, room);
      });
      st.line.go(0, 'spring', { k: 150, c: 19 }, 70);
      if (opts.toHome) opts.toHome(site);
      R.all(site);
    }

    // tab → tab: content swaps under a sliding folder tab; a hop is passed along the row
    function tab(site, k) {
      var st = site.st, from = site.dest, settled = site.vp.dataset.rest === 'page';
      // the page you leave fades as it looks right now (mid-landing included); earlier ghosts keep fading
      var r = site.rel(site.main), gh = document.createElement('div');
      gh.className = 'ms-main ms-ghost'; gh.innerHTML = site.main.innerHTML;
      gh.style.cssText = 'position:absolute;margin:0;left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;pointer-events:none';
      site.page.appendChild(gh);
      st.ghosts.push({ el: gh, c: chan(1).go(0, 'tween', { dur: 150, ease: 'in' }) });
      live(site);
      site.renderMain(k); st.t = 0;
      st.title.set(0); st.title.go(1, 'spring', { k: 210, c: 19 }, 120);
      st.note.set(0); st.note.go(1, 'tween', { dur: 420, ease: 'lin' }, 320);
      st.strip.set(0); st.strip.go(1, 'tween', { dur: 260 }, 100);
      st.status.set(0); st.status.go(1, 'tween', { dur: 200 }, 60);
      if (st.ev.pen || settled) {
        st.ev.pen = true;
        st.tabx.go(st.g.tabs[k].lx, 'spring', { k: 150, c: 21 }, 40);
        var a = ORDER.indexOf(from), b = ORDER.indexOf(k), dir = b > a ? 1 : -1;
        if (settled) for (var i = a, n = 0; ; i += dir, n++) { st.hops.push({ k: ORDER[i], t0: n * 65, big: i === b, dir: dir }); if (i === b) break; }
      } else st.tabx.set(st.g.tabs[k].lx);  // not drawn yet: the pen draws it where that object lands
      if (opts.tab) opts.tab(site, k);
      R.all(site);
    }

    function events(site) {
      var st = site.st, ev = st.ev, b = st.bodies;
      if (st.view === 'page') {
        ORDER.forEach(function (j) { if (!ev['lab' + j] && b[j].p.landed) { ev['lab' + j] = true; st.labels[j].go(1, 'tween', { dur: 160 }); } });
        if (!ev.line && st.line.landed) { ev.line = true; st.peek.go(1, 'tween', { dur: 250, ease: 'lin' }, 40); }
        if (!ev.pen && b[site.dest].p.x > 0.97) {              // the pen draws the tab as the object lands
          ev.pen = true; st.penDir = 1;
          st.pen.go(1, 'tween', { dur: 260, ease: 'pen' });
          st.title.go(1, 'spring', { k: 270, c: 24 }, 50);
          st.note.go(1, 'tween', { dur: 260, ease: 'lin' }, 140);
        }
        if (ev.pen && !ev.dot && st.pen.x > 0.88) { ev.dot = true; st.dot.go(1, 'spring', { k: 400, c: 21 }); st.gap.go(1, 'tween', { dur: 110 }); }
      } else {
        if (!ev.fold && st.line.x < 0.3) {                       // the rule is back: the table springs open from it
          ev.fold = true; st.fold.go(0, 'spring', { k: 230, c: 19 });
          var w = { mug: 150, plant: 210, bird: 330 };
          Object.keys(st.props).forEach(function (n) {
            var p = st.props[n];
            if (p.al.x < 0.3 || p.dy.x > 120) {                    // gone: drop back in from above
              p.dy.set(site.mobile ? -120 : -230); p.rot.set(p.spin * 0.3); p.al.set(0);
              p.dy.go(0, 'fall', { g: 4600, e: 0.26, vmin: 60 }, w[n]);
              p.al.go(1, 'tween', { dur: 90 }, w[n]); p.rot.go(0, 'tween', { dur: 260 }, w[n]);
            } else { p.dy.go(0, 'spring', { k: 240, c: 26 }); p.rot.go(0, 'tween', { dur: 200 }); p.al.go(1, 'tween', { dur: 120 }); }
            p.frame = n === 'bird' ? 3 : 0;
          });
        }
        if (!ev.thud && b.building.p.landed) { ev.thud = true; st.thud.go(0, 'spring', { k: 900, c: 30 }, 0, site.mobile ? 60 : 130); }
        if (st.props.bird.dy.landed) st.props.bird.frame = 0;
        if (!ev.arrows && ORDER.every(function (j) { return b[j].p.landed; })) {
          ev.arrows = true; st.arrowDir = 1;
          st.arrows.go(1, 'tween', { dur: 560, ease: 'pen' }, 60);
          st.notes.go(1, 'tween', { dur: 260 }, 200); st.chrome.go(1, 'tween', { dur: 260 }, 200);
        }
      }
    }
    // the relay: each object hops on held frames at 12 fps (it is a drawing: hand's clock)
    function hops(site) {
      var st = site.st, any = false;
      st.hops.forEach(function (h) {
        var f = Math.floor((st.t - h.t0) / 83), K = h.big ? HOP_BIG : HOP;
        if (f < 0) { any = true; return; }
        var fr = K[Math.min(f, K.length - 1)];
        st.hopY[h.k] = [fr[0], fr[1] * h.dir];            // each hop leans the way the tab is going
        if (f < K.length - 1) any = true;
      });
      if (!any) { st.hops = []; st.hopY = {}; }
      return any;
    }

    function tick(site, dt) {
      var st = site.st, busy = false;
      st.t += dt * 1000;
      ORDER.forEach(function (k) { st.bodies[k].step(dt); if (!st.bodies[k].idle()) busy = true; st.labels[k].step(dt); busy = busy || !st.labels[k].idle; });
      ['line', 'fold', 'thud', 'gap', 'pen', 'dot', 'tabx', 'arrows', 'notes', 'chrome', 'status', 'peek', 'title', 'note', 'strip'].forEach(function (n) { st[n].step(dt); busy = busy || !st[n].idle; });
      Object.keys(st.props).forEach(function (n) { var p = st.props[n]; p.dy.step(dt); p.rot.step(dt); p.al.step(dt); busy = busy || !p.dy.idle || !p.rot.idle || !p.al.idle; });
      st.ghosts = st.ghosts.filter(function (g) { g.c.step(dt); if (g.c.idle) { g.el.remove(); return false; } busy = true; return true; });
      events(site);
      if (st.hops.length && hops(site)) busy = true;
      if (opts.tick && opts.tick(site, dt)) busy = true;
      R.all(site);
      return busy;
    }
    function finish(site) { var st = site.st; st.g = R.measure(site); placeMark(site); snap(site, st.view); st.ev = { pen: true }; R.all(site); }

    return { init: init, toPage: toPage, toHome: toHome, tab: tab, tick: tick, rest: rest, finish: finish, extra: opts.extra };
  }

  window.R2Director = make;
  window.R2A = make();
})();
