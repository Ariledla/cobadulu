/* =========================================================
   DASHBOARDS
   True centered transform carousel
   Drag + horizontal trackpad
   Vertical wheel untouched
   NO LOOP
   ========================================================= */

(() => {


  window.initDashboards =
    function initDashboards() {


      /* ===================================================
         SECTION
         =================================================== */

      const section =
        document.getElementById(
          "dashboards"
        );


      if (!section) {
        return;
      }


      if (
        section.dataset.dashboardReady ===
        "true"
      ) {
        return;
      }


      section.dataset.dashboardReady =
        "true";


      /* ===================================================
         ELEMENTS
         =================================================== */

      const viewport =
        section.querySelector(
          "#dashboardViewport"
        );


      const track =
        section.querySelector(
          "#dashboardTrack"
        );


      const cards =
        Array.from(
          section.querySelectorAll(
            ".dashboard-card"
          )
        );


      const selectors =
        Array.from(
          section.querySelectorAll(
            ".dashboard-selector-item"
          )
        );


      const detailButtons =
        Array.from(
          section.querySelectorAll(
            ".dashboard-detail-btn"
          )
        );


      if (
        !viewport ||
        !track ||
        cards.length === 0
      ) {
        return;
      }


      /* ===================================================
         SETTINGS
         =================================================== */

      const DRAG_SPEED =
        1.0;


      const TRACKPAD_SPEED =
        .9;


      const DRAG_THRESHOLD =
        5;


      const SNAP_DELAY =
        130;


      /* ===================================================
         STATE
         =================================================== */

      let currentIndex =
        0;


      let currentTranslate =
        0;


      let dragging =
        false;


      let moved =
        false;


      let dragStartX =
        0;


      let dragStartTranslate =
        0;


      let horizontalTimer =
        null;


      let resizeTimer =
        null;


      /* ===================================================
         CLAMP
         =================================================== */

      function clamp(
        value,
        min,
        max
      ) {

        return Math.min(
          Math.max(
            value,
            min
          ),
          max
        );

      }


      /* ===================================================
         CALCULATE EXACT CENTER
         =================================================== */

      function getCenterTranslate(
        index
      ) {


        const card =
          cards[index];


        if (!card) {
          return 0;
        }


        /*
          Card coordinates inside track.
        */

        const cardCenter =
          card.offsetLeft +
          card.offsetWidth / 2;


        /*
          Viewport center.
        */

        const viewportCenter =
          viewport.clientWidth / 2;


        /*
          Translation required to place
          card center exactly on
          viewport center.
        */

        return (
          viewportCenter -
          cardCenter
        );

      }


      /* ===================================================
         FIRST / LAST LIMIT
         =================================================== */

      function getTranslateLimits() {


        const first =
          getCenterTranslate(
            0
          );


        const last =
          getCenterTranslate(
            cards.length - 1
          );


        return {
          max:
            first,

          min:
            last
        };

      }


      /* ===================================================
         APPLY TRANSFORM
         =================================================== */

      function applyTranslate(
        value,
        animate = false
      ) {


        const limits =
          getTranslateLimits();


        currentTranslate =
          clamp(
            value,
            limits.min,
            limits.max
          );


        track.style.transition =
          animate

            ? "transform .38s cubic-bezier(.22,.61,.36,1)"

            : "none";


        track.style.transform =
          `translate3d(${currentTranslate}px, 0, 0)`;

      }


      /* ===================================================
         UPDATE ACTIVE STATE
         =================================================== */

      function updateActive(
        index
      ) {


        currentIndex =
          clamp(
            index,
            0,
            cards.length - 1
          );


        cards.forEach(
          (
            card,
            cardIndex
          ) => {


            card.classList.toggle(
              "active",
              cardIndex ===
              currentIndex
            );

          }
        );


        selectors.forEach(
          (
            selector,
            selectorIndex
          ) => {


            const active =
              selectorIndex ===
              currentIndex;


            selector.classList.toggle(
              "active",
              active
            );


            selector.setAttribute(
              "aria-current",
              active
                ? "true"
                : "false"
            );

          }
        );

      }


      /* ===================================================
         GO TO DASHBOARD
         =================================================== */

      function goToDashboard(
        index,
        animate = true
      ) {


        const safeIndex =
          clamp(
            index,
            0,
            cards.length - 1
          );


        updateActive(
          safeIndex
        );


        applyTranslate(
          getCenterTranslate(
            safeIndex
          ),
          animate
        );

      }


      /* ===================================================
         FIND CLOSEST CARD TO VIEWPORT CENTER
         =================================================== */

      function getClosestIndex() {


        const viewportCenter =
          viewport.clientWidth / 2;


        let closestIndex =
          0;


        let smallestDistance =
          Infinity;


        cards.forEach(
          (
            card,
            index
          ) => {


            const transformedCenter =
              card.offsetLeft +
              card.offsetWidth / 2 +
              currentTranslate;


            const distance =
              Math.abs(
                transformedCenter -
                viewportCenter
              );


            if (
              distance <
              smallestDistance
            ) {

              smallestDistance =
                distance;


              closestIndex =
                index;

            }

          }
        );


        return closestIndex;

      }


      /* ===================================================
         CLICK SELECTOR
         =================================================== */

      selectors.forEach(
        (
          selector,
          index
        ) => {


          selector.addEventListener(
            "click",
            () => {


              /*
                01 / 02 / 03 ALWAYS
                CENTER EXACTLY.
              */

              goToDashboard(
                index,
                true
              );

            }
          );

        }
      );


      /* ===================================================
         CLICK SIDE CARD
         =================================================== */

      cards.forEach(
        (
          card,
          index
        ) => {


          card.addEventListener(
            "click",
            event => {


              if (
                event.target.closest(
                  ".dashboard-detail-btn"
                )
              ) {
                return;
              }


              if (moved) {
                return;
              }


              if (
                index !==
                currentIndex
              ) {

                goToDashboard(
                  index,
                  true
                );

              }

            }
          );

        }
      );


      /* ===================================================
         POINTER DOWN
         =================================================== */

      viewport.addEventListener(
        "pointerdown",
        event => {


          if (
            event.target.closest(
              "button"
            )
          ) {
            return;
          }


          dragging =
            true;


          moved =
            false;


          dragStartX =
            event.clientX;


          dragStartTranslate =
            currentTranslate;


          track.style.transition =
            "none";


          viewport.classList.add(
            "is-dragging"
          );


          viewport.setPointerCapture?.(
            event.pointerId
          );

        }
      );


      /* ===================================================
         POINTER MOVE
         =================================================== */

      viewport.addEventListener(
        "pointermove",
        event => {


          if (!dragging) {
            return;
          }


          const delta =
            (
              event.clientX -
              dragStartX
            )
            *
            DRAG_SPEED;


          if (
            Math.abs(delta) >
            DRAG_THRESHOLD
          ) {

            moved =
              true;

          }


          applyTranslate(
            dragStartTranslate +
            delta,
            false
          );

        }
      );


      /* ===================================================
         FINISH DRAG
         =================================================== */

      function finishDrag() {


        if (!dragging) {
          return;
        }


        dragging =
          false;


        viewport.classList.remove(
          "is-dragging"
        );


        const targetIndex =
          getClosestIndex();


        goToDashboard(
          targetIndex,
          true
        );

      }


      viewport.addEventListener(
        "pointerup",
        finishDrag
      );


      viewport.addEventListener(
        "pointercancel",
        finishDrag
      );


      /* ===================================================
         PREVENT CLICK AFTER DRAG
         =================================================== */

      viewport.addEventListener(
        "click",
        event => {


          if (!moved) {
            return;
          }


          event.preventDefault();


          event.stopPropagation();


          moved =
            false;

        },
        true
      );


      /* ===================================================
         HORIZONTAL TRACKPAD ONLY
         =================================================== */

      viewport.addEventListener(
        "wheel",
        event => {


          const absX =
            Math.abs(
              event.deltaX
            );


          const absY =
            Math.abs(
              event.deltaY
            );


          /*
            NORMAL VERTICAL SCROLL.

            Cursor boleh berada di dashboard,
            tapi page tetap scroll normal.
          */

          if (
            absY >=
              absX &&
            !event.shiftKey
          ) {

            return;

          }


          let horizontalDelta =
            event.deltaX;


          /*
            SHIFT + mouse wheel
            = intentional horizontal movement.
          */

          if (
            event.shiftKey &&
            absY >
            absX
          ) {

            horizontalDelta =
              event.deltaY;

          }


          if (
            Math.abs(
              horizontalDelta
            ) <
            2
          ) {
            return;
          }


          event.preventDefault();


          const movement =
            horizontalDelta *
            TRACKPAD_SPEED;


          /*
            Scroll right means track moves left.
          */

          applyTranslate(
            currentTranslate -
            movement,
            false
          );


          updateActive(
            getClosestIndex()
          );


          if (
            horizontalTimer
          ) {

            clearTimeout(
              horizontalTimer
            );

          }


          horizontalTimer =
            setTimeout(
              () => {


                goToDashboard(
                  getClosestIndex(),
                  true
                );


              },
              SNAP_DELAY
            );

        },
        {
          passive:
            false
        }
      );


      /* ===================================================
         DETAILS MODAL
         =================================================== */

      document
        .querySelector(
          ".dashboard-detail-modal"
        )
        ?.remove();


      const modal =
        document.createElement(
          "div"
        );


      modal.className =
        "dashboard-detail-modal";


      modal.setAttribute(
        "aria-hidden",
        "true"
      );


      modal.innerHTML = `

        <div
          class="dashboard-detail-backdrop"
          aria-hidden="true"
        ></div>


        <div
          class="dashboard-detail-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard details"
        >

          <button
            class="dashboard-detail-close"
            type="button"
            aria-label="Close dashboard details"
          >
            ×
          </button>


          <div
            class="dashboard-detail-content"
          ></div>

        </div>

      `;


      document.body.appendChild(
        modal
      );


      const backdrop =
        modal.querySelector(
          ".dashboard-detail-backdrop"
        );


      const closeButton =
        modal.querySelector(
          ".dashboard-detail-close"
        );


      let previousFocus =
        null;


      /* ===================================================
         OPEN DETAILS
         =================================================== */

      function openDetails(
        trigger
      ) {


        previousFocus =
          trigger;


        modal.classList.add(
          "is-open"
        );


        modal.setAttribute(
          "aria-hidden",
          "false"
        );


        document.documentElement
          .classList.add(
            "dashboard-modal-open"
          );


        document.body
          .classList.add(
            "dashboard-modal-open"
          );


        setTimeout(
          () => {

            closeButton?.focus();

          },
          30
        );

      }


      detailButtons.forEach(
        (
          button,
          index
        ) => {


          button.addEventListener(
            "click",
            event => {


              event.stopPropagation();


              /*
                Only active card's detail
                button should open.
              */

              if (
                index !==
                currentIndex
              ) {

                goToDashboard(
                  index,
                  true
                );

                return;
              }


              openDetails(
                button
              );

            }
          );

        }
      );


      /* ===================================================
         CLOSE DETAILS
         =================================================== */

      function closeDetails() {


        modal.classList.remove(
          "is-open"
        );


        modal.setAttribute(
          "aria-hidden",
          "true"
        );


        document.documentElement
          .classList.remove(
            "dashboard-modal-open"
          );


        document.body
          .classList.remove(
            "dashboard-modal-open"
          );


        previousFocus?.focus();

      }


      closeButton?.addEventListener(
        "click",
        closeDetails
      );


      backdrop?.addEventListener(
        "click",
        closeDetails
      );


      /* ===================================================
         KEYBOARD
         =================================================== */

      document.addEventListener(
        "keydown",
        event => {


          if (
            modal.classList.contains(
              "is-open"
            )
          ) {


            if (
              event.key ===
              "Escape"
            ) {

              closeDetails();

            }


            return;

          }


          const rect =
            section.getBoundingClientRect();


          const visible =
            rect.bottom > 0 &&
            rect.top <
            window.innerHeight;


          if (!visible) {
            return;
          }


          /* LEFT — NO LOOP */

          if (
            event.key ===
              "ArrowLeft" &&
            currentIndex > 0
          ) {

            goToDashboard(
              currentIndex - 1,
              true
            );

          }


          /* RIGHT — NO LOOP */

          if (
            event.key ===
              "ArrowRight" &&
            currentIndex <
              cards.length - 1
          ) {

            goToDashboard(
              currentIndex + 1,
              true
            );

          }

        }
      );


      /* ===================================================
         RESIZE
         =================================================== */

      window.addEventListener(
        "resize",
        () => {


          clearTimeout(
            resizeTimer
          );


          resizeTimer =
            setTimeout(
              () => {


                /*
                  Recalculate center after
                  viewport dimensions change.
                */

                goToDashboard(
                  currentIndex,
                  false
                );


              },
              80
            );

        }
      );


      /* ===================================================
         INITIAL
         =================================================== */

      requestAnimationFrame(
        () => {


          /*
            Dashboard 01 starts
            EXACTLY centered.
          */

          goToDashboard(
            0,
            false
          );

        }
      );


    };


})();