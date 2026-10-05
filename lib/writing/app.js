/* lib/writing/app.js — mounts the Writing page's bookcase and index into [data-mount=writing].
   Data: window.FY_POST_INDEX (content/posts-index.js), never posts.js.
   Layout comes from the host's width: ≥ 760 px = the bookcase with the index standing beside it (sticky),
   one plank per ~13 books; narrower = the phone: the index as one strip above a single swipe shelf (in the
   DOM as on screen, so Tab meets the index first). A change of layout builds a new instance, disposes the
   old one and keeps the filter: the state object lives here, not in the instance.
   The language sign (sign.js) hangs in a row of its own over the head of the case and comes just before it in the
   DOM (on the desk the first stop on the Tab path; on a phone the next after the index); the language itself lives
   in lang.js, so it outlives a re-layout too. A change retitles the spines and the dressed covers and moves no book.
   The bookcase is the filter's collection: { cats, years, items, noun, host, index, apply(pred, o), hint(pred) }.
   State for tests lives in data-* attributes on the host (data-count, data-cat, data-years, data-held,
   data-opening, data-ready, data-lang) and on the case (data-planks); nothing is global. */
import { posts, Case, TAG_ZH } from './case.js';
import { Reflow } from './reflow.js';
import { Pull } from './pull.js';
import { Filter } from './index.js';
import { lang } from './lang.js';
import { Sign } from './sign.js';

// Desk: spines ×1.62 wide on 280 px planks, titles ×1.45. Phone: one swipe strip, spines ×1.2.
var DESK = { k: 1.62, rowH: 280, P: 4400, eye: 430, head: 20, gapR: 14, top: 16, bottom: 18, padX: 14, sk: 1.45, coverW: 200, faceH: 420, overlap: 34 };
var PHONE = { strip: true, k: 1.2, rowH: 232, P: 3400, eye: 470, bottom: 40, sk: 1.12, coverW: 158, faceH: 300, overlap: 70, minTop: 58, tap: true, height: 346 };
var ROW_H = 30;          // ledger rows: the least that keeps a year's underline ≥ 10 px above the next year

function stickOf(host) { return parseFloat(getComputedStyle(host).getPropertyValue('--stick')) || 16; }

