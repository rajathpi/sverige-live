/* Löner: interface text in English and Swedish, plus the labels SCB's tables do not carry in a short form.
   Occupation, sector and region names come from SCB in the chosen language. */
window.LON_TEXT = {
  en: {
    h1: "Löner <span>by occupation</span>",
    lead: "Monthly salaries for every occupation in Sweden, 2014–2025, from SCB's salary structure statistics. Pick up to five occupations to compare.",
    occs: "Occupations", sector: "Sector", sex: "Sex", year: "Year",
    total: "Total", women: "Women", men: "Men",
    search: "Search an occupation or SSYK code…",
    browse: "Browse all occupations", hideBrowse: "Hide the list", copy: "Copy link to this view", copied: "Link copied", clear: "Clear",
    none: "Nothing selected. Search above, browse the list or click a leaderboard row.",
    max: "Five at a time. Remove one first.",
    focus: "Show its figures first", remove: "Remove",
    spreadT: "How pay is spread", spreadSub: "{sex}, {sector}, {year}. All occupations shown for reference.",
    kBox: "middle half (25th–75th percentile)", kWhisk: "10th–90th percentile", kMed: "median", kAvg: "average",
    srcDisp: "average salary and salary dispersion by sector, occupation and sex",
    standT: "Where do you stand?", standSub: "Type a monthly salary before tax, in kronor. It stays in your browser.",
    standNote: "Estimated by drawing straight lines between the published percentiles (10, 25, 50, 75, 90).",
    standEmpty: "Your position among the selected occupations shows up here.",
    below: "below the 10th percentile", above: "above the 90th percentile", pctl: "about the {p}th percentile",
    earnMore: "You earn more than about {p} % of them.", noSpread: "no spread published",
    trendT: "Over time", trendSub: "{meas}, {sex}, {sector}, monthly kronor.",
    mMed: "Median", mAvg: "Average", proj: "Project forward", idx: "Index, 2014 = 100",
    trendNote: "Dashed lines carry each occupation's average yearly change over its last five years forward. That is a guess, not a statistic. In 2018 municipalities and regions recoded some jobs, so occupations common there can jump that year.",
    projected: "projected",
    genderT: "Women and men", genderSub: "Median monthly salary, {sector}, {year}.",
    ratioT: "Women's pay as a share of men's", ratioSub: "Women's median as a percentage of men's, every year. 100 % means equal.",
    ageT: "By age", eduT: "By education", regT: "By region",
    breakSub: "Average monthly salary, {sex}, {sector}, {year}.",
    lbT: "Leaderboards", lbSub: "{sector}, {year}. 429 occupations.", lbTop: "Highest", lbLow: "Lowest", lbGrow: "Fastest growth", lbBig: "Most employees", lbGap: "Widest gender gap",
    lbNote: "Click a row to add it to the comparison. Medians for the chosen sector and year; growth is per year over five years.",
    perYear: "/yr", empl: "employees", womenEarnMore: "women higher", menEarnMore: "men higher",
    relT: "Nearby occupations", relSub: "The other occupations in {group}, by median, {year}.",
    jobsT: "Job ads right now", jobsSub: "{occ}. Open ads in Platsbanken.",
    jobsSrc: "Open ads in Platsbanken, read live from Arbetsförmedlingen's", openAds: "open ads", byCounty: "Ads by county", latest: "Newest ads", noAds: "No open ads for this occupation right now.", allAds: "All ads in Platsbanken",
    methT: "Sources and methods",
    kMedian: "Median", kAverage: "Average", kEmp: "Employees", kGap: "Women's median", kGrowth: "Change per year", kNow: "Projected {y}",
    kGapSub: "of men's", kGrowSub: "median, {a}–{b}", kNowSub: "if the last five years continue", kEmpSub: "{year}, rounded by SCB", kMedSub: "half earn more, half less", kAvgSub: "pulled up by the top earners",
    na: "Not published", naWhy: "SCB leaves out figures based on too few people.",
    loading: "Loading…", status: "SCB data · {n} occupations · latest year {y}", statusErr: "Could not reach SCB: {e}",
    allOcc: "All occupations", empty: "No figures published for this choice.",
    sectors: "sectors"
  },
  sv: {
    h1: "Löner <span>per yrke</span>",
    lead: "Månadslöner för alla yrken i Sverige 2014–2025, från SCB:s lönestrukturstatistik. Välj upp till fem yrken att jämföra.",
    occs: "Yrken", sector: "Sektor", sex: "Kön", year: "År",
    total: "Totalt", women: "Kvinnor", men: "Män",
    search: "Sök yrke eller SSYK-kod…",
    browse: "Bläddra bland alla yrken", hideBrowse: "Dölj listan", copy: "Kopiera länk till vyn", copied: "Länken är kopierad", clear: "Rensa",
    none: "Inget valt. Sök ovan, bläddra i listan eller klicka på en rad i topplistan.",
    max: "Fem åt gången. Ta bort ett först.",
    focus: "Visa dess siffror först", remove: "Ta bort",
    spreadT: "Så sprids lönerna", spreadSub: "{sex}, {sector}, {year}. Samtliga yrken visas som jämförelse.",
    kBox: "mittersta hälften (25:e–75:e percentilen)", kWhisk: "10:e–90:e percentilen", kMed: "median", kAvg: "medel",
    srcDisp: "genomsnittlig månadslön och lönespridning efter sektor, yrke och kön",
    standT: "Var hamnar du?", standSub: "Skriv en månadslön före skatt i kronor. Den stannar i din webbläsare.",
    standNote: "Uppskattat med raka linjer mellan de publicerade percentilerna (10, 25, 50, 75, 90).",
    standEmpty: "Här syns var du hamnar bland de valda yrkena.",
    below: "under 10:e percentilen", above: "över 90:e percentilen", pctl: "ungefär {p}:e percentilen",
    earnMore: "Du tjänar mer än ungefär {p} % av dem.", noSpread: "ingen spridning publicerad",
    trendT: "Över tid", trendSub: "{meas}, {sex}, {sector}, kronor i månaden.",
    mMed: "Median", mAvg: "Medel", proj: "Skriv fram", idx: "Index, 2014 = 100",
    trendNote: "Streckade linjer skriver fram varje yrkes genomsnittliga årliga förändring de senaste fem åren. Det är en gissning, ingen statistik. 2018 kodade kommuner och regioner om vissa tjänster, så yrken som är vanliga där kan hoppa det året.",
    projected: "framskrivet",
    genderT: "Kvinnor och män", genderSub: "Medianlön i månaden, {sector}, {year}.",
    ratioT: "Kvinnors lön som andel av mäns", ratioSub: "Kvinnors medianlön i procent av mäns, varje år. 100 % betyder lika.",
    ageT: "Efter ålder", eduT: "Efter utbildning", regT: "Efter region",
    breakSub: "Genomsnittlig månadslön, {sex}, {sector}, {year}.",
    lbT: "Topplistor", lbSub: "{sector}, {year}. 429 yrken.", lbTop: "Högst", lbLow: "Lägst", lbGrow: "Snabbast ökning", lbBig: "Flest anställda", lbGap: "Störst skillnad kvinnor/män",
    lbNote: "Klicka på en rad för att lägga till yrket. Medianlön för vald sektor och år; ökningen är per år över fem år.",
    perYear: "/år", empl: "anställda", womenEarnMore: "kvinnor högre", menEarnMore: "män högre",
    relT: "Närliggande yrken", relSub: "Övriga yrken inom {group}, efter medianlön, {year}.",
    jobsT: "Platsannonser just nu", jobsSub: "{occ}. Öppna annonser i Platsbanken.",
    jobsSrc: "Öppna annonser i Platsbanken, hämtade direkt från Arbetsförmedlingens", openAds: "öppna annonser", byCounty: "Annonser per län", latest: "Senaste annonserna", noAds: "Inga öppna annonser för yrket just nu.", allAds: "Alla annonser i Platsbanken",
    methT: "Källor och metod",
    kMedian: "Medianlön", kAverage: "Medellön", kEmp: "Anställda", kGap: "Kvinnors medianlön", kGrowth: "Förändring per år", kNow: "Framskrivet {y}",
    kGapSub: "av mäns", kGrowSub: "median, {a}–{b}", kNowSub: "om de senaste fem åren fortsätter", kEmpSub: "{year}, avrundat av SCB", kMedSub: "hälften tjänar mer, hälften mindre", kAvgSub: "dras upp av de högsta lönerna",
    na: "Ej publicerat", naWhy: "SCB redovisar inte siffror som bygger på för få personer.",
    loading: "Hämtar…", status: "SCB-data · {n} yrken · senaste år {y}", statusErr: "Kunde inte nå SCB: {e}",
    allOcc: "Samtliga yrken", empty: "Inga siffror publicerade för det här valet.",
    sectors: "sektorer"
  }
};

