/* cap/cursor.js — the recording's hand (never part of the site): a small ink arrow at the pen's weight that follows
   the real mouse, and on each press the site's three impact ticks around its tip, held for a few frames. It runs on
   the virtual clock like everything else (it is injected after vclock.js). */
(() => {
  if (window.__filmCursor) return; window.__filmCursor = 1;
  const NS = 'http://www.w3.org/2000/svg';
  let svg, arrow, ticks, x = -50, y = -50, downAt = -1e9;
  function build() {
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('style', 'position:fixed;left:0;top:0;width:44px;height:44px;overflow:visible;pointer-events:none;z-index:2147483647;transform:translate(-50px,-50px)');
    arrow = document.createElementNS(NS, 'path');
    arrow.setAttribute('d', 'M1.5 1.5 L1.8 17.2 L6.2 12.9 L9.4 19.6 L12.1 18.3 L9 11.8 L15.2 11.5 Z');
    arrow.setAttribute('style', 'fill:#FEFAEE;stroke:#33302B;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round');
    ticks = document.createElementNS(NS, 'path');
    ticks.setAttribute('d', 'M-3.5 -1.5 L-8 -3.2 M0.5 -4 L0.2 -8.8 M4.2 -2.6 L7.8 -6.2');
    ticks.setAttribute('style', 'fill:none;stroke:#33302B;stroke-width:1.6;stroke-linecap:round;opacity:0');
    svg.appendChild(ticks); svg.appendChild(arrow);
    (document.body || document.documentElement).appendChild(svg);
  }
  function place() { if (!svg || !svg.isConnected) build(); svg.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; place(); }, true);
  addEventListener('pointerdown', (e) => { x = e.clientX; y = e.clientY; downAt = performance.now(); place(); }, true);
  const tick = () => { if (ticks) ticks.style.opacity = performance.now() - downAt < 180 ? '1' : '0'; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  window.__filmCursorAt = (nx, ny) => { x = nx; y = ny; place(); };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', place); else place();
})();
