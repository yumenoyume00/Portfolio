// Shared keyboard handoff for embedded prototypes; no production content changes.
addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault(); event.stopImmediatePropagation();
    parent.postMessage({ type: 'room-device-close' }, location.origin);
  }
}, true);
addEventListener('message', event => {
  if (event.origin === location.origin && [...document.querySelectorAll('iframe')].some(frame => frame.contentWindow === event.source) && event.data?.type === 'room-device-close') parent.postMessage(event.data, location.origin);
});