/* SSYK 2012 occupational fields (first digit). */
window.LON_FIELDS = {
  "0": { en: "Armed forces", sv: "Militärt arbete" },
  "1": { en: "Managers", sv: "Chefsyrken" },
  "2": { en: "Jobs needing advanced university education", sv: "Yrken med krav på fördjupad högskolekompetens" },
  "3": { en: "Jobs needing university education or equivalent", sv: "Yrken med krav på högskolekompetens eller motsvarande" },
  "4": { en: "Administration and customer service", sv: "Yrken inom administration och kundtjänst" },
  "5": { en: "Service, care and sales", sv: "Service-, omsorgs- och försäljningsyrken" },
  "6": { en: "Agriculture, gardening, forestry and fishing", sv: "Yrken inom lantbruk, trädgård, skogsbruk och fiske" },
  "7": { en: "Construction and manufacturing", sv: "Yrken inom byggverksamhet och tillverkning" },
  "8": { en: "Machine operation and transport", sv: "Yrken inom maskinell tillverkning och transport m.m." },
  "9": { en: "Jobs needing short training or an introduction", sv: "Yrken med krav på kortare utbildning eller introduktion" }
};

/* Education levels (SUN), short names. "US" (unknown) is left out of the chart. */
window.LON_EDU = {
  "1": { en: "School, under 9 years", sv: "Förgymnasial, under 9 år" },
  "2": { en: "Compulsory school, 9–10 years", sv: "Förgymnasial, 9–10 år" },
  "3": { en: "Upper secondary, up to 2 years", sv: "Gymnasial, högst 2 år" },
  "4": { en: "Upper secondary, 3 years", sv: "Gymnasial, 3 år" },
  "5": { en: "Post-secondary, under 3 years", sv: "Eftergymnasial, under 3 år" },
  "6": { en: "Post-secondary, 3 years or more", sv: "Eftergymnasial, 3 år eller mer" },
  "7": { en: "Doctoral studies", sv: "Forskarutbildning" }
};

/* NUTS 2 regions used by SCB's regional salary tables. */
window.LON_REGIONS = {
  SE: { en: "Sweden", sv: "Riket" },
  SE11: { en: "Stockholm", sv: "Stockholm" },
  SE12: { en: "East-Central Sweden", sv: "Östra Mellansverige" },
  SE21: { en: "Småland and the islands", sv: "Småland med öarna" },
  SE22: { en: "South Sweden", sv: "Sydsverige" },
  SE23: { en: "West Sweden", sv: "Västsverige" },
  SE31: { en: "North-Central Sweden", sv: "Norra Mellansverige" },
  SE32: { en: "Central Norrland", sv: "Mellersta Norrland" },
  SE33: { en: "Upper Norrland", sv: "Övre Norrland" }
};
