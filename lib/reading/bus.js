/* lib/reading/bus.js — the Reading page's one scroll/layout bus, shared by the hero (hero.js), the pencil margin
   (rail.js) and the footnotes (notes.js, pen-note.js, slip.js). The page is a real document scroller, so sticky,
   the fixed nav and overscroll behave natively. Every scroll value handed out is clamped to [0, max], so rubber-band
   overscroll (Safari reports scrollY < 0 or > max) reads exactly as the nearest end.
   The article is DC markup; start(fn) waits for it (FY.mount), pours the essay bodies in, then runs fn once. The
   language and theme buttons live in the static nav and are plain <html> class flips: nothing re-renders.
   Ported from design/2026-09-motion r3-08a-render.js:76–123. */
const html = document.documentElement;
const POSTS = window.FY_POSTS || [];
const WANT = new URLSearchParams(location.search).get('post');
const POST = POSTS.find((p) => p.id === WANT) || POSTS[0] || {};
const scrollFns = [], layoutFns = [], themeFns = [], landFns = [];
let raf = 0, lraf = 0, started = false;
const px = (name) => parseFloat(getComputedStyle(html).getPropertyValue(name)) || 0;

export const ctx = {
  post: POST, root: null, g: {},
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

/* ---- the essay: bodies poured into the DC markup, landmark and note ids already prefixed per language ---- */
function fill(root) {
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
  const zh = ctx.lang() === 'zh';
  document.title = ((zh ? POST.titleZh : POST.title) || POST.titleZh || POST.title || 'Reading') + ' · Fred Yang';
  const d = document.querySelector('meta[name="description"]');
  if (d) d.setAttribute('content', (zh ? POST.excerptZh : POST.excerpt) || POST.excerpt || POST.excerptZh || 'Bilingual essays by Fred Yang.');
}

/* ---- the two toggles in the static nav: class flips, the choice remembered per AGENTS (fy-lang, fy-theme) ---- */
function labels() {
  const zh = ctx.lang() === 'zh';
  document.querySelector('[data-act="lang"]').setAttribute('aria-label', zh ? 'Switch to English · 切换到英文' : 'Switch to Chinese · 切换到中文');
  document.querySelector('[data-act="theme"]').setAttribute('aria-pressed', String(ctx.dark()));   // a fixed label, "Dark mode", pressed or not
}
function toggleLang() {
  const en = !html.classList.contains('lang-en'), y = ctx.y(), frac = y > ctx.g.sL ? y / Math.max(1, ctx.max()) : 0;
  html.classList.toggle('lang-en', en); html.classList.toggle('lang-zh', !en);
  html.setAttribute('lang', en ? 'en' : 'zh');
  localStorage.setItem('fy-lang', en ? 'en' : 'zh');
  labels(); meta();
  if (!started) return;                            // before the article mounts it is only the class flip
  runLayout();
  if (frac) window.scrollTo(0, frac * ctx.max());
}
function toggleTheme() {
  const dark = !ctx.dark();
  html.classList.toggle('dark', dark); html.setAttribute('data-theme', dark ? 'dark' : 'light');
  localStorage.setItem('fy-theme', dark ? 'dark' : 'light');
  labels();
  if (started) themeFns.forEach((fn) => fn(dark));
}

export function start(init) {
  const go = (root) => {
    if (started) return;
    started = true; ctx.root = root;
    fill(root); init(ctx);
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(runScroll); }, { passive: true });
    addEventListener('resize', ctx.layout);
    addEventListener('pageshow', ctx.layout);
    if (document.fonts) document.fonts.ready.then(ctx.layout);
    Motion.onReduced(ctx.layout);
    runLayout();
    root.dataset.ready = '1';                     // test hook: the page is mounted
  };
  // the toggles live in the static nav, so they work from the first paint, before React has the article
  labels();
  document.querySelector('[data-act="lang"]').addEventListener('click', toggleLang);
  document.querySelector('[data-act="theme"]').addEventListener('click', toggleTheme);
  FY.mount('[data-mount="reading"]', go);
}
