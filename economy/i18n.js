/* Economy: every piece of interface text, English and Swedish. {name} marks a value filled in by economy.js. Values may hold inline HTML. */
window.ECO_TEXT = {
  en: {
    title: "Economy · Sverige Live",
    desc: "Inflation, the policy rate, unemployment, house prices and confidence in Sweden, from SCB, the Riksbank and Konjunkturinstitutet, each with a one-line answer.",
    h1: "Economy <span>Sweden</span>",
    lead: "How is Sweden's economy doing? The latest official figures on prices, interest rates, jobs, house prices and confidence, each with a one-line answer. Data from SCB, the Riksbank and Konjunkturinstitutet.",
    tourBtn: "Take the tour", guideBtn: "Guide", guideLink: "User guide",
    loading: "Loading the latest figures…", loadingShort: "Loading…",
    upd: "Data updated {ago}", errOne: "1 source failed last run", errMany: "{n} sources failed last run",
    loadErr: "Could not load the data file: {msg}", d3Err: "Could not load the chart library (d3) from cdnjs.",
    calT: "Next releases", calSub: "Riksbank dates are confirmed. Dates marked ≈ are estimates from each agency's usual schedule.",
    calPolicy: "Riksbank policy-rate decision", calCpi: "Inflation (CPI, CPIF) for last month", calUnemp: "Unemployment (Labour Force Survey)",
    calMood: "Economic Tendency Survey", calHouse: "House price index, last quarter", calNone: "No upcoming dates found.",
    today: "today", tomorrow: "tomorrow", inDays: "in {n} days", estimate: " · estimate",
    kpisT: "Latest figures", kpisHint: "Click a figure to jump to its chart.", kpisLbl: "Key figures",
    tileHint: "Show the chart",
    tCpif: "Inflation (CPIF)", tPolicy: "Policy rate", tUnemp: "Unemployment", tHouses: "House prices", tMood: "Economic Tendency", tCons: "Consumer confidence", tFx: "EUR / SEK", tCpi: "Inflation (CPI)",
    pts: " pts", vsMonth: "vs previous month", vsQuarter: "vs previous quarter", vsYear: "vs a year ago", inMonth: "in a month", lastChange: "at last change, {date}",
    ctxCpif: "Riksbank target 2 % · a year ago {v} %", ctxReal: "real rate {v} % (minus CPIF)", ctxUnemp: "ages 15–74, seasonally adjusted",
    ctxHouses: "year on year, houses · Göteborg {v} %", ctxAbove: "above normal (100)", ctxBelow: "below normal (100)",
    ctxFx: "a stronger krona means a lower number", ctxCpi: "includes mortgage interest costs",
    updated: "updated {date}", next: "next {date}",
    inflT: "Inflation vs the policy rate", unempT: "Unemployment", houseT: "House prices", moodT: "Business and consumer confidence", fxT: "EUR/SEK",
    r5: "5 y", r10: "10 y", rAll: "All", mYoy: "% y/y", mIndex: "Index", rangeLbl: "Time range", showLbl: "Show",
    srcInfl: "SCB (CPIF, CPI annual change) · Sveriges Riksbank (policy rate, month-end)",
    srcUnemp: "SCB, Labour Force Survey, ages 15–74: faint line = seasonally adjusted, bold line = SCB's smoothed trend",
    srcHouse: "SCB, real estate price index, one- and two-dwelling buildings, quarterly",
    srcMood: "Konjunkturinstitutet, Economic Tendency Survey (100 = historical average)",
    srcFx: "Sveriges Riksbank, EUR/SEK daily fixing",
    xInfl: "Has pay kept up? Compare salaries in Löner →", xUnemp: "Looking for work? See open job ads in Löner →",
    lgCpif: "CPIF inflation", lgCpi: "CPI inflation", lgPolicy: "Policy rate", lgTarget: "2 % inflation target",
    lgEti: "Economic Tendency Indicator (whole economy)", lgCons: "Consumer confidence", lgNormal: "100 = normal",
    sCpif: "CPIF", sCpi: "CPI", sPolicy: "Policy rate", sMonthly: "Monthly, seasonally adjusted", sTrend: "Trend", sEti: "Economic Tendency", sCons: "Consumers", sFx: "EUR/SEK",
    regSweden: "Sweden", regStockholm: "Greater Stockholm", regGothenburg: "Greater Gothenburg", regMalmo: "Greater Malmö",
    aInfl: "Inflation and policy rate over time", aUnemp: "Unemployment rate over time", aHouse: "House prices by region", aMood: "Economic tendency and consumer confidence", aFx: "Euro to krona exchange rate",
    noData: "No data", quarter: "{y} Q{q}",
    inflSub: "CPIF inflation is <b>{v} %</b> in {p}, {rel} the 2 % target. The policy rate is <b>{r} %</b>.",
    relNear: "close to", relAbove: "{n} points above", relBelow: "{n} points below",
    unempLower: "Unemployment is <b>{v} %</b> ({p}), {n} points lower than a year ago.",
    unempHigher: "Unemployment is <b>{v} %</b> ({p}), {n} points higher than a year ago.",
    unempSame: "Unemployment is <b>{v} %</b> ({p}), about the same as a year ago.",
    unempNow: "Unemployment is <b>{v} %</b> ({p}).",
    houseUp: "Houses cost <b>{v} %</b> more than a year earlier ({p}).",
    houseDown: "Houses cost <b>{v} %</b> less than a year earlier ({p}).",
    houseSame: "Houses cost about the same as a year earlier ({p}).",
    moodSub: "The Economic Tendency Indicator is <b>{v}</b> in {p}: {verdict} (100 = normal).{cons}",
    moodCons: " Households are at <b>{c}</b>.",
    vMuchUp: "much stronger than normal", vUp: "stronger than normal", vNorm: "about normal", vDown: "weaker than normal", vMuchDown: "much weaker than normal",
    fxDown: "One euro costs <b>{v} kr</b>, {n} kr less than {when}: the krona is stronger.",
    fxUp: "One euro costs <b>{v} kr</b>, {n} kr more than {when}: the krona is weaker.",
    fxSame: "One euro costs <b>{v} kr</b>, about the same as {when}.",
    fxYear: "a year ago", fxOn: "on {d}",
    cMonth: "Month", cQuarter: "Quarter", cDate: "Date",
    capInfl: "Inflation (annual change, %) and policy rate (%)", capUnemp: "Unemployment rate, % of the labour force, ages 15–74",
    capYoy: "House prices, % change on a year earlier", capIdx: "House price index (1981 = 100)", capMood: "Confidence indicators (100 = normal)", capFx: "EUR/SEK, kronor per euro",
    footData: `Data: <a href="https://www.scb.se/en/">SCB</a> (CC0) · <a href="https://www.riksbank.se/en-gb/statistics/">Sveriges Riksbank</a> · <a href="https://www.konj.se/english.html">Konjunkturinstitutet</a> · fetched by <a href="https://github.com/rajathpi/sverige-live/blob/main/scripts/update_economy.py">scripts/update_economy.py</a>`,
    footCode: `Code: MIT · <a href="https://github.com/rajathpi/sverige-live">github.com/rajathpi/sverige-live</a>`
  },
  sv: {
    title: "Ekonomi · Sverige Live",
    desc: "Inflation, styrräntan, arbetslöshet, huspriser och förtroende i Sverige, från SCB, Riksbanken och Konjunkturinstitutet, var och en med ett svar på en rad.",
    h1: "Ekonomi <span>Sverige</span>",
    lead: "Hur mår Sveriges ekonomi? De senaste officiella siffrorna om priser, räntor, jobb, huspriser och förtroende, var och en med ett svar på en rad. Data från SCB, Riksbanken och Konjunkturinstitutet.",
    tourBtn: "Ta rundturen", guideBtn: "Guide", guideLink: "Användarguide",
    loading: "Hämtar de senaste siffrorna…", loadingShort: "Hämtar…",
    upd: "Data uppdaterad {ago}", errOne: "1 källa misslyckades vid senaste körningen", errMany: "{n} källor misslyckades vid senaste körningen",
    loadErr: "Det gick inte att läsa datafilen: {msg}", d3Err: "Det gick inte att ladda diagrambiblioteket (d3) från cdnjs.",
    calT: "Kommande publiceringar", calSub: "Riksbankens datum är bekräftade. Datum med ≈ är uppskattningar utifrån varje myndighets vanliga schema.",
    calPolicy: "Riksbankens räntebesked", calCpi: "Inflation (KPI, KPIF) för förra månaden", calUnemp: "Arbetslöshet (AKU)",
    calMood: "Konjunkturbarometern", calHouse: "Fastighetsprisindex, förra kvartalet", calNone: "Inga kommande datum hittades.",
    today: "i dag", tomorrow: "i morgon", inDays: "om {n} dagar", estimate: " · uppskattat",
    kpisT: "Senaste siffror", kpisHint: "Klicka på en siffra för att hoppa till dess diagram.", kpisLbl: "Nyckeltal",
    tileHint: "Visa diagrammet",
    tCpif: "Inflation (KPIF)", tPolicy: "Styrränta", tUnemp: "Arbetslöshet", tHouses: "Huspriser", tMood: "Barometerindikatorn", tCons: "Hushållens förtroende", tFx: "EUR / SEK", tCpi: "Inflation (KPI)",
    pts: " procentenheter", vsMonth: "jfr föregående månad", vsQuarter: "jfr föregående kvartal", vsYear: "jfr för ett år sedan", inMonth: "på en månad", lastChange: "vid senaste ändringen, {date}",
    ctxCpif: "Riksbankens mål 2 % · för ett år sedan {v} %", ctxReal: "realränta {v} % (efter avdrag för KPIF)", ctxUnemp: "15–74 år, säsongsrensad",
    ctxHouses: "årsförändring, småhus · Göteborg {v} %", ctxAbove: "över det normala (100)", ctxBelow: "under det normala (100)",
    ctxFx: "starkare krona ger ett lägre tal", ctxCpi: "inklusive räntekostnader för bostadslån",
    updated: "uppdaterad {date}", next: "nästa {date}",
    inflT: "Inflation och styrränta", unempT: "Arbetslöshet", houseT: "Huspriser", moodT: "Förtroende hos företag och hushåll", fxT: "EUR/SEK",
    r5: "5 år", r10: "10 år", rAll: "Alla", mYoy: "% mot förra året", mIndex: "Index", rangeLbl: "Tidsperiod", showLbl: "Visa",
    srcInfl: "SCB (KPIF och KPI, årsförändring) · Sveriges Riksbank (styrränta, månadsslut)",
    srcUnemp: "SCB, arbetskraftsundersökningarna (AKU), 15–74 år: svag linje = säsongsrensat, kraftig linje = SCB:s utjämnade trend",
    srcHouse: "SCB, fastighetsprisindex, småhus, kvartalsvis",
    srcMood: "Konjunkturinstitutet, Konjunkturbarometern (100 = historiskt genomsnitt)",
    srcFx: "Sveriges Riksbank, EUR/SEK, dagskurs",
    xInfl: "Har lönerna hängt med? Jämför löner i Löner →", xUnemp: "Söker du jobb? Se lediga jobb i Löner →",
    lgCpif: "KPIF-inflation", lgCpi: "KPI-inflation", lgPolicy: "Styrränta", lgTarget: "Inflationsmål 2 %",
    lgEti: "Barometerindikatorn (hela ekonomin)", lgCons: "Hushållens förtroende", lgNormal: "100 = normalt",
    sCpif: "KPIF", sCpi: "KPI", sPolicy: "Styrränta", sMonthly: "Månadsvärde, säsongsrensat", sTrend: "Trend", sEti: "Barometerindikatorn", sCons: "Hushåll", sFx: "EUR/SEK",
    regSweden: "Sverige", regStockholm: "Stor-Stockholm", regGothenburg: "Stor-Göteborg", regMalmo: "Stor-Malmö",
    aInfl: "Inflation och styrränta över tid", aUnemp: "Arbetslösheten över tid", aHouse: "Huspriser per region", aMood: "Barometerindikatorn och hushållens förtroende", aFx: "Kurs mellan euro och krona",
    noData: "Inga data", quarter: "kv {q} {y}",
    inflSub: "KPIF-inflationen är <b>{v} %</b> i {p}, {rel} Riksbankens mål på 2 %. Styrräntan är <b>{r} %</b>.",
    relNear: "nära", relAbove: "{n} procentenheter över", relBelow: "{n} procentenheter under",
    unempLower: "Arbetslösheten är <b>{v} %</b> ({p}), {n} procentenheter lägre än för ett år sedan.",
    unempHigher: "Arbetslösheten är <b>{v} %</b> ({p}), {n} procentenheter högre än för ett år sedan.",
    unempSame: "Arbetslösheten är <b>{v} %</b> ({p}), ungefär som för ett år sedan.",
    unempNow: "Arbetslösheten är <b>{v} %</b> ({p}).",
    houseUp: "Småhus kostar <b>{v} %</b> mer än för ett år sedan ({p}).",
    houseDown: "Småhus kostar <b>{v} %</b> mindre än för ett år sedan ({p}).",
    houseSame: "Småhus kostar ungefär som för ett år sedan ({p}).",
    moodSub: "Barometerindikatorn är <b>{v}</b> i {p}: {verdict} (100 = normalt).{cons}",
    moodCons: " Hushållens förtroende är <b>{c}</b>.",
    vMuchUp: "mycket starkare än normalt", vUp: "starkare än normalt", vNorm: "ungefär normalt", vDown: "svagare än normalt", vMuchDown: "mycket svagare än normalt",
    fxDown: "En euro kostar <b>{v} kr</b>, {n} kr mindre än {when}: kronan är starkare.",
    fxUp: "En euro kostar <b>{v} kr</b>, {n} kr mer än {when}: kronan är svagare.",
    fxSame: "En euro kostar <b>{v} kr</b>, ungefär som {when}.",
    fxYear: "för ett år sedan", fxOn: "den {d}",
    cMonth: "Månad", cQuarter: "Kvartal", cDate: "Datum",
    capInfl: "Inflation (årsförändring, %) och styrränta (%)", capUnemp: "Arbetslöshet, % av arbetskraften, 15–74 år",
    capYoy: "Huspriser, procentuell förändring mot ett år tidigare", capIdx: "Fastighetsprisindex (1981 = 100)", capMood: "Förtroendeindikatorer (100 = normalt)", capFx: "EUR/SEK, kronor per euro",
    footData: `Data: <a href="https://www.scb.se/">SCB</a> (CC0) · <a href="https://www.riksbank.se/sv/statistik/">Sveriges Riksbank</a> · <a href="https://www.konj.se/">Konjunkturinstitutet</a> · hämtas av <a href="https://github.com/rajathpi/sverige-live/blob/main/scripts/update_economy.py">scripts/update_economy.py</a>`,
    footCode: `Kod: MIT · <a href="https://github.com/rajathpi/sverige-live">github.com/rajathpi/sverige-live</a>`
  }
};

