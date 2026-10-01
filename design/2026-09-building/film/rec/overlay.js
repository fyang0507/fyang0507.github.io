// Recording-only pointer overlay, injected by rec.mjs with addInitScript (never shipped with the site).
// Desk: an ink arrow follows the mouse and dips slightly while pressed. Phone: an ink dot sits under
// each touch. The last mouse position survives navigations through sessionStorage, so the arrow
// is already in place when the next document paints.
(() => {
  if (window.top !== window) return;
  const KEY = '__rec_ptr';
  let cur = null, dot = null;
  const host = () => document.documentElement;
  const base = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;will-change:transform;';
  function arrow() {
    if (cur && cur.isConnected) return cur;
    if (!host()) return null;
    cur = document.createElement('div');
    cur.setAttribute('aria-hidden', 'true');
    cur.style.cssText = base + 'width:24px;height:30px;';
    cur.innerHTML = '<svg width="24" height="30" viewBox="0 0 24 30" style="display:block;overflow:visible;transform-origin:2px 2px;transition:scale .09s ease-out"><path d="M2.2 2 L2.2 23.4 L7.9 18.1 L11.6 26.8 L15.4 25.2 L11.8 16.8 L19.6 16.8 Z" fill="#33302B" stroke="#FBF6EC" stroke-width="1.7" stroke-linejoin="round"/></svg>';
    host().appendChild(cur);
    return cur;
  }
  function place(x, y) { const c = arrow(); if (c) c.style.transform = `translate(${x - 2}px,${y - 2}px)`; }
  function touch(t) {
    if (!dot || !dot.isConnected) {
      if (!host()) return;
      dot = document.createElement('div');
      dot.setAttribute('aria-hidden', 'true');
      dot.style.cssText = base + 'width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(51,48,43,.22);box-shadow:inset 0 0 0 1.6px rgba(51,48,43,.7);opacity:0;transition:opacity .12s;';
      host().appendChild(dot);
    }
    if (!t) { dot.style.opacity = '0'; return; }
    dot.style.transform = `translate(${t.clientX}px,${t.clientY}px)`;
    dot.style.opacity = '1';
  }
  addEventListener('mousemove', (e) => {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    place(e.clientX, e.clientY);
    try { sessionStorage.setItem(KEY, e.clientX + ',' + e.clientY); } catch {}
  }, { capture: true, passive: true });
  // the press dips the arrow itself (the svg), never the positioned wrapper, so it scales about its own tip
  addEventListener('mousedown', () => { if (cur) cur.firstChild.style.scale = '.86'; }, true);
  addEventListener('mouseup', () => { if (cur) cur.firstChild.style.scale = '1'; }, true);
  for (const type of ['touchstart', 'touchmove']) addEventListener(type, (e) => touch(e.touches[0]), { capture: true, passive: true });
  for (const type of ['touchend', 'touchcancel']) addEventListener(type, (e) => touch(e.touches[0]), { capture: true, passive: true });
  function restore() {
    if (matchMedia('(pointer: coarse)').matches) return;
    let v = null; try { v = sessionStorage.getItem(KEY); } catch {}
    if (v) { const [x, y] = v.split(',').map(Number); place(x, y); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore); else restore();
})();
