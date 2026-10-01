/* v1.5/after.js — the promo's world, shared by the promo (promo.js) and the side-by-side (sbs.js): the kraft dossier,
   the take on its sheet (and the next moment under it for a jump), the hand, the seal's DPR 3 close-up, and the last
   sheet with the motto, the seals and the credits. frame(t) sets all of it for film time t from the cut (cut.js) and
   returns once the footage frames are in. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, OFF } from '../v1/world.js';
import { hand, overlays } from '../v1.1/hand.js';
import { frameAt } from './cut.js';

const F = window.FILM;
export const SRC = 'footage/', REGIONS = 'take11-after';   // the seal's DPR 3 close-up is take11's

export async function afterWorld(scene, C, META, FR, endCard) {
  const fold = folder(scene); fold.hinge.rotation.y = -Math.PI * .93;
  const END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); scene.add(END);
  const endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); scene.add(endPlane);
  const PULL = new THREE.Group(); scene.add(PULL);
  const A = sheet({}); A.position.z = 0.3; PULL.add(A);
  const N = sheet({}); N.position.z = 0.285; N.visible = false; PULL.add(N);
  hand.build(scene);
  overlays.build(A, META[REGIONS].regions || {}, SRC + REGIONS + '/r/');
  await endCard.load();
  const e = C.end;
  return {
    A,
    // c: the camera for this frame ({x, y, h}); picH: the picture's height in px (the hand's size)
    async frame(t, c, picH) {
      const st = C.state(t);
      const k = F.ease.inOut(F.seg(t, e.t0, e.t0 + 1.4));
      PULL.position.set(-19 * k, 0.4 * Math.sin(Math.PI * k), 0.9 * Math.sin(Math.PI * k)); PULL.rotation.z = 2.5 * Math.PI / 180 * k; PULL.visible = k < 1;
      const loads = [];
      if (PULL.visible) {
        const fa = frameAt(FR[st.take], st.u); loads.push(frameInto(A, `${SRC}${st.take}/f/${fa[1]}`, st.take + fa[1]));
        if (st.next != null) { const fn = frameAt(FR[st.nextTake], st.next); loads.push(frameInto(N, `${SRC}${st.nextTake}/f/${fn[1]}`, st.nextTake + fn[1])); }
      }
      N.visible = st.next != null; A.position.x = st.next != null ? -19 * st.jump : 0; A.position.z = 0.3 + (st.next != null ? 0.6 * Math.sin(Math.PI * st.jump) : 0);
      overlays.frame(PULL.visible && st.take === REGIONS ? st.u : null, loads);
      await Promise.all(loads);
      endCard.draw(endTex, t - e.t0);
      hand.frame(PULL.visible && st.next == null ? frameAt(FR[st.take], st.u) : null, META[st.take].presses, st.u, A, c, picH);
    }
  };
}
