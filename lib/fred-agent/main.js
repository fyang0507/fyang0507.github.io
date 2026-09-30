/* Fred Agent · every chapter's page code (building/fred-agent/*.html). A deferred module after the pen, site.js and
   the project index; it measures only once the page's stylesheets are in (FY.styled). A chapter's own parts load as
   their own modules: the map (map.js), the reading rail (project-rail.js), Demos' evidence (evidence.js).
   · The pen's states. The fore-edge tabs: the coral line under a tab's label on hover, 「 」 round the label on focus,
     and the current chapter chosen, the wheat band, whose edge pen.css darkens on kraft. The way back, the page's
     links and the footer: the line under their words, 「 」 round the whole. Anything else that takes focus (the
     rail's labels, the evidence controls, a scrolling figure) gets 「 」 on :focus-visible only, as on Reading.
   · The board's card, clipped to the sheet's corner once the page has painted (lib/building/cover.js). */
import { cover } from '../building/cover.js';

function focusMarks() {
  let mark = null, el = null;
  function drop() {
    if (!mark) return;
    const m = mark;
    mark = el = null;
    m.set(false); setTimeout(() => m.destroy(), 160);
  }
  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (!t.matches || !t.matches('a[href], button, [tabindex="0"]') || t.closest('#site-nav') || t.hasAttribute('data-pen-tier')) return;
    let visible = false;
    try { visible = t.matches(':focus-visible'); } catch (x) { visible = false; }
    if (!visible) return;
    drop();
    mark = new FocusMark(t, t.querySelector('.rail-lab-t') || t, {});   // a rail label: around its text
    mark.set(true); el = t;
  });
  document.addEventListener('focusout', (e) => { if (e.target === el) drop(); });
}

FY.styled(() => {
  document.querySelectorAll('.pj-tabs .dos-tab').forEach((a) => Tier.wire(a, { target: '.pen-t', chosen: a.getAttribute('aria-current') === 'page', focus: { gap: 4, gy: 3 } }));
  document.querySelectorAll('.pj a[href]').forEach((a) => {
    const t = a.querySelector('.pen-t');
    if (t && !a.closest('.pj-tabs')) Tier.wire(a, { target: t, focus: { on: 'host', gap: 4, gy: 3 } });
  });
  focusMarks();
  const host = document.querySelector('.pj-cover');
  requestAnimationFrame(() => setTimeout(() => cover(host, host.dataset.card)));
});
