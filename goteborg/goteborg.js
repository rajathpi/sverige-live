/* Göteborg live: everything is fetched in the browser, nothing is stored or proxied. */
(function () {
  "use strict";
  const { fmt, esc, css, fmtTime, setStatus, tip, hideTip } = SL;
  const $ = (s) => document.querySelector(s);
  const TZ = "Europe/Stockholm";

  /* ---------- time helpers (always Europe/Stockholm) ---------- */
  const f2 = (n) => String(n).padStart(2, "0");
  const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" });
  const wdFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" });
  const wdDayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric" });
  const dayKey = (t) => dayFmt.format(t);
  const sthHour = (t) => parseInt(hourFmt.format(t), 10) % 24;
  const addDays = (key, n) => { const d = new Date(key + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  function sthTicks(t0, t1, step) {
    const out = [];
    for (let t = Math.ceil(t0 / 3600e3) * 3600e3; t <= t1; t += 3600e3) if (sthHour(t) % step === 0) out.push(t);
    return out;
  }
  const hourLbl = (t) => f2(sthHour(t));

  /* ---------- app state: one record per source ---------- */
  const SOURCES = {
    obs: { name: "SMHI observations", every: 5, load: loadObs },
    fc: { name: "SMHI forecast", every: 60, load: loadForecast },
    svk: { name: "Svenska kraftnät", every: 5, load: loadSvk },
    price: { name: "electricity price", every: 15, load: loadPrice },
    police: { name: "Polisen", every: 2, load: loadPolice },
  };
  const S = {}; Object.keys(SOURCES).forEach((k) => (S[k] = { data: null, ts: 0, err: null, busy: false }));
  const UI = { priceDay: "today", area: "gbg", win: 168 };

  /* ---------- chart plumbing ---------- */
  function mk(el, h) {
    el.innerHTML = "";
    const w = Math.max(250, Math.round(el.clientWidth || 300));
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    return { svg, w, h };
  }
  function spark(el, pts, kind) {
    if (!el) return;
    pts = (pts || []).filter((p) => isFinite(p.y));
    if (pts.length < 2) { el.innerHTML = ""; return; }
    const { svg, w, h } = mk(el, 42);
    const x = d3.scaleLinear(d3.extent(pts, (p) => p.x), [2, w - 2]);
    const ext = d3.extent(pts, (p) => p.y);
    const lo = kind === "bars" ? 0 : ext[0], hi = ext[1] === lo ? lo + 1 : ext[1];
    const y = d3.scaleLinear([lo, hi], [h - 3, 4]);
    const col = css("--accent");
    svg.attr("role", "img").attr("aria-label", "Trend over the last day");
    if (kind === "bars") {
      const bw = Math.max(1, (w - 4) / pts.length - 1);
      svg.selectAll("rect").data(pts).join("rect").attr("x", (p) => x(p.x) - bw / 2).attr("width", bw).attr("y", (p) => y(p.y)).attr("height", (p) => Math.max(0, y(lo) - y(p.y))).attr("fill", col).attr("opacity", 0.7);
    } else {
      svg.append("path").datum(pts).attr("fill", col).attr("opacity", 0.14).attr("d", d3.area().x((p) => x(p.x)).y0(h - 2).y1((p) => y(p.y)).curve(d3.curveMonotoneX));
      svg.append("path").datum(pts).attr("fill", "none").attr("stroke", col).attr("stroke-width", 1.6).attr("d", d3.line().x((p) => x(p.x)).y((p) => y(p.y)).curve(d3.curveMonotoneX));
      const l = pts[pts.length - 1];
      svg.append("circle").attr("cx", x(l.x)).attr("cy", y(l.y)).attr("r", 2.6).attr("fill", col);
    }
  }
  function loadingOrError(el, k, what) {
    if (S[k].data) return false;
    el.innerHTML = S[k].err ? `<div class="error">Couldn't load ${esc(what)} (${esc(S[k].err)}). Retrying automatically.</div>` : `<div class="loading">Loading</div>`;
    return true;
  }
  function setSrc(id, k, html, observed) {
    const el = $("#" + id); if (!el) return;
    let t = html + (observed ? ` · ${observed}` : "");
    if (S[k].err && S[k].data) t += ` · <span style="color:var(--warn)">refresh failed, showing data from ${fmtTime(S[k].ts)}</span>`;
    else if (S[k].err) t += ` · <span style="color:var(--bad)">unavailable right now</span>`;
    el.innerHTML = t;
  }
  const srcSmhi = 'Source: <a href="https://opendata.smhi.se/" rel="noopener">SMHI Open Data</a> (CC BY 4.0)';

  /* ====================================================================
     1. SMHI observations, Göteborg A
     ==================================================================== */
  const OBS = { temp: 1, wind: 4, hum: 6, rain: 7, pres: 9 };
  async function loadObs() {
    const keys = Object.keys(OBS);
    const res = await Promise.allSettled(keys.map((k) => SL.fetchJSON(`https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/${OBS[k]}/station/71420/period/latest-day/data.json`)));
    const out = {};
    res.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value && Array.isArray(r.value.value))
        out[keys[i]] = r.value.value.map((v) => ({ x: v.date, y: parseFloat(v.value) })).filter((p) => isFinite(p.y));
    });
    if (!out.temp || !out.temp.length) throw new Error("no temperature data");
    return out;
  }
  const last = (a) => (a && a.length ? a[a.length - 1] : null);
  function feelsLike(t, windMs) {
    // Wind chill (Environment Canada / Meteorological Service formula), valid for T <= 10 C and wind >= 4.8 km/h.
    const v = windMs * 3.6;
    if (t == null || windMs == null || t > 10 || v < 4.8) return null;
    return 13.12 + 0.6215 * t - 11.37 * Math.pow(v, 0.16) + 0.3965 * t * Math.pow(v, 0.16);
  }
  function kpi(id, o) {
    const el = $(id);
    el.innerHTML = `<div class="label"><span>${o.label}</span>${o.pill || ""}</div><div class="value">${o.value}</div><div class="delta ${o.cls || "flat"}">${o.delta || "&nbsp;"}</div><div class="spark" aria-hidden="${o.spark ? "false" : "true"}"></div><div class="meta">${(o.meta || []).map((m) => `<span>${m}</span>`).join("")}</div>`;
    return el.querySelector(".spark");
  }
  function kpiMissing(id, label, k, msg) {
    $(id).innerHTML = `<div class="label"><span>${label}</span></div><div class="value">–</div><div class="delta flat">${S[k].err ? esc(msg || "Unavailable right now") : "Loading"}</div><div class="spark"></div><div class="meta"></div>`;
  }
  function renderObsKpis() {
    const d = S.obs.data;
    if (!d) { ["#k-temp", "#k-wind", "#k-rain"].forEach((id, i) => kpiMissing(id, ["Temperature now", "Wind", "Rain, last hour"][i], "obs", "SMHI observations unavailable")); return; }
    const T = last(d.temp), W = last(d.wind), H = last(d.hum), P = last(d.pres), R = last(d.rain);
    const old = Date.now() - T.x > 3 * 3600e3;
    const fl = feelsLike(T.y, W && W.y);
    const range = d.temp.length > 1 ? `24 h: ${fmt(d3.min(d.temp, (p) => p.y), 1)} to ${fmt(d3.max(d.temp, (p) => p.y), 1)} °C` : "";
    const sp = kpi("#k-temp", {
      label: "Temperature now", pill: '<span class="pill">Göteborg A</span>',
      value: `${fmt(T.y, 1)}<small>°C</small>`,
      delta: fl != null ? `Feels like ${fmt(fl, 1)} °C` : (H ? `Humidity ${fmt(H.y)} %` : ""),
      meta: [range, `${H ? "Humidity " + fmt(H.y) + " %" : ""}${H && P ? " · " : ""}${P ? fmt(P.y) + " hPa" : ""}`, `${old ? "Stale: " : "Observed "}${fmtTime(T.x)}`].filter(Boolean), spark: 1,
    });
    spark(sp, d.temp);
    if (W) {
      const sw = kpi("#k-wind", { label: "Wind", value: `${fmt(W.y, 1)}<small>m/s</small>`, delta: windWord(W.y), meta: [`24 h max: ${fmt(d3.max(d.wind, (p) => p.y), 1)} m/s`, `Observed ${fmtTime(W.x)}`], spark: 1 });
      spark(sw, d.wind);
    } else kpiMissing("#k-wind", "Wind", "obs", "No wind reading");
    if (R) {
      const total = d3.sum(d.rain, (p) => p.y);
      const sr = kpi("#k-rain", { label: "Rain, last hour", value: `${fmt(R.y, 1)}<small>mm</small>`, delta: R.y > 0 ? "Raining" : "Dry", meta: [`Last 24 h: ${fmt(total, 1)} mm`, `Observed ${fmtTime(R.x)}`], spark: 1 });
      spark(sr, d.rain, "bars");
    } else kpiMissing("#k-rain", "Rain, last hour", "obs", "No precipitation reading");
  }
  function windWord(v) {
    return v < 0.5 ? "Calm" : v < 3.4 ? "Light air to breeze" : v < 8 ? "Gentle to moderate breeze" : v < 14 ? "Fresh to strong breeze" : v < 21 ? "Near gale to gale" : "Storm";
  }

  /* ====================================================================
     2. SMHI forecast (SNOW1g)
     ==================================================================== */
  async function loadForecast() {
    const j = await SL.fetchJSON("https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/11.97/lat/57.71/data.json");
    if (!j || !Array.isArray(j.timeSeries) || !j.timeSeries.length) throw new Error("empty forecast");
    const rows = j.timeSeries.map((r) => {
      const t = Date.parse(r.time), d = r.data || {};
      const s0 = r.intervalParametersStartTime ? Date.parse(r.intervalParametersStartTime) : t - 3600e3;
      return {
        t, s0: isFinite(s0) && s0 < t ? s0 : t - 3600e3,
        temp: d.air_temperature, wind: d.wind_speed, gust: d.wind_speed_of_gust, dir: d.wind_from_direction,
        rain: d.precipitation_amount_mean_deterministic ?? d.precipitation_amount_mean, sym: d.symbol_code,
        hum: d.relative_humidity, pop: d.probability_of_precipitation,
      };
    }).filter((r) => isFinite(r.t));
    return { created: j.createdTime || j.referenceTime, rows };
  }
  const SYM = { 1: ["☀️", "Clear sky"], 2: ["🌤️", "Nearly clear sky"], 3: ["⛅", "Variable cloudiness"], 4: ["⛅", "Half-clear sky"], 5: ["🌥️", "Cloudy"], 6: ["☁️", "Overcast"], 7: ["🌫️", "Fog"], 8: ["🌦️", "Light rain showers"], 9: ["🌦️", "Moderate rain showers"], 10: ["🌧️", "Heavy rain showers"], 11: ["⛈️", "Thunderstorm"], 12: ["🌨️", "Light sleet showers"], 13: ["🌨️", "Moderate sleet showers"], 14: ["🌨️", "Heavy sleet showers"], 15: ["🌨️", "Light snow showers"], 16: ["❄️", "Moderate snow showers"], 17: ["❄️", "Heavy snow showers"], 18: ["🌧️", "Light rain"], 19: ["🌧️", "Moderate rain"], 20: ["🌧️", "Heavy rain"], 21: ["⛈️", "Thunder"], 22: ["🌨️", "Light sleet"], 23: ["🌨️", "Moderate sleet"], 24: ["🌨️", "Heavy sleet"], 25: ["❄️", "Light snowfall"], 26: ["❄️", "Moderate snowfall"], 27: ["❄️", "Heavy snowfall"] };

  function renderForecast() {
    const el = $("#c-fc"), strip = $("#d-fc");
    setSrc("src-fc", "fc", 'Source: <a href="https://opendata.smhi.se/" rel="noopener">SMHI Open Data</a> (CC BY 4.0), SNOW1g point forecast for 57,71 N, 11,97 E', S.fc.data ? "model run " + fmtTime(S.fc.data.created) : "");
    if (loadingOrError(el, "fc", "the forecast")) { strip.innerHTML = ""; return; }
    const all = S.fc.data.rows, now = Date.now();
    const rows = all.filter((r) => r.t >= now - 3600e3 && r.t <= now + 48 * 3600e3 && isFinite(r.temp));
    if (rows.length < 3) { el.innerHTML = '<div class="empty">No forecast data for the next 48 hours.</div>'; }
    else drawForecast(el, rows, now);
    renderDays(all, now, strip);
  }
  function drawForecast(el, rows, now) {
    const mob = (el.clientWidth || 300) < 480;
    const H1 = mob ? 170 : 190, GAP = 38, H2 = 76, top = 26, bot = 22;
    const { svg, w, h } = mk(el, top + H1 + GAP + H2 + bot);
    const ml = 32, mr = 30;
    const t0 = rows[0].s0 < rows[0].t - 3 * 3600e3 ? rows[0].t - 3600e3 : rows[0].s0, t1 = rows[rows.length - 1].t;
    const x = d3.scaleLinear([t0, t1], [ml, w - mr]);
    const tmin = d3.min(rows, (r) => r.temp), tmax = d3.max(rows, (r) => r.temp);
    const yT = d3.scaleLinear([Math.floor(tmin - 1.5), Math.ceil(tmax + 1.5)], [top + H1, top]).nice(4);
    const rain = rows.map((r) => r.rain || 0);
    const pmax = Math.max(2, d3.max(rain));
    const bandH = Math.min(70, H1 * 0.4);
    const yP = d3.scaleLinear([0, pmax], [top + H1, top + H1 - bandH]);
    const wTop = top + H1 + GAP, wmax = Math.max(8, d3.max(rows, (r) => Math.max(r.gust || 0, r.wind || 0)));
    const yW = d3.scaleLinear([0, wmax], [wTop + H2, wTop]).nice(3);
    const grid = css("--grid"), c1 = css("--c1"), c2 = css("--c2"), c6 = css("--c6");

    // grid + axes
    svg.append("g").selectAll("line").data(yT.ticks(4)).join("line").attr("x1", ml).attr("x2", w - mr).attr("y1", yT).attr("y2", yT).attr("stroke", grid);
    svg.append("g").attr("class", "axis").attr("transform", `translate(${ml},0)`).call(d3.axisLeft(yT).ticks(4).tickSize(0).tickPadding(6).tickFormat((v) => fmt(v))).select(".domain").remove();
    svg.append("text").attr("x", 2).attr("y", top - 12).text("°C").style("fill", c2);
    svg.append("g").selectAll("line").data(yW.ticks(3)).join("line").attr("x1", ml).attr("x2", w - mr).attr("y1", yW).attr("y2", yW).attr("stroke", grid);
    svg.append("g").attr("class", "axis").attr("transform", `translate(${ml},0)`).call(d3.axisLeft(yW).ticks(3).tickSize(0).tickPadding(6).tickFormat((v) => fmt(v))).select(".domain").remove();
    svg.append("text").attr("x", 2).attr("y", wTop - 12).text("m/s").style("fill", c6);
    // precipitation axis on the right
    const pt = [0, pmax];
    svg.append("g").selectAll("text").data(pt).join("text").attr("x", w - mr + 4).attr("y", (v) => yP(v) + 4).text((v) => fmt(v, v % 1 ? 1 : 0)).style("fill", c1);
    svg.append("text").attr("x", w - mr + 4).attr("y", top + H1 - bandH - 8).text("mm").style("fill", c1);

    // midnights and hour ticks
    const mids = sthTicks(t0, t1, 24);
    svg.append("g").selectAll("line").data(mids).join("line").attr("class", "dayline").attr("x1", x).attr("x2", x).attr("y1", top - 4).attr("y2", wTop + H2);
    svg.append("g").selectAll("text").data(mids).join("text").attr("class", "daylbl").attr("x", (t) => x(t) + 4).attr("y", top - 12).text((t) => wdDayFmt.format(t));
    const ticks = sthTicks(t0, t1, mob ? 12 : 6).filter((t) => !mids.includes(t) || true);
    svg.append("g").selectAll("text").data(ticks).join("text").attr("x", x).attr("y", wTop + H2 + 16).attr("text-anchor", "middle").text(hourLbl);

    // precipitation bars
    svg.append("g").selectAll("rect").data(rows.filter((r) => r.rain > 0)).join("rect").attr("x", (r) => x(Math.max(t0, r.s0)) + 0.5).attr("width", (r) => Math.max(1, x(r.t) - x(Math.max(t0, r.s0)) - 1)).attr("y", (r) => yP(r.rain)).attr("height", (r) => yP(0) - yP(r.rain)).attr("fill", c1).attr("opacity", 0.55);
    // temperature
    svg.append("path").datum(rows).attr("fill", "none").attr("stroke", c2).attr("stroke-width", 2.2).attr("stroke-linejoin", "round").attr("d", d3.line().defined((r) => isFinite(r.temp)).x((r) => x(r.t)).y((r) => yT(r.temp)).curve(d3.curveMonotoneX));
    // wind band + line + direction arrows
    const wr = rows.filter((r) => isFinite(r.wind));
    if (wr.length > 2) {
      svg.append("path").datum(wr).attr("fill", c6).attr("opacity", 0.2).attr("d", d3.area().x((r) => x(r.t)).y0((r) => yW(r.wind)).y1((r) => yW(Math.max(r.wind, r.gust ?? r.wind))).curve(d3.curveMonotoneX));
      svg.append("path").datum(wr).attr("fill", "none").attr("stroke", c6).attr("stroke-width", 2).attr("d", d3.line().x((r) => x(r.t)).y((r) => yW(r.wind)).curve(d3.curveMonotoneX));
      const every = mob ? 6 : 3;
      svg.append("g").selectAll("path").data(wr.filter((r) => isFinite(r.dir) && sthHour(r.t) % every === 0)).join("path")
        .attr("d", "M0,-6 L4.2,4.5 L0,2 L-4.2,4.5Z").attr("fill", css("--muted")).attr("opacity", 0.8)
        .attr("transform", (r) => `translate(${x(r.t)},${wTop - 9}) rotate(${(r.dir + 180) % 360})`);
    }
    // now marker
    if (now >= t0 && now <= t1) {
      svg.append("line").attr("class", "nowline").attr("x1", x(now)).attr("x2", x(now)).attr("y1", top).attr("y2", wTop + H2);
    }
    // hover
    const cross = svg.append("line").attr("class", "cross").attr("y1", top).attr("y2", wTop + H2).style("display", "none");
    const bis = d3.bisector((r) => r.t).center;
    const onMove = (e) => {
      const [mx] = d3.pointer(e, svg.node());
      const r = rows[bis(rows, x.invert(mx))]; if (!r) return;
      cross.attr("x1", x(r.t)).attr("x2", x(r.t)).style("display", null);
      const s = SYM[r.sym];
      tip(e, `<b>${wdFmt.format(r.t)} ${hourLbl(r.t)}:00</b>${s ? " · " + s[1] : ""}<br>${fmt(r.temp, 1)} °C · rain ${fmt(r.rain || 0, 1)} mm${r.pop != null ? " (" + fmt(r.pop) + " %)" : ""}<br>Wind ${fmt(r.wind, 1)} m/s${r.gust != null ? ", gusts " + fmt(r.gust, 1) : ""}`);
    };
    svg.append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", wTop + H2 - top).attr("fill", "transparent").style("touch-action", "pan-y")
      .on("pointermove", onMove).on("pointerdown", onMove).on("pointerleave", () => { cross.style("display", "none"); hideTip(); });
    svg.attr("role", "img").attr("aria-label", `Forecast for the next 48 hours: temperature between ${fmt(tmin, 0)} and ${fmt(tmax, 0)} °C, up to ${fmt(d3.max(rain), 1)} mm precipitation per period, wind up to ${fmt(d3.max(rows, (r) => r.wind), 0)} m/s.`);
  }
  function renderDays(all, now, strip) {
    const byDay = new Map();
    all.forEach((r) => { if (!isFinite(r.temp)) return; const k = dayKey(r.t); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(r); });
    const today = dayKey(now);
    const days = [...byDay.keys()].filter((k) => k >= today).sort().slice(0, 7);
    if (!days.length) { strip.innerHTML = ""; return; }
    strip.innerHTML = days.map((k) => {
      const rs = byDay.get(k);
      const mn = d3.min(rs, (r) => r.temp), mx = d3.max(rs, (r) => r.temp);
      const rn = rs.filter((r) => r.rain != null), sum = d3.sum(rn, (r) => r.rain);
      const noon = rs.reduce((a, b) => (Math.abs(sthHour(b.t) - 13) < Math.abs(sthHour(a.t) - 13) ? b : a));
      const s = SYM[noon.sym] || ["", ""];
      const lbl = k === today ? "Today" : wdDayFmt.format(new Date(k + "T12:00:00Z"));
      return `<div class="day" title="${esc(s[1])}"><div class="dn">${esc(lbl)}</div><div class="di" aria-hidden="true">${s[0]}</div><div class="dt">${fmt(mx)}° <span>${fmt(mn)}°</span></div><div class="dp">${rn.length ? (sum >= 0.1 ? fmt(sum, 1) + " mm" : "dry") : "&nbsp;"}</div><span class="sr-only">${esc(s[1])}</span></div>`;
    }).join("");
  }

  /* ====================================================================
     3. Svenska kraftnät control room
     ==================================================================== */
  const MIX = [
    { id: "2", key: "nuclear", name: "Nuclear", col: "--c4" },
    { id: "3", key: "hydro", name: "Hydro", col: "--c1" },
    { id: "5", key: "wind", name: "Wind", col: "--c6" },
    { id: "4", key: "thermal", name: "Thermal", col: "--c5" },
    { id: "6", key: "other", name: "Solar and other", col: "--c2" },
  ];
  async function loadSvk() {
    const today = dayKey(Date.now());
    const [pr, si] = await Promise.allSettled([
      SL.fetchJSON(`https://www.svk.se/services/controlroom/v2/production?date=${today}&countryCode=SE`),
      SL.fetchJSON(`https://www.svk.se/services/controlroom/v2/situation?date=${today}&biddingArea=SE3`),
    ]);
    if (pr.status !== "fulfilled") throw pr.reason;
    const by = {};
    (pr.value.Data || []).forEach((s) => { by[s.id ?? s.name] = new Map((s.data || []).filter((p) => p.y != null).map((p) => [p.x, p.y])); });
    const xs = [...new Set(Object.values(by).flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
    const rows = xs.map((x) => {
      const r = { x };
      MIX.forEach((m) => (r[m.key] = by[m.id] ? by[m.id].get(x) : undefined));
      r.prod = by["1"] ? by["1"].get(x) : undefined;
      r.cons = by["7"] ? by["7"].get(x) : undefined;
      r.net = by["8"] ? by["8"].get(x) : undefined;
      if (r.prod == null) { const parts = MIX.map((m) => r[m.key]).filter((v) => v != null); if (parts.length) r.prod = d3.sum(parts); }
      return r;
    }).filter((r) => r.prod > 0);
    if (!rows.length) throw new Error("no production data yet today");
    const keys = MIX.filter((m) => by[m.id] && rows.some((r) => r[m.key] > 0));
    let se3 = null;
    if (si.status === "fulfilled" && si.value && si.value.Data) {
      const pl = si.value.Data.find((d) => d.id === "planned"), re = si.value.Data.find((d) => d.id === "result");
      const lr = re && last((re.data || []).filter((p) => p.y != null));
      if (lr) { const pp = pl && (pl.data || []).find((p) => p.x === lr.x); se3 = { x: lr.x, actual: lr.y, planned: pp ? pp.y : null }; }
    }
    return { rows, keys, se3, updated: pr.value.LastUpdated };
  }
  function latestMix(d) { return last(d.rows); }

  function renderPowerKpi() {
    if (!S.svk.data) { kpiMissing("#k-power", "Sweden: production", "svk", "Svenska kraftnät unavailable"); return; }
    const d = S.svk.data, L = latestMix(d);
    const cons = L.cons, net = L.net != null ? L.net : (cons != null ? L.prod - cons : null);
    const el = kpi("#k-power", {
      label: "Sweden: production", pill: '<span class="pill">national</span>',
      value: `${fmt(L.prod / 1000, 1)}<small>GW</small>`,
      delta: net == null ? "" : net < 0 ? `Importing ${fmt(-net / 1000, 1)} GW` : `Exporting ${fmt(net / 1000, 1)} GW`,
      cls: "flat",
      meta: [cons != null ? `Consumption ${fmt(cons / 1000, 1)} GW` : "", `As of ${fmtTime(L.x)}`].filter(Boolean), spark: 1,
    });
    spark(el, d.rows.map((r) => ({ x: r.x, y: r.prod })));
  }
  function renderNow() {
    const el = $("#b-now");
    setSrc("src-now", "svk", 'Source: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room', S.svk.data ? "as of " + fmtTime(latestMix(S.svk.data).x) : "");
    if (loadingOrError(el, "svk", "the power data")) return;
    const d = S.svk.data, L = latestMix(d), cons = L.cons;
    const net = L.net != null ? L.net : (cons != null ? L.prod - cons : null);
    const parts = d.keys.map((m) => ({ m, v: Math.max(0, L[m.key] || 0) })).filter((p) => p.v > 0);
    const tot = d3.sum(parts, (p) => p.v) || 1;
    el.innerHTML = `<div class="bignums"><div class="bn"><div class="t">Production</div><div class="v">${fmt(L.prod)}<small>MW</small></div></div><div class="bn"><div class="t">Consumption</div><div class="v">${cons != null ? fmt(cons) : "–"}<small>MW</small></div></div></div>
      <p class="badge-row">${net == null ? "" : net < 0 ? `<span class="pill warn">Importing ${fmt(-net)} MW</span>` : `<span class="pill good">Exporting ${fmt(net)} MW</span>`} <span style="color:var(--muted);font-size:12.5px">${net == null ? "" : net < 0 ? "Sweden uses more than it produces right now." : "Sweden produces more than it uses right now."}</span></p>
      <div class="donut-row"><div class="donut" id="donut" role="img" aria-label="Share of production by source"></div><ul>${parts.map((p) => `<li><i style="background:var(${p.m.col})"></i><span class="n">${p.m.name}</span><span class="v">${fmt(p.v)} MW · ${fmt((p.v / tot) * 100)} %</span></li>`).join("")}</ul></div>`;
    const dn = $("#donut"), size = 150, r = size / 2;
    const svg = d3.select(dn).append("svg").attr("viewBox", `0 0 ${size} ${size}`);
    const arc = d3.arc().innerRadius(r * 0.62).outerRadius(r - 2).padAngle(0.015).cornerRadius(2);
    const g = svg.append("g").attr("transform", `translate(${r},${r})`);
    g.selectAll("path").data(d3.pie().sort(null).value((p) => p.v)(parts)).join("path").attr("d", arc).attr("fill", (a) => css(a.data.m.col))
      .on("pointermove", (e, a) => tip(e, `<b>${a.data.m.name}</b><br>${fmt(a.data.v)} MW · ${fmt((a.data.v / tot) * 100)} %`)).on("pointerleave", hideTip);
    g.append("text").attr("text-anchor", "middle").attr("y", -2).style("font", "700 20px var(--sans)").style("fill", css("--text")).text(fmt(L.prod / 1000, 1));
    g.append("text").attr("text-anchor", "middle").attr("y", 14).text("GW");
  }
  function renderMix() {
    const el = $("#c-mix"), lg = $("#l-mix");
    setSrc("src-mix", "svk", 'Source: <a href="https://www.svk.se/om-kraftsystemet/kontrollrummet/" rel="noopener">Svenska kraftnät</a> control room, 15 minute values, Sweden-wide; "solar and other" is Svenska kraftnät\'s unspecified category', S.svk.data ? "updated " + fmtTime(S.svk.data.updated || latestMix(S.svk.data).x) : "");
    if (loadingOrError(el, "svk", "the power mix")) { lg.innerHTML = ""; $("#se3").innerHTML = ""; return; }
    const d = S.svk.data, rows = d.rows, keys = d.keys;
    lg.innerHTML = keys.map((m) => `<span><i style="background:var(${m.col})"></i>${m.name}</span>`).join("") + (rows.some((r) => r.cons != null) ? '<span><i style="background:transparent;border-top:2px dashed var(--text);height:0;width:14px;border-radius:0;vertical-align:3px"></i>Consumption</span>' : "");
    const mob = (el.clientWidth || 300) < 480;
    const { svg, w, h } = mk(el, mob ? 250 : 290);
    const ml = 44, mr = 10, top = 8, bot = 24;
    const x0 = rows[0].x, x = d3.scaleLinear([x0, x0 + 24 * 3600e3], [ml, w - mr]);
    const stack = d3.stack().keys(keys.map((m) => m.key)).value((r, k) => r[k] || 0)(rows);
    const ymax = Math.max(d3.max(stack[stack.length - 1], (p) => p[1]), d3.max(rows, (r) => r.cons || 0)) * 1.05;
    const y = d3.scaleLinear([0, ymax], [h - bot, top]).nice(5);
    svg.append("g").selectAll("line").data(y.ticks(5)).join("line").attr("x1", ml).attr("x2", w - mr).attr("y1", y).attr("y2", y).attr("stroke", css("--grid"));
    svg.append("g").attr("class", "axis").attr("transform", `translate(${ml},0)`).call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(6).tickFormat((v) => fmt(v / 1000) + " GW")).select(".domain").remove();
    const ticks = sthTicks(x0, x0 + 24 * 3600e3, mob ? 6 : 3);
    svg.append("g").selectAll("text").data(ticks).join("text").attr("x", x).attr("y", h - 6).attr("text-anchor", "middle").text(hourLbl);
    svg.append("g").selectAll("path").data(stack).join("path").attr("fill", (s, i) => css(keys[i].col)).attr("opacity", 0.92)
      .attr("d", d3.area().x((p) => x(p.data.x)).y0((p) => y(p[0])).y1((p) => y(p[1])).curve(d3.curveMonotoneX));
    const cr = rows.filter((r) => r.cons != null);
    if (cr.length > 1) svg.append("path").datum(cr).attr("fill", "none").attr("stroke", css("--text")).attr("stroke-width", 1.8).attr("stroke-dasharray", "5 3").attr("d", d3.line().x((r) => x(r.x)).y((r) => y(r.cons)).curve(d3.curveMonotoneX));
    const now = Date.now();
    if (now >= x0 && now <= x0 + 24 * 3600e3) svg.append("line").attr("class", "nowline").attr("x1", x(now)).attr("x2", x(now)).attr("y1", top).attr("y2", h - bot);
    const cross = svg.append("line").attr("class", "cross").attr("y1", top).attr("y2", h - bot).style("display", "none");
    const bis = d3.bisector((r) => r.x).center;
    const onMove = (e) => {
      const [mx] = d3.pointer(e, svg.node()); const r = rows[bis(rows, x.invert(mx))]; if (!r) return;
      cross.attr("x1", x(r.x)).attr("x2", x(r.x)).style("display", null);
      tip(e, `<b>${fmtTime(r.x)}</b><br>` + keys.map((m) => `${m.name}: ${fmt(r[m.key] || 0)} MW`).join("<br>") + `<br><b>Production ${fmt(r.prod)} MW</b>` + (r.cons != null ? `<br>Consumption ${fmt(r.cons)} MW` : ""));
    };
    svg.append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", h - bot - top).attr("fill", "transparent").style("touch-action", "pan-y")
      .on("pointermove", onMove).on("pointerdown", onMove).on("pointerleave", () => { cross.style("display", "none"); hideTip(); });
    svg.attr("role", "img").attr("aria-label", "Stacked area chart of today's Swedish electricity production by source with consumption line.");
    const s3 = d.se3;
    $("#se3").innerHTML = s3 ? `Göteborg's bidding area (SE3), ${fmtTime(s3.x)}: consumption <b>${fmt(s3.actual)} MW</b>${s3.planned != null ? ` against ${fmt(s3.planned)} MW planned` : ""}.` : "";
  }

  /* ====================================================================
     4. Electricity price SE3 (elprisetjustnu.se)
     ==================================================================== */
  async function loadPrice() {
    const today = dayKey(Date.now()), tom = addDays(today, 1);
    const url = (k) => `https://www.elprisetjustnu.se/api/v1/prices/${k.slice(0, 4)}/${k.slice(5)}_SE3.json`;
    const conv = (a) => (Array.isArray(a) ? a.map((r) => ({ t0: Date.parse(r.time_start), t1: Date.parse(r.time_end), p: r.SEK_per_kWh * 100 })).filter((r) => isFinite(r.t0) && isFinite(r.p)).sort((a, b) => a.t0 - b.t0) : []);
    const td = conv(await SL.fetchJSON(url(today)));
    if (!td.length) throw new Error("no prices published");
    let tm = [];
    if (sthHour(Date.now()) >= 12 || dayKey(Date.now()) !== today) {
      try { tm = conv(await SL.fetchJSON(url(tom), { timeout: 8000 })); } catch (e) { tm = []; /* not published yet: expected */ }
    }
    return { today: td, tomorrow: tm, todayKey: today };
  }
  function dayStats(slots) {
    const hours = new Map();
    slots.forEach((s) => { const k = Math.floor(s.t0 / 3600e3); if (!hours.has(k)) hours.set(k, []); hours.get(k).push(s.p); });
    const hr = [...hours].map(([k, v]) => ({ k, t: k * 3600e3, avg: d3.mean(v) }));
    const cheap = d3.least(hr, (h) => h.avg), dear = d3.greatest(hr, (h) => h.avg);
    return { avg: d3.mean(slots, (s) => s.p), cheap, dear, hr };
  }
  const nowSlot = (slots) => slots.find((s) => s.t0 <= Date.now() && Date.now() < s.t1);
  const ore = (v) => fmt(v, Math.abs(v) < 10 ? 1 : 0);

  function renderPriceKpi() {
    if (!S.price.data) { kpiMissing("#k-price", "Electricity now, SE3", "price", "Price source unavailable"); return; }
    const sl = S.price.data.today, cur = nowSlot(sl) || last(sl), st = dayStats(sl);
    const diff = (cur.p - st.avg) / Math.max(1, Math.abs(st.avg)) * 100;
    const el = kpi("#k-price", {
      label: "Electricity now", pill: '<span class="pill">SE3</span>',
      value: `${ore(cur.p)}<small>öre/kWh</small>`,
      delta: Math.abs(diff) < 3 ? "About today's average" : `${fmt(Math.abs(diff))} % ${diff > 0 ? "above" : "below"} today's average`,
      cls: Math.abs(diff) < 3 ? "flat" : diff > 0 ? "up-bad" : "down-good",
      meta: [`Cheapest ${hourLbl(st.cheap.t)}–${hourLbl(st.cheap.t + 3600e3)}: ${ore(st.cheap.avg)} öre`, `Spot price, before grid fees and taxes`], spark: 1,
    });
    spark(el, sl.map((s) => ({ x: s.t0, y: s.p })));
  }
  function renderPrice() {
    const el = $("#c-price"), chips = $("#chips-price");
    setSrc("src-price", "price", 'Source: <a href="https://www.elprisetjustnu.se/" rel="noopener">elprisetjustnu.se</a>, a community service built on Nord Pool day-ahead data (not a government source). Prices exclude grid fees and taxes');
    const tmBtn = document.querySelector('[data-day="tomorrow"]');
    const hasTm = !!(S.price.data && S.price.data.tomorrow.length);
    tmBtn.hidden = !hasTm;
    if (!hasTm && UI.priceDay === "tomorrow") setDay("today");
    if (loadingOrError(el, "price", "prices")) { chips.innerHTML = ""; return; }
    const isTm = UI.priceDay === "tomorrow" && hasTm;
    const sl = isTm ? S.price.data.tomorrow : S.price.data.today, st = dayStats(sl);
    const mob = (el.clientWidth || 300) < 480;
    const { svg, w, h } = mk(el, mob ? 220 : 250);
    const ml = 40, mr = 8, top = 24, bot = 24;
    const t0 = sl[0].t0, t1 = last(sl).t1;
    const x = d3.scaleLinear([t0, t1], [ml, w - mr]);
    const pmin = Math.min(0, d3.min(sl, (s) => s.p)), pmax = d3.max(sl, (s) => s.p) * 1.08 || 1;
    const y = d3.scaleLinear([pmin, pmax], [h - bot, top]).nice(4);
    svg.append("g").selectAll("line").data(y.ticks(4)).join("line").attr("x1", ml).attr("x2", w - mr).attr("y1", y).attr("y2", y).attr("stroke", css("--grid"));
    svg.append("g").attr("class", "axis").attr("transform", `translate(${ml},0)`).call(d3.axisLeft(y).ticks(4).tickSize(0).tickPadding(6).tickFormat((v) => fmt(v))).select(".domain").remove();
    svg.append("text").attr("x", 2).attr("y", top - 12).text("öre/kWh");
    const ticks = sthTicks(t0, t1, mob ? 6 : 3);
    svg.append("g").selectAll("text").data(ticks).join("text").attr("x", x).attr("y", h - 6).attr("text-anchor", "middle").text(hourLbl);
    const cheapK = st.cheap.k, dearK = st.dear.k, now = Date.now();
    svg.append("g").selectAll("rect").data(sl).join("rect")
      .attr("x", (s) => x(s.t0) + 0.25).attr("width", (s) => Math.max(1, x(s.t1) - x(s.t0) - 0.5))
      .attr("y", (s) => (s.p >= 0 ? y(s.p) : y(0))).attr("height", (s) => Math.max(1, Math.abs(y(s.p) - y(0))))
      .attr("fill", (s) => { const k = Math.floor(s.t0 / 3600e3); return k === cheapK ? css("--good") : k === dearK ? css("--bad") : css("--c1"); })
      .attr("opacity", (s) => (!isTm && s.t1 <= now ? 0.45 : 0.95))
      .on("pointermove", (e, s) => tip(e, `<b>${fmtTime(s.t0)}–${fmtTime(s.t1)}</b><br>${ore(s.p)} öre/kWh<br>${fmt(s.p / 100, 3)} SEK/kWh`)).on("pointerdown", (e, s) => tip(e, `<b>${fmtTime(s.t0)}–${fmtTime(s.t1)}</b><br>${ore(s.p)} öre/kWh`)).on("pointerleave", hideTip);
    if (!isTm && now >= t0 && now <= t1) {
      svg.append("line").attr("class", "nowline").attr("x1", x(now)).attr("x2", x(now)).attr("y1", top).attr("y2", h - bot).style("pointer-events", "none");
      svg.append("text").attr("class", "nowtxt").attr("x", Math.min(w - 26, x(now) + 4)).attr("y", top - 12).text("now");
    }
    svg.attr("role", "img").attr("aria-label", `Electricity spot price for ${isTm ? "tomorrow" : "today"}, from ${ore(d3.min(sl, (s) => s.p))} to ${ore(d3.max(sl, (s) => s.p))} öre per kWh.`);
    const cur = !isTm ? nowSlot(sl) : null;
    chips.innerHTML = `${cur ? `<div class="chip">Now<b>${ore(cur.p)} öre</b></div>` : ""}<div class="chip good">Cheapest hour ${hourLbl(st.cheap.t)}–${hourLbl(st.cheap.t + 3600e3)}<b>${ore(st.cheap.avg)} öre</b></div><div class="chip bad">Priciest hour ${hourLbl(st.dear.t)}–${hourLbl(st.dear.t + 3600e3)}<b>${ore(st.dear.avg)} öre</b></div><div class="chip">Day average<b>${ore(st.avg)} öre</b></div>`;
  }
  function setDay(d) {
    UI.priceDay = d;
    document.querySelectorAll("[data-day]").forEach((b) => { const on = b.dataset.day === d; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    if (S.price.data) renderPrice();
  }

  /* ====================================================================
     5. Polisen events
     ==================================================================== */
  function parseEvent(e) {
    const m = /^(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2}):(\d{2}) ([+-]\d{2}:\d{2})$/.exec(e.datetime || "");
    if (!m) return null;
    const t = Date.parse(`${m[1]}T${f2(m[2])}:${m[3]}:${m[4]}${m[5]}`);
    if (!isFinite(t)) return null;
    const parts = String(e.name || "").split(", ");
    const place = parts.length > 1 ? parts[parts.length - 1] : (e.location && e.location.name) || "";
    return { id: e.id, t, type: e.type || "Övrigt", place, when: parts[0] || "", summary: e.summary || "", url: e.url ? "https://polisen.se" + e.url : "https://polisen.se/aktuellt/handelser/" };
  }
  async function loadPolice() {
    const raw = await SL.fetchJSON("https://polisen.se/api/events?locationname=G%C3%B6teborg", { timeout: 20000 });
    if (!Array.isArray(raw)) throw new Error("unexpected response");
    return raw.map(parseEvent).filter(Boolean).sort((a, b) => b.t - a.t);
  }
  // The API's location.name is the county for every row; the real place is the last part of the event title.
  const isGbg = (e) => e.place === "Göteborg";
  const inArea = (e) => UI.area === "vg" || isGbg(e);

  function renderPoliceKpi() {
    if (!S.police.data) { kpiMissing("#k-police", "Police events today", "police", "Polisen unavailable"); return; }
    const ev = S.police.data.filter(isGbg), now = Date.now(), today = dayKey(now);
    const td = ev.filter((e) => dayKey(e.t) === today).length;
    const wk = ev.filter((e) => now - e.t <= 7 * 864e5).length;
    const h24 = ev.filter((e) => now - e.t <= 864e5).length;
    kpi("#k-police", { label: "Police events today", pill: '<span class="pill">Göteborg</span>', value: `${fmt(td)}`, delta: ev[0] ? `Latest: ${esc(ev[0].type)}, ${fmtTime(ev[0].t)}` : "No events yet", meta: [`Last 24 h: ${fmt(h24)}`, `Last 7 days: ${fmt(wk)}`] });
  }
  function renderFeed() {
    const el = $("#feed");
    setSrc("src-feed", "police", 'Source: <a href="https://polisen.se/aktuellt/polisens-api/" rel="noopener">Polisen</a> events API. Swedish text is unchanged; positions are not shown because the police only give approximate, county-wide coordinates', S.police.data ? "fetched " + fmtTime(S.police.ts) : "");
    if (!S.police.data) { el.innerHTML = `<li class="${S.police.err ? "error" : "loading"}">${S.police.err ? "Couldn't load police events (" + esc(S.police.err) + "). Retrying automatically." : "Loading"}</li>`; return; }
    const ev = S.police.data.filter(inArea);
    $("#sub-feed").textContent = UI.area === "vg" ? "Latest reports for Göteborg and the rest of Västra Götaland." : "Latest reports for Göteborg, newest first.";
    if (!ev.length) { el.innerHTML = '<li class="empty">No events published.</li>'; return; }
    el.innerHTML = ev.slice(0, 60).map((e) => `<li><div class="fh"><span class="when">${esc(e.when)}</span><span class="pill accent">${esc(e.type)}</span>${UI.area === "vg" ? `<span class="pill">${esc(e.place)}</span>` : ""}</div><div class="ft">${esc(e.summary || "No summary.")}</div><a href="${esc(e.url)}" rel="noopener" target="_blank">Read on polisen.se</a></li>`).join("");
  }
  function renderTypes() {
    const el = $("#c-types");
    if (!S.police.data) { el.innerHTML = S.police.err ? `<div class="error">Couldn't load police events (${esc(S.police.err)}).</div>` : '<div class="loading">Loading</div>'; return; }
    const now = Date.now(), win = UI.win * 3600e3;
    const ev = S.police.data.filter((e) => inArea(e) && now - e.t <= win && !/^Sammanfattning/.test(e.type));
    const lbl = UI.win === 24 ? "last 24 hours" : "last 7 days";
    $("#sub-types").textContent = `${fmt(ev.length)} ${ev.length === 1 ? "event" : "events"} in the ${lbl}, ${UI.area === "vg" ? "Göteborg and Västra Götaland" : "Göteborg"} (daily summaries excluded).`;
    if (!ev.length) { el.innerHTML = '<div class="empty">No events in this period.</div>'; return; }
    let counts = d3.rollups(ev, (v) => v.length, (e) => e.type).sort((a, b) => b[1] - a[1]);
    if (counts.length > 9) { const rest = d3.sum(counts.slice(8), (c) => c[1]); counts = counts.slice(0, 8).concat([["Other types", rest]]); }
    const mob = (el.clientWidth || 300) < 400;
    const rowH = 26, ml = mob ? 108 : 138, mr = 30;
    const { svg, w, h } = mk(el, counts.length * rowH + 6);
    const x = d3.scaleLinear([0, d3.max(counts, (c) => c[1])], [0, w - ml - mr]);
    const g = svg.selectAll("g").data(counts).join("g").attr("transform", (c, i) => `translate(0,${i * rowH + 3})`);
    const clip = (s) => (s.length > (mob ? 17 : 22) ? s.slice(0, mob ? 16 : 21) + "…" : s);
    g.append("text").attr("x", ml - 8).attr("y", rowH / 2).attr("dy", "0.32em").attr("text-anchor", "end").style("fill", css("--text")).text((c) => clip(c[0])).append("title").text((c) => c[0]);
    g.append("rect").attr("x", ml).attr("y", 3).attr("height", rowH - 8).attr("rx", 3).attr("width", (c) => Math.max(2, x(c[1]))).attr("fill", (c) => (c[0] === "Other types" ? css("--c8") : css("--accent")))
      .on("pointermove", (e, c) => tip(e, `<b>${esc(c[0])}</b><br>${fmt(c[1])} events`)).on("pointerleave", hideTip);
    g.append("text").attr("x", (c) => ml + Math.max(2, x(c[1])) + 5).attr("y", rowH / 2).attr("dy", "0.32em").text((c) => fmt(c[1]));
    svg.attr("role", "img").attr("aria-label", `Police events by type, ${lbl}: ` + counts.map((c) => `${c[0]} ${c[1]}`).join(", "));
  }

  /* ====================================================================
     orchestration
     ==================================================================== */
  function renderAll(k) {
    const all = !k;
    if (all || k === "obs") renderObsKpis();
    if (all || k === "fc") renderForecast();
    if (all || k === "svk") { renderPowerKpi(); renderNow(); renderMix(); }
    if (all || k === "price") { renderPriceKpi(); renderPrice(); }
    if (all || k === "police") { renderPoliceKpi(); renderFeed(); renderTypes(); }
  }
  function updateStatus() {
    const keys = Object.keys(S), el = $("#status");
    const failing = keys.filter((k) => S[k].err), lastTs = Math.max(0, ...keys.map((k) => S[k].ts || 0));
    const names = failing.map((k) => SOURCES[k].name).join(", ");
    if (!lastTs && !failing.length) setStatus(el, "stale", "Loading live data…");
    else if (failing.length === keys.length) setStatus(el, "err", `Offline · no source could be loaded (${esc(names)}); retrying`);
    else if (failing.length) setStatus(el, "stale", `Partly live · updated ${fmtTime(lastTs)} · problem with ${esc(names)}`);
    else setStatus(el, "ok", `Live · updated ${fmtTime(lastTs)}`);
  }
  async function run(k) {
    const st = S[k]; if (st.busy) return; st.busy = true;
    try { st.data = await SOURCES[k].load(); st.ts = Date.now(); st.err = null; }
    catch (e) { st.err = (e && e.message) || String(e); }
    st.busy = false;
    try { renderAll(k); } catch (e) { console.error(e); }
    updateStatus();
  }
  function tick() {
    if (document.visibilityState === "hidden") return;
    const now = Date.now();
    Object.keys(SOURCES).forEach((k) => {
      const st = S[k], every = SOURCES[k].every * 60000;
      // after a failure retry sooner (1 minute), otherwise follow the schedule
      const due = st.err ? now - (st.tried || 0) >= 60000 : now - (st.tried || 0) >= every;
      if (due && !st.busy) { st.tried = now; run(k); }
    });
  }

  /* controls */
  document.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => setDay(b.dataset.day)));
  const seg = (sel, key, attr, fn) => document.querySelectorAll(sel).forEach((b) => b.addEventListener("click", () => {
    UI[key] = fn(b.dataset[attr]);
    document.querySelectorAll(sel).forEach((o) => { const on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", on); });
    renderFeed(); renderTypes();
  }));
  seg("[data-area]", "area", "area", (v) => v);
  seg("[data-win]", "win", "win", (v) => +v);

  /* redraw on resize / theme; start */
  const redraw = () => { try { renderAll(); } catch (e) { console.error(e); } };
  SL.onResize(redraw); SL.onTheme(redraw);
  document.addEventListener("visibilitychange", tick);
  renderAll();
  tick();
  setInterval(tick, 15000);
})();
