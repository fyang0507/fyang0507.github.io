/* Fred Agent · System's map, drawn by the pen (design/2026-09-building, candidate C, from 04-map.js; the path rule and
   the explainer are fred-agent.js's). A path runs from an outcome back through its protocol to its handles, from a
   handle forward to what it enables, and from a protocol both ways. Every link is a faint pencil line at rest. Hovering
   or focusing a module draws its path's links in the pen's coral, one confident pass that retracts faster; a click
   locks the module: it is chosen (the wheat band, Tier.wire), its explainer opens, and its links cool into the band's
   edge and stay. A second click, Escape or "Clear path" clears it. The columns read left to right, handles → protocols
   → outcomes; on a phone they stack in that order. Reduced motion lands every state at once. Styles in fred-agent.css. */
const NS = 'http://www.w3.org/2000/svg';

function initMap(shell) {
  const map = shell.querySelector('.map'), svg = shell.querySelector('.map-lines');
  const nodes = [...shell.querySelectorAll('[data-node-id]')], byId = {};
  nodes.forEach((n) => { byId[n.dataset.nodeId] = n; n.setAttribute('aria-controls', 'map-detail'); n.setAttribute('aria-expanded', 'false'); });
  const edges = [...shell.querySelectorAll('.map-edge')].map((e) => ({ from: e.dataset.from, to: e.dataset.to }));
  const rails = [...shell.querySelectorAll('[data-rail-id]')];
  const detail = shell.querySelector('.map-detail'), field = (k) => detail.querySelector('[data-detail-' + k + ']');
  const rest = ['label', 'title', 'summary', 'meta'].map((k) => field(k).textContent);
  let locked = null;
  const inc = (id) => edges.filter((e) => e.to === id), out = (id) => edges.filter((e) => e.from === id);
  function path(id) {
    const ids = new Set([id]), n = byId[id];
    if (n.dataset.layer === 'use-case') inc(id).forEach((e) => { ids.add(e.from); inc(e.from).forEach((d) => ids.add(d.from)); });
    else if (n.dataset.layer === 'workflow') { inc(id).forEach((e) => ids.add(e.from)); out(id).forEach((e) => ids.add(e.to)); }
    else out(id).forEach((e) => { ids.add(e.to); out(e.to).forEach((o) => ids.add(o.to)); });
    return ids;
  }

  // one faint base line per link, and over it the pen's stroke, hidden until a path is noticed
  edges.forEach((e) => ['base', 'hot'].forEach((k) => { e[k] = document.createElementNS(NS, 'path'); e[k].setAttribute('class', 'ml-' + k); svg.appendChild(e[k]); }));
  function box(n, m) { const r = n.getBoundingClientRect(); return { x: r.left - m.left, y: r.top - m.top, w: r.width, h: r.height }; }
  function layout() {
    const m = map.getBoundingClientRect(), cols = getComputedStyle(map).display === 'grid';
    svg.setAttribute('width', m.width); svg.setAttribute('height', m.height);
    edges.forEach((e) => {
      const a = box(byId[e.from], m), b = box(byId[e.to], m);
      let d;
      if (cols) {   // side to side: from a handle's right edge to a protocol's left, a soft S
        const p = [a.x + a.w, a.y + a.h / 2], q = [b.x, b.y + b.h / 2], mx = (p[0] + q[0]) / 2;
        d = 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' C' + mx.toFixed(1) + ' ' + p[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + q[1].toFixed(1) + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
      } else {      // stacked: from a module's foot to the next one's head, with the hand's wobble
        const p = [a.x + a.w / 2, a.y + a.h], q = [b.x + b.w / 2, b.y], r = Pen.rng(e.from + e.to);
        d = Pen.smooth([p, [(p[0] + q[0]) / 2 + (r() - .5) * 1.4, (p[1] + q[1]) / 2 + (r() - .5) * 1.4], q]);
      }
      e.base.setAttribute('d', d); e.hot.setAttribute('d', d);
      e.L = e.hot.getTotalLength();
      e.hot.style.strokeDasharray = Pen.dashes(e.hot, e.L);
      if (!e.on) e.hot.style.strokeDashoffset = Pen.hiddenAt(e.hot, e.L);   // one cap past the end: a round cap left at 0 is a dot
    });
  }
  // the pen draws a link in coral while its path is only noticed, in the band's edge once a module is locked
  function pen(e, on, cool) {
    e.hot.classList.toggle('cool', cool);
    if (on === !!e.on) return;
    e.on = on;
    const L = e.L, H = Pen.hiddenAt(e.hot, L);
    e.hot.getAnimations().forEach((a) => a.cancel());
    e.hot.style.strokeDashoffset = on ? 0 : H;
    if (Motion.reduced()) return;
    e.hot.animate([{ strokeDashoffset: on ? H : 0 }, { strokeDashoffset: on ? 0 : -H }], on
      ? { duration: Math.min(460, 180 + L * .7), easing: 'cubic-bezier(.55,.1,.25,1)' }
      : { duration: 160, easing: 'cubic-bezier(.4,0,.8,.4)' });
  }

  function render(id) {
    const ids = id ? path(id) : new Set(), rs = new Set();
    ids.forEach((x) => byId[x].dataset.rails.split(/\s+/).forEach((r) => r && rs.add(r)));
    map.classList.toggle('is-tracing', !!id);
    nodes.forEach((n) => {
      const me = n.dataset.nodeId === locked;
      n.classList.toggle('is-path', ids.has(n.dataset.nodeId));
      n.setAttribute('aria-pressed', String(me)); n.setAttribute('aria-expanded', String(me));
      n.fyWire.refresh('hover');
    });
    edges.forEach((e) => { const on = ids.has(e.from) && ids.has(e.to); e.base.classList.toggle('is-path', on); pen(e, on, !!locked); });
    rails.forEach((r) => r.classList.toggle('is-path', rs.has(r.dataset.railId)));
    const n = locked && byId[locked], text = n ? [n.dataset.layerLabel, n.dataset.title, n.dataset.summary, n.dataset.uses] : rest;
    detail.classList.toggle('is-open', !!n);
    ['label', 'title', 'summary', 'meta'].forEach((k, i) => { field(k).textContent = text[i]; });
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
  const clearBtn = shell.querySelector('[data-map-clear]');
  Tier.wire(clearBtn, { target: '.pen-t', focus: { on: 'host', gap: 4, gy: 3 } });
  clearBtn.addEventListener('click', clear);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && locked) { clear(); clearBtn.focus(); } });
  new ResizeObserver(layout).observe(map);
  document.fonts.ready.then(layout);
  layout();
}

FY.styled(() => document.querySelectorAll('[data-system-map]').forEach(initMap));
