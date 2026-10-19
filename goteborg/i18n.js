/* Göteborg: interface text in English and Swedish. Police event types and the free text of reports come from Polisen in Swedish and are shown as they are. */
window.GBG_TEXT = {
  en: {
    metaDesc: "Live weather, forecast, electricity price, the Swedish power mix and police events for Göteborg, fetched in your browser from open Swedish data sources.",
    h1: "Göteborg <span>now</span>",
    lead: "Weather, electricity and police reports for Göteborg. It updates on its own while the page is open.",
    tourBtn: "Take the tour", guideBtn: "Guide", guideLink: "User guide",
    moreT: "More about Göteborg:", moreKom: "Göteborg among all 290 municipalities", moreNet: "Take-home pay in Göteborg",
    ariaKpis: "Right now", ariaDays: "Daily forecast", ariaDay: "Choose day", ariaArea: "Area", ariaWin: "Time window", ariaFeed: "Police events, newest first", ariaLang: "Language",
    fcT: "Forecast, next 48 hours", fcSub: "Temperature, rain and wind for central Göteborg.",
    fcLgT: "Temperature °C", fcLgR: "Precipitation mm", fcLgW: "Wind m/s (shaded up to gusts)",
    nowT: "Electricity production now", nowSub: "Sweden, by source.",
    mixT: "Production today", mixSub: "Sweden, by source. The dashed line is consumption.",
    priceT: "Electricity price, SE3", priceSub: "Spot price in öre per kWh for Göteborg's bidding area.",
    today: "Today", tomorrow: "Tomorrow",
    feedT: "Police events", areaGbg: "Göteborg", areaVg: "+ Västra Götaland",
    typesT: "Events by type", typesSub: "Count of reported events, daily summaries excluded.", win24: "24 h", win168: "7 days",
    typesNote: "Police positions are approximate: Polisen publishes one county-wide coordinate for every event, so no map is drawn here. Counts use the time each report was published.",
    footData: `Data, fetched live in your browser:
      <a href="https://opendata.smhi.se/" rel="noopener">SMHI Open Data</a> (observations and forecast, CC BY 4.0) ·
      <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room ·
      <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisen</a> events API ·
      <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a> (community service built on Nord Pool data, not an official source).`,
    footCode: "Code: MIT · ",

    loading: "Loading", loadingLive: "Loading live data…", unavailable: "Unavailable right now",
    errLoad: "Couldn't load {what} ({e}). Retrying automatically.", errLoadShort: "Couldn't load police events ({e}).",
    whatFc: "the forecast", whatPower: "the power data", whatMix: "the power mix", whatPrice: "prices", whatPolice: "police events",
    refreshFailed: "refresh failed, showing data from {t}", unavailableSrc: "unavailable right now",
    sparkLbl: "Trend over the last day",
    srcNameObs: "SMHI observations", srcNameFc: "SMHI forecast", srcNameSvk: "Svenska kraftnät", srcNamePrice: "electricity price", srcNamePolice: "Polisen",
    stStale: "Offline · no source could be loaded ({n}); retrying", stPart: "Partly live · updated {t} · problem with {n}", stOk: "Updated {t}",

    kTemp: "Temperature now", kWind: "Wind", kRain: "Rain, last hour", kPrice: "Electricity now", kPower: "Sweden: production", kPolice: "Police events today",
    pillNational: "national",
    feels: "Feels like {v} °C", humidity: "Humidity {v} %", range24: "24 h: {a} to {b} °C", observed: "Observed {t}", stale: "Stale: {t}",
    obsDown: "SMHI observations unavailable", noWind: "No wind reading", noRain: "No precipitation reading",
    windMax: "24 h max: {v} m/s", raining: "Raining", dry: "Dry", rain24: "Last 24 h: {v} mm",
    w0: "Calm", w1: "Light air to breeze", w2: "Gentle to moderate breeze", w3: "Fresh to strong breeze", w4: "Near gale to gale", w5: "Storm",
    svkDown: "Svenska kraftnät unavailable", importGW: "Importing {v} GW", exportGW: "Exporting {v} GW", consGW: "Consumption {v} GW", asOf: "As of {t}",
    priceDown: "Price source unavailable", avgAbout: "About today's average", avgAbove: "{p} % above today's average", avgBelow: "{p} % below today's average",
    cheapMeta: "Cheapest {a}–{b}: {v} öre", spotNote: "Spot price, before grid fees and taxes",
    policeDown: "Polisen unavailable", latest: "Latest: {type}, {when}", noEventsYet: "No events yet", last24: "Last 24 h: {n}", last7: "Last 7 days: {n}",

    srcFc: `Source: <a href="https://opendata.smhi.se/" rel="noopener">SMHI Open Data</a> (CC BY 4.0), SNOW1g point forecast for 57,71 N, 11,97 E`,
    modelRun: "model run {t}", fcEmpty: "No forecast data for the next 48 hours.", dryLc: "dry",
    nowWord: "now", dayStripToday: "Today",
    tipRain: "rain", tipWind: "Wind", tipGusts: "gusts",
    fcAria: "Forecast for the next 48 hours: temperature between {lo} and {hi} °C, up to {rain} mm precipitation per period, wind up to {wind} m/s.",

    srcNow: `Source: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room`,
    srcMix: `Source: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room, 15 minute values, Sweden-wide; "solar and other" is Svenska kraftnät's unspecified category`,
    asOfSrc: "as of {t}", updatedSrc: "updated {t}", fetchedSrc: "fetched {t}",
    production: "Production", consumption: "Consumption",
    importMW: "Importing {v} MW", exportMW: "Exporting {v} MW",
    importNote: "Sweden uses more than it produces right now.", exportNote: "Sweden produces more than it uses right now.",
    donutLbl: "Share of production by source",
    mixAria: "Stacked area chart of today's Swedish electricity production by source with consumption line.",
    mix_nuclear: "Nuclear", mix_hydro: "Hydro", mix_wind: "Wind", mix_thermal: "Thermal", mix_other: "Solar and other",
    se3Line: "Göteborg's bidding area (SE3), {t}: consumption <b>{a} MW</b>{plan}.", se3Plan: " against {p} MW planned",
    tipProd: "Production {v} MW", tipCons: "Consumption {v} MW",

    srcPrice: `Source: <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a>, a community service built on Nord Pool day-ahead data (not a government source). Prices exclude VAT, grid fees and taxes`,
    priceAria: "Electricity spot price for {day}, from {lo} to {hi} öre per kWh.", dayToday: "today", dayTomorrow: "tomorrow",
    chipNow: "Now", chipCheap: "Cheapest hour {a}–{b}", chipDear: "Priciest hour {a}–{b}", chipAvg: "Day average", oreV: "{v} öre",
    sekkwh: "SEK/kWh",

    srcFeed: `Source: <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisen</a> events API. Swedish text is unchanged; positions are not shown because the police only give approximate, county-wide coordinates`,
    subFeedGbg: "Latest reports for Göteborg, newest first.", subFeedVg: "Latest reports for Göteborg and the rest of Västra Götaland.",
    noEvents: "No events published.", noSummary: "No summary.", readOn: "Read on polisen.se", noEventsPeriod: "No events in this period.",
    otherTypes: "Other types", event1: "event", eventN: "events",
    areaTxtGbg: "Göteborg", areaTxtVg: "Göteborg and Västra Götaland", winTxt24: "the last 24 hours", winTxt168: "the last 7 days",
    typesAria: "Police events by type, {win}: {list}",

    when_today: "today at {h}", when_yesterday: "yesterday at {h}", when_tomorrow: "tomorrow at {h}", when_day: "{d} at {h}",
    fcAnsRange: "Between <b>{lo} and {hi} °C</b> over the next 48 hours.", fcAnsFlat: "Around <b>{lo} °C</b> over the next 48 hours.",
    fcAnsDry: "Dry the whole time.", fcAnsNow: "Raining now, {mm} mm in all.", fcAnsFrom: "Rain arrives <b>{when}</b>, {mm} mm in all.",
    nowAns: "{a} and {b} make <b>{p} %</b> of Sweden's power right now.", nowAns1: "{a} makes <b>{p} %</b> of Sweden's power right now.",
    mixAns: "{a} has been the biggest source so far today, <b>{p} %</b> of all production.",
    priceAnsAhead: "Electricity is cheapest at <b>{h}</b> today, <b>{p} öre/kWh</b>.",
    priceAnsPast: "Today's cheapest hour was <b>{h}</b> at <b>{p} öre/kWh</b>; right now it costs <b>{n} öre/kWh</b>.",
    priceAnsTm: "Tomorrow, electricity is cheapest at <b>{h}</b>, <b>{p} öre/kWh</b>.",
    feedAns: "Latest report: <b>{type}</b>, published {when}.", feedAnsNone: "No reports published yet.",
    typesAns: "<b>{n}</b> police {rep} in {area} in {win}, most often <b>{type}</b>.", typesAnsNone: "No police reports in {area} in {win}.", rep1: "report", repN: "reports",

    tblFc: "Hourly forecast for the next 48 hours", tblTime: "Time", tblTemp: "Temperature °C", tblRain: "Rain mm", tblWind: "Wind m/s", tblGust: "Gusts m/s", tblWx: "Weather",
    tblPrice: "Spot price per hour, {day}, öre per kWh (average of the quarter-hour prices)", tblHour: "Hour", tblOre: "Price öre/kWh",
    tblMix: "Swedish electricity production by source, today, MW", tblProd: "Production MW", tblCons: "Consumption MW",
    tblTypes: "Police events by type, {area}, {win}", tblType: "Type", tblCount: "Events"
  },
  sv: {
    metaDesc: "Väder, prognos, elpris, Sveriges elproduktion och polishändelser för Göteborg, hämtade direkt i din webbläsare från öppna svenska datakällor.",
    h1: "Göteborg <span>just nu</span>",
    lead: "Väder, el och polishändelser för Göteborg. Sidan uppdaterar sig själv medan den är öppen.",
    tourBtn: "Ta rundturen", guideBtn: "Guide", guideLink: "Användarguide",
    moreT: "Mer om Göteborg:", moreKom: "Göteborg bland alla 290 kommuner", moreNet: "Nettolön i Göteborg",
    ariaKpis: "Just nu", ariaDays: "Prognos per dag", ariaDay: "Välj dag", ariaArea: "Område", ariaWin: "Tidsfönster", ariaFeed: "Polishändelser, nyaste först", ariaLang: "Språk",
    fcT: "Prognos, närmaste 48 timmarna", fcSub: "Temperatur, regn och vind för centrala Göteborg.",
    fcLgT: "Temperatur °C", fcLgR: "Nederbörd mm", fcLgW: "Vind m/s (skuggat upp till vindbyar)",
    nowT: "Elproduktion just nu", nowSub: "Sverige, per kraftslag.",
    mixT: "Produktion i dag", mixSub: "Sverige, per kraftslag. Den streckade linjen är förbrukningen.",
    priceT: "Elpris, SE3", priceSub: "Spotpris i öre per kWh för Göteborgs elområde.",
    today: "I dag", tomorrow: "I morgon",
    feedT: "Polishändelser", areaGbg: "Göteborg", areaVg: "+ Västra Götaland",
    typesT: "Händelser per typ", typesSub: "Antal rapporterade händelser, dagssammanfattningar undantagna.", win24: "24 tim", win168: "7 dagar",
    typesNote: "Polisens positioner är ungefärliga: Polisen anger en enda koordinat för hela länet för varje händelse, så ingen karta ritas här. Antalen räknas efter när varje rapport publicerades.",
    footData: `Data, hämtad direkt i din webbläsare:
      <a href="https://opendata.smhi.se/" rel="noopener">SMHI Öppna data</a> (observationer och prognos, CC BY 4.0) ·
      <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnäts</a> kontrollrum ·
      <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisens</a> API för händelser ·
      <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a> (en community-tjänst byggd på Nord Pools data, inte en officiell källa).`,
    footCode: "Kod: MIT · ",

    loading: "Laddar", loadingLive: "Laddar live-data…", unavailable: "Inte tillgänglig just nu",
    errLoad: "Kunde inte läsa in {what} ({e}). Försöker igen automatiskt.", errLoadShort: "Kunde inte läsa in polishändelserna ({e}).",
    whatFc: "prognosen", whatPower: "kraftdatan", whatMix: "elmixen", whatPrice: "priserna", whatPolice: "polishändelserna",
    refreshFailed: "uppdateringen misslyckades, visar data från {t}", unavailableSrc: "inte tillgänglig just nu",
    sparkLbl: "Utveckling senaste dygnet",
    srcNameObs: "SMHI:s observationer", srcNameFc: "SMHI:s prognos", srcNameSvk: "Svenska kraftnät", srcNamePrice: "elpriset", srcNamePolice: "Polisen",
    stStale: "Offline · ingen källa gick att läsa in ({n}); försöker igen", stPart: "Delvis live · uppdaterad {t} · problem med {n}", stOk: "Uppdaterad {t}",

    kTemp: "Temperatur nu", kWind: "Vind", kRain: "Regn, senaste timmen", kPrice: "Elpris nu", kPower: "Sverige: produktion", kPolice: "Polishändelser i dag",
    pillNational: "hela landet",
    feels: "Känns som {v} °C", humidity: "Luftfuktighet {v} %", range24: "24 tim: {a} till {b} °C", observed: "Observerad {t}", stale: "Gammal: {t}",
    obsDown: "SMHI:s observationer är inte tillgängliga", noWind: "Ingen vindmätning", noRain: "Ingen nederbördsmätning",
    windMax: "Max 24 tim: {v} m/s", raining: "Det regnar", dry: "Torrt", rain24: "Senaste 24 tim: {v} mm",
    w0: "Stiltje", w1: "Svag vind", w2: "Måttlig vind", w3: "Frisk vind", w4: "Hård vind", w5: "Storm",
    svkDown: "Svenska kraftnät är inte tillgängligt", importGW: "Importerar {v} GW", exportGW: "Exporterar {v} GW", consGW: "Förbrukning {v} GW", asOf: "Kl. {t}",
    priceDown: "Priskällan är inte tillgänglig", avgAbout: "Ungefär dagens medelpris", avgAbove: "{p} % över dagens medelpris", avgBelow: "{p} % under dagens medelpris",
    cheapMeta: "Billigast {a}–{b}: {v} öre", spotNote: "Spotpris, före nätavgifter och skatter",
    policeDown: "Polisen är inte tillgänglig", latest: "Senast: {type}, {when}", noEventsYet: "Inga händelser än", last24: "Senaste 24 tim: {n}", last7: "Senaste 7 dagarna: {n}",

    srcFc: `Källa: <a href="https://opendata.smhi.se/" rel="noopener">SMHI Öppna data</a> (CC BY 4.0), punktprognos SNOW1g för 57,71 N, 11,97 E`,
    modelRun: "modellkörning {t}", fcEmpty: "Ingen prognos för de närmaste 48 timmarna.", dryLc: "torrt",
    nowWord: "nu", dayStripToday: "I dag",
    tipRain: "regn", tipWind: "Vind", tipGusts: "byar",
    fcAria: "Prognos för de närmaste 48 timmarna: temperatur mellan {lo} och {hi} °C, upp till {rain} mm nederbörd per period, vind upp till {wind} m/s.",

    srcNow: `Källa: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnäts</a> kontrollrum`,
    srcMix: `Källa: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnäts</a> kontrollrum, värden var 15:e minut, hela Sverige; "sol och övrigt" är Svenska kraftnäts ospecificerade kategori`,
    asOfSrc: "kl. {t}", updatedSrc: "uppdaterad {t}", fetchedSrc: "hämtad {t}",
    production: "Produktion", consumption: "Förbrukning",
    importMW: "Importerar {v} MW", exportMW: "Exporterar {v} MW",
    importNote: "Sverige använder mer än vad som produceras just nu.", exportNote: "Sverige producerar mer än vad som används just nu.",
    donutLbl: "Andel av produktionen per kraftslag",
    mixAria: "Staplat ytdiagram över dagens svenska elproduktion per kraftslag med en linje för förbrukningen.",
    mix_nuclear: "Kärnkraft", mix_hydro: "Vattenkraft", mix_wind: "Vindkraft", mix_thermal: "Värmekraft", mix_other: "Sol och övrigt",
    se3Line: "Göteborgs elområde (SE3), {t}: förbrukning <b>{a} MW</b>{plan}.", se3Plan: " mot {p} MW planerat",
    tipProd: "Produktion {v} MW", tipCons: "Förbrukning {v} MW",

    srcPrice: `Källa: <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a>, en community-tjänst byggd på Nord Pools dagen före-data (inte en myndighetskälla). Priserna är utan moms, nätavgifter och skatter`,
    priceAria: "Spotpris på el {day}, från {lo} till {hi} öre per kWh.", dayToday: "i dag", dayTomorrow: "i morgon",
    chipNow: "Nu", chipCheap: "Billigaste timmen {a}–{b}", chipDear: "Dyraste timmen {a}–{b}", chipAvg: "Dygnets medelpris", oreV: "{v} öre",
    sekkwh: "kr/kWh",

    srcFeed: `Källa: <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisens</a> API för händelser. Texten är på svenska och oförändrad; positioner visas inte eftersom polisen bara anger ungefärliga koordinater för hela länet`,
    subFeedGbg: "Senaste händelserna i Göteborg, nyaste först.", subFeedVg: "Senaste händelserna i Göteborg och övriga Västra Götaland.",
    noEvents: "Inga händelser publicerade.", noSummary: "Ingen sammanfattning.", readOn: "Läs på polisen.se", noEventsPeriod: "Inga händelser under perioden.",
    otherTypes: "Övriga typer", event1: "händelse", eventN: "händelser",
    areaTxtGbg: "Göteborg", areaTxtVg: "Göteborg och Västra Götaland", winTxt24: "de senaste 24 timmarna", winTxt168: "de senaste 7 dagarna",
    typesAria: "Polishändelser per typ, {win}: {list}",

    when_today: "i dag kl. {h}", when_yesterday: "i går kl. {h}", when_tomorrow: "i morgon kl. {h}", when_day: "{d} kl. {h}",
    fcAnsRange: "Mellan <b>{lo} och {hi} °C</b> de närmaste 48 timmarna.", fcAnsFlat: "Runt <b>{lo} °C</b> de närmaste 48 timmarna.",
    fcAnsDry: "Uppehåll hela tiden.", fcAnsNow: "Det regnar nu, {mm} mm sammanlagt.", fcAnsFrom: "Regnet kommer <b>{when}</b>, {mm} mm sammanlagt.",
    nowAns: "{a} och {b} står för <b>{p} %</b> av Sveriges elproduktion just nu.", nowAns1: "{a} står för <b>{p} %</b> av Sveriges elproduktion just nu.",
    mixAns: "{a} har varit den största källan hittills i dag, <b>{p} %</b> av all produktion.",
    priceAnsAhead: "Elen är billigast kl. <b>{h}</b> i dag, <b>{p} öre/kWh</b>.",
    priceAnsPast: "Dagens billigaste timme var <b>{h}</b> med <b>{p} öre/kWh</b>; just nu kostar den <b>{n} öre/kWh</b>.",
    priceAnsTm: "I morgon är elen billigast kl. <b>{h}</b>, <b>{p} öre/kWh</b>.",
    feedAns: "Senaste händelsen: <b>{type}</b>, publicerad {when}.", feedAnsNone: "Inga händelser publicerade än.",
    typesAns: "<b>{n}</b> {rep} i {area} {win}, oftast <b>{type}</b>.", typesAnsNone: "Inga polishändelser i {area} {win}.", rep1: "polishändelse", repN: "polishändelser",

    tblFc: "Prognos per timme för de närmaste 48 timmarna", tblTime: "Tid", tblTemp: "Temperatur °C", tblRain: "Regn mm", tblWind: "Vind m/s", tblGust: "Vindbyar m/s", tblWx: "Väder",
    tblPrice: "Spotpris per timme, {day}, öre per kWh (medel av kvartspriserna)", tblHour: "Timme", tblOre: "Pris öre/kWh",
    tblMix: "Sveriges elproduktion per kraftslag, i dag, MW", tblProd: "Produktion MW", tblCons: "Förbrukning MW",
    tblTypes: "Polishändelser per typ, {area}, {win}", tblType: "Typ", tblCount: "Händelser"
  }
};

