/* Netto: interface text in English and Swedish. Placeholders in {braces} are filled by netto.js. */
window.NET_TEXT = {
  en: {
    h1: "Netto <span>take-home pay</span>",
    lead: "Type your monthly pay before tax and pick a kommun. See what you take home and how that changes from kommun to kommun, using Skatteverket's own tax tables for {y}.",
    inputs: "Your pay",
    salLbl: "Monthly pay before tax", kr: "kr",
    kLbl: "Kommun", kPh: "Search all 290 kommuner…", noMatch: "No kommun matches",
    ageLbl: "Age on 1 January {y}", under66: "Under 66", over66: "66 or older",
    churchLbl: "Member of Svenska kyrkan", churchHint: "Adds the church fee, about {f} % of taxable pay in {k}.",
    copy: "Copy link to this view", copied: "Link copied",
    tourBtn: "Take the tour", guideBtn: "Guide", guideLink: "User guide",
    tblCap: "Take-home pay a month on {sal} kr before tax{prof}.", tcK: "Kommun", tcRate: "Total tax rate", tcTax: "Tax and fees, kr", tcNet: "Take-home, kr",
    status: "Skatteverket open data · tax year {y} · live", statusErr: "Could not reach Skatteverket: {e}", retry: "Try again",
    loading: "Loading Skatteverket's tables…",
    noSal: "Type a monthly pay to see what you keep.",
    ansLead: "You take home about", ansUnit: "kr a month", ansYear: "That is about {n} kr a year.",
    sent: "Tax and fees take {tax} kr, {share} % of your pay, in {k}.",
    sentZero: "Nothing is withheld on this pay in {k}.",
    sentState: "Of that, {s} kr is state tax, paid on pay above about {x} kr a month.",
    big80: "Above 80 000 kr a month Skatteverket's table works in whole percent, so this can be a few hundred kronor off.",
    meta: "Skatteverket table {t}, column {c} · total rate {r} % in {k} · tax year {y}",
    bkT: "Where your pay goes",
    kKeep: "You keep", kKeepSub: "paid into your account",
    kMuni: "Municipal and regional tax", kMuniSub: "pays for schools, care and healthcare, after the work tax credit",
    kState: "State tax", kStateOn: "20 % on pay above about {x} kr a month", kStateOff: "none, it starts above about {x} kr a month",
    kFees: "Fees", kFeesSub: "TV and radio fee, burial fee", kFeesChurch: "TV and radio fee, burial fee, church fee",
    mapT: "The same pay in every kommun",
    mapSub: "Take-home pay a month on {sal} kr before tax{prof}. Click a kommun to use it above.",
    profChurch: "church member", profOld: "66 or older",
    mapLabel: "Map of Swedish kommuner coloured by take-home pay",
    legNote: "Each shade is one Skatteverket tax table. Kommuner in the same table keep the same amount.",
    zin: "Zoom in", zout: "Zoom out", zreset: "Reset zoom",
    tipTable: "Table {t} · total rate {r} %", tipDiff: "{d} kr a month vs {k}", tipSame: "Your kommun", tipNone: "No data",
    spread: "You'd keep {d} kr more a month in {a} than in {b}, {y} kr more a year.",
    spreadNone: "Every kommun gives the same amount at this pay.",
    rank: "{k} is number {r} of {n}, counting from the most you keep.",
    bestT: "Where you keep the most", worstT: "Where you keep the least",
    rowDiff: "{m} kr a month, {y} kr a year vs {k}", rowYou: "your kommun",
    methT: "How this is calculated",
    m1: "<b>Tax.</b> The page reads Skatteverket's monthly withholding table for {y}: the table an employer uses to deduct tax from your pay. The table number comes from your kommun's rate. The column is 1 if you are under 66 and 3 if you are 66 or older. The amount already includes state and municipal tax, the basic allowance (grundavdrag), the work tax credit (jobbskatteavdrag) and the TV and radio fee.",
    m2: "<b>Which table.</b> Municipal tax plus regional tax plus the burial fee, and the church fee if you tick Svenska kyrkan, gives a total rate. Skatteverket rounds it to a whole percent and that is the table number, 29 to 42. Where a kommun has several parishes the church fee is their average, so a member's real table can be one step away.",
    m3: "<b>The split in the bar.</b> The table only gives the total. State tax is worked out with Skatteverket's rule, 20 % of taxable income above 643 000 kr a year. Fees use your kommun's published rates. Municipal and regional tax is what is left of the total. At very low pay that remainder also holds the 7 % pension contribution, which a tax reduction cancels out at higher pay.",
    m4: "<b>Pay above 80 000 kr a month.</b> Skatteverket's table switches to whole percent there, so the result can be a few hundred kronor off.",
    m5: "<b>What this is not.</b> It is the monthly withholding, an estimate of take-home pay and not your final tax. Not included: other deductions (travel, interest, ROT and RUT), taxable benefits such as a company car, union and unemployment fund fees, pension saved from your pay, and pay that changes month to month. Your final tax is settled in next year's tax return and can differ. The table follows where you were registered on 1 November the year before, not where you work now.",
    m6: "<b>Checked.</b> The table values were compared with Skatteverket's published PDF tables for 2026 and with a separate calculation that follows Skatteverket's technical description (SKV 433) for tables 29 to 42, columns 1 and 3. They have not been compared with Skatteverket's online calculator.",
    srcT: "Sources",
    s1: "Skatteverket, monthly tax tables (open data API)", s2: "Skatteverket, tax rates per kommun (open data API)", s3: "Skatteverket, technical description of the tax tables (SKV 433)",
    footData: "Data: Skatteverket open data (CC0)"
  },
  sv: {
    h1: "Netto <span>lön efter skatt</span>",
    lead: "Skriv din månadslön före skatt och välj kommun. Se vad du får behålla och hur det skiljer sig mellan kommuner, med Skatteverkets egna skattetabeller för {y}.",
    inputs: "Din lön",
    salLbl: "Månadslön före skatt", kr: "kr",
    kLbl: "Kommun", kPh: "Sök bland alla 290 kommuner…", noMatch: "Ingen kommun matchar",
    ageLbl: "Ålder den 1 januari {y}", under66: "Under 66", over66: "66 eller äldre",
    churchLbl: "Medlem i Svenska kyrkan", churchHint: "Lägger till kyrkoavgiften, ungefär {f} % av beskattningsbar inkomst i {k}.",
    copy: "Kopiera länk till vyn", copied: "Länken är kopierad",
    tourBtn: "Ta rundturen", guideBtn: "Guide", guideLink: "Användarguide",
    tblCap: "Lön efter skatt per månad på {sal} kr före skatt{prof}.", tcK: "Kommun", tcRate: "Sammanlagd skattesats", tcTax: "Skatt och avgifter, kr", tcNet: "Efter skatt, kr",
    status: "Skatteverkets öppna data · inkomståret {y} · live", statusErr: "Kunde inte nå Skatteverket: {e}", retry: "Försök igen",
    loading: "Hämtar Skatteverkets tabeller…",
    noSal: "Skriv en månadslön för att se vad du får behålla.",
    ansLead: "Du får behålla ungefär", ansUnit: "kr i månaden", ansYear: "Det är ungefär {n} kr om året.",
    sent: "Skatt och avgifter tar {tax} kr, {share} % av din lön, i {k}.",
    sentZero: "Ingenting dras av på den här lönen i {k}.",
    sentState: "Av det är {s} kr statlig skatt, som betalas på lön över ungefär {x} kr i månaden.",
    big80: "Över 80 000 kr i månaden anger Skatteverkets tabell hela procent, så beloppet kan avvika med några hundra kronor.",
    meta: "Skatteverkets tabell {t}, kolumn {c} · sammanlagd skattesats {r} % i {k} · inkomståret {y}",
    bkT: "Vart din lön tar vägen",
    kKeep: "Du behåller", kKeepSub: "betalas in på ditt konto",
    kMuni: "Kommunal skatt och regionskatt", kMuniSub: "betalar skolor, omsorg och sjukvård, efter jobbskatteavdraget",
    kState: "Statlig skatt", kStateOn: "20 % på lön över ungefär {x} kr i månaden", kStateOff: "ingen, den börjar över ungefär {x} kr i månaden",
    kFees: "Avgifter", kFeesSub: "public service-avgift, begravningsavgift", kFeesChurch: "public service-avgift, begravningsavgift, kyrkoavgift",
    mapT: "Samma lön i alla kommuner",
    mapSub: "Lön efter skatt per månad på {sal} kr före skatt{prof}. Klicka på en kommun för att välja den ovan.",
    profChurch: "medlem i kyrkan", profOld: "66 eller äldre",
    mapLabel: "Karta över Sveriges kommuner färgade efter lön efter skatt",
    legNote: "Varje nyans är en skattetabell hos Skatteverket. Kommuner i samma tabell ger samma belopp.",
    zin: "Zooma in", zout: "Zooma ut", zreset: "Återställ zoom",
    tipTable: "Tabell {t} · sammanlagd skattesats {r} %", tipDiff: "{d} kr i månaden jämfört med {k}", tipSame: "Din kommun", tipNone: "Saknar data",
    spread: "Du skulle behålla {d} kr mer i månaden i {a} än i {b}, {y} kr mer om året.",
    spreadNone: "Alla kommuner ger samma belopp på den här lönen.",
    rank: "{k} ligger på plats {r} av {n}, räknat från där du behåller mest.",
    bestT: "Där du behåller mest", worstT: "Där du behåller minst",
    rowDiff: "{m} kr i månaden, {y} kr om året jämfört med {k}", rowYou: "din kommun",
    methT: "Så räknar vi",
    m1: "<b>Skatten.</b> Sidan läser Skatteverkets skattetabell för månadslön {y}: tabellen som en arbetsgivare använder för att dra skatt på lönen. Tabellnumret kommer från din kommuns skattesats. Kolumn 1 gäller om du är under 66 år och kolumn 3 om du är 66 år eller äldre. Beloppet innehåller redan statlig och kommunal skatt, grundavdraget, jobbskatteavdraget och public service-avgiften.",
    m2: "<b>Vilken tabell.</b> Kommunalskatt plus regionskatt plus begravningsavgift, och kyrkoavgift om du kryssar i Svenska kyrkan, ger en sammanlagd skattesats. Skatteverket avrundar den till hela procent och det är tabellnumret, 29 till 42. Har en kommun flera församlingar används medelvärdet av kyrkoavgiften, så en medlems verkliga tabell kan ligga ett steg bort.",
    m3: "<b>Fördelningen i stapeln.</b> Tabellen anger bara totalen. Statlig skatt räknas ut med Skatteverkets regel, 20 % av beskattningsbar inkomst över 643 000 kr per år. Avgifterna följer din kommuns publicerade satser. Kommunal skatt och regionskatt är det som blir kvar av totalen. På mycket låg lön ingår också den allmänna pensionsavgiften på 7 % i resten, som en skattereduktion tar bort på högre lön.",
    m4: "<b>Lön över 80 000 kr i månaden.</b> Skatteverkets tabell går där över till hela procent, så resultatet kan avvika med några hundra kronor.",
    m5: "<b>Vad detta inte är.</b> Det är den månatliga skatteavdragen, en uppskattning av lönen efter skatt och inte din slutliga skatt. Ingår inte: andra avdrag (resor, ränta, ROT och RUT), skattepliktiga förmåner som tjänstebil, fack- och a-kasseavgifter, pension du sparar av lönen och lön som varierar mellan månader. Slutlig skatt avgörs i nästa års deklaration och kan skilja sig. Tabellen följer var du var folkbokförd den 1 november året före, inte var du arbetar nu.",
    m6: "<b>Kontrollerat.</b> Tabellvärdena har jämförts med Skatteverkets publicerade pdf-tabeller för 2026 och med en separat uträkning enligt Skatteverkets tekniska beskrivning (SKV 433) för tabell 29 till 42, kolumn 1 och 3. De har inte jämförts med Skatteverkets webbräknare.",
    srcT: "Källor",
    s1: "Skatteverket, skattetabeller för månadslön (öppet API)", s2: "Skatteverket, skattesatser per kommun (öppet API)", s3: "Skatteverket, teknisk beskrivning av skattetabellerna (SKV 433)",
    footData: "Data: Skatteverkets öppna data (CC0)"
  }
};

