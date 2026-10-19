/* Löner: tour steps and guide content for the shared kit (../assets/js/guide-kit.js). Text lives in i18n.js (LON_GUIDE).
   Loads before loner.js, which fires "lon:ready" after the first full render and "lon:lang" on a language change. */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s), esc = SL.esc;
  const card = (s) => () => [$(s) && $(s).closest(".card")];
  function boxSvg(L) {
    const k = "var(--c1)", lab = (x, y, s, a = "middle") => `<text x="${x}" y="${y}" text-anchor="${a}">${esc(s)}</text>`;
    const lead = (x, y1, y2) => `<line x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" stroke="var(--border-strong)"/>`;
    return `<svg class="gd-svg" viewBox="0 0 400 134" role="img" aria-label="${esc(L.alt)}">` +
      `<g stroke="${k}" stroke-width="1.5"><line x1="40" x2="360" y1="64" y2="64"/><line x1="40" x2="40" y1="56" y2="72"/><line x1="360" x2="360" y1="56" y2="72"/></g>` +
      `<rect x="110" y="52" width="150" height="24" rx="4" fill="${k}" fill-opacity=".22" stroke="${k}"/>` +
      `<line x1="170" x2="170" y1="50" y2="78" stroke="${k}" stroke-width="3"/>` +
      `<circle cx="192" cy="64" r="4.2" fill="var(--surface)" stroke="${k}" stroke-width="1.8"/>` +
      lead(170, 24, 47) + lead(192, 24, 56) + lab(166, 20, L.med, "end") + lab(196, 20, L.avg, "start") +
      [40, 110, 260, 360].map((x) => lead(x, 82, 90)).join("") + lab(40, 102, L.p10) + lab(110, 102, L.p25) + lab(260, 102, L.p75) + lab(360, 102, L.p90) +
      `<path d="M110 112v5h150v-5M185 117v4" fill="none" stroke="var(--border-strong)"/>` + lab(185, 132, L.half) + "</svg>";
  }
  ["en", "sv"].forEach((l) => { window.LON_GUIDE[l].info = window.LON_TEXT[l].infoLbl; });
  SLGuide.init({
    key: "lonTourDone",
    content: () => window.LON_GUIDE,
    targets: [
      null,
      () => [$(".controls .fld.grow"), $("#chips")],
      () => [...document.querySelectorAll(".controls .crow .fld:not(.grow)")],
      () => [$("#kpis")],
      card("#spread"), card("#mySal"), card("#trend"), card("#lb"),
      null
    ],
    readyEvent: "lon:ready", langEvent: "lon:lang",
    setLang: (l) => { const b = $(`#langSeg button[data-l="${l}"]`); if (b) b.click(); },
    decorate: (html, L) => html.replace("<!--svg-->", boxSvg(L.svg))
  });
})();
