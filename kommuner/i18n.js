/* Kommuner: interface text in English and Swedish. Indicator names and descriptions live in kpis.js.
   Values may hold inline HTML; {x} marks a variable filled in by the translator in kommuner.js. */
window.KOM_TEXT = {
  en: {
    h1: "Kommuner <span>compared</span>",
    lead: "All 290 municipalities (kommuner) on one map. Pick an indicator, then click up to five kommuner to compare them with each other and with Riket, the whole country. Data from Kolada, fetched live.",
    tourBtn: "Take the tour", guideBtn: "Guide", guideLink: "User guide", infoLbl: "How to read this",
    kpi: "Indicator", year: "Year", scale: "Colour classes", quant: "Quantiles", equal: "Equal steps",
    quantTip: "Each colour holds about the same number of kommuner", equalTip: "Each colour covers the same range of values",
    mapSub: "{y}{late} · {n} of {all} kommuner have data. Click a kommun to compare it; Ctrl + scroll or the buttons zoom.",
    latestOf: " (latest: {ly})", mapLoading: "Loading map…", zin: "Zoom in", zout: "Zoom out", zreset: "Reset zoom",
    mapAria: "Choropleth map of Swedish municipalities coloured by the chosen indicator",
    mapSrc: "Borders: <a href=\"https://github.com/okfse/sweden-geojson\">okfse/sweden-geojson</a>, derived from Valmyndigheten. Values: <a href=\"https://www.kolada.se\">Kolada</a>.",
    cmpT: "Compared kommuner", cmpSub: "Up to 5. Click the map, a bar or a list entry, or search by name.",
    search: "Search a kommun…", searchAria: "Search a kommun", copy: "Copy link to this view", copied: "Link copied ✓", copyFail: "Copy the address bar URL", reset: "Reset selection",
    none: "Nothing selected yet.", rm: "Remove {n}", max: "You can compare up to {max} kommuner. Remove one first.", already: "{n} is already selected.", noMatch: "No kommun matches", selTag: "selected ✓",
    listBW: "Best and worst 10", listHL: "Highest and lowest 10", listSub: "{ind}, {y} · {hint}", top10: "Top 10 (best)", bot10: "Bottom 10 (worst)", highest: "Highest", lowest: "Lowest",
    rowTip: "{n}: {v} (rank {r} of {all})", loading: "Loading…", loadingK: "Loading from Kolada…",
    stripT: "All kommuner, ranked", stripSubB: "All {n} kommuner, {y}, sorted from best to worst. Hover a bar for details, click to compare.", stripSubN: "All {n} kommuner, {y}, sorted from highest to lowest. Hover a bar for details, click to compare.",
    capBest: "← best (1)", capHigh: "← highest (1)", capWorst: "worst ({n}) →", capLow: "lowest ({n}) →", logScale: " · log scale", stripAria: "Ranked bars of {n} kommuner for {ind}", riketLbl: "Riket {v}",
    trendT: "Trend", trendSub: "{ind}, {span}{idx}. Selected kommuner against Riket.", idxSuffix: ", index (first year = 100)", valsBtn: "Values", idxBtn: "Index (first year = 100)", trendScale: "Trend scale",
    loadingTrend: "Loading trend…", noYear: "No yearly data.", noSelData: "No data for the selection.", oneYear: "Kolada publishes only one year for this indicator.", trendErr: "Could not load the trend ({e}).", retry: "Retry", idxTip: "(index {v})",
    profT: "All indicators", profSub: "Each kommun's latest value and rank (#) on all {n} indicators. Units are in the indicator list above.", profLoading: "Loading indicators… {a} of {n}",
    legGood: "better than most kommuner", legBad: "worse than most", legNeutral: "no good/bad direction (rank 1 = highest value)",
    colInd: "Indicator", colYear: "Year", rowRank: "Rank {r} of {n} ({hint})",
    profSrc: "Colour shows the share of kommuner a kommun beats, using each indicator's own latest year. Click an indicator name to put it on the map. Data: <a href=\"https://www.kolada.se\">Kolada</a> (RKA).",
    profErr: "Could not load the other indicators ({e}).",
    statusConn: "Connecting to Kolada…", statusOk: "Kolada data · {title} · {yl} {y}{late} · fetched {t}", yLatest: "latest year", yPlain: "year", latestPar: " (latest {ly})",
    statusErr: "Could not reach Kolada: {e}", errLoad: "Could not load data from Kolada ({e}).", errCover: "no recent data covering enough kommuner",
    better: "higher is better", worse: "lower is better", neutral: "no good/bad direction", rankBest: "1 = best", rankHigh: "1 = highest value",
    nextUpd: "Next Kolada update: {d}", koladaDef: "Kolada's own definition (in Swedish)", koladaName: "Kolada: {t}",
    lgDark: "Darker = higher value", lgLight: "Lighter = higher value", lgQ: " · each class holds about the same number of kommuner", lgE: " · classes span equal value ranges", noData: "no data ({n})",
    tipNoData: "No data for this year", tipRank: "Rank {r} of {n}", tipRiket: "Riket: {v}",
    u_points: "points", u_days: "days", latestTag: " (latest)",
    nettoLink: "What would you take home in {n}? →", nettoHot: "The tax rate is only one part of the picture. See what is left of a salary after tax in {n}.",
    ansVal: "{ind} in {name}: <b>{v}</b>, <b>{rank}</b> of {n} kommuner.", ansNoData: "No data for {name} in {y}.", ansRange: " Lowest in {lo} (<b>{lov}</b>), highest in {hi} (<b>{hiv}</b>).", ansRiket: " Riket: <b>{v}</b>.",
    ansBest: "{a} is best at <b>{av}</b>; {z} is worst at <b>{zv}</b>.", ansHigh: "{a} is highest at <b>{av}</b>; {z} is lowest at <b>{zv}</b>.",
    ansStrip: "Half of all kommuner lie between <b>{q1}</b> and <b>{q3}</b>, and the middle kommun has <b>{md}</b>.", ansStripSel: " {name} (<b>{v}</b>) is {pos}.", above: "above the middle", below: "below the middle", at: "right at the middle",
    ansTrend: "{ind} in {name} went from <b>{a}</b> in {y0} to <b>{b}</b> in {y1}.", ansTrendOne: "{ind} in {name}: <b>{a}</b> in {y0}.", ansTrendFlat: "{ind} in {name} stayed at <b>{a}</b> from {y0} to {y1}.", ansTrendRiket: " Riket: <b>{a}</b> to <b>{b}</b>.", ansTrendRiketOne: " Riket: <b>{a}</b> in {y0}.",
    ansProf: "Across the {n} indicators, {name} ranks best on “{a}” (<b>#{ar}</b>) and weakest on “{z}” (<b>#{zr}</b>).", ansProfNone: "Pick a kommun to see where it ranks best and worst.",
    tKommun: "Kommun", tValue: "Value", tRank: "Rank", tMeasure: "Measure", tYear: "Year", tCapMap: "{ind}, {y}. Rank {hint}.", tCapTrend: "{ind}, by year.", tCapStrip: "{ind}, {y}: spread across kommuner and your selection.",
    tLowest: "Lowest", tQ1: "25th percentile", tMedian: "Median (middle kommun)", tQ3: "75th percentile", tHighest: "Highest",
    footData: "Data: <a href=\"https://www.kolada.se\">Kolada (RKA), open data</a> · <a href=\"https://api.kolada.se/v3/\">API</a> · municipality borders <a href=\"https://github.com/okfse/sweden-geojson\">okfse/sweden-geojson</a>, derived from Valmyndigheten"
  },
  sv: {
    h1: "Kommuner <span>jämförda</span>",
    lead: "Alla 290 kommuner på en karta. Välj ett nyckeltal och klicka på upp till fem kommuner för att jämföra dem med varandra och med riket. Data från Kolada, hämtad direkt.",
    tourBtn: "Ta rundturen", guideBtn: "Guide", guideLink: "Användarguide", infoLbl: "Så läser du detta",
    kpi: "Nyckeltal", year: "År", scale: "Färgklasser", quant: "Kvantiler", equal: "Lika steg",
    quantTip: "Varje färg rymmer ungefär lika många kommuner", equalTip: "Varje färg täcker lika stort värdeintervall",
    mapSub: "{y}{late} · {n} av {all} kommuner har data. Klicka på en kommun för att jämföra den; Ctrl + scroll eller knapparna zoomar.",
    latestOf: " (senaste: {ly})", mapLoading: "Hämtar kartan…", zin: "Zooma in", zout: "Zooma ut", zreset: "Återställ zoom",
    mapAria: "Koropletkarta över Sveriges kommuner färgade efter valt nyckeltal",
    mapSrc: "Gränser: <a href=\"https://github.com/okfse/sweden-geojson\">okfse/sweden-geojson</a>, hämtade från Valmyndigheten. Värden: <a href=\"https://www.kolada.se\">Kolada</a>.",
    cmpT: "Jämförda kommuner", cmpSub: "Upp till 5. Klicka på kartan, en stapel eller en rad i listan, eller sök på namn.",
    search: "Sök kommun…", searchAria: "Sök kommun", copy: "Kopiera länk till vyn", copied: "Länken är kopierad ✓", copyFail: "Kopiera adressen från webbläsaren", reset: "Återställ val",
    none: "Inget valt ännu.", rm: "Ta bort {n}", max: "Du kan jämföra högst {max} kommuner. Ta bort en först.", already: "{n} är redan vald.", noMatch: "Ingen kommun matchar", selTag: "vald ✓",
    listBW: "Bäst och sämst 10", listHL: "Högst och lägst 10", listSub: "{ind}, {y} · {hint}", top10: "Topp 10 (bäst)", bot10: "Botten 10 (sämst)", highest: "Högst", lowest: "Lägst",
    rowTip: "{n}: {v} (plats {r} av {all})", loading: "Hämtar…", loadingK: "Hämtar från Kolada…",
    stripT: "Alla kommuner i rangordning", stripSubB: "Alla {n} kommuner, {y}, sorterade från bäst till sämst. Håll över en stapel för detaljer, klicka för att jämföra.", stripSubN: "Alla {n} kommuner, {y}, sorterade från högst till lägst. Håll över en stapel för detaljer, klicka för att jämföra.",
    capBest: "← bäst (1)", capHigh: "← högst (1)", capWorst: "sämst ({n}) →", capLow: "lägst ({n}) →", logScale: " · logaritmisk skala", stripAria: "Rangordnade staplar för {n} kommuner: {ind}", riketLbl: "Riket {v}",
    trendT: "Utveckling", trendSub: "{ind}, {span}{idx}. Valda kommuner mot riket.", idxSuffix: ", index (första året = 100)", valsBtn: "Värden", idxBtn: "Index (första året = 100)", trendScale: "Skala för utvecklingen",
    loadingTrend: "Hämtar utvecklingen…", noYear: "Inga årsdata.", noSelData: "Inga data för valet.", oneYear: "Kolada publicerar bara ett år för det här nyckeltalet.", trendErr: "Kunde inte hämta utvecklingen ({e}).", retry: "Försök igen", idxTip: "(index {v})",
    profT: "Alla nyckeltal", profSub: "Varje kommuns senaste värde och placering (#) på alla {n} nyckeltal. Enheterna står i nyckeltalslistan ovan.", profLoading: "Hämtar nyckeltal… {a} av {n}",
    legGood: "bättre än de flesta kommuner", legBad: "sämre än de flesta", legNeutral: "ingen bra/dålig riktning (plats 1 = högsta värdet)",
    colInd: "Nyckeltal", colYear: "År", rowRank: "Plats {r} av {n} ({hint})",
    profSrc: "Färgen visar hur stor andel av kommunerna en kommun slår, med varje nyckeltals eget senaste år. Klicka på ett nyckeltal för att visa det på kartan. Data: <a href=\"https://www.kolada.se\">Kolada</a> (RKA).",
    profErr: "Kunde inte hämta de andra nyckeltalen ({e}).",
    statusConn: "Ansluter till Kolada…", statusOk: "Kolada-data · {title} · {yl} {y}{late} · hämtad {t}", yLatest: "senaste år", yPlain: "år", latestPar: " (senaste {ly})",
    statusErr: "Kunde inte nå Kolada: {e}", errLoad: "Kunde inte hämta data från Kolada ({e}).", errCover: "inga färska data som täcker tillräckligt många kommuner",
    better: "högre är bättre", worse: "lägre är bättre", neutral: "ingen bra/dålig riktning", rankBest: "1 = bäst", rankHigh: "1 = högsta värdet",
    nextUpd: "Nästa uppdatering i Kolada: {d}", koladaDef: "Koladas egen definition", koladaName: "Kolada: {t}",
    lgDark: "Mörkare = högre värde", lgLight: "Ljusare = högre värde", lgQ: " · varje klass rymmer ungefär lika många kommuner", lgE: " · klasserna täcker lika stora värdeintervall", noData: "saknar data ({n})",
    tipNoData: "Data saknas för det här året", tipRank: "Plats {r} av {n}", tipRiket: "Riket: {v}",
    u_points: "poäng", u_days: "dagar", latestTag: " (senaste)",
    nettoLink: "Vad tar du hem i {n}? →", nettoHot: "Skattesatsen är bara en del av bilden. Se vad som blir kvar av en lön efter skatt i {n}.",
    ansVal: "{ind} i {name}: <b>{v}</b>, plats <b>{rank}</b> av {n} kommuner.", ansNoData: "Data saknas för {name} {y}.", ansRange: " Lägst i {lo} (<b>{lov}</b>), högst i {hi} (<b>{hiv}</b>).", ansRiket: " Riket: <b>{v}</b>.",
    ansBest: "{a} är bäst med <b>{av}</b>; {z} är sämst med <b>{zv}</b>.", ansHigh: "{a} är högst med <b>{av}</b>; {z} är lägst med <b>{zv}</b>.",
    ansStrip: "Hälften av alla kommuner ligger mellan <b>{q1}</b> och <b>{q3}</b>, och mittenkommunen har <b>{md}</b>.", ansStripSel: " {name} (<b>{v}</b>) ligger {pos}.", above: "över mitten", below: "under mitten", at: "precis i mitten",
    ansTrend: "{ind} i {name} gick från <b>{a}</b> år {y0} till <b>{b}</b> år {y1}.", ansTrendOne: "{ind} i {name}: <b>{a}</b> år {y0}.", ansTrendFlat: "{ind} i {name} låg kvar på <b>{a}</b> från {y0} till {y1}.", ansTrendRiket: " Riket: <b>{a}</b> till <b>{b}</b>.", ansTrendRiketOne: " Riket: <b>{a}</b> år {y0}.",
    ansProf: "Av de {n} nyckeltalen placerar sig {name} bäst på ”{a}” (<b>#{ar}</b>) och sämst på ”{z}” (<b>#{zr}</b>).", ansProfNone: "Välj en kommun för att se var den placerar sig bäst och sämst.",
    tKommun: "Kommun", tValue: "Värde", tRank: "Plats", tMeasure: "Mått", tYear: "År", tCapMap: "{ind}, {y}. Plats {hint}.", tCapTrend: "{ind}, per år.", tCapStrip: "{ind}, {y}: spridning mellan kommunerna och ditt val.",
    tLowest: "Lägst", tQ1: "25:e percentilen", tMedian: "Median (mittenkommunen)", tQ3: "75:e percentilen", tHighest: "Högst",
    footData: "Data: <a href=\"https://www.kolada.se\">Kolada (RKA), öppna data</a> · <a href=\"https://api.kolada.se/v3/\">API</a> · kommungränser <a href=\"https://github.com/okfse/sweden-geojson\">okfse/sweden-geojson</a>, hämtade från Valmyndigheten"
  }
};

