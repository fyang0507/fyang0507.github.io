/* lib/reading/bus.js — the Reading page's one scroll/layout bus, shared by the hero (hero.js), the pencil margin
   (rail.js) and the footnotes (notes.js, pen-note.js, slip.js). The page is a real document scroller, so sticky,
   the fixed nav and overscroll behave natively. Every scroll value handed out is clamped to [0, max], so rubber-band
   overscroll (Safari reports scrollY < 0 or > max) reads exactly as the nearest end.
   The article is a DC skeleton; start(fn) waits for it (FY.mount) and for the essay's body (essay.js), writes the
   essay in, then runs fn once. The language and theme buttons live in the static nav and are plain <html> class
   flips: nothing re-renders.
   Ported from design/2026-09-motion r3-08a-render.js:76–123. */
import { entry, body } from './essay.js';

const html = document.documentElement;
const LIST = window.FY_POST_INDEX || [];           // every essay, newest first: the neighbours come from here
let POST = null;                                    // the index entry and its body, once the body is in
const scrollFns = [], layoutFns = [], themeFns = [], landFns = [];
let raf = 0, lraf = 0, started = false;
const px = (name) => parseFloat(getComputedStyle(html).getPropertyValue(name)) || 0;

export const ctx = {
  post: null, root: null, g: {},
  lang: () => (html.classList.contains('lang-en') ? 'en' : 'zh'),
  dark: () => html.classList.contains('dark'),
  body: () => ctx.root.querySelector('.post-body.' + ctx.lang()),
  landmarks: () => POST[ctx.lang() === 'en' ? 'landmarksEn' : 'landmarksZh'] || { kind: 'minutes', marks: [] },
  marks: () => ctx.landmarks().marks,
  kind: () => ctx.landmarks().kind,
  max: () => Math.max(0, html.scrollHeight - innerHeight),
  y: () => Math.min(ctx.max(), Math.max(0, scrollY)),
  top: (el) => el.getBoundingClientRect().top + scrollY,
  onScroll: (fn) => scrollFns.push(fn),
  onLayout: (fn) => layoutFns.push(fn),
  onTheme: (fn) => themeFns.push(fn),
  onLand: (fn) => landFns.push(fn),                // the hero's landing hands the pen to the margin
  land: (on) => landFns.forEach((fn) => fn(on)),
  layout: () => { cancelAnimationFrame(lraf); lraf = requestAnimationFrame(runLayout); },
  scrollTo: (y) => window.scrollTo({ top: y, behavior: Motion.reduced() ? 'auto' : 'smooth' }),
  // an in-page jump: scroll there, and take the keyboard along so the next Tab continues from the target
  jump: (el, y) => {
    ctx.scrollTo(y);
    if (!el.matches('a[href], button, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
};

function runScroll() {
  raf = 0;
  const y = ctx.y();
  for (let i = 0; i < scrollFns.length; i++) scrollFns[i](y);
}
// The one geometry plan: hero height, body top pad and nav heights come from the same numbers (reading.css :root).
function runLayout() {
  const g = ctx.g, bodyCol = ctx.root.querySelector('.body-col');
  g.vw = html.clientWidth; g.vh = innerHeight;
  g.n0 = px('--n0'); g.n1 = px('--n1'); g.pad = px('--pad'); g.z = px('--z'); g.cell = px('--cell');
  g.narrow = g.vw <= 640; g.rm = Motion.reduced();
  g.b0 = Math.round(ctx.top(bodyCol));             // hero band = everything above the body (nav, tabs, intro, cover tail)
  g.sL = Math.max(1, g.b0 - g.pad);                // landing scroll: the paper reaches y = 0, the body top sits at pad
  html.style.setProperty('--b0', g.b0 + 'px');
  html.classList.toggle('narrow', g.narrow);
  for (let i = 0; i < layoutFns.length; i++) layoutFns[i](ctx);
  runScroll();
}

/* ---- the essay, written into the DC skeleton: its text, both bodies (landmark and note ids already prefixed per
   language) and the neighbours. Nothing here is a template value, so the page is right whenever React renders. ---- */
function text(root, f, v) { root.querySelector('[data-f="' + f + '"]').textContent = v; }
function neighbour(p, cls, en, zh) {
  if (!p) return '';
  const a = document.createElement('a');
  a.href = 'Reading.dc.html?post=' + encodeURIComponent(p.id); if (cls) a.className = cls;
  a.innerHTML = '<div class="lab"><span class="en"></span><span class="zh"></span></div><div class="t"><span class="en"></span><span class="zh"></span></div>';
  const s = a.querySelectorAll('span');
  s[0].textContent = en; s[1].textContent = zh; s[2].textContent = p.title || p.titleZh || ''; s[3].textContent = p.titleZh || p.title || '';
  return a;
}
function fill(root) {
  const d = new Date(POST.date + 'T00:00:00'), ok = !Number.isNaN(d.getTime()), min = POST.readingMin || 1;
  text(root, 'title', POST.title || POST.titleZh || ''); text(root, 'titleZh', POST.titleZh || POST.title || '');
  text(root, 'tagsEn', (POST.tags || []).join(' · ') || 'essay'); text(root, 'tagsZh', (POST.tagsZh || []).join(' · ') || '文章');
  root.querySelector('time').setAttribute('datetime', POST.date || '');
  text(root, 'dateEn', ok ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');
  text(root, 'dateZh', ok ? d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '');
  text(root, 'minEn', min + ' min read'); text(root, 'minZh', '约 ' + min + ' 分钟');
  const eb = root.querySelector('.eyebrow');
  if (POST.subtitle || POST.subtitleZh) { text(root, 'subtitle', POST.subtitle || POST.subtitleZh); text(root, 'subtitleZh', POST.subtitleZh || POST.subtitle); }
  else eb.remove();
  const order = LIST.slice().reverse(), i = order.findIndex((p) => p.id === POST.id), pn = root.querySelector('.pn');
  [neighbour(i > 0 && order[i - 1], '', '← previous', '← 上一篇'), neighbour(i >= 0 && order[i + 1], 'next', 'next →', '下一篇 →')].forEach((a) => { if (a) pn.appendChild(a); });
  root.querySelector('.post-body.zh').innerHTML = POST.htmlZh || '';
  root.querySelector('.post-body.en').innerHTML = POST.htmlEn || '';
  html.classList.toggle('no-cover', !POST.cover);
  const zh = POST.titleZh || POST.title || '', en = POST.title || zh;
  document.querySelector('.nav-title-t').innerHTML = '<span class="en"></span><span class="zh"></span>';
  document.querySelector('.nav-title-t .en').textContent = en;
  document.querySelector('.nav-title-t .zh').textContent = zh;
  meta();
}
function meta() {
  if (!POST) return;
  const zh = ctx.lang() === 'zh';
  document.title = ((zh ? POST.titleZh : POST.title) || POST.titleZh || POST.title || 'Reading') + ' · Fred Yang';
  const d = document.querySelector('meta[name="description"]');
  if (d) d.setAttribute('content', (zh ? POST.excerptZh : POST.excerpt) || POST.excerpt || POST.excerptZh || 'Bilingual essays by Fred Yang.');
}

/* ---- the two toggles in the static nav: class flips, the choice remembered per AGENTS (fy-lang, fy-theme). The
   language is set in the address too, in place (post, the other parameters and the hash kept, no history entry):
   ?lang= wins on load, so a reload or a shared link keeps the language on screen. ---- */
function labels() {
  const zh = ctx.lang() === 'zh';
  document.querySelector('[data-act="lang"]').setAttribute('aria-label', zh ? 'Switch to English · 切换到英文' : 'Switch to Chinese · 切换到中文');
  document.querySelector('[data-act="theme"]').setAttribute('aria-pressed', String(ctx.dark()));   // a fixed label, "Dark mode", pressed or not
}
function toggleLang() {
  const en = !html.classList.contains('lang-en'), l = en ? 'en' : 'zh', y = ctx.y(), frac = y > ctx.g.sL ? y / Math.max(1, ctx.max()) : 0;
  html.classList.toggle('lang-en', en); html.classList.toggle('lang-zh', !en);
  html.setAttribute('lang', l);
  try { localStorage.setItem('fy-lang', l); } catch (e) { /* storage off: the address still carries the choice */ }
  const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(history.state, '', u);
  labels(); meta();
  if (!started) return;                            // before the article mounts it is only the class flip
  runLayout();
  if (frac) window.scrollTo(0, frac * ctx.max());
}
function toggleTheme() {
  const dark = !ctx.dark();
  html.classList.toggle('dark', dark); html.setAttribute('data-theme', dark ? 'dark' : 'light');
  try { localStorage.setItem('fy-theme', dark ? 'dark' : 'light'); } catch (e) { /* storage off: this visit only */ }
  labels();
  if (started) themeFns.forEach((fn) => fn(dark));
}

export function start(init) {
  const go = (root, b) => {
    if (started) return;
    started = true; ctx.root = root; POST = ctx.post = Object.assign({}, entry, b);
    fill(root); root.dataset.ready = '1';        // written in: lay it out (and a test hook: the page is mounted)
    init(ctx);
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(runScroll); }, { passive: true });
    addEventListener('resize', ctx.layout);
    addEventListener('pageshow', ctx.layout);
    if (document.fonts) document.fonts.ready.then(ctx.layout);
    Motion.onReduced(ctx.layout);
    runLayout();
  };
  // the toggles live in the static nav, so they work from the first paint, before React has the article
  labels();
  document.querySelector('[data-act="lang"]').addEventListener('click', toggleLang);
  document.querySelector('[data-act="theme"]').addEventListener('click', toggleTheme);
  const mounted = new Promise((resolve) => FY.mount('[data-mount="reading"]', resolve));
  // a body that cannot load leaves the essay's index entry: its title, cover and neighbours still show
  Promise.all([mounted, body().catch((e) => { console.error(e); return {}; })]).then(([root, b]) => go(root, b));
}
