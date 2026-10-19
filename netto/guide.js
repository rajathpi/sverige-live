/* Netto: tour steps for the shared kit (../assets/js/guide-kit.js). Text lives in i18n.js (NET_GUIDE).
   Loads before netto.js, which fires "sl:ready" after the first full render. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const card = (s) => () => [$(s) && $(s).closest(".card")];
  SLGuide.init({
    key: "slTour:netto",
    // The guide text carries {y}; the kit prints it as written, so it is filled in here.
    content: () => {
      const g = window.NET_GUIDE, y = window.NET_YEAR || "";
      const fill = (v) => (typeof v === "string" ? v.split("{y}").join(y) : Array.isArray(v) ? v.map(fill) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)])) : v);
      return fill(g);
    },
    targets: [null, card("#inTitle"), () => [$("#answer")], card("#map"), card("#best"), card("#methods")],
    readyEvent: "sl:ready", langEvent: "sl:lang"
  });
})();
