/* r2-02-cards.js — slice 2: Building.dc.html's corkboard, rendered from content/building-projects.js
   in the live sort order (board lead first, then newest). Also owns the slice's scroll buttons and
   where its tier-3 arrow comes from. */
(function () {
  // Where each card hangs. Drops leave air on the board; the second card hangs low on purpose, so
  // the one note on this view has somewhere to be written. Pins are ink / green / ochre — never coral.
  var LOOK = [
    { tilt: -1.4, drop: 18, dropM: 70, pin: 50, pinM: 20, pinTilt: -9, w: 'min(430px, 74cqw)', pinC: 'var(--ink)', cls: 'lead' },
    { tilt: 2.2, drop: 112, dropM: 104, pin: 62, pinM: 62, pinTilt: 10, w: '252px', pinC: '#3D5C52' },
    { tilt: -1.7, drop: 34, dropM: 34, pin: 40, pinM: 40, pinTilt: -6, w: '252px', pinC: '#8A6A2E' },
    { tilt: 2.6, drop: 86, dropM: 86, pin: 70, pinM: 70, pinTilt: 11, w: '280px', pinC: '#3D5C52', cls: 'featured' },
    { tilt: -2, drop: 26, dropM: 26, pin: 45, pinM: 45, pinTilt: -7, w: '240px', pinC: 'var(--soft)' }
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function projects() {
    var all = Array.isArray(window.BUILDING_PROJECTS) ? window.BUILDING_PROJECTS.slice() : [];
    return all.sort(function (a, b) {
      return (Number(!!b.boardLead) - Number(!!a.boardLead)) || String(b.sortDate).localeCompare(String(a.sortDate)) || a.order - b.order;
    }).slice(0, LOOK.length);
  }

  function card(p, i) {
    var L = LOOK[i], lead = L.cls === 'lead';
    var more = p.href ? 'open → ' + esc(p.href.replace(/^\.\//, '')) + '<span class="zh">打开</span>'
      : p.repo ? 'repo → ' + esc(p.repo.replace(/^https:\/\//, '')) + '<span class="zh">代码</span>' : '';
    var caps = !lead && i > 1 && p.capabilities ? '<span class="bd-caps">' + p.capabilities.slice(0, 2).map(function (c) { return '<span>· ' + esc(c) + '</span>'; }).join('') + '</span>' : '';
    var note = lead ? p.note : p.note.split(/(?<=\.)\s/)[0];
    var style = '--tilt:' + L.tilt + 'deg;--drop-d:' + L.drop + 'px;--drop-m:' + L.dropM + 'px;--pin-d:' + L.pin + '%;--pin-m:' + L.pinM + '%;--pin-tilt:' + L.pinTilt + 'deg;--w:' + L.w + ';--pin:' + L.pinC;
    return '<div class="bd-slot' + (lead ? ' bd-slot--lead' : '') + '" style="' + style + '">' +
      '<svg class="bd-pin" viewBox="0 0 20 40" aria-hidden="true"><ellipse class="ps" cx="11.5" cy="37" rx="5" ry="1.6"/><path class="pst" d="M10 12 L10 36"/><circle class="ph" cx="10" cy="8" r="7"/></svg>' +
      '<button type="button" class="bd-card' + (L.cls ? ' bd-card--' + L.cls : '') + '" data-tier="card" aria-expanded="false" data-id="' + esc(p.id) + '">' +
      '<span class="bd-kind">' + esc(p.kind) + ' · ' + esc(p.period) + (p.lifecycle === 'wip' ? '<span class="life">wip</span>' : '') + '</span>' +
      '<span class="bd-title"><span class="pen-t">' + esc(p.title) + '</span></span>' +
      '<span class="bd-note">' + esc(note) + '</span>' + caps +
      (more ? '<span class="bd-more">' + more + '</span>' : '') +
      '</button></div>';
  }

  function render(stage) {
    var track = stage.querySelector('[data-track]');
    track.innerHTML = projects().map(card).join('');
    return track;
  }

  // Tier 3 on this view points at the lead card: Fred's own emphasis. The note is written in the air
  // the low-hanging second card leaves on the board; on a phone, in the air above the lead card.
  function geo(stage, track) {
    return function (tb) {
      var narrow = stage.clientWidth < 640, slots = track.children;
      if (!narrow && slots[1]) {
        var nx = slots[1].offsetLeft + 4, ny = 40;
        return { a: [nx - 8, ny + 10], b: [tb.x + tb.w + 12, tb.y + tb.h * .42], bend: .3, head: 10,
          note: { x: nx, y: ny, align: 'left', rot: -4 } };
      }
      var cx = tb.x + tb.w + 40, cy = 34;
      return { a: [cx - 6, cy + 22], b: [tb.x + tb.w + 8, tb.y + tb.h * .3], bend: .34, head: 9,
        note: { x: cx, y: cy, align: 'center', rot: -4 } };
    };
  }

  // The live scroll buttons: page the board by 80% of its width; disable at either end.
  function wireScroll(stage, onEdge) {
    var vp = stage.querySelector('.bd-viewport'), btns = stage.querySelectorAll('.bd-scroll');
    function edges() {
      var max = vp.scrollWidth - vp.clientWidth - 2;
      btns.forEach(function (b) {
        var off = +b.dataset.dir < 0 ? vp.scrollLeft <= 2 : vp.scrollLeft >= max;
        if (off !== b.disabled) { b.disabled = off; onEdge(b, off); }
      });
    }
    vp.addEventListener('scroll', function () { requestAnimationFrame(edges); }, { passive: true });
    window.addEventListener('resize', edges);
    edges();
    return {
      page: function (dir) { vp.scrollBy({ left: dir * vp.clientWidth * .8, behavior: Pen.reduced() ? 'auto' : 'smooth' }); },
      home: function () { vp.scrollLeft = 0; edges(); },
      edges: edges
    };
  }

  window.BuildSlice = { render: render, geo: geo, wireScroll: wireScroll };
})();
