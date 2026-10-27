/* Keep the document end in view when mobile browser chrome resizes it. */
(() => {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const phone = matchMedia('(width < 768px), (orientation: landscape) and (width <= 932px) and (height <= 500px)');
  let atBottom = false;
  let resizeTimer;
  let previousHeight = viewport.height;
  function updateEdge() {
    if (!phone.matches || Math.abs(viewport.scale - 1) > .01) return;
    atBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 12;
  }
  window.addEventListener('scroll', updateEdge, { passive: true });
  viewport.addEventListener('resize', () => {
    const heightChanged = Math.abs(viewport.height - previousHeight) > 1;
    previousHeight = viewport.height;
    if (!phone.matches || !atBottom || !heightChanged || Math.abs(viewport.scale - 1) > .01) return;
    if (document.activeElement?.matches('input, textarea, [contenteditable="true"]')) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }, 80);
  });
})();
