/* r2-06-flick.js — flick vs click. A mouse or pen crossing a rope or a print fast enough is only
   recorded; the swing fires 50 ms later, and only if the pointer is still travelling by then.
   Reaching for a photo brakes before it arrives (that is what aiming is), so the print you are
   about to click never starts swinging under the cursor; a pass straight through keeps its speed
   and swings everything it brushed. A press cancels anything pending. Touch never flicks (no hover);
   on touch the rope answers the swipe instead. */
(function () {
  var WAIT = 50, CROSS = 300;

  function Flick(stage, lines, blocked) {
    var self = this, last = null, pend = [], speed = 0, quiet = 0;
    this.feed = function (x, y, t) {
      if (blocked()) { last = null; pend.length = 0; return; }
      if (last && t > last.t && t - last.t < 100) {
        var dt = (t - last.t) / 1000, vx = (x - last.x) / dt, vy = (y - last.y) / dt;
        speed = Math.hypot(vx, vy);
        for (var i = pend.length - 1; i >= 0; i--) {
          var p = pend[i];
          if (t - p.t < WAIT) continue;
          if (speed >= p.exit) p.fire();
          pend.splice(i, 1);
        }
        if (speed >= CROSS) lines().forEach(function (l) {
          var r = l.host.getBoundingClientRect();
          if (y < r.top - 20 && last.y < r.top - 20 || y > r.bottom && last.y > r.bottom) return;
          l.crossings(last.x - r.left, last.y - r.top, x - r.left, y - r.top, vx, vy).forEach(function (c) { c.t = t; pend.push(c); });
        });
        // If the pointer goes quiet (it left the window, or stopped dead), judge by the last speed we saw:
        // a flick is still fast on its final event, an approach has already braked.
        clearTimeout(quiet);
        if (pend.length) quiet = setTimeout(function () {
          pend.forEach(function (p) { if (speed >= p.exit) p.fire(); }); pend.length = 0;
        }, WAIT + 30);
      }
      last = { x: x, y: y, t: t };
    };
    this.cancel = function () { pend.length = 0; clearTimeout(quiet); };
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      if (e.buttons) { pend.length = 0; last = null; return; }
      self.feed(e.clientX, e.clientY, e.timeStamp);
    });
    stage.addEventListener('pointerdown', function () { self.cancel(); });
    // Leaving the stage at speed is the clearest flick of all.
    stage.addEventListener('pointerleave', function () {
      if (speed >= 220) pend.forEach(function (p) { p.fire(); });
      pend.length = 0; last = null; speed = 0;
    });
  }

  G06.Flick = Flick;
})();
