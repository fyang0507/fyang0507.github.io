/* design/2026-10-essays/switch-a.js — candidate A, 题头: the shelf's language joins the page title. 中文 / English
   stand on the title's baseline, right of 在写。, each in the face the spines set it in (DingTalk JinBuTi upright,
   Fraunces 500), so the pair reads as part of the masthead and shows how the spines will read. The pen as everywhere
   (switch-pair.js). The masthead is template text, so the pair mounts once support.js has rendered it. */
import { Pair } from './switch-pair.js';

export function start(lang) {
  FY.mount('.subpage-title-group', function (g) {
    var box = document.createElement('div');
    box.className = 'swa-box';
    box.innerHTML = '<span class="swa-cap" aria-hidden="true"><span lang="zh">书架</span> shelf</span>';
    g.appendChild(box);
    Pair(box, lang, { cls: 'swa', sep: '<span class="swa-sep" aria-hidden="true">/</span>', seed: 'swa', over: 4, focus: { gap: 6, gy: 4 } });
  });
}
