/* design/2026-09-building · the live site's shared scripts, in one place so a rebase repoints them in one pass.
   A parser-blocking script in <head> that writes the live <script> tags into the parser stream, so they keep their
   production attributes and order (motion.js render-blocking; the pen and site glue deferred). data-extra on this
   tag adds page-specific live files (deferred), e.g. the Building project index. */
(function () {
  'use strict';
  var ROOT = '../../', SHARED = ROOT + 'lib/shared/';
  var me = document.currentScript, extra = (me && me.getAttribute('data-extra') || '').split(/\s+/).filter(Boolean);
  var list = [
    [SHARED + 'motion.js', 'defer blocking="render"'],
    [SHARED + 'pen.js', 'defer'],
    [SHARED + 'pen-tier.js', 'defer'],
    [SHARED + 'site.js', 'defer']
  ].concat(extra.map(function (f) { return [ROOT + f, 'defer']; }));
  list.forEach(function (s) { document.write('<script src="' + s[0] + '" ' + s[1] + '><\/script>'); });
  window.BD_ROOT = ROOT;
})();