/* d3 date locales, so axis ticks follow the language. */
window.ECO_D3 = {
  en: { dateTime: "%x, %X", date: "%-m/%-d/%Y", time: "%-I:%M:%S %p", periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
  sv: { dateTime: "%A den %d %B %Y %X", date: "%Y-%m-%d", time: "%H:%M:%S", periods: ["fm", "em"],
    days: ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"], shortDays: ["sön", "mån", "tis", "ons", "tors", "fre", "lör"],
    months: ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"], shortMonths: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"] }
};

/* Walkthrough and guide text (guide.js). Section html is trusted markup. */
window.ECO_GUIDE = {
  en: {
    title: "Guide", close: "Close the guide", nav: "Sections", again: "Take the tour again", info: "How to read this",
    tour: {
      label: "Page tour", of: "{n} of {total}", next: "Next", back: "Back", skip: "Skip", done: "Done", guide: "Open the guide",
      steps: [
        { t: "Welcome", b: "How is Sweden's economy doing? This page shows the main figures from official statistics, with one plain sentence above each chart. A tour of under a minute." },
        { t: "Latest figures", b: "Each tile is the newest figure, how it changed, and a small trend line. Click a tile to jump to its chart." },
        { t: "Inflation and the policy rate", b: "How fast prices rise, next to the Riksbank's interest rate. The dashed grey line is the 2 % target. Use 5 y, 10 y or All to change the period." },
        { t: "Unemployment", b: "The share of people in the workforce who have no job but are looking for one. The faint line is each month, the bold line is the smoothed trend." },
        { t: "House prices", b: "How much more or less houses cost than a year earlier, for Sweden and three city regions. Switch to Index to see price levels instead." },
        { t: "Confidence", b: "Mood surveys of firms and households. 100 is normal: above it, people are more upbeat than usual." },
        { t: "EUR/SEK", b: "How many kronor one euro costs. A lower number means a stronger krona." },
        { t: "Next releases", b: "When the next figures come out. Riksbank dates are confirmed, dates marked ≈ are estimates. The Guide explains every term." }
      ]
    },
    sections: [
      { id: "what", h: "What this page shows", html: `
<p>The main figures on Sweden's economy in one place: how fast prices rise, what the Riksbank's interest rate is, how many are out of work, how house prices move, how confident firms and households feel, and what the euro costs in kronor.</p>
<p>The figures are official statistics. Above each chart, one sentence gives the latest result in plain words, so you can stop there if that is all you need.</p>` },
      { id: "use", h: "How to use it", html: `
<ol>
<li><b>Start with the tiles.</b> They are the latest figures. Click one, or press Enter on it, to jump to its chart.</li>
<li><b>Read the sentence under each chart title.</b> It answers the chart's question. The chart shows the longer story.</li>
<li><b>Change the view.</b> Inflation has 5 y, 10 y and All; house prices switch between % y/y and Index.</li>
<li><b>Hover or tap</b> a chart for exact values.</li>
<li><b>Show as table</b> under each chart lists the same numbers, newest first.</li>
<li><b>Next releases</b> at the bottom shows when new figures are due.</li>
<li>The <b>EN / SV</b> switch and the light/dark switch are in the top right.</li>
</ol>` },
      { id: "charts", h: "Reading the charts", html: "", sub: [
        { id: "kpis", h: "Latest figures", html: `
<p>Each tile shows the latest figure, the month or quarter it covers (top right), how it changed, and a small line of the recent past: three years for monthly series, five years for house prices, one year for EUR/SEK.</p>
<p>Green means the change is in a generally favourable direction (inflation moving towards 2 %, unemployment down, confidence up). Red means the opposite. Grey means no judgement: the policy rate, house prices, CPI and EUR/SEK can be good or bad depending on who you are.</p>` },
        { id: "inflation", h: "Inflation vs the policy rate", html: `
<p>Inflation is how fast prices rise, as the change compared with the same month a year earlier. The solid line is CPIF, the dashed line is CPI, and the stepped line is the policy rate. The dashed grey line marks the 2 % target.</p>
<p>When inflation runs well above 2 %, the Riksbank tends to raise the policy rate to cool prices. When it runs below, it tends to cut the rate to support the economy. The effect is slow, so the lines do not move together month by month.</p>` },
        { id: "unemployment", h: "Unemployment", html: `
<p>The share of the workforce without a job who are looking for one. The faint line is each month (seasonally adjusted). The bold line is SCB's smoothed trend, which shows the direction better because single months wobble.</p>
<p>The sentence and the tile use the monthly figure; the number at the end of the bold line is the trend, so the two can differ by a tenth or two.</p>` },
        { id: "houses", h: "House prices", html: `
<p>Four lines: Sweden, and the Stockholm, Gothenburg and Malmö regions. <b>% y/y</b> shows how much prices changed compared with the same quarter a year earlier; the dashed line is zero. <b>Index</b> shows the price level with 1981 as 100.</p>
<p>The figures are quarterly and arrive about two months after each quarter ends.</p>` },
        { id: "confidence", h: "Business and consumer confidence", html: `
<p>Two lines from Konjunkturinstitutet's monthly surveys: the Economic Tendency Indicator for firms and households together, and consumer confidence for households alone. The dashed line is 100, the normal level.</p>
<p>Above 100 means more optimism than usual, below 100 less. The scale is built so that 10 points is a typical swing, so above 110 or below 90 is unusually strong or weak.</p>` },
        { id: "fx", h: "EUR/SEK", html: `
<p>How many kronor one euro costs, each banking day, for about the last two years. A line going down means the krona is getting stronger.</p>` },
        { id: "calendar", h: "Next releases", html: `
<p>When the agencies publish their next figures. The Riksbank's decision dates are confirmed. SCB and Konjunkturinstitutet dates are marked ≈: they are estimated from each agency's usual rhythm, not announced. Releases within a week are outlined.</p>` }
      ] },
      { id: "terms", h: "Terms in plain words", html: `
<dl>
<dt>Inflation</dt><dd>How much more expensive things have become, as the change in a price index compared with the same month a year earlier.</dd>
<dt>CPI (KPI)</dt><dd>The Consumer Price Index follows the prices of what households buy. It includes the interest cost of mortgages, so it rises when interest rates rise.</dd>
<dt>CPIF (KPIF)</dt><dd>CPI with a fixed interest rate: the same index with changes in mortgage interest left out. The Riksbank has targeted CPIF since 2017 because the Riksbank's own rate changes move CPI directly, which makes it a poor thing to steer by.</dd>
<dt>Inflation target, 2 %</dt><dd>The Riksbank aims for CPIF inflation of 2 % a year. Both much higher and much lower are a problem.</dd>
<dt>Policy rate</dt><dd>The Riksbank's main interest rate. It steers what banks charge for mortgages and pay on savings. It is decided at scheduled meetings, which is why the line moves in steps.</dd>
<dt>Real rate</dt><dd>The policy rate minus current inflation (CPIF). A rough gauge of whether interest rates hold the economy back or help it along.</dd>
<dt>Percentage points (pts)</dt><dd>The distance between two percentages. Going from 1,5 % to 2,0 % is 0,5 points, not 0,5 %.</dd>
<dt>Unemployment (LFS)</dt><dd>The share of the labour force, people aged 15–74 who work or look for work, who have no job but are looking for one and could start soon. It comes from SCB's Labour Force Survey, a monthly sample survey, so single months are uncertain.</dd>
<dt>Seasonally adjusted</dt><dd>Cleaned of regular yearly patterns, such as summer jobs, so that one month can be compared with the next.</dd>
<dt>Trend</dt><dd>SCB's smoothed version of the series. It removes survey noise and shows direction, and can be revised when new months arrive.</dd>
<dt>House price index</dt><dd>SCB's quarterly index of the prices of houses sold, with 1981 = 100. An index of 965 means prices are 9,65 times those of 1981, before adjusting for inflation.</dd>
<dt>% y/y</dt><dd>Change compared with the same period a year earlier. It avoids seasonal swings.</dd>
<dt>Economic Tendency Indicator</dt><dd>Konjunkturinstitutet's monthly survey of firms in manufacturing, services, construction and retail, and of households, combined into one number. 100 is the long-run average.</dd>
<dt>Consumer confidence</dt><dd>Konjunkturinstitutet's indicator of how households see their own finances and the Swedish economy. Same scale: 100 is normal.</dd>
<dt>EUR/SEK</dt><dd>The price of one euro in kronor. A higher number means a weaker krona.</dd>
<dt>≈ expected</dt><dd>The agency has not announced the date yet. It is estimated from its usual schedule and can shift by a few days.</dd>
</dl>` },
      { id: "limits", h: "Good to know", html: `
<ul>
<li><b>Update schedule.</b> A scheduled job checks the agencies on weekdays at 07:20, 09:20 and 14:20 UTC. The data file changes only when a figure changes, so "Data updated" can be several days old. That is normal.</li>
<li><b>Open page.</b> The page reloads the data every 30 minutes while it is visible, and when you come back to the tab after longer than that.</li>
<li>Every figure is as new as the agency's latest release: inflation and unemployment come monthly for the month before, house prices quarterly with a delay of about two months.</li>
<li>Recent figures can be revised by the agency.</li>
<li>Unemployment comes from a sample survey, so one month's change can be noise. Look at the trend.</li>
<li>House prices are not adjusted for inflation, and only three city regions are shown.</li>
<li>This page describes what has happened. It is not a forecast or financial advice.</li>
</ul>` },
      { id: "sources", h: "Where the data comes from", html: `
<p><b>SCB</b> (Statistics Sweden): inflation (CPIF and CPI), unemployment and the house price index, through its open PxWebApi. <b>Sveriges Riksbank</b>: the policy rate and EUR/SEK, from its SWEA API. <b>Konjunkturinstitutet</b> (the National Institute of Economic Research): the Economic Tendency Survey, from its statistics database.</p>
<p>The Riksbank and Konjunkturinstitutet cannot be called from a web page, so a script collects all the series and writes them to one data file. The source line under each chart names the series.</p>` },
      { id: "faq", h: "Questions", html: `
<dl>
<dt>Why is the unemployment number different at the end of the chart?</dt><dd>The sentence and tile use the monthly seasonally adjusted figure. The label at the end of the bold line is SCB's smoothed trend.</dd>
<dt>Why is inflation here lower or higher than in the news?</dt><dd>News often quotes CPI, which includes mortgage interest costs. The Riksbank's target and the main line here are CPIF. Both are shown.</dd>
<dt>Did the Riksbank change the rate? Why is the line not updated?</dt><dd>Decision days are shown under Next releases. The line follows within a few hours, at the next scheduled update.</dd>
<dt>Has pay kept up with prices?</dt><dd>Compare salaries by occupation in <a href="../loner/">Löner</a>.</dd>
</dl>` }
    ]
  },
  sv: {
    title: "Guide", close: "Stäng guiden", nav: "Avsnitt", again: "Ta rundturen igen", info: "Så läser du det",
    tour: {
      label: "Rundtur på sidan", of: "{n} av {total}", next: "Nästa", back: "Tillbaka", skip: "Hoppa över", done: "Klar", guide: "Öppna guiden",
      steps: [
        { t: "Välkommen", b: "Hur mår Sveriges ekonomi? Här ser du de viktigaste siffrorna från officiell statistik, med en enkel mening ovanför varje diagram. En rundtur på under en minut." },
        { t: "Senaste siffror", b: "Varje ruta visar den nyaste siffran, hur den ändrats och en liten trendlinje. Klicka på en ruta för att hoppa till dess diagram." },
        { t: "Inflation och styrränta", b: "Hur snabbt priserna stiger, vid sidan av Riksbankens ränta. Den streckade grå linjen är inflationsmålet på 2 %. Med 5 år, 10 år och Alla väljer du period." },
        { t: "Arbetslöshet", b: "Andelen av arbetskraften som saknar jobb men söker ett. Den svaga linjen är varje månad, den kraftiga är den utjämnade trenden." },
        { t: "Huspriser", b: "Hur mycket dyrare eller billigare småhus är än för ett år sedan, för Sverige och tre storstadsregioner. Växla till Index för att se prisnivån i stället." },
        { t: "Förtroende", b: "Stämningsundersökningar bland företag och hushåll. 100 är normalt: över det är folk mer optimistiska än vanligt." },
        { t: "EUR/SEK", b: "Hur många kronor en euro kostar. Ett lägre tal betyder en starkare krona." },
        { t: "Kommande publiceringar", b: "När nästa siffror kommer. Riksbankens datum är bekräftade, datum med ≈ är uppskattningar. Guiden förklarar alla begrepp." }
      ]
    },
    sections: [
      { id: "what", h: "Det här visar sidan", html: `
<p>De viktigaste siffrorna om Sveriges ekonomi på ett ställe: hur snabbt priserna stiger, vad Riksbankens ränta är, hur många som saknar jobb, hur huspriserna rör sig, hur förtroendet bland företag och hushåll ser ut och vad euron kostar i kronor.</p>
<p>Siffrorna är officiell statistik. Ovanför varje diagram ger en mening det senaste resultatet i klartext, så du kan sluta läsa där om det räcker.</p>` },
      { id: "use", h: "Så använder du den", html: `
<ol>
<li><b>Börja med rutorna.</b> De visar de senaste siffrorna. Klicka på en, eller tryck Enter, för att hoppa till dess diagram.</li>
<li><b>Läs meningen under diagramrubriken.</b> Den svarar på diagrammets fråga. Diagrammet visar den längre historien.</li>
<li><b>Ändra vyn.</b> Inflationen har 5 år, 10 år och Alla; huspriserna växlar mellan % mot förra året och Index.</li>
<li><b>Håll över eller tryck</b> på ett diagram för exakta värden.</li>
<li><b>Visa som tabell</b> under varje diagram listar samma siffror, nyaste först.</li>
<li><b>Kommande publiceringar</b> längst ned visar när nya siffror väntas.</li>
<li>Språkväxlaren <b>EN / SV</b> och ljus/mörk-växlaren sitter uppe till höger.</li>
</ol>` },
      { id: "charts", h: "Så läser du diagrammen", html: "", sub: [
        { id: "kpis", h: "Senaste siffror", html: `
<p>Varje ruta visar den senaste siffran, vilken månad eller vilket kvartal den gäller (uppe till höger), hur den ändrats och en liten linje över den närmaste tiden: tre år för månadsserier, fem år för huspriser, ett år för EUR/SEK.</p>
<p>Grönt betyder att förändringen går åt ett i allmänhet gynnsamt håll (inflationen närmare 2 %, lägre arbetslöshet, högre förtroende). Rött betyder motsatsen. Grått är ingen värdering: styrräntan, huspriserna, KPI och EUR/SEK kan vara bra eller dåliga beroende på vem du är.</p>` },
        { id: "inflation", h: "Inflation och styrränta", html: `
<p>Inflation är hur snabbt priserna stiger, som förändringen jämfört med samma månad ett år tidigare. Den hela linjen är KPIF, den streckade är KPI och trappstegslinjen är styrräntan. Den streckade grå linjen markerar målet på 2 %.</p>
<p>När inflationen ligger klart över 2 % brukar Riksbanken höja styrräntan för att kyla av priserna. Ligger den under brukar räntan sänkas för att stödja ekonomin. Effekten tar tid, så linjerna rör sig inte i takt från månad till månad.</p>` },
        { id: "unemployment", h: "Arbetslöshet", html: `
<p>Andelen av arbetskraften som saknar jobb och söker ett. Den svaga linjen är varje månad (säsongsrensat). Den kraftiga linjen är SCB:s utjämnade trend, som visar riktningen bättre eftersom enskilda månader svänger.</p>
<p>Meningen och rutan använder månadsvärdet; siffran vid slutet av den kraftiga linjen är trenden, så de kan skilja en eller två tiondelar.</p>` },
        { id: "houses", h: "Huspriser", html: `
<p>Fyra linjer: Sverige samt Stockholms-, Göteborgs- och Malmöregionerna. <b>% mot förra året</b> visar hur mycket priserna ändrats jämfört med samma kvartal ett år tidigare; den streckade linjen är noll. <b>Index</b> visar prisnivån med 1981 som 100.</p>
<p>Siffrorna är kvartalsvisa och kommer ungefär två månader efter att kvartalet slutat.</p>` },
        { id: "confidence", h: "Förtroende hos företag och hushåll", html: `
<p>Två linjer från Konjunkturinstitutets månatliga undersökningar: Barometerindikatorn för företag och hushåll tillsammans, och Hushållens förtroende för hushållen ensamma. Den streckade linjen är 100, den normala nivån.</p>
<p>Över 100 betyder mer optimism än vanligt, under 100 mindre. Skalan är gjord så att 10 enheter är en typisk svängning, så över 110 eller under 90 är ovanligt starkt eller svagt.</p>` },
        { id: "fx", h: "EUR/SEK", html: `
<p>Hur många kronor en euro kostar, varje bankdag, för ungefär de senaste två åren. En linje som går nedåt betyder att kronan blir starkare.</p>` },
        { id: "calendar", h: "Kommande publiceringar", html: `
<p>När myndigheterna publicerar nästa siffror. Riksbankens beslutsdatum är bekräftade. Datum från SCB och Konjunkturinstitutet är märkta ≈: de är uppskattade utifrån varje myndighets vanliga rytm, inte tillkännagivna. Publiceringar inom en vecka har en ram.</p>` }
      ] },
      { id: "terms", h: "Begrepp i klartext", html: `
<dl>
<dt>Inflation</dt><dd>Hur mycket dyrare saker blivit, som förändringen i ett prisindex jämfört med samma månad ett år tidigare.</dd>
<dt>KPI</dt><dd>Konsumentprisindex följer priserna på det hushållen köper. Det inkluderar räntekostnaden för bostadslån, så det stiger när räntorna stiger.</dd>
<dt>KPIF</dt><dd>KPI med fast ränta: samma index men utan förändringar i bolåneräntorna. Riksbanken har haft KPIF som mål sedan 2017, eftersom Riksbankens egna ränteändringar påverkar KPI direkt, vilket gör det till ett dåligt mått att styra efter.</dd>
<dt>Inflationsmål, 2 %</dt><dd>Riksbanken siktar på en KPIF-inflation på 2 % om året. Både mycket högre och mycket lägre är ett problem.</dd>
<dt>Styrränta</dt><dd>Riksbankens viktigaste ränta. Den styr vad bankerna tar för bolån och betalar för sparande. Den bestäms vid fastställda möten, därför rör sig linjen i steg.</dd>
<dt>Realränta</dt><dd>Styrräntan minus aktuell inflation (KPIF). Ett grovt mått på om räntan bromsar ekonomin eller hjälper den framåt.</dd>
<dt>Procentenheter</dt><dd>Avståndet mellan två procenttal. Från 1,5 % till 2,0 % är 0,5 procentenheter, inte 0,5 %.</dd>
<dt>Arbetslöshet (AKU)</dt><dd>Andelen av arbetskraften, personer 15–74 år som arbetar eller söker arbete, som saknar jobb men söker ett och kan börja snart. Den kommer från SCB:s arbetskraftsundersökningar (AKU), en månatlig urvalsundersökning, så enskilda månader är osäkra.</dd>
<dt>Säsongsrensad</dt><dd>Rensad från regelbundna årsmönster, till exempel sommarjobb, så att en månad kan jämföras med nästa.</dd>
<dt>Trend</dt><dd>SCB:s utjämnade version av serien. Den tar bort brus från urvalet och visar riktningen, och kan revideras när nya månader tillkommer.</dd>
<dt>Fastighetsprisindex</dt><dd>SCB:s kvartalsvisa index över priserna på sålda småhus, med 1981 = 100. Index 965 betyder att priserna är 9,65 gånger högre än 1981, före justering för inflation.</dd>
<dt>% mot förra året</dt><dd>Förändring jämfört med samma period ett år tidigare. Det undviker säsongssvängningar.</dd>
<dt>Barometerindikatorn</dt><dd>Konjunkturinstitutets månatliga undersökning av företag inom tillverkning, tjänster, bygg och handel samt av hushåll, sammanvägd till ett tal. 100 är det långsiktiga genomsnittet.</dd>
<dt>Hushållens förtroende</dt><dd>Konjunkturinstitutets mått på hur hushållen ser på sin egen ekonomi och på svensk ekonomi. Samma skala: 100 är normalt.</dd>
<dt>EUR/SEK</dt><dd>Priset på en euro i kronor. Ett högre tal betyder en svagare krona.</dd>
<dt>≈ väntas</dt><dd>Myndigheten har inte meddelat datumet än. Det är uppskattat utifrån vanligt schema och kan skifta några dagar.</dd>
</dl>` },
      { id: "limits", h: "Bra att veta", html: `
<ul>
<li><b>Uppdateringsschema.</b> Ett schemalagt jobb kollar myndigheterna vardagar kl. 07.20, 09.20 och 14.20 UTC. Datafilen ändras bara när en siffra ändras, så "Data uppdaterad" kan vara flera dagar gammal. Det är normalt.</li>
<li><b>Öppen sida.</b> Sidan hämtar om datan var 30:e minut medan den syns, och när du kommer tillbaka till fliken efter längre tid än så.</li>
<li>Varje siffra är lika ny som myndighetens senaste publicering: inflation och arbetslöshet kommer månadsvis för föregående månad, huspriser kvartalsvis med ungefär två månaders fördröjning.</li>
<li>Senaste siffror kan revideras av myndigheten.</li>
<li>Arbetslösheten kommer från en urvalsundersökning, så en månads förändring kan vara brus. Titta på trenden.</li>
<li>Huspriserna är inte justerade för inflation, och bara tre storstadsregioner visas.</li>
<li>Sidan beskriver vad som hänt. Den är ingen prognos och inga finansiella råd.</li>
</ul>` },
      { id: "sources", h: "Varifrån uppgifterna kommer", html: `
<p><b>SCB</b>: inflation (KPIF och KPI), arbetslöshet och fastighetsprisindex, via det öppna PxWebApi. <b>Sveriges Riksbank</b>: styrräntan och EUR/SEK, från SWEA-API:t. <b>Konjunkturinstitutet</b>: Konjunkturbarometern, från sin statistikdatabas.</p>
<p>Riksbanken och Konjunkturinstitutet kan inte anropas från en webbsida, så ett skript samlar alla serier och skriver dem till en datafil. Källraden under varje diagram anger serien.</p>` },
      { id: "faq", h: "Frågor", html: `
<dl>
<dt>Varför är arbetslöshetssiffran en annan vid slutet av diagrammet?</dt><dd>Meningen och rutan använder månadsvärdet, säsongsrensat. Siffran vid slutet av den kraftiga linjen är SCB:s utjämnade trend.</dd>
<dt>Varför är inflationen här lägre eller högre än i nyheterna?</dt><dd>Nyheterna anger ofta KPI, som inkluderar räntekostnader för bostadslån. Riksbankens mål och huvudlinjen här är KPIF. Båda visas.</dd>
<dt>Har Riksbanken ändrat räntan? Varför har linjen inte uppdaterats?</dt><dd>Beslutsdagar visas under Kommande publiceringar. Linjen följer efter inom några timmar, vid nästa schemalagda uppdatering.</dd>
<dt>Har lönerna hängt med priserna?</dt><dd>Jämför löner per yrke i <a href="../loner/">Löner</a>.</dd>
</dl>` }
    ]
  }
};
