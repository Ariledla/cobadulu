
/* =========================================================
   UDIN SAIPUDIN — DATA ANALYSIS PORTFOLIO
   NAVBAR — FINAL SECTION POSITIONING

   SECTIONS:
   01. HOME
   02. ABOUT
   03. PROJECTS
   04. FAQ
   05. CONTACT

   Dashboard Gallery removed.

   Preserved visual positions:
   ABOUT    = 163px
   PROJECTS = 190px
   FAQ      = 155px
   CONTACT  = bottom of page
   ========================================================= */

(() => {
  "use strict";

  /* =====================================================
     01. SECTION IDS
     ===================================================== */

  const SECTION_IDS = [
    "home",
    "about",
    "projects",
    "faq",
    "contact"
  ];

  /* =====================================================
     02. VISUAL POSITION CONFIGURATION
     ===================================================== */

  const SECTION_VIEW = {
    about: {
      selectors: [
        ".about-name",
        ".intro-block .about-name",
        "h1"
      ],
      top: 163
    },

    projects: {
      selectors: [
        ".projects-title",
        ".projects-heading h2",
        ".project-heading h2",
        ".section-title",
        "h1",
        "h2"
      ],
      top: 190
    },

    faq: {
      selectors: [
        ".faq-heading h2",
        ".faq-heading",
        "h2"
      ],
      top: 155
    }
  };

  /* =====================================================
     03. STATE
     ===================================================== */

  let scrollRAF = null;

  let navigationLocked = false;

  let navigationUnlockTimer = null;

  let settleTimer1 = null;
  let settleTimer2 = null;
  let settleTimer3 = null;

  let initializedRoot = null;

  /* =====================================================
     04. NAVBAR ROOT
     ===================================================== */

  function getNavbarRoot() {
    return document.getElementById(
      "navbar-root"
    );
  }

  /* =====================================================
     05. NAVBAR ELEMENT
     ===================================================== */

  function getNavbarElement() {
    const root = getNavbarRoot();

    if (!root) {
      return null;
    }

    return (
      root.querySelector("nav") ||
      root.querySelector(".navbar") ||
      root.querySelector(".nav-shell") ||
      root.querySelector(".navbar-shell") ||
      root.querySelector(".nav-container") ||
      root.firstElementChild
    );
  }

  /* =====================================================
     06. DOCUMENT HEIGHT
     ===================================================== */

  function getDocumentHeight() {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.body.clientHeight
    );
  }

  /* =====================================================
     07. MAXIMUM SCROLL
     ===================================================== */

  function getMaximumScrollTop() {
    return Math.max(
      0,
      getDocumentHeight() - window.innerHeight
    );
  }

  /* =====================================================
     08. ABSOLUTE ELEMENT TOP
     ===================================================== */

  function getAbsoluteTop(element) {
    if (!element) {
      return 0;
    }

    const rect = element.getBoundingClientRect();

    return window.scrollY + rect.top;
  }

  /* =====================================================
     09. CLAMP SCROLL
     ===================================================== */

  function clampScroll(value) {
    return Math.min(
      Math.max(0, Math.round(value)),
      getMaximumScrollTop()
    );
  }

  /* =====================================================
     10. FIND VISUAL ANCHOR
     ===================================================== */

  function findAnchor(section, selectors) {
    if (!section || !selectors) {
      return section;
    }

    for (const selector of selectors) {
      const element = section.querySelector(selector);

      if (element) {
        return element;
      }
    }

    return section;
  }

  /* =====================================================
     11. VISUAL SECTION DESTINATION
     ===================================================== */

  function getVisualDestination(targetId) {
    const section = document.getElementById(
      targetId
    );

    if (!section) {
      return null;
    }

    const config = SECTION_VIEW[targetId];

    if (!config) {
      return clampScroll(
        getAbsoluteTop(section)
      );
    }

    const anchor = findAnchor(
      section,
      config.selectors
    );

    const anchorTop = getAbsoluteTop(anchor);

    return clampScroll(
      anchorTop - config.top
    );
  }

  /* =====================================================
     12. GET DESTINATION
     ===================================================== */

  function getDestination(targetId) {
    if (targetId === "home") {
      return 0;
    }

    if (targetId === "contact") {
      return getMaximumScrollTop();
    }

    return getVisualDestination(targetId);
  }

  /* =====================================================
     13. ACTIVE LINK
     ===================================================== */

  function setActiveLink(targetId) {
    const root = getNavbarRoot();

    if (!root) {
      return;
    }

    const links = root.querySelectorAll(
      'a[href^="#"]'
    );

    links.forEach(link => {
      const href = link.getAttribute("href");

      const active = href === `#${targetId}`;

      link.classList.toggle(
        "active",
        active
      );

      link.classList.toggle(
        "is-active",
        active
      );

      if (active) {
        link.setAttribute(
          "aria-current",
          "page"
        );
      } else {
        link.removeAttribute(
          "aria-current"
        );
      }
    });
  }

  /* =====================================================
     14. CLEAR SETTLE TIMERS
     ===================================================== */

  function clearSettleTimers() {
    if (settleTimer1) {
      clearTimeout(settleTimer1);
      settleTimer1 = null;
    }

    if (settleTimer2) {
      clearTimeout(settleTimer2);
      settleTimer2 = null;
    }

    if (settleTimer3) {
      clearTimeout(settleTimer3);
      settleTimer3 = null;
    }
  }

  /* =====================================================
     15. EXACT POSITION CORRECTION
     ===================================================== */

  function settlePosition(targetId) {
    const destination = getDestination(
      targetId
    );

    if (destination === null) {
      return;
    }

    const difference = Math.abs(
      window.scrollY - destination
    );

    if (difference <= 2) {
      return;
    }

    window.scrollTo({
      top: destination,
      left: 0,
      behavior: "auto"
    });
  }

  /* =====================================================
     16. SMOOTH SCROLL
     ===================================================== */

  function scrollToTarget(targetId) {
    const destination = getDestination(
      targetId
    );

    if (destination === null) {
      console.warn(
        `Navigation target #${targetId} not found.`
      );

      return;
    }

    clearSettleTimers();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: destination,
      left: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });

    /* FIRST CORRECTION */

    settleTimer1 = window.setTimeout(
      () => {
        settlePosition(targetId);
      },
      550
    );

    /* SECOND CORRECTION */

    settleTimer2 = window.setTimeout(
      () => {
        settlePosition(targetId);
      },
      800
    );

    /* FINAL CORRECTION */

    settleTimer3 = window.setTimeout(
      () => {
        settlePosition(targetId);
      },
      1100
    );
  }

  /* =====================================================
     17. LOCK ACTIVE STATE WHILE NAVIGATING
     ===================================================== */

  function lockNavigation() {
    navigationLocked = true;

    if (navigationUnlockTimer) {
      clearTimeout(
        navigationUnlockTimer
      );
    }

    navigationUnlockTimer = window.setTimeout(
      () => {
        navigationLocked = false;
        updateActiveSection();
      },
      1200
    );
  }

  /* =====================================================
     18. NAVIGATE TO SECTION
     ===================================================== */

  function navigateTo(targetId) {
    if (!SECTION_IDS.includes(targetId)) {
      return;
    }

    if (!document.getElementById(targetId)) {
      console.warn(
        `Navigation target #${targetId} not found.`
      );

      return;
    }

    setActiveLink(targetId);

    lockNavigation();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToTarget(targetId);
      });
    });
  }

  /* =====================================================
     19. HANDLE NAV CLICK
     ===================================================== */

  function handleNavClick(event) {
    const link = event.currentTarget;

    const href = link.getAttribute(
      "href"
    );

    if (!href || !href.startsWith("#")) {
      return;
    }

    const targetId = href.substring(1);

    if (!SECTION_IDS.includes(targetId)) {
      return;
    }

    event.preventDefault();

    navigateTo(targetId);
  }

  /* =====================================================
     20. NAVBAR REFERENCE LINE
     ===================================================== */

  function getReferenceLine() {
    const navbar = getNavbarElement();

    if (!navbar) {
      return 130;
    }

    const rect = navbar.getBoundingClientRect();

    return Math.max(
      100,
      rect.bottom + 25
    );
  }

  /* =====================================================
     21. ACTIVE SECTION DURING MANUAL SCROLL
     ===================================================== */

  function updateActiveSection() {
    if (navigationLocked) {
      return;
    }

    const currentScroll = window.scrollY;

    const maximumScroll = getMaximumScrollTop();

    /* HOME */

    if (currentScroll <= 25) {
      setActiveLink("home");
      return;
    }

    /* CONTACT */

    if (maximumScroll - currentScroll <= 80) {
      setActiveLink("contact");
      return;
    }

    /* OTHER SECTIONS */

    const referenceLine = getReferenceLine();

    let activeId = "home";

    SECTION_IDS.forEach(id => {
      const section = document.getElementById(
        id
      );

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();

      if (rect.top <= referenceLine) {
        activeId = id;
      }
    });

    setActiveLink(activeId);
  }

  /* =====================================================
     22. WINDOW SCROLL HANDLER
     ===================================================== */

  function handleWindowScroll() {
    if (scrollRAF !== null) {
      cancelAnimationFrame(
        scrollRAF
      );
    }

    scrollRAF = requestAnimationFrame(() => {
      scrollRAF = null;
      updateActiveSection();
    });
  }

  /* =====================================================
     23. RESIZE HANDLER
     ===================================================== */

  function handleWindowResize() {
    if (!navigationLocked) {
      updateActiveSection();
    }
  }

  /* =====================================================
     24. INIT NAVBAR
     ===================================================== */

  function initNavbar() {
    const root = getNavbarRoot();

    if (!root) {
      return;
    }

    const links = root.querySelectorAll(
      'a[href^="#"]'
    );

    if (!links.length) {
      return;
    }

    /*
       Avoid listener duplication even if
       initNavbar() runs more than once.
    */

    if (initializedRoot === root) {
      return;
    }

    initializedRoot = root;

    /* NAVIGATION LINKS */

    links.forEach(link => {
      const href = link.getAttribute(
        "href"
      );

      if (!href || !href.startsWith("#")) {
        return;
      }

      const targetId = href.substring(1);

      if (!SECTION_IDS.includes(targetId)) {
        return;
      }

      link.addEventListener(
        "click",
        handleNavClick
      );
    });

    /* MANUAL SCROLL */

    window.addEventListener(
      "scroll",
      handleWindowScroll,
      { passive: true }
    );

    /* RESIZE */

    window.addEventListener(
      "resize",
      handleWindowResize,
      { passive: true }
    );

    root.dataset.navbarInitialized = "true";

    setActiveLink("home");

    console.log(
      "Navbar visual navigation ready."
    );
  }

  /* =====================================================
     25. EXPOSE TO APP
     ===================================================== */

  window.initNavbar = initNavbar;

  /* =====================================================
     26. GLOBAL PROGRAMMATIC NAVIGATION
     ===================================================== */

  window.portfolioNavigate = function(targetId) {
    navigateTo(targetId);
  };

})();
