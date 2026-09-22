/* =========================================================
   NAVBAR — FINAL SECTION POSITIONING
   =========================================================

   TARGET VISUAL:

   HOME
   -> paling atas

   ABOUT
   -> judul "Udin Saipudin." berada pas di bawah navbar

   PROJECTS
   -> "SELECTED WORK" utuh
   -> navbar tidak menutupi judul
   -> section berikutnya tidak terlalu cepat muncul

   DASHBOARDS
   -> "DASHBOARD GALLERY" utuh
   -> label + heading tidak tertutup navbar

   FAQ
   -> "Pertanyaan yang Sering Diajukan" utuh
   -> 5 FAQ terlihat dengan komposisi yang benar

   CONTACT
   -> mentok bawah seperti layout Contact + Footer target

   ========================================================= */

(() => {


  /* =======================================================
     01. SECTION IDS
     ======================================================= */

  const SECTION_IDS = [
    "home",
    "about",
    "projects",
    "dashboards",
    "faq",
    "contact"
  ];



  /* =======================================================
     02. VISUAL POSITION CONFIG

     top = posisi elemen target dari ATAS VIEWPORT.

     Jadi kita tidak lagi bilang:
     "scroll ke awal section"

     Tapi:
     "letakkan JUDUL section pada titik visual ini".
     ======================================================= */

  const SECTION_VIEW = {


    /* -----------------------------------------------------
       ABOUT

       Target:
       Udin Saipudin. mulai sekitar 125px dari viewport.
       ----------------------------------------------------- */

    about: {

      selectors: [
        ".about-name",
        ".intro-block .about-name",
        "h1"
      ],

      top: 163

    },


    /* -----------------------------------------------------
       PROJECTS

       Target screenshot:
       SELECTED WORK agak jauh di bawah navbar.
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       DASHBOARDS

       Target:
       label "SELECTED POWER BI WORK"
       dan DASHBOARD GALLERY tidak ketutup navbar.

       Anchor judul utama ditempatkan sekitar 180px.
       ----------------------------------------------------- */

    dashboards: {

      selectors: [
        ".dashboard-title",
        ".dashboards-title",
        ".dashboard-heading h2",
        ".dashboards-heading h2",
        ".gallery-title",
        "h1",
        "h2"
      ],

      top: 180

    },


    /* -----------------------------------------------------
       FAQ

       Target:
       dua baris judul terlihat FULL.
       ----------------------------------------------------- */

    faq: {

      selectors: [
        ".faq-heading h2",
        ".faq-heading",
        "h2"
      ],

      top: 155

    }

  };



  /* =======================================================
     03. STATE
     ======================================================= */

  let scrollRAF = null;

  let navigationLocked = false;

  let navigationUnlockTimer = null;

  let settleTimer1 = null;

  let settleTimer2 = null;

  let settleTimer3 = null;



  /* =======================================================
     04. NAVBAR ROOT
     ======================================================= */

  function getNavbarRoot() {

    return document.getElementById(
      "navbar-root"
    );

  }



  /* =======================================================
     05. NAVBAR ELEMENT
     ======================================================= */

  function getNavbarElement() {

    const root =
      getNavbarRoot();


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



  /* =======================================================
     06. DOCUMENT HEIGHT
     ======================================================= */

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



  /* =======================================================
     07. MAX SCROLL
     ======================================================= */

  function getMaximumScrollTop() {

    return Math.max(

      0,

      getDocumentHeight() -
      window.innerHeight

    );

  }



  /* =======================================================
     08. ABSOLUTE ELEMENT TOP
     ======================================================= */

  function getAbsoluteTop(
    element
  ) {

    if (!element) {
      return 0;
    }


    const rect =
      element.getBoundingClientRect();


    return (
      window.scrollY +
      rect.top
    );

  }



  /* =======================================================
     09. CLAMP
     ======================================================= */

  function clampScroll(
    value
  ) {

    return Math.min(

      Math.max(
        0,
        Math.round(value)
      ),

      getMaximumScrollTop()

    );

  }



  /* =======================================================
     10. FIND VISUAL ANCHOR

     Cari elemen yang menjadi patokan posisi.
     ======================================================= */

  function findAnchor(
    section,
    selectors
  ) {

    if (
      !section ||
      !selectors
    ) {

      return section;

    }


    for (
      const selector
      of selectors
    ) {

      const element =
        section.querySelector(
          selector
        );


      if (element) {

        return element;

      }

    }


    return section;

  }



  /* =======================================================
     11. CALCULATE NORMAL SECTION DESTINATION

     Rumus:

     absolute anchor Y
     -
     posisi target anchor dalam viewport

     Contoh:
     heading Project ada di Y=2500
     kita ingin tampil di 190px

     scroll = 2500 - 190
     ======================================================= */

  function getVisualDestination(
    targetId
  ) {

    const section =
      document.getElementById(
        targetId
      );


    if (!section) {

      return null;

    }


    const config =
      SECTION_VIEW[targetId];


    /*
       Fallback jika section belum dikonfigurasi.
    */

    if (!config) {

      return clampScroll(
        getAbsoluteTop(
          section
        )
      );

    }


    const anchor =
      findAnchor(
        section,
        config.selectors
      );


    const anchorTop =
      getAbsoluteTop(
        anchor
      );


    return clampScroll(

      anchorTop -
      config.top

    );

  }



  /* =======================================================
     12. GET DESTINATION
     ======================================================= */

  function getDestination(
    targetId
  ) {


    /* -----------------------------------------------------
       HOME
       ----------------------------------------------------- */

    if (
      targetId ===
      "home"
    ) {

      return 0;

    }



    /* -----------------------------------------------------
       CONTACT

       Contact tetap mentok paling bawah.
       ----------------------------------------------------- */

    if (
      targetId ===
      "contact"
    ) {

      return getMaximumScrollTop();

    }



    /* -----------------------------------------------------
       VISUAL SECTION
       ----------------------------------------------------- */

    return getVisualDestination(
      targetId
    );

  }



  /* =======================================================
     13. ACTIVE LINK
     ======================================================= */

  function setActiveLink(
    targetId
  ) {

    const root =
      getNavbarRoot();


    if (!root) {
      return;
    }


    const links =
      root.querySelectorAll(
        'a[href^="#"]'
      );


    links.forEach(
      (link) => {

        const href =
          link.getAttribute(
            "href"
          );


        const active =
          href ===
          `#${targetId}`;


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

        }

        else {

          link.removeAttribute(
            "aria-current"
          );

        }

      }
    );

  }



  /* =======================================================
     14. CLEAR SETTLE TIMERS
     ======================================================= */

  function clearSettleTimers() {

    if (settleTimer1) {

      clearTimeout(
        settleTimer1
      );

      settleTimer1 = null;

    }


    if (settleTimer2) {

      clearTimeout(
        settleTimer2
      );

      settleTimer2 = null;

    }


    if (settleTimer3) {

      clearTimeout(
        settleTimer3
      );

      settleTimer3 = null;

    }

  }



  /* =======================================================
     15. EXACT POSITION CORRECTION

     Setelah smooth scroll selesai,
     hitung ulang.

     Ini penting karena:
     - gambar selesai load
     - font reflow
     - dashboard berubah layout
     - browser rounding
     ======================================================= */

  function settlePosition(
    targetId
  ) {

    const destination =
      getDestination(
        targetId
      );


    if (
      destination === null
    ) {

      return;

    }


    const difference =
      Math.abs(
        window.scrollY -
        destination
      );


    /*
       Jangan sentuh lagi kalau sudah hampir tepat.
    */

    if (
      difference <= 2
    ) {

      return;

    }


    window.scrollTo({

      top:
        destination,

      left:
        0,

      behavior:
        "auto"

    });

  }



  /* =======================================================
     16. SMOOTH SCROLL
     ======================================================= */

  function scrollToTarget(
    targetId
  ) {

    const destination =
      getDestination(
        targetId
      );


    if (
      destination === null
    ) {

      console.warn(
        `Navigation target #${targetId} not found.`
      );

      return;

    }


    clearSettleTimers();


    window.scrollTo({

      top:
        destination,

      left:
        0,

      behavior:
        "smooth"

    });



    /* -----------------------------------------------------
       FIRST CORRECTION
       ----------------------------------------------------- */

    settleTimer1 =
      window.setTimeout(
        () => {

          settlePosition(
            targetId
          );

        },
        550
      );



    /* -----------------------------------------------------
       SECOND CORRECTION
       ----------------------------------------------------- */

    settleTimer2 =
      window.setTimeout(
        () => {

          settlePosition(
            targetId
          );

        },
        800
      );



    /* -----------------------------------------------------
       FINAL CORRECTION

       Khusus kalau layout berat seperti dashboard.
       ----------------------------------------------------- */

    settleTimer3 =
      window.setTimeout(
        () => {

          settlePosition(
            targetId
          );

        },
        1100
      );

  }



  /* =======================================================
     17. LOCK ACTIVE STATE WHILE NAVIGATING
     ======================================================= */

  function lockNavigation() {

    navigationLocked =
      true;


    if (
      navigationUnlockTimer
    ) {

      clearTimeout(
        navigationUnlockTimer
      );

    }


    navigationUnlockTimer =
      window.setTimeout(
        () => {

          navigationLocked =
            false;


          updateActiveSection();

        },
        1200
      );

  }



  /* =======================================================
     18. NAVIGATE
     ======================================================= */

  function navigateTo(
    targetId
  ) {

    if (
      !SECTION_IDS.includes(
        targetId
      )
    ) {

      return;

    }


    /*
       Dot pindah langsung.
    */

    setActiveLink(
      targetId
    );


    /*
       Jangan biarkan scroll event mengganti dot
       selama smooth navigation.
    */

    lockNavigation();


    /*
       Tunggu layout 1 frame.
    */

    requestAnimationFrame(
      () => {

        requestAnimationFrame(
          () => {

            scrollToTarget(
              targetId
            );

          }
        );

      }
    );

  }



  /* =======================================================
     19. HANDLE NAV CLICK
     ======================================================= */

  function handleNavClick(
    event
  ) {

    const link =
      event.currentTarget;


    const href =
      link.getAttribute(
        "href"
      );


    if (
      !href ||
      !href.startsWith("#")
    ) {

      return;

    }


    const targetId =
      href.substring(1);


    if (
      !SECTION_IDS.includes(
        targetId
      )
    ) {

      return;

    }


    event.preventDefault();


    navigateTo(
      targetId
    );

  }



  /* =======================================================
     20. NAVBAR REFERENCE FOR MANUAL SCROLL
     ======================================================= */

  function getReferenceLine() {

    const navbar =
      getNavbarElement();


    if (!navbar) {

      return 130;

    }


    const rect =
      navbar.getBoundingClientRect();


    return Math.max(

      100,

      rect.bottom +
      25

    );

  }



  /* =======================================================
     21. UPDATE ACTIVE DURING MANUAL SCROLL
     ======================================================= */

  function updateActiveSection() {

    if (
      navigationLocked
    ) {

      return;

    }


    const currentScroll =
      window.scrollY;


    const maximumScroll =
      getMaximumScrollTop();



    /* -----------------------------------------------------
       HOME
       ----------------------------------------------------- */

    if (
      currentScroll <=
      25
    ) {

      setActiveLink(
        "home"
      );

      return;

    }



    /* -----------------------------------------------------
       CONTACT
       ----------------------------------------------------- */

    if (
      maximumScroll -
      currentScroll <=
      80
    ) {

      setActiveLink(
        "contact"
      );

      return;

    }



    /* -----------------------------------------------------
       NORMAL SECTIONS
       ----------------------------------------------------- */

    const referenceLine =
      getReferenceLine();


    let activeId =
      "home";


    SECTION_IDS.forEach(
      (id) => {

        const section =
          document.getElementById(
            id
          );


        if (!section) {
          return;
        }


        const rect =
          section.getBoundingClientRect();


        if (
          rect.top <=
          referenceLine
        ) {

          activeId =
            id;

        }

      }
    );


    setActiveLink(
      activeId
    );

  }



  /* =======================================================
     22. SCROLL HANDLER
     ======================================================= */

  function handleWindowScroll() {

    if (
      scrollRAF !==
      null
    ) {

      cancelAnimationFrame(
        scrollRAF
      );

    }


    scrollRAF =
      requestAnimationFrame(
        () => {

          scrollRAF =
            null;


          updateActiveSection();

        }
      );

  }



  /* =======================================================
     23. INIT
     ======================================================= */

  function initNavbar() {

    const root =
      getNavbarRoot();


    if (!root) {
      return;
    }


    const links =
      root.querySelectorAll(
        'a[href^="#"]'
      );


    /*
       Navbar belum dimount app.js.
    */

    if (!links.length) {
      return;
    }


    /*
       Hindari listener ganda.
    */

    if (
      root.dataset
        .navbarInitialized ===
      "true"
    ) {

      return;

    }



    /* -----------------------------------------------------
       NAVIGATION LINKS
       ----------------------------------------------------- */

    links.forEach(
      (link) => {

        const href =
          link.getAttribute(
            "href"
          );


        if (
          !href ||
          !href.startsWith("#")
        ) {

          return;

        }


        const targetId =
          href.substring(1);


        if (
          !SECTION_IDS.includes(
            targetId
          )
        ) {

          return;

        }


        link.addEventListener(
          "click",
          handleNavClick
        );

      }
    );



    /* -----------------------------------------------------
       MANUAL SCROLL
       ----------------------------------------------------- */

    window.addEventListener(
      "scroll",
      handleWindowScroll,
      {
        passive:
          true
      }
    );



    /* -----------------------------------------------------
       RESIZE
       ----------------------------------------------------- */

    window.addEventListener(
      "resize",
      () => {

        if (
          !navigationLocked
        ) {

          updateActiveSection();

        }

      },
      {
        passive:
          true
      }
    );



    /* -----------------------------------------------------
       COMPLETE
       ----------------------------------------------------- */

    root.dataset
      .navbarInitialized =
      "true";


    setActiveLink(
      "home"
    );


    console.log(
      "Navbar visual navigation ready."
    );

  }



  /* =======================================================
     24. EXPOSE TO APP
     ======================================================= */

  window.initNavbar =
    initNavbar;



  /* =======================================================
     25. GLOBAL NAVIGATION

     Bisa dipakai tombol lain kalau nanti diperlukan:
     window.portfolioNavigate("faq");
     ======================================================= */

  window.portfolioNavigate =
    function (
      targetId
    ) {

      navigateTo(
        targetId
      );

    };


})();