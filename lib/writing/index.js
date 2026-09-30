/* lib/writing/index.js — the index beside the bookcase: one filter, two dimensions, stated in one place.
     Filter   state { cat, ys }: a category (or all) and a span of years (or every year). The dimension you
              touch wins and the other gives way: choose a tag with nothing in the chosen years and the years
              release; choose years with nothing for the tag and the tag releases. The released value stays in
              the readout, struck through in pencil, until the next change. A span empty for every tag (2020)
              stays honestly empty. The state object belongs to the caller, so it outlives a re-layout.
     Readout  "N / 27 essays · N / 27 篇", then the sentence ("游记 travel log · 2015–2019"), aria-live.
     Tabs     the index is a closed book, cover toward you, with a title slip (类别 · tags); the tabs come out
              of its fore-edge, each a paper flap with a glued lip and a pencil contact line. They ride springs:
              the chosen one springs out, a hovered one eases out, one with nothing in the chosen years sinks
              back under the cover (still clickable). On a phone they stand on a page block and the strip swipes.
   Pen: Tier.wire (hover = coral line, chosen = wheat band, focus = coral 「 」, no coral at rest). */
import { esc } from './case.js';
import { Ledger } from './ledger.js';

var NS = 'http://www.w3.org/2000/svg';

/* ---- readout ---- */
function val(v) { return (v.zh ? '<span class="zh" lang="zh">' + esc(v.zh) + '</span> ' : '') + '<span lang="en">' + esc(v.en) + '</span>'; }
function Readout(host, opt) {
  host.innerHTML = '<div class="ro" aria-live="polite">' +
    '<p class="ro-foot"><span class="ro-n"></span><button type="button" class="ro-clear" aria-label="Clear both filters"><span>clear · <span lang="zh">清除</span></span></button></p>' +
    '<p class="ro-line"><span class="ro-v ro-cat"><span class="ro-was" hidden></span><span class="ro-t"></span></span><span class="ro-sep" aria-hidden="true">·</span>' +
    '<span class="ro-v ro-yr"><span class="ro-was" hidden></span><span class="ro-t"></span></span></p></div>';
  var box = host.firstChild, cat = box.querySelector('.ro-cat'), yr = box.querySelector('.ro-yr'), n = box.querySelector('.ro-n'), clear = box.querySelector('.ro-clear');
  var wire = Tier.wire(clear, { target: clear.firstChild, over: 2, focus: { gap: 5, gy: 3 } });
  // clear hides itself once nothing is narrowed: focus goes on to the tab that is now chosen (all).
  clear.addEventListener('click', function () { var had = document.activeElement === clear; opt.onClear(); if (had) opt.refocus(); });
  function setWas(slot, v) {
    var w = slot.querySelector('.ro-was');
    if (!v) { w.innerHTML = ''; w.hidden = true; return; }
    w.hidden = false; w.innerHTML = '<span class="ro-was-t">' + val(v) + '</span>';
    var t = w.firstChild, svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'ro-strike'); w.appendChild(svg);
    var p = Pen.path(Pen.strike(t.offsetWidth, 'ro-was' + v.en), { color: 'var(--soft)', width: 1.7 });
    p.setAttribute('transform', 'translate(0 ' + (t.offsetHeight * .56).toFixed(1) + ')');
    svg.appendChild(p); Pen.draw(p, { duration: 240, delay: 120 });
  }
  return {
    destroy: function () { wire.destroy(); },
    render: function (s) {
      cat.querySelector('.ro-t').innerHTML = val(s.cat); cat.classList.toggle('is-all', !!s.cat.all);
      yr.querySelector('.ro-t').innerHTML = val(s.years); yr.classList.toggle('is-all', !!s.years.all);
      n.innerHTML = s.n + ' / ' + s.total + ' ' + (s.total === 1 ? s.noun.one : s.noun.many) + ' · ' + s.n + ' / ' + s.total + ' <span lang="zh">' + s.noun.zh + '</span>';
      setWas(cat, s.was && s.was.which === 'cat' ? s.was.text : null);
      setWas(yr, s.was && s.was.which === 'years' ? s.was.text : null);
      box.classList.toggle('narrowed', s.narrowed);
      clear.tabIndex = s.narrowed ? 0 : -1; clear.setAttribute('aria-hidden', String(!s.narrowed));
      box.setAttribute('aria-busy', String(!!s.live));
    }
  };
}

