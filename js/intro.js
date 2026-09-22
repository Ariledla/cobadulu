/* =========================================================
   INTRO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const introScreen =
      document.getElementById(
        "intro-screen"
      );


    const introContent =
      document.getElementById(
        "intro-content"
      );


    const ghost =
      document.getElementById(
        "intro-ghost"
      );



    /* =====================================================
       SAFETY
       ===================================================== */

    if (
      !introScreen ||
      !introContent ||
      !ghost
    ) {

      document.body
        .classList
        .remove(
          "intro-active"
        );


      return;

    }



    /* =====================================================
       TIMING
       ===================================================== */


    /*
      Entrance:
      sama dengan transition CSS.

      1.25 detik.
    */

    const ENTER_DURATION =
      1250;



    /*
      Setelah entrance selesai,
      hantu/GIF tidak terlalu lama.

      950ms = kurang dari 1 detik.
    */

    const HOLD_DURATION =
      950;



    /*
      Exit content.
    */

    const EXIT_DURATION =
      720;



    /*
      Screen fade.
    */

    const SCREEN_FADE_DURATION =
      550;



    /* =====================================================
       STATE
       ===================================================== */

    let introStarted =
      false;



    /* =====================================================
       START INTRO
       ===================================================== */

    function startIntro() {


      /*
        Mencegah intro terpanggil
        dua kali dari load + fallback.
      */

      if (
        introStarted
      ) {

        return;

      }


      introStarted =
        true;



      /*
        Beri browser satu frame
        dalam kondisi awal.

        Kemudian baru reveal.

        Ini penting supaya transition
        tidak skip frame pertama.
      */

      requestAnimationFrame(
        () => {


          requestAnimationFrame(
            () => {


              introContent
                .classList
                .add(
                  "is-visible"
                );



              /*
                Entrance selesai,
                lalu tunggu GIF sebentar.
              */

              setTimeout(
                startExit,
                ENTER_DURATION +
                HOLD_DURATION
              );


            }
          );


        }
      );

    }



    /* =====================================================
       EXIT
       ===================================================== */

    function startExit() {


      introContent
        .classList
        .remove(
          "is-visible"
        );


      introContent
        .classList
        .add(
          "is-leaving"
        );



      /*
        Setelah ghost/text keluar,
        fade seluruh background intro.
      */

      setTimeout(
        closeIntro,
        EXIT_DURATION
      );

    }



    /* =====================================================
       CLOSE INTRO
       ===================================================== */

    function closeIntro() {


      introScreen
        .classList
        .add(
          "is-closing"
        );



      /*
        Website sudah boleh scroll.
      */

      document.body
        .classList
        .remove(
          "intro-active"
        );



      /*
        Hapus overlay setelah
        transisi selesai.
      */

      setTimeout(
        () => {


          introScreen
            .remove();


        },
        SCREEN_FADE_DURATION
      );

    }



    /* =====================================================
       WAIT FOR GIF
       ===================================================== */


    /*
      Jangan langsung mulai animasi.

      Kita tunggu GIF tersedia dahulu.

      Ini membantu menghilangkan
      hentakan saat image baru muncul.
    */

    if (
      ghost.complete &&
      ghost.naturalWidth > 0
    ) {


      startIntro();


    } else {


      ghost.addEventListener(
        "load",
        startIntro,
        {
          once: true
        }
      );


      /*
        Fallback.

        Kalau event load terlalu lama,
        intro tetap berjalan.
      */

      setTimeout(
        startIntro,
        1500
      );

    }


  }
);