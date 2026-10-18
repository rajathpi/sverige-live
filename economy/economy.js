/* Economy pulse: reads data/economy.json (written by scripts/update_economy.py on a schedule). */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let D = null;

  /* ---------------- dates ---------------- */
  function toDate(p) {
    if (/^\d{4}-\d{2}$/.test(p)) return new Date(Date.UTC(+p.slice(0, 4), +p.slice(5) - 1, 15));
    const q = /^(\d{4})-Q(\d)$/.exec(p);
    if (q) return new Date(Date.UTC(+q[1], (+q[2] - 1) * 3 + 1, 15));
    return new Date(p + "T12:00:00Z");
  }
  const monthName = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  function periodLabel(p) {
    if (/^\d{4}-\d{2}$/.test(p)) return monthName.format(toDate(p));
    if (/Q/.test(p)) return p.replace("-", " ");
    return SL.fmtDate(p);
  }
  const series = (s) => (s.points || s.monthly || []).map(([p, v]) => [toDate(p), v, p]);
  const daysUntil = (iso) => Math.round((new Date(iso + "T09:00:00") - new Date()) / 864e5);

  /* ---------------- load ---------------- */
  async function load() {
    const status = $("status");
    try {
      const bust = Math.floor(Date.now() / 600000); // GitHub Pages caches ~10 min
      D = await SL.fetchJSON(`../data/economy.json?v=${bust}`);
      const age = (Date.now() - new Date(D.generated)) / 36e5;
      const errs = D.errors && D.errors.length ? ` · ${D.errors.length} source(s) failed last run` : "";
      SL.setStatus(status, age > 30 ? "stale" : "ok", `Official figures · checked ${SL.timeAgo(D.generated)}${errs}`);
      render();
    } catch (e) {
      SL.setStatus(status, "err", "Could not load the data file: " + SL.esc(e.message));
    }
  }

  function render() {
    if (!D || !window.d3) return;
    renderCalendar();
    renderKpis();
    renderInflation();
    renderUnemployment();
    renderHouses();
    renderMood();
    renderFx();
  }

  /* ---------------- calendar ---------------- */
  function renderCalendar() {
    const S = D.series, items = [];
    const add = (key, what) => { const s = S[key]; if (s && s.next) items.push({ date: s.next, what, expected: s.nextExpected }); };
    (S.policy && S.policy.decisions || []).slice(0, 2).forEach((d) => items.push({ date: d, what: "Riksbank policy-rate decision", expected: false }));
    add("cpif", "Inflation (CPI, CPIF) for last month");
    add("unemployment", "Unemployment (Labour Force Survey)");
    add("barometer", "Economic Tendency Survey");
    add("houses", "House price index, last quarter");
    items.sort((a, b) => a.date.localeCompare(b.date));
    $("calendar").innerHTML = items.length ? items.map((it) => {
      const n = daysUntil(it.date);
      const when = n <= 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;
      return `<li class="${n <= 7 ? "soon" : ""}"><span class="when">${it.expected ? "≈ " : ""}${SL.fmtDate(it.date)}</span><span class="what">${SL.esc(it.what)}</span><span class="in">${when} · ${it.expected ? "expected" : "confirmed"}</span></li>`;
    }).join("") : '<li class="empty">No upcoming dates found.</li>';
  }

  /* ---------------- KPI tiles ---------------- */
  function tile({ key, title, value, unit, d, decimals = 1, delta, deltaLabel, goodWhen, ctx, pts, period, s }) {
    const cls = delta == null || Math.abs(delta) < 1e-9 ? "flat" : (delta > 0) === (goodWhen === "up") ? (delta > 0 ? "up-good" : "down-good") : (delta > 0 ? "up-bad" : "down-bad");
    const next = s.next ? `next ${s.nextExpected ? "≈ " : ""}${SL.fmtDate(s.next)}` : "";
    return `<article class="card kpi span-3 ${s.stale ? "stale" : ""}" data-k="${key}">
      <div class="label"><span><b>${title}</b></span><span>${SL.esc(periodLabel(period))}</span></div>
      <div class="value">${SL.fmt(value, decimals)}<small>${unit}</small></div>
      <div class="delta ${goodWhen ? cls : "flat"}">${delta == null ? "&nbsp;" : SL.signed(delta, d ?? decimals, unit === "%" || unit === " %" ? " pts" : "") + " " + deltaLabel}</div>
      <div class="ctx">${ctx || ""}</div>
      <div class="spark" data-spark="${key}"></div>
      <div class="meta"><span>${s.updated ? "updated " + SL.fmtDate(s.updated) : ""}</span><span>${next}</span></div>
    </article>`;
  }
  function renderKpis() {
    const S = D.series, html = [], sparks = {};
    const last = (a, i = 1) => a[a.length - i];
    const push = (o) => { html.push(tile(o)); sparks[o.key] = o.pts; };
    if (S.cpif) { const p = series(S.cpif), l = last(p), y = p[p.length - 13];
      push({ key: "cpif", title: "Inflation (CPIF)", value: l[1], unit: " %", delta: l[1] - last(p, 2)[1], deltaLabel: "vs previous month", goodWhen: Math.abs(l[1] - 2) > Math.abs(last(p, 2)[1] - 2) ? "down" : "up",
        ctx: `Riksbank target 2 % · a year ago ${SL.fmt(y && y[1], 1)} %`, pts: p.slice(-36), period: l[2], s: S.cpif }); }
    if (S.policy) { const p = series(S.policy), l = S.policy.latest, prevChange = S.policy.changes.slice(-2)[0];
      const cp = S.cpif ? series(S.cpif) : null, real = cp ? l[1] - last(cp)[1] : null;
      push({ key: "policy", title: "Policy rate", value: l[1], unit: " %", decimals: 2, d: 2, delta: S.policy.changes.length > 1 ? l[1] - prevChange[1] : null, deltaLabel: `at last change, ${SL.fmtDate(last(S.policy.changes)[0])}`, goodWhen: null,
        ctx: real == null ? "" : `real rate ${SL.signed(real, 2)} % (minus CPIF)`, pts: p.slice(-36), period: l[0], s: S.policy }); }
    if (S.unemployment) { const p = series(S.unemployment), l = last(p), y = p[p.length - 13];
      push({ key: "unemployment", title: "Unemployment", value: l[1], unit: " %", delta: l[1] - y[1], deltaLabel: "vs a year ago", goodWhen: "down", ctx: "ages 15–74, seasonally adjusted", pts: p.slice(-36), period: l[2], s: S.unemployment }); }
    if (S.houses) { const R = S.houses.regions.Sweden.yoy.map(([p, v]) => [toDate(p), v, p]), l = last(R), g = S.houses.regions["Greater Gothenburg"];
      push({ key: "houses", title: "House prices", value: l[1], unit: " %", delta: l[1] - last(R, 2)[1], deltaLabel: "vs previous quarter", goodWhen: null,
        ctx: `year on year, houses · Göteborg ${SL.signed(g && last(g.yoy)[1], 1)} %`, pts: R.slice(-20), period: l[2], s: S.houses }); }
    if (S.barometer) { const p = series(S.barometer), l = last(p);
      push({ key: "barometer", title: "Economic Tendency", value: l[1], unit: "", delta: l[1] - last(p, 2)[1], deltaLabel: "vs previous month", goodWhen: "up", ctx: l[1] >= 100 ? "above normal (100)" : "below normal (100)", pts: p.slice(-36), period: l[2], s: S.barometer }); }
    if (S.consumers) { const p = series(S.consumers), l = last(p);
      push({ key: "consumers", title: "Consumer confidence", value: l[1], unit: "", delta: l[1] - last(p, 2)[1], deltaLabel: "vs previous month", goodWhen: "up", ctx: l[1] >= 100 ? "above normal (100)" : "below normal (100)", pts: p.slice(-36), period: l[2], s: S.consumers }); }
    if (S.eursek) { const p = series(S.eursek), l = last(p), m = p[Math.max(0, p.length - 22)];
      push({ key: "eursek", title: "EUR / SEK", value: l[1], unit: " kr", decimals: 3, d: 3, delta: l[1] - m[1], deltaLabel: "in a month", goodWhen: "down", ctx: "a stronger krona means a lower number", pts: p.slice(-260), period: l[2], s: S.eursek }); }
    if (S.cpi) { const p = series(S.cpi), l = last(p);
      push({ key: "cpi", title: "Inflation (CPI)", value: l[1], unit: " %", delta: l[1] - last(p, 2)[1], deltaLabel: "vs previous month", goodWhen: null, ctx: "includes mortgage interest costs", pts: p.slice(-36), period: l[2], s: S.cpi }); }
    $("kpis").innerHTML = html.join("");
    for (const [k, pts] of Object.entries(sparks)) spark(document.querySelector(`[data-spark="${k}"]`), pts);
    document.querySelectorAll("#kpis .kpi").forEach((el) => { el.style.cursor = "pointer"; el.title = "Show the chart"; el.onclick = () => { const map = { cpif: "infl-chart", cpi: "infl-chart", policy: "infl-chart", unemployment: "unemp-chart", houses: "house-chart", barometer: "mood-chart", consumers: "mood-chart", eursek: "fx-chart" }; $(map[el.dataset.k]).closest(".card").scrollIntoView({ behavior: "smooth", block: "center" }); }; });
  }
  function spark(el, pts) {
    if (!el || !pts.length) return;
    const W = el.clientWidth || 200, H = 42;
    const x = d3.scaleTime(d3.extent(pts, (d) => d[0]), [1, W - 3]);
    const y = d3.scaleLinear(d3.extent(pts, (d) => d[1]), [H - 3, 3]).nice();
    const line = d3.line().x((d) => x(d[0])).y((d) => y(d[1]));
    const area = d3.area().x((d) => x(d[0])).y0(H).y1((d) => y(d[1]));
    const col = SL.css("--accent");
    const last = pts[pts.length - 1];
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" aria-hidden="true"><path d="${area(pts)}" fill="${col}" opacity=".10"/><path d="${line(pts)}" fill="none" stroke="${col}" stroke-width="1.6"/><circle cx="${x(last[0])}" cy="${y(last[1])}" r="2.8" fill="${col}"/></svg>`;
  }

  /* ---------------- generic time chart ---------------- */
  function timeChart(el, lines, o = {}) {
    if (!el) return;
    const W = el.clientWidth, H = el.clientHeight || 260, m = { t: 12, r: o.rightPad ?? 46, b: 26, l: 40 };
    const from = o.from || d3.min(lines, (s) => d3.min(s.points, (d) => d[0]));
    const vis = lines.map((s) => ({ ...s, points: s.points.filter((d) => d[0] >= from) }));
    const all = vis.flatMap((s) => s.points);
    if (!all.length) { el.innerHTML = '<div class="empty">No data</div>'; return; }
    const x = d3.scaleTime([from, d3.max(all, (d) => d[0])], [m.l, W - m.r]);
    const ext = d3.extent(all, (d) => d[1]);
    if (o.ref != null) { ext[0] = Math.min(ext[0], o.ref); ext[1] = Math.max(ext[1], o.ref); }
    if (o.zero) ext[0] = Math.min(0, ext[0]);
    const y = d3.scaleLinear(ext, [H - m.b, m.t]).nice();
    const svg = d3.select(el).html("").append("svg").attr("height", H).attr("role", "img").attr("aria-label", o.aria || "");
    svg.append("g").attr("class", "grid").selectAll("line").data(y.ticks(5)).join("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y).attr("y2", y);
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(Math.max(3, Math.floor(W / 110))).tickSizeOuter(0));
    svg.append("g").attr("class", "axis").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickSize(0).tickFormat((v) => SL.fmt(v, o.yDec ?? (Math.abs(ext[1] - ext[0]) < 5 ? 1 : 0)))).call((g) => g.select(".domain").remove());
    if (o.band) svg.append("rect").attr("class", "target-band").attr("x", m.l).attr("width", W - m.r - m.l).attr("y", y(o.band[1])).attr("height", y(o.band[0]) - y(o.band[1]));
    if (o.ref != null) {
      svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(o.ref)).attr("y2", y(o.ref)).attr("stroke", SL.css("--muted")).attr("stroke-dasharray", "4 4");
      if (o.refLabel) svg.append("text").attr("x", m.l + 6).attr("y", y(o.ref) - 5).text(o.refLabel);
    }
    const ends = [];
    for (const s of vis) {
      const gen = (s.step ? d3.line().curve(d3.curveStepAfter) : d3.line()).x((d) => x(d[0])).y((d) => y(d[1])).defined((d) => d[1] != null);
      svg.append("path").attr("d", gen(s.points)).attr("fill", "none").attr("stroke", s.color).attr("stroke-width", s.width || 2).attr("stroke-dasharray", s.dash || null).attr("stroke-linejoin", "round").attr("opacity", s.opacity ?? 1);
      const l = s.points[s.points.length - 1];
      if (l && o.endLabels !== false && !s.noLabel) ends.push({ x: x(l[0]) + 5, y: y(l[1]) + 4, c: s.color, t: SL.fmt(l[1], o.endDec ?? 1) });
    }
    ends.sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;
    for (const e of ends) svg.append("text").attr("x", e.x).attr("y", e.y).style("fill", e.c).style("font-weight", 650).text(e.t);
    const ch = svg.append("g").attr("class", "crosshair").style("display", "none");
    ch.append("line").attr("y1", m.t).attr("y2", H - m.b);
    const dots = vis.map((s) => ch.append("circle").attr("class", "focus-dot").attr("r", 4).attr("fill", s.color));
    svg.append("rect").attr("x", m.l).attr("y", m.t).attr("width", W - m.l - m.r).attr("height", H - m.t - m.b).attr("fill", "transparent")
      .on("mousemove", (e) => {
        const [mx] = d3.pointer(e); const t = x.invert(mx);
        ch.style("display", null).select("line").attr("x1", mx).attr("x2", mx);
        const rows = vis.map((s, i) => {
          const idx = d3.bisector((d) => d[0]).center(s.points, t), d = s.points[idx];
          if (!d) { dots[i].style("display", "none"); return ""; }
          dots[i].style("display", null).attr("cx", x(d[0])).attr("cy", y(d[1]));
          return `<span style="color:${s.color}">●</span> ${SL.esc(s.name)}: <b>${SL.fmt(d[1], o.tipDec ?? 1)}${o.unit || ""}</b> <span style="opacity:.7">${SL.esc(periodLabel(d[2] || d[0].toISOString().slice(0, 10)))}</span>`;
        }).filter(Boolean);
        SL.tip(e, rows.join("<br>"));
      })
      .on("mouseleave", () => { ch.style("display", "none"); SL.hideTip(); });
  }
  const legend = (el, items) => (el.innerHTML = items.map(([c, t, dash]) => `<span><i style="background:${c};${dash ? "height:2px;vertical-align:3px" : ""}"></i>${SL.esc(t)}</span>`).join(""));
  const yearsAgo = (n) => { const d = new Date(); d.setFullYear(d.getFullYear() - n); return d; };

  /* ---------------- charts ---------------- */
  let inflYears = 10;
  function renderInflation() {
    const S = D.series; if (!S.cpif || !S.policy) return;
    const c1 = SL.css("--c5"), c2 = SL.css("--c2"), c3 = SL.css("--accent");
    legend($("infl-legend"), [[c1, "CPIF inflation"], [c2, "CPI inflation"], [c3, "Policy rate"], [SL.css("--muted"), "2 % inflation target", true]]);
    timeChart($("infl-chart"), [
      { name: "CPIF", color: c1, points: series(S.cpif) },
      { name: "CPI", color: c2, points: series(S.cpi || { points: [] }), width: 1.5, dash: "5 3" },
      { name: "Policy rate", color: c3, points: series(S.policy), step: true, width: 2.4 },
    ], { from: yearsAgo(inflYears), ref: 2, unit: " %", aria: "Inflation and policy rate over time" });
    const l = series(S.cpif).slice(-1)[0], p = S.policy.latest[1], gap = l[1] - 2;
    $("infl-sub").textContent = `CPIF is ${SL.fmt(l[1], 1)} % in ${periodLabel(l[2])}, ${Math.abs(gap) < 0.25 ? "right at" : gap > 0 ? SL.fmt(gap, 1) + " points above" : SL.fmt(-gap, 1) + " points below"} the 2 % target. The policy rate is ${SL.fmt(p, 2)} %.`;
  }
  $("infl-range").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; inflYears = +b.dataset.y; $("infl-range").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); renderInflation(); });

  function renderUnemployment() {
    const S = D.series; if (!S.unemployment) return;
    const p = series(S.unemployment), l = p[p.length - 1];
    const peak = p.filter((d) => d[0] >= yearsAgo(10)).reduce((a, b) => (b[1] > a[1] ? b : a));
    $("unemp-sub").textContent = `${SL.fmt(l[1], 1)} % in ${periodLabel(l[2])}; the ten-year high was ${SL.fmt(peak[1], 1)} % in ${periodLabel(peak[2])}.`;
    const tr = (S.unemployment.trend || []).map(([q, v]) => [toDate(q), v, q]);
    timeChart($("unemp-chart"), [{ name: "Monthly", color: SL.css("--c4"), points: p, width: 1.2, opacity: 0.45, noLabel: tr.length > 0 }, ...(tr.length ? [{ name: "Trend", color: SL.css("--c4"), points: tr, width: 2.6 }] : [])], { unit: " %", aria: "Unemployment rate over time" });
  }

  let houseMode = "yoy";
  function renderHouses() {
    const S = D.series; if (!S.houses) return;
    const cols = { Sweden: SL.css("--text"), "Greater Stockholm": SL.css("--c1"), "Greater Gothenburg": SL.css("--c3"), "Greater Malmö": SL.css("--c2") };
    const lines = Object.entries(S.houses.regions).map(([n, r]) => ({ name: n, color: cols[n], width: n === "Sweden" ? 2.6 : 1.7, points: r[houseMode].map(([p, v]) => [toDate(p), v, p]) }));
    legend($("house-legend"), lines.map((s) => [s.color, s.name]));
    timeChart($("house-chart"), lines, { from: yearsAgo(houseMode === "yoy" ? 10 : 30), ref: houseMode === "yoy" ? 0 : null, unit: houseMode === "yoy" ? " %" : "", endLabels: false, aria: "House prices by region" });
    const sw = S.houses.regions.Sweden.yoy.slice(-1)[0];
    $("house-sub").textContent = `Houses cost ${SL.fmt(Math.abs(sw[1]), 1)} % ${sw[1] >= 0 ? "more" : "less"} than a year earlier (${sw[0].replace("-", " ")}).`;
  }
  $("house-mode").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; houseMode = b.dataset.m; $("house-mode").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); renderHouses(); });

  function renderMood() {
    const S = D.series; if (!S.barometer) return;
    const a = SL.css("--c6"), b = SL.css("--c7");
    legend($("mood-legend"), [[a, "Economic Tendency Indicator (whole economy)"], [b, "Consumer confidence"], [SL.css("--muted"), "100 = normal", true]]);
    timeChart($("mood-chart"), [{ name: "Economic Tendency", color: a, points: series(S.barometer) }, { name: "Consumers", color: b, points: series(S.consumers || { points: [] }), width: 1.6 }],
      { from: yearsAgo(10), ref: 100, aria: "Economic tendency and consumer confidence" });
    const l = series(S.barometer).slice(-1)[0];
    $("mood-sub").textContent = `The economy-wide indicator is ${SL.fmt(l[1], 1)} in ${periodLabel(l[2])}: ${l[1] > 110 ? "much stronger than normal" : l[1] > 100 ? "stronger than normal" : l[1] > 90 ? "weaker than normal" : "much weaker than normal"}.`;
  }

  function renderFx() {
    const S = D.series; if (!S.eursek) return;
    const p = series(S.eursek), l = p[p.length - 1], f = p[0];
    timeChart($("fx-chart"), [{ name: "EUR/SEK", color: SL.css("--c1"), points: p }], { tipDec: 3, endDec: 2, unit: " kr", yDec: 2, aria: "Euro to krona exchange rate" });
    $("fx-sub").textContent = `One euro costs ${SL.fmt(l[1], 2)} kronor, ${l[1] < f[1] ? "down" : "up"} from ${SL.fmt(f[1], 2)} two years ago (${l[1] < f[1] ? "a stronger" : "a weaker"} krona).`;
  }

  /* ---------------- boot ---------------- */
  function boot() {
    if (!window.d3) { SL.setStatus($("status"), "err", "Could not load the chart library (d3) from cdnjs."); return; }
    load();
    setInterval(() => { if (document.visibilityState === "visible") load(); }, 30 * 60000);
    SL.onResize(render);
    SL.onTheme(render);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
