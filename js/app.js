
/* =========================================================
   UDIN SAIPUDIN — DATA ANALYSIS PORTFOLIO
   APP.JS — MODULAR LOADER

   Sections:
   01. Home
   02. About
   03. Projects
   04. FAQ
   05. Contact

   Dashboard Gallery removed.
   Always starts from Home on initial load.
   ========================================================= */

(() => {
  "use strict";

  /* =====================================================
     01. DISABLE BROWSER SCROLL RESTORATION
     ===================================================== */

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  /* =====================================================
     02. REMOVE OLD HASH
     ===================================================== */

  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname +
      window.location.search
    );
  }

  /* =====================================================
     03. SECTION FILES

     Dashboard Gallery has been removed.
     ===================================================== */

  const sectionFiles = [
    {
      id: "home",
      file: "sections/home.html"
    },
    {
      id: "about",
      file: "sections/about.html"
    },
    {
      id: "projects",
      file: "sections/projects.html"
    },
    {
      id: "faq",
      file: "sections/faq5.html"
    },
    {
      id: "contact",
      file: "sections/contact.html"
    }
  ];

  /* =====================================================
     04. FORCE HOME POSITION
     ===================================================== */

  function forceHome() {
    window.scrollTo(0, 0);

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  forceHome();

  /* =====================================================
     05. FETCH HTML
     ===================================================== */

  async function getHTML(path) {
    const separator = path.includes("?") ? "&" : "?";

    const response = await fetch(
      `${path}${separator}v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cannot load ${path} — ${response.status}`
      );
    }

    return response.text();
  }

  /* =====================================================
     06. EXTRACT SECTION
     ===================================================== */

  function extractSection(html, expectedId) {
    const template = document.createElement("template");

    template.innerHTML = html.trim();

    const section = template.content.querySelector(
      `section#${expectedId}`
    );

    if (!section) {
      throw new Error(
        `section#${expectedId} not found`
      );
    }

    return section.outerHTML;
  }

  /* =====================================================
     07. PROJECT CASE STUDY MODAL

     Preserves the existing blank modal.
     Does not interfere with Projects Carousel.
     ===================================================== */

  function initProjects() {
    const projectsSection = document.getElementById(
      "projects"
    );

    if (!projectsSection) {
      return;
    }

    const caseStudyLinks =
      projectsSection.querySelectorAll(
        ".project-link"
      );

    if (!caseStudyLinks.length) {
      return;
    }

    /* Remove previous modal if reinitialized */

    document.querySelector(
      ".case-study-modal"
    )?.remove();

    /* Create modal */

    const modal = document.createElement("div");

    modal.className = "case-study-modal";

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    modal.innerHTML = `
      <div
        class="case-study-backdrop"
        aria-hidden="true"
      ></div>

      <div
        class="case-study-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Project case study"
      >

        <button
          class="case-study-close"
          type="button"
          aria-label="Close case study"
        ></button>

        <div class="case-study-content"></div>

      </div>
    `;

    document.body.appendChild(modal);

    /* Modal elements */

    const backdrop = modal.querySelector(
      ".case-study-backdrop"
    );

    const panel = modal.querySelector(
      ".case-study-panel"
    );

    const closeButton = modal.querySelector(
      ".case-study-close"
    );

    const content = modal.querySelector(
      ".case-study-content"
    );

    let previousFocus = null;

    /* Remove existing arrows from Case Study links */

    caseStudyLinks.forEach(link => {
      const arrow = link.querySelector("span");

      if (arrow) {
        arrow.remove();
      }
    });

    /* =================================================
       OPEN CASE STUDY
       ================================================= */

    function openCaseStudy(link) {
      const card = link.closest(".project-tile");

      const projectTitle =
        card?.querySelector(
          ".pc-slide-title"
        )?.textContent?.trim() ||
        card?.querySelector(
          "h3"
        )?.textContent?.trim() ||
        "Project Case Study";

      modal.dataset.projectTitle = projectTitle;

      /* Keep popup content blank as in original */

      if (content) {
        content.innerHTML = "";
      }

      previousFocus = document.activeElement;

      modal.classList.add("is-open");

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.documentElement.classList.add(
        "modal-open",
        "case-study-open"
      );

      document.body.classList.add(
        "modal-open",
        "case-study-open"
      );

      closeButton?.focus();
    }

    /* =================================================
       CLOSE CASE STUDY
       ================================================= */

    function closeCaseStudy() {
      if (!modal.classList.contains("is-open")) {
        return;
      }

      modal.classList.remove("is-open");

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      document.documentElement.classList.remove(
        "modal-open",
        "case-study-open"
      );

      document.body.classList.remove(
        "modal-open",
        "case-study-open"
      );

      if (
        previousFocus &&
        typeof previousFocus.focus === "function"
      ) {
        previousFocus.focus();
      }
    }

    /* =================================================
       CASE STUDY LINK CLICK
       ================================================= */

    caseStudyLinks.forEach(link => {
      link.addEventListener(
        "click",
        event => {
          event.preventDefault();

          openCaseStudy(link);
        }
      );
    });

    /* =================================================
       CLOSE BUTTON
       ================================================= */

    closeButton?.addEventListener(
      "click",
      closeCaseStudy
    );

    /* =================================================
       CLICK BACKDROP
       ================================================= */

    backdrop?.addEventListener(
      "click",
      closeCaseStudy
    );

    /* =================================================
       CLICK OUTSIDE PANEL
       ================================================= */

    modal.addEventListener(
      "click",
      event => {
        if (event.target === modal) {
          closeCaseStudy();
        }
      }
    );

    /* =================================================
       ESCAPE KEY AND FOCUS MANAGEMENT
       ================================================= */

    modal.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape") {
          event.preventDefault();

          closeCaseStudy();
          return;
        }

        if (event.key !== "Tab") {
          return;
        }

        const focusable = Array.from(
          modal.querySelectorAll(
            "button:not([disabled]), a[href], " +
            "input:not([disabled]), " +
            "textarea:not([disabled]), " +
            "select:not([disabled]), " +
            '[tabindex]:not([tabindex="-1"])'
          )
        ).filter(element => {
          return element.getClientRects().length > 0;
        });

        if (!focusable.length) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    );

    /* Prevent click propagation from modal panel */

    panel?.addEventListener(
      "click",
      event => {
        event.stopPropagation();
      }
    );

    console.log(
      "PROJECTS:",
      caseStudyLinks.length,
      "case study links initialized"
    );
  }

  /* =====================================================
     08. INIT APP
     ===================================================== */

  async function initApp() {
    const navbarRoot = document.getElementById(
      "navbar-root"
    );

    const mainRoot = document.getElementById(
      "main-root"
    );

    const footerRoot = document.getElementById(
      "footer-root"
    );

    if (
      !navbarRoot ||
      !mainRoot ||
      !footerRoot
    ) {
      console.error(
        "Portfolio root elements missing."
      );

      return;
    }

    forceHome();

    try {
      /* =================================================
         LOAD COMPONENTS AND SECTIONS
         ================================================= */

      const navbarPromise = getHTML(
        "components/navbar.html"
      );

      const footerPromise = getHTML(
        "components/footer.html"
      );

      const sectionPromises = sectionFiles.map(
        async ({ id, file }) => {
          const html = await getHTML(file);

          return extractSection(html, id);
        }
      );

      const [
        navbarHTML,
        sectionHTML,
        footerHTML
      ] = await Promise.all([
        navbarPromise,
        Promise.all(sectionPromises),
        footerPromise
      ]);

      /* =================================================
         MOUNT CONTENT
         ================================================= */

      navbarRoot.innerHTML = navbarHTML.trim();

      mainRoot.innerHTML = sectionHTML.join("\n");

      footerRoot.innerHTML = footerHTML.trim();

      /* =================================================
         VERIFY SECTIONS
         ================================================= */

      console.log(
        "Mounted sections:",
        sectionFiles
          .map(({ id }) => id)
          .filter(id => document.getElementById(id))
      );

      console.log(
        "FAQ DOM:",
        document.querySelectorAll(
          "#faq .faq-item"
        ).length
      );

      console.log(
        "CONTACT DOM:",
        document.querySelectorAll(
          "#contact .contact-item"
        ).length
      );

      console.log(
        "PROJECT DOM:",
        document.querySelectorAll(
          "#projects .project-tile"
        ).length
      );

      /* =================================================
         INITIALIZE FEATURES
         ================================================= */

      forceHome();

      requestAnimationFrame(() => {
        forceHome();

        /* NAVBAR */

        window.initNavbar?.();

        /* PROJECT MODAL */

        initProjects();

        /*
           Projects Carousel is initialized
           by js/projects-carousel.js.

           Its observer detects the Projects
           section after this app mounts it.
        */

        /* FAQ */

        window.initFaq?.();

        /* CONTACT */

        window.initContact?.();

        /* FOOTER */

        window.initFooter?.();

        requestAnimationFrame(() => {
          forceHome();

          document.documentElement.classList.add(
            "app-ready"
          );
        });
      });

      /* =================================================
         INITIAL SCROLL RESTORE GUARD

         Only runs during initial loading.
         Does not block normal navigation later.
         ================================================= */

      window.setTimeout(forceHome, 50);
      window.setTimeout(forceHome, 150);
      window.setTimeout(forceHome, 300);
      window.setTimeout(forceHome, 600);

    } catch (error) {
      console.error(
        "Portfolio failed to load:",
        error
      );
    }
  }

  /* =====================================================
     09. PAGE SHOW
     ===================================================== */

  window.addEventListener(
    "pageshow",
    () => {
      forceHome();
    }
  );

  /* =====================================================
     10. WINDOW LOAD
     ===================================================== */

  window.addEventListener(
    "load",
    () => {
      forceHome();

      window.setTimeout(
        forceHome,
        100
      );
    }
  );

  /* =====================================================
     11. START
     ===================================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initApp,
      {
        once: true
      }
    );
  } else {
    initApp();
  }

})();
