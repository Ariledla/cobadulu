/* =========================================================
   APP
   Modular loader
   Always starts from HOME on initial load
   ========================================================= */

(() => {


  /* =====================================================
     01. DISABLE BROWSER SCROLL RESTORATION
     ===================================================== */

  if ("scrollRestoration" in history) {

    history.scrollRestoration =
      "manual";

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
      id: "dashboards",
      file: "sections/dashboards.html"
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

    window.scrollTo(
      0,
      0
    );


    document.documentElement.scrollTop =
      0;


    document.body.scrollTop =
      0;

  }


  /*
     Jalankan sebelum loading selesai.
  */

  forceHome();


  /* =====================================================
     05. FETCH HTML
     ===================================================== */

  async function getHTML(path) {

    const separator =
      path.includes("?")
        ? "&"
        : "?";


    const response =
      await fetch(
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

  function extractSection(
    html,
    expectedId
  ) {

    const template =
      document.createElement(
        "template"
      );


    template.innerHTML =
      html.trim();


    const section =
      template.content.querySelector(
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
     ===================================================== */

  function initProjects() {

    const projectsSection =
      document.getElementById(
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


    /* =================================================
       REMOVE OLD MODAL IF INIT RUNS AGAIN
       ================================================= */

    document
      .querySelector(
        ".case-study-modal"
      )
      ?.remove();


    /* =================================================
       CREATE MODAL
       ================================================= */

    const modal =
      document.createElement(
        "div"
      );


    modal.className =
      "case-study-modal";


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
        >
          ×
        </button>


        <div class="case-study-content">

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    /* =================================================
       ELEMENTS
       ================================================= */

    const backdrop =
      modal.querySelector(
        ".case-study-backdrop"
      );


    const panel =
      modal.querySelector(
        ".case-study-panel"
      );


    const closeButton =
      modal.querySelector(
        ".case-study-close"
      );


    const content =
      modal.querySelector(
        ".case-study-content"
      );


    /* =================================================
       REMOVE ARROW FROM LINKS
       ================================================= */

    caseStudyLinks.forEach(
      link => {

        const arrow =
          link.querySelector(
            "span"
          );


        if (arrow) {

          arrow.remove();

        }

      }
    );


    /* =================================================
       OPEN MODAL
       ================================================= */

    function openCaseStudy(link) {

      /*
         Optional:
         detect project title so later
         each modal can contain different content.
      */

      const card =
        link.closest(
          ".project-tile"
        );


      const projectTitle =
        card
          ?.querySelector("h3")
          ?.textContent
          ?.trim() ||
        "Project Case Study";


      /*
         For now user requested blank/plain card.

         We still store project title internally
         for future case study content.
      */

      modal.dataset.projectTitle =
        projectTitle;


      /*
         Keep content blank.
      */

      if (content) {

        content.innerHTML = "";

      }


      modal.classList.add(
        "is-open"
      );


      modal.setAttribute(
        "aria-hidden",
        "false"
      );


      /*
         Prevent page scrolling while modal is open.
      */

      document.documentElement.classList.add(
        "modal-open"
      );


      document.body.classList.add(
        "modal-open"
      );


      /*
         Move keyboard focus to close button.
      */

      window.setTimeout(
        () => {

          closeButton?.focus();

        },
        50
      );

    }


    /* =================================================
       CLOSE MODAL
       ================================================= */

    function closeCaseStudy() {

      modal.classList.remove(
        "is-open"
      );


      modal.setAttribute(
        "aria-hidden",
        "true"
      );


      document.documentElement.classList.remove(
        "modal-open"
      );


      document.body.classList.remove(
        "modal-open"
      );

    }


    /* =================================================
       VIEW CASE STUDY CLICK
       ================================================= */

    caseStudyLinks.forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            event.preventDefault();


            openCaseStudy(
              link
            );

          }
        );

      }
    );


    /* =================================================
       CLOSE BUTTON
       ================================================= */

    closeButton?.addEventListener(
      "click",
      () => {

        closeCaseStudy();

      }
    );


    /* =================================================
       CLICK DARK BACKDROP TO CLOSE
       ================================================= */

    backdrop?.addEventListener(
      "click",
      () => {

        closeCaseStudy();

      }
    );


    /* =================================================
       CLICK OUTSIDE PANEL
       EXTRA SAFETY
       ================================================= */

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          closeCaseStudy();

        }

      }
    );


    /* =================================================
       ESCAPE TO CLOSE
       ================================================= */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key !== "Escape"
        ) {

          return;

        }


        if (
          !modal.classList.contains(
            "is-open"
          )
        ) {

          return;

        }


        closeCaseStudy();

      }
    );


    /* =================================================
       PREVENT PANEL CLICK FROM CLOSING
       ================================================= */

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

    const navbarRoot =
      document.getElementById(
        "navbar-root"
      );


    const mainRoot =
      document.getElementById(
        "main-root"
      );


    const footerRoot =
      document.getElementById(
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


    /*
       Pastikan initial position tetap HOME.
    */

    forceHome();


    try {


      /* =================================================
         LOAD EVERYTHING
         ================================================= */

      const navbarPromise =
        getHTML(
          "components/navbar.html"
        );


      const footerPromise =
        getHTML(
          "components/footer.html"
        );


      const sectionPromises =
        sectionFiles.map(
          async ({
            id,
            file
          }) => {

            const html =
              await getHTML(
                file
              );


            return extractSection(
              html,
              id
            );

          }
        );


      const [
        navbarHTML,
        sectionHTML,
        footerHTML
      ] =
        await Promise.all([

          navbarPromise,

          Promise.all(
            sectionPromises
          ),

          footerPromise

        ]);


      /* =================================================
         MOUNT
         ================================================= */

      navbarRoot.innerHTML =
        navbarHTML.trim();


      mainRoot.innerHTML =
        sectionHTML.join(
          "\n"
        );


      footerRoot.innerHTML =
        footerHTML.trim();


      /* =================================================
         VERIFY SECTIONS
         ================================================= */

      console.log(
        "Mounted sections:",
        sectionFiles
          .map(
            ({ id }) => id
          )
          .filter(
            id =>
              document.getElementById(
                id
              )
          )
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
         RETURN HOME AFTER MOUNT
         ================================================= */

      forceHome();


      /* =================================================
         INIT FEATURES
         ================================================= */

      requestAnimationFrame(
        () => {

          forceHome();


          /* NAVBAR */

          window.initNavbar?.();


          /* PROJECTS */

          initProjects();


          /* DASHBOARDS */

          window.initDashboards?.();


          /* FAQ */

          window.initFaq?.();


          /* CONTACT */

          window.initContact?.();


          /* FOOTER */

          window.initFooter?.();


          requestAnimationFrame(
            () => {

              /*
                 Browser selesai reflow.
              */

              forceHome();


              document.documentElement
                .classList
                .add(
                  "app-ready"
                );

            }
          );

        }
      );


      /* =================================================
         SCROLL RESTORE GUARD
         ================================================= */

      window.setTimeout(
        forceHome,
        50
      );


      window.setTimeout(
        forceHome,
        150
      );


      window.setTimeout(
        forceHome,
        300
      );


      window.setTimeout(
        forceHome,
        600
      );


    }

    catch (error) {

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

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initApp,
      {
        once: true
      }
    );

  }

  else {

    initApp();

  }


})();