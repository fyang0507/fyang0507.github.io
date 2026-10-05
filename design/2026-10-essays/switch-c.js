/* design/2026-10-essays/switch-c.js — candidate C, 拨片: today's place at the head of the index, made a control you
   can't miss. A recessed paper slot, ink-edged, with two equal halves, 中文 and English, each in the face the spines
   set it in; a paper slide sits under the chosen half and moves on the physics clock (the index tabs' spring: one
   small overshoot) while the pen bands the word (hand's clock). The label says what it changes: 书架语言 · shelf
   reads in. Desk: the row over the index column, as today. Phone: the first row of the index strip, as today. */
import { Pair } from './switch-pair.js';

function Slider(body, lang) {
  var host = body.parentNode, phone = host.classList.contains('is-phone');
  var el = document.createElement('div');
  el.className = 'swc';
  el.innerHTML = '<div class="swc-label" aria-hidden="true"><span lang="zh">书架语言</span><span>shelf reads in</span></div><div class="swc-slot"><i class="swc-thumb" aria-hidden="true"></i></div>';
  var index = body.querySelector('.wr-index');
  if (phone) body.insertBefore(el, index); else body.appendChild(el);
  var slot = el.querySelector('.swc-slot'), thumb = el.querySelector('.swc-thumb');
  var pair = Pair(slot, lang, { cls: 'swc-sw', seed: 'swc', over: 3, focus: { gap: 6, gy: 4 } });
  var sp = new Motion.Spring({ k: 330, c: 20 });
  function x(l) { var b = pair.buttons.find(function (s) { return s.l === l; }).el; return b.offsetLeft; }
  function paint() { thumb.style.transform = 'translateX(' + sp.x.toFixed(2) + 'px)'; }
  var loop = new Motion.Loop(function (dt) { sp.step(dt); var m = !sp.rest(0.05); if (!m) sp.snap(); paint(); return m; });
  function place(l, how) {
    sp.to = x(l);
    if (how === 'instant' || Motion.reduced()) { sp.snap(); paint(); return; }
    loop.kick();
  }
  var off = lang.on(place), offRm = Motion.onReduced(function (on) { if (on) place(lang.get(), 'instant'); });
  // The halves are as wide as the slot allows: a face landing late or a new width moves the slide with them.
  var ro = new ResizeObserver(function () { thumb.style.width = pair.buttons[0].el.offsetWidth + 'px'; place(lang.get(), 'instant'); });
  ro.observe(slot);
  place(lang.get(), 'instant');
  return { destroy: function () { off(); offRm(); loop.stop(); ro.disconnect(); pair.destroy(); el.remove(); } };
}

export function start(lang) {
  var s = null;
  // app.js builds .wr-body afresh on every mount (a layout change across 760 px): build the slider again each time.
  FY.mount('.wr-body', function (body) { if (s) s.destroy(); s = Slider(body, lang); });
}
