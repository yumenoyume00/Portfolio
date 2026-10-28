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

// Keep the new physical photos in the original click-to-enlarge interaction.
(() => {
  const area = document.querySelector('.vegetaria-stage-v78');
  if (!area) return;
  const photos = {
    '.veg-card04-v78,.veg-card05-v78':'cards-horizontal.webp',
    '.veg-card06-v78,.veg-card07-v78':'cards-vertical.webp',
    '.veg-pink-totes-v78':'tote-worn.webp'
  };
  Object.entries(photos).forEach(([selector,file]) => {
    area.querySelectorAll(selector).forEach(item => {
      item.dataset.full = '/Portfolio/room-content/integration-assets/vegetaria-photos/' + file;
    });
  });
  const footer = document.querySelector('.ending-foot');
  if (footer) footer.id = 'contact';
})();
