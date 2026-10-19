/* Kommuner: tour targets for the shared kit (../assets/js/guide-kit.js). Text lives in i18n.js (KOM_GUIDE).
   Loads before kommuner.js, which fires "sl:ready" after the first full render. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const card = (s) => () => [$(s) && $(s).closest(".card")];
  SLGuide.init({
    key: "slTour:kommuner",
    content: () => window.KOM_GUIDE,
    targets: [
      null,
      card("#kpiSel"),
      card("#map"),
      card("#chips"),
      () => [$("#copyLink")],
      card("#lists"),
      card("#trend"),
      card("#profile")
    ],
    readyEvent: "sl:ready", langEvent: "sl:lang"
  });
})();
