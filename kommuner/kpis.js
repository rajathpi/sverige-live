/* Curated Kolada indicators for "Compare kommuner".
   id      Kolada KPI id (https://api.kolada.se/v3/kpi/<id>)
   label   short English label; the Swedish Kolada title is fetched live and shown next to it
   unit    display unit appended to values ("" = none), dec = decimals
   better  true = higher is better, false = lower is better, null = neutral (no good/bad reading)
   cat     category key from KOM_CATS
   The latest year with data for >= 200 kommuner is detected live in the browser, so nothing here is year-specific. */
window.KOM_CATS = [
  ["pop", "Population & housing"],
  ["eco", "Economy & tax"],
  ["work", "Work & income"],
  ["school", "School & education"],
  ["care", "Care & health"],
  ["life", "Safety & democracy"]
];

window.KOM_KPIS = [
  { id: "N01951", label: "Population", sv: "Invånare totalt, antal", unit: "", dec: 0, better: null, cat: "pop" },
  { id: "N01963", label: "Population change over the year", sv: "Befolkningsförändring sedan föregående år, procent", unit: "%", dec: 2, better: null, cat: "pop" },
  { id: "N07917", label: "New homes completed per 1 000 residents", sv: "Färdigställda bostäder, nybyggnad, antal/1000 inv", unit: "per 1 000", dec: 1, better: true, cat: "pop" },

  { id: "N00901", label: "Municipal income tax rate", sv: "Skattesats till kommun (%)", unit: "%", dec: 2, better: false, cat: "eco" },
  { id: "N00906", label: "Median earned income, age 20–64", sv: "Sammanräknad förvärvsinkomst i åldern 20-64 år (median), kr", unit: "kr", dec: 0, better: true, cat: "eco" },

  { id: "N03937", label: "Open unemployment, age 18–65", sv: "Öppet arbetslösa av befolkningen, 18-65 år, andel (%)", unit: "%", dec: 1, better: false, cat: "work" },
  { id: "N02267", label: "Employment rate, age 20–64", sv: "Sysselsättningsgrad 20-64 år, andel (%)", unit: "%", dec: 1, better: true, cat: "work" },
  { id: "N31807", label: "Residents receiving social assistance", sv: "Invånare som någon gång under året erhållit ekonomiskt bistånd", unit: "%", dec: 1, better: false, cat: "work" },

  { id: "N15504", label: "Grade 9 merit points (avg.)", sv: "Elever i åk. 9, meritvärde lägeskommun, genomsnitt (17 ämnen)", unit: "points", dec: 1, better: true, cat: "school" },
  { id: "N01982", label: "Post-secondary education, age 25–64", sv: "Invånare 25-64 år med eftergymnasial utbildning, andel (%)", unit: "%", dec: 1, better: true, cat: "school" },
  { id: "N11102", label: "Preschool children per staff member", sv: "Inskrivna barn per årsarbetare i förskolan, lägeskommun, antal", unit: "", dec: 1, better: false, cat: "school" },

  { id: "N20014", label: "Elder-care net cost per resident", sv: "Nettokostnad äldreomsorg, kr/inv", unit: "kr", dec: 0, better: null, cat: "care" },
  { id: "N20891", label: "Residents 65+ with home care or care home", sv: "Invånare 65+ i särskilt boende eller med hemtjänst, andel (%)", unit: "%", dec: 1, better: null, cat: "care" },
  { id: "N00938", label: "Sickness benefit days, age 16–64", sv: "Sjukpenningtalet, 16–64 år, dagar/registrerad försäkrad", unit: "days", dec: 1, better: false, cat: "care" },

  { id: "N00301", label: "Safety & security (municipal index)", sv: "Trygghet och säkerhet - Kommunindex", unit: "index", dec: 1, better: true, cat: "life" },
  { id: "N05401", label: "Voter turnout, latest local election", sv: "Valdeltagande i senaste kommunalvalet, andel (%)", unit: "%", dec: 0, better: true, cat: "life" }
];
