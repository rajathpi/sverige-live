/* Göteborg: tour steps for the shared kit (../assets/js/guide-kit.js). Text lives in i18n.js (GBG_GUIDE).
   Loads before goteborg.js, which fires "sl:ready" after the first full render. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const card = (s) => () => [$(s) && $(s).closest(".card")];
  SLGuide.init({
    key: "slTour:goteborg",
    content: () => window.GBG_GUIDE,
    targets: [
      null,
      () => [$(".kpis")],
      card("#c-fc"),
      card("#c-mix"),
      card("#c-price"),
      () => [$("#feed"), $("#c-types")].map((e) => e && e.closest(".card")),
      null
    ],
    readyEvent: "sl:ready", langEvent: "sl:lang"
  });
})();
