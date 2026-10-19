/* Curated Kolada indicators for "Compare kommuner".
   id      Kolada KPI id (https://api.kolada.se/v3/kpi/<id>)
   name    short label in English and Swedish; title is Kolada's own Swedish name, fetched live too
   desc    one plain sentence in each language
   unit    display unit appended to values ("" = none), dec = decimals; "points" and "days" are translated by kommuner.js
   better  true = higher is better, false = lower is better, null = neutral (no good/bad reading)
   cat     category key from KOM_CATS
   The latest year with data for >= 200 kommuner is detected live in the browser, so nothing here is year-specific. */
window.KOM_CATS = [
  ["pop", { en: "Population & housing", sv: "Befolkning och bostäder" }],
  ["eco", { en: "Economy & tax", sv: "Ekonomi och skatt" }],
  ["work", { en: "Work & income", sv: "Arbete och försörjning" }],
  ["school", { en: "School & education", sv: "Skola och utbildning" }],
  ["care", { en: "Care & health", sv: "Omsorg och hälsa" }],
  ["life", { en: "Safety & democracy", sv: "Trygghet och demokrati" }]
];

window.KOM_KPIS = [
  { id: "N01951", name: { en: "Population", sv: "Folkmängd" }, title: "Invånare totalt, antal", unit: "", dec: 0, better: null, cat: "pop",
    desc: { en: "People living in the kommun on 31 December.", sv: "Personer som bor i kommunen den 31 december." } },
  { id: "N01963", name: { en: "Population change over the year", sv: "Befolkningsförändring under året" }, title: "Befolkningsförändring sedan föregående år, procent", unit: "%", dec: 2, better: null, cat: "pop",
    desc: { en: "How much the population grew or shrank compared with the year before.", sv: "Hur mycket folkmängden ökade eller minskade jämfört med året innan." } },
  { id: "N07917", name: { en: "New homes completed per 1 000 residents", sv: "Nya bostäder per 1 000 invånare" }, title: "Färdigställda bostäder, nybyggnad, antal/1000 inv", unit: "per 1 000", dec: 1, better: true, cat: "pop",
    desc: { en: "Newly built homes (houses and flats) finished during the year, per 1 000 residents.", sv: "Nybyggda bostäder (småhus och lägenheter) som blev klara under året, per 1 000 invånare." } },

  { id: "N00901", name: { en: "Municipal income tax rate", sv: "Kommunalskatt" }, title: "Skattesats till kommun (%)", unit: "%", dec: 2, better: false, cat: "eco",
    desc: { en: "The share of your taxable income the kommun takes as tax. The region's tax comes on top.", sv: "Den andel av din beskattningsbara inkomst som kommunen tar i skatt. Regionens skatt kommer ovanpå." } },
  { id: "N00906", name: { en: "Median earned income, age 20–64", sv: "Medianinkomst, 20–64 år" }, title: "Sammanräknad förvärvsinkomst i åldern 20-64 år (median), kr", unit: "kr", dec: 0, better: true, cat: "eco",
    desc: { en: "The middle yearly income before tax for people aged 20–64: half earn more, half less. Counts pay, business income, pensions and benefits, but not capital income.", sv: "Mittenvärdet av årsinkomsten före skatt för personer 20–64 år: hälften tjänar mer, hälften mindre. Räknar lön, företagsinkomst, pension och ersättningar, men inte kapitalinkomst." } },

  { id: "N03937", name: { en: "Open unemployment, age 18–65", sv: "Öppen arbetslöshet, 18–65 år" }, title: "Öppet arbetslösa av befolkningen, 18-65 år, andel (%)", unit: "%", dec: 1, better: false, cat: "work",
    desc: { en: "People aged 18–65 registered as openly unemployed, as a share of everyone that age (not only of those in the workforce).", sv: "Personer 18–65 år som är inskrivna som öppet arbetslösa, som andel av alla i åldersgruppen (inte bara av dem i arbetskraften)." } },
  { id: "N02267", name: { en: "Employment rate, age 20–64", sv: "Sysselsättningsgrad, 20–64 år" }, title: "Sysselsättningsgrad 20-64 år, andel (%)", unit: "%", dec: 1, better: true, cat: "work",
    desc: { en: "People aged 20–64 who have a job, as a share of everyone that age.", sv: "Personer 20–64 år som har ett arbete, som andel av alla i åldersgruppen." } },
  { id: "N31807", name: { en: "Residents receiving social assistance", sv: "Invånare med ekonomiskt bistånd" }, title: "Invånare som någon gång under året erhållit ekonomiskt bistånd", unit: "%", dec: 1, better: false, cat: "work",
    desc: { en: "Residents, children included, who received social assistance (ekonomiskt bistånd) at some point during the year.", sv: "Invånare, barn inräknade, som någon gång under året fick ekonomiskt bistånd." } },

  { id: "N15504", name: { en: "Grade 9 merit points (avg.)", sv: "Meritvärde i årskurs 9 (snitt)" }, title: "Elever i åk. 9, meritvärde lägeskommun, genomsnitt (17 ämnen)", unit: "points", dec: 1, better: true, cat: "school",
    desc: { en: "Average final grades of ninth-graders: the sum of their 17 best grades, where an A is 20 points. The maximum is 340.", sv: "Niondeklassarnas genomsnittliga slutbetyg: summan av de 17 bästa betygen, där ett A ger 20 poäng. Högsta möjliga är 340." } },
  { id: "N01982", name: { en: "Post-secondary education, age 25–64", sv: "Eftergymnasial utbildning, 25–64 år" }, title: "Invånare 25-64 år med eftergymnasial utbildning, andel (%)", unit: "%", dec: 1, better: true, cat: "school",
    desc: { en: "Residents aged 25–64 with education beyond upper secondary school, such as university.", sv: "Invånare 25–64 år med utbildning efter gymnasiet, till exempel på högskola eller universitet." } },
  { id: "N11102", name: { en: "Preschool children per staff member", sv: "Barn per anställd i förskolan" }, title: "Inskrivna barn per årsarbetare i förskolan, lägeskommun, antal", unit: "", dec: 1, better: false, cat: "school",
    desc: { en: "Children in preschool per full-time staff member. Fewer children per adult counts as better.", sv: "Barn i förskolan per heltidsanställd. Färre barn per vuxen räknas som bättre." } },

  { id: "N20014", name: { en: "Elder-care net cost per resident", sv: "Äldreomsorgens nettokostnad per invånare" }, title: "Nettokostnad äldreomsorg, kr/inv", unit: "kr", dec: 0, better: null, cat: "care",
    desc: { en: "What the kommun spends on elder care in a year, after fees and other income, divided by all residents.", sv: "Vad kommunen lägger på äldreomsorg under ett år, efter avgifter och andra intäkter, delat på alla invånare." } },
  { id: "N20891", name: { en: "Residents 65+ with home care or care home", sv: "Invånare 65+ med hemtjänst eller särskilt boende" }, title: "Invånare 65+ i särskilt boende eller med hemtjänst, andel (%)", unit: "%", dec: 1, better: null, cat: "care",
    desc: { en: "People aged 65+ who live in a care home or get home help, as a share of everyone 65+.", sv: "Personer 65+ som bor i särskilt boende eller har hemtjänst, som andel av alla 65+." } },
  { id: "N00938", name: { en: "Sickness benefit days, age 16–64", sv: "Sjukpenningdagar, 16–64 år" }, title: "Sjukpenningtalet, 16–64 år, dagar/registrerad försäkrad", unit: "days", dec: 1, better: false, cat: "care",
    desc: { en: "Days of sickness benefit paid in a year per insured person aged 16–64.", sv: "Antal dagar med sjukpenning som betalats ut under ett år per försäkrad person 16–64 år." } },

  { id: "N00301", name: { en: "Safety & security (municipal index)", sv: "Trygghet och säkerhet (kommunindex)" }, title: "Trygghet och säkerhet - Kommunindex", unit: "index", dec: 1, better: true, cat: "life",
    desc: { en: "An index from 0 to 100, where 100 is best, for how safe people feel. Calculated by Tillväxtverket from school and public-health surveys.", sv: "Ett index från 0 till 100, där 100 är bäst, för hur trygga människor känner sig. Beräknas av Tillväxtverket utifrån skol- och folkhälsoenkäter." } },
  { id: "N05401", name: { en: "Voter turnout, latest local election", sv: "Valdeltagande i senaste kommunalvalet" }, title: "Valdeltagande i senaste kommunalvalet, andel (%)", unit: "%", dec: 0, better: true, cat: "life",
    desc: { en: "Share of eligible voters who voted in the latest local election. The figure repeats each year until the next election.", sv: "Andel röstberättigade som röstade i det senaste kommunalvalet. Siffran upprepas varje år tills nästa val." } }
];
