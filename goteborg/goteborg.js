/* Göteborg live: everything is fetched in the browser, nothing is stored or proxied. */
(function () {
  "use strict";
  const { fmt, esc, css, fmtTime, setStatus, tip, hideTip } = SL;
  SL.initLang();
  const tx = SL.translator(window.GBG_TEXT);
  const $ = (s) => document.querySelector(s);
  const TZ = "Europe/Stockholm";

  /* ---------- time helpers (always Europe/Stockholm) ---------- */
  const f2 = (n) => String(n).padStart(2, "0");
  const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const hourFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" });
  const LOC = { en: "en-GB", sv: "sv-SE" };
  const wdFmts = {}, wdDayFmts = {};
  Object.keys(LOC).forEach((l) => {
    wdFmts[l] = new Intl.DateTimeFormat(LOC[l], { timeZone: TZ, weekday: "short" });
    wdDayFmts[l] = new Intl.DateTimeFormat(LOC[l], { timeZone: TZ, weekday: "short", day: "numeric" });
  });
  const wdFmt = { format: (t) => wdFmts[SL.lang()].format(t) };
  const wdDayFmt = { format: (t) => wdDayFmts[SL.lang()].format(t) };
  const dayKey = (t) => dayFmt.format(t);
  const sthHour = (t) => parseInt(hourFmt.format(t), 10) % 24;
  const addDays = (key, n) => { const d = new Date(key + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  function sthTicks(t0, t1, step) {
    const out = [];
    for (let t = Math.ceil(t0 / 3600e3) * 3600e3; t <= t1; t += 3600e3) if (sthHour(t) % step === 0) out.push(t);
    return out;
  }
  const hourLbl = (t) => f2(sthHour(t));
  // "today at 14:32", "yesterday at 14:32" or "Sat 17 at 14:32", in the chosen language.
  function whenLbl(t) {
    const k = dayKey(t), today = dayKey(Date.now()), h = fmtTime(t);
    if (k === today) return tx("when_today", { h });
    if (k === addDays(today, -1)) return tx("when_yesterday", { h });
    if (k === addDays(today, 1)) return tx("when_tomorrow", { h });
    return tx("when_day", { d: wdDayFmt.format(t), h });
  }

  /* ---------- app state: one record per source ---------- */
  const SOURCES = {
    obs: { name: "srcNameObs", every: 5, load: loadObs },
    fc: { name: "srcNameFc", every: 60, load: loadForecast },
    svk: { name: "srcNameSvk", every: 5, load: loadSvk },
    price: { name: "srcNamePrice", every: 15, load: loadPrice },
    police: { name: "srcNamePolice", every: 2, load: loadPolice },
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
    svg.attr("role", "img").attr("aria-label", tx("sparkLbl"));
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
    el.innerHTML = S[k].err ? `<div class="error">${esc(tx("errLoad", { what: tx(what), e: S[k].err }))}</div>` : `<div class="loading">${esc(tx("loading"))}</div>`;
    return true;
  }
  function setSrc(id, k, html, observed) {
    const el = $("#" + id); if (!el) return;
    let t = html + (observed ? ` · ${observed}` : "");
    if (S[k].err && S[k].data) t += ` · <span style="color:var(--warn)">${esc(tx("refreshFailed", { t: fmtTime(S[k].ts) }))}</span>`;
    else if (S[k].err) t += ` · <span style="color:var(--bad)">${esc(tx("unavailableSrc"))}</span>`;
    el.innerHTML = t;
  }

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
    $(id).innerHTML = `<div class="label"><span>${label}</span></div><div class="value">–</div><div class="delta flat">${S[k].err ? esc(msg || tx("unavailable")) : esc(tx("loading"))}</div><div class="spark"></div><div class="meta"></div>`;
  }
  function renderObsKpis() {
    const d = S.obs.data;
    if (!d) { ["#k-temp", "#k-wind", "#k-rain"].forEach((id, i) => kpiMissing(id, tx(["kTemp", "kWind", "kRain"][i]), "obs", tx("obsDown"))); return; }
    const T = last(d.temp), W = last(d.wind), H = last(d.hum), P = last(d.pres), R = last(d.rain);
    const old = Date.now() - T.x > 3 * 3600e3;
    const fl = feelsLike(T.y, W && W.y);
    const range = d.temp.length > 1 ? tx("range24", { a: fmt(d3.min(d.temp, (p) => p.y), 1), b: fmt(d3.max(d.temp, (p) => p.y), 1) }) : "";
    const sp = kpi("#k-temp", {
      label: tx("kTemp"), pill: '<span class="pill">Göteborg A</span>',
      value: `${fmt(T.y, 1)}<small>°C</small>`,
      delta: fl != null ? tx("feels", { v: fmt(fl, 1) }) : (H ? tx("humidity", { v: fmt(H.y) }) : ""),
      meta: [range, `${H ? tx("humidity", { v: fmt(H.y) }) : ""}${H && P ? " · " : ""}${P ? fmt(P.y) + " hPa" : ""}`, tx(old ? "stale" : "observed", { t: fmtTime(T.x) })].filter(Boolean), spark: 1,
    });
    spark(sp, d.temp);
    if (W) {
      const sw = kpi("#k-wind", { label: tx("kWind"), value: `${fmt(W.y, 1)}<small>m/s</small>`, delta: windWord(W.y), meta: [tx("windMax", { v: fmt(d3.max(d.wind, (p) => p.y), 1) }), tx("observed", { t: fmtTime(W.x) })], spark: 1 });
      spark(sw, d.wind);
    } else kpiMissing("#k-wind", tx("kWind"), "obs", tx("noWind"));
    if (R) {
      const total = d3.sum(d.rain, (p) => p.y);
      const sr = kpi("#k-rain", { label: tx("kRain"), value: `${fmt(R.y, 1)}<small>mm</small>`, delta: tx(R.y > 0 ? "raining" : "dry"), meta: [tx("rain24", { v: fmt(total, 1) }), tx("observed", { t: fmtTime(R.x) })], spark: 1 });
      spark(sr, d.rain, "bars");
    } else kpiMissing("#k-rain", tx("kRain"), "obs", tx("noRain"));
  }
  function windWord(v) {
    return tx("w" + (v < 0.5 ? 0 : v < 3.4 ? 1 : v < 8 ? 2 : v < 14 ? 3 : v < 21 ? 4 : 5));
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
  const SYM = { 1: "sun",  2: "partly",  3: "partly",  4: "partly",  5: "cloud",  6: "cloud",  7: "fog",  8: "showers",  9: "showers",  10: "rain",  11: "thunder",  12: "sleet",  13: "sleet",  14: "sleet",  15: "sleet",  16: "snow",  17: "snow",  18: "rain",  19: "rain",  20: "rain",  21: "thunder",  22: "sleet",  23: "sleet",  24: "sleet",  25: "snow",  26: "snow",  27: "snow" };
  const symName = (c) => (c != null && (window.GBG_SYM[SL.lang()] || window.GBG_SYM.en)[c]) || "";
  /* weather glyphs: 24px line icons, studio-hub style (stroke 1.5, round caps) */
  const WX_PATH = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    partly: '<path d="M8.5 3.5v1.3M3.9 5.4l.9.9M2.5 10h1.3M12.2 6.3l.9-.9"/><path d="M5.6 11.3a3.4 3.4 0 0 1 6.5-1.6"/><path d="M8 20h9.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 20z"/>',
    cloud: '<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.6A3.2 3.2 0 0 0 7 19z"/>',
    fog: '<path d="M7 13h10.5a3.5 3.5 0 0 0 .3-7 5.5 5.5 0 0 0-10.5 1.5A2.8 2.8 0 0 0 7 13z"/><path d="M4 16.5h16M6 20h12"/>',
    showers: '<path d="M8.5 3.5v1.2M4.3 5.3l.8.8M3 9.5h1.2"/><path d="M5.8 10.6a3.2 3.2 0 0 1 5.9-1.4"/><path d="M8 16.5h9.5a3.3 3.3 0 0 0 .4-6.6 4.8 4.8 0 0 0-9.2 1.2A2.7 2.7 0 0 0 8 16.5z"/><path d="M10 19.5l-.8 1.6M14 19.5l-.8 1.6"/>',
    rain: '<path d="M7 14.5h10.5a3.8 3.8 0 0 0 .4-7.6 5.8 5.8 0 0 0-11 1.5A3 3 0 0 0 7 14.5z"/><path d="M8.5 17.5l-1 2M12.5 17.5l-1 2M16.5 17.5l-1 2"/>',
    thunder: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .4-7.6 5.8 5.8 0 0 0-11 1.5A3 3 0 0 0 7 14z"/><path d="M12.5 14.5 10.5 18h3l-2 3.5"/>',
    sleet: '<path d="M7 14h10.5a3.8 3.8 0 0 0 .4-7.6 5.8 5.8 0 0 0-11 1.5A3 3 0 0 0 7 14z"/><path d="M8.5 17l-.8 1.6M15.5 17l-.8 1.6"/><circle cx="12" cy="19" r=".6" fill="currentColor"/>',
    snow: '<path d="M7 13.5h10.5a3.8 3.8 0 0 0 .4-7.6 5.8 5.8 0 0 0-11 1.5A3 3 0 0 0 7 13.5z"/><path d="M8.5 17.5v3M7.2 19h2.6M15.5 17.5v3M14.2 19h2.6M12 18.5v2"/>',
  };
  const wxIcon = (k) => (WX_PATH[k] ? `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${WX_PATH[k]}</g></svg>` : "");

  function renderForecast() {
    const el = $("#c-fc"), strip = $("#d-fc");
    setSrc("src-fc", "fc", tx("srcFc"), S.fc.data ? tx("modelRun", { t: fmtTime(S.fc.data.created) }) : "");
    if (loadingOrError(el, "fc", "whatFc")) { strip.innerHTML = ""; $("#a-fc").innerHTML = ""; return; }
    const all = S.fc.data.rows, now = Date.now();
    const rows = fcRows(now);
    if (rows.length < 3) { el.innerHTML = `<div class="empty">${esc(tx("fcEmpty"))}</div>`; $("#a-fc").innerHTML = ""; }
    else { drawForecast(el, rows, now); $("#a-fc").innerHTML = forecastAnswer(rows, now); }
    renderDays(all, now, strip);
  }
  const fcRows = (now) => S.fc.data.rows.filter((r) => r.t >= now - 3600e3 && r.t <= now + 48 * 3600e3 && isFinite(r.temp));
  function forecastAnswer(rows, now) {
    const lo = Math.round(d3.min(rows, (r) => r.temp)), hi = Math.round(d3.max(rows, (r) => r.temp));
    const ahead = rows.filter((r) => r.t > now), wet = ahead.filter((r) => r.rain >= 0.1), mm = fmt(d3.sum(wet, (r) => r.rain), 1);
    const temp = lo === hi ? tx("fcAnsFlat", { lo: fmt(lo) }) : tx("fcAnsRange", { lo: fmt(lo), hi: fmt(hi) });
    const rain = !wet.length ? tx("fcAnsDry") : wet[0].s0 <= now ? tx("fcAnsNow", { mm }) : tx("fcAnsFrom", { when: whenLbl(wet[0].s0), mm });
    return `${temp} ${rain}`;
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
      const s = symName(r.sym);
      tip(e, `<b>${wdFmt.format(r.t)} ${hourLbl(r.t)}:00</b>${s ? " · " + s : ""}<br>${fmt(r.temp, 1)} °C · ${tx("tipRain")} ${fmt(r.rain || 0, 1)} mm${r.pop != null ? " (" + fmt(r.pop) + " %)" : ""}<br>${tx("tipWind")} ${fmt(r.wind, 1)} m/s${r.gust != null ? ", " + tx("tipGusts") + " " + fmt(r.gust, 1) : ""}`);
    };
    svg.append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", wTop + H2 - top).attr("fill", "transparent").style("touch-action", "pan-y")
      .on("pointermove", onMove).on("pointerdown", onMove).on("pointerleave", () => { cross.style("display", "none"); hideTip(); });
    svg.attr("role", "img").attr("aria-label", tx("fcAria", { lo: fmt(tmin, 0), hi: fmt(tmax, 0), rain: fmt(d3.max(rain), 1), wind: fmt(d3.max(rows, (r) => r.wind), 0) }));
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
      const nm = symName(noon.sym);
      const lbl = k === today ? tx("dayStripToday") : wdDayFmt.format(new Date(k + "T12:00:00Z"));
      return `<div class="day" title="${esc(nm)}"><div class="dn">${esc(lbl)}</div><div class="di" aria-hidden="true">${wxIcon(SYM[noon.sym])}</div><div class="dt">${fmt(mx)}° <span>${fmt(mn)}°</span></div><div class="dp">${rn.length ? (sum >= 0.1 ? fmt(sum, 1) + " mm" : esc(tx("dryLc"))) : "&nbsp;"}</div><span class="sr-only">${esc(nm)}</span></div>`;
    }).join("");
  }

  /* ====================================================================
     3. Svenska kraftnät control room
     ==================================================================== */
  const MIX = [
    { id: "2", key: "nuclear", col: "--c4" },
    { id: "3", key: "hydro", col: "--c1" },
    { id: "5", key: "wind", col: "--c6" },
    { id: "4", key: "thermal", col: "--c5" },
    { id: "6", key: "other", col: "--c2" },
  ];
  const mixName = (m) => tx("mix_" + m.key);
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
    if (!S.svk.data) { kpiMissing("#k-power", tx("kPower"), "svk", tx("svkDown")); return; }
    const d = S.svk.data, L = latestMix(d);
    const cons = L.cons, net = L.net != null ? L.net : (cons != null ? L.prod - cons : null);
    const el = kpi("#k-power", {
      label: tx("kPower"), pill: `<span class="pill">${esc(tx("pillNational"))}</span>`,
      value: `${fmt(L.prod / 1000, 1)}<small>GW</small>`,
      delta: net == null ? "" : net < 0 ? tx("importGW", { v: fmt(-net / 1000, 1) }) : tx("exportGW", { v: fmt(net / 1000, 1) }),
      cls: "flat",
      meta: [cons != null ? tx("consGW", { v: fmt(cons / 1000, 1) }) : "", tx("asOf", { t: fmtTime(L.x) })].filter(Boolean), spark: 1,
    });
    spark(el, d.rows.map((r) => ({ x: r.x, y: r.prod })));
  }
  function renderNow() {
    const el = $("#b-now");
    setSrc("src-now", "svk", tx("srcNow"), S.svk.data ? tx("asOfSrc", { t: fmtTime(latestMix(S.svk.data).x) }) : "");
    if (loadingOrError(el, "svk", "whatPower")) { $("#a-now").innerHTML = ""; return; }
    const d = S.svk.data, L = latestMix(d), cons = L.cons;
    const net = L.net != null ? L.net : (cons != null ? L.prod - cons : null);
    const parts = d.keys.map((m) => ({ m, v: Math.max(0, L[m.key] || 0) })).filter((p) => p.v > 0);
    const tot = d3.sum(parts, (p) => p.v) || 1;
    $("#a-now").innerHTML = powerAnswer(parts, tot);
    el.innerHTML = `<div class="bignums"><div class="bn"><div class="t">${esc(tx("production"))}</div><div class="v">${fmt(L.prod)}<small>MW</small></div></div><div class="bn"><div class="t">${esc(tx("consumption"))}</div><div class="v">${cons != null ? fmt(cons) : "–"}<small>MW</small></div></div></div>
      <p class="badge-row">${net == null ? "" : net < 0 ? `<span class="pill warn">${esc(tx("importMW", { v: fmt(-net) }))}</span>` : `<span class="pill good">${esc(tx("exportMW", { v: fmt(net) }))}</span>`} <span style="color:var(--muted);font-size:12.5px">${net == null ? "" : esc(tx(net < 0 ? "importNote" : "exportNote"))}</span></p>
      <div class="donut-row"><div class="donut" id="donut" role="img" aria-label="${esc(tx("donutLbl"))}"></div><ul>${parts.map((p) => `<li><i style="background:var(${p.m.col})"></i><span class="n">${esc(mixName(p.m))}</span><span class="v">${fmt(p.v)} MW · ${fmt((p.v / tot) * 100)} %</span></li>`).join("")}</ul></div>`;
    const dn = $("#donut"), size = 150, r = size / 2;
    const svg = d3.select(dn).append("svg").attr("viewBox", `0 0 ${size} ${size}`);
    const arc = d3.arc().innerRadius(r * 0.62).outerRadius(r - 2).padAngle(0.015).cornerRadius(2);
    const g = svg.append("g").attr("transform", `translate(${r},${r})`);
    g.selectAll("path").data(d3.pie().sort(null).value((p) => p.v)(parts)).join("path").attr("d", arc).attr("fill", (a) => css(a.data.m.col))
      .on("pointermove", (e, a) => tip(e, `<b>${esc(mixName(a.data.m))}</b><br>${fmt(a.data.v)} MW · ${fmt((a.data.v / tot) * 100)} %`)).on("pointerleave", hideTip);
    g.append("text").attr("text-anchor", "middle").attr("y", -2).style("font", "700 20px var(--sans)").style("fill", css("--text")).text(fmt(L.prod / 1000, 1));
    g.append("text").attr("text-anchor", "middle").attr("y", 14).text("GW");
  }
  function powerAnswer(parts, tot) {
    const top = parts.slice().sort((a, b) => b.v - a.v).slice(0, 2), p = fmt((d3.sum(top, (x) => x.v) / tot) * 100);
    return top.length > 1 ? tx("nowAns", { a: mixName(top[0].m), b: mixName(top[1].m).toLowerCase(), p }) : top.length ? tx("nowAns1", { a: mixName(top[0].m), p }) : "";
  }
  function mixAnswer(rows, keys) {
    const sums = keys.map((m) => ({ m, v: d3.sum(rows, (r) => Math.max(0, r[m.key] || 0)) })), tot = d3.sum(sums, (x) => x.v);
    const top = d3.greatest(sums, (x) => x.v);
    return top && tot > 0 ? tx("mixAns", { a: mixName(top.m), p: fmt((top.v / tot) * 100) }) : "";
  }
  function renderMix() {
    const el = $("#c-mix"), lg = $("#l-mix");
    setSrc("src-mix", "svk", tx("srcMix"), S.svk.data ? tx("updatedSrc", { t: fmtTime(S.svk.data.updated || latestMix(S.svk.data).x) }) : "");
    if (loadingOrError(el, "svk", "whatMix")) { lg.innerHTML = ""; $("#se3").innerHTML = ""; $("#a-mix").innerHTML = ""; return; }
    const d = S.svk.data, rows = d.rows, keys = d.keys;
    $("#a-mix").innerHTML = mixAnswer(rows, keys);
    lg.innerHTML = keys.map((m) => `<span><i style="background:var(${m.col})"></i>${esc(mixName(m))}</span>`).join("") + (rows.some((r) => r.cons != null) ? '<span><i style="background:transparent;border-top:2px dashed var(--text);height:0;width:14px;border-radius:0;vertical-align:3px"></i>' + esc(tx("consumption")) + '</span>' : "");
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
      tip(e, `<b>${fmtTime(r.x)}</b><br>` + keys.map((m) => `${esc(mixName(m))}: ${fmt(r[m.key] || 0)} MW`).join("<br>") + `<br><b>${tx("tipProd", { v: fmt(r.prod) })}</b>` + (r.cons != null ? `<br>${tx("tipCons", { v: fmt(r.cons) })}` : ""));
    };
    svg.append("rect").attr("x", ml).attr("y", top).attr("width", w - ml - mr).attr("height", h - bot - top).attr("fill", "transparent").style("touch-action", "pan-y")
      .on("pointermove", onMove).on("pointerdown", onMove).on("pointerleave", () => { cross.style("display", "none"); hideTip(); });
    svg.attr("role", "img").attr("aria-label", tx("mixAria"));
    const s3 = d.se3;
    $("#se3").innerHTML = s3 ? tx("se3Line", { t: fmtTime(s3.x), a: fmt(s3.actual), plan: s3.planned != null ? tx("se3Plan", { p: fmt(s3.planned) }) : "" }) : "";
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
    if (!S.price.data) { kpiMissing("#k-price", tx("kPrice"), "price", tx("priceDown")); return; }
    const sl = S.price.data.today, cur = nowSlot(sl) || last(sl), st = dayStats(sl);
    const diff = (cur.p - st.avg) / Math.max(1, Math.abs(st.avg)) * 100;
    const el = kpi("#k-price", {
      label: tx("kPrice"), pill: '<span class="pill">SE3</span>',
      value: `${ore(cur.p)}<small>öre/kWh</small>`,
      delta: Math.abs(diff) < 3 ? tx("avgAbout") : tx(diff > 0 ? "avgAbove" : "avgBelow", { p: fmt(Math.abs(diff)) }),
      cls: Math.abs(diff) < 3 ? "flat" : diff > 0 ? "up-bad" : "down-good",
      meta: [tx("cheapMeta", { a: hourLbl(st.cheap.t), b: hourLbl(st.cheap.t + 3600e3), v: ore(st.cheap.avg) }), tx("spotNote")], spark: 1,
    });
    spark(el, sl.map((s) => ({ x: s.t0, y: s.p })));
  }
  function renderPrice() {
    const el = $("#c-price"), chips = $("#chips-price");
    setSrc("src-price", "price", tx("srcPrice"));
    const tmBtn = document.querySelector('[data-day="tomorrow"]');
    const hasTm = !!(S.price.data && S.price.data.tomorrow.length);
    tmBtn.hidden = !hasTm;
    if (!hasTm && UI.priceDay === "tomorrow") setDay("today");
    if (loadingOrError(el, "price", "whatPrice")) { chips.innerHTML = ""; $("#a-price").innerHTML = ""; return; }
    const isTm = UI.priceDay === "tomorrow" && hasTm;
    const sl = isTm ? S.price.data.tomorrow : S.price.data.today, st = dayStats(sl);
    $("#a-price").innerHTML = priceAnswer(st, isTm, sl);
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
      .on("pointermove", (e, s) => tip(e, `<b>${fmtTime(s.t0)}–${fmtTime(s.t1)}</b><br>${ore(s.p)} öre/kWh<br>${fmt(s.p / 100, 3)} ${tx("sekkwh")}`)).on("pointerdown", (e, s) => tip(e, `<b>${fmtTime(s.t0)}–${fmtTime(s.t1)}</b><br>${ore(s.p)} öre/kWh`)).on("pointerleave", hideTip);
    if (!isTm && now >= t0 && now <= t1) {
      svg.append("line").attr("class", "nowline").attr("x1", x(now)).attr("x2", x(now)).attr("y1", top).attr("y2", h - bot).style("pointer-events", "none");
      svg.append("text").attr("class", "nowtxt").attr("x", Math.min(w - 26, x(now) + 4)).attr("y", top - 12).text(tx("nowWord"));
    }
    svg.attr("role", "img").attr("aria-label", tx("priceAria", { day: tx(isTm ? "dayTomorrow" : "dayToday"), lo: ore(d3.min(sl, (s) => s.p)), hi: ore(d3.max(sl, (s) => s.p)) }));
    const cur = !isTm ? nowSlot(sl) : null;
    const hr = (h) => ({ a: hourLbl(h.t), b: hourLbl(h.t + 3600e3) });
    chips.innerHTML = `${cur ? `<div class="chip">${esc(tx("chipNow"))}<b>${tx("oreV", { v: ore(cur.p) })}</b></div>` : ""}<div class="chip good">${esc(tx("chipCheap", hr(st.cheap)))}<b>${tx("oreV", { v: ore(st.cheap.avg) })}</b></div><div class="chip bad">${esc(tx("chipDear", hr(st.dear)))}<b>${tx("oreV", { v: ore(st.dear.avg) })}</b></div><div class="chip">${esc(tx("chipAvg"))}<b>${tx("oreV", { v: ore(st.avg) })}</b></div>`;
  }
  function priceAnswer(st, isTm, sl) {
    const h = `${hourLbl(st.cheap.t)}–${hourLbl(st.cheap.t + 3600e3)}`, p = ore(st.cheap.avg), now = Date.now();
    if (isTm) return tx("priceAnsTm", { h, p });
    if (st.cheap.t + 3600e3 > now) return tx("priceAnsAhead", { h, p });
    const cur = nowSlot(sl);
    return cur ? tx("priceAnsPast", { h, p, n: ore(cur.p) }) : "";
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
    if (!S.police.data) { kpiMissing("#k-police", tx("kPolice"), "police", tx("policeDown")); return; }
    const ev = S.police.data.filter(isGbg), now = Date.now(), today = dayKey(now);
    const td = ev.filter((e) => dayKey(e.t) === today).length;
    const wk = ev.filter((e) => now - e.t <= 7 * 864e5).length;
    const h24 = ev.filter((e) => now - e.t <= 864e5).length;
    kpi("#k-police", { label: tx("kPolice"), pill: '<span class="pill">Göteborg</span>', value: `${fmt(td)}`, delta: ev[0] ? tx("latest", { type: esc(ev[0].type), when: `${dayKey(ev[0].t) === today ? "" : wdDayFmt.format(ev[0].t) + " "}${fmtTime(ev[0].t)}` }) : tx("noEventsYet"), meta: [tx("last24", { n: fmt(h24) }), tx("last7", { n: fmt(wk) })] });
  }
  function renderFeed() {
    const el = $("#feed");
    setSrc("src-feed", "police", tx("srcFeed"), S.police.data ? tx("fetchedSrc", { t: fmtTime(S.police.ts) }) : "");
    $("#sub-feed").textContent = tx(UI.area === "vg" ? "subFeedVg" : "subFeedGbg");
    if (!S.police.data) { el.innerHTML = `<li class="${S.police.err ? "error" : "loading"}">${esc(S.police.err ? tx("errLoad", { what: tx("whatPolice"), e: S.police.err }) : tx("loading"))}</li>`; $("#a-feed").innerHTML = ""; return; }
    const ev = S.police.data.filter(inArea);
    $("#a-feed").innerHTML = ev.length ? tx("feedAns", { type: esc(ev[0].type), when: whenLbl(ev[0].t) }) : tx("feedAnsNone");
    if (!ev.length) { el.innerHTML = `<li class="empty">${esc(tx("noEvents"))}</li>`; return; }
    el.innerHTML = ev.slice(0, 60).map((e) => `<li><div class="fh"><span class="when">${esc(e.when)}</span><span class="pill accent">${esc(e.type)}</span>${UI.area === "vg" ? `<span class="pill">${esc(e.place)}</span>` : ""}</div><div class="ft">${esc(e.summary || tx("noSummary"))}</div><a href="${esc(e.url)}" rel="noopener" target="_blank">${esc(tx("readOn"))}</a></li>`).join("");
  }
  const winKey = () => (UI.win === 24 ? "winTxt24" : "winTxt168");
  const areaTxt = () => tx(UI.area === "vg" ? "areaTxtVg" : "areaTxtGbg");
  function typeCounts() {
    const now = Date.now(), win = UI.win * 3600e3;
    const ev = S.police.data.filter((e) => inArea(e) && now - e.t <= win && !/^Sammanfattning/.test(e.type));
    return { ev, counts: d3.rollups(ev, (v) => v.length, (e) => e.type).sort((a, b) => b[1] - a[1]) };
  }
  function renderTypes() {
    const el = $("#c-types"), ans = $("#a-types");
    if (!S.police.data) { el.innerHTML = S.police.err ? `<div class="error">${esc(tx("errLoadShort", { e: S.police.err }))}</div>` : `<div class="loading">${esc(tx("loading"))}</div>`; ans.innerHTML = ""; return; }
    const { ev, counts: all } = typeCounts(), win = tx(winKey());
    ans.innerHTML = ev.length ? tx("typesAns", { n: fmt(ev.length), rep: tx(ev.length === 1 ? "rep1" : "repN"), area: areaTxt(), win, type: esc(all[0][0]) }) : tx("typesAnsNone", { area: areaTxt(), win });
    if (!ev.length) { el.innerHTML = `<div class="empty">${esc(tx("noEventsPeriod"))}</div>`; return; }
    const OTHER = tx("otherTypes");
    let counts = all;
    if (counts.length > 9) { const rest = d3.sum(counts.slice(8), (c) => c[1]); counts = counts.slice(0, 8).concat([[OTHER, rest]]); }
    const mob = (el.clientWidth || 300) < 400;
    const rowH = 26, ml = mob ? 108 : 138, mr = 30;
    const { svg, w, h } = mk(el, counts.length * rowH + 6);
    const x = d3.scaleLinear([0, d3.max(counts, (c) => c[1])], [0, w - ml - mr]);
    const g = svg.selectAll("g").data(counts).join("g").attr("transform", (c, i) => `translate(0,${i * rowH + 3})`);
    const clip = (s) => (s.length > (mob ? 17 : 22) ? s.slice(0, mob ? 16 : 21) + "…" : s);
    g.append("text").attr("x", ml - 8).attr("y", rowH / 2).attr("dy", "0.32em").attr("text-anchor", "end").style("fill", css("--text")).text((c) => clip(c[0])).append("title").text((c) => c[0]);
    g.append("rect").attr("x", ml).attr("y", 3).attr("height", rowH - 8).attr("rx", 3).attr("width", (c) => Math.max(2, x(c[1]))).attr("fill", (c) => (c[0] === OTHER ? css("--c8") : css("--accent")))
      .on("pointermove", (e, c) => tip(e, `<b>${esc(c[0])}</b><br>${fmt(c[1])} ${tx(c[1] === 1 ? "event1" : "eventN")}`)).on("pointerleave", hideTip);
    g.append("text").attr("x", (c) => ml + Math.max(2, x(c[1])) + 5).attr("y", rowH / 2).attr("dy", "0.32em").text((c) => fmt(c[1]));
    svg.attr("role", "img").attr("aria-label", tx("typesAria", { win, list: counts.map((c) => `${c[0]} ${c[1]}`).join(", ") }));
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
    const names = failing.map((k) => tx(SOURCES[k].name)).join(", ");
    if (!lastTs && !failing.length) setStatus(el, "stale", esc(tx("loadingLive")));
    else if (failing.length === keys.length) setStatus(el, "err", esc(tx("stStale", { n: names })));
    else if (failing.length) setStatus(el, "stale", esc(tx("stPart", { t: fmtTime(lastTs), n: names })));
    else setStatus(el, "ok", esc(tx("stOk", { t: fmtTime(lastTs) })));
  }
  const keys = () => Object.keys(S);
  let ready = false;
  // The guide kit starts the first-visit tour on this event, so it fires once the first requests have all settled.
  function fireReady() { if (ready) return; ready = true; window.dispatchEvent(new CustomEvent("sl:ready")); }
  async function run(k) {
    const st = S[k]; if (st.busy) return; st.busy = true;
    try { st.data = await SOURCES[k].load(); st.ts = Date.now(); st.err = null; }
    catch (e) { st.err = (e && e.message) || String(e); }
    st.busy = false;
    try { renderAll(k); } catch (e) { console.error(e); }
    updateStatus();
    if (!ready && keys().every((j) => S[j].ts || S[j].err)) fireReady();
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

  /* language: static text from [data-t], dynamic text by re-rendering in place */
  const ARIA = [["#kpis", "ariaKpis"], ["#d-fc", "ariaDays"], ["#seg-day", "ariaDay"], ["#seg-area", "ariaArea"], ["#seg-win", "ariaWin"], ["#feed", "ariaFeed"]];
  function applyLang() {
    SL.applyText(window.GBG_TEXT);
    ARIA.forEach(([sel, k]) => $(sel).setAttribute("aria-label", tx(k)));
    document.querySelector('meta[name="description"]').setAttribute("content", tx("metaDesc"));
  }

  /* "Show as table" under each chart */
  const tbl = (cols, rows, caption) => ({ caption, cols, rows });
  function tablesInit() {
    SL.tableToggle($("#d-fc"), () => {
      if (!S.fc.data) return null;
      const now = Date.now();
      return tbl([tx("tblTime"), tx("tblTemp"), tx("tblRain"), tx("tblWind"), tx("tblGust"), tx("tblWx")],
        fcRows(now).map((r) => [`${wdFmt.format(r.t)} ${hourLbl(r.t)}:00`, r.temp, r.rain ?? 0, r.wind, r.gust, symName(r.sym)]), tx("tblFc"));
    });
    SL.tableToggle($("#c-price"), () => {
      if (!S.price.data) return null;
      const isTm = UI.priceDay === "tomorrow" && S.price.data.tomorrow.length;
      return tbl([tx("tblHour"), tx("tblOre")],
        dayStats(isTm ? S.price.data.tomorrow : S.price.data.today).hr.map((h) => [`${hourLbl(h.t)}–${hourLbl(h.t + 3600e3)}`, h.avg]),
        tx("tblPrice", { day: tx(isTm ? "dayTomorrow" : "dayToday") }));
    });
    SL.tableToggle($("#c-mix"), () => {
      if (!S.svk.data) return null;
      const d = S.svk.data;
      return tbl([tx("tblTime"), ...d.keys.map(mixName), tx("tblProd"), tx("tblCons")],
        d.rows.map((r) => [fmtTime(r.x), ...d.keys.map((m) => r[m.key] ?? 0), r.prod, r.cons]), tx("tblMix"));
    });
    SL.tableToggle($("#c-types"), () => {
      if (!S.police.data) return null;
      return tbl([tx("tblType"), tx("tblCount")], typeCounts().counts, tx("tblTypes", { area: areaTxt(), win: tx(winKey()) }));
    });
  }

  /* redraw on resize / theme / language; start */
  const redraw = () => { try { renderAll(); } catch (e) { console.error(e); } };
  SL.onResize(redraw); SL.onTheme(redraw);
  addEventListener("sl:lang", () => { applyLang(); updateStatus(); redraw(); });
  document.addEventListener("visibilitychange", tick);
  applyLang();
  updateStatus();
  tablesInit();
  renderAll();
  tick();
  setInterval(tick, 15000);
  setTimeout(fireReady, 8000);
})();
