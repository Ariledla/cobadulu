/* =========================================================
   FOOTER
   Visitor Counter + WIB Clock + Back Home
   ========================================================= */

(() => {


  /* =======================================================
     01. STORAGE KEYS
     ======================================================= */

  const VISITOR_COUNT_KEY =
    "portfolioVisitorCount";


  const VISITOR_SESSION_KEY =
    "portfolioVisitorCountedSession";



  /* =======================================================
     02. VISITOR COUNTER
     ======================================================= */

  function initVisitorCounter() {

    const visitorCount =
      document.getElementById(
        "visitorCount"
      );


    const visitorLabel =
      document.getElementById(
        "visitorLabel"
      );


    if (!visitorCount) {
      return;
    }


    let count = 0;


    try {

      const savedCount =
        Number(
          localStorage.getItem(
            VISITOR_COUNT_KEY
          )
        );


      count =
        Number.isFinite(savedCount)
          ? savedCount
          : 0;


      const alreadyCounted =
        sessionStorage.getItem(
          VISITOR_SESSION_KEY
        );


      /*
         Tambah visitor hanya sekali
         dalam satu browser session.
      */

      if (!alreadyCounted) {

        count += 1;


        localStorage.setItem(
          VISITOR_COUNT_KEY,
          String(count)
        );


        sessionStorage.setItem(
          VISITOR_SESSION_KEY,
          "1"
        );

      }


    } catch (error) {

      count = 1;

    }


    visitorCount.textContent =
      String(count);


    /*
       Grammar:
       1 Visitor
       2 Visitors
    */

    if (visitorLabel) {

      visitorLabel.textContent =
        count === 1
          ? "Visitor"
          : "Visitors";

    }

  }



  /* =======================================================
     03. CURRENT WIB TIME
     ======================================================= */

  function getCurrentWIBTime() {

    const formatter =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone:
            "Asia/Jakarta",

          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false
        }
      );


    const time =
      formatter.format(
        new Date()
      );


    /*
       22:22
       menjadi
       22.22
    */

    return time.replace(
      ":",
      "."
    );

  }



  /* =======================================================
     04. UPDATE CLOCK
     ======================================================= */

  function updateFooterClock() {

    const footerTime =
      document.getElementById(
        "footerTime"
      );


    if (!footerTime) {
      return;
    }


    footerTime.textContent =
      `${getCurrentWIBTime()} WIB`;

  }



  /* =======================================================
     05. CLOCK INIT
     ======================================================= */

  function initFooterClock() {

    /*
       Cegah interval ganda.
    */

    if (
      window.__portfolioFooterClock
    ) {

      window.clearInterval(
        window.__portfolioFooterClock
      );

    }


    /*
       Tampilkan langsung,
       tidak perlu tunggu interval.
    */

    updateFooterClock();


    /*
       Karena yang ditampilkan hanya menit,
       update setiap 10 detik sudah cukup
       dan tetap terasa realtime.
    */

    window.__portfolioFooterClock =
      window.setInterval(
        updateFooterClock,
        10000
      );

  }



  /* =======================================================
     06. BACK HOME
     ======================================================= */

  function initBackHome() {

    const backHome =
      document.getElementById(
        "backHome"
      );


    if (!backHome) {
      return;
    }


    /*
       Jangan bind ulang.
    */

    if (
      backHome.dataset.footerBound ===
      "true"
    ) {

      return;

    }


    backHome.dataset.footerBound =
      "true";



    /* =====================================================
       VISIBILITY
       ===================================================== */

    function updateVisibility() {

      const shouldShow =
        window.scrollY > 500;


      backHome.classList.toggle(
        "is-hidden",
        !shouldShow
      );

    }



    /* =====================================================
       SCROLL LISTENER
       ===================================================== */

    window.addEventListener(
      "scroll",
      updateVisibility,
      {
        passive: true
      }
    );



    /* =====================================================
       CLICK
       ===================================================== */

    backHome.addEventListener(
      "click",
      event => {

        event.preventDefault();


        const home =
          document.getElementById(
            "home"
          );


        if (home) {

          home.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });

        } else {

          window.scrollTo({
            top: 0,

            behavior:
              "smooth"
          });

        }

      }
    );


    updateVisibility();

  }



  /* =======================================================
     07. INIT FOOTER
     ======================================================= */

  window.initFooter =
    function initFooter() {

      initVisitorCounter();

      initFooterClock();

      initBackHome();

    };

})();