/* Tour steps and guide sections for the shared kit (../assets/js/guide-kit.js). */
window.KOM_GUIDE = {
  en: {
    title: "Guide", close: "Close the guide", nav: "Sections", again: "Take the tour again", info: "How to read this",
    tour: {
      label: "Page tour", of: "{n} of {total}", next: "Next", back: "Back", skip: "Skip", done: "Done", guide: "Open the guide",
      steps: [
        { t: "Welcome", b: "How do Sweden's 290 municipalities (kommuner) compare on tax, schools, care, jobs and more? This page shows live figures from Kolada. A quick tour, under a minute." },
        { t: "Pick an indicator", b: "Start here: choose what to compare. The pill says whether a higher or a lower value is better, or neither." },
        { t: "The map", b: "Darker means a higher value. Hover for numbers, click a kommun to add it to your comparison, and zoom with the buttons or Ctrl + scroll." },
        { t: "Compared kommuner", b: "Up to five at a time, each with its own colour that follows it through every chart. Search a name to add one." },
        { t: "Share what you see", b: "Copy link to this view keeps your indicator, year and kommuner, so someone else sees exactly the same." },
        { t: "Best and worst 10", b: "The ten best and the ten worst kommuner for this indicator. Rank 1 is the best, or the highest when neither direction is better. Click a name to compare it." },
        { t: "Trends", b: "How the indicator moved over the years for your kommuner, against Riket, the whole country." },
        { t: "Side by side", b: "Every indicator for your kommuner at once. Green means a better rank than most kommuner, red a worse one. Click an indicator name to put it on the map." }
      ]
    },
    sections: [
      { id: "what", h: "What this page shows", html: `
<p>How Sweden's 290 municipalities (kommuner) compare on 16 indicators: taxes, jobs and income, schools, elder care, health, safety and more. You see them on a map, as rankings, as trends over the years and side by side.</p>
<p>The figures come from Kolada, a free database run by RKA, the Council for the Promotion of Municipal Analyses (Rådet för främjande av kommunala analyser). They are fetched live in your browser every time you open the page.</p>` },
      { id: "use", h: "How to use it", html: `
<ol>
<li><b>Pick an indicator.</b> Use the list at the top, or click an indicator name in the table at the bottom. The pill beside it says whether higher or lower is better.</li>
<li><b>Pick a year</b> if you want to look back. The newest year with data for almost all kommuner is chosen for you.</li>
<li><b>Add kommuner.</b> Click the map, a bar, a row in the lists, or search by name. You can compare up to five, and each gets its own colour.</li>
<li><b>Read the sentence</b> under each chart heading. It sums up the chart for your first kommun.</li>
<li><b>Hover or tap</b> any chart for exact numbers. "Show as table" under a chart lists them all.</li>
<li><b>Share a view.</b> "Copy link to this view" keeps your indicator, year, kommuner and language.</li>
</ol>` },
      { id: "reading", h: "Reading the charts", html: "", sub: [
        { id: "map", h: "The map", html: `
<p>Every kommun is coloured by its value. <b>Darker means higher</b> (in dark mode, lighter means higher). Grey means Kolada has no figure for that kommun and year.</p>
<p>"Colour classes" changes how the seven colours are shared out:</p>
<ul>
<li><b>Quantiles</b> (the default): each colour holds about the same number of kommuner, around 41 each. This shows the order well, even when a few kommuner are far above the rest.</li>
<li><b>Equal steps</b>: each colour covers the same range of values. This shows the real distances, but if a few kommuner are extreme, most of the map ends up in one or two colours.</li>
</ul>
<p>The scale under the map shows the values where the colours change. Ctrl + scroll or the + and − buttons zoom; drag to move.</p>` },
        { id: "compare", h: "Compared kommuner", html: `
<p>Your picks, up to five. The first one is the "subject" of the sentences under the headings and of the link to the Netto page. Click the × on a chip to remove a kommun, or "Reset selection" to go back to the starting four.</p>` },
        { id: "rankings", h: "Rankings", html: `
<p><b>Best and worst 10</b> lists the ten kommuner at each end. <b>All kommuner, ranked</b> shows every kommun as one bar, from rank 1 on the left to the last on the right. Your kommuner are coloured and labelled, and the dashed line is Riket.</p>
<p><b>Rank 1 is the best.</b> What "best" means depends on the indicator: for a tax rate or unemployment, the lowest value is best; for employment or merit points, the highest is. For indicators with no good or bad direction, such as population, rank 1 is simply the highest value, and the lists say "Highest" and "Lowest". Tied kommuner share a rank.</p>
<p>A few indicators, like population, span such a wide range that the bars use a log scale so the small kommuner stay visible.</p>` },
        { id: "trend", h: "Trend", html: `
<p>The chosen indicator over up to ten years, for your kommuner (solid lines) against Riket (dashed).</p>
<p><b>Index (first year = 100)</b> sets every line to 100 in its first year, so you compare growth rather than level. It switches on by itself when the lines are too far apart to share one axis, as with population.</p>
<p>Some indicators have only one published year. Then you see a dot instead of a line.</p>` },
        { id: "profile", h: "All indicators, side by side", html: `
<p>Each row is one indicator, with the latest value and rank (#) for each of your kommuner, and Riket on the right. Each indicator uses its own latest year, shown in the Year column.</p>
<p>The colour shows the share of kommuner a kommun beats: <b>green</b> is better than most, <b>red</b> is worse than most, and the stronger the colour the further from the middle. Indicators with no good or bad direction are not coloured.</p>` }
      ] },
      { id: "terms", h: "Terms", html: `
<dl>
<dt>Kommun (plural kommuner)</dt><dd>A Swedish municipality. Sweden has 290. They run local schools, elder care, water and much else, paid for largely by local income tax.</dd>
<dt>Kolada</dt><dd>A free database of key figures about kommuner and regions, run by RKA. Every figure is called an indicator (nyckeltal).</dd>
<dt>RKA</dt><dd>Rådet för främjande av kommunala analyser, the Council for the Promotion of Municipal Analyses, which runs Kolada.</dd>
<dt>Riket</dt><dd>"The country". The figure for the whole of Sweden, published by Kolada as a point of comparison.</dd>
<dt>Indicator id (N00901)</dt><dd>Kolada's code for one indicator. You can look any of them up on kolada.se or at api.kolada.se/v3/kpi/N00901.</dd>
<dt>Percentile and median</dt><dd>Line up all kommuner from lowest to highest. The median is the middle one. The 25th percentile is the value a quarter of kommuner are below; the 75th, three quarters.</dd>
<dt>Index (first year = 100)</dt><dd>Every line is rescaled to 100 in its first year. 112 means 12 % higher than at the start.</dd>
<dt>Population &amp; housing</dt><dd>Population, how fast it changed over the year, and new homes completed per 1 000 residents.</dd>
<dt>Economy &amp; tax</dt><dd>The municipal income tax rate (the kommun's share only; the region's tax comes on top) and median yearly earned income for ages 20–64.</dd>
<dt>Work &amp; income</dt><dd>Open unemployment (ages 18–65, as a share of all residents that age), employment rate (20–64) and the share of residents receiving social assistance.</dd>
<dt>School &amp; education</dt><dd>Average merit points in grade 9 (sum of the 17 best grades, maximum 340), the share of residents 25–64 with post-secondary education, and preschool children per staff member.</dd>
<dt>Care &amp; health</dt><dd>Elder-care net cost per resident, the share of residents 65+ with home care or in a care home, and sickness benefit days per insured person aged 16–64.</dd>
<dt>Safety &amp; democracy</dt><dd>A safety and security index from 0 to 100 calculated by Tillväxtverket, and voter turnout in the latest local election.</dd>
</dl>` },
      { id: "limits", h: "Good to know", html: `
<ul>
<li><b>Kolada updates on its own calendar.</b> Most indicators are yearly and arrive months after the year ends, and each has its own publication date. When one is known, the page shows "Next Kolada update" under the indicator.</li>
<li><b>Years differ between indicators.</b> The map uses the newest year with data for at least 200 kommuner. The table at the bottom shows each indicator's year.</li>
<li><b>Some kommuner lack data</b> for some indicators and years. They show grey on the map and are left out of rankings.</li>
<li><b>Small kommuner swing more.</b> With few residents, a handful of people can move a percentage a lot from one year to the next. Look at several years before drawing conclusions.</li>
<li><b>"Better" is a rule of thumb, not a verdict.</b> A low tax rate can mean fewer services, and a low elder-care cost can mean few people need care. It only sets which end is rank 1.</li>
<li>The kommun tax rate is only the kommun's part of local income tax. The region's tax comes on top.</li>
<li>Voter turnout is for the latest local election, so the same figure repeats until the next one.</li>
</ul>` },
      { id: "sources", h: "Where the data comes from", html: `
<p>All values come from the <a href="https://api.kolada.se/v3/">Kolada API</a>. Behind each indicator is an official source such as SCB, Socialstyrelsen, Försäkringskassan, Arbetsförmedlingen or Tillväxtverket; Kolada names it on the indicator's page.</p>
<p>Municipality borders are from <a href="https://github.com/okfse/sweden-geojson">okfse/sweden-geojson</a>, derived from Valmyndigheten. The page asks Kolada directly from your browser and keeps answers for an hour in your browser session. Nothing is stored on a server.</p>` },
      { id: "faq", h: "Questions", html: `
<dl>
<dt>Why is a kommun grey on the map?</dt><dd>Kolada has no figure for it for that indicator and year. Try another year.</dd>
<dt>Why does the year differ in the table?</dt><dd>Each indicator is published on its own schedule, so the newest year is not the same for all of them.</dd>
<dt>How do I compare more than five?</dt><dd>You can't on one view, but "Show as table" under the map lists all 290 kommuner with value and rank.</dd>
<dt>How do I share what I see?</dt><dd>Press "Copy link to this view" and send the link. It keeps your indicator, year, kommuner and language.</dd>
</dl>` }
    ]
  },
  sv: {
    title: "Guide", close: "Stäng guiden", nav: "Avsnitt", again: "Ta rundturen igen", info: "Så läser du detta",
    tour: {
      label: "Rundtur på sidan", of: "{n} av {total}", next: "Nästa", back: "Tillbaka", skip: "Hoppa över", done: "Klar", guide: "Öppna guiden",
      steps: [
        { t: "Välkommen", b: "Hur står sig Sveriges 290 kommuner i fråga om skatt, skola, omsorg, jobb med mera? Här ser du färska siffror från Kolada. En kort rundtur, under en minut." },
        { t: "Välj nyckeltal", b: "Börja här: välj vad du vill jämföra. Pillret visar om ett högt eller ett lågt värde är bäst, eller ingetdera." },
        { t: "Kartan", b: "Mörkare betyder högre värde. Håll över för siffror, klicka på en kommun för att lägga till den i jämförelsen, och zooma med knapparna eller Ctrl + scroll." },
        { t: "Jämförda kommuner", b: "Upp till fem åt gången, var och en med en egen färg som följer med i alla diagram. Sök på ett namn för att lägga till." },
        { t: "Dela det du ser", b: "Kopiera länk till vyn sparar nyckeltal, år och kommuner, så att någon annan ser exakt samma sak." },
        { t: "Bäst och sämst 10", b: "De tio bästa och de tio sämsta kommunerna för nyckeltalet. Plats 1 är bäst, eller högst när ingen riktning är bättre. Klicka på ett namn för att jämföra." },
        { t: "Utveckling", b: "Hur nyckeltalet har rört sig över åren för dina kommuner, mot riket som helhet." },
        { t: "Sida vid sida", b: "Alla nyckeltal för dina kommuner på en gång. Grönt betyder bättre placering än de flesta kommuner, rött sämre. Klicka på ett nyckeltal för att visa det på kartan." }
      ]
    },
    sections: [
      { id: "what", h: "Det här visar sidan", html: `
<p>Hur Sveriges 290 kommuner står sig på 16 nyckeltal: skatter, jobb och inkomst, skola, äldreomsorg, hälsa, trygghet med mera. Du ser dem på en karta, som rangordning, som utveckling över åren och sida vid sida.</p>
<p>Siffrorna kommer från Kolada, en gratis databas som drivs av RKA, Rådet för främjande av kommunala analyser. De hämtas direkt i din webbläsare varje gång du öppnar sidan.</p>` },
      { id: "use", h: "Så använder du den", html: `
<ol>
<li><b>Välj nyckeltal.</b> Använd listan överst, eller klicka på ett nyckeltal i tabellen längst ner. Pillret bredvid visar om högre eller lägre är bättre.</li>
<li><b>Välj år</b> om du vill se bakåt. Det senaste året med data för nästan alla kommuner väljs åt dig.</li>
<li><b>Lägg till kommuner.</b> Klicka på kartan, en stapel, en rad i listorna, eller sök på namn. Du kan jämföra upp till fem, och varje får sin egen färg.</li>
<li><b>Läs meningen</b> under varje rubrik. Den sammanfattar diagrammet för din första kommun.</li>
<li><b>Håll över eller tryck</b> på ett diagram för exakta siffror. "Visa som tabell" under diagrammet listar alla.</li>
<li><b>Dela en vy.</b> "Kopiera länk till vyn" sparar nyckeltal, år, kommuner och språk.</li>
</ol>` },
      { id: "reading", h: "Så läser du diagrammen", html: "", sub: [
        { id: "map", h: "Kartan", html: `
<p>Varje kommun är färgad efter sitt värde. <b>Mörkare betyder högre</b> (i mörkt läge betyder ljusare högre). Grått betyder att Kolada saknar siffra för kommunen och året.</p>
<p>"Färgklasser" ändrar hur de sju färgerna fördelas:</p>
<ul>
<li><b>Kvantiler</b> (standard): varje färg rymmer ungefär lika många kommuner, cirka 41 var. Det visar ordningen bra, även när några få kommuner ligger långt över resten.</li>
<li><b>Lika steg</b>: varje färg täcker lika stort värdeintervall. Det visar de verkliga avstånden, men om några få kommuner är extrema hamnar det mesta av kartan i en eller två färger.</li>
</ul>
<p>Skalan under kartan visar värdena där färgerna byter. Ctrl + scroll eller knapparna + och − zoomar; dra för att flytta.</p>` },
        { id: "compare", h: "Jämförda kommuner", html: `
<p>Dina val, upp till fem. Den första är "ämnet" i meningarna under rubrikerna och i länken till Netto-sidan. Klicka på × på en bricka för att ta bort en kommun, eller "Återställ val" för att gå tillbaka till de fyra du började med.</p>` },
        { id: "rankings", h: "Rangordning", html: `
<p><b>Bäst och sämst 10</b> listar de tio kommunerna i vardera änden. <b>Alla kommuner i rangordning</b> visar varje kommun som en stapel, från plats 1 till vänster till sista platsen till höger. Dina kommuner är färgade och namngivna, och den streckade linjen är riket.</p>
<p><b>Plats 1 är bäst.</b> Vad "bäst" betyder beror på nyckeltalet: för skattesats eller arbetslöshet är lägsta värdet bäst; för sysselsättning eller meritvärde är det högsta. För nyckeltal utan bra eller dålig riktning, som folkmängd, är plats 1 helt enkelt det högsta värdet, och listorna heter "Högst" och "Lägst". Kommuner med lika värde delar plats.</p>
<p>Några nyckeltal, som folkmängd, sträcker sig över så stort spann att staplarna använder logaritmisk skala så att de små kommunerna syns.</p>` },
        { id: "trend", h: "Utveckling", html: `
<p>Valt nyckeltal över upp till tio år, för dina kommuner (heldragna linjer) mot riket (streckad).</p>
<p><b>Index (första året = 100)</b> sätter varje linje till 100 det första året, så att du jämför tillväxt i stället för nivå. Det slås på av sig självt när linjerna ligger för långt ifrån varandra för en gemensam axel, som för folkmängd.</p>
<p>Vissa nyckeltal har bara ett publicerat år. Då ser du en prick i stället för en linje.</p>` },
        { id: "profile", h: "Alla nyckeltal sida vid sida", html: `
<p>Varje rad är ett nyckeltal, med senaste värde och placering (#) för var och en av dina kommuner, och riket längst till höger. Varje nyckeltal använder sitt eget senaste år, som visas i kolumnen År.</p>
<p>Färgen visar hur stor andel av kommunerna en kommun slår: <b>grönt</b> är bättre än de flesta, <b>rött</b> är sämre än de flesta, och ju starkare färg desto längre från mitten. Nyckeltal utan bra eller dålig riktning färgas inte.</p>` }
      ] },
      { id: "terms", h: "Begrepp", html: `
<dl>
<dt>Kommun</dt><dd>Sverige har 290 kommuner. De ansvarar för bland annat lokala skolor, äldreomsorg och vatten, och finansieras till stor del med kommunalskatt.</dd>
<dt>Kolada</dt><dd>En gratis databas med nyckeltal om kommuner och regioner, driven av RKA. Varje siffra kallas ett nyckeltal.</dd>
<dt>RKA</dt><dd>Rådet för främjande av kommunala analyser, som driver Kolada.</dd>
<dt>Riket</dt><dd>Siffran för hela Sverige, som Kolada publicerar som jämförelsepunkt.</dd>
<dt>Nyckeltals-id (N00901)</dt><dd>Koladas kod för ett nyckeltal. Du kan slå upp vilket som helst på kolada.se eller på api.kolada.se/v3/kpi/N00901.</dd>
<dt>Percentil och median</dt><dd>Ställ alla kommuner på rad från lägst till högst. Medianen är den i mitten. 25:e percentilen är värdet som en fjärdedel av kommunerna ligger under; 75:e, tre fjärdedelar.</dd>
<dt>Index (första året = 100)</dt><dd>Varje linje skalas om till 100 det första året. 112 betyder 12 % högre än i början.</dd>
<dt>Befolkning och bostäder</dt><dd>Folkmängd, hur snabbt den ändrats under året och nya bostäder per 1 000 invånare.</dd>
<dt>Ekonomi och skatt</dt><dd>Kommunalskatten (bara kommunens del; regionens skatt kommer ovanpå) och medianen av förvärvsinkomsten per år för 20–64 år.</dd>
<dt>Arbete och försörjning</dt><dd>Öppen arbetslöshet (18–65 år, som andel av alla invånare i åldern), sysselsättningsgrad (20–64) och andelen invånare med ekonomiskt bistånd.</dd>
<dt>Skola och utbildning</dt><dd>Genomsnittligt meritvärde i årskurs 9 (summan av de 17 bästa betygen, högst 340), andelen 25–64-åringar med eftergymnasial utbildning och barn per anställd i förskolan.</dd>
<dt>Omsorg och hälsa</dt><dd>Äldreomsorgens nettokostnad per invånare, andelen 65+ med hemtjänst eller särskilt boende, och sjukpenningdagar per försäkrad 16–64 år.</dd>
<dt>Trygghet och demokrati</dt><dd>Ett trygghets- och säkerhetsindex från 0 till 100 som Tillväxtverket beräknar, och valdeltagandet i senaste kommunalvalet.</dd>
</dl>` },
      { id: "limits", h: "Bra att veta", html: `
<ul>
<li><b>Kolada uppdateras enligt eget schema.</b> De flesta nyckeltal är årliga och kommer månader efter årets slut, och varje har sitt eget publiceringsdatum. När ett är känt visar sidan "Nästa uppdatering i Kolada" under nyckeltalet.</li>
<li><b>Åren skiljer sig mellan nyckeltal.</b> Kartan använder det senaste året med data för minst 200 kommuner. Tabellen längst ner visar varje nyckeltals år.</li>
<li><b>Vissa kommuner saknar data</b> för vissa nyckeltal och år. De är grå på kartan och ingår inte i rangordningen.</li>
<li><b>Små kommuner svänger mer.</b> Med få invånare kan några få personer flytta en procentsats mycket från ett år till nästa. Titta på flera år innan du drar slutsatser.</li>
<li><b>"Bättre" är en tumregel, inte en dom.</b> Låg skatt kan betyda mindre service, och låg äldreomsorgskostnad kan betyda att få behöver omsorg. Det styr bara vilken ände som är plats 1.</li>
<li>Kommunalskatten är bara kommunens del av den lokala inkomstskatten. Regionens skatt kommer ovanpå.</li>
<li>Valdeltagandet gäller senaste kommunalvalet, så samma siffra upprepas tills nästa val.</li>
</ul>` },
      { id: "sources", h: "Varifrån data kommer", html: `
<p>Alla värden kommer från <a href="https://api.kolada.se/v3/">Koladas API</a>. Bakom varje nyckeltal finns en officiell källa som SCB, Socialstyrelsen, Försäkringskassan, Arbetsförmedlingen eller Tillväxtverket; Kolada anger den på nyckeltalets sida.</p>
<p>Kommungränserna kommer från <a href="https://github.com/okfse/sweden-geojson">okfse/sweden-geojson</a>, hämtade från Valmyndigheten. Sidan frågar Kolada direkt från din webbläsare och sparar svaren i en timme i webbläsarsessionen. Inget sparas på någon server.</p>` },
      { id: "faq", h: "Frågor", html: `
<dl>
<dt>Varför är en kommun grå på kartan?</dt><dd>Kolada har ingen siffra för den för nyckeltalet och året. Prova ett annat år.</dd>
<dt>Varför skiljer sig året i tabellen?</dt><dd>Varje nyckeltal publiceras enligt eget schema, så det senaste året är inte detsamma för alla.</dd>
<dt>Hur jämför jag fler än fem?</dt><dd>Det går inte i en vy, men "Visa som tabell" under kartan listar alla 290 kommuner med värde och plats.</dd>
<dt>Hur delar jag det jag ser?</dt><dd>Tryck på "Kopiera länk till vyn" och skicka länken. Den sparar nyckeltal, år, kommuner och språk.</dd>
</dl>` }
    ]
  }
};
