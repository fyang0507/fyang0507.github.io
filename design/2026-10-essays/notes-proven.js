/* design/2026-10-essays/notes-proven.js — candidate C's one claim: the span punctuation proves.
   A ref "proves" a span only when it sits right after a closing quotation or title mark (”  "  」  』  》, with at
   most one sentence stop between: ”。 ”.) whose opening mark is in the same block, on the same source line (no
   <br>), with no other ref or note between the two marks, and no second closing mark of the same kind between
   them (a stray ” in the source, as in ”不酷了”, proves nothing). Everything else returns null.
   proven(sup) → { range, text } | null. */
const PAIRS = { '”': '“', '」': '「', '』': '『', '》': '《', '"': '"' };
const STOP = /[.。,，;；!！?？]/;

// The block in reading order: text nodes, and walls (a <br>, a ref, a note) that are never entered.
function tokens(block) {
  const out = [];
  (function walk(el) {
    for (let n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) out.push(n);
      else if (n.nodeType === 1) { if (n.tagName === 'BR' || n.matches('.mn, .fnref')) out.push(n); else walk(n); }
    }
  })(block);
  return out;
}

export function proven(sup) {
  const t = tokens(sup.closest('p, li, blockquote') || sup.parentNode), nodes = [];
  for (let k = t.indexOf(sup) - 1; k >= 0 && t[k].nodeType === 3; k--) nodes.push(t[k]);   // back to the nearest wall
  let ni = 0, ci = nodes.length ? nodes[0].textContent.length : 0;
  const prev = () => {                       // the previous character, across text nodes
    while (ni < nodes.length) {
      if (ci > 0) { ci--; return { node: nodes[ni], i: ci, c: nodes[ni].textContent[ci] }; }
      ni++; ci = ni < nodes.length ? nodes[ni].textContent.length : 0;
    }
    return null;
  };
  let p = prev();
  while (p && /\s/.test(p.c)) p = prev();
  if (p && STOP.test(p.c)) { p = prev(); if (!p || !PAIRS[p.c]) return null; }
  if (!p || !PAIRS[p.c]) return null;
  const close = p, open = PAIRS[close.c];
  let o = null, q;
  while ((q = prev())) {
    if (q.c === open) { o = q; break; }
    if (q.c === close.c) return null;        // a second closing mark first: the pair is doubtful
  }
  if (!o) return null;
  const range = document.createRange();
  range.setStart(o.node, o.i); range.setEnd(close.node, close.i + 1);
  const text = range.toString();
  return text.length < 3 ? null : { range, text };
}
