// writing-spacing.mjs — the pen's underline spacing rule on Writing.dc.html at every width it ships at, with
// every wired host hovered once (p1-pen's scripts/verify/pen-spacing.mjs, run unchanged).
//   node /tmp/fyshot/run.mjs scripts/verify/writing-spacing.mjs
//   env: WRITING_DRAFT=<file> serves that file as Writing.dc.html (before the page itself was integrated)
import fs from 'fs';
import spacing from './pen-spacing.mjs';

export default async (page, ctx) => {
  const draft = process.env.WRITING_DRAFT;
  if (draft) { const html = fs.readFileSync(draft, 'utf8'); await page.route('**/Writing.dc.html', (r) => r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' })); }
  process.env.PEN_PAGES = 'Writing.dc.html';
  process.env.PEN_W = process.env.PEN_W || '1440,1024,390,360';
  process.env.PEN_HOVER = '1';
  await spacing(page, ctx);
};