/* Walkthrough and guide text (guide.js). Section html is trusted markup. */
window.NET_GUIDE = {
  en: {
    title: "Guide", close: "Close the guide", nav: "Sections", again: "Take the tour again", info: "How to read this",
    tour: {
      label: "Page tour", of: "{n} of {total}", next: "Next", back: "Back", skip: "Skip", done: "Done", guide: "Open the guide",
      steps: [
        { t: "Welcome", b: "If you earn a certain amount before tax, how much do you take home, and how does that change from kommun to kommun? The figures are Skatteverket's own tax tables. A tour of under a minute." },
        { t: "Your pay and your kommun", b: "Type your monthly pay before tax and pick a kommun. Choose your age group, and tick the box if you belong to Svenska kyrkan. Everything below updates as you type." },
        { t: "The answer", b: "The big number is what you take home each month. The sentence says how much goes in tax, and the bar shows where it goes: municipal and regional tax, state tax and fees." },
        { t: "The map", b: "The same pay in all 290 kommuner. Darker means you keep more. Hover for the numbers, click a kommun to use it above, or open Show as table for the full list." },
        { t: "Most and least", b: "The five kommuner where you would keep the most and the least, with the difference to your own kommun per month and per year." },
        { t: "Good to know", b: "This is an estimate of the monthly tax deduction, not your final tax. This part explains how it is calculated and what is left out. The Guide covers every term." }
      ]
    },
    sections: [
      { id: "what", h: "What this page shows", html: `
<p>What you take home from a monthly pay before tax, in any of Sweden's 290 kommuner. The tax comes from Skatteverket's own withholding tables for {y}, the same tables an employer uses to deduct tax from your pay.</p>
<p>The answer comes first: one number and one sentence. Below it is a map of the same pay in every kommun, so you can see what the choice of place is worth.</p>` },
      { id: "use", h: "How to use it", html: `
<ol>
<li><b>Type your monthly pay before tax</b> in kronor, the figure on your employment contract.</li>
<li><b>Pick your kommun.</b> Start typing a name, or press the arrow keys and Enter. Åre, Älvdalen and the like are found without the dots.</li>
<li><b>Choose your age group.</b> The tables treat people who have turned 66 by 1 January differently.</li>
<li><b>Tick Svenska kyrkan</b> if you are a member. The church fee is added.</li>
<li><b>Read the answer</b> and the bar. Hover the map for numbers, or click a kommun to move there.</li>
<li><b>Show as table</b> under the map lists every kommun. <b>Copy link to this view</b> saves your pay and kommun in a web address you can share.</li>
</ol>` },
      { id: "reading", h: "Reading the answer and the map", html: "", sub: [
        { id: "breakdown", h: "The breakdown bar", html: `
<p>The bar splits your pay into four parts. <b>You keep</b> is what is paid into your account. <b>Municipal and regional tax</b> pays for schools, care and healthcare. <b>State tax</b> is only paid on high pay. <b>Fees</b> are the TV and radio fee, the burial fee and, if you ticked it, the church fee.</p>
<p>The tables only give the total. State tax and fees are worked out separately, and the municipal and regional tax is what is left of the total. At very low pay that remainder also holds the 7 % pension contribution, which a tax reduction cancels out at higher pay.</p>` },
        { id: "map", h: "The map", html: `
<p>Each kommun is coloured by what you would keep each month on the pay you typed. A darker shade in light mode, a lighter one in dark mode, means more kept. The legend lists the amounts.</p>
<p>The colours come in steps because Skatteverket works in whole percent: every kommun is put in one of the tables 29 to 42, and kommuner in the same table keep exactly the same amount even if their rates differ a little. Your own kommun has a ring and a label. Zoom with the buttons or Ctrl and the scroll wheel.</p>` },
        { id: "lists", h: "Most and least", html: `
<p>The top list is the five kommuner where you would keep the most, the bottom list the five where you would keep the least. Each row shows the difference to your own kommun, per month and per year. Under the name is the kommun's total tax rate, which settles the order when several are in the same table. Click a row to move there.</p>` }
      ] },
      { id: "terms", h: "Terms in plain words", html: `
<dl>
<dt>Preliminary tax (skatteavdrag)</dt><dd>The tax your employer deducts from each monthly pay. It is paid in advance. The real amount is settled in your tax return the next spring, when you get money back or pay the rest.</dd>
<dt>Tax table (skattetabell) and table number</dt><dd>Skatteverket publishes a table for each whole percent from 29 to 42. Your table number is your total tax rate rounded to a whole percent. It is printed on your A-skattsedel, the tax decision your employer uses.</dd>
<dt>Column 1 and column 3</dt><dd>Each table has columns for different kinds of income. Column 1 is pay for someone who has not turned 66 by 1 January. Column 3 is pay for someone who has. Pensions and sick pay use other columns, which this page does not cover.</dd>
<dt>Municipal and regional tax</dt><dd>The tax set by your kommun and your region (the regions were called landsting before), added together. In {y} the combined rate runs from about 29 % to 36 %.</dd>
<dt>Total tax rate</dt><dd>Municipal tax plus regional tax plus the burial fee, and the church fee if you are a member. This is the figure that gives the table number.</dd>
<dt>State tax (statlig skatt)</dt><dd>An extra 20 % on taxable income above 643 000 kr a year in {y}. For someone under 66 that begins at a monthly pay of about 55 100 kr. Most people pay none.</dd>
<dt>Taxable income</dt><dd>Your yearly pay minus the basic allowance. Municipal and regional tax are worked out on it.</dd>
<dt>Basic allowance (grundavdrag)</dt><dd>An amount you pay no tax on. In {y} it is between about 17 000 and 45 600 kr a year depending on your income, and it is larger for people of 66 and over.</dd>
<dt>Work tax credit (jobbskatteavdrag)</dt><dd>A tax cut for people who work. It lowers the municipal and regional tax, so working pays more than other income. It is already inside the tables.</dd>
<dt>Burial fee</dt><dd>A small fee, between about 0,07 % and 0,29 % of taxable income, that pays for burial grounds. It is part of the total tax rate in Skatteverket's rate list.</dd>
<dt>Church fee</dt><dd>What members of Svenska kyrkan pay, set by the parish: between about 0,7 % and 1,9 % of taxable income. It is added when you tick the box.</dd>
<dt>TV and radio fee (public service)</dt><dd>1 % of taxable income, with a ceiling of 1 184 kr a year in {y}. It replaced the TV licence and is deducted together with the tax.</dd>
<dt>Pension contribution (allmän pensionsavgift)</dt><dd>7 % of your pay goes to the public pension. A tax reduction of the same size cancels it out, so it does not change what you keep.</dd>
</dl>` },
      { id: "limits", h: "Good to know", html: `
<ul>
<li>This is an <b>estimate</b> of the monthly deduction, not your final tax. The final tax is settled in the tax return and can differ.</li>
<li>The table follows <b>where you were registered on 1 November</b> the year before, not where you work or live now.</li>
<li>Not included: other deductions (travel, interest, ROT and RUT), taxable benefits such as a company car, union and unemployment fund fees, pension saved from your pay, and pay that changes month to month.</li>
<li>Above 80 000 kr a month Skatteverket's table works in whole percent, so the result can be a few hundred kronor off.</li>
<li>If you are a church member, the page uses the average church fee of the kommun's parishes. Your own parish can put you one table up or down.</li>
<li>A total rate of exactly half a percent is rounded down. That is our reading of Skatteverket's rule and it has not been confirmed.</li>
<li>The table values were compared with Skatteverket's published PDF tables for {y} and with a separate calculation that follows Skatteverket's technical description (SKV 433). They were not compared with Skatteverket's online calculator.</li>
<li>Pay is taken as gross monthly salary. Employer contributions are not part of it.</li>
</ul>` },
      { id: "sources", h: "Where the data comes from", html: `
<p>Both data sets are Skatteverket's open data and are read live from its open API every time the page opens: the monthly tax tables for {y}, and the tax rates per kommun for {y}. The terms of use are open data, CC0.</p>
<p>The rules used for the split in the bar, such as the basic allowance and the state tax limit, come from Skatteverket's technical description of the tax tables (SKV 433). The kommun borders are simplified from Valmyndigheten's data.</p>` },
      { id: "faq", h: "Questions", html: `
<dl>
<dt>Why does my payslip show a different amount?</dt><dd>Common reasons: deductions this page does not know about (union fee, occupational pension, taxable benefits), a tax decision from Skatteverket that sets a different deduction, or a table number that follows where you were registered, not where you live now. Check the table number on your A-skattsedel against the one shown under the answer.</dd>
<dt>Which kommun counts if I moved this year?</dt><dd>The one where you were registered on 1 November last year. The tax rate follows you for the whole year. The map shows what the same pay would give if you were registered somewhere else.</dd>
<dt>Does a bonus or holiday pay work the same way?</dt><dd>Not quite. One-off payments are taxed with separate tables or a flat 30 %, depending on the case. This page is for the regular monthly pay.</dd>
<dt>Why do so many kommuner show the same amount?</dt><dd>Because Skatteverket rounds each total rate to a whole percent. Kommuner in the same table are deducted the same amount. The rate under each name in the lists shows the real difference.</dd>
<dt>Why do I need to give my age group?</dt><dd>People who have turned 66 by 1 January get a larger basic allowance and a larger work tax credit, so they use column 3 instead of column 1.</dd>
<dt>How much difference does church membership make?</dt><dd>It adds the church fee, about 0,7 % to 1,9 % of taxable income. At a pay of 45 000 kr that is often a few hundred kronor a month.</dd>
<dt>Is my pay stored anywhere?</dt><dd>No. The pay stays in your browser and in the web address you copy. Only the table rows for your pay level are fetched from Skatteverket.</dd>
</dl>` }
    ]
  },
  sv: {
    title: "Guide", close: "Stäng guiden", nav: "Avsnitt", again: "Ta rundturen igen", info: "Så läser du detta",
    tour: {
      label: "Rundtur", of: "{n} av {total}", next: "Nästa", back: "Tillbaka", skip: "Hoppa över", done: "Klar", guide: "Öppna guiden",
      steps: [
        { t: "Välkommen", b: "Om du tjänar ett visst belopp före skatt, hur mycket får du behålla, och hur skiljer det sig mellan kommuner? Siffrorna kommer från Skatteverkets egna skattetabeller. En rundtur på under en minut." },
        { t: "Din lön och din kommun", b: "Skriv din månadslön före skatt och välj kommun. Välj åldersgrupp och kryssa i rutan om du är med i Svenska kyrkan. Allt nedanför uppdateras medan du skriver." },
        { t: "Svaret", b: "Den stora siffran är vad du behåller varje månad. Meningen säger hur mycket som går till skatt, och stapeln visar vart det tar vägen: kommunal skatt och regionskatt, statlig skatt och avgifter." },
        { t: "Kartan", b: "Samma lön i alla 290 kommuner. Mörkare betyder att du behåller mer. Håll muspekaren över för siffror, klicka på en kommun för att välja den ovan, eller öppna Visa som tabell för hela listan." },
        { t: "Mest och minst", b: "De fem kommuner där du skulle behålla mest och minst, med skillnaden mot din egen kommun per månad och per år." },
        { t: "Bra att veta", b: "Det här är en uppskattning av det månatliga skatteavdraget, inte din slutliga skatt. Här förklaras hur det räknas och vad som lämnas utanför. Guiden går igenom alla begrepp." }
      ]
    },
    sections: [
      { id: "what", h: "Det här visar sidan", html: `
<p>Vad du får behålla av en månadslön före skatt, i någon av Sveriges 290 kommuner. Skatten kommer från Skatteverkets egna tabeller för skatteavdrag {y}, samma tabeller som en arbetsgivare använder när den drar skatt på din lön.</p>
<p>Svaret kommer först: en siffra och en mening. Under den finns en karta med samma lön i varje kommun, så att du ser vad valet av ort är värt.</p>` },
      { id: "use", h: "Så använder du den", html: `
<ol>
<li><b>Skriv din månadslön före skatt</b> i kronor, den siffra som står i ditt anställningsavtal.</li>
<li><b>Välj kommun.</b> Börja skriva ett namn, eller använd piltangenterna och Enter. Åre, Älvdalen och liknande hittas även utan prickarna.</li>
<li><b>Välj åldersgrupp.</b> Tabellerna behandlar den som fyllt 66 senast den 1 januari annorlunda.</li>
<li><b>Kryssa i Svenska kyrkan</b> om du är medlem. Kyrkoavgiften läggs då till.</li>
<li><b>Läs svaret</b> och stapeln. Håll muspekaren över kartan för siffror, eller klicka på en kommun för att flytta dit.</li>
<li><b>Visa som tabell</b> under kartan listar alla kommuner. <b>Kopiera länk till vyn</b> sparar lön och kommun i en webbadress du kan dela.</li>
</ol>` },
      { id: "reading", h: "Så läser du svaret och kartan", html: "", sub: [
        { id: "breakdown", h: "Stapeln", html: `
<p>Stapeln delar din lön i fyra delar. <b>Du behåller</b> är det som betalas in på ditt konto. <b>Kommunal skatt och regionskatt</b> betalar skolor, omsorg och sjukvård. <b>Statlig skatt</b> betalas bara på hög lön. <b>Avgifter</b> är public service-avgiften, begravningsavgiften och, om du kryssat i det, kyrkoavgiften.</p>
<p>Tabellerna anger bara totalen. Statlig skatt och avgifter räknas ut för sig, och kommunal skatt och regionskatt är det som blir kvar av totalen. På mycket låg lön ingår också den allmänna pensionsavgiften på 7 % i resten, som en skattereduktion tar bort på högre lön.</p>` },
        { id: "map", h: "Kartan", html: `
<p>Varje kommun är färgad efter vad du skulle behålla per månad på den lön du skrivit. En mörkare nyans i ljust läge, en ljusare i mörkt läge, betyder att du behåller mer. Teckenförklaringen visar beloppen.</p>
<p>Färgerna kommer i steg eftersom Skatteverket räknar i hela procent: varje kommun placeras i en av tabellerna 29 till 42, och kommuner i samma tabell behåller exakt lika mycket även om deras skattesatser skiljer sig lite. Din egen kommun har en ring och en etikett. Zooma med knapparna eller Ctrl och mushjulet.</p>` },
        { id: "lists", h: "Mest och minst", html: `
<p>Den övre listan är de fem kommuner där du skulle behålla mest, den nedre de fem där du skulle behålla minst. Varje rad visar skillnaden mot din egen kommun, per månad och per år. Under namnet står kommunens sammanlagda skattesats, som avgör ordningen när flera ligger i samma tabell. Klicka på en rad för att flytta dit.</p>` }
      ] },
      { id: "terms", h: "Begrepp på vanlig svenska", html: `
<dl>
<dt>Preliminär skatt (skatteavdrag)</dt><dd>Den skatt din arbetsgivare drar från varje månadslön. Den betalas i förskott. Det riktiga beloppet avgörs i din deklaration nästa vår, då du får tillbaka pengar eller betalar resten.</dd>
<dt>Skattetabell och tabellnummer</dt><dd>Skatteverket publicerar en tabell för varje hel procent från 29 till 42. Ditt tabellnummer är din sammanlagda skattesats avrundad till hel procent. Det står på din A-skattsedel, beslutet som arbetsgivaren använder.</dd>
<dt>Kolumn 1 och kolumn 3</dt><dd>Varje tabell har kolumner för olika sorters inkomst. Kolumn 1 gäller lön för den som inte fyllt 66 senast den 1 januari. Kolumn 3 gäller lön för den som har gjort det. Pension och sjukpenning använder andra kolumner, som den här sidan inte täcker.</dd>
<dt>Kommunal skatt och regionskatt</dt><dd>Skatten som din kommun och din region (tidigare landsting) bestämmer, tillsammans. {y} ligger den sammanlagda skattesatsen mellan cirka 29 och 36 %.</dd>
<dt>Sammanlagd skattesats</dt><dd>Kommunalskatt plus regionskatt plus begravningsavgift, och kyrkoavgift om du är medlem. Det är den siffran som ger tabellnumret.</dd>
<dt>Statlig skatt</dt><dd>Ytterligare 20 % på beskattningsbar inkomst över 643 000 kr per år {y}. För den som är under 66 börjar det vid en månadslön på cirka 55 100 kr. De flesta betalar ingen.</dd>
<dt>Beskattningsbar inkomst</dt><dd>Din årslön minus grundavdraget. Kommunal skatt och regionskatt räknas på den.</dd>
<dt>Grundavdrag</dt><dd>Ett belopp du inte betalar skatt på. {y} ligger det mellan cirka 17 000 och 45 600 kr per år beroende på din inkomst, och det är större för den som fyllt 66.</dd>
<dt>Jobbskatteavdrag</dt><dd>En skattelättnad för den som arbetar. Den sänker kommunalskatten och regionskatten, så att arbete lönar sig mer än andra inkomster. Den ingår redan i tabellerna.</dd>
<dt>Begravningsavgift</dt><dd>En liten avgift, mellan cirka 0,07 och 0,29 % av beskattningsbar inkomst, som betalar gravplatser. Den ingår i den sammanlagda skattesatsen i Skatteverkets lista.</dd>
<dt>Kyrkoavgift</dt><dd>Det medlemmar i Svenska kyrkan betalar, bestämd av församlingen: mellan cirka 0,7 och 1,9 % av beskattningsbar inkomst. Den läggs till när du kryssar i rutan.</dd>
<dt>Public service-avgift (tv och radio)</dt><dd>1 % av beskattningsbar inkomst, med ett tak på 1 184 kr per år {y}. Den ersatte tv-licensen och dras tillsammans med skatten.</dd>
<dt>Allmän pensionsavgift</dt><dd>7 % av din lön går till den allmänna pensionen. En skattereduktion lika stor tar bort den, så den påverkar inte vad du behåller.</dd>
</dl>` },
      { id: "limits", h: "Bra att veta", html: `
<ul>
<li>Det här är en <b>uppskattning</b> av det månatliga avdraget, inte din slutliga skatt. Den slutliga skatten avgörs i deklarationen och kan skilja sig.</li>
<li>Tabellen följer <b>var du var folkbokförd den 1 november</b> året före, inte var du arbetar eller bor nu.</li>
<li>Ingår inte: andra avdrag (resor, ränta, ROT och RUT), skattepliktiga förmåner som tjänstebil, fack- och a-kasseavgifter, pension du sparar av lönen och lön som varierar mellan månader.</li>
<li>Över 80 000 kr i månaden anger Skatteverkets tabell hela procent, så resultatet kan avvika med några hundra kronor.</li>
<li>Är du medlem i kyrkan används medelvärdet av kyrkoavgiften i kommunens församlingar. Din egen församling kan ge dig en tabell högre eller lägre.</li>
<li>En sammanlagd skattesats på exakt en halv procent avrundas nedåt. Det är vår tolkning av Skatteverkets regel och den är inte bekräftad.</li>
<li>Tabellvärdena har jämförts med Skatteverkets publicerade pdf-tabeller för {y} och med en separat uträkning enligt Skatteverkets tekniska beskrivning (SKV 433). De har inte jämförts med Skatteverkets webbräknare.</li>
<li>Lönen tas som bruttolön per månad. Arbetsgivaravgifter ingår inte.</li>
</ul>` },
      { id: "sources", h: "Varifrån data kommer", html: `
<p>Båda dataseten är Skatteverkets öppna data och läses live från dess öppna API varje gång sidan öppnas: tabellerna för skatteavdrag för månadslön {y}, och skattesatserna per kommun {y}. Användningsvillkor: öppna data, CC0.</p>
<p>Reglerna som används för uppdelningen i stapeln, som grundavdrag och gränsen för statlig skatt, kommer från Skatteverkets tekniska beskrivning av skattetabellerna (SKV 433). Kommungränserna är förenklade från Valmyndighetens data.</p>` },
      { id: "faq", h: "Frågor", html: `
<dl>
<dt>Varför visar min lönespecifikation ett annat belopp?</dt><dd>Vanliga orsaker: avdrag som den här sidan inte känner till (fackavgift, tjänstepension, skattepliktiga förmåner), ett beslut från Skatteverket som ger ett annat avdrag, eller ett tabellnummer som följer var du var folkbokförd, inte var du bor nu. Jämför tabellnumret på din A-skattsedel med det som visas under svaret.</dd>
<dt>Vilken kommun gäller om jag flyttat i år?</dt><dd>Den där du var folkbokförd den 1 november förra året. Skattesatsen följer med dig hela året. Kartan visar vad samma lön skulle ge om du var folkbokförd någon annanstans.</dd>
<dt>Fungerar en bonus eller semesterersättning likadant?</dt><dd>Inte riktigt. Engångsbelopp beskattas med egna tabeller eller en fast skatt på 30 %, beroende på fall. Den här sidan gäller den vanliga månadslönen.</dd>
<dt>Varför visar så många kommuner samma belopp?</dt><dd>För att Skatteverket avrundar varje sammanlagd skattesats till hel procent. Kommuner i samma tabell får samma avdrag. Skattesatsen under varje namn i listorna visar den verkliga skillnaden.</dd>
<dt>Varför behöver jag ange åldersgrupp?</dt><dd>Den som fyllt 66 senast den 1 januari får större grundavdrag och större jobbskatteavdrag, och använder därför kolumn 3 i stället för kolumn 1.</dd>
<dt>Hur stor skillnad gör kyrkomedlemskap?</dt><dd>Det lägger till kyrkoavgiften, cirka 0,7 till 1,9 % av beskattningsbar inkomst. På en lön på 45 000 kr blir det ofta några hundra kronor i månaden.</dd>
<dt>Sparas min lön någonstans?</dt><dd>Nej. Lönen stannar i din webbläsare och i webbadressen du kopierar. Bara tabellraderna för din lönenivå hämtas från Skatteverket.</dd>
</dl>` }
    ]
  }
};
