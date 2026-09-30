/* Fred Agent · Demos' evidence viewer, as it was on main (assets/fred-agent/fred-agent.js), until Demos' own design
   round lands. Each loupe magnifies its region from the file its capture already shows. Opening one puts its figure
   in focus mode (Fig. 04's three panels open together): the capture dims, the notes show, and the zoom tier
   (data-zoom-src) is laid over every loupe of the figure, the only time it is fetched. A click anywhere in the figure
   or Escape returns. Styles in demos.css. */
function layout(image) {
  const wrap = image.closest('.fa-evidence-shot-wrap');
  if (!wrap || !image.clientWidth || !image.clientHeight) return;
  // At rest a loupe magnifies the file the image already shows; once opened, the zoom tier lies over it.
  let source = image.currentSrc ? 'url("' + image.currentSrc + '")' : '';
  if (source && image.fyZoom) source = 'url("' + image.getAttribute('data-zoom-src') + '"),' + source;
  wrap.querySelectorAll('.fa-evidence-loupe[data-scope-target-x]').forEach((scope) => {
    const zoom = parseFloat(getComputedStyle(scope.closest('.fa-evidence-annotation')).getPropertyValue('--scope-zoom')) || 1;
    const w = image.clientWidth * zoom, h = image.clientHeight * zoom;
    const x = scope.offsetWidth / 2 - parseFloat(scope.dataset.scopeTargetX) / 100 * w;
    const y = scope.offsetHeight / 2 - parseFloat(scope.dataset.scopeTargetY) / 100 * h;
    if (source) scope.style.backgroundImage = source;
    scope.style.backgroundSize = w + 'px ' + h + 'px';
    scope.style.backgroundPosition = x + 'px ' + y + 'px';
  });
}

function focus(wrap, on) {
  const group = wrap.closest('[data-evidence-focus-group]');
  (group ? group.querySelectorAll('.fa-evidence-shot-wrap') : [wrap]).forEach((w) => {
    w.classList.toggle('is-focus-mode', on);
    const image = w.querySelector('.fa-evidence-shot img[data-zoom-src]');
    if (on && image && !image.fyZoom) { image.fyZoom = true; layout(image); }
    w.querySelectorAll('.fa-evidence-loupe').forEach((t) => t.setAttribute('aria-expanded', on ? 'true' : 'false'));
  });
}

FY.styled(() => {
  const ro = new ResizeObserver((entries) => entries.forEach((e) => layout(e.target)));
  document.querySelectorAll('.fa-evidence-shot-wrap img').forEach((image) => {
    image.addEventListener('load', () => layout(image));
    ro.observe(image);
    if (image.complete) layout(image);
  });
  document.querySelectorAll('.fa-evidence-shot-wrap').forEach((wrap) => {
    const loupes = wrap.querySelectorAll('.fa-evidence-loupe');
    if (!loupes.length) return;
    focus(wrap, false);
    loupes.forEach((loupe) => loupe.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const on = !wrap.classList.contains('is-focus-mode');
      focus(wrap, on);
      if (!on) loupe.blur();
    }));
    wrap.addEventListener('click', (e) => {
      if (!wrap.classList.contains('is-focus-mode')) return;
      e.preventDefault();
      focus(wrap, false);
    });
    wrap.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !wrap.classList.contains('is-focus-mode')) return;
      focus(wrap, false);
      if (e.target && e.target.classList.contains('fa-evidence-loupe')) e.target.focus();
    });
  });
});
