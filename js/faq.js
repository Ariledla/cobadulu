/* Animate native details without losing keyboard or reduced-motion support. */
(() => {
  function initFaq() {
    const root = document.getElementById('faq');
    if (!root || root.dataset.faqInitialized === 'true') return;
    const items = [...root.querySelectorAll('.faq-item')];
    const desired = new WeakMap();
    const animations = new WeakMap();
    const answerAnimations = new WeakMap();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    function equalizeRows(item) {
      item.style.removeProperty('--faq-row-height');
      if (!item.open) return;
      const summary = item.querySelector('summary');
      const answer = item.querySelector('.faq-answer');
      if (!summary || !answer) return;
      const height = Math.ceil(summary.getBoundingClientRect().height);
      item.style.setProperty('--faq-row-height', height + 'px');
    }

    function transition(item, expanded) {
      const summary = item.querySelector('summary');
      if (!summary) return;
      desired.set(item, expanded);
      summary.setAttribute('aria-expanded', String(expanded));
      const from = item.getBoundingClientRect().height;
      const answer = item.querySelector('.faq-answer');
      const answerOpacity = answer ? getComputedStyle(answer).opacity : '1';
      // Preserve the answer's layout while only its outer clip gets shorter.
      const answerHeight = answer?.getBoundingClientRect().height;
      animations.get(item)?.cancel();
      animations.delete(item);
      answerAnimations.get(item)?.cancel();
      answerAnimations.delete(item);

      // Measure the actual closed card without collapsing the live document.
      // An open summary can be taller because its height matches the answer.
      const probe = item.cloneNode(true);
      probe.open = false;
      probe.removeAttribute('id');
      probe.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;width:${item.getBoundingClientRect().width}px;height:auto;`;
      root.querySelector('.faq-list').append(probe);
      const collapsed = probe.getBoundingClientRect().height;
      probe.remove();

      if (reduced.matches || !item.animate) {
        answer?.style.removeProperty('height');
        answer?.style.removeProperty('flex-shrink');
        item.open = expanded;
        equalizeRows(item);
        return;
      }
      // Keep the answer rendered throughout both opening and closing.
      item.open = true;
      if (expanded) equalizeRows(item);
      if (answer) {
        answer.style.height = (expanded ? answer.getBoundingClientRect().height : answerHeight) + 'px';
        answer.style.flexShrink = '0';
      }
      const to = expanded ? item.getBoundingClientRect().height : collapsed;
      const animation = item.animate(
        [{ height: from + 'px' }, { height: to + 'px' }],
        { duration: 420, easing: 'cubic-bezier(.25, .1, .25, 1)', fill: 'both' }
      );
      animations.set(item, animation);
      if (answer) {
        const fade = answer.animate(
          [{ opacity: expanded && from <= collapsed + 1 ? 0 : Number(answerOpacity) }, { opacity: expanded ? 1 : 0 }],
          { duration: expanded ? 340 : 240, easing: 'ease-out', fill: 'both' }
        );
        answerAnimations.set(item, fade);
      }
      animation.onfinish = () => {
        if (animations.get(item) !== animation) return;
        item.open = desired.get(item);
        if (!item.open) item.style.removeProperty('--faq-row-height');
        animations.delete(item);
        animation.cancel();
        answerAnimations.get(item)?.cancel();
        answerAnimations.delete(item);
        if (answer) {
          answer.style.removeProperty('height');
          answer.style.removeProperty('flex-shrink');
        }
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
    let previousWidth = root.clientWidth;
    new ResizeObserver(() => {
      if (root.clientWidth === previousWidth) return;
      previousWidth = root.clientWidth;
      items.forEach(equalizeRows);
    }).observe(root);
    document.fonts?.ready.then(() => items.forEach(equalizeRows));
  }
  window.initFaq = initFaq;
})();
