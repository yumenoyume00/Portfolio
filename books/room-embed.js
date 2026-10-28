/* Integration bridge only. The original book geometry and turning code stays in each reader. */
if (new URLSearchParams(location.search).has("room")) {
  document.documentElement.classList.add("room-embedded");
  const style = document.createElement("style");
  style.textContent = `html.room-embedded, .room-embedded body { background: transparent !important; }
    .room-embedded #loading { background: transparent !important; visibility: hidden; }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }`;
  document.head.appendChild(style);
  let previous = "";
  const report = () => {
    const loading = document.getElementById("loading");
    if (!loading) return;
    const status = loading.classList.contains("error") ? "error" : loading.classList.contains("hidden") ? "ready" : "loading";
    if (status !== previous) { previous = status; parent.postMessage({ type: "room-book-status", status }, location.origin); }
  };
  addEventListener("DOMContentLoaded", () => {
    const loading = document.getElementById("loading");
    if (loading) new MutationObserver(report).observe(loading, { attributes: true, childList: true, subtree: true });
    report();
  });
  addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault(); event.stopImmediatePropagation();
      parent.postMessage({ type: "room-book-close" }, location.origin);
    }
  }, true);
  addEventListener("click", event => {
    const target = event.target;
    if (target === document.body || target?.classList?.contains("scene")) parent.postMessage({ type: "room-book-close" }, location.origin);
  });
}
