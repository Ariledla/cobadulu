/* =========================================================
   CONTACT
   Form + Comments + Avatar + Canva-like HSV Color Picker
   + Step Guidance Blink
   ========================================================= */

(() => {

  const STORAGE_KEY =
    "portfolioContactMessages";

  let initializedSection = null;


  /* =======================================================
     01. HELPERS
     ======================================================= */

  function clamp(value, min, max) {

    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );

  }


  function rgbToHex(r, g, b) {

    const convert =
      value =>
        Math.round(
          clamp(
            value,
            0,
            255
          )
        )
          .toString(16)
          .padStart(
            2,
            "0"
          );

    return (
      "#" +
      convert(r) +
      convert(g) +
      convert(b)
    ).toUpperCase();

  }


  function hexToRgb(hex) {

    let clean =
      String(hex || "")
        .trim()
        .replace("#", "");


    if (
      /^[0-9a-fA-F]{3}$/.test(clean)
    ) {

      clean =
        clean
          .split("")
          .map(char => char + char)
          .join("");

    }


    if (
      !/^[0-9a-fA-F]{6}$/.test(clean)
    ) {

      return null;

    }


    return {

      r:
        parseInt(
          clean.slice(0, 2),
          16
        ),

      g:
        parseInt(
          clean.slice(2, 4),
          16
        ),

      b:
        parseInt(
          clean.slice(4, 6),
          16
        )

    };

  }


  function rgbToHsv(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;


    const max =
      Math.max(r, g, b);

    const min =
      Math.min(r, g, b);

    const delta =
      max - min;


    let h = 0;


    if (delta !== 0) {

      if (max === r) {

        h =
          60 *
          (
            ((g - b) / delta) %
            6
          );

      }

      else if (max === g) {

        h =
          60 *
          (
            ((b - r) / delta) +
            2
          );

      }

      else {

        h =
          60 *
          (
            ((r - g) / delta) +
            4
          );

      }

    }


    if (h < 0) {

      h += 360;

    }


    const s =
      max === 0
        ? 0
        : delta / max;


    return {

      h,

      s:
        s * 100,

      v:
        max * 100

    };

  }


  function hsvToRgb(h, s, v) {

    h =
      ((h % 360) + 360) %
      360;


    s =
      clamp(
        s,
        0,
        100
      ) / 100;


    v =
      clamp(
        v,
        0,
        100
      ) / 100;


    const c =
      v * s;


    const x =
      c *
      (
        1 -
        Math.abs(
          ((h / 60) % 2) -
          1
        )
      );


    const m =
      v - c;


    let r = 0;
    let g = 0;
    let b = 0;


    if (h < 60) {

      r = c;
      g = x;

    }

    else if (h < 120) {

      r = x;
      g = c;

    }

    else if (h < 180) {

      g = c;
      b = x;

    }

    else if (h < 240) {

      g = x;
      b = c;

    }

    else if (h < 300) {

      r = x;
      b = c;

    }

    else {

      r = c;
      b = x;

    }


    return {

      r:
        (r + m) * 255,

      g:
        (g + m) * 255,

      b:
        (b + m) * 255

    };

  }


  function hsvToHex(h, s, v) {

    const rgb =
      hsvToRgb(
        h,
        s,
        v
      );


    return rgbToHex(
      rgb.r,
      rgb.g,
      rgb.b
    );

  }


  /* =======================================================
     02. INIT CONTACT
     ======================================================= */

  function initContact() {

    const contact =
      document.getElementById(
        "contact"
      );


    if (!contact) {

      return;

    }


    /*
       Hindari bind dua kali.
    */

    if (
      initializedSection ===
      contact
    ) {

      return;

    }


    initializedSection =
      contact;


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const form =
      contact.querySelector(
        "#contactForm"
      );


    const nameInput =
      contact.querySelector(
        "#contactName"
      );


    const messageInput =
      contact.querySelector(
        "#contactMessage"
      );


    const initialsInput =
      contact.querySelector(
        "#contactInitials"
      );


    const avatarPreview =
      contact.querySelector(
        "#profilePreviewAvatar"
      );


    const profileBuilder =
      contact.querySelector(
        ".profile-builder"
      );


    const presetButtons =
      Array.from(
        contact.querySelectorAll(
          ".avatar-color"
        )
      );


    const customButton =
      contact.querySelector(
        "#customColorButton"
      );


    const popover =
      contact.querySelector(
        "#customColorPopover"
      );


    const svPicker =
      contact.querySelector(
        "#svPicker"
      );


    const svCursor =
      contact.querySelector(
        "#svPickerCursor"
      );


    const hueSlider =
      contact.querySelector(
        "#hueSlider"
      );


    const hexInput =
      contact.querySelector(
        "#customHexInput"
      );


    const hexPreview =
      contact.querySelector(
        "#hexColorPreview"
      );


    const commentsEmpty =
      contact.querySelector(
        "#commentsEmpty"
      );


    const commentsList =
      contact.querySelector(
        "#commentsList"
      );


    const commentCount =
      contact.querySelector(
        "#commentCount"
      );


    if (
      !form ||
      !nameInput ||
      !messageInput ||
      !initialsInput ||
      !avatarPreview ||
      !profileBuilder
    ) {

      return;

    }


    /* =====================================================
       STATE
       ===================================================== */

    let currentColor =
      "#004636";


    const initialRgb =
      hexToRgb(
        currentColor
      );


    let hsv =
      rgbToHsv(
        initialRgb.r,
        initialRgb.g,
        initialRgb.b
      );


    /* =====================================================
       03. STEP GUIDANCE BLINK

       FLOW:

       NAME kosong
       -> Message normal
       -> Profile normal

       NAME ada isi
       MESSAGE kosong
       -> Message kedip merah

       NAME ada isi
       MESSAGE ada isi
       -> Message berhenti kedip
       -> Profile Builder kedip merah

       MESSAGE dihapus
       -> Profile berhenti kedip
       -> Message kedip lagi

       NAME dihapus
       -> Semua berhenti
       ===================================================== */

    const GUIDANCE_BLINK_CLASS =
      "is-guidance-blink";


    function hasText(element) {

      return Boolean(
        element &&
        element.value.trim()
      );

    }


    function syncFormGuidance() {

      const hasName =
        hasText(
          nameInput
        );


      const hasMessage =
        hasText(
          messageInput
        );


      /*
         NAME SUDAH ADA
         MESSAGE BELUM ADA

         -> Message blink.
      */

      messageInput.classList.toggle(

        GUIDANCE_BLINK_CLASS,

        hasName &&
        !hasMessage

      );


      /*
         NAME + MESSAGE SUDAH ADA

         -> Profile Builder blink.
      */

      profileBuilder.classList.toggle(

        GUIDANCE_BLINK_CLASS,

        hasName &&
        hasMessage

      );

    }


    /*
       REALTIME.
    */

    nameInput.addEventListener(
      "input",
      syncFormGuidance
    );


    messageInput.addEventListener(
      "input",
      syncFormGuidance
    );


    /*
       Untuk autofill / paste / browser change.
    */

    nameInput.addEventListener(
      "change",
      syncFormGuidance
    );


    messageInput.addEventListener(
      "change",
      syncFormGuidance
    );


    /*
       Jika form di-reset.
    */

    form.addEventListener(
      "reset",
      () => {

        requestAnimationFrame(
          syncFormGuidance
        );

      }
    );


    /* =====================================================
       04. INITIALS
       ===================================================== */

    function normalizeInitials(value) {

      const clean =
        String(
          value || ""
        )
          .replace(
            /[^a-zA-Z0-9]/g,
            ""
          )
          .slice(
            0,
            2
          )
          .toUpperCase();


      return (
        clean ||
        "US"
      );

    }


    function updateInitials() {

      const initials =
        normalizeInitials(
          initialsInput.value
        );


      avatarPreview.textContent =
        initials;

    }


    initialsInput.addEventListener(
      "input",
      () => {

        initialsInput.value =
          initialsInput.value
            .replace(
              /[^a-zA-Z0-9]/g,
              ""
            )
            .slice(
              0,
              2
            )
            .toUpperCase();


        avatarPreview.textContent =
          normalizeInitials(
            initialsInput.value
          );

      }
    );


    /* =====================================================
       05. APPLY AVATAR COLOR
       ===================================================== */

    function applyAvatarColor(
      color,
      {
        updateHSV = true,
        clearPreset = false
      } = {}
    ) {

      const rgb =
        hexToRgb(
          color
        );


      if (!rgb) {

        return;

      }


      currentColor =
        rgbToHex(
          rgb.r,
          rgb.g,
          rgb.b
        );


      avatarPreview.style.backgroundColor =
        currentColor;


      if (hexPreview) {

        hexPreview.style.backgroundColor =
          currentColor;

      }


      if (hexInput) {

        hexInput.value =
          currentColor.slice(1);

      }


      if (updateHSV) {

        hsv =
          rgbToHsv(
            rgb.r,
            rgb.g,
            rgb.b
          );

      }


      if (clearPreset) {

        presetButtons.forEach(
          button => {

            button.classList.remove(
              "is-active"
            );

          }
        );

      }


      updatePickerUI();

    }


    /* =====================================================
       06. PICKER UI
       ===================================================== */

    function updatePickerUI() {

      if (!svPicker) {

        return;

      }


      svPicker.style.backgroundColor =
        `hsl(${hsv.h} 100% 50%)`;


      if (hueSlider) {

        hueSlider.value =
          String(
            Math.round(
              hsv.h
            )
          );

      }


      if (svCursor) {

        svCursor.style.left =
          `${clamp(
            hsv.s,
            0,
            100
          )}%`;


        svCursor.style.top =
          `${100 -
          clamp(
            hsv.v,
            0,
            100
          )}%`;

      }


      const hex =
        hsvToHex(
          hsv.h,
          hsv.s,
          hsv.v
        );


      currentColor =
        hex;


      avatarPreview.style.backgroundColor =
        hex;


      if (hexPreview) {

        hexPreview.style.backgroundColor =
          hex;

      }


      if (
        hexInput &&
        document.activeElement !==
        hexInput
      ) {

        hexInput.value =
          hex.slice(1);

      }

    }


    /* =====================================================
       07. PRESET COLORS
       ===================================================== */

    presetButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const color =
              button.dataset.color;


            if (!color) {

              return;

            }


            presetButtons.forEach(
              preset => {

                preset.classList.remove(
                  "is-active"
                );

              }
            );


            button.classList.add(
              "is-active"
            );


            applyAvatarColor(
              color
            );

          }
        );

      }
    );


    /* =====================================================
       08. OPEN / CLOSE COLOR PICKER
       ===================================================== */

    function openPicker() {

      if (
        !popover ||
        !customButton
      ) {

        return;

      }


      popover.classList.add(
        "is-open"
      );


      customButton.setAttribute(
        "aria-expanded",
        "true"
      );


      updatePickerUI();

    }


    function closePicker() {

      if (
        !popover ||
        !customButton
      ) {

        return;

      }


      popover.classList.remove(
        "is-open"
      );


      customButton.setAttribute(
        "aria-expanded",
        "false"
      );

    }


    customButton?.addEventListener(
      "click",
      event => {

        event.stopPropagation();


        if (
          popover?.classList.contains(
            "is-open"
          )
        ) {

          closePicker();

        }

        else {

          openPicker();

        }

      }
    );


    popover?.addEventListener(
      "click",
      event => {

        event.stopPropagation();

      }
    );


    document.addEventListener(
      "click",
      event => {

        if (
          !contact.contains(
            event.target
          )
        ) {

          closePicker();

          return;

        }


        if (
          popover &&
          customButton &&
          !popover.contains(
            event.target
          ) &&
          !customButton.contains(
            event.target
          )
        ) {

          closePicker();

        }

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          closePicker();

        }

      }
    );


    /* =====================================================
       09. SATURATION / VALUE POINTER
       ===================================================== */

    function updateSVFromPointer(event) {

      if (!svPicker) {

        return;

      }


      const rect =
        svPicker.getBoundingClientRect();


      const x =
        clamp(
          event.clientX -
          rect.left,
          0,
          rect.width
        );


      const y =
        clamp(
          event.clientY -
          rect.top,
          0,
          rect.height
        );


      hsv.s =
        rect.width === 0
          ? 0
          : (
              x /
              rect.width
            ) * 100;


      hsv.v =
        rect.height === 0
          ? 0
          : 100 -
            (
              y /
              rect.height
            ) * 100;


      presetButtons.forEach(
        button => {

          button.classList.remove(
            "is-active"
          );

        }
      );


      updatePickerUI();

    }


    svPicker?.addEventListener(
      "pointerdown",
      event => {

        svPicker.setPointerCapture(
          event.pointerId
        );


        updateSVFromPointer(
          event
        );

      }
    );


    svPicker?.addEventListener(
      "pointermove",
      event => {

        if (
          svPicker.hasPointerCapture(
            event.pointerId
          )
        ) {

          updateSVFromPointer(
            event
          );

        }

      }
    );


    /* =====================================================
       10. KEYBOARD SUPPORT — SV FIELD
       ===================================================== */

    svPicker?.addEventListener(
      "keydown",
      event => {

        let changed =
          false;


        const step =
          event.shiftKey
            ? 5
            : 1;


        if (
          event.key ===
          "ArrowLeft"
        ) {

          hsv.s -=
            step;

          changed =
            true;

        }


        if (
          event.key ===
          "ArrowRight"
        ) {

          hsv.s +=
            step;

          changed =
            true;

        }


        if (
          event.key ===
          "ArrowUp"
        ) {

          hsv.v +=
            step;

          changed =
            true;

        }


        if (
          event.key ===
          "ArrowDown"
        ) {

          hsv.v -=
            step;

          changed =
            true;

        }


        if (changed) {

          event.preventDefault();


          hsv.s =
            clamp(
              hsv.s,
              0,
              100
            );


          hsv.v =
            clamp(
              hsv.v,
              0,
              100
            );


          presetButtons.forEach(
            button => {

              button.classList.remove(
                "is-active"
              );

            }
          );


          updatePickerUI();

        }

      }
    );


    /* =====================================================
       11. HUE
       ===================================================== */

    hueSlider?.addEventListener(
      "input",
      () => {

        hsv.h =
          Number(
            hueSlider.value
          );


        presetButtons.forEach(
          button => {

            button.classList.remove(
              "is-active"
            );

          }
        );


        updatePickerUI();

      }
    );


    /* =====================================================
       12. HEX INPUT
       ===================================================== */

    function applyHexInput() {

      if (!hexInput) {

        return;

      }


      const raw =
        hexInput.value
          .replace(
            /[^0-9a-fA-F]/g,
            ""
          )
          .slice(
            0,
            6
          );


      hexInput.value =
        raw.toUpperCase();


      if (
        raw.length !==
        6
      ) {

        return;

      }


      const rgb =
        hexToRgb(
          raw
        );


      if (!rgb) {

        return;

      }


      hsv =
        rgbToHsv(
          rgb.r,
          rgb.g,
          rgb.b
        );


      presetButtons.forEach(
        button => {

          button.classList.remove(
            "is-active"
          );

        }
      );


      updatePickerUI();

    }


    hexInput?.addEventListener(
      "input",
      applyHexInput
    );


    hexInput?.addEventListener(
      "blur",
      () => {

        if (
          hexInput.value.length !==
          6
        ) {

          hexInput.value =
            currentColor.slice(1);

        }

      }
    );


    /* =====================================================
       13. COMMENTS STORAGE
       ===================================================== */

    function getMessages() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              STORAGE_KEY
            ) ||
            "[]"
          );


        return Array.isArray(
          saved
        )
          ? saved
          : [];

      }

      catch (error) {

        return [];

      }

    }


    function saveMessages(messages) {

      try {

        localStorage.setItem(

          STORAGE_KEY,

          JSON.stringify(
            messages
          )

        );

      }

      catch (error) {

        /*
           Storage unavailable.
           UI tetap bekerja.
        */

      }

    }


    /* =====================================================
       14. COMMENT CARD
       ===================================================== */

    function createCommentCard(message) {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "comment-card";


      const avatar =
        document.createElement(
          "div"
        );


      avatar.className =
        "comment-avatar";


      avatar.textContent =
        normalizeInitials(
          message.initials
        );


      avatar.style.backgroundColor =
        message.color ||
        "#004636";


      const body =
        document.createElement(
          "div"
        );


      body.className =
        "comment-body";


      const name =
        document.createElement(
          "strong"
        );


      name.className =
        "comment-name";


      name.textContent =
        message.name;


      const text =
        document.createElement(
          "p"
        );


      text.className =
        "comment-message";


      text.textContent =
        message.message;


      body.append(
        name,
        text
      );


      card.append(
        avatar,
        body
      );


      return card;

    }


    /* =====================================================
       15. RENDER COMMENTS
       ===================================================== */

    function renderMessages() {

      if (
        !commentsList ||
        !commentsEmpty ||
        !commentCount
      ) {

        return;

      }


      const messages =
        getMessages();


      commentCount.textContent =
        String(
          messages.length
        );


      commentsList.innerHTML =
        "";


      if (
        messages.length ===
        0
      ) {

        commentsEmpty.hidden =
          false;


        commentsList.hidden =
          true;


        return;

      }


      commentsEmpty.hidden =
        true;


      commentsList.hidden =
        false;


      /*
         Newest first.
      */

      [...messages]
        .reverse()
        .forEach(
          message => {

            commentsList.appendChild(
              createCommentCard(
                message
              )
            );

          }
        );

    }


    /* =====================================================
       16. SUBMIT
       ===================================================== */

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const name =
          nameInput.value.trim();


        const message =
          messageInput.value.trim();


        /*
           Belum lengkap.
        */

        if (
          !name ||
          !message
        ) {

          if (!name) {

            nameInput.focus();

          }

          else {

            messageInput.focus();

          }


          syncFormGuidance();


          return;

        }


        const initials =
          normalizeInitials(
            initialsInput.value
          );


        const messages =
          getMessages();


        messages.push({

          id:
            Date.now(),

          name,

          message,

          initials,

          color:
            currentColor

        });


        /*
           Maksimal simpan 20.
        */

        const trimmed =
          messages.slice(
            -20
          );


        saveMessages(
          trimmed
        );


        /*
           Setelah berhasil:
           Name + Message kosong.
        */

        nameInput.value =
          "";


        messageInput.value =
          "";


        /*
           Semua guidance blink langsung berhenti.
        */

        syncFormGuidance();


        /*
           Render komentar terbaru.
        */

        renderMessages();

      }
    );


    /* =====================================================
       17. INITIAL STATE
       ===================================================== */

    updateInitials();


    applyAvatarColor(
      currentColor
    );


    /*
       Pastikan ketika halaman baru dibuka:
       tidak ada blink.
    */

    syncFormGuidance();


    renderMessages();

  }


  /* =======================================================
     18. PUBLIC INIT
     ======================================================= */

  window.initContact =
    initContact;


  /* =======================================================
     19. AUTO INIT

     Contact dimount dinamis oleh app.js.
     Observer menunggu #contact tersedia.
     ======================================================= */

  function observeContactMount() {

    initContact();


    const root =
      document.getElementById(
        "main-root"
      );


    if (!root) {

      return;

    }


    const observer =
      new MutationObserver(
        () => {

          initContact();

        }
      );


    observer.observe(
      root,
      {

        childList:
          true,

        subtree:
          true

      }
    );

  }


  /* =======================================================
     20. START
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      observeContactMount,
      {
        once:
          true
      }
    );

  }

  else {

    observeContactMount();

  }

})();