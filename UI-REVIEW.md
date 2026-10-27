# Portfolio UI review

Scope: local UI and responsive layout. Contact URLs, Resume, backend delivery,
and publishing are deferred at the owner's request.

## Changes

- Card contents scale with each card's available width via `css/cards.css`:
  larger record logos/text, project copy/tags/buttons, and contact icons/text.
  Laptop 1200?1599px retains the original section styles and excludes these
  shared card overrides. Narrow contact columns use a single
  column so larger contents remain readable. Form text is enlarged and stacked
  empty comment panels use less unnecessary vertical space.

- Preserve the laptop design and the existing device folders. Tablet CSS inherits
  the laptop component foundation, then adjusts each section's layout.
- Increase About text readability on tablets and monitors. Remove the copied
  laptop stylesheet from monitor About and retain only monitor overrides.
- Use a horizontal wordmark in short phone landscape windows. Keep the existing
  vertical wordmark in phone portrait.
- Populate the project dialog with existing project facts and style its contents.
  This is an overview, not an independently authored full case study.
- Keep navigation targets below the sticky navbar. Contact now opens at its start
  instead of jumping to the bottom of the document.
- Add keyboard focus indicators, respect reduced motion, and skip the animated
  intro for reduced-motion users. Focus returns after closing a project dialog.
- Add a local DA favicon and ignore generated QA output.

## Reproduce browser checks

Run `node scripts/visual-qa.mjs` from this directory. It uses installed Chrome,
a temporary local HTTP server, and Node's built-in WebSocket client. No npm
dependencies are needed. Set `CHROME_PATH` if Chrome is installed elsewhere.

The script checks 47 viewport cases, including mobile 320–430px, 600px,
tablet 768–1180px, laptop 1200–1536px, and monitor 1600–3840px. Additional
cases cover breakpoint boundaries and short landscape windows. Five cases
approximate the available CSS viewport of a 1366×768 window at 80–200% zoom;
they do not automate the browser's actual zoom controls.

It detects horizontal viewport overflow and horizontal text clipping in selected
UI elements; tests FAQ, project dialog, focus containment/return, and Contact
navigation in four layout families; checks project tabs, keyboard End navigation,
and mouse drag. Screenshots and the machine-readable report are in `.qa/`.
The script closes its Chrome process and HTTP server when done.

Static checks: `node --check` for scripts, local HTML asset paths, CSS brace
structure, and `git diff --check`.

## Limits and deferred work

- Browser QA uses desktop Chrome emulation, not physical phones/tablets or Safari.
  Native touch gestures and actual browser zoom controls still need device QA.
- Contact and Resume retain their existing placeholders pending the owner's data.
- Comments remain browser-local, and the visitor counter remains local session
  data. Neither is backed by a shared service; neither was changed in this UI pass.
- Existing project claims/content are retained, not independently verified.
- Nothing has been deployed or pushed.
