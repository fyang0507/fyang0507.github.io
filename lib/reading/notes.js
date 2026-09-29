/* lib/reading/notes.js — the footnote model the pen (pen-note.js) and the phone slip (slip.js) share.
   · prepare(ctx): every margin note (.mn[data-ref], full reference text from the build) becomes A's slip sheet
     (.mn-in: eyelet, number, citation with dates in utility mono) and is tied to its own anchor. A citation [1, 2] is
     one <sup> followed by one .mn per key, so each note walks back over .mn siblings to the sup and takes the anchor
     whose href is its data-ref (numbers are display-only; the ids, prefixed per language, are unique).
   · geometry: the glyph row a ref sits on, and the phrase a ref is about.
   · hover(ctx, model, h): pointer / focus / touch / Esc wiring; a narrow screen hands the note to the slip.
   · first(key) / seen(key): the first reveal plays the full choreography, every later one the quick repeat.
   Ported from design/2026-09-motion r2-08b-notes.js (lineEnd, fields and parse dropped with the card and strip). */
export const NS = 'http://www.w3.org/2000/svg';
export const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Dates are machine-side facts → utility mono. Only text nodes are touched (URLs contain dates too).
function withDates(markup) {
  const t = document.createElement('span'), list = [];
  t.innerHTML = markup;
  const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) list.push(w.currentNode);
  list.forEach((n) => {
    const parts = n.textContent.split(/(\d{4}-\d{2}-\d{2})/); if (parts.length < 2) return;
    const f = document.createDocumentFragment();
    parts.forEach((p, i) => {
      if (i % 2) { const d = document.createElement('span'); d.className = 'd'; d.textContent = p; f.appendChild(d); }
      else if (p) f.appendChild(document.createTextNode(p));
    });
    n.parentNode.replaceChild(f, n);
  });
  return t.innerHTML;
}

export function prepare(ctx) {
  const byRef = {};
  ctx.root.querySelectorAll('.post-body').forEach((body) => {
    body.querySelectorAll('.mn[data-ref]').forEach((mn) => {
      let sup = mn.previousElementSibling;
      while (sup && sup.matches('.mn')) sup = sup.previousElementSibling;
      const ref = mn.dataset.ref, a = sup && sup.querySelector('a[href="#' + CSS.escape(ref) + '"]');
      if (!a || !mn.lastElementChild) return;
      const note = { n: mn.dataset.n, ref: ref, key: ref, body: body, a: a, sup: sup, mn: mn, html: withDates(mn.lastElementChild.innerHTML) };
      mn.innerHTML = '<span class="mn-in"><span class="num">' + esc(note.n) + '</span><span class="mn-t">' + note.html + '</span></span>';
      a.dataset.ref = ref;
      byRef[ref] = note;
    });
    const wire = document.createElementNS(NS, 'svg');
    wire.setAttribute('class', 'fn-wire'); wire.setAttribute('aria-hidden', 'true');
    body.appendChild(wire);
  });
  return {
    notes: () => Object.keys(byRef).map((k) => byRef[k]),
    of: (el) => { const h = el.closest('[data-ref]'); return h ? byRef[h.dataset.ref] || null : null; }
  };
}

