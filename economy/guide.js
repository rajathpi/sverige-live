/* Economy: tour steps for the shared kit (../assets/js/guide-kit.js). Text lives in i18n.js (ECO_GUIDE).
   Loads before economy.js, which fires "sl:ready" after the first full render. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const card = (s) => () => [$(s) && $(s).closest(".card")];
  SLGuide.init({
    key: "slTour:economy",
    content: () => window.ECO_GUIDE,
    targets: [
      null,
      () => [$("#kpis")],
      card("#infl-chart"), card("#unemp-chart"), card("#house-chart"), card("#mood-chart"), card("#fx-chart"),
      () => [$(".calendar")]
    ],
    readyEvent: "sl:ready", langEvent: "sl:lang"
  });
})();
