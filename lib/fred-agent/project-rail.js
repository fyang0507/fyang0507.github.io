/* Fred Agent · Reading's pencil margin (lib/reading/rail.js, rail.css) as a long chapter's table of contents: the
   eleven principles, the five components. This builds the context rail.js documents, from the page:
     root      .fa-read, the text column, holding the .rail-col (at its top: g.b0) and the article (.fa-prose)
     marks     every section.fa-pr[id]: its .pr-no is the label, its .pr-t the title the peek slip and the label's
               name read (Components' closing section is prose after the five, not a landmark)
     strip,    .pj-count, the line under the chapter tabs (dossier.css): the ticks and the ink lie on the sheet's edge
     count     above it, the "05 / 11" counter at its right; g.vw is its width, not the window's
     g.n1      what sticks at the top: the tab strip where the rail can't stand in the margin, else nothing
   There is no landing to wait for: the rail arrives once the page has laid out, the pen drawing it down the margin, or
   is simply there when the page opens scrolled (a section link: g.sL is 1 until then, 0 after). A label's 「 」 is
   main.js's FocusMark. The rail's name is the chapter's, its Chinese marked lang="zh" (aria-labelledby). */
import { initRail } from '../reading/rail.js';

FY.styled(() => {
  const html = document.documentElement, root = document.querySelector('.fa-read'), prose = root.querySelector('.fa-prose');
  const host = document.querySelector('.pj-count'), tabs = document.querySelector('.pj-tabs');
  const scrollFns = [], layoutFns = [], landFns = [];
  let landed = false, raf = 0, lraf = 0;
  const ctx = {
    root, strip: host, count: host, g: {},
    post: { id: location.pathname.split('/').pop() || 'index', readingMin: 0 },
    lang: () => 'en',
    body: () => prose,
    marks: () => [...prose.querySelectorAll('.fa-pr[id]')].map((el) => ({ id: el.id, kind: 'sec', label: el.querySelector('.pr-no').textContent.trim(), title: el.querySelector('.pr-t').textContent.trim(), peek: el.querySelector('.pr-t').textContent.trim() })),
    kind: () => 'sections',
    max: () => Math.max(0, html.scrollHeight - innerHeight),
    y: () => Math.min(ctx.max(), Math.max(0, scrollY)),
    top: (el) => el.getBoundingClientRect().top + scrollY,
    scrollTo: (y) => scrollTo({ top: y, behavior: Motion.reduced() ? 'auto' : 'smooth' }),
    // an in-page jump takes the keyboard along, so the next Tab continues from the section
    jump: (el, y) => {
      ctx.scrollTo(y);
      if (!el.matches('a[href], button, [tabindex]')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    },
    onScroll: (fn) => scrollFns.push(fn),
    onLayout: (fn) => layoutFns.push(fn),
    onLand: (fn) => landFns.push(fn)
  };
  const runScroll = () => { raf = 0; const y = ctx.y(); scrollFns.forEach((fn) => fn(y)); };
  function runLayout() {
    const g = ctx.g, strip = prose.getBoundingClientRect().left < 180;   // rail.js's own test for the margin
    g.vw = host.clientWidth || html.clientWidth; g.vh = innerHeight;
    g.n1 = strip ? tabs.offsetHeight : 0; g.rm = Motion.reduced();
    // the column's top, where the .rail-col stands: the column itself, which strip mode never hides (a hidden .rail-col
    // reads its top as 0, so the strip's origin would be wherever the page was scrolled when it last laid out)
    g.b0 = Math.round(ctx.top(root));
    g.sL = landed ? 0 : 1;
    layoutFns.forEach((fn) => fn(ctx));
    runScroll();
  }
  initRail(ctx);
  // the rail's name, in both languages, each marked (an aria-label can't mark part of itself)
  const nav = root.querySelector('.rail'), name = document.createElement('span');
  name.id = 'rail-name'; name.hidden = true;
  name.innerHTML = 'Where you are in this chapter · <span lang="zh">读到哪儿</span>';
  nav.prepend(name); nav.removeAttribute('aria-label'); nav.setAttribute('aria-labelledby', 'rail-name');
  runLayout();
  landed = true; ctx.g.sL = 0;
  landFns.forEach((fn) => fn(true));
  const relayout = () => { cancelAnimationFrame(lraf); lraf = requestAnimationFrame(runLayout); };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(runScroll); }, { passive: true });
  addEventListener('resize', relayout);
  addEventListener('pageshow', relayout);
  document.fonts.ready.then(relayout);
  Motion.onReduced(relayout);
});