/* ---- geometry ---- */
export function metrics(body) {
  const p = body.querySelector('p'), cs = getComputedStyle(p), fs = parseFloat(cs.fontSize);
  return { fs: fs, lh: parseFloat(cs.lineHeight) || fs * 1.8 };
}
// Text + <br> walker over the ref's paragraph that never enters notes or refs.
function walker(p) {
  return document.createTreeWalker(p, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: (n) => {
    if (n.nodeType === 3) return NodeFilter.FILTER_ACCEPT;
    if (n.matches('.mn, .fnref')) return NodeFilter.FILTER_REJECT;
    return n.tagName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  } });
}
function charRect(node, i) { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); return r.getClientRects()[0] || null; }
const block = (sup) => sup.closest('p, li, blockquote') || sup.parentNode;
// The glyph row a ref sits on: measured on the character just before the superscript (client coords).
export function row(sup) {
  const w = walker(block(sup));
  let n; w.currentNode = sup;
  while ((n = w.previousNode())) {
    if (n.nodeType !== 3) break;
    const t = n.textContent;
    let i = t.length - 1;
    while (i >= 0 && /\s/.test(t[i])) i--;
    if (i >= 0) { const r = charRect(n, i); if (r) return r; }
  }
  return sup.getBoundingClientRect();
}
// The phrase the note is about: back from the ref to the previous clause stop (，。；：! ? , ; :), never past a line
// break or another note, at least a few words long, at most ~34 CJK characters or ~70 Latin ones.
export function phrase(sup) {
  const w = walker(block(sup));
  let n, endN = null, endO = 0, sN = null, sO = 0, count = 0, cjk = null, done = false;
  w.currentNode = sup;
  while (!done && (n = w.previousNode())) {
    if (n.nodeType !== 3) break;
    const t = n.textContent;
    let i = t.length;
    if (!endN) { while (i > 0 && /\s/.test(t[i - 1])) i--; if (!i) continue; endN = n; endO = i; cjk = /[㐀-鿿]/.test(t.slice(Math.max(0, i - 6), i)); }
    const min = cjk ? 6 : 16, max = cjk ? 34 : 70;
    sN = n; sO = 0;
    for (let k = i - 1; k >= 0; k--) {
      const c = t[k], stop = /[，。；：！？,;:!?]/.test(c) || (c === '.' && /\s/.test(t[k + 1] || ''));
      if (stop && count >= min) { sO = k + 1; done = true; break; }
      if (++count >= max) { sO = k; done = true; if (!cjk) { const sp = t.indexOf(' ', k); if (sp > 0 && sp < i) sO = sp + 1; } break; }
    }
  }
  if (!endN) return null;
  while (sN && sO < sN.textContent.length && /[\s“"]/.test(sN.textContent[sO])) sO++;
  const r = document.createRange(); r.setStart(sN, sO); r.setEnd(endN, endO);
  return r;
}
export function rel(r, B) { return { left: r.left - B.left, right: r.right - B.left, top: r.top - B.top, bottom: r.bottom - B.top, width: r.width, height: r.height, cx: (r.left + r.right) / 2 - B.left, cy: (r.top + r.bottom) / 2 - B.top }; }
export function marginShown(note) { return getComputedStyle(note.mn).display !== 'none'; }

/* ---- first reveal vs repeat (per page view) ---- */
const seenMap = {};
export const first = (key) => !seenMap[key];
export const seen = (key) => { seenMap[key] = true; };

/* ---- pointer / focus / touch / Esc wiring ---- */
export function hover(ctx, model, h) {
  const root = ctx.root;
  let cur = null, t = 0, lastType = 'mouse';
  function on(note) { clearTimeout(t); if (cur === note) return; if (cur) h.off(cur); cur = note; h.on(note); }
  function off(now) { clearTimeout(t); const c = cur; if (!c) return; if (now) { cur = null; h.off(c); } else t = setTimeout(() => { if (cur === c) { cur = null; h.off(c); } }, 120); }
  root.addEventListener('pointerdown', (e) => { lastType = e.pointerType; }, true);
  root.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const hit = e.target.closest('.fnref a[data-ref], .mn[data-ref]'), note = hit && model.of(hit);
    if (note && marginShown(note)) on(note);
  });
  root.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const hit = e.target.closest('.fnref a[data-ref], .mn[data-ref]');
    if (hit && !(e.relatedTarget && hit.contains(e.relatedTarget))) off(false);
  });
  root.addEventListener('focusin', (e) => {
    const note = e.target.matches('.fnref a[data-ref]') && model.of(e.target);
    if (note && marginShown(note)) on(note);
  });
  root.addEventListener('focusout', (e) => { if (e.target.matches('.fnref a[data-ref]')) off(false); });
  root.addEventListener('click', (e) => {
    const a = e.target.closest('.fnref a[data-ref]'), note = a && model.of(a);
    if (!note) { if (cur && lastType === 'touch' && !e.target.closest('.mn')) off(true); return; }
    if (!marginShown(note)) { e.preventDefault(); h.tap(note); return; }
    if (lastType === 'touch') { e.preventDefault(); if (cur === note) off(true); else on(note); }   // wide touch: tap to pull, tap again to let go
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) off(true); });
  ctx.onLayout(() => off(true));
  return { on: on, off: off, current: () => cur };
}
