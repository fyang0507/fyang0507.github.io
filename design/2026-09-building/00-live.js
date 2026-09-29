/* design/2026-09-building · the live site's shared scripts, in one place so a rebase repoints them in one pass.
   A parser-blocking script in <head> that writes the live <script> tags into the parser stream, so they keep their
   production attributes and order (motion.js render-blocking; the pen and site glue deferred). data-extra on this
   tag adds page-specific live files (deferred), e.g. the Building project index. */
(function () {
  'use strict';
  var ROOT = '../../';
  var me = document.currentScript, extra = (me && me.getAttribute('data-extra') || '').split(/\s+/).filter(Boolean);
  var list = [
    ['motion.js', 'defer blocking="render"'],
    ['pen.js', 'defer'],
    ['pen-tier.js', 'defer'],
    ['site.js', 'defer']
  ].concat(extra.map(function (f) { return [f, 'defer']; }));
  list.forEach(function (s) { document.write('<script src="' + ROOT + s[0] + '" ' + s[1] + '><\/script>'); });
  window.BD_ROOT = ROOT;
})();