function mount(host, state) {
  var list = posts(window.FY_POST_INDEX), phone = host.clientWidth < 760;
  var counts = {}, years = [], ys = list.map(function (p) { return +p.year; });
  list.forEach(function (p) { p.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  var cats = [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).map(function (t) { return { id: t, en: t, zh: TAG_ZH[t] }; }));
  for (var y = Math.max.apply(null, ys); y >= Math.min.apply(null, ys); y--) years.push(String(y));

  host.classList.toggle('is-phone', phone);
  var index = '<aside class="wr-index" aria-label="Index"><div class="ix-head"></div><div class="ix-tabs"></div><div class="ix-years"></div></aside>';
  var shelf = '<div class="wr-sign"></div><div class="wr-case"></div>';
  host.innerHTML = '<div class="wr-body">' + (phone ? index + shelf : shelf + index) + '</div>';
  var sign = Sign(host.querySelector('.wr-sign'));
  var caseHost = host.querySelector('.wr-case'), cfg = Object.assign({}, phone ? PHONE : DESK, { host: host, lang: lang.get }), sh = null;
  cfg.stick = function () { return stickOf(host); };
  if (phone) caseHost.style.height = cfg.height + 'px';
  else cfg.rows = Case.rowsFor(list, cfg, caseHost.clientWidth);
  // The part of the case you can see: a book opens there, however tall the case is.
  cfg.visible = function () { var v = sh.view.getBoundingClientRect(); return { top: Math.max(0, stickOf(host) - v.top), bottom: Math.min(sh.view.clientHeight, window.innerHeight - v.top) }; };
  sh = Case(caseHost, list, cfg);
  if (phone) {
    var cue = document.createElement('div');
    cue.className = 'case-cue'; cue.setAttribute('aria-hidden', 'true'); cue.innerHTML = 'tap a spine ↓<span lang="zh">点一下书脊</span>'; caseHost.appendChild(cue);
    cfg.onConsider = function (i) { cue.classList.toggle('off', i >= 0); };
  }
  var pull = Pull(sh, cfg);
  var engine = Reflow({
    relayout: function (items) { sh.slots(items.map(function (it) { return it.ref; })); },
    paint: function (it) { sh.place(it.ref, it.ref.st); },
    show: function (it, mode) { sh.show(it.ref, mode); },
    pos: sh.pos,
    drop: function (it) { return Math.max(12, Math.min(50 * cfg.k, sh.clear(it.ref) - 6)); },
    moved: function (it) { return sh.moved(it.ref); },
    onFrame: function () { pull.bird.tick(); },
    onSettle: function () { sh.settle(); }
  });
  sh.books.forEach(function (b) { engine.add(b.post.key, b, true); });
  sh.layout(); pull.bird.home(); pull.roving();

  var items = list.map(function (p, i) { return { key: p.key, cats: p.tags, year: p.year, b: sh.books[i] }; });
  var byBook = new Map(items.map(function (it) { return [it.b, it]; }));
  var col = {
    cats: cats, years: years, items: items, host: host, noun: { one: 'essay', many: 'essays', zh: '篇' },
    index: { tabs: host.querySelector('.ix-tabs'), years: host.querySelector('.ix-years'), orient: phone ? 'strip' : 'side' },
    apply: function (pred, o) {
      o = o || {};
      var keep = items.filter(pred), want = new Set(keep.map(function (it) { return it.key; }));
      pull.rest();
      pull.bird.evict(function (i) { return !want.has(sh.books[i].post.key); });
      var res = engine.set(keep.map(function (it) { return it.key; }), { instant: o.instant });
      if (res.changed) {
        setTimeout(function () { pull.bird.jolt(); }, 280);
        if (sh.strip && sh.view.scrollLeft > 0) sh.view.scrollTo({ left: 0, behavior: Motion.reduced() ? 'auto' : 'smooth' });
        // The books gather at the top of the case: if that is scrolled away, the page goes back to it.
        var top = caseHost.getBoundingClientRect().top, stick = stickOf(host);
        if (!sh.strip && !o.instant && top < stick - 4) window.scrollTo({ top: window.scrollY + top - stick - 8, behavior: Motion.reduced() ? 'auto' : 'smooth' });
      }
      var note = o.emptyNote || 'Nothing on this stretch of shelf · 这一段书架是空的', parts = note.split(' · ');
      sh.showEmpty(keep.length ? '' : parts[0] + '<span lang="zh">' + (parts[1] || '') + '</span>');
      pull.roving();
      return keep;
    },
    hint: function (pred) { pull.hint(pred ? function (b) { return pred(byBook.get(b)); } : null); }
  };
  host.style.setProperty('--ny', years.length); host.style.setProperty('--rh', ROW_H + 'px');
  var filter = Filter(col, { readoutHost: host.querySelector('.ix-head'), state: state });
  function retitle(l) { sh.retitle(l); pull.retitle(l); host.setAttribute('data-lang', l); }
  var offLang = lang.on(retitle);
  host.setAttribute('data-lang', lang.get());
  host.setAttribute('data-ready', '');
  return {
    phone: phone, rows: cfg.rows || 1, list: list, sh: sh, pull: pull, engine: engine,
    destroy: function () { offLang(); sign.destroy(); sh.destroy(); pull.destroy(); engine.destroy(); filter.destroy(); }
  };
}

// The header's count and year range come from the data.
function header(list) {
  if (!list.length) return;
  var ys = list.map(function (p) { return p.date.slice(0, 4); }).sort(), range = ys[0] + '–' + ys[ys.length - 1];
  var st = document.querySelector('[data-essay-count]'); if (st) st.textContent = list.length + ' essays · ' + range;
  var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', "Fred Yang's bilingual essays and travel writing, " + range + '.');
}

function start(host) {
  var state = { cat: 'all', ys: null }, m = mount(host, state);
  // The eye travels with the reader down the case (case.js follow).
  var fr = 0;
  function follow() {
    fr = 0; if (m.phone) return;
    var c = host.querySelector('.wr-case').getBoundingClientRect();
    m.sh.follow(Math.max(0, stickOf(host) - c.top), -c.top, -c.top + window.innerHeight); m.pull.bird.tick();
  }
  window.addEventListener('scroll', function () { if (!fr) fr = requestAnimationFrame(follow); }, { passive: true });
  // Back from Reading through the bfcache: no book is left open in your hand.
  window.addEventListener('pageshow', function (e) { if (e.persisted && !(window.FYBook && FYBook.hold(m.pull.reset))) m.pull.reset(); });   // FYBook holds it until the move back has landed
  Motion.onReduced(function (on) { if (on) m.engine.snap(); });
  // Re-mount only when the layout itself changes (phone ↔ side, or another number of planks).
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (m.pull.busy) return;
      var phone = host.clientWidth < 760, rows = phone ? 1 : Case.rowsFor(m.list, DESK, host.querySelector('.wr-case').clientWidth);
      if (phone !== m.phone || rows !== m.rows) { m.destroy(); m = mount(host, state); return; }
      m.pull.rest(); m.engine.snap(); m.sh.layout(); m.pull.render(); m.pull.bird.home();
    }, 160);
  });
}

header(posts(window.FY_POST_INDEX));       // the header is static HTML: no need to wait for the render

// The host is inside <x-dc>, which support.js renders after React loads; FY.mount (site.js) waits for it.
FY.mount('[data-mount=writing]', start);
