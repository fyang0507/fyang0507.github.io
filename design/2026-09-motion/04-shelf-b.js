/* 04-shelf-b.js — Candidate B "Lean and slip / 斜靠书签" (also drives the phone proposal, M).
   Hover/focus: the book tips forward about its bottom-front edge (you finally see its page block from
   above), and a paper bookmark rises out of the pages edge-on, then swivels to face you carrying the
   cover, titles, date, tag, reading time and one hand-written aside. The information is where the eye
   already is; there is no side card. Arrow keys walk the shelf. Click: the slip is drawn fully out and
   becomes the reading page. The bird walks the plank's front lip to the foot of the book. */
(function () {
  var K = window.ShelfKit;

  function SlipShelf(stage, cfg) {
    var posts = cfg.posts, sc = cfg.scale || 1, tap = !!cfg.tap;
    var shelf = K.buildShelf(cfg.host || stage, posts, { rowH: cfg.rowH || 230, scale: sc });
    shelf.wrap.classList.add('tip3d');
    shelf.row.style.setProperty('--depth', Math.round(118 * sc) + 'px');
    var read = window.ShelfRead(stage);
    var layer = K.el('div', 'slip-layer'); shelf.row.appendChild(layer);
    var tips = shelf.books.map(function () { return new K.Spring(0, 260, 0.58); });
    var slips = [], cur = -1, busy = false, riseTimer = null, zTop = 1;
    var bird = K.Bird(shelf, { mode: 'lip', size: Math.round(56 * sc), notice: 460 });
    var loop = K.Loop(render);
    var TIP = cfg.tip || 16, SW = cfg.slipW || 208;

    function render(dt) {
      var m = false;
      shelf.books.forEach(function (b, i) {
        var mv = tips[i].step(dt); m = m || mv;
        if (mv || b._tip !== tips[i].x) { b._tip = tips[i].x; b.body.style.transform = 'rotateX(' + (-tips[i].x).toFixed(3) + 'deg)'; }
      });
      slips.forEach(function (o) {
        if (!o) return;
        var a = o.rise.step(dt), c = o.rot.step(dt);
        if (a || c || o._dirty || dt < 0) {
          m = m || a || c; o._dirty = false;
          o.el.style.transform = 'translateY(' + (o.H + 2 - o.rise.x).toFixed(2) + 'px) rotateY(' + o.rot.x.toFixed(2) + 'deg)';
          o.clip.style.visibility = o.rise.x < 0.5 && !o.shown ? 'hidden' : '';
        }
      });
      return m;
    }
    // Stiffer and fully damped on the way down: paper retracts faster than it rose (like the pen).
    function tune(sp, k, z) { sp.k = k; sp.c = 2 * z * Math.sqrt(k); }

    function slipFor(i) {
      if (slips[i]) return slips[i];
      var p = posts[i], b = shelf.books[i], note = K.aside(p);
      var clip = K.el('div', 'slip-clip'), s = K.el('div', 'slip');
      s.setAttribute('aria-hidden', 'true');
      s.style.width = SW + 'px'; s.style.marginLeft = (-SW / 2) + 'px';
      s.style.setProperty('--tw', Math.max(12, b.w - 10) + 'px');
      s.innerHTML = '<div class="slip-card"><div class="slip-cover"><img alt="" decoding="async" sizes="' + SW + 'px"></div>' +
        '<div class="slip-zh">' + K.esc(p.zh) + '</div><div class="slip-en">' + K.esc(p.en) + '</div>' +
        // Each fact and each bilingual half is an unbreakable chunk; lines may only break between chunks.
        '<div class="slip-meta"><span class="ml"><b>' + p.ym + '</b> · <b>~' + p.min + ' min</b></span>' +
        '<span class="ml"><b>' + K.esc(p.tags[0] || '') + '</b> · <b lang="zh">' + K.esc(p.tagZh[0] || '') + '</b></span></div>' +
        '<div class="slip-note">' + K.esc(note[0]) + '<span>' + note[1] + '</span></div></div><div class="slip-stem"></div>';
      var img = s.querySelector('img'); img.setAttribute('srcset', p.coverSrcset); img.src = p.cover;
      clip.appendChild(s); layer.appendChild(clip);
      var o = { clip: clip, el: s, rise: new K.Spring(0, 230, 0.66), rot: new K.Spring(86, 190, 0.5), shown: false, _dirty: true };
      o.H = s.offsetHeight; o.REST = o.H - 24;                  // ~12px of stem shows above the pages
      var cw = SW + 80, ch = o.H + 60;
      // The slip comes out of the back of the page block, so the tipped top stays visible in front of it.
      var keep = b.body.style.transform; b.body.style.transform = 'rotateX(' + (-TIP) + 'deg)';
      var tr = b.body.querySelector('.bk-top').getBoundingClientRect(), rr = shelf.row.getBoundingClientRect();
      b.body.style.transform = keep;
      var emerge = Math.round(tr.top - rr.top + 3);
      // The stem stays over the book; near the ends the card slides along it to stay in view.
      var sc_ = cfg.host || (getComputedStyle(shelf.wrap).overflowX !== 'visible' ? shelf.wrap : null), lo, hi;
      if (sc_) { var hr = sc_.getBoundingClientRect(); lo = hr.left - sc_.scrollLeft - rr.left + 10; hi = lo + sc_.scrollWidth - 20; }
      else { var sr = stage.getBoundingClientRect(); lo = sr.left - rr.left + 16; hi = sr.right - rr.left - 16; }
      var cc = Math.max(lo + SW / 2, Math.min(hi - SW / 2, b.cx)), lim = SW / 2 - b.w / 2 - 6;
      var dx = Math.max(-lim, Math.min(lim, cc - b.cx)), left = b.cx + dx - cw / 2;
      clip.style.cssText = 'left:' + left + 'px;top:' + (emerge - ch) + 'px;width:' + cw + 'px;height:' + ch + 'px;visibility:hidden';
      s.style.left = (b.cx - left) + 'px';
      s.firstChild.style.transform = 'translateX(' + dx.toFixed(1) + 'px)';
      o.pen = Pen.annotate(s.querySelector('.slip-zh'), 'underline', { manual: true, gap: 1, width: 2 });
      o.card = s.firstChild;
      o.card.addEventListener('click', function (e) { e.stopPropagation(); open(i); });
      slips[i] = o;
      return o;
    }
    function raise(i) {
      if (cur !== i) return;
      var o = slipFor(i);
      o.shown = true; o.clip.style.zIndex = ++zTop; o._dirty = true;
      tune(o.rise, 230, 0.66); tune(o.rot, 190, 0.5);
      if (o.rise.x < 2) o.rot.x = 86;                         // comes up edge-on, between the pages
      o.rise.t = o.REST;
      setTimeout(function () { if (cur === i && o.shown) { o.rot.t = -3; loop.kick(); } }, Pen.reduced() ? 0 : 130);
      setTimeout(function () { if (cur === i && o.shown) o.pen.show(); }, Pen.reduced() ? 0 : 430);
      loop.kick();
    }
    function retract(i) {
      var o = slips[i]; if (!o) return;
      o.shown = false; o.pen.hide();
      tune(o.rise, 520, 1); tune(o.rot, 520, 1);
      o.rise.t = 0; o.rot.t = 86;
    }
    function consider(i) {
      if (busy || read.open || i === cur) return;
      var prev = cur; cur = i;
      if (prev >= 0) { tips[prev].t = 0; retract(prev); }
      clearTimeout(riseTimer);
      if (i >= 0) {
        tips[i].t = TIP;
        // Sweeping across the spines ripples the tips; the slip waits until you actually pause.
        riseTimer = setTimeout(function () { raise(i); }, Pen.reduced() ? 0 : 90);
        bird.consider(i);
        if (tap && cfg.host) {                                    // recentre the strip without scrolling the page
          var h = cfg.host, hr = h.getBoundingClientRect(), br = shelf.books[i].el.getBoundingClientRect();
          h.scrollTo({ left: h.scrollLeft + br.left - hr.left - h.clientWidth / 2 + br.width / 2, behavior: Pen.reduced() ? 'auto' : 'smooth' });
        }
      } else bird.cancel();
      cfg.onConsider && cfg.onConsider(i);
      loop.kick();
    }

    async function open(i) {
      if (busy || read.open) return;
      if (cur !== i) { consider(i); await K.wait(480); }
      busy = true;
      var o = slipFor(i), p = posts[i];
      tune(o.rise, 300, 0.7); o.rise.t = o.H + Math.round(30 * sc); o.rot.t = 0; loop.kick();   // drawn fully out
      await K.wait(250);
      var zh = o.el.querySelector('.slip-zh');
      var from = { paper: K.rel(o.card, stage), title: K.rel(zh, stage) };
      o.el.style.visibility = 'hidden';
      await read.show(p, from, function (viaKey) { close(i, viaKey); });
      busy = false;
    }
    async function close(i, viaKey) {
      if (busy) return;
      busy = true;
      var o = slips[i], zh = o.el.querySelector('.slip-zh');
      await read.hide({ paper: K.rel(o.card, stage), title: K.rel(zh, stage) });
      o.el.style.visibility = '';
      tune(o.rise, 260, 0.75); o.rise.t = o.REST; loop.kick();
      busy = false;
      // Keyboard users get focus back on the book; a pointer user who has moved away sees the slip go home.
      if (viaKey) shelf.books[i].el.focus({ preventScroll: true });
      else { document.activeElement && document.activeElement.blur && document.activeElement.blur(); if (!tap && !shelf.wrap.matches(':hover')) consider(-1); }
    }

    shelf.books.forEach(function (b, i) {
      if (!tap) b.el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') consider(i); });
      b.el.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        if (cur !== i) { consider(i); if (tap || e.pointerType === 'touch') return; }
        open(i);
      });
    });
    if (!tap) shelf.wrap.addEventListener('pointerleave', function () { if (!shelf.row.contains(document.activeElement)) consider(-1); });
    else stage.addEventListener('click', function (e) { if (!e.target.closest('.bk, .slip, .rd')) consider(-1); });
    K.rove(shelf, consider, function () { if (!tap) consider(-1); });
    K.measure(shelf); bird.home();
    document.addEventListener('mock:rm', function () { tips.forEach(function (t) { t.snap(); }); slips.forEach(function (o) { if (o) { o.rise.snap(); o.rot.snap(); o._dirty = true; } }); loop.kick(); });

    return {
      shelf: shelf, consider: consider, open: open, close: close, read: read,
      get busy() { return busy; }, get cur() { return cur; },
      replay: async function (i) {
        if (busy) return;
        if (read.open) { close(cur); return; }
        consider(-1); await K.wait(300);
        consider(i); await K.wait(1400);
        await open(i); await K.wait(1800);
        await close(i);
      }
    };
  }
  window.SlipShelf = SlipShelf;

  var B = SlipShelf(document.getElementById('stage-b'), { posts: K.pick(K.SET18), rowH: 230 });
  window.__B = B;
  window.replayB = function () { B.replay(7); };
})();
