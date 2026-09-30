/* design/2026-09-building · round 3 · Q4, Components and the margin rail. Runs before 02-project.js (both render-blocking
   modules, in document order), which mounts the rail wherever a .rail-col exists:
   (a) no rail: the "Component index" stays the page's index, typed as a contents list, so the .rail-col goes;
   (b) the margin rail with five landmarks, one per component (the closing section is prose after them), so the
       typed index goes. Fred chose (b), 2026-09-29: "let it be consistent". The index's links get the pen's states. */
const q4 = (window.BD && BD.r3.q4) || 'a';
const drop = document.querySelector(q4 === 'a' ? '.rail-col' : '.cm-index');
if (drop) drop.remove();
const wire = () => document.querySelectorAll('.cm-index a, .cm-src[href]').forEach((a) => Tier.wire(a, { target: '.pen-t', focus: { on: 'host', gap: 4, gy: 3 } }));
if (window.Tier) wire(); else document.addEventListener('DOMContentLoaded', wire);
