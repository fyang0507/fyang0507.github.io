/* design/2026-10-essays/switch-pair.js — two buttons, 中文 and English, wired as lib/writing/lang.js wires today's:
   aria-pressed, both on the Tab path, Enter / Space choose, and the pen through Tier.wire (hover = the coral line,
   the chosen language = the wheat band, keyboard focus = coral 「 」, no coral at rest). Each label is set in its own
   language. o: { cls, label (the group's name), sep (markup between the two), seed, over, focus, onPress(l, how) }.
   Returns { el, buttons, destroy }. */
var CHOICES = [['zh', '中文', 'Chinese'], ['en', 'English', 'English']];

export function Pair(host, lang, o) {
  var cls = o.cls;
  host.insertAdjacentHTML('beforeend', '<div class="' + cls + '" role="group" aria-label="' + (o.label || 'Shelf language · 书架语言') + '">' +
    CHOICES.map(function (c) {
      return '<button type="button" class="' + cls + '-b" data-lang="' + c[0] + '" aria-pressed="false"><span class="' + cls + '-t" lang="' + c[0] + '">' + c[1] + '</span>' +
        (c[0] === 'zh' ? '<span class="sr-only" lang="en"> · Chinese</span>' : '') + '</button>';
    }).join(o.sep || '') + '</div>');
  var el = host.lastElementChild;
  var bs = Array.prototype.map.call(el.querySelectorAll('.' + cls + '-b'), function (b) {
    var l = b.dataset.lang;
    b.addEventListener('click', function () { if (lang.get() !== l) { if (o.onPress) o.onPress(l, 'press'); else lang.set(l, 'press'); } });
    return { el: b, l: l, w: Tier.wire(b, { target: '.' + cls + '-t', seed: (o.seed || cls) + '|' + l, over: o.over == null ? 3 : o.over, chosen: function () { return lang.get() === l; }, focus: o.focus || { gap: 5, gy: 3 } }) };
  });
  function sync(l, how) { bs.forEach(function (s) { s.el.setAttribute('aria-pressed', String(s.l === l)); s.w.refresh(how); }); }
  sync(lang.get(), 'instant');
  var off = lang.on(sync);
  return {
    el: el, buttons: bs, sync: sync,
    destroy: function () { off(); bs.forEach(function (s) { s.w.destroy(); }); el.remove(); }
  };
}
