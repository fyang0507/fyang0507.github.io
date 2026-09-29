// Recording-only: both Gallery pages shuffle their prints with Math.random on every load. A scenario that
// passes this to context.addInitScript(seedRandom, n) gets the same order every take, on both sites, so
// both sides can open the same print. Seed 2 puts the Thanksgiving parade third on the first line of both.
export function seedRandom(s) {
  let a = s >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const GALLERY_SEED = 2;
