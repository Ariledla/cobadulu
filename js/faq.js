/* Animate native details without losing keyboard or reduced-motion support. */
(() => {
  function initFaq() {
    const root = document.getElementById('faq');
    if (!root || root.dataset.faqInitialized === 'true') return;
    const items = [...root.querySelectorAll('.faq-item')];
    const desired = new WeakMap();
    const animations = new WeakMap();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function transition(item, expanded) {
      const summary = item.querySelector('summary');
      if (!summary) return;
      desired.set(item, expanded);
      summary.setAttribute('aria-expanded', String(expanded));
      const from = item.getBoundingClientRect().height;
      animations.get(item)?.cancel();
      animations.delete(item);

      if (reduced.matches || !item.animate) {
        item.open = expanded;
        return;
      }
      // Keep the answer rendered throughout both opening and closing.
      item.open = true;
      const style = getComputedStyle(item);
      const collapsed = summary.getBoundingClientRect().height +
        parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const to = expanded ? item.getBoundingClientRect().height : collapsed;
      const animation = item.animate(
        [{ height: from + 'px' }, { height: to + 'px' }],
        { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      animations.set(item, animation);
      animation.onfinish = () => {
        if (animations.get(item) !== animation) return;
        item.open = desired.get(item);
        animations.delete(item);
      };
    }

    for (const item of items) {
      item.open = false;
      desired.set(item, false);
      const summary = item.querySelector('summary');
      if (!summary) continue;
      summary.setAttribute('aria-expanded', 'false');
      summary.addEventListener('click', event => {
        event.preventDefault();
        const expand = !desired.get(item);
        if (expand) {
          for (const other of items) {
            if (other !== item && desired.get(other)) transition(other, false);
          }
        }
        transition(item, expand);
      });
    }
    root.dataset.faqInitialized = 'true';
  }
  window.initFaq = initFaq;
})();
