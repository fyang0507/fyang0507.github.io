/* r2-06-app.js — board wiring: one desktop gallery, one live 390 phone, one physics loop between them. */
(function () {
  var desk = new G06.Desk(document.querySelector('#stage-desk'));
  var phone = new G06.Phone(document.querySelector('#stage-phone'));
  desk.reset(false); phone.reset(false);

  window.replayDesk = function () { desk.reset(true); };
  window.demoDesk = function () { desk.demo(); };
  window.replayPhone = function () { phone.reset(true); };

  // Board-only readout: is the shared loop running? It should sleep whenever nothing has a cause to move.
  var loopEl = document.querySelector('#loop-state');
  G06.Sim.on(function (on) { loopEl.textContent = on ? 'rAF loop · running' : 'rAF loop · asleep'; loopEl.classList.toggle('on', on); });

  var lastW = innerWidth, narrow = innerWidth <= 760, tm = 0;
  window.addEventListener('resize', function () {
    clearTimeout(tm);
    tm = setTimeout(function () {
      if (innerWidth === lastW) return;
      lastW = innerWidth; desk.reset(false);
      if ((innerWidth <= 760) !== narrow) { narrow = innerWidth <= 760; phone.reset(false); }
    }, 220);
  });
  document.addEventListener('mock:rm', function () { desk.reset(false); phone.reset(false); });
})();
