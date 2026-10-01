// The acceptance test for the capture method: home at rest → the book → the desk becomes the nav → Writing.
export const init = () => { try { sessionStorage.setItem('fy-opener', '1'); } catch (e) {} };
export default async (s) => {
  s.shoot(false);
  await s.go('index.html');
  await s.hold(2.0);            // settle (the returning visit's fall, off camera)
  s.shoot(true);
  await s.hold(0.5);
  const b = await s.box(s.after ? '.hot.hot-book' : '.hot.bookwrap');
  await s.move(b.x + b.width / 2, b.y + b.height / 2, 0.9);
  await s.hold(0.4);
  s.beat('click-book', 'the book', 'click');
  await s.clickNav(null, null);
  await s.hold(2.2);
};
