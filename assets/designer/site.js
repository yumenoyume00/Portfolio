const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('.work-card[data-category], .index-row[data-category]').forEach(card => {
    card.hidden = selected !== 'All' && card.dataset.category !== selected;
  });
  const count = document.querySelector('#work-count');
  if (count) count.textContent = `(${document.querySelectorAll('.work-card:not([hidden])').length})`;
}));
const views = document.querySelectorAll('[data-view]');
views.forEach(button => button.addEventListener('click', () => {
  views.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('.work-grid').hidden = button.dataset.view !== 'images';
  document.querySelector('.work-index').hidden = button.dataset.view !== 'index';
}));
const dialog = document.querySelector('.lightbox');
if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    dialog.querySelector('p').textContent = image.alt;
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
}
