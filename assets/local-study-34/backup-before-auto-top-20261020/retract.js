(() => {
  const nav = document.querySelector('.topnav');
  if (!nav) return;
  nav.id = 'local-main-navigation';
  function toggleButton(className, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `e35-toggle ${className}`;
    button.addEventListener('click', action);
    document.body.append(button);
    return button;
  }
  let navClosed = false, copyClosed = false;
  const navButton = toggleButton('e35-nav-toggle', () => setNav(!navClosed));
  navButton.setAttribute('aria-controls', nav.id);
  function setNav(closed) {
    navClosed = closed;
    document.body.classList.toggle('e35-nav-collapsed', closed);
    nav.inert = closed;
    navButton.textContent = closed ? 'MENU ↓' : '↑';
    navButton.setAttribute('aria-label', closed ? 'Show navigation' : 'Hide navigation');
    navButton.setAttribute('aria-expanded', String(!closed));
  }
  const copyButton = toggleButton('e35-copy-toggle', () => {
    copyClosed = !copyClosed;
    document.body.classList.toggle('e35-copy-collapsed', copyClosed);
    document.querySelectorAll('#projects .project-head,#projects .portfolio-head').forEach(head => { head.inert = copyClosed; });
    updateCopy();
  });
  function updateCopy() {
    copyButton.textContent = copyClosed ? 'INFO ↓' : 'INFO ↑';
    copyButton.setAttribute('aria-label', copyClosed ? 'Show project description' : 'Hide project description');
    copyButton.setAttribute('aria-expanded', String(!copyClosed));
  }
  let lastY = scrollY, distance = 0, direction = 0;
  function onScroll() {
    const delta = scrollY - lastY;
    lastY = scrollY;
    if (Math.abs(delta) > 0) {
      const next = Math.sign(delta);
      distance = next === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = next;
      if (scrollY < 24) setNav(false);
      else if (distance > 80 && !nav.matches(':focus-within') && !document.querySelector('.project-index.open')) setNav(next > 0);
    }
    const projects = document.querySelector('#projects');
    const rect = projects?.getBoundingClientRect();
    copyButton.hidden = !rect || rect.top > innerHeight * .6 || rect.bottom < 60;
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setNav(true);
  });
  setNav(false); updateCopy(); onScroll();
})();
