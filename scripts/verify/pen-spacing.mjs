// pen-spacing.mjs — the underline spacing rule, measured on real pages (ported from board r4-02's check).
//   node /tmp/fyshot/run.mjs scripts/verify/pen-spacing.mjs
//   env: PEN_BASE (default http://127.0.0.1:4173/) · PEN_PAGES (comma list, default: harness + every page)
//        PEN_W (default 1440,390) · PEN_HOVER=1 also hovers every wired host once before measuring
// Rule: every TierMark underline hangs max(3 px, 0.18 em) under its baseline, and whatever follows it —
// the next line of text, or a drawn rule (.site-rule, hr, [data-pen-rule]) — sits ≥ MIN px below the
// stroke and ≥ RATIO × the line's drop, so the line belongs to the word above it. A link's next line
// in its own paragraph is exempt (that is leading, not "what follows"). Transforms are removed while
// measuring: tilted cards rotate rigidly, so the designed distances are the untransformed ones.
// Exit code 1 if anything breaks the rule.

const MIN = 10, RATIO = 2;

function measure([MIN, RATIO]) {
  const moved = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('svg')) return;
    const t = getComputedStyle(el).transform;
    if (t && t !== 'none') { moved.push([el, el.style.transform, el.style.transition]); el.style.transition = 'none'; el.style.transform = 'none'; }
  });
  try {
    const texts = [], rg = document.createRange(), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement;
      if (!n.nodeValue.trim() || !el || el.closest('svg, script, style, noscript, [aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
      rg.selectNodeContents(n);
      for (const c of rg.getClientRects()) if (c.width >= 2 && c.height >= 4) texts.push({ el, x: c.left, y: c.top, w: c.width, p: el.closest('p') });
    }
    const rules = [...document.querySelectorAll('.site-rule, hr, [data-pen-rule]')].map((r) => { const b = r.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }; }).filter((r) => r.w > 0);
    const out = [];
    document.querySelectorAll('svg.tm').forEach((svg) => {
      const host = svg.parentElement, line = svg.querySelector('.tm-line');
      if (!host || !line || !host.getClientRects().length) return;
      const target = host.matches('[data-pen-t]') ? host : host.querySelector('[data-pen-t]') || host;
      const lr = line.getBoundingClientRect(), bottom = lr.bottom + 1.1, drop = +svg.getAttribute('data-drop') || 3;
      if (lr.width < 1) return;
      let below = Infinity, what = '';
      for (const o of texts) {
        if (target.contains(o.el) || (o.p && o.p === target.closest('p'))) continue;
        if (o.x < lr.right - 1 && o.x + o.w > lr.left + 1 && o.y > lr.top && o.y - bottom < below) { below = o.y - bottom; what = o.el.textContent.trim().slice(0, 24); }
      }
      for (const r of rules) if (r.x < lr.right - 1 && r.x + r.w > lr.left + 1 && r.y > lr.top && r.y - bottom < below) { below = r.y - bottom; what = 'rule'; }
      const name = target.textContent.replace(/\s+/g, ' ').trim().slice(0, 30);
      out.push({ name, below: below === Infinity ? null : +below.toFixed(1), drop: +drop.toFixed(2), what, ok: below === Infinity || (below >= MIN && below >= RATIO * drop) });
    });
    return out;
  } finally {
    moved.forEach(([el, t, tr]) => { el.style.transform = t; el.style.transition = tr; });
  }
}

export default async (page, ctx) => {
  const base = process.env.PEN_BASE || 'http://127.0.0.1:4173/';
  const pages = (process.env.PEN_PAGES || 'scripts/verify/pen-harness.html,index.html,Writing.dc.html,Building.dc.html,Gallery.dc.html,About.dc.html,Reading.dc.html').split(',');
  const widths = (process.env.PEN_W || '1440,390').split(',').map(Number);
  let total = 0, bad = 0;
  for (const w of widths) {
    for (const p of pages) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(base + p, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(1200);
      if (process.env.PEN_HOVER) {
        for (const h of await page.$$('[data-pen-tier]')) { try { await h.hover({ timeout: 500 }); await page.waitForTimeout(40); } catch (e) { /* hidden or covered */ } }
        await page.mouse.move(1, 1); await page.waitForTimeout(600);
      }
      const r = await page.evaluate(measure, [MIN, RATIO]);
      const fails = r.filter((x) => !x.ok), finite = r.filter((x) => x.below != null);
      const tight = finite.sort((a, b) => a.below - b.below)[0];
      total += r.length; bad += fails.length;
      ctx.log(`${w} ${p}: ${r.length} underlines · ${fails.length} break the rule` + (tight ? ` · tightest ${tight.below}px below "${tight.name}" (next: ${tight.what}, ${(tight.below / tight.drop).toFixed(1)}× drop)` : ''));
      fails.forEach((f) => ctx.log(`   ✗ "${f.name}": ${f.below}px to "${f.what}" (drop ${f.drop}px; needs ≥ ${Math.max(MIN, RATIO * f.drop).toFixed(1)})`));
    }
  }
  ctx.log(`pen-spacing: ${total} underlines, ${bad} violations`);
  if (bad) process.exitCode = 1;
};