/* SMHI weather symbol codes (SNOW1g, 1 to 27) in both languages. */
window.GBG_SYM = {
  en: { 1: "Clear sky", 2: "Nearly clear sky", 3: "Variable cloudiness", 4: "Half-clear sky", 5: "Cloudy", 6: "Overcast", 7: "Fog", 8: "Light rain showers", 9: "Moderate rain showers", 10: "Heavy rain showers", 11: "Thunderstorm", 12: "Light sleet showers", 13: "Moderate sleet showers", 14: "Heavy sleet showers", 15: "Light snow showers", 16: "Moderate snow showers", 17: "Heavy snow showers", 18: "Light rain", 19: "Moderate rain", 20: "Heavy rain", 21: "Thunder", 22: "Light sleet", 23: "Moderate sleet", 24: "Heavy sleet", 25: "Light snowfall", 26: "Moderate snowfall", 27: "Heavy snowfall" },
  sv: { 1: "Klar himmel", 2: "Mestadels klar himmel", 3: "Växlande molnighet", 4: "Halvklar himmel", 5: "Molnigt", 6: "Mulet", 7: "Dimma", 8: "Lätta regnskurar", 9: "Måttliga regnskurar", 10: "Kraftiga regnskurar", 11: "Åskväder", 12: "Lätta skurar av snöblandat regn", 13: "Måttliga skurar av snöblandat regn", 14: "Kraftiga skurar av snöblandat regn", 15: "Lätta snöbyar", 16: "Måttliga snöbyar", 17: "Kraftiga snöbyar", 18: "Lätt regn", 19: "Måttligt regn", 20: "Kraftigt regn", 21: "Åska", 22: "Lätt snöblandat regn", 23: "Måttligt snöblandat regn", 24: "Kraftigt snöblandat regn", 25: "Lätt snöfall", 26: "Måttligt snöfall", 27: "Kraftigt snöfall" }
};

