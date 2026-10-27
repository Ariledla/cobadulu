/* Two identical, viewport-filling sequences make each loop visually seamless. */
(() => {
  window.initMarquees = () => {
    for (const selector of ['#home .ticker-track', '#contact .contact-end-track']) {
      const track = document.querySelector(selector);
      if (!track || track.dataset.loopReady) continue;
      track.dataset.loopReady = 'true';
      const group = track.firstElementChild;
      if (!group) continue;
      const originals = [...group.children].map(child => child.cloneNode(true));
      let animation;
      let previousWidth = 0;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      function build() {
        const viewportWidth = track.parentElement.clientWidth;
        const progress = animation ? (animation.currentTime % animation.effect.getTiming().duration) / animation.effect.getTiming().duration : 0;
        animation?.cancel();
        group.replaceChildren(...originals.map(child => child.cloneNode(true)));
        while (group.getBoundingClientRect().width < viewportWidth + 80) {
          const copies = originals.map(child => {
            const copy = child.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            return copy;
          });
          group.append(...copies);
          if (!group.getBoundingClientRect().width) break;
        }
        const duplicate = group.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        track.replaceChildren(group, duplicate);
        const distance = group.getBoundingClientRect().width;
        if (!reduced.matches && distance) {
          const duration = distance / 45 * 1000;
          animation = track.animate([{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }], { duration, iterations: Infinity, easing: 'linear' });
          animation.currentTime = progress * duration;
        }
        previousWidth = viewportWidth;
      }
      build();
      new ResizeObserver(() => {
        if (track.parentElement.clientWidth !== previousWidth) build();
      }).observe(track.parentElement);
      document.fonts?.ready.then(build);
      reduced.addEventListener('change', build);
    }
  };
})();
