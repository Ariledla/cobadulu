/* =========================================================
   FAQ
   Dynamic section initialization

   - Section HTML loaded by app.js
   - All items initially closed
   - Only one item open at a time
   ========================================================= */

(() => {


  /* =======================================================
     INIT FAQ
     ======================================================= */

  function initFaq() {

    const faqRoot =
      document.getElementById(
        "faq"
      );


    /*
       Kalau section belum dimount oleh app.js,
       cukup return.
       Tidak perlu warning.
    */

    if (!faqRoot) {
      return;
    }


    /*
       Hindari listener dipasang dua kali.
    */

    if (
      faqRoot.dataset.faqInitialized ===
      "true"
    ) {

      return;

    }


    const faqItems =
      Array.from(
        faqRoot.querySelectorAll(
          ".faq-item"
        )
      );


    console.log(
      "FAQ items found:",
      faqItems.length
    );


    if (!faqItems.length) {
      return;
    }


    /* =====================================================
       INITIAL STATE
       Semua tertutup.
       ===================================================== */

    faqItems.forEach(
      (item) => {

        item.open =
          false;

      }
    );


    /* =====================================================
       ACCORDION
       Hanya satu terbuka.
       ===================================================== */

    faqItems.forEach(
      (item) => {

        item.addEventListener(
          "toggle",
          () => {

            if (!item.open) {
              return;
            }


            faqItems.forEach(
              (otherItem) => {

                if (
                  otherItem !== item &&
                  otherItem.open
                ) {

                  otherItem.open =
                    false;

                }

              }
            );

          }
        );

      }
    );


    /*
       Mark this actual DOM section,
       bukan global variable.
    */

    faqRoot.dataset.faqInitialized =
      "true";


    console.log(
      "FAQ initialized successfully:",
      faqItems.length,
      "items"
    );

  }



  /* =======================================================
     EXPOSE TO APP.JS
     ======================================================= */

  window.initFaq =
    initFaq;


})();