/* ---- tabs on the fore-edge ---- */
var POS = { side: { on: 16, hover: 5, rest: 0, off: -8 }, strip: { on: -11, hover: -4, rest: 0, off: 8 } }, LIPW = 16;
function Tabs(col, opt) {
  var orient = col.index.orient, host = col.index.tabs, G = POS[orient], sel = 'all';
  var book = orient === 'side' ? '<div class="tb-book" aria-hidden="true"><span class="tb-slip"><b lang="zh">类别</b><i>tags</i></span></div>' : '';
  host.innerHTML = (orient === 'side' ? '' : '<div class="ctl-label tb-label" aria-hidden="true"><span lang="zh">类别</span><span>tags</span></div>') +
    '<div class="tb-block tb-' + orient + '"><div class="tb-scroll"><div class="tb-inner">' + book + '<div class="tb-group" role="radiogroup" aria-label="Tags">' +
    col.cats.map(function (c) {
      return '<button type="button" class="tb" role="radio" data-cat="' + esc(c.id) + '" aria-checked="false" tabindex="-1">' +
        '<svg class="tb-paper" aria-hidden="true"><path class="tb-lip"/><path class="tb-crease"/><path class="tb-out"/><path class="tb-contact"/></svg>' +
        '<span class="tb-lab"><span class="tb-en">' + esc(c.en) + '</span><span class="tb-zh" lang="zh">' + esc(c.zh) + '</span></span><span class="tb-n"></span><span class="sr-only tb-sr"></span></button>';
    }).join('') + '</div><div class="tb-edge" aria-hidden="true"></div></div></div></div>';
  var scroller = host.querySelector('.tb-scroll'), tabs = Array.prototype.slice.call(host.querySelectorAll('.tb'));
  var ts = tabs.map(function (t) {
    var s = { el: t, cat: t.dataset.cat, sp: new Motion.Spring({ k: 330, c: 20 }), hover: false, off: false };
    s.w = Tier.wire(t, { target: '.tb-lab', seed: 'tab|' + s.cat, over: 3, chosen: function () { return s.cat === sel; }, focus: { gap: 6, gy: 4 } });
    return s;
  });
  // The paper, drawn to each tab's size, root under the page block.
  function shape(s) {
    var w = s.el.offsetWidth, h = s.el.offsetHeight, svg = s.el.querySelector('.tb-paper'), q = function (c) { return svg.querySelector(c); };
    svg.setAttribute('width', w); svg.setAttribute('height', h + 4);
    if (orient === 'side') {
      q('.tb-out').setAttribute('d', 'M0 .75 H' + (w - 8) + ' Q' + (w - .75) + ' .75 ' + (w - .75) + ' 8 V' + (h - 8) + ' Q' + (w - .75) + ' ' + (h - .75) + ' ' + (w - 8) + ' ' + (h - .75) + ' H0 Z');
      q('.tb-lip').setAttribute('d', 'M0 1 H' + LIPW + ' V' + (h - 1) + ' H0 Z');
      q('.tb-crease').setAttribute('d', 'M' + LIPW + ' 3 V' + (h - 3));
      q('.tb-contact').setAttribute('d', 'M' + (LIPW + 3) + ' ' + (h + 2.2) + ' H' + (w - 5));
    } else {
      q('.tb-out').setAttribute('d', 'M.75 ' + h + ' V6 Q.75 .75 6 .75 H' + (w - 6) + ' Q' + (w - .75) + ' .75 ' + (w - .75) + ' 6 V' + h + ' Z');
      q('.tb-lip').setAttribute('d', 'M1 ' + (h - LIPW) + ' H' + (w - 1) + ' V' + h + ' H1 Z');
      q('.tb-crease').setAttribute('d', 'M3 ' + (h - LIPW) + ' H' + (w - 3));
      q('.tb-contact').setAttribute('d', 'M' + (w + 2.2) + ' 7 V' + (h - LIPW - 3));
    }
  }
  function target(s) { return s.cat === sel ? G.on : s.off ? G.off : s.hover ? G.hover : G.rest; }
  function paint(s) { s.el.style.transform = (orient === 'side' ? 'translateX(' : 'translateY(') + s.sp.x.toFixed(2) + 'px)'; }
  var loop = new Motion.Loop(function (dt) {
    var moving = false;
    ts.forEach(function (s) { s.sp.to = target(s); s.sp.step(dt); if (s.sp.rest(0.05)) s.sp.snap(); else moving = true; paint(s); });
    return moving;
  });
  function kick() { if (Motion.reduced()) { ts.forEach(function (s) { s.sp.snap(target(s)); paint(s); }); return; } loop.kick(); }
  var offReduced = Motion.onReduced(kick);
  tabs.forEach(function (t, i) {
    var s = ts[i];
    t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; s.hover = true; kick(); opt.onHint(s.cat); });
    t.addEventListener('pointerleave', function () { if (!s.hover) return; s.hover = false; kick(); opt.onHint(null); });
    t.addEventListener('focus', function () { if (t.matches(':focus-visible')) opt.onHint(s.cat); });
    t.addEventListener('blur', function () { opt.onHint(null); });
    t.addEventListener('click', function () { opt.onPick(s.cat); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, j = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
      if (j == null) return;
      e.preventDefault(); j = (j + tabs.length) % tabs.length;
      opt.onPick(ts[j].cat); tabs[j].focus({ preventScroll: true });
    });
  });
  function reveal(s) {                                        // a phone's strip: keep the chosen tab in view
    if (orient !== 'strip') return;
    var l = s.el.offsetLeft, r = l + s.el.offsetWidth, vw = scroller.clientWidth, x = scroller.scrollLeft;
    if (l < x + 30 || r > x + vw - 10) scroller.scrollTo({ left: Math.max(0, l - 40), behavior: Motion.reduced() ? 'auto' : 'smooth' });
  }
  function sync(nextSel, counts, o) {
    var prev = sel, how = o && o.animate === false ? 'instant' : 'press';
    sel = nextSel;
    ts.forEach(function (s) {
      var c = counts[s.cat] || 0, on = s.cat === sel;
      s.off = !c && !on;
      s.el.querySelector('.tb-n').textContent = c;
      s.el.querySelector('.tb-sr').textContent = ' ' + (c === 1 ? col.noun.one : col.noun.many) + (s.off ? ' — none in these years; choosing it releases the years' : '');
      s.el.setAttribute('aria-checked', String(on)); s.el.tabIndex = on ? 0 : -1;
      s.el.classList.toggle('is-off', s.off);
      s.w.refresh(on !== (s.cat === prev) || how === 'instant' ? how : 'hover');
    });
    if (prev !== sel) reveal(ts.find(function (s) { return s.cat === sel; }));
    kick();
  }
  // Each paper follows its own tab's size, drawn as it is first laid out and again whenever that changes: a face
  // landing late (a phone's tabs are as wide as their labels) or the column's width (the side's are as wide as it).
  var ro = new ResizeObserver(function (es) { es.forEach(function (e) { shape(ts[tabs.indexOf(e.target)]); }); });
  tabs.forEach(function (t) { ro.observe(t); });
  return {
    sync: sync,
    focusChosen: function () { ts.find(function (s) { return s.cat === sel; }).el.focus({ preventScroll: true }); },
    destroy: function () { offReduced(); loop.stop(); ro.disconnect(); ts.forEach(function (s) { s.w.destroy(); }); }
  };
}

