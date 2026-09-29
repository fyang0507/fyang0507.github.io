/* lib/reading/states.js — the pen's states on Reading's own controls (the site nav marks itself, in site.js).
   The back link and the two toggles use the shared tier rule: hover draws the coral line (never on touch), and
   focus-visible draws the coral 「 」. Every other link and button on the page (refs, rail labels, previous/next,
   body and reference links, the footer, the phone slip) gets the same 「 」 on focus-visible: one FocusMark made
   for the focused element and dropped on blur. On a ref it stands a little wider, clear of the gesture's loop. */
export function initStates() {
  const nav = document.querySelector('.rnav');
  Tier.wire(nav.querySelector('.back'), { target: nav.querySelector('.back-t') });
  nav.querySelectorAll('.btn').forEach((b) => Tier.wire(b, { focus: { on: 'host' } }));

  let mark = null, el = null;
  function drop() {
    if (!mark) return;
    const m = mark, t = el; mark = el = null;
    m.set(false); setTimeout(() => m.destroy(), 160);
    t.removeAttribute('data-pen-focus');
  }
  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (!t.matches || !t.matches('a[href], button') || t.closest('#site-nav') || t.hasAttribute('data-pen-tier')) return;
    let visible = false;
    try { visible = t.matches(':focus-visible'); } catch (x) { visible = false; }
    if (!visible) return;
    drop();
    t.setAttribute('data-pen-focus', '');
    mark = new FocusMark(t, t.querySelector('.rail-lab-t') || t, t.matches('.fnref a') ? { gap: 7, gy: 5 } : {});   // a rail label: around its text
    mark.set(true); el = t;
  });
  document.addEventListener('focusout', (e) => { if (e.target === el) drop(); });
}
