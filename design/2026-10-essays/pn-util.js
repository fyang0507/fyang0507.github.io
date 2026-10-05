/* design/2026-10-essays/pn-util.js — what the three candidates share (pn-a.js, pn-b.js, pn-c.js): text in both
   languages, an essay's link, Writing's facts about its book, and the pen's marks, kept so a rebuild takes them off. */
const LIST = window.FY_POST_INDEX || [];

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// one string in each language; the page's own rule shows one (html.lang-zh .en, html.lang-en .zh {display:none})
export const bi = (en, zh) => '<span class="en">' + esc(en) + '</span><span class="zh" lang="zh">' + esc(zh) + '</span>';
export const href = (p) => 'Reading.dc.html?post=' + encodeURIComponent(p.id);

/* Writing's facts for a book (lib/writing/case.js posts(), aside()): its place in the newest-first order gives its
   spine's width, height and tone, so a neighbour here is the same book as on the shelf. */
const TAG_ZH = { 'stories we live': '我们生活的故事', 'everyday chronicles': '日常记趣', 'travel log': '游记', 'commentary': '杂文', 'poem': '诗' };
export function book(p) {
  const i = LIST.findIndex((q) => q.id === p.id), id = i + 1;
  const en = p.title || p.titleZh || '', zh = p.titleZh || p.title || '';
  const sm = en.match(/Stories We Live\s+(\d+)/i) || zh.match(/故事\s*0?(\d+)/), series = sm ? Number(sm[1]) : null;
  const tags = [];
  (p.tags || []).concat(p.tagsZh || []).forEach((t) => {
    const k = Object.keys(TAG_ZH).find((n) => t === n || t === TAG_ZH[n]);
    if (k && tags.indexOf(k) < 0) tags.push(k);
  });
  const min = p.readingMin || 1;
  const aside = series ? ['no.' + series + ' of the series', '系列第' + series + '篇'] : min >= 15 ? ['a long one', '长文'] : min <= 4 ? ['a quick one', '短篇'] : ["one coffee's worth", '一杯咖啡'];
  return {
    p, id, en, zh, series, min, aside, tag: tags[0] || '', tagZh: TAG_ZH[tags[0]] || '',
    ym: (p.date || '').slice(0, 7).replace('-', '·'), ymd: (p.date || '').replace(/-/g, '·'),
    w: series ? 30 : 22 + (id % 4) * 4, h: (series ? 96 : 58 + ((id * 29) % 38)) / 100, tone: series ? 's' : String(id % 4)
  };
}
export const minutes = (b) => bi('~' + b.min + ' min', '约 ' + b.min + ' 分钟');

/* The pen on a link: hover draws the coral underline under target, keyboard focus the coral 「 」 (Tier.wire). Every
   mark a build makes is kept, so the next build takes them all off first. */
let marks = [];
export function pen(host, target, opt) { const w = Tier.wire(host, Object.assign({ target }, opt || {})); marks.push(w); return w; }
export function still(host, target) { const m = new TierMark(host, target); m.to(2, 'instant'); marks.push(m); return m; }   // current: the wheat band at rest
export function keep(fn) { marks.push({ destroy: fn }); }

/* Tier.wire's rule (pen-tier.js) for a link whose words sit on a paper that moves (B's tilted board): the marks are
   drawn inside that paper (host, a positioned descendant of the link: the line on its paper, under its words, turning
   and lifting with it, as Writing's obi does), and the link carries the listeners. Hover → notice (never on touch),
   press → choose, held until its gesture lands; :focus-visible → 「 」. */
export function penIn(link, host, target) {
  const mark = new TierMark(host, target), focus = new FocusMark(host, target);
  let hovered = false, pressed = false, until = 0, rel = 0;
  const refresh = (how) => {
    const t = pressed ? 2 : hovered ? 1 : 0;
    if (t !== mark.tier) { const d = mark.to(t, how); if (t === 2) until = performance.now() + d; }
    link.setAttribute('data-pen-tier', t);
  };
  const release = () => { clearTimeout(rel); rel = setTimeout(() => { pressed = false; refresh('hover'); }, Math.max(0, until - performance.now())); };
  const on = {
    pointerenter: (e) => { if (e.pointerType === 'touch') return; hovered = true; refresh('hover'); },
    pointerleave: () => { hovered = false; refresh('hover'); if (pressed) release(); },
    pointerdown: (e) => { if (e.button > 0) return; pressed = true; refresh(e.pointerType === 'touch' ? 'tap' : 'press'); },
    pointerup: () => { if (pressed) release(); },
    pointercancel: () => { if (pressed) release(); },
    focus: () => focus.set(link.matches(':focus-visible')),
    blur: () => focus.set(false),
    click: (e) => { if (e.detail === 0) { pressed = true; refresh('key'); release(); } }   // Enter
  };
  Object.keys(on).forEach((k) => link.addEventListener(k, on[k]));
  link.setAttribute('data-pen-tier', 0);
  marks.push({ destroy: () => { Object.keys(on).forEach((k) => link.removeEventListener(k, on[k])); clearTimeout(rel); mark.destroy(); focus.destroy(); link.removeAttribute('data-pen-tier'); } });
}
export function clear() { marks.forEach((m) => m.destroy()); marks = []; }