/* ---- the controller ---- */
// opt: { readoutHost, state: { cat, ys } } — state is read and written in place.
export function Filter(col, opt) {
  var Y = col.years, st = opt.state, total = col.items.length;
  function inCat(p, cat) { return cat === 'all' || p.cats.indexOf(cat) >= 0; }
  function yearOk(p, ys) { if (!ys) return true; var i = Y.indexOf(p.year); return i >= ys.a && i < ys.b; }
  function count(cat, ys) { var n = 0; col.items.forEach(function (p) { if (inCat(p, cat) && yearOk(p, ys)) n++; }); return n; }
  function yearCounts(cat) { var c = Y.map(function () { return 0; }); col.items.forEach(function (p) { if (inCat(p, cat)) c[Y.indexOf(p.year)]++; }); return c; }
  function catCounts(ys) { var o = {}; col.cats.forEach(function (c) { o[c.id] = count(c.id, ys); }); return o; }
  function catText(cat) { var c = col.cats.find(function (x) { return x.id === cat; }); return cat === 'all' ? { zh: '全部', en: 'all', all: true } : { zh: c.zh, en: c.en }; }
  function yearsText(ys) { return ys ? { en: ys.b - ys.a === 1 ? Y[ys.a] : Y[ys.b - 1] + '–' + Y[ys.a] } : { zh: '所有年份', en: 'every year', all: true }; }
  function flagText(ys) { return ys ? yearsText(ys).en + ' · ' + count(st.cat, ys) + ' ' + col.noun.zh : ''; }

  var readout = Readout(opt.readoutHost, { onClear: clear, refocus: function () { tabs.focusChosen(); } });
  var tabs = Tabs(col, { onPick: pickCat, onHint: function (cat) { col.hint(cat ? function (p) { return inCat(p, cat) && yearOk(p, st.ys); } : null); } });
  var ledger = Ledger(col, { onChange: onYears, flagText: flagText, onHint: function (y) { col.hint(y ? function (p) { return p.year === y && inCat(p, st.cat); } : null); } });

  function update(o) {
    o = o || {};
    var n = count(st.cat, st.ys), quiet = st.ys && !count('all', st.ys);
    col.apply(function (p) { return inCat(p, st.cat) && yearOk(p, st.ys); }, { instant: o.instant, emptyNote: quiet ? 'Nothing at all in ' + yearsText(st.ys).en + ' · 那段时间一片空白' : '' });
    tabs.sync(st.cat, catCounts(st.ys), { animate: !o.instant });
    ledger.sync(st.ys, yearCounts(st.cat), { animate: !o.instant, recount: o.recount });
    readout.render({ cat: catText(st.cat), years: yearsText(st.ys), n: n, total: total, noun: col.noun, narrowed: st.cat !== 'all' || !!st.ys, was: o.was || null, live: o.live });
    col.host.setAttribute('data-count', n); col.host.setAttribute('data-cat', st.cat); col.host.setAttribute('data-years', st.ys ? yearsText(st.ys).en : 'all');
  }
  function pickCat(cat) {
    if (cat === st.cat) return;
    var was = null;
    if (st.ys && !count(cat, st.ys)) { was = { which: 'years', text: yearsText(st.ys) }; st.ys = null; }   // the years give way
    st.cat = cat;
    update({ recount: true, was: was });
  }
  function onYears(ys, o) {
    st.ys = ys;
    var was = null;
    if (o.commit && ys && st.cat !== 'all' && !count(st.cat, ys) && count('all', ys)) { was = { which: 'cat', text: catText(st.cat) }; st.cat = 'all'; }   // the tag gives way
    update({ was: was, recount: !!was, live: !o.commit });
  }
  function clear() { st.cat = 'all'; st.ys = null; update({ recount: true }); }
  update({ instant: true });
  return { destroy: function () { readout.destroy(); tabs.destroy(); ledger.destroy(); } };
}
