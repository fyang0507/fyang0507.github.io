/* lib/reading/essay.js — the essay this page shows. Loaded straight after content/posts-index.js and ahead of every
   other deferred script, so it runs as soon as the page has parsed.
   · entry: its posts-index entry (title, date, cover, tags, reading time). It is the ?post= id when the index knows
     it, else the newest essay.
   · plate(): the cover plate, built here at once from the index, so the cover (the page's largest paint) waits for
     neither the essay body nor React. hero.js prints paper over it.
   · body(): content/bodies/<id>.js (both bodies, landmarks, subtitle, excerpt) as window.FY_BODY. The inline head
     script has usually injected it already, straight from ?post=, at high priority; a missing or unknown id loads
     the newest essay's body from here instead. */
const INDEX = window.FY_POST_INDEX || [];
const WANT = new URLSearchParams(location.search).get('post');
export const entry = INDEX.find((p) => p.id === WANT) || INDEX[0] || null;

let made;
export function plate() {
  if (made !== undefined) return made;
  made = null;
  if (!entry || !entry.cover) return made;
  const art = '<div class="plate-art"><img class="plate-img" alt="" decoding="async" fetchpriority="high" sizes="100vw"></div>';
  const el = document.createElement('div');
  el.className = 'plate'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = art + '<canvas class="plate-cv"></canvas>';
  const navPlate = document.querySelector('.rnav .nav-plate');
  navPlate.innerHTML = '<div class="nav-plate-in">' + art + '<canvas class="plate-cv"></canvas></div>';
  [el, navPlate].forEach((p) => { const img = p.querySelector('img'); img.srcset = entry.coverSrcset || ''; img.src = entry.cover; });
  document.body.insertBefore(el, document.body.firstChild);
  made = { plate: el, img: el.querySelector('img'), cv: el.querySelector('canvas'), ncv: navPlate.querySelector('canvas') };
  return made;
}
plate();

export function body() {
  return new Promise((resolve, reject) => {
    const id = entry && entry.id, done = () => (window.FY_BODY && FY_BODY.id === id);
    if (!id) { reject(new Error('no essays')); return; }
    if (done()) { resolve(FY_BODY); return; }
    let s = document.querySelector('script[data-fy-body="' + id + '"]');
    if (s && s.dataset.state) { if (done()) resolve(FY_BODY); else reject(new Error('body ' + id)); return; }
    if (!s) {
      s = document.createElement('script');
      s.src = './content/bodies/' + id + '.js'; s.dataset.fyBody = id; s.fetchPriority = 'high';
      document.head.appendChild(s);
    }
    s.addEventListener('load', () => (done() ? resolve(FY_BODY) : reject(new Error('body ' + id))));
    s.addEventListener('error', () => reject(new Error('body ' + id)));
  });
}
