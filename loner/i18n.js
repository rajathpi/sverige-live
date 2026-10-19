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
    mMed: "Median", mAvg: "Average", proj: "Show forecast", idx: "Index, 2014 = 100",
    trendNote: "Dashed lines carry each occupation's average yearly change over its last five years forward. That is a guess, not a statistic. In 2018 municipalities and regions recoded some jobs, so occupations common there can jump that year.",
    trendNoteFc: "Dashed lines are a forecast that follows national pay growth. Tested on {a}–{b}, it was off by {m1} % one year ahead and {m3} % three years ahead (the old five-year projection: {n1} %), and the shaded band held about {cov} in 10 real outcomes. Other sectors and measures show the simple projection. In 2018 municipalities and regions recoded some jobs, so occupations common there can jump that year.",
    toNetto: "What is that after tax?", toEco: "How does this compare with inflation?", toKom: "Compare kommuner",
    kFcSub: "likely {lo}–{hi} kr, a forecast",
    tOcc: "Occupation", tYear: "Year", tRatio: "Women's median, % of men's",
    projected: "forecast",
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
    kMedian: "Median", kAverage: "Average", kEmp: "Employees", kGap: "Women's median", kGrowth: "Change per year", kNow: "Expected {y}",
    kGapSub: "of men's", kGrowSub: "median, {a}–{b}", kNowSub: "if the last five years continue", kEmpSub: "{year}, rounded by SCB", kMedSub: "half earn more, half less", kAvgSub: "pulled up by the top earners",
    na: "Not published", naWhy: "SCB leaves out figures based on too few people.",
    loading: "Loading…", status: "SCB data · {n} occupations · latest year {y}", statusErr: "Could not reach SCB: {e}",
    allOcc: "All occupations", empty: "No figures published for this choice.",
    sectors: "sectors",
    tourBtn: "Take the tour", guideBtn: "Guide", guideLink: "User guide", infoLbl: "How to read this"
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
    mMed: "Median", mAvg: "Medel", proj: "Visa prognos", idx: "Index, 2014 = 100",
    trendNote: "Streckade linjer skriver fram varje yrkes genomsnittliga årliga förändring de senaste fem åren. Det är en gissning, ingen statistik. 2018 kodade kommuner och regioner om vissa tjänster, så yrken som är vanliga där kan hoppa det året.",
    trendNoteFc: "Streckade linjer är en prognos som följer lönerna i hela landet. Testad på {a}–{b} slog den fel med {m1} % ett år framåt och {m3} % tre år framåt (den gamla femårsframskrivningen: {n1} %), och det skuggade bandet rymde ungefär {cov} av 10 verkliga utfall. Andra sektorer och mått visar den enkla framskrivningen. 2018 kodade kommuner och regioner om vissa tjänster, så yrken som är vanliga där kan hoppa det året.",
    toNetto: "Vad blir det efter skatt?", toEco: "Hur står det sig mot inflationen?", toKom: "Jämför kommuner",
    kFcSub: "troligen {lo}–{hi} kr, en prognos",
    tOcc: "Yrke", tYear: "År", tRatio: "Kvinnors median, % av mäns",
    projected: "prognos",
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
    kMedian: "Medianlön", kAverage: "Medellön", kEmp: "Anställda", kGap: "Kvinnors medianlön", kGrowth: "Förändring per år", kNow: "Väntat {y}",
    kGapSub: "av mäns", kGrowSub: "median, {a}–{b}", kNowSub: "om de senaste fem åren fortsätter", kEmpSub: "{year}, avrundat av SCB", kMedSub: "hälften tjänar mer, hälften mindre", kAvgSub: "dras upp av de högsta lönerna",
    na: "Ej publicerat", naWhy: "SCB redovisar inte siffror som bygger på för få personer.",
    loading: "Hämtar…", status: "SCB-data · {n} yrken · senaste år {y}", statusErr: "Kunde inte nå SCB: {e}",
    allOcc: "Samtliga yrken", empty: "Inga siffror publicerade för det här valet.",
    sectors: "sektorer",
    tourBtn: "Ta rundturen", guideBtn: "Guide", guideLink: "Användarguide", infoLbl: "Så läser du detta"
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

