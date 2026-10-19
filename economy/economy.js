/* Economy pulse: reads data/economy.json (written by scripts/update_economy.py on a schedule). */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const t = SL.translator(window.ECO_TEXT);
  SL.initLang();
  let D = null, ready = false;

  /* ---------------- dates ---------------- */
  function toDate(p) {
    if (/^\d{4}-\d{2}$/.test(p)) return new Date(Date.UTC(+p.slice(0, 4), +p.slice(5) - 1, 15));
    const q = /^(\d{4})-Q(\d)$/.exec(p);
    if (q) return new Date(Date.UTC(+q[1], (+q[2] - 1) * 3 + 1, 15));
    return new Date(p + "T12:00:00Z");
  }
  const monthName = { en: new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }), sv: new Intl.DateTimeFormat("sv-SE", { month: "short", year: "numeric", timeZone: "UTC" }) };
  function periodLabel(p) {
    if (/^\d{4}-\d{2}$/.test(p)) return monthName[SL.lang()].format(toDate(p));
    const q = /^(\d{4})-Q(\d)$/.exec(p);
    if (q) return t("quarter", { y: q[1], q: q[2] });
    return SL.fmtDate(p);
  }
  const series = (s) => (s.points || s.monthly || []).map(([p, v]) => [toDate(p), v, p]);
  // "2026-09" -> "2025-09", "2026-Q2" -> "2025-Q2"
  const yearBefore = (p) => +p.slice(0, 4) - 1 + p.slice(4);
  const yearAgo = (pts) => { const l = pts[pts.length - 1]; return l && pts.find((d) => d[2] === yearBefore(l[2])); };
  const daysUntil = (iso) => { const n = new Date(); return Math.round((Date.parse(iso + "T00:00:00Z") - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); };

  /* ---------------- text and status ---------------- */
  let status = { kind: "loading" }, lastLoad = 0, busy = false;
  const REFRESH_MS = 30 * 60000;
  function renderStatus() {
    if (status.kind === "loading") return;
    if (status.kind === "err") { SL.setStatus($("status"), "err", t("loadErr", { msg: SL.esc(status.msg) })); return; }
    const n = D.errors ? D.errors.length : 0;
    const errs = n ? " · " + (n === 1 ? t("errOne") : t("errMany", { n })) : "";
    // The job commits only when a figure changed, so a gap of a few days is normal.
    SL.setStatus($("status"), (Date.now() - new Date(D.generated)) / 36e5 > 96 ? "stale" : "ok", t("upd", { ago: SL.timeAgo(D.generated) }) + errs);
  }
  function applyLang() {
    SL.applyText(window.ECO_TEXT);
    document.title = t("title");
    document.querySelector('meta[name="description"]').content = t("desc");
    $("infl-range").setAttribute("aria-label", t("rangeLbl"));
    $("house-mode").setAttribute("aria-label", t("showLbl"));
    $("kpis").setAttribute("aria-label", t("kpisLbl"));
    if (window.d3) d3.timeFormatDefaultLocale(window.ECO_D3[SL.lang()]);
    renderStatus();
  }

  /* ---------------- load ---------------- */
  async function load() {
    if (busy) return;
    busy = true;
    try {
      const bust = Math.floor(Date.now() / 600000); // GitHub Pages caches ~10 min
      D = await SL.fetchJSON(`../data/economy.json?v=${bust}`);
      lastLoad = Date.now();
      status = { kind: "ok" };
      renderStatus();
      render();
    } catch (e) {
      status = { kind: "err", msg: e.message };
      renderStatus();
    } finally { busy = false; }
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
    if (!ready) { ready = true; window.dispatchEvent(new CustomEvent("sl:ready")); }
  }

  /* ---------------- calendar ---------------- */
  function renderCalendar() {
    const S = D.series, items = [];
    const add = (key, what) => { const s = S[key]; if (s && s.next) items.push({ date: s.next, what: t(what), expected: s.nextExpected }); };
    (S.policy && S.policy.decisions || []).slice(0, 2).forEach((d) => items.push({ date: d, what: t("calPolicy"), expected: false }));
    add("cpif", "calCpi");
    add("unemployment", "calUnemp");
    add("barometer", "calMood");
    add("houses", "calHouse");
    items.sort((a, b) => a.date.localeCompare(b.date));
    $("calendar").innerHTML = items.length ? items.map((it) => {
      const n = daysUntil(it.date);
      const when = n <= 0 ? t("today") : n === 1 ? t("tomorrow") : t("inDays", { n });
      return `<li class="${n <= 7 ? "soon" : ""}"><span class="when">${it.expected ? "≈ " : ""}${SL.fmtDate(it.date)}</span><span class="what">${SL.esc(it.what)}</span><span class="in">${when}${it.expected ? t("estimate") : ""}</span></li>`;
    }).join("") : `<li class="empty">${t("calNone")}</li>`;
  }

  /* ---------------- KPI tiles ---------------- */
  function tile({ key, title, value, unit, d, decimals = 1, delta, deltaLabel, goodWhen, ctx, pts, period, s }) {
    const cls = delta == null || Math.abs(delta) < 1e-9 ? "flat" : (delta > 0) === (goodWhen === "up") ? (delta > 0 ? "up-good" : "down-good") : (delta > 0 ? "up-bad" : "down-bad");
    const next = s.next ? t("next", { date: (s.nextExpected ? "≈ " : "") + SL.fmtDate(s.next) }) : "";
    return `<article class="card kpi span-3 ${s.stale ? "stale" : ""}" data-k="${key}" tabindex="0" role="button" title="${SL.esc(t("tileHint"))}">
      <div class="label"><span><b>${title}</b></span><span>${SL.esc(periodLabel(period))}</span></div>
      <div class="value">${SL.fmt(value, decimals)}<small>${unit}</small></div>
      <div class="delta ${goodWhen ? cls : "flat"}">${delta == null ? "&nbsp;" : SL.signed(delta, d ?? decimals, unit === "%" || unit === " %" ? t("pts") : "") + " " + deltaLabel}</div>
      <div class="ctx">${ctx || ""}</div>
      <div class="spark" data-spark="${key}"></div>
      <div class="meta"><span>${s.updated ? t("updated", { date: SL.fmtDate(s.updated) }) : ""}</span><span>${next}</span></div>
    </article>`;
  }
  const CHART_OF = { cpif: "infl-chart", cpi: "infl-chart", policy: "infl-chart", unemployment: "unemp-chart", houses: "house-chart", barometer: "mood-chart", consumers: "mood-chart", eursek: "fx-chart" };
  function renderKpis() {
    const S = D.series, html = [], sparks = {};
    const last = (a, i = 1) => a[a.length - i];
    const push = (o) => { html.push(tile(o)); sparks[o.key] = o.pts; };
    if (S.cpif) { const p = series(S.cpif), l = last(p), y = yearAgo(p);
      push({ key: "cpif", title: t("tCpif"), value: l[1], unit: " %", delta: l[1] - last(p, 2)[1], deltaLabel: t("vsMonth"), goodWhen: (Math.abs(l[1] - 2) < Math.abs(last(p, 2)[1] - 2)) === (l[1] > last(p, 2)[1]) ? "up" : "down",
        ctx: t("ctxCpif", { v: SL.fmt(y && y[1], 1) }), pts: p.slice(-36), period: l[2], s: S.cpif }); }
    if (S.policy) { const p = series(S.policy), l = S.policy.latest, prevChange = S.policy.changes.slice(-2)[0];
      const cp = S.cpif ? series(S.cpif) : null, real = cp ? l[1] - last(cp)[1] : null;
      push({ key: "policy", title: t("tPolicy"), value: l[1], unit: " %", decimals: 2, d: 2, delta: S.policy.changes.length > 1 ? l[1] - prevChange[1] : null, deltaLabel: t("lastChange", { date: SL.fmtDate(last(S.policy.changes)[0]) }), goodWhen: null,
        ctx: real == null ? "" : t("ctxReal", { v: SL.signed(real, 2) }), pts: p.slice(-36), period: l[0], s: S.policy }); }
    if (S.unemployment) { const p = series(S.unemployment), l = last(p), y = yearAgo(p);
      push({ key: "unemployment", title: t("tUnemp"), value: l[1], unit: " %", delta: y ? l[1] - y[1] : null, deltaLabel: t("vsYear"), goodWhen: "down", ctx: t("ctxUnemp"), pts: p.slice(-36), period: l[2], s: S.unemployment }); }
    if (S.houses) { const R = S.houses.regions.Sweden.yoy.map(([p, v]) => [toDate(p), v, p]), l = last(R), g = S.houses.regions["Greater Gothenburg"];
      push({ key: "houses", title: t("tHouses"), value: l[1], unit: " %", delta: l[1] - last(R, 2)[1], deltaLabel: t("vsQuarter"), goodWhen: null,
        ctx: t("ctxHouses", { v: SL.signed(g && last(g.yoy)[1], 1) }), pts: R.slice(-20), period: l[2], s: S.houses }); }
    if (S.barometer) { const p = series(S.barometer), l = last(p);
      push({ key: "barometer", title: t("tMood"), value: l[1], unit: "", delta: l[1] - last(p, 2)[1], deltaLabel: t("vsMonth"), goodWhen: "up", ctx: t(l[1] >= 100 ? "ctxAbove" : "ctxBelow"), pts: p.slice(-36), period: l[2], s: S.barometer }); }
    if (S.consumers) { const p = series(S.consumers), l = last(p);
      push({ key: "consumers", title: t("tCons"), value: l[1], unit: "", delta: l[1] - last(p, 2)[1], deltaLabel: t("vsMonth"), goodWhen: "up", ctx: t(l[1] >= 100 ? "ctxAbove" : "ctxBelow"), pts: p.slice(-36), period: l[2], s: S.consumers }); }
    if (S.eursek) { const p = series(S.eursek), l = last(p), m = p[Math.max(0, p.length - 22)];
      push({ key: "eursek", title: t("tFx"), value: l[1], unit: " kr", decimals: 3, d: 3, delta: l[1] - m[1], deltaLabel: t("inMonth"), goodWhen: null, ctx: t("ctxFx"), pts: p.slice(-260), period: l[2], s: S.eursek }); }
    if (S.cpi) { const p = series(S.cpi), l = last(p);
      push({ key: "cpi", title: t("tCpi"), value: l[1], unit: " %", delta: l[1] - last(p, 2)[1], deltaLabel: t("vsMonth"), goodWhen: null, ctx: t("ctxCpi"), pts: p.slice(-36), period: l[2], s: S.cpi }); }
    $("kpis").innerHTML = html.join("");
    for (const [k, pts] of Object.entries(sparks)) spark(document.querySelector(`[data-spark="${k}"]`), pts);
  }
  $("kpis").addEventListener("click", (e) => {
    const el = e.target.closest(".kpi");
    if (el) $(CHART_OF[el.dataset.k]).closest(".card").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });
  $("kpis").addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("kpi")) { e.preventDefault(); e.target.click(); } });
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
    const first = d3.min(lines, (s) => d3.min(s.points, (d) => d[0])), from = o.from > first ? o.from : first;
    const vis = lines.map((s) => ({ ...s, points: s.points.filter((d) => d[0] >= from) }));
    const all = vis.flatMap((s) => s.points);
    if (!all.length) { el.innerHTML = `<div class="empty">${t("noData")}</div>`; return; }
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
      if (l && o.endLabels !== false && !s.noLabel) ends.push({ x: x(l[0]) + 5, y: y(l[1]) + 4, c: s.color, t: SL.fmt(l[1], s.dec ?? o.endDec ?? 1) });
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
          return `<span style="color:${s.color}">●</span> ${SL.esc(s.name)}: <b>${SL.fmt(d[1], s.dec ?? o.tipDec ?? 1)}${o.unit || ""}</b> <span style="opacity:.7">${SL.esc(periodLabel(d[2] || d[0].toISOString().slice(0, 10)))}</span>`;
        }).filter(Boolean);
        SL.tip(e, rows.join("<br>"));
      })
      .on("mouseleave", () => { ch.style("display", "none"); SL.hideTip(); });
  }
  const legend = (el, items) => (el.innerHTML = items.map(([c, t, dash]) => `<span><i style="background:${c};${dash ? "height:2px;vertical-align:3px" : ""}"></i>${SL.esc(t)}</span>`).join(""));
  const yearsAgo = (n) => { const d = new Date(); d.setFullYear(d.getFullYear() - n); return d; };

  /* ---------------- charts ---------------- */
  // What each chart currently shows, so its table can list the same rows.
  const view = {};
  function tableOf(v, head, caption) {
    if (!v) return null;
    const lines = v.lines.filter((s) => s.points.length);
    const maps = lines.map((s) => new Map(s.points.filter((d) => !v.from || d[0] >= v.from).map((d) => [d[2], d])));
    const keys = new Map();
    maps.forEach((m) => m.forEach((d, k) => keys.set(k, d[0])));
    const rows = [...keys].sort((a, b) => b[1] - a[1]).map(([k]) => [periodLabel(k), ...lines.map((s, i) => { const d = maps[i].get(k); return d && d[1] != null ? SL.fmt(d[1], s.dec ?? v.dec ?? 1) : "–"; })]);
    return { caption, cols: [head, ...lines.map((s) => s.name)], rows };
  }
  const tabulate = (id, key, head, caption) => SL.tableToggle($(id), () => tableOf(view[key], t(head), t(typeof caption === "function" ? caption() : caption)));

  let inflYears = 10;
  function renderInflation() {
    const S = D.series; if (!S.cpif || !S.policy) return;
    const c1 = SL.css("--c5"), c2 = SL.css("--c2"), c3 = SL.css("--accent");
    legend($("infl-legend"), [[c1, t("lgCpif")], [c2, t("lgCpi")], [c3, t("lgPolicy")], [SL.css("--muted"), t("lgTarget"), true]]);
    const lines = [
      { name: t("sCpif"), color: c1, points: series(S.cpif) },
      { name: t("sCpi"), color: c2, points: series(S.cpi || { points: [] }), width: 1.5, dash: "5 3" },
      { name: t("sPolicy"), color: c3, points: series(S.policy), step: true, width: 2.4, dec: 2 },
    ];
    const from = yearsAgo(inflYears);
    view.infl = { lines, from, dec: 1 };
    timeChart($("infl-chart"), lines, { from, ref: 2, unit: " %", aria: t("aInfl") });
    const l = series(S.cpif).slice(-1)[0], p = S.policy.latest[1], gap = l[1] - 2;
    const rel = Math.abs(gap) < 0.25 ? t("relNear") : gap > 0 ? t("relAbove", { n: SL.fmt(gap, 1) }) : t("relBelow", { n: SL.fmt(-gap, 1) });
    $("infl-sub").innerHTML = t("inflSub", { v: SL.fmt(l[1], 1), p: periodLabel(l[2]), rel, r: SL.fmt(p, 2) });
    tabulate("infl-chart", "infl", "cMonth", "capInfl");
  }
  $("infl-range").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; inflYears = +b.dataset.y; $("infl-range").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); renderInflation(); });

  function renderUnemployment() {
    const S = D.series; if (!S.unemployment) return;
    const p = series(S.unemployment), l = p[p.length - 1], y = yearAgo(p), d = y ? l[1] - y[1] : null;
    const key = d == null ? "unempNow" : Math.abs(d) < 0.05 ? "unempSame" : d < 0 ? "unempLower" : "unempHigher";
    $("unemp-sub").innerHTML = t(key, { v: SL.fmt(l[1], 1), p: periodLabel(l[2]), n: SL.fmt(d == null ? 0 : Math.abs(d), 1) });
    const tr = (S.unemployment.trend || []).map(([q, v]) => [toDate(q), v, q]);
    const lines = [{ name: t("sMonthly"), color: SL.css("--c4"), points: p, width: 1.2, opacity: 0.45, noLabel: tr.length > 0 }, ...(tr.length ? [{ name: t("sTrend"), color: SL.css("--c4"), points: tr, width: 2.6 }] : [])];
    view.unemp = { lines, from: null, dec: 1 };
    timeChart($("unemp-chart"), lines, { unit: " %", aria: t("aUnemp") });
    tabulate("unemp-chart", "unemp", "cMonth", "capUnemp");
  }

  let houseMode = "yoy";
  const REGION = { Sweden: "regSweden", "Greater Stockholm": "regStockholm", "Greater Gothenburg": "regGothenburg", "Greater Malmö": "regMalmo" };
  function renderHouses() {
    const S = D.series; if (!S.houses) return;
    const cols = { Sweden: SL.css("--text"), "Greater Stockholm": SL.css("--c1"), "Greater Gothenburg": SL.css("--c3"), "Greater Malmö": SL.css("--c2") };
    const lines = Object.entries(S.houses.regions).map(([n, r]) => ({ name: REGION[n] ? t(REGION[n]) : n, color: cols[n], width: n === "Sweden" ? 2.6 : 1.7, points: r[houseMode].map(([p, v]) => [toDate(p), v, p]) }));
    legend($("house-legend"), lines.map((s) => [s.color, s.name]));
    const from = yearsAgo(houseMode === "yoy" ? 10 : 30);
    view.house = { lines, from, dec: houseMode === "yoy" ? 1 : 0 };
    timeChart($("house-chart"), lines, { from, ref: houseMode === "yoy" ? 0 : null, unit: houseMode === "yoy" ? " %" : "", endLabels: false, aria: t("aHouse") });
    const sw = S.houses.regions.Sweden.yoy.slice(-1)[0], v = sw[1];
    $("house-sub").innerHTML = t(Math.abs(v) < 0.05 ? "houseSame" : v > 0 ? "houseUp" : "houseDown", { v: SL.fmt(Math.abs(v), 1), p: periodLabel(sw[0]) });
    tabulate("house-chart", "house", "cQuarter", () => (houseMode === "yoy" ? "capYoy" : "capIdx"));
  }
  $("house-mode").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; houseMode = b.dataset.m; $("house-mode").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); renderHouses(); });

  function renderMood() {
    const S = D.series; if (!S.barometer) return;
    const a = SL.css("--c6"), b = SL.css("--c7");
    legend($("mood-legend"), [[a, t("lgEti")], [b, t("lgCons")], [SL.css("--muted"), t("lgNormal"), true]]);
    const lines = [{ name: t("sEti"), color: a, points: series(S.barometer) }, { name: t("sCons"), color: b, points: series(S.consumers || { points: [] }), width: 1.6 }];
    const from = yearsAgo(10);
    view.mood = { lines, from, dec: 1 };
    timeChart($("mood-chart"), lines, { from, ref: 100, aria: t("aMood") });
    const l = series(S.barometer).slice(-1)[0], c = S.consumers && series(S.consumers).slice(-1)[0];
    const verdict = l[1] >= 110 ? "vMuchUp" : l[1] >= 102 ? "vUp" : l[1] > 98 ? "vNorm" : l[1] > 90 ? "vDown" : "vMuchDown";
    $("mood-sub").innerHTML = t("moodSub", { v: SL.fmt(l[1], 1), p: periodLabel(l[2]), verdict: t(verdict), cons: c ? t("moodCons", { c: SL.fmt(c[1], 1) }) : "" });
    tabulate("mood-chart", "mood", "cMonth", "capMood");
  }

  function renderFx() {
    const S = D.series; if (!S.eursek) return;
    const p = series(S.eursek), l = p[p.length - 1];
    const lines = [{ name: t("sFx"), color: SL.css("--c1"), points: p }];
    view.fx = { lines, from: null, dec: 3 };
    timeChart($("fx-chart"), lines, { tipDec: 3, endDec: 2, unit: " kr", yDec: 2, aria: t("aFx") });
    const cut = new Date(l[0]); cut.setUTCFullYear(cut.getUTCFullYear() - 1);
    let ref = null;
    for (const d of p) if (d[0] <= cut) ref = d;
    const when = ref ? t("fxYear") : t("fxOn", { d: SL.fmtDate(p[0][2]) });
    const diff = l[1] - (ref || p[0])[1];
    $("fx-sub").innerHTML = t(Math.abs(diff) < 0.005 ? "fxSame" : diff < 0 ? "fxDown" : "fxUp", { v: SL.fmt(l[1], 2), n: SL.fmt(Math.abs(diff), 2), when });
    tabulate("fx-chart", "fx", "cDate", "capFx");
  }

  /* ---------------- boot ---------------- */
  function boot() {
    applyLang();
    if (!window.d3) { SL.setStatus($("status"), "err", t("d3Err")); return; }
    load();
    setInterval(() => { if (document.visibilityState === "visible") load(); }, REFRESH_MS);
    // A tab left in the background skips its timer ticks; catch up as soon as it is visible again.
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && Date.now() - lastLoad > REFRESH_MS) load(); });
    SL.onResize(render);
    SL.onTheme(render);
    addEventListener("sl:lang", () => { applyLang(); render(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
