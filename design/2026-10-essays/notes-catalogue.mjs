// design/2026-10-essays/notes-catalogue.mjs — dumps every margin note on Reading, in both languages, for the catalogue:
// the span today's phrase finder (lib/reading/notes.js phrase()) marks, the span candidate C would mark
// (notes-proven.js), the ref's context and the note's text. Then: python3 design/2026-10-essays/notes-catalogue.py
//   node /tmp/fyshot/run.mjs design/2026-10-essays/notes-catalogue.mjs      (server on NOTES_BASE, default :4246)
//   → /tmp/fyshot/notes-catalogue.json
// Note: it calls production's phrase(); once a port deletes it, this dump is lineage and the HTML is the record.
import fs from 'fs';
const BASE = process.env.NOTES_BASE || 'http://127.0.0.1:4246/';
const BEFORE = 260, AFTER = 90;   // context kept around each ref, in characters

export default async (page, ctx) => {
  await page.goto(BASE + 'Writing.dc.html', { waitUntil: 'load' });
  const ids = await page.evaluate(() => (window.FY_POST_INDEX || []).map((p) => p.id).reverse());
  const out = [];
  for (const id of ids) for (const lang of ['en', 'zh']) {
    await page.goto(BASE + 'design/2026-10-essays/notes-reading.dc.html?cand=today&post=' + id + '&lang=' + lang, { waitUntil: 'load' });
    await page.waitForSelector('.rd-main[data-ready]', { timeout: 20000 });
    const res = await page.evaluate(async ([lang, BEFORE, AFTER]) => {
      const { phrase } = await import('/lib/reading/notes.js');
      const { proven } = await import('/design/2026-10-essays/notes-proven.js');
      const body = document.querySelector('.post-body.' + lang);
      // the block's text without notes and refs; the sup itself becomes ⁽n⁾
      function flat(block, sup) {
        let s = '', at = -1;
        (function walk(el) {
          for (let n = el.firstChild; n; n = n.nextSibling) {
            if (n === sup) { at = s.length; s += '⁽' + sup.textContent + '⁾'; }
            else if (n.nodeType === 3) s += n.textContent;
            else if (n.nodeType === 1 && n.tagName === 'BR') s += '\n';
            else if (n.nodeType === 1 && !n.matches('.mn, .fnref')) walk(n);
          }
        })(block);
        return { s, at };
      }
      const notes = [...body.querySelectorAll('.mn[data-ref]')].map((mn) => {
        let sup = mn.previousElementSibling;
        while (sup && sup.matches('.mn')) sup = sup.previousElementSibling;
        const block = sup.closest('p, li, blockquote') || sup.parentNode, f = flat(block, sup);
        const r = phrase(sup), span = r ? r.toString() : '', p = proven(sup);
        const pre = f.s.slice(0, f.at), hs = span && pre.lastIndexOf(span) >= 0 ? pre.lastIndexOf(span) : -1;
        const a = Math.max(0, Math.min(f.at - BEFORE, hs >= 0 ? hs - 40 : f.at)), b = f.s.indexOf('⁾', f.at) + 1;
        return { n: mn.dataset.n, span: span, crosses: !!span && hs < 0, proof: p ? p.text : null,
          ctx: (a > 0 ? '…' : '') + f.s.slice(a, Math.min(f.s.length, b + AFTER)) + (b + AFTER < f.s.length ? '…' : ''),
          at: f.at - a + (a > 0 ? 1 : 0), hs: hs >= 0 ? hs - a + (a > 0 ? 1 : 0) : -1,
          note: (mn.querySelector('.mn-t') || mn).textContent.trim() };
      });
      const repeats = [...body.querySelectorAll('.fnref a')].filter((x) => !x.dataset.ref).map((x) => x.textContent);
      return { notes, repeats, sups: body.querySelectorAll('sup.fnref').length };
    }, [lang, BEFORE, AFTER]);
    if (res.sups) { out.push({ id, lang, ...res }); ctx.log(id, lang, res.notes.length, 'notes'); }
  }
  fs.writeFileSync('/tmp/fyshot/notes-catalogue.json', JSON.stringify(out));
  ctx.log('wrote /tmp/fyshot/notes-catalogue.json');
};
