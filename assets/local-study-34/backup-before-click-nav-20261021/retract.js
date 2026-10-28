// Local trial: navigation remains visible; project introductions are scroll controlled.
document.body.classList.add('e35-nav-open');
// SUU starts at its real main visual. Do not let an offscreen autoplay loop
// scroll the page to the footer before the visitor reaches the computer.
(() => {
  const screen = document.querySelector('[data-suu-demo-v96]');
  if (!screen) return;
  screen.addEventListener('suu-resume-v123', event => event.stopImmediatePropagation(), true);
  screen.dispatchEvent(new Event('suu-manual-v122'));
  screen.classList.add('is-manual-v105');
  screen.querySelectorAll('.suu-page-v96').forEach((page,index) => {
    page.classList.toggle('is-active', index === 0);
    const image = page.querySelector('img');
    if (image) { image.style.transition = 'none'; image.style.transform = 'none'; }
  });
  screen.scrollTop = 0;
})();

// Physical photographs appear directly on hover, without opening a lightbox.
(() => {
  const area = document.querySelector('.vegetaria-stage-v78');
  if (!area) return;
  const photoAssets = 'assets/local-study-34/vegetaria-photos/';
  const replacements = {
    '.veg-card04-v78,.veg-card05-v78': 'cards-horizontal.webp',
    '.veg-card06-v78,.veg-card07-v78': 'cards-vertical.webp',
    '.veg-pink-totes-v78': 'tote-worn.webp'
  };
  Object.entries(replacements).forEach(([selector,file]) => {
    area.querySelectorAll(selector).forEach(item => { item.dataset.full = photoAssets + file; });
  });
  const preview = document.createElement('div');
  preview.className = 'local-veg-photo';
  preview.setAttribute('aria-hidden','true');
  const image = document.createElement('img');
  image.alt = '';
  preview.append(image);
  document.body.append(preview);
  let active = null, closeTimer = 0, pointer = {x:-1,y:-1}, request = 0;
  const inside = rect => pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
  function stillInside() { return !!active && (inside(active.getBoundingClientRect()) || (preview.classList.contains('is-visible') && inside(preview.getBoundingClientRect()))); }
  function position() {
    if (!active || !image.naturalWidth) return;
    const rect = active.getBoundingClientRect();
    const ratio = image.naturalWidth / image.naturalHeight;
    const height = Math.min(440, innerHeight - 130, 380 / ratio, (innerWidth - 32) / ratio);
    const width = height * ratio;
    const x = Math.max(16, Math.min(innerWidth - width - 16, rect.left + rect.width / 2 - width / 2));
    const y = Math.max(78, Math.min(innerHeight - height - 20, rect.top + rect.height / 2 - height / 2));
    Object.assign(preview.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
  }
  function show(item) {
    clearTimeout(closeTimer);
    if (active === item) return;
    if (active && preview.classList.contains('is-visible') && inside(preview.getBoundingClientRect())) return;
    if (active) active.classList.remove('e31-focused');
    active = item;
    const token = ++request;
    const source = item.dataset.full;
    const next = new Image();
    const reveal = () => {
      if (token !== request || active !== item) return;
      image.src = source;
      image.onload = () => { if (token === request) { position(); preview.classList.add('is-visible'); } };
      if (image.complete && image.naturalWidth) { position(); preview.classList.add('is-visible'); }
    };
    next.onload = reveal;
    next.src = source;
    if (next.complete && next.naturalWidth) { next.onload = null; reveal(); }
  }
  function hide() {
    clearTimeout(closeTimer);
    ++request;
    if (active) active.classList.remove('e31-focused');
    active = null;
    area.classList.remove('e31-focus');
    preview.classList.remove('is-visible');
  }
  function deferHide() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (!stillInside() && !active?.matches(':focus-visible')) hide(); }, 140);
  }
  // Keep the photo open across both the small original and the enlarged photograph.
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer = {x:event.clientX,y:event.clientY};
    const item = event.target.closest('.veg-item-v78');
    if (active && preview.classList.contains('is-visible') && inside(preview.getBoundingClientRect())) { clearTimeout(closeTimer); area.querySelectorAll('.e31-focused').forEach(node=>node.classList.remove('e31-focused'));area.classList.add('e31-focus');active.classList.add('e31-focused'); }
    else if (item && area.contains(item)) show(item);
    else if (stillInside()) { clearTimeout(closeTimer); area.classList.add('e31-focus'); active.classList.add('e31-focused'); }
    else deferHide();
  }, {passive:true});
  area.querySelectorAll('.veg-item-v78').forEach(item => {
    item.setAttribute('aria-label','Preview photograph: '+(item.querySelector('img')?.alt || 'Vegetaria application'));
    item.addEventListener('pointerenter', event => { pointer={x:event.clientX,y:event.clientY}; if (event.pointerType !== 'touch') show(item); });
    item.addEventListener('pointerleave', deferHide);
    item.addEventListener('focus', () => { if (matchMedia('(hover: hover)').matches) show(item); });
    item.addEventListener('blur', deferHide);
    item.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (matchMedia('(hover: none)').matches) { if (active === item) hide(); else show(item); }
    }, true);
  });
  addEventListener('scroll', hide, {passive:true});
  addEventListener('resize', hide, {passive:true});
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.veg-item-v78') && !stillInside()) hide(); }, {passive:true});
  const preload = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    [...new Set([...area.querySelectorAll('[data-full]')].map(item=>item.dataset.full))].forEach(src=>{ const photo=new Image();photo.src=src; });
    preload.disconnect();
  },{rootMargin:'500px'});
  preload.observe(area);
})();
