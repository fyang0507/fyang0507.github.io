/* r4-03-fill.js — how the bookcase fills, as a pure layout (no DOM), so both growth rules can be compared
   and measured at 27, 60 and 120 essays. Books arrive in reading order (newest first).
     grow  (a) every book stands upright; a plank is added whenever the last one is full. One plank per
               ~13–14 books at 1440. Chronological top to bottom, newest top-left after the ghost.
     cap   (b) upright books keep today's C planks (the ones 27 essays need). Recent years stand on them; once
               they are full, every older year is laid flat in stacks after them, one stack per year (a year too
               tall for one stack takes two), spines out. Stacks sit on the planks like the upright books and
               take the same reflow. They continue onto planks below the cap: a capped case cannot hide books.
   A flat book's footprint is its spine length, and a stack is as tall as the gap under the plank above, so a
   full stack of ~6 books costs ~250 px of plank where the same six stand in ~320 px. But a year stack is that
   wide whatever it holds, and at 60–120 essays a year holds 3–7: measured, (b) needs MORE planks than (a).
   g: { x0, cap, gW, GAP, SH (stack height limit), strip }; items: [{ w, h, year }].
   Returns { ok, rows, slots: [{ i, row, x, flat, base }], stacks: [{ row, cx, w, year, lead }] }. */
(function () {
  function place(items, U, Rmax, g) {
    var row = 0, x = g.x0 + g.gW + g.GAP, slots = [], stacks = [], end = g.x0 + g.cap;
    function room(wd) {
      if (g.strip || x + wd <= end) return true;
      row++; x = g.x0;
      return row < Rmax;
    }
    for (var i = 0; i < U; i++) {
      if (!room(items[i].w)) return { ok: false };
      slots.push({ i: i, row: row, x: x, flat: false, base: 0 }); x += items[i].w + g.GAP;
    }
    var lastYear = null;
    i = U;
    while (i < items.length) {
      var yr = items[i].year, group = [], hs = 0, mh = 0;
      while (i < items.length && items[i].year === yr && (!group.length || hs + items[i].w <= g.SH)) {
        group.push(i); hs += items[i].w; mh = Math.max(mh, items[i].h); i++;
      }
      var sw = mh + g.GAP;
      if (!room(sw)) return { ok: false };
      var cx = x + sw / 2, base = 0;
      for (var j = group.length - 1; j >= 0; j--) {                       // oldest at the bottom, newest on top
        slots.push({ i: group[j], row: row, x: cx, flat: true, base: base }); base += items[group[j]].w;
      }
      stacks.push({ row: row, cx: cx, w: sw, year: yr, lead: yr !== lastYear });
      lastYear = yr; x += sw + g.GAP;
    }
    return { ok: true, rows: row + 1, slots: slots, stacks: stacks };
  }
  // Where a year starts in reading order: the only places the upright run may end (whole years lie flat).
  function bounds(items) {
    var b = [0];
    for (var i = 1; i < items.length; i++) if (items[i].year !== items[i - 1].year) b.push(i);
    b.push(items.length);
    return b;
  }
  // cap: upright books may use only the first C planks; the upright run ends at a year boundary and every
  // older year lies flat. The stacks start right after the last upright book and take as many planks as they
  // need below the cap — a capped case cannot hide books, so it grows anyway.
  function fill(items, g, rule, C) {
    if (g.strip || rule !== 'cap') return place(items, items.length, g.strip ? 1 : 1e6, g);
    var all = place(items, items.length, C, g);
    if (all.ok) return all;
    var B = bounds(items);
    for (var j = B.length - 1; j >= 0; j--) {
      var r = place(items, B[j], 1e6, g), last = B[j] - 1;
      if (last < 0 || r.slots[last].row < C) return r;
    }
    return place(items, 0, 1e6, g);
  }
  window.Fill4 = { place: place, fill: fill };
})();
