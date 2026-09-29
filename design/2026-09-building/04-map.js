/* design/2026-09-building · the system map, rebuilt on the site's system. One core (fred-agent.js's path rule: from an
   outcome back through its protocol to its handles; from a handle forward to what it enables; a protocol both ways) and
   three ways of showing a path, one per candidate:
     A  cards on a table: the path's cards lift toward you (physics clock, one small overshoot) and its pencil lines ink in
     B  pins and thread: every link is a thread between two pins, hanging slack; the path's threads are pulled taut (a
        spring on each thread's sag, one small overshoot) and darken, the rest stay slack
     C  the pen draws it: hovering draws the path's lines in the pen's coral, one confident pass, retracting faster;
        locking a module cools them into the wheat band's edge and they stay (notice → chosen, as on every link)
   The pen's states on every module: hover the coral underline, focus 「 」, the locked module the wheat band.
   Every loop sleeps when nothing moves; reduced motion lands every state at once. */
const NS = 'http://www.w3.org/2000/svg';

export function initMap(shell, c) {
  if (!shell || shell.dataset.ready) return;
  shell.dataset.ready = '1';
  const map = shell.querySelector('.map'), svg = shell.querySelector('.map-lines');
  const nodes = [...shell.querySelectorAll('[data-node-id]')], byId = {};
  nodes.forEach((n) => { byId[n.dataset.nodeId] = n; });
  const edges = [...shell.querySelectorAll('.map-edge')].map((e) => ({ from: e.dataset.from, to: e.dataset.to, sag: 1, v: 0, goal: 1 }));
  const rails = [...shell.querySelectorAll('[data-rail-id]')];
  const detail = shell.querySelector('.map-detail'), dl = detail.querySelector('[data-detail-label]'), dt = detail.querySelector('[data-detail-title]'), ds = detail.querySelector('[data-detail-summary]'), dm = detail.querySelector('[data-detail-meta]');
  let locked = null, traced = null;
  const inc = (id) => edges.filter((e) => e.to === id), out = (id) => edges.filter((e) => e.from === id);
  function path(id) {
    const ids = new Set([id]), n = byId[id];
    if (!n) return ids;
    if (n.dataset.layer === 'use-case') inc(id).forEach((e) => { ids.add(e.from); inc(e.from).forEach((d) => ids.add(d.from)); });
    else if (n.dataset.layer === 'workflow') { inc(id).forEach((e) => ids.add(e.from)); out(id).forEach((e) => ids.add(e.to)); }
    else out(id).forEach((e) => { ids.add(e.to); out(e.to).forEach((o) => ids.add(o.to)); });
    return ids;
  }

  // ---- the lines: one base (pencil) and, for C, one pen stroke per link ----
  edges.forEach((e) => {
    e.base = document.createElementNS(NS, 'path'); e.base.setAttribute('class', 'ml-base'); svg.appendChild(e.base);
    if (c === 'c') { e.hot = document.createElementNS(NS, 'path'); e.hot.setAttribute('class', 'ml-hot'); svg.appendChild(e.hot); }
  });
  let geo = [];
  function box(n) { const r = n.getBoundingClientRect(), m = map.getBoundingClientRect(); return { x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height }; }
  function wob(pts, seed) { const r = Pen.rng(seed); return Pen.smooth(pts.map((p, i) => i && i < pts.length - 1 ? [p[0] + (r() - .5) * 1.4, p[1] + (r() - .5) * 1.4] : p)); }
  function layout() {
    const m = map.getBoundingClientRect();
    svg.setAttribute('width', m.width); svg.setAttribute('height', m.height);
    const cols = c === 'c' && innerWidth > 760;
    geo = edges.map((e) => {
      const a = box(byId[e.from]), b = box(byId[e.to]);
      if (cols) return { p: [a.x + a.w, a.y + a.h / 2], q: [b.x, b.y + b.h / 2], h: true };
      if (c === 'b') return { p: [a.x + a.w / 2, a.y + 4], q: [b.x + b.w / 2, b.y + 4] };   // pin to pin
      const up = a.y > b.y;   // handles sit below what they enable (A, B) or above it (C on a phone)
      return { p: [a.x + a.w / 2, up ? a.y : a.y + a.h], q: [b.x + b.w / 2, up ? b.y + b.h : b.y] };
    });
    draw();
    if (c === 'c') edges.forEach((e) => { const L = e.hot.getTotalLength(); e.L = L; if (!e.on) { e.hot.style.strokeDasharray = L + ' ' + (L + 20); e.hot.style.strokeDashoffset = L; } });
  }
  function d(e, i) {
    const g = geo[i], p = g.p, q = g.q;
    if (g.h) { const mx = (p[0] + q[0]) / 2; return 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' C' + mx.toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + q[1].toFixed(1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
    if (c === 'b') {   // a thread hanging between two pins: its sag grows with the span, a pull takes most of it out
      const span = Math.hypot(q[0] - p[0], q[1] - p[1]), s = span * 0.16 * e.sag, pts = [];
      for (let k = 0; k <= 16; k++) { const t = k / 16, y = p[1] + (q[1] - p[1]) * t + s * 4 * t * (1 - t); pts.push([p[0] + (q[0] - p[0]) * t, y]); }
      return Pen.smooth(pts);
    }
    return wob([p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], q], e.from + e.to);
  }
  function draw() { edges.forEach((e, i) => { const s = d(e, i); e.base.setAttribute('d', s); if (e.hot) e.hot.setAttribute('d', s); }); }

  // ---- B · the threads' springs, on one sleeping loop ----
  const loop = c === 'b' ? new Motion.Loop((dt) => {
    let busy = false;
    edges.forEach((e) => { const k = 260, cc = 2 * .62 * Math.sqrt(k); e.v += (k * (e.goal - e.sag) - cc * e.v) * dt; e.sag += e.v * dt; if (Math.abs(e.goal - e.sag) > .002 || Math.abs(e.v) > .01) busy = true; else { e.sag = e.goal; e.v = 0; } });
    draw();
    return busy;
  }) : null;

  // ---- C · the pen draws a link (coral while it is only noticed; the wheat edge once a module is locked) ----
  function pen(e, on, cool) {
    if (!e.hot) return;
    e.hot.classList.toggle('cool', !!cool);
    if (on === e.on) return;
    e.on = on;
    const L = e.L || e.hot.getTotalLength(), rm = Motion.reduced();
    e.hot.getAnimations().forEach((a) => a.cancel());
    e.hot.style.strokeDasharray = L + ' ' + (L + 20);
    if (rm) { e.hot.style.strokeDashoffset = on ? 0 : L; return; }
    const from = on ? L : 0, to = on ? 0 : -L;
    e.hot.animate([{ strokeDashoffset: from }, { strokeDashoffset: to }], { duration: on ? Math.min(460, 180 + L * .7) : 160, easing: on ? 'cubic-bezier(.55,.1,.25,1)' : 'cubic-bezier(.4,0,.8,.4)' });
    e.hot.style.strokeDashoffset = on ? 0 : L;
  }

  function render(id, lock) {
    traced = id;
    const ids = id ? path(id) : new Set(), rs = new Set();
    ids.forEach((x) => (byId[x] && byId[x].dataset.rails || '').split(/\s+/).forEach((r) => r && rs.add(r)));
    map.classList.toggle('is-tracing', !!id);
    nodes.forEach((n) => {
      const on = ids.has(n.dataset.nodeId), me = n.dataset.nodeId === locked;
      n.classList.toggle('is-path', on); n.classList.toggle('is-selected', me);
      n.setAttribute('aria-pressed', me ? 'true' : 'false'); n.setAttribute('aria-expanded', me ? 'true' : 'false');
      if (n.fyWire) n.fyWire.refresh('hover');
    });
    edges.forEach((e) => {
      const on = ids.has(e.from) && ids.has(e.to);
      e.base.classList.toggle('is-path', on);
      if (c === 'b') { e.goal = on ? .22 : 1; if (Motion.reduced()) { e.sag = e.goal; e.v = 0; } }
      pen(e, on, !!locked);
    });
    if (loop) { if (Motion.reduced()) draw(); else loop.kick(); }
    rails.forEach((r) => r.classList.toggle('is-path', rs.has(r.dataset.railId)));
    const n = locked && byId[locked];
    detail.classList.toggle('is-open', !!n);
    dl.textContent = n ? n.dataset.layerLabel : 'Module explainer';
    dt.textContent = n ? n.dataset.title : 'Click any module';
    ds.textContent = n ? n.dataset.summary : 'A locked selection explains what the module owns and where it participates.';
    dm.textContent = n ? n.dataset.uses : 'Click or tap toggles · Escape clears';
  }
  const clear = () => { locked = null; render(null); };
  nodes.forEach((n) => {
    const id = n.dataset.nodeId;
    n.fyWire = Tier.wire(n, { target: '.pen-t', chosen: () => locked === id, focus: { on: 'host', gap: 5, gy: 4 } });
    n.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && !locked) render(id); });
    n.addEventListener('pointerleave', () => { if (!locked) render(null); });
    n.addEventListener('focus', () => { if (!locked && n.matches(':focus-visible')) render(id); });
    n.addEventListener('blur', () => { if (!locked) render(null); });
    n.addEventListener('click', () => { locked = locked === id ? null : id; render(locked); });
  });
  shell.querySelector('[data-map-clear]').addEventListener('click', clear);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && locked) clear(); });
  new ResizeObserver(layout).observe(map);
  document.fonts.ready.then(layout);
  layout();
  return { clear, render };
}
