/* lib/gallery/app.js — Gallery (fig.03): the darkroom and the line (design/2026-09-motion/r2-06-gallery.html).
   Mounts into the empty [data-mount=gallery] host in the page's DC template: the category and year filters as pen tiers (hover
   is the coral line, the chosen one keeps the wheat band), the count, the lines and the end note. The photos are
   shuffled once per load; a filter re-pegs the matching prints onto the same ropes. Needs motion.js, pen.js,
   pen-tier.js, site.js (FY.mount) and content/photos.js. */
import { Lines } from './lines.js';
import { esc } from './rope.js';
import './develop.js';   // listed here too, so the whole module graph is fetched in two round trips, not three
import './viewer.js';

const CAT = { landscape: 'Landscape', cityscape: 'Cityscape', people: 'People', architecture: 'Architecture', street: 'Street', creature: 'Creature', 'black and white': 'B & W', abstract: 'Abstract' };
const ALL = (window.FY_PHOTOS || []).map(function (p) {
  return Object.assign({}, p, {
    rot: ((p.id * 53) % 9) - 4,                                   // the same hand-hung tilt as always
    year: p.date.slice(0, 4), dateLabel: p.date.slice(0, 7).replace('-', '·'), catLabel: CAT[p.cat] || p.cat
  });
});
for (let i = ALL.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), t = ALL[i]; ALL[i] = ALL[j]; ALL[j] = t; }

function tally(list, key) { const n = {}; list.forEach(function (p) { n[p[key]] = (n[p[key]] || 0) + 1; }); return n; }

function mount(host) {
  host.innerHTML = '<div class="g-filters">' +
    '<div class="g-chips" role="group" aria-label="Filter by category · 按类别" data-key="cat"></div>' +
    '<div class="g-chips" role="group" aria-label="Filter by year · 按年份" data-key="year"></div></div>' +
    '<p class="g-count" aria-live="polite"></p><div class="g-rack"></div>' +
    '<div class="g-end"><span class="more-d">keep scrolling, the next line gets strung here ↓ · 往下走，再拉一根绳</span>' +
    '<span class="more-m">the next line is strung as you get here · 到这儿再拉一根绳 ↓</span><span class="done"></span></div>';
  const st = { cat: 'all', year: 'all' }, byCat = tally(ALL, 'cat');
  const rows = {
    cat: [{ id: 'all', label: 'All · 全部' }].concat(Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; }).map(function (c) { return { id: c, label: CAT[c] || c }; })),
    year: [{ id: 'all', label: 'All years · 全部年份' }].concat(Object.keys(tally(ALL, 'year')).sort().reverse().map(function (y) { return { id: y, label: y }; }))
  };
  const countEl = host.querySelector('.g-count');
  const lines = new Lines(host, function (shown, tot) {
    countEl.textContent = 'Showing ' + shown + ' / ' + tot + ' · 显示 ' + shown + ' / ' + tot + ' 张 · ' + ALL.length + ' frames total';
    host.setAttribute('data-filtered', tot);
  });
  const matches = function (p, skip) { return (skip === 'cat' || st.cat === 'all' || p.cat === st.cat) && (skip === 'year' || st.year === 'all' || p.year === st.year); };

  // Each axis counts what the other axis leaves, so a chip that would empty the lines is disabled, not hidden.
  function recount() {
    Object.keys(rows).forEach(function (key) {
      const base = ALL.filter(function (p) { return matches(p, key); }), n = tally(base, key);
      rows[key].forEach(function (c) {
        const k = c.id === 'all' ? base.length : n[c.id] || 0;
        c.n.textContent = k;
        if (c.btn.disabled !== !k) { c.btn.disabled = !k; if (c.w) c.w.refresh(); }
      });
    });
  }
  function choose(key, id, e) {
    if (st[key] === id) return;
    st[key] = id;
    rows[key].forEach(function (c) {
      const on = c.id === id;
      c.btn.setAttribute('aria-pressed', on);
      c.w.set(on, on ? (e.detail === 0 ? 'key' : 'press') : 'hover');
    });
    recount();
    lines.restring(ALL.filter(function (p) { return matches(p); }));
  }
  host.querySelectorAll('.g-chips').forEach(function (row) {
    const key = row.getAttribute('data-key');
    rows[key].forEach(function (c) {
      const btn = c.btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'g-chip'; btn.setAttribute('aria-pressed', c.id === st[key]);
      btn.setAttribute('data-pen-seed', 'gallery-' + key + '-' + c.id);   // counts change; the stroke doesn't
      btn.innerHTML = esc(c.label) + '<sup></sup>';
      c.n = btn.querySelector('sup');
      row.appendChild(btn);
      btn.addEventListener('click', function (e) { choose(key, c.id, e); });
    });
  });
  recount();
  Object.keys(rows).forEach(function (key) { rows[key].forEach(function (c) { c.w = Tier.wire(c.btn, { chosen: c.id === st[key] }); }); });
  lines.show(ALL);
}

// Build after the frame that paints the intro: the h1 is the page's LCP element, so the lines never hold it back.
FY.mount('[data-mount=gallery]', function (host) { requestAnimationFrame(function () { setTimeout(function () { mount(host); }); }); });