/* Walkthrough and guide text (guide.js). Section html is trusted markup; <!--svg--> marks where the box-plot sketch goes. */
window.LON_GUIDE = {
  en: {
    title: "Guide", close: "Close the guide", nav: "Sections", again: "Take the tour again",
    svg: { alt: "One box-plot row: whisker from P10 to P90, box from P25 to P75, a tick at the median and a circle at the average.", p10: "P10", p25: "P25", p75: "P75", p90: "P90", med: "Median", avg: "Average", half: "middle half" },
    tour: {
      label: "Page tour", of: "{n} of {total}", next: "Next", back: "Back", skip: "Skip", done: "Done", guide: "Open the guide",
      steps: [
        { t: "Welcome", b: "What do people in Sweden earn? This page shows monthly pay for every job, from official statistics. A quick tour, under a minute." },
        { t: "Pick jobs", b: "Pick up to five jobs to compare. Each gets its own colour, and that colour follows it through every chart." },
        { t: "Filters", b: "Narrow it down: private or public sector, women or men, and any year from 2014." },
        { t: "Key figures", b: "The big numbers are for the first job in your list. Click another job's chip to put it first." },
        { t: "How pay is spread", b: "Each row is one job. The box holds the middle half of earners, the thick tick is the median (the middle salary), and the line reaches from the lowest-paid tenth to the highest-paid tenth. The grey row is all jobs, for reference." },
        { t: "Where do you stand?", b: "Type your own monthly salary to see where you land. It never leaves your browser." },
        { t: "Over time", b: "Solid lines are measured pay. Dashed lines are a forecast, and the shaded band shows where the first job's pay will likely land." },
        { t: "Leaderboards", b: "Highest paid, fastest growing and more. Click any row to add that job to your comparison." },
        { t: "All set", b: "Hover or tap any chart for exact numbers. Words like median or percentile are explained in the Guide." }
      ]
    },
    sections: [
      { id: "what", h: "What this page shows", html: `
<p>This page shows what people in Sweden earn each month, for about 430 occupations from 2014 to 2025. The figures are official: Statistics Sweden (SCB) collects them every autumn for the National Mediation Office.</p>
<p>You can compare up to five jobs, split them by sector, sex and year, and see how pay is spread, how it changes over time and how it differs by age, education and region.</p>` },
      { id: "use", h: "How to use it", html: `
<ol>
<li><b>Pick jobs.</b> Search by name or SSYK code, browse the full list, or click a row in a leaderboard. You can have five at a time, each with its own colour.</li>
<li><b>Filter.</b> Sector, Sex and Year narrow every chart at once.</li>
<li><b>The first job leads.</b> It drives the big numbers at the top. Click another job's chip to move it to the front.</li>
<li><b>Hover or tap</b> a chart for exact numbers.</li>
<li><b>Share a view.</b> "Copy link to this view" keeps your jobs, filters and language.</li>
<li><b>Browse all occupations</b> opens the whole list, grouped by field.</li>
</ol>` },
      { id: "charts", h: "Reading the charts", html: "", sub: [
        { id: "spread", h: "How pay is spread", html: `
<p>Each row is one job. The <b>box</b> holds the middle half of earners, the thick <b>tick</b> is the median, the <b>circle</b> is the average, and the <b>line</b> reaches from the 10th to the 90th percentile.</p>
<!--svg-->
<p>The grey "All occupations" row is there for reference. A job keeps the same colour in every chart. If you type your salary under "Where do you stand?", a dashed line marks it here.</p>` },
        { id: "stand", h: "Where do you stand?", html: `
<p>Type your monthly salary before tax. For each chosen job, and for all occupations, you see roughly which percentile you land on and how many earn less than you.</p>
<p>It is an estimate: straight lines are drawn between the published percentiles. What you type stays in your browser.</p>` },
        { id: "trend", h: "Over time", html: `
<p>One line per job. The buttons switch between median, average and the percentiles.</p>
<ul>
<li><b>Solid lines and dots</b> are measured pay.</li>
<li><b>Dashed lines</b> are a forecast three years ahead. For the median in all sectors it comes from a model tested on past years, with a shaded band for the first job: about 8 in 10 real outcomes landed inside it. Elsewhere it simply carries the last five years forward.</li>
<li><b>The shaded band</b> (first job, median only) is the middle half of earners.</li>
<li><b>Index, 2014 = 100</b> sets every job to 100 in its first year, so you compare growth rather than level.</li>
</ul>` },
        { id: "gender", h: "Women and men", html: `
<p>The median pay of women and men in each job. The orange dot is women, the teal dot is men, and the number on the right is women's pay as a share of men's.</p>` },
        { id: "ratio", h: "Women's pay as a share of men's", html: `
<p>Women's median as a percentage of men's, every year. 100 % means equal; below 100 means women's median is lower.</p>
<p>It compares the same occupation, not different jobs, and is not adjusted for things like age, education or experience.</p>` },
        { id: "breakdown", h: "By age, education and region", html: `
<p>Three small charts show average monthly pay by age group, education level and region. One row per group, one dot per job in the job's colour. The grey ring is all occupations.</p>
<p>Hover a dot for the exact figure and the number of employees. A missing dot means too few people for SCB to publish it.</p>` },
        { id: "lb", h: "Leaderboards", html: `
<p>Rankings of all occupations for the sector and year you chose: highest or lowest median, fastest growth (yearly change in the median over five years), most employees and widest gender gap.</p>
<p>Click a row to add that job to your comparison. Highlighted rows are already in it.</p>` },
        { id: "rel", h: "Nearby occupations", html: `
<p>Other jobs in the same occupation group as your first job, sorted by median pay. Useful for seeing where a job sits among its neighbours. Click one to add it.</p>` },
        { id: "jobs", h: "Job ads", html: `
<p>How many job ads are open right now for your first job's occupation group, split by county, plus the newest ads. They come live from Arbetsförmedlingen (Platsbanken) and are not part of the salary statistics.</p>
<p>Ads are counted for the 4-digit group, which can be broader than the job title.</p>` }
      ] },
      { id: "terms", h: "Terms", html: `
<dl>
<dt>Monthly salary</dt><dd>Basic pay plus fixed allowances, before tax, converted to full time. SCB measures it once a year, in the autumn.</dd>
<dt>Median</dt><dd>The middle salary: half of the people earn more, half earn less. Usually the best single number for typical pay.</dd>
<dt>Average</dt><dd>Total pay divided by the number of people. It is usually higher than the median because a few very high salaries pull it up.</dd>
<dt>Percentile (P10, P25, P75, P90)</dt><dd>A spot in the line-up of everyone from lowest to highest paid. P10 means 10 % earn less and 90 % earn more. P25, P75 and P90 work the same way. P50 is the median.</dd>
<dt>Middle half</dt><dd>The range from P25 to P75: half of the people earn a salary in this range. It is the box in the chart.</dd>
<dt>Sector</dt><dd>Who the employer is. <i>All sectors</i>; <i>public sector</i> (central government, municipalities, regions); <i>private sector</i> (manual workers, non-manual workers).</dd>
<dt>SSYK code</dt><dd>The 4-digit occupation code in Sweden's standard classification, SSYK 2012. The first digit is the broad field: 2 is jobs needing advanced university education, 5 is service, care and sales, and so on.</dd>
<dt>Occupation group</dt><dd>Related occupations that share the first three digits of the code.</dd>
<dt>Women's pay as a share of men's</dt><dd>Women's median divided by men's median, as a percentage, for the same job, sector and year. 100 % is equal.</dd>
<dt>Change per year</dt><dd>The average yearly change in the median over the last five years with data.</dd>
<dt>Forecast</dt><dd>The dashed line. It follows national pay growth, because Swedish pay moves together through the wage agreements, and expects part of an unusual one-year jump to even out. It was chosen and checked by forecasting past years and comparing with what SCB later published.</dd>
<dt>Index, 2014 = 100</dt><dd>Every line is rescaled to 100 in its first year. 112 means 12 % higher than then.</dd>
<dt>Employees</dt><dd>The number of employees in the job. SCB rounds these figures.</dd>
<dt>Not published</dt><dd>SCB leaves out a figure when it rests on too few people.</dd>
<dt>Regions</dt><dd>The 8 NUTS 2 regions, Sweden's statistical regions: Stockholm, East-Central Sweden, Småland and the islands, South Sweden, West Sweden, North-Central Sweden, Central Norrland and Upper Norrland.</dd>
<dt>Education levels</dt><dd>Seven levels, from compulsory school to doctoral studies: under 9 years, 9–10 years, upper secondary up to 2 years, upper secondary 3 years, post-secondary under 3 years, post-secondary 3 years or more, doctoral.</dd>
</dl>` },
      { id: "limits", h: "Good to know", html: `
<ul>
<li>The forecast is this site's own estimate, not a figure from SCB, and its band is a likely range, not a promise.</li>
<li>In 2018 municipalities and regions recoded some jobs, so occupations common there can jump that year without pay really changing.</li>
<li>All figures are before tax.</li>
<li>Pay is converted to full time, so it says nothing about hours worked.</li>
<li>Small occupations can be missing for some years, sectors, sexes, ages or regions.</li>
<li>SCB keeps 2014–2022 and 2023–2025 in separate tables; this page joins them.</li>
</ul>` },
      { id: "sources", h: "Where the data comes from", html: `
<p>Salaries come from SCB's salary structure statistics, produced for the National Mediation Office (<a href="https://www.mi.se/">Medlingsinstitutet</a>), through SCB's open PxWebApi. Job ads come from the JobSearch API at <a href="https://jobtechdev.se">JobTech / Arbetsförmedlingen</a>.</p>
<p>Everything is fetched live in your browser when you open the page. Nothing is stored on a server. Table names are listed under "Sources and methods" at the bottom of the page.</p>` },
      { id: "faq", h: "Questions", html: `
<dl>
<dt>Is my salary stored?</dt><dd>No. What you type stays in your browser. It is not sent anywhere and is not part of the shared link.</dd>
<dt>Why is a figure missing?</dt><dd>It says "Not published" when SCB leaves out a figure that rests on too few people. Try all sectors, both sexes, another year or a larger occupation.</dd>
<dt>How do I share what I see?</dt><dd>Press "Copy link to this view" under the job chips and send the link. It keeps your jobs, filters and language.</dd>
</dl>` }
    ]
  },
  sv: {
    title: "Guide", close: "Stäng guiden", nav: "Avsnitt", again: "Ta rundturen igen",
    svg: { alt: "En rad i ett lådagram: streck från P10 till P90, låda från P25 till P75, ett märke vid medianen och en cirkel vid medelvärdet.", p10: "P10", p25: "P25", p75: "P75", p90: "P90", med: "Median", avg: "Medel", half: "mittersta hälften" },
    tour: {
      label: "Rundtur på sidan", of: "{n} av {total}", next: "Nästa", back: "Tillbaka", skip: "Hoppa över", done: "Klar", guide: "Öppna guiden",
      steps: [
        { t: "Välkommen", b: "Vad tjänar folk i Sverige? Här ser du månadslönen för alla yrken, från officiell statistik. En snabb rundtur, under en minut." },
        { t: "Välj yrken", b: "Välj upp till fem yrken att jämföra. Varje yrke får en egen färg som följer med genom alla diagram." },
        { t: "Filter", b: "Snäva in: privat eller offentlig sektor, kvinnor eller män, och valfritt år från 2014." },
        { t: "Nyckeltal", b: "De stora siffrorna gäller det första yrket i din lista. Klicka på ett annat yrkes knapp för att lägga det först." },
        { t: "Så sprids lönerna", b: "Varje rad är ett yrke. Lådan rymmer den mittersta hälften av löntagarna, det tjocka strecket är medianen (mittenlönen) och linjen går från de lägst betalda tio procenten till de högst betalda tio procenten. Den grå raden är alla yrken, som jämförelse." },
        { t: "Var hamnar du?", b: "Skriv in din egen månadslön och se var du hamnar. Den lämnar aldrig din webbläsare." },
        { t: "Över tid", b: "Hela linjer är uppmätta löner. Streckade linjer är en prognos, och det skuggade bandet visar var det första yrkets lön troligen hamnar." },
        { t: "Topplistor", b: "Högst lön, snabbast ökning och mer. Klicka på en rad för att lägga till yrket i jämförelsen." },
        { t: "Allt klart", b: "Håll över eller tryck på ett diagram för exakta siffror. Ord som median och percentil förklaras i guiden." }
      ]
    },
    sections: [
      { id: "what", h: "Det här visar sidan", html: `
<p>Sidan visar vad människor i Sverige tjänar i månaden, för ungefär 430 yrken 2014–2025. Siffrorna är officiell statistik: SCB samlar in dem varje höst åt Medlingsinstitutet.</p>
<p>Du kan jämföra upp till fem yrken, dela upp dem efter sektor, kön och år, och se hur lönerna sprids, förändras över tid och skiljer sig efter ålder, utbildning och region.</p>` },
      { id: "use", h: "Så använder du den", html: `
<ol>
<li><b>Välj yrken.</b> Sök på namn eller SSYK-kod, bläddra i hela listan eller klicka på en rad i en topplista. Du kan ha fem åt gången, var och en med sin färg.</li>
<li><b>Filtrera.</b> Sektor, Kön och År snävar in alla diagram samtidigt.</li>
<li><b>Det första yrket styr.</b> Det styr de stora siffrorna högst upp. Klicka på ett annat yrkes knapp för att flytta det först.</li>
<li><b>Håll över eller tryck</b> på ett diagram för exakta siffror.</li>
<li><b>Dela en vy.</b> "Kopiera länk till vyn" behåller dina yrken, filter och språk.</li>
<li><b>Bläddra bland alla yrken</b> öppnar hela listan, ordnad efter yrkesområde.</li>
</ol>` },
      { id: "charts", h: "Så läser du diagrammen", html: "", sub: [
        { id: "spread", h: "Så sprids lönerna", html: `
<p>Varje rad är ett yrke. <b>Lådan</b> rymmer den mittersta hälften av löntagarna, det tjocka <b>strecket</b> är medianen, <b>cirkeln</b> är medelvärdet och <b>linjen</b> går från 10:e till 90:e percentilen.</p>
<!--svg-->
<p>Den grå raden "Samtliga yrken" är en jämförelse. Ett yrke har samma färg i alla diagram. Skriver du in din lön under "Var hamnar du?" markeras den här med en streckad linje.</p>` },
        { id: "stand", h: "Var hamnar du?", html: `
<p>Skriv in din månadslön före skatt. För varje valt yrke, och för samtliga yrken, ser du ungefär vilken percentil du hamnar på och hur många som tjänar mindre än du.</p>
<p>Det är en uppskattning: raka linjer dras mellan de publicerade percentilerna. Det du skriver stannar i din webbläsare.</p>` },
        { id: "trend", h: "Över tid", html: `
<p>En linje per yrke. Med knapparna växlar du mellan median, medel och percentiler.</p>
<ul>
<li><b>Hela linjer och punkter</b> är uppmätta löner.</li>
<li><b>Streckade linjer</b> är en prognos tre år framåt. För medianen i samtliga sektorer kommer den från en modell som testats på tidigare år, med ett skuggat band för det första yrket: ungefär 8 av 10 verkliga utfall hamnade inom det. I övrigt förlängs de senaste fem åren.</li>
<li><b>Det skuggade bandet</b> (första yrket, bara median) är den mittersta hälften av löntagarna.</li>
<li><b>Index, 2014 = 100</b> sätter alla yrken till 100 första året, så att du jämför ökning och inte nivå.</li>
</ul>` },
        { id: "gender", h: "Kvinnor och män", html: `
<p>Medianlönen för kvinnor och män i varje yrke. Den orange pricken är kvinnor, den turkosa är män, och siffran till höger är kvinnors lön som andel av mäns.</p>` },
        { id: "ratio", h: "Kvinnors lön som andel av mäns", html: `
<p>Kvinnors medianlön i procent av mäns, varje år. 100 % betyder lika; under 100 betyder att kvinnors median är lägre.</p>
<p>Jämförelsen gäller samma yrke, inte olika yrken, och är inte justerad för till exempel ålder, utbildning eller erfarenhet.</p>` },
        { id: "breakdown", h: "Efter ålder, utbildning och region", html: `
<p>Tre små diagram visar genomsnittlig månadslön efter åldersgrupp, utbildningsnivå och region. En rad per grupp, en prick per yrke i yrkets färg. Den grå ringen är samtliga yrken.</p>
<p>Håll över en prick för exakt siffra och antal anställda. Saknas pricken bygger siffran på för få personer för att SCB ska publicera den.</p>` },
        { id: "lb", h: "Topplistor", html: `
<p>Rankningar av alla yrken för vald sektor och år: högst eller lägst medianlön, snabbast ökning (årlig förändring i medianlönen över fem år), flest anställda och störst skillnad mellan kvinnor och män.</p>
<p>Klicka på en rad för att lägga till yrket i jämförelsen. Markerade rader finns redan med.</p>` },
        { id: "rel", h: "Närliggande yrken", html: `
<p>Andra yrken i samma yrkesgrupp som ditt första yrke, sorterade efter medianlön. Bra för att se var ett yrke ligger bland sina grannar. Klicka på ett för att lägga till det.</p>` },
        { id: "jobs", h: "Platsannonser", html: `
<p>Hur många annonser som är öppna just nu för det första yrkets yrkesgrupp, uppdelat per län, plus de senaste annonserna. De hämtas direkt från Arbetsförmedlingen (Platsbanken) och ingår inte i lönestatistiken.</p>
<p>Annonser räknas för den fyrsiffriga gruppen, som kan vara bredare än yrkestiteln.</p>` }
      ] },
      { id: "terms", h: "Begrepp", html: `
<dl>
<dt>Månadslön</dt><dd>Grundlön plus fasta tillägg, före skatt, omräknad till heltid. SCB mäter den en gång om året, på hösten.</dd>
<dt>Median</dt><dd>Mittenlönen: hälften tjänar mer, hälften tjänar mindre. Oftast det bästa enskilda måttet på typisk lön.</dd>
<dt>Medel</dt><dd>Summan av alla löner delad med antalet personer. Oftast högre än medianen, eftersom några få mycket höga löner drar upp den.</dd>
<dt>Percentil (P10, P25, P75, P90)</dt><dd>En punkt i raden av alla anställda, från lägst till högst lön. P10 betyder att 10 % tjänar mindre och 90 % mer. P25, P75 och P90 fungerar likadant. P50 är medianen.</dd>
<dt>Mittersta hälften</dt><dd>Spannet från P25 till P75: hälften av de anställda har en lön i det spannet. Det är lådan i diagrammet.</dd>
<dt>Sektor</dt><dd>Vem arbetsgivaren är. <i>Samtliga sektorer</i>; <i>offentlig sektor</i> (statlig, kommunal och regionsektorn); <i>privat sektor</i> (arbetare och tjänstemän).</dd>
<dt>SSYK-kod</dt><dd>Den fyrsiffriga yrkeskoden i Sveriges standard för yrkesklassificering, SSYK 2012. Första siffran är yrkesområdet: 2 är yrken med krav på fördjupad högskolekompetens, 5 är service-, omsorgs- och försäljningsyrken, och så vidare.</dd>
<dt>Yrkesgrupp</dt><dd>Närliggande yrken som delar de tre första siffrorna i koden.</dd>
<dt>Kvinnors lön som andel av mäns</dt><dd>Kvinnors medianlön delad med mäns medianlön, i procent, för samma yrke, sektor och år. 100 % är lika.</dd>
<dt>Förändring per år</dt><dd>Den genomsnittliga årliga förändringen i medianlönen över de fem senaste åren med data.</dd>
<dt>Prognos</dt><dd>Den streckade linjen. Den följer lönerna i hela landet, eftersom svenska löner rör sig tillsammans genom avtalen, och räknar med att en del av ett ovanligt hopp ett enskilt år jämnar ut sig. Den valdes och kontrollerades genom att förutsäga tidigare år och jämföra med vad SCB sedan publicerade.</dd>
<dt>Index, 2014 = 100</dt><dd>Varje linje skalas om till 100 första året. 112 betyder 12 % högre än då.</dd>
<dt>Anställda</dt><dd>Antalet anställda i yrket. SCB avrundar siffrorna.</dd>
<dt>Ej publicerat</dt><dd>SCB utelämnar en siffra när den bygger på för få personer.</dd>
<dt>Regioner</dt><dd>De 8 NUTS 2-regionerna, Sveriges statistiska regioner: Stockholm, Östra Mellansverige, Småland med öarna, Sydsverige, Västsverige, Norra Mellansverige, Mellersta Norrland och Övre Norrland.</dd>
<dt>Utbildningsnivåer</dt><dd>Sju nivåer, från förgymnasial utbildning till forskarutbildning: under 9 år, 9–10 år, gymnasial högst 2 år, gymnasial 3 år, eftergymnasial under 3 år, eftergymnasial 3 år eller mer, forskarutbildning.</dd>
</dl>` },
      { id: "limits", h: "Bra att veta", html: `
<ul>
<li>Prognosen är sajtens egen uppskattning, inte en siffra från SCB, och bandet är ett troligt spann, inget löfte.</li>
<li>2018 kodade kommuner och regioner om vissa tjänster, så yrken som är vanliga där kan hoppa det året utan att lönen egentligen ändras.</li>
<li>Alla siffror är före skatt.</li>
<li>Lönen är omräknad till heltid, så den säger inget om arbetade timmar.</li>
<li>Små yrken kan saknas för vissa år, sektorer, kön, åldrar eller regioner.</li>
<li>SCB har 2014–2022 och 2023–2025 i olika tabeller; sidan slår ihop dem.</li>
</ul>` },
      { id: "sources", h: "Varifrån uppgifterna kommer", html: `
<p>Lönerna kommer från SCB:s lönestrukturstatistik, som tas fram åt <a href="https://www.mi.se/">Medlingsinstitutet</a>, via SCB:s öppna PxWebApi. Platsannonserna kommer från JobSearch-API:t hos <a href="https://jobtechdev.se">JobTech / Arbetsförmedlingen</a>.</p>
<p>Allt hämtas direkt i din webbläsare när du öppnar sidan. Inget sparas på någon server. Tabellnamnen står under "Källor och metod" längst ned på sidan.</p>` },
      { id: "faq", h: "Frågor", html: `
<dl>
<dt>Sparas min lön?</dt><dd>Nej. Det du skriver stannar i din webbläsare. Det skickas ingenstans och ingår inte i den delade länken.</dd>
<dt>Varför saknas en siffra?</dt><dd>Det står "Ej publicerat" när SCB utelämnar en siffra som bygger på för få personer. Prova samtliga sektorer, båda könen, ett annat år eller ett större yrke.</dd>
<dt>Hur delar jag det jag ser?</dt><dd>Tryck på "Kopiera länk till vyn" under yrkesknapparna och skicka länken. Den behåller dina yrken, filter och språk.</dd>
</dl>` }
    ]
  }
};
