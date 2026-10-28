(() => {
  const nav = document.querySelector('.topnav');
  if (!nav) return;
  // The top edge is a reveal area, not an additional visible toolbar.
  const edge = document.createElement('div');
  edge.className = 'e35-top-edge';
  edge.setAttribute('aria-hidden', 'true');
  document.body.append(edge);
  let closeTimer;
  const isTouch = matchMedia('(hover: none)').matches;
  const setOpen = open => {
    clearTimeout(closeTimer);
    document.body.classList.toggle('e35-nav-open', open);
  };
  edge.addEventListener('pointerenter', () => setOpen(true));
  edge.addEventListener('pointerdown', () => setOpen(true));
  nav.addEventListener('pointerenter', () => setOpen(true));
  nav.addEventListener('pointerleave', () => {
    closeTimer = setTimeout(() => {
      if (!nav.matches(':focus-within') && !document.querySelector('.project-index.open')) setOpen(false);
    }, 180);
  });
  nav.addEventListener('focusin', () => setOpen(true));
  nav.addEventListener('focusout', () => {
    closeTimer = setTimeout(() => { if (!nav.matches(':focus-within')) setOpen(false); }, 180);
  });
  document.addEventListener('pointermove', e => {
    if (e.clientY <= 12) setOpen(true);
    else if (e.clientY > 80 && !nav.matches(':focus-within') && !document.querySelector('.project-index.open')) setOpen(false);
  }, { passive: true });
  addEventListener('scroll', () => setOpen(false), { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  if (isTouch) document.addEventListener('pointerdown', e => {
    if (!nav.contains(e.target) && e.target !== edge && !e.target.closest('.project-index')) setOpen(false);
  }, { passive: true });
  setOpen(false);
})();