/* Tour and guide text (guide.js). Section html is trusted markup. */
window.GBG_GUIDE = {
  en: {
    title: "Guide", close: "Close the guide", nav: "Sections", again: "Take the tour again", info: "How to read this",
    tour: {
      label: "Page tour", of: "{n} of {total}", next: "Next", back: "Back", skip: "Skip", done: "Done", guide: "Open the guide",
      steps: [
        { t: "Welcome", b: "What is the weather in Göteborg, and what does electricity cost? This page shows it live, with police reports too. A quick tour, under a minute." },
        { t: "Live tiles", b: "Six tiles show how things are right now: temperature, wind, rain, the electricity price, Sweden's power production and police events. They update by themselves while the page is open." },
        { t: "48-hour forecast", b: "The orange line is temperature and the blue bars are rain. The teal line is wind, with arrows pointing the way it blows. The sentence at the top sums it up." },
        { t: "Electricity production", b: "Where Sweden's power comes from, hour by hour. The dashed line is how much the country uses. Hover a chart for exact numbers." },
        { t: "Electricity price", b: "The SE3 spot price in öre per kWh, before grid fees and taxes. Green marks the cheapest hour of the day, red the priciest." },
        { t: "Police events", b: "Recent reports from Polisen, and a count by type. They are a selection of what the police publish, not crime statistics." },
        { t: "All set", b: "Tap a ? next to any heading for help. EN and SV at the top switch language, and Show as table under a chart gives the numbers as text." }
      ]
    },
    sections: [
      { id: "what", h: "What this page shows", html: `
<p>A live look at Göteborg: the weather now and for the next 48 hours, how Sweden makes its electricity, the electricity price in Göteborg's price area (SE3), and the latest police reports.</p>
<p>Everything comes from open Swedish data sources and is fetched by your browser when you open the page. You do not have to do anything: it refreshes itself while it is open.</p>` },
      { id: "use", h: "How to use it", html: `
<ol>
<li><b>Read the sentence under each heading.</b> It gives the answer in plain words. The chart below shows the detail.</li>
<li><b>Hover or tap</b> a chart for exact numbers at that moment.</li>
<li><b>Show as table</b> under a chart lists the same numbers as text.</li>
<li><b>Today / Tomorrow</b> switches the price chart. Tomorrow appears once tomorrow's prices are published, normally in the afternoon.</li>
<li><b>Göteborg / + Västra Götaland</b> widens the police list and the count by type to the rest of the county.</li>
<li><b>24 h / 7 days</b> sets the time window for the count by type.</li>
<li><b>EN / SV</b> at the top changes language. The ? buttons open this guide at the right place.</li>
</ol>` },
      { id: "charts", h: "Reading the charts", html: "", sub: [
        { id: "tiles", h: "The live tiles", html: `
<p>Temperature, wind and rain are measured at SMHI's station Göteborg A. The price tile is the current SE3 spot price compared with today's average. The power tile is Sweden as a whole, not Göteborg. The police tile counts today's reports for Göteborg.</p>
<p>The small line under a tile is the trend: the last 24 hours for the weather, today so far for price and power. "Feels like" appears when it is cold and windy.</p>` },
        { id: "forecast", h: "Forecast, next 48 hours", html: `
<p>The upper panel is <b>temperature</b>: the orange line, with degrees Celsius on the left. The blue bars are <b>rain</b> in millimetres, read on the right-hand scale; each bar covers one forecast period, normally an hour.</p>
<p>The lower panel is <b>wind</b> in metres per second. The line is the average wind, the shaded band reaches up to the gusts, and the arrows point the way the wind is blowing.</p>
<p>The vertical line marks now and the dashed lines mark midnight. Under the chart, each day shows its high and low, the rain expected and the weather around midday.</p>` },
        { id: "power", h: "Electricity production", html: `
<p><b>Production now</b> shows Sweden's output and use in megawatts (MW) at the latest 15-minute value, and a ring with the share of each source.</p>
<p><b>Production today</b> stacks the sources from midnight to midnight. The dashed line is how much Sweden uses. When the stack is above the line, the country makes more than it uses and the rest goes abroad; when it is below, it imports. A line under the chart compares consumption in SE3 with what was planned.</p>` },
        { id: "price", h: "Electricity price, SE3", html: `
<p>One bar per 15 minutes, in öre per kWh. Hours that have passed are faded and a vertical line marks now. The green bars are the cheapest hour of the day and the red bars the priciest.</p>
<p>The boxes under the chart give the price now, the cheapest and priciest hour, and the day's average. Hours are averages of the quarter-hour prices.</p>` },
        { id: "police", h: "Police events", html: `
<p>The list shows the newest reports from Polisen: when, the type, a short text in Swedish and a link to the full report. The bar chart counts reports by type over the last 24 hours or 7 days. Daily summaries ("Sammanfattning") are left out of the count.</p>
<p>No map is drawn: Polisen gives one approximate, county-wide position for every event.</p>` }
      ] },
      { id: "terms", h: "Terms in plain words", html: `
<dl>
<dt>SE3, price area</dt><dd>Sweden is split into four electricity price areas, SE1 in the north to SE4 in the south. Göteborg is in SE3, together with Stockholm and most of central Sweden. Each area can have a different price.</dd>
<dt>Spot price</dt><dd>The market price of electricity, set the day before on the Nord Pool power exchange. It is not what you pay: your bill also has grid fees, electricity tax, VAT and your supplier's margin, and depends on your contract.</dd>
<dt>öre/kWh</dt><dd>100 öre is 1 krona. A kWh (kilowatt-hour) is what a 1 000 watt appliance uses in an hour. So 50 öre/kWh is 0,50 kr for each kWh.</dd>
<dt>MW and GW</dt><dd>Megawatt and gigawatt measure power at a moment. 1 GW is 1 000 MW.</dd>
<dt>Net import / export</dt><dd>Production minus consumption. Export means Sweden makes more than it uses and sends the surplus to neighbouring countries. Import means neighbours cover the gap.</dd>
<dt>Production sources</dt><dd><i>Hydro</i>: water running through dams. <i>Nuclear</i>: nuclear reactors. <i>Wind</i>: wind turbines. <i>Thermal</i>: power plants that burn fuel, many of them also heating towns. <i>Solar and other</i>: solar plus small production that Svenska kraftnät does not split out.</dd>
<dt>m/s and wind words</dt><dd>Metres per second. Under 0,5 m/s is calm; up to 3,3 light air to breeze; 3,4 to 7,9 gentle to moderate breeze; 8 to 13,9 fresh to strong breeze; 14 to 20,9 near gale to gale; 21 or more storm. These follow the Beaufort scale.</dd>
<dt>Gust</dt><dd>A short peak of wind above the average.</dd>
<dt>Feels like</dt><dd>How cold the wind makes the air feel on your skin. It is shown only at 10 °C or colder with wind of at least about 1,3 m/s.</dd>
<dt>mm of rain</dt><dd>1 mm is one litre of water on every square metre. The number in brackets in the forecast tooltip is the chance of rain.</dd>
<dt>Police event</dt><dd>A report that Polisen publishes on its website about something that happened, such as a traffic accident, a theft or a fire. It is <b>not</b> a crime statistic: it is a selection that the police choose to write up, one event is not one crime, and more events can simply mean more reports published.</dd>
<dt>Sammanfattning</dt><dd>A summary report that rounds up a day or a period. It is left out of the count by type.</dd>
</dl>` },
      { id: "limits", h: "Good to know", html: `
<ul>
<li><b>Refresh timing.</b> While the page is open and visible, weather observations and power data refresh every 5 minutes, police events every 2, the price every 15 and the forecast every hour. A hidden tab pauses and catches up when you come back.</li>
<li><b>The forecast is a model, not a measurement.</b> It is for one point in central Göteborg and is less certain further ahead.</li>
<li><b>"+ Västra Götaland"</b> only adds reports from the rest of the county to the list and the count by type. The tiles always count Göteborg alone.</li>
<li><b>Data gaps.</b> If a source does not answer, its tile shows a dash or a message and the page tries again after a minute while everything else keeps working. Tomorrow's price is missing until it is published, and the power chart can be empty for a moment just after midnight.</li>
<li>All times are Swedish time.</li>
</ul>` },
      { id: "sources", h: "Where the data comes from", html: `
<ul>
<li><b>Weather:</b> <a href="https://opendata.smhi.se/" rel="noopener">SMHI Open Data</a>. Observations from station Göteborg A and the SNOW1g point forecast, CC BY 4.0.</li>
<li><b>Power:</b> the <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room: production and consumption in 15-minute values.</li>
<li><b>Price:</b> <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a>, a community service built on Nord Pool's day-ahead prices. It is not an official source, and its prices exclude VAT, grid fees and taxes.</li>
<li><b>Police:</b> <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisen</a>'s events API.</li>
</ul>
<p>Your browser asks these services directly. Nothing is stored on a server.</p>` },
      { id: "faq", h: "Questions", html: `
<dl>
<dt>Why is my electricity bill higher than the chart?</dt><dd>The chart is the spot price only. Your bill adds grid fees, taxes, VAT and your supplier's margin.</dd>
<dt>Is this a crime map?</dt><dd>No. Police events are a selection of reports, and they are not placed on a map. See "Police event" under Terms.</dd>
<dt>Why does a tile show a dash?</dt><dd>That source did not answer. The page tries again about once a minute.</dd>
<dt>What does Göteborg's pay look like after tax?</dt><dd>See <a href="../netto/?k=1480">take-home pay in Göteborg</a>. To compare Göteborg with other municipalities, open <a href="../kommuner/?k=1480">Göteborg in Kommuner</a>.</dd>
<dt>Does the page track me?</dt><dd>No. It only remembers your language, theme and that you have seen the tour, in your own browser.</dd>
</dl>` }
    ]
  },
  sv: {
    title: "Guide", close: "Stäng guiden", nav: "Avsnitt", again: "Ta rundturen igen", info: "Så läser du detta",
    tour: {
      label: "Rundtur på sidan", of: "{n} av {total}", next: "Nästa", back: "Tillbaka", skip: "Hoppa över", done: "Klar", guide: "Öppna guiden",
      steps: [
        { t: "Välkommen", b: "Hur är vädret i Göteborg, och vad kostar elen? Sidan visar det live, och polishändelser också. En snabb rundtur, under en minut." },
        { t: "Live-rutorna", b: "Sex rutor visar läget just nu: temperatur, vind, regn, elpriset, Sveriges elproduktion och polishändelser. De uppdateras av sig själva medan sidan är öppen." },
        { t: "Prognos 48 timmar", b: "Den orange linjen är temperaturen och de blå staplarna är regn. Den turkosa linjen är vinden, med pilar som visar vart den blåser. Meningen överst sammanfattar." },
        { t: "Elproduktion", b: "Varifrån Sveriges el kommer, timme för timme. Den streckade linjen är hur mycket landet använder. Håll över ett diagram för exakta siffror." },
        { t: "Elpris", b: "Spotpriset i SE3 i öre per kWh, före nätavgifter och skatter. Grönt är dygnets billigaste timme, rött den dyraste." },
        { t: "Polishändelser", b: "Senaste rapporterna från Polisen, och en räkning per typ. De är ett urval som polisen publicerar, inte brottsstatistik." },
        { t: "Allt klart", b: "Tryck på ett ? vid en rubrik för hjälp. EN och SV överst byter språk, och Visa som tabell under ett diagram ger siffrorna som text." }
      ]
    },
    sections: [
      { id: "what", h: "Det här visar sidan", html: `
<p>En live-bild av Göteborg: vädret nu och de närmaste 48 timmarna, hur Sverige producerar sin el, elpriset i Göteborgs elområde (SE3) och de senaste polishändelserna.</p>
<p>Allt kommer från öppna svenska datakällor och hämtas av din webbläsare när du öppnar sidan. Du behöver inte göra något: sidan uppdaterar sig själv medan den är öppen.</p>` },
      { id: "use", h: "Så använder du den", html: `
<ol>
<li><b>Läs meningen under varje rubrik.</b> Den ger svaret med vanliga ord. Diagrammet under visar detaljerna.</li>
<li><b>Håll över eller tryck</b> på ett diagram för exakta siffror just då.</li>
<li><b>Visa som tabell</b> under ett diagram listar samma siffror som text.</li>
<li><b>I dag / I morgon</b> växlar prisdiagrammet. I morgon dyker upp när morgondagens priser är publicerade, oftast på eftermiddagen.</li>
<li><b>Göteborg / + Västra Götaland</b> vidgar polislistan och räkningen per typ till resten av länet.</li>
<li><b>24 tim / 7 dagar</b> väljer tidsfönster för räkningen per typ.</li>
<li><b>EN / SV</b> överst byter språk. ?-knapparna öppnar guiden på rätt ställe.</li>
</ol>` },
      { id: "charts", h: "Så läser du diagrammen", html: "", sub: [
        { id: "tiles", h: "Live-rutorna", html: `
<p>Temperatur, vind och regn mäts vid SMHI:s station Göteborg A. Prisrutan är det aktuella spotpriset i SE3 jämfört med dagens medelpris. Elrutan gäller hela Sverige, inte Göteborg. Polisrutan räknar dagens händelser i Göteborg.</p>
<p>Den lilla linjen under en ruta är utvecklingen: de senaste 24 timmarna för vädret, hittills i dag för pris och el. "Känns som" visas när det är kallt och blåsigt.</p>` },
        { id: "forecast", h: "Prognos, närmaste 48 timmarna", html: `
<p>Den övre delen är <b>temperatur</b>: den orange linjen, med grader Celsius till vänster. De blå staplarna är <b>regn</b> i millimeter, avläst på skalan till höger; varje stapel gäller en prognosperiod, normalt en timme.</p>
<p>Den nedre delen är <b>vind</b> i meter per sekund. Linjen är medelvinden, det skuggade bandet når upp till vindbyarna och pilarna visar vart vinden blåser.</p>
<p>Den lodräta linjen markerar nu och de streckade linjerna markerar midnatt. Under diagrammet visar varje dag högsta och lägsta temperatur, väntat regn och vädret runt lunchtid.</p>` },
        { id: "power", h: "Elproduktion", html: `
<p><b>Produktion nu</b> visar Sveriges produktion och förbrukning i megawatt (MW) vid det senaste 15-minutersvärdet, och en ring med varje kraftslags andel.</p>
<p><b>Produktion i dag</b> staplar kraftslagen från midnatt till midnatt. Den streckade linjen är hur mycket Sverige använder. När högen ligger över linjen producerar landet mer än det använder och resten går utomlands; ligger den under importerar landet. En rad under diagrammet jämför förbrukningen i SE3 med det planerade.</p>` },
        { id: "price", h: "Elpris, SE3", html: `
<p>En stapel per 15 minuter, i öre per kWh. Timmar som har gått är blekta och en lodrät linje markerar nu. De gröna staplarna är dygnets billigaste timme och de röda den dyraste.</p>
<p>Rutorna under diagrammet visar priset nu, billigaste och dyraste timmen samt dygnets medelpris. Timmarna är medel av kvartspriserna.</p>` },
        { id: "police", h: "Polishändelser", html: `
<p>Listan visar de senaste rapporterna från Polisen: när, typ, en kort text på svenska och en länk till hela rapporten. Stapeldiagrammet räknar händelser per typ de senaste 24 timmarna eller 7 dagarna. Dagssammanfattningar ("Sammanfattning") räknas inte med.</p>
<p>Ingen karta ritas: Polisen anger en enda ungefärlig position för hela länet för varje händelse.</p>` }
      ] },
      { id: "terms", h: "Begrepp med vanliga ord", html: `
<dl>
<dt>SE3, elområde</dt><dd>Sverige är uppdelat i fyra elområden, SE1 i norr till SE4 i söder. Göteborg ligger i SE3, tillsammans med Stockholm och stora delar av Mellansverige. Varje område kan ha olika pris.</dd>
<dt>Spotpris</dt><dd>Elens marknadspris, som sätts dagen före på elbörsen Nord Pool. Det är inte vad du betalar: på fakturan tillkommer nätavgifter, energiskatt, moms och elbolagets påslag, och det beror på ditt avtal.</dd>
<dt>öre/kWh</dt><dd>100 öre är 1 krona. En kWh (kilowattimme) är vad en apparat på 1 000 watt använder på en timme. 50 öre/kWh är alltså 0,50 kr per kWh.</dd>
<dt>MW och GW</dt><dd>Megawatt och gigawatt mäter effekt just nu. 1 GW är 1 000 MW.</dd>
<dt>Nettoimport / nettoexport</dt><dd>Produktion minus förbrukning. Export betyder att Sverige producerar mer än det använder och skickar överskottet till grannländerna. Import betyder att grannländerna täcker skillnaden.</dd>
<dt>Kraftslag</dt><dd><i>Vattenkraft</i>: vatten som rinner genom dammar. <i>Kärnkraft</i>: kärnreaktorer. <i>Vindkraft</i>: vindkraftverk. <i>Värmekraft</i>: kraftverk som eldar bränsle, många värmer också städer. <i>Sol och övrigt</i>: solkraft plus småskalig produktion som Svenska kraftnät inte delar upp.</dd>
<dt>m/s och vindord</dt><dd>Meter per sekund. Under 0,5 m/s är stiltje; upp till 3,3 svag vind; 3,4 till 7,9 måttlig vind; 8 till 13,9 frisk vind; 14 till 20,9 hård vind; 21 eller mer storm. Orden följer Beaufortskalan.</dd>
<dt>Vindby</dt><dd>En kort vindtopp över medelvinden.</dd>
<dt>Känns som</dt><dd>Hur kall vinden får luften att kännas mot huden. Visas bara vid 10 °C eller kallare med minst ungefär 1,3 m/s vind.</dd>
<dt>mm regn</dt><dd>1 mm är en liter vatten på varje kvadratmeter. Siffran inom parentes i prognosens verktygstips är risken för regn.</dd>
<dt>Polishändelse</dt><dd>En rapport som Polisen publicerar på sin webbplats om något som hänt, till exempel en trafikolycka, en stöld eller en brand. Det är <b>inte</b> brottsstatistik: det är ett urval som polisen väljer att skriva om, en händelse är inte ett brott, och fler händelser kan helt enkelt betyda fler publicerade rapporter.</dd>
<dt>Sammanfattning</dt><dd>En sammanfattande rapport över en dag eller en period. Den räknas inte med i räkningen per typ.</dd>
</dl>` },
      { id: "limits", h: "Bra att veta", html: `
<ul>
<li><b>Uppdateringstid.</b> När sidan är öppen och synlig uppdateras väderobservationer och eldata var 5:e minut, polishändelser varannan minut, priset var 15:e minut och prognosen varje timme. En dold flik pausar och hämtar ikapp när du kommer tillbaka.</li>
<li><b>Prognosen är en modell, inte en mätning.</b> Den gäller en punkt i centrala Göteborg och är osäkrare längre fram.</li>
<li><b>"+ Västra Götaland"</b> lägger bara till rapporter från resten av länet i listan och räkningen per typ. Rutorna räknar alltid bara Göteborg.</li>
<li><b>Luckor i data.</b> Svarar en källa inte visar dess ruta ett streck eller ett meddelande, och sidan försöker igen efter en minut medan allt annat fortsätter fungera. Morgondagens pris saknas tills det är publicerat, och eldiagrammet kan vara tomt en kort stund strax efter midnatt.</li>
<li>Alla klockslag är svensk tid.</li>
</ul>` },
      { id: "sources", h: "Varifrån uppgifterna kommer", html: `
<ul>
<li><b>Väder:</b> <a href="https://opendata.smhi.se/" rel="noopener">SMHI Öppna data</a>. Observationer från stationen Göteborg A och punktprognosen SNOW1g, CC BY 4.0.</li>
<li><b>El:</b> <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnäts</a> kontrollrum: produktion och förbrukning i 15-minutersvärden.</li>
<li><b>Pris:</b> <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a>, en community-tjänst byggd på Nord Pools dagen före-priser. Det är ingen officiell källa, och priserna är utan moms, nätavgifter och skatter.</li>
<li><b>Polis:</b> <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisens</a> API för händelser.</li>
</ul>
<p>Din webbläsare frågar tjänsterna direkt. Inget sparas på någon server.</p>` },
      { id: "faq", h: "Frågor", html: `
<dl>
<dt>Varför är min elräkning högre än diagrammet?</dt><dd>Diagrammet visar bara spotpriset. På räkningen tillkommer nätavgifter, skatter, moms och elbolagets påslag.</dd>
<dt>Är det här en brottskarta?</dt><dd>Nej. Polishändelser är ett urval av rapporter, och de placeras inte på någon karta. Se "Polishändelse" under Begrepp.</dd>
<dt>Varför visar en ruta ett streck?</dt><dd>Den källan svarade inte. Sidan försöker igen ungefär varje minut.</dd>
<dt>Hur ser lönen ut efter skatt i Göteborg?</dt><dd>Se <a href="../netto/?k=1480">nettolön i Göteborg</a>. Vill du jämföra Göteborg med andra kommuner öppnar du <a href="../kommuner/?k=1480">Göteborg i Kommuner</a>.</dd>
<dt>Spårar sidan mig?</dt><dd>Nej. Den kommer bara ihåg ditt språk, ditt tema och att du har sett rundturen, i din egen webbläsare.</dd>
</dl>` }
    ]
  }
};
