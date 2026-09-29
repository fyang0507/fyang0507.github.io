/* r3-02-slices.js — wires both live slices to the pen.
   Every interactive element ([data-tier]) owns one TierMark (the stroke's two tiers) and one
   FocusMark (「 」). Its tier is derived, never set: (on || pressed) ? 2 : hovered ? 1 : 0. "on" is
   the element's own state — selected tag, current page, open card — and "pressed" is a finger or
   button held down. Each view has at most one PointMark, which is not a tier: it sits outside them. */
(function () {
  var ROLE = {
    nav: { target: '.pen-t', group: 'nav', mode: 'select', gap: 1 },
    link: { mode: 'momentary', gap: 1, over: 3 },
    filter: { group: 'filter', mode: 'select', gap: 2 },
    action: { target: '.pen-t', mode: 'momentary', gap: 2 },
    card: { target: '.pen-t', group: 'card', mode: 'toggle', gap: 3, focusHost: true, big: true, fgap: 7, fgy: 7 },
    scroll: { target: '.bd-g', mode: 'momentary', gap: 0, over: 2, focusHost: true, fgap: 5, fgy: 5 }
  };
  var stages = [];
  var now = function () { return performance.now(); };
  // A host that changes size (an opened card grows a line) re-fits its marks from the same seed.
  var fit = new ResizeObserver(function (es) { es.forEach(function (e) { var it = e.target._item; if (it) { it.mark.build(); it.focus.build(); } }); });

  function Item(st, host) {
    var role = host.dataset.tier, c = ROLE[role];
    this.st = st; this.host = host; this.role = role; this.c = c;
    this.slot = host.closest('.bd-slot');
    var target = c.target ? host.querySelector(c.target) : host;
    this.mark = new TierMark(host, target, { gap: c.gap, over: c.over });
    this.focus = new FocusMark(host, c.focusHost ? host : target, { big: c.big, gap: c.fgap, gy: c.fgy });
    this.on = this.initial = host.getAttribute('aria-current') === 'page' || host.getAttribute('aria-pressed') === 'true' || host.getAttribute('aria-expanded') === 'true';
    this.hovered = this.pressed = this.focused = false; this.holdUntil = 0;
    host._item = this; fit.observe(host);
  }
  Item.prototype.tier = function () { return this.host.disabled ? 0 : (this.on || this.pressed) ? 2 : this.hovered ? 1 : 0; };
  Item.prototype.refresh = function (how) {
    var t = this.tier();
    if (t !== this.mark.tier || how === 'instant') {
      var d = this.mark.to(t, how || 'hover');
      if (t === 2) this.holdUntil = now() + d / R2Anim.speed;
    }
    var h = this.host.classList;
    h.toggle('t1', t === 1); h.toggle('t2', t === 2);
    h.toggle('is-hover', this.hovered); h.toggle('is-focus', this.focused);
    if (this.slot) { this.slot.classList.toggle('is-hover', this.hovered); this.slot.classList.toggle('is-open', this.on); }
    this.focus.set(this.focused, how === 'instant');
  };
  Item.prototype.setOn = function (on, how) {
    this.on = on;
    var h = this.host;
    if (this.role === 'nav') { if (on) h.setAttribute('aria-current', 'page'); else h.removeAttribute('aria-current'); }
    else if (this.role === 'filter') h.setAttribute('aria-pressed', on ? 'true' : 'false');
    else if (this.role === 'card') h.setAttribute('aria-expanded', on ? 'true' : 'false');
    this.refresh(how);
  };
  // A press holds tier 2 at least until the gesture has landed, so a quick tap still reads whole.
  Item.prototype.release = function () {
    var self = this, wait = Math.max(0, this.holdUntil - now());
    clearTimeout(this.relT);
    this.relT = setTimeout(function () { self.pressed = false; self.refresh('hover'); }, this.c.mode === 'momentary' ? wait : 30);
  };

  // Choosing: the new choice upgrades while the old one drains, at the same time.
  function choose(st, it, how) {
    var c = it.c;
    if (c.mode === 'select' && it.on) return;
    st.items.forEach(function (o) { if (o !== it && o.c.group === c.group && o.on) o.setOn(false, 'hover'); });
    it.setOn(c.mode === 'toggle' ? !it.on : true, how);
  }

  function act(st, it, how) {
    var c = it.c;
    if (c.mode !== 'momentary') { choose(st, it, how); if (it.host === st.pointHost) st.point.lift(); return; }
    if (how === 'key') { it.pressed = true; it.refresh('key'); it.release(); }
    if (it.role === 'action') { loadMore(it.host); if (it.host === st.pointHost) st.point.lift(); }
    if (it.role === 'scroll' && st.scroller) st.scroller.page(+it.host.dataset.dir);
  }

  function wire(st, it) {
    var h = it.host;
    h.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; it.hovered = true; it.refresh('hover'); });
    h.addEventListener('pointerleave', function () { it.hovered = false; if (it.c.mode !== 'momentary') it.pressed = false; it.refresh('hover'); if (it.pressed) it.release(); });
    h.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || h.disabled) return;
      it.pressed = true; it.refresh(e.pointerType === 'touch' ? 'tap' : 'press');
    });
    h.addEventListener('pointerup', function () { if (it.pressed) it.release(); });
    h.addEventListener('pointercancel', function () { if (it.pressed) it.release(); });
    h.addEventListener('focus', function () { it.focused = h.matches(':focus-visible'); it.refresh(); });
    h.addEventListener('blur', function () { it.focused = false; it.refresh(); });
    h.addEventListener('click', function (e) {
      if (h.tagName === 'A') e.preventDefault();            // the specimen never leaves the board
      act(st, it, e.detail === 0 ? 'key' : 'press');
    });
  }

  function loadMore(host) {
    var n = host.querySelector('[data-remaining]'), left = +n.dataset.remaining - 6;
    if (left < 0) left = 12;
    n.dataset.remaining = left;
    n.textContent = left ? left + ' remaining · 还剩 ' + left + ' 张' : 'all hung · 全部晾完';
  }

  function relBox(el, frame) { return ArrowFit.rel(el.getBoundingClientRect(), frame.getBoundingClientRect()); }

  function initStage(el) {
    var kind = el.dataset.slice, st = { el: el, kind: kind, timers: [], arrived: false };
    el.appendChild(document.getElementById('slice-' + kind).content.cloneNode(true));
    if (kind === 'build') {
      BuildSlice.render(el);   // r2-02-cards.js, unchanged: the live sort order and pin looks
      // Other paper and every pin are obstacles for the arrow, like text: nothing is drawn over them.
      el.querySelectorAll('.bd-pin, .bd-card:not(.bd-card--lead)').forEach(function (n) { n.setAttribute('data-ob', ''); });
    }
    st.items = [].map.call(el.querySelectorAll('[data-tier]'), function (h) { return new Item(st, h); });
    st.items.forEach(function (it) { wire(st, it); it.refresh('instant'); });
    if (kind === 'read') {
      // The one thing this view asks: Load more. Its label says why, so there is no note.
      var spec = el.querySelector('.spec');
      st.pointHost = el.querySelector('.pn-action');
      st.point = new PointMark(spec, st.pointHost.querySelector('.pen-t'), { seed: 'load more|point', key: 'fy-r3-02-point-read',
        bounds: function () { var b = relBox(el, spec); return { x: b.x + 6, y: b.y + 6, w: b.w - 12, h: b.h - 12 }; } });
    } else {
      // The lead project: Fred's own emphasis. A card title doesn't say why, so it gets a note, and
      // the arrow points at the card from the board it is pinned to, inside the visible board.
      var track = el.querySelector('[data-track]'), vp = el.querySelector('.bd-viewport'), lead = track.querySelector('.bd-card--lead');
      st.pointHost = lead;
      st.point = new PointMark(track, lead, { seed: 'fred agent|point', key: 'fy-r3-02-point-build',
        note: '<span class="en">start here</span><span class="zh">从这里开始</span>',
        bounds: function () { var b = relBox(vp, track); return { x: b.x + 8, y: b.y + 8, w: b.w - 16, h: b.h - 16 }; } });
      st.scroller = BuildSlice.wireScroll(el, function (btn) {
        var it = st.items.filter(function (i) { return i.host === btn; })[0];
        if (it) { it.hovered = it.pressed = false; it.refresh('hover'); }
      });
      // A card that has just re-hung (its drop and tilt spring on the physics clock after a resize)
      // moves the target; solve again once it settles. Hover and open lifts are not re-hangs.
      track.addEventListener('transitionend', function (e) {
        var s = e.target;
        if (e.propertyName !== 'transform' || !s.classList.contains('bd-slot') || s.classList.contains('is-hover') || s.classList.contains('is-open')) return;
        clearTimeout(st.hangT); st.hangT = setTimeout(function () { st.point.refit(); }, 30);
      });
      st.vpFocus = new FocusMark(vp, vp, { big: true, gap: -10, gy: -10 });
      vp.addEventListener('focus', function () { st.vpFocus.set(vp.matches(':focus-visible')); });
      vp.addEventListener('blur', function () { st.vpFocus.set(false); });
    }
    stages.push(st);
    return st;
  }

  // Arrival: states are already there (they're facts, not news). The arrow is the view's one event.
  function arrive(st) {
    st.arrived = true;
    if (st.point.done()) return;
    st.timers.push(setTimeout(function () { st.point.show(); }, 450));
  }

  function rebuild(st) {
    st.items.forEach(function (it) { it.mark.build(); it.focus.build(); });
    if (st.vpFocus) st.vpFocus.build();
    st.point.refit();
  }

  function reset(st) {
    st.timers.forEach(clearTimeout); st.timers = [];
    st.items.forEach(function (it) {
      clearTimeout(it.relT);
      it.hovered = it.pressed = it.focused = false;
      it.setOn(it.initial, 'instant');
    });
    if (st.kind === 'read') { var n = st.el.querySelector('[data-remaining]'); n.dataset.remaining = 12; n.textContent = '12 remaining · 还剩 12 张'; }
    if (st.scroller) st.scroller.home();
    st.point.reset(); st.point.build();
  }

  function find(st, role, text) { return st.items.filter(function (i) { return i.role === role && i.host.textContent.indexOf(text) > -1; })[0]; }

  // The tours drive the same Item API a pointer does: hover, press, click, release.
  function tour(st, steps) {
    reset(st);
    var T = function (ms, fn) { st.timers.push(setTimeout(fn, ms / R2Anim.speed)); };
    T(150, function () { st.point.show(); });
    steps.forEach(function (s) { T(s[0], s[1]); });
  }
  function hover(it, on) { return function () { it.hovered = on; it.refresh('hover'); }; }
  function press(st, it) { return function () { it.pressed = true; it.refresh('press'); act(st, it, 'press'); it.release(); }; }
  function focus(it, on) { return function () { it.focused = on; it.refresh(); }; }

  document.querySelectorAll('[data-slice]').forEach(initStage);
  var read = stages.filter(function (s) { return s.kind === 'read'; })[0], build = stages.filter(function (s) { return s.kind === 'build'; })[0];

  window.replayRead = function () {
    var nav = find(read, 'nav', 'building'), poem = find(read, 'filter', 'poem'), link = find(read, 'link', 'Ox Alpha'), tl = find(read, 'filter', 'travel'), act1 = find(read, 'action', 'Load');
    tour(read, [
      [1300, hover(nav, true)], [2100, press(read, nav)], [3100, hover(nav, false)],
      [3400, hover(poem, true)], [4100, press(read, poem)], [5100, hover(poem, false)],
      [5400, hover(link, true)], [6000, press(read, link)], [6900, hover(link, false)],
      [7200, focus(tl, true)], [8000, focus(tl, false)],
      [8300, hover(act1, true)], [8900, press(read, act1)], [9900, hover(act1, false)]
    ]);
  };
  window.replayBuild = function () {
    var next = build.items.filter(function (i) { return i.role === 'scroll' && i.host.dataset.dir === '1'; })[0];
    var prev = build.items.filter(function (i) { return i.role === 'scroll' && i.host.dataset.dir === '-1'; })[0];
    var lead = build.items.filter(function (i) { return i.host === build.pointHost; })[0];
    tour(build, [
      [2000, hover(lead, true)], [2700, press(build, lead)], [3900, press(build, lead)], [4800, hover(lead, false)],
      [5200, hover(next, true)], [5700, press(build, next)], [6500, hover(next, false)],
      [7000, hover(prev, true)], [7500, press(build, prev)], [8300, hover(prev, false)]
    ]);
  };

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var st = stages.filter(function (s) { return s.el === e.target; })[0];
      if (st && !st.arrived) arrive(st);
      io.unobserve(e.target);
    });
  }, { threshold: .35 });
  stages.forEach(function (st) { io.observe(st.el); });

  var ro = new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var st = stages.filter(function (s) { return s.el === e.target; })[0], w = Math.round(e.contentRect.width);
      if (!st || st.w === w) return;
      st.w = w; requestAnimationFrame(function () { rebuild(st); });
    });
  });
  stages.forEach(function (st) { ro.observe(st.el); });
  if (document.fonts) document.fonts.ready.then(function () { stages.forEach(rebuild); });

  var slow = document.getElementById('slowmo');
  slow.addEventListener('change', function () { R2Anim.speed = slow.checked ? .25 : 1; });
  document.addEventListener('mock:rm', function () { R2Anim.all(function (a) { a.finish(); }); });

  window.R3Board = { stages: stages, find: find, reset: reset, rebuild: rebuild };
})();
