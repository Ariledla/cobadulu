
/* ==========================================================
   UDIN SAIPUDIN — PROJECTS CAROUSEL
   CLICK + DRAG + TOUCHPAD + SMOOTH NAVIGATION
   ========================================================== */

(() => {
  "use strict";

  const desktop = window.matchMedia(
    "(min-width: 1200px)"
  );

  const names = [
    "Sales Performance",
    "Campaign Performance",
    "Delivery Performance"
  ];

  const DRAG_THRESHOLD = 7;

  let instance = null;
  let observer = null;
  let checkQueued = false;

  function normalizeModal() {
    document.querySelectorAll(
      ".case-study-modal"
    ).forEach(modal => {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      const close = modal.querySelector(
        ".case-study-close"
      );

      if (close) {
        close.setAttribute(
          "aria-label",
          "Close case study"
        );
      }
    });
  }

  function initialize() {
    if (!desktop.matches) return false;

    const section = document.getElementById("projects");
    if (!section) return false;

    const track = section.querySelector(
      ".projects-static"
    );
    if (!track) return false;

    const slides = Array.from(
      track.querySelectorAll(
        ":scope > .project-tile"
      )
    );

    if (slides.length < 2) return false;

    if (instance?.track === track) return true;
    if (instance) instance.destroy();

    normalizeModal();

    /* ================================================
       CREATE WRAPPER
       ================================================ */

    const wrapper = document.createElement("div");
    wrapper.className = "projects-carousel";

    track.before(wrapper);
    wrapper.appendChild(track);

    const originalTabindex =
      track.getAttribute("tabindex");

    track.tabIndex = 0;
    track.setAttribute("role", "region");
    track.setAttribute(
      "aria-roledescription",
      "carousel"
    );
    track.setAttribute(
      "aria-label",
      "Portfolio projects"
    );

    let activeIndex = 0;
    let selectedIndex = 0;

    let dragging = false;
    let dragCandidate = null;
    let suppressNextClick = false;

    let animationFrame = 0;
    let animationToken = 0;
    let animating = false;

    let scrollTimer = null;
    let resizeFrame = 0;
    let initialFrame = 0;

    /* ================================================
       PROJECT HEADERS
       ================================================ */

    slides.forEach((slide, index) => {
      const numberText = String(index + 1).padStart(
        2,
        "0"
      );

      const originalTitle = Array.from(
        slide.children
      ).find(el => el.matches("h3"));

      const fullTitle = originalTitle
        ? originalTitle.textContent.trim()
        : `Project ${numberText}`;

      slide.querySelector(
        ":scope > .pc-slide-header"
      )?.remove();

      const header = document.createElement("div");
      header.className = "pc-slide-header";

      const headingGroup = document.createElement("div");
      headingGroup.className = "pc-heading-group";

      const number = document.createElement("span");
      number.className = "pc-number";
      number.textContent = numberText;

      const headingText = document.createElement("div");
      headingText.className = "pc-heading-text";

      const title = document.createElement("h3");
      title.className = "pc-slide-title";
      title.textContent = fullTitle;

      headingText.appendChild(title);
      headingGroup.append(number, headingText);
      header.appendChild(headingGroup);

      slide.prepend(header);
      slide.classList.add("pc-ready");

      slide.setAttribute("role", "group");
      slide.setAttribute(
        "aria-label",
        `Project ${index + 1} of ${slides.length}`
      );
    });

    /* ================================================
       NAVIGATION
       ================================================ */

    const navigation = document.createElement("div");
    navigation.className = "pc-navigation";

    const tabsContainer = document.createElement("div");
    tabsContainer.className = "pc-tabs";

    tabsContainer.setAttribute(
      "aria-label",
      "Choose project"
    );

    const tabs = [];

    slides.forEach((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pc-tab";

      const number = document.createElement("span");
      number.className = "pc-tab-number";
      number.textContent = String(index + 1).padStart(
        2,
        "0"
      );

      const label = document.createElement("span");
      label.className = "pc-tab-label";

      const originalTitle = Array.from(
        slide.children
      ).find(el => el.matches("h3"));

      const fallback = originalTitle
        ? originalTitle.textContent
            .replace(/\bAnalysis\b/gi, "")
            .replace(/\s+/g, " ")
            .trim()
        : `Project ${index + 1}`;

      label.textContent = names[index] || fallback;

      button.append(number, label);

      button.addEventListener("click", () => {
        clearPreview();
        goTo(index);
      });

      button.addEventListener("pointerenter", event => {
        if (event.pointerType === "touch") return;
        preview(index);
      });

      button.addEventListener("focus", () => {
        preview(index);
      });

      button.addEventListener("blur", clearPreview);

      tabsContainer.appendChild(button);
      tabs.push(button);
    });

    const hint = document.createElement("p");
    hint.className = "pc-hint";
    hint.textContent =
      "Drag left or right to view other projects";

    navigation.append(tabsContainer, hint);
    wrapper.appendChild(navigation);

    function preview(index) {
      if (index === activeIndex) {
        clearPreview();
        return;
      }

      tabsContainer.classList.add("has-preview");

      tabs.forEach((tab, i) => {
        tab.classList.toggle(
          "is-preview",
          i === index
        );
      });
    }

    function clearPreview() {
      tabsContainer.classList.remove(
        "has-preview"
      );

      tabs.forEach(tab => {
        tab.classList.remove("is-preview");
      });
    }

    tabsContainer.addEventListener(
      "pointerleave",
      clearPreview
    );

    /* ================================================
       POSITION CALCULATION

       Stable even after viewport resize.
       ================================================ */

    function getPosition(index) {
      const slide = slides[index];

      const trackRect = track.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();

      const raw =
        track.scrollLeft +
        slideRect.left -
        trackRect.left +
        slideRect.width / 2 -
        track.clientWidth / 2;

      const maximum = Math.max(
        0,
        track.scrollWidth - track.clientWidth
      );

      return Math.max(
        0,
        Math.min(raw, maximum)
      );
    }

    function nearestIndex() {
      let nearest = 0;
      let shortest = Infinity;

      slides.forEach((slide, index) => {
        const delta = Math.abs(
          getPosition(index) - track.scrollLeft
        );

        if (delta < shortest) {
          shortest = delta;
          nearest = index;
        }
      });

      return nearest;
    }

    /* ================================================
       ACTIVE CARD
       ================================================ */

    function setActive(index) {
      activeIndex = Math.max(
        0,
        Math.min(index, slides.length - 1)
      );

      slides.forEach((slide, i) => {
        const active = i === activeIndex;

        slide.classList.toggle(
          "pc-active",
          active
        );

        slide.classList.toggle(
          "pc-before",
          i < activeIndex
        );

        slide.classList.toggle(
          "pc-after",
          i > activeIndex
        );

        /* Never disable the clickable previews */
        slide.inert = false;
      });

      tabs.forEach((tab, i) => {
        const active = i === activeIndex;

        tab.classList.toggle(
          "is-active",
          active
        );

        tab.setAttribute(
          "aria-pressed",
          String(active)
        );
      });
    }

    /* ================================================
       SMOOTH ANIMATION
       ================================================ */

    function cancelAnimation() {
      animationToken++;
      cancelAnimationFrame(animationFrame);

      animating = false;
      track.classList.remove("is-animating");

      track.style.scrollSnapType = "none";
    }

    function easeInOut(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function goTo(index, smooth = true) {
      const next = Math.max(
        0,
        Math.min(index, slides.length - 1)
      );

      cancelAnimation();

      selectedIndex = next;
      const currentToken = animationToken;

      const from = track.scrollLeft;
      const to = getPosition(next);

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (
        !smooth ||
        reducedMotion ||
        Math.abs(to - from) < 1
      ) {
        track.scrollLeft = to;
        setActive(next);
        track.style.scrollSnapType = "";
        return;
      }

      animating = true;
      track.classList.add("is-animating");

      const duration = Math.min(
        500,
        Math.max(300, Math.abs(to - from) * 0.35)
      );

      let startTime = null;

      function animate(time) {
        if (currentToken !== animationToken) return;

        if (startTime === null) {
          startTime = time;
        }

        const progress = Math.min(
          (time - startTime) / duration,
          1
        );

        track.scrollLeft =
          from + (to - from) * easeInOut(progress);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
          return;
        }

        track.scrollLeft = to;

        animating = false;
        track.classList.remove("is-animating");

        setActive(next);
        track.style.scrollSnapType = "";
      }

      animationFrame = requestAnimationFrame(animate);
    }

    /* ================================================
       CLICK SIDE CARD

       Event delegation means clicking the card,
       its text, or empty space works.
       ================================================ */

    function onCardClick(event) {
      if (suppressNextClick) {
        suppressNextClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const slide = event.target.closest(".project-tile");

      if (!slide || !track.contains(slide)) return;

      const index = slides.indexOf(slide);
      if (index === -1) return;

      /* Active card keeps its normal link actions */
      if (index === activeIndex) return;

      event.preventDefault();
      event.stopPropagation();

      clearPreview();
      goTo(index);
    }

    track.addEventListener(
      "click",
      onCardClick,
      true
    );

    /* ================================================
       MOUSE DRAG

       Do not capture pointer until actual dragging.
       This preserves normal card clicks.
       ================================================ */

    function pointerDown(event) {
      if (event.pointerType !== "mouse") return;
      if (event.button !== 0) return;

      if (
        event.target.closest(
          "a, button, input, textarea, select, iframe"
        ) &&
        event.target.closest(
          ".project-tile.pc-active"
        )
      ) {
        return;
      }

      dragCandidate = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        scroll: track.scrollLeft,
        index: nearestIndex()
      };

      dragging = false;
      suppressNextClick = false;
    }

    function pointerMove(event) {
      if (!dragCandidate) return;

      if (
        event.pointerId !== dragCandidate.pointerId
      ) {
        return;
      }

      const dx = event.clientX - dragCandidate.x;
      const dy = event.clientY - dragCandidate.y;

      if (!dragging) {
        if (
          Math.abs(dx) < DRAG_THRESHOLD &&
          Math.abs(dy) < DRAG_THRESHOLD
        ) {
          return;
        }

        /* Vertical scrolling should remain native */
        if (Math.abs(dy) > Math.abs(dx)) {
          dragCandidate = null;
          return;
        }

        cancelAnimation();

        dragging = true;
        track.classList.add("is-dragging");

        try {
          track.setPointerCapture(event.pointerId);
        } catch (_) {
          /* Capture is optional */
        }
      }

      track.scrollLeft =
        dragCandidate.scroll - dx;
    }

    function pointerUp(event) {
      if (!dragCandidate) return;

      if (
        event.pointerId !== dragCandidate.pointerId
      ) {
        return;
      }

      const start = dragCandidate;
      const dx = event.clientX - start.x;
      const wasDragging = dragging;

      dragCandidate = null;
      dragging = false;

      track.classList.remove("is-dragging");

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }

      /* A simple click should be handled by onCardClick */
      if (!wasDragging) return;

      suppressNextClick = true;

      let next = nearestIndex();

      if (Math.abs(dx) > 60) {
        next = dx < 0
          ? Math.min(
              slides.length - 1,
              start.index + 1
            )
          : Math.max(
              0,
              start.index - 1
            );
      }

      goTo(next);

      /* Clear suppression if browser does not
         emit a click after pointerup */
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 0);
    }

    function pointerCancel(event) {
      if (!dragCandidate) return;

      if (
        event.pointerId !== dragCandidate.pointerId
      ) {
        return;
      }

      dragCandidate = null;
      dragging = false;
      track.classList.remove("is-dragging");

      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    }

    track.addEventListener(
      "pointerdown",
      pointerDown
    );

    track.addEventListener(
      "pointermove",
      pointerMove
    );

    track.addEventListener(
      "pointerup",
      pointerUp
    );

    track.addEventListener(
      "pointercancel",
      pointerCancel
    );

    /* ================================================
       TOUCHPAD / NATIVE HORIZONTAL SCROLL

       On native scrolling, settle on the nearest card.
       ================================================ */

    function onScroll() {
      if (dragging || animating) return;

      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(() => {
        if (dragging || animating) return;

        const next = nearestIndex();

        if (
          Math.abs(
            getPosition(next) - track.scrollLeft
          ) > 2
        ) {
          goTo(next);
        } else {
          setActive(next);
        }
      }, 140);
    }

    track.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    /* ================================================
       KEYBOARD
       ================================================ */

    function onKeyDown(event) {
      if (
        event.target.closest(
          "a, button, input, textarea, select"
        )
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          goTo(selectedIndex + 1);
          break;

        case "ArrowLeft":
          event.preventDefault();
          goTo(selectedIndex - 1);
          break;

        case "Home":
          event.preventDefault();
          goTo(0);
          break;

        case "End":
          event.preventDefault();
          goTo(slides.length - 1);
          break;
      }
    }

    track.addEventListener(
      "keydown",
      onKeyDown
    );

    /* ================================================
       RESIZE
       ================================================ */

    function onResize() {
      cancelAnimationFrame(resizeFrame);

      resizeFrame = requestAnimationFrame(() => {
        if (desktop.matches) {
          goTo(activeIndex, false);
        }
      });
    }

    window.addEventListener(
      "resize",
      onResize
    );

    /* ================================================
       INITIAL POSITION
       ================================================ */

    setActive(0);

    initialFrame = requestAnimationFrame(() => {
      goTo(0, false);
    });

    /* ================================================
       CLEANUP
       ================================================ */

    function destroy() {
      cancelAnimation();
      clearTimeout(scrollTimer);

      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(initialFrame);

      window.removeEventListener(
        "resize",
        onResize
      );

      track.removeEventListener(
        "click",
        onCardClick,
        true
      );

      track.removeEventListener(
        "pointerdown",
        pointerDown
      );

      track.removeEventListener(
        "pointermove",
        pointerMove
      );

      track.removeEventListener(
        "pointerup",
        pointerUp
      );

      track.removeEventListener(
        "pointercancel",
        pointerCancel
      );

      track.removeEventListener(
        "scroll",
        onScroll
      );

      track.removeEventListener(
        "keydown",
        onKeyDown
      );

      slides.forEach(slide => {
        slide.querySelector(
          ":scope > .pc-slide-header"
        )?.remove();

        slide.classList.remove(
          "pc-ready",
          "pc-active",
          "pc-before",
          "pc-after"
        );

        slide.inert = false;
      });

      track.style.scrollSnapType = "";

      wrapper.before(track);
      wrapper.remove();

      track.removeAttribute("role");
      track.removeAttribute(
        "aria-roledescription"
      );
      track.removeAttribute("aria-label");

      if (originalTabindex === null) {
        track.removeAttribute("tabindex");
      } else {
        track.setAttribute(
          "tabindex",
          originalTabindex
        );
      }

      instance = null;
    }

    instance = {
      track,
      destroy
    };

    return true;
  }

  /* ================================================
     DYNAMIC APP LOADER
     ================================================ */

  function check() {
    const track = document.querySelector(
      "#projects .projects-static"
    );

    if (!desktop.matches) {
      if (instance) instance.destroy();
      return;
    }

    normalizeModal();

    if (instance?.track === track) return;

    if (instance) instance.destroy();

    initialize();
  }

  function scheduleCheck() {
    if (checkQueued) return;

    checkQueued = true;

    requestAnimationFrame(() => {
      checkQueued = false;
      check();
    });
  }

  function start() {
    check();

    const root =
      document.getElementById("main-root") ||
      document.body;

    observer = new MutationObserver(scheduleCheck);

    observer.observe(root, {
      childList: true,
      subtree: true
    });

    window.addEventListener(
      "resize",
      scheduleCheck
    );

    desktop.addEventListener(
      "change",
      scheduleCheck
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }
})();
