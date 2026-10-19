/* Compare kommuner: live Kolada choropleth, ranking, trend and profile table.
   No build step. Needs d3 v7, ../assets/js/core.js (window.SL) and kpis.js (KOM_KPIS / KOM_CATS). */
(function () {
  "use strict";
  const API = "https://api.kolada.se/v3";
  const GEO_URL = "../assets/geo/kommuner.geojson";
  const KPIS = window.KOM_KPIS, CATS = window.KOM_CATS;
  const kdef = new Map(KPIS.map((k) => [k.id, k]));
  const MAXSEL = 5, MIN_COVER = 200, NCLASS = 7;
  const DEFAULT_KPI = "N00901", DEFAULT_SEL = ["1480", "0180", "1280", "0380"]; // Göteborg, Stockholm, Malmö, Uppsala
  const $ = (s) => document.querySelector(s);
  const esc = SL.esc;
  SL.initLang();
  const t = SL.translator(window.KOM_TEXT);
  const kn = (k) => kdef.get(k).name[SL.lang()];

  /* ---------- state ---------- */
  const state = { kpi: DEFAULT_KPI, year: null, sel: [], scale: "q", trendMode: "auto" };
  let stat = null, failed = null, trendErr = null, profErr = null;
  const slots = new Map();               // kommun id -> colour slot 0..4 (stable while selected)
  const geo = { fc: null, names: new Map(), pts: new Map(), ids: [] };
  const meta = new Map();                // kpi -> Kolada metadata
  const avail = new Map();               // kpi -> years with data (desc)
  const latest = new Map();              // kpi -> latest year with >= MIN_COVER kommuner
  const vals = new Map();                // "kpi:year" -> { m, riket, n, order, rank, fetched }
  let updTok = 0, trendTok = 0, trendData = null, profileStarted = false, profileDone = 0;

  const nm = (id) => (id === "0000" ? "Riket" : geo.names.get(id) || id);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slotVar = (id) => `var(--c${(slots.get(id) ?? 0) + 1})`;
  const slotCol = (id) => SL.css(`--c${(slots.get(id) ?? 0) + 1}`);
  const yearOf = () => state.year ?? latest.get(state.kpi);
  const cur = () => vals.get(state.kpi + ":" + yearOf());

  const unitOf = (d) => (d.unit === "points" || d.unit === "days" ? t("u_" + d.unit) : d.unit);
  function fv(k, v) {
    if (v == null || !isFinite(v)) return "–";
    const d = kdef.get(k), s = SL.fmt(v, d.dec);
    return d.unit ? s + "\u00a0" + unitOf(d) : s;
  }
  function fc(v, dec) { // compact number for axes
    const a = Math.abs(v);
    if (a >= 1e6) return SL.fmt(v / 1e6, 1) + "M";
    if (a >= 1e4) return SL.fmt(v / 1e3, 0) + "k";
    if (a >= 1e3) return SL.fmt(v / 1e3, 1) + "k";
    return SL.fmt(v, Math.min(dec, a >= 100 ? 0 : a >= 10 ? 1 : 2));
  }
  const betterWord = (b) => t(b === true ? "better" : b === false ? "worse" : "neutral");
  const rankHint = (b) => t(b === null ? "rankHigh" : "rankBest");
  const ordinal = (n) => {
    if (SL.lang() === "sv") return String(n);
    const r = n % 100, s = r >= 11 && r <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10];
    return n + s;
  };

  /* ---------- Kolada access ---------- */
  async function kget(path) {
    let url = API + path, rows = [];
    while (url) {
      const d = await SL.fetchJSON(url, { timeout: 30000, cacheMinutes: 60 });
      rows = rows.concat(d.values || []);
      url = d.next_url || null;
    }
    return rows;
  }
  const tval = (r) => { const t = (r.values || []).find((x) => x.gender === "T"); return t && t.value != null && isFinite(t.value) ? +t.value : null; };
  async function pool(tasks, n) {
    const out = []; let i = 0;
    await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, async () => { while (i < tasks.length) { const j = i++; out[j] = await tasks[j](); } }));
    return out;
  }

  async function loadAvail() {
    const cy = new Date().getFullYear(), years = [];
    for (let y = cy + 1; y >= cy - 11; y--) years.push(y);
    const ids = KPIS.map((k) => k.id).join(",");
    const [rows, mt] = await Promise.all([
      // a few reference units (Riket, Stockholm, Göteborg) tell us which years exist per indicator
      kget(`/data/kpi/${ids}/municipality/0000,0180,1480/year/${years.join(",")}?per_page=5000`),
      SL.fetchJSON(`${API}/kpi/${ids}`, { timeout: 20000, cacheMinutes: 60 }).catch(() => ({ values: [] }))
    ]);
    const sets = new Map();
    rows.forEach((r) => { if (tval(r) != null) (sets.get(r.kpi) || sets.set(r.kpi, new Set()).get(r.kpi)).add(r.period); });
    KPIS.forEach((k) => avail.set(k.id, [...(sets.get(k.id) || [])].sort((a, b) => b - a)));
    (mt.values || []).forEach((m) => meta.set(m.id, m));
  }

  function finish(k, o, fetched) {
    const better = kdef.get(k).better;
    const order = [...o.m].map(([id, v]) => ({ id, v })).sort((a, b) => (better === false ? a.v - b.v : b.v - a.v));
    const rank = new Map();
    order.forEach((d, i) => rank.set(d.id, i > 0 && order[i - 1].v === d.v ? rank.get(order[i - 1].id) : i + 1));
    return { m: o.m, riket: o.riket, n: order.length, order, rank, fetched };
  }

  // All kommuner for one or more indicators in one year. Kolada allows <= 25 municipalities per request,
  // so the 290 kommuner (+ Riket) go out as 12 small requests, a few at a time.
  async function fetchBatch(kpis, year) {
    const ids = ["0000", ...geo.ids], chunks = [];
    for (let i = 0; i < ids.length; i += 25) chunks.push(ids.slice(i, i + 25));
    const parts = await pool(chunks.map((c) => () => kget(`/data/kpi/${kpis.join(",")}/municipality/${c.join(",")}/year/${year}?per_page=5000`)), 6);
    const per = new Map(kpis.map((k) => [k, { m: new Map(), riket: null }]));
    parts.flat().forEach((r) => {
      const o = per.get(r.kpi), v = tval(r);
      if (!o || v == null) return;
      if (r.municipality === "0000") o.riket = v; else if (geo.names.has(r.municipality)) o.m.set(r.municipality, v);
    });
    const now = new Date();
    per.forEach((o, k) => vals.set(k + ":" + year, finish(k, o, now)));
  }

  // Finds, per indicator, the newest year with data for >= MIN_COVER kommuner (falls back year by year).
  async function resolveLatest(list) {
    let pending = list.filter((k) => !latest.has(k)).map((k) => ({ k, i: 0 }));
    for (let round = 0; pending.length && round < 4; round++) {
      const groups = new Map();
      pending.forEach((p) => { const y = avail.get(p.k)[p.i]; if (y != null) (groups.get(y) || groups.set(y, []).get(y)).push(p.k); });
      await Promise.all([...groups].map(([y, ks]) => { const need = ks.filter((k) => !vals.has(k + ":" + y)); return need.length ? fetchBatch(need, y) : null; }));
      pending = pending.filter((p) => {
        const y = avail.get(p.k)[p.i];
        if (y == null) return false;
        const v = vals.get(p.k + ":" + y);
        if (v && v.n >= MIN_COVER) { latest.set(p.k, y); return false; }
        p.i++;
        return p.i < avail.get(p.k).length;
      });
    }
    list.forEach((k) => { if (!latest.has(k)) latest.set(k, null); });
  }

  /* ---------- URL ---------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    const k = p.get("kpi");
    if (k && kdef.has(k.toUpperCase())) state.kpi = k.toUpperCase();
    const y = parseInt(p.get("y"), 10);
    if (y) state.year = y;
    state.sel = (p.has("k") ? p.get("k").split(",") : DEFAULT_SEL).map((s) => s.trim().padStart(4, "0")).filter((id, i, a) => geo.names.has(id) && a.indexOf(id) === i).slice(0, MAXSEL);
    state.sel.forEach(assignSlot);
  }
  function syncURL() {
    const p = new URLSearchParams(location.search); // keeps ?theme=, ?lang= and anything else this page does not own
    p.set("kpi", state.kpi);
    if (state.year != null && state.year !== latest.get(state.kpi)) p.set("y", state.year); else p.delete("y");
    p.set("k", state.sel.join(","));
    try { history.replaceState(null, "", location.pathname + "?" + p.toString().replace(/%2C/g, ",")); } catch (e) { /* sandboxed */ }
  }
  function assignSlot(id) { if (slots.has(id)) return; const used = new Set(slots.values()); let s = 0; while (used.has(s)) s++; slots.set(id, s); }

  /* ---------- selection ---------- */
  let hintTimer;
  function flashHint(msg) { const h = $("#hint"); h.textContent = msg; clearTimeout(hintTimer); hintTimer = setTimeout(() => (h.textContent = ""), 3500); }
  function toggle(id) {
    const i = state.sel.indexOf(id);
    if (i >= 0) { state.sel.splice(i, 1); slots.delete(id); }
    else {
      if (state.sel.length >= MAXSEL) { flashHint(t("max", { max: MAXSEL })); return; }
      state.sel.push(id); assignSlot(id);
    }
    onSelChange();
  }
  function onSelChange() {
    syncURL(); renderChips(); renderNetto(); paintMap(); renderStrip(); renderLists(); renderProfile(); loadTrend();
  }
  function renderChips() {
    const box = $("#chips");
    if (!state.sel.length) { box.innerHTML = `<span class="none">${t("none")}</span>`; return; }
    box.innerHTML = state.sel.map((id) => `<span class="chip" style="--sc:${slotVar(id)}"><span class="dot"></span>${esc(nm(id))}<button type="button" data-rm="${id}" aria-label="${esc(t("rm", { n: nm(id) }))}">×</button></span>`).join("");
    box.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.rm)));
  }

  /* search box with autocomplete */
  function setupSearch() {
    const q = $("#q"), ul = $("#sug"); let items = [], act = -1;
    const all = geo.fc.features.map((f) => ({ id: f.properties.id, n: f.properties.kom_namn, k: norm(f.properties.kom_namn) })).sort((a, b) => a.n.localeCompare(b.n, "sv"));
    function close() { ul.hidden = true; q.setAttribute("aria-expanded", "false"); act = -1; }
    function show() {
      const term = norm(q.value.trim());
      if (!term) return close();
      items = all.filter((a) => a.k.startsWith(term)).concat(all.filter((a) => !a.k.startsWith(term) && a.k.includes(term))).slice(0, 8);
      if (!items.length) { ul.innerHTML = `<li aria-disabled="true"><small>${t("noMatch")}</small></li>`; ul.hidden = false; return; }
      act = 0;
      ul.innerHTML = items.map((a, i) => `<li role="option" data-id="${a.id}" aria-selected="${i === 0}"><span>${esc(a.n)}</span><small>${state.sel.includes(a.id) ? t("selTag") : a.id}</small></li>`).join("");
      ul.hidden = false; q.setAttribute("aria-expanded", "true");
    }
    function mark() { ul.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", i === act)); }
    function pick(id) { if (!state.sel.includes(id)) toggle(id); else flashHint(t("already", { n: nm(id) })); q.value = ""; close(); }
    q.addEventListener("input", show);
    q.addEventListener("focus", show);
    q.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); if (ul.hidden) show(); else { act = (act + 1) % items.length; mark(); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); act = (act - 1 + items.length) % items.length; mark(); }
      else if (e.key === "Enter") { e.preventDefault(); if (!ul.hidden && items[act]) pick(items[act].id); }
      else if (e.key === "Escape") close();
    });
    ul.addEventListener("pointerdown", (e) => { const li = e.target.closest("li[data-id]"); if (li) { e.preventDefault(); pick(li.dataset.id); } });
    q.addEventListener("blur", () => setTimeout(close, 120));
  }

  /* ---------- controls ---------- */
  function setupControls() {
    buildKpiSelect();
    $("#kpiSel").addEventListener("change", (e) => { state.kpi = e.target.value; state.year = null; update(); });
    $("#yearSel").addEventListener("change", (e) => { state.year = +e.target.value; update(); });
    $("#scaleSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-s]"); if (!b) return;
      state.scale = b.dataset.s;
      $("#scaleSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      paintMap();
    });
    $("#trendSeg").addEventListener("click", (e) => { const b = e.target.closest("button[data-m]"); if (!b) return; state.trendMode = b.dataset.m; renderTrend(); });
    $("#copyLink").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); btn.textContent = t("copied"); }
      catch (err) { btn.textContent = t("copyFail"); }
      setTimeout(() => (btn.textContent = t("copy")), 2200);
    });
    $("#resetSel").addEventListener("click", () => { state.sel = []; slots.clear(); DEFAULT_SEL.forEach((id) => { state.sel.push(id); assignSlot(id); }); onSelChange(); });
  }
  function buildKpiSelect() {
    const sel = $("#kpiSel"), l = SL.lang();
    sel.innerHTML = CATS.map(([c, name]) => `<optgroup label="${esc(name[l])}">${KPIS.filter((k) => k.cat === c).map((k) => `<option value="${k.id}">${esc(k.name[l])}${k.unit ? " (" + esc(unitOf(k)) + ")" : ""}</option>`).join("")}</optgroup>`).join("");
    sel.value = state.kpi;
  }
  function fillYears() {
    const k = state.kpi, ys = (avail.get(k) || []).slice(0, 10), ly = latest.get(k);
    $("#yearSel").innerHTML = ys.map((y) => `<option value="${y}">${y}${y === ly ? t("latestTag") : ""}</option>`).join("");
    $("#yearSel").value = yearOf();
    $("#yearSel").disabled = ys.length < 2;
  }
  function renderInfo() {
    const k = state.kpi, d = kdef.get(k), m = meta.get(k), box = $("#kpiInfo");
    const pub = m && m.publication_date ? new Date(m.publication_date) : null;
    const next = pub && pub > new Date() ? `<span class="pill">${t("nextUpd", { d: SL.fmtDate(pub) })}</span>` : "";
    box.innerHTML = `<div class="t">${esc(kn(k))} <em>· ${esc(t("koladaName", { t: (m && m.title) || d.title }))}</em></div>` +
      `<p>${esc(d.desc[SL.lang()])}</p>` +
      (m && m.description ? `<details class="kdef"><summary>${t("koladaDef")}</summary><p>${esc(m.description)}</p></details>` : "") +
      `<div class="pills"><span class="pill accent">${betterWord(d.better)}</span><span class="pill">${k}</span>${m && m.operating_area && SL.lang() === "sv" ? `<span class="pill">${esc(m.operating_area)}</span>` : ""}${next}</div>`;
  }

  /* ---------- map ---------- */
  const M = { w: 0, h: 0, built: false, svg: null, g: null, kp: null, gs: null, proj: null, zoom: null, k: 1, sc: null };

  function colors() {
    const dark = SL.isDark(), acc = SL.css("--h-blue"), sur = SL.css("--surface");
    const lo = d3.interpolateLab(sur, acc)(dark ? 0.2 : 0.13);
    const hi = dark ? d3.color(acc).brighter(0.7) : d3.color(acc).darker(1.1);
    return d3.quantize(d3.interpolateLab(lo, hi.formatHex ? hi.formatHex() : hi), NCLASS);
  }
  function buildMap() {
    const box = $("#map"); const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return false;
    M.w = w; M.h = h; M.built = true;
    box.innerHTML = "";
    const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").attr("aria-label", t("mapAria"));
    M.svg = svg;
    M.proj = d3.geoConicConformal().rotate([-15, 0]).parallels([57, 66]).fitExtent([[6, 6], [w - 6, h - 6]], geo.fc);
    const path = d3.geoPath(M.proj);
    M.g = svg.append("g");
    M.kp = M.g.append("g");
    M.kp.selectAll("path").data(geo.fc.features).join("path").attr("class", "k").attr("d", path)
      .on("pointermove", (e, f) => mapTip(e, f.properties.id))
      .on("pointerleave", () => SL.hideTip())
      .on("click", (e, f) => { toggle(f.properties.id); mapTip(e, f.properties.id); });
    M.gs = M.g.append("g");
    M.zoom = d3.zoom().scaleExtent([1, 14]).translateExtent([[0, 0], [w, h]])
      .filter((e) => (e.type === "wheel" ? e.ctrlKey : e.type.startsWith("touch") ? e.touches.length > 1 : !e.button))
      .on("zoom", (e) => { M.k = e.transform.k; M.g.attr("transform", e.transform); scaleOverlay(); });
    svg.call(M.zoom).on("dblclick.zoom", null);
    return true;
  }
  function scaleOverlay() {
    if (!M.gs) return;
    M.gs.selectAll("circle.ring").attr("r", 6.5 / M.k);
    M.gs.selectAll("text.mlab").style("font-size", 11 / M.k + "px").style("stroke-width", 3 / M.k + "px").attr("x", 9 / M.k).attr("dy", 4 / M.k);
  }
  function mapTip(e, id) {
    const d = cur(); if (!d) return;
    const v = d.m.get(id), k = state.kpi, def = kdef.get(k);
    let h = `<b>${esc(nm(id))}</b> <span style="opacity:.7">${id}</span><br>`;
    if (v == null) h += t("tipNoData");
    else {
      h += `${esc(kn(k))}: <b>${fv(k, v)}</b><br>${t("tipRank", { r: d.rank.get(id), n: d.n })} <span style="opacity:.7">(${rankHint(def.better)})</span>`;
      if (d.riket != null) h += `<br>${t("tipRiket", { v: fv(k, d.riket) })}`;
    }
    SL.tip(e, h);
  }
  function makeScale(d) {
    const arr = d.order.map((o) => o.v), cols = colors();
    if (state.scale === "e") {
      const [a, b] = d3.extent(arr), sc = d3.scaleQuantize().domain([a, b]).range(cols);
      return { fn: sc, breaks: d3.range(NCLASS + 1).map((i) => a + ((b - a) * i) / NCLASS), cols };
    }
    const sc = d3.scaleQuantile().domain(arr).range(cols);
    return { fn: sc, breaks: [d3.min(arr), ...sc.quantiles(), d3.max(arr)], cols };
  }
  function paintMap() {
    const d = cur();
    if (!d) return;
    if (!M.built || Math.abs(M.w - $("#map").clientWidth) > 1 || Math.abs(M.h - $("#map").clientHeight) > 1) { if (!buildMap()) return; }
    const sc = makeScale(d), none = SL.css("--border");
    M.sc = sc;
    M.svg.attr("aria-label", t("mapAria"));
    M.kp.selectAll("path").attr("fill", (f) => { const v = d.m.get(f.properties.id); return v == null ? none : sc.fn(v); });
    // selection outlines + rings + labels
    const sel = state.sel.map((id) => geo.fc.features.find((f) => f.properties.id === id)).filter(Boolean);
    M.gs.selectAll("*").remove();
    const path = d3.geoPath(M.proj);
    M.gs.selectAll("path.sel").data(sel).join("path").attr("class", "sel").attr("d", path).attr("stroke", (f) => slotCol(f.properties.id));
    const pts = sel.map((f) => ({ id: f.properties.id, p: M.proj([geo.pts.get(f.properties.id)[1], geo.pts.get(f.properties.id)[0]]) })).filter((p) => p.p);
    const gp = M.gs.selectAll("g.pt").data(pts).join("g").attr("class", "pt").attr("transform", (p) => `translate(${p.p})`);
    gp.append("circle").attr("class", "ring").attr("stroke", (p) => slotCol(p.id));
    gp.append("text").attr("class", "mlab").text((p) => nm(p.id));
    scaleOverlay();
    // legend
    const b = sc.breaks, dec = kdef.get(state.kpi).dec;
    $("#mapLegend").innerHTML = `<div class="bar">${sc.cols.map((c) => `<i style="background:${c}"></i>`).join("")}</div><div class="ticks">${b.map((x, i) => `<span class="${i === 0 ? "first" : i === b.length - 1 ? "last" : ""}" style="left:${((i / NCLASS) * 100).toFixed(2)}%">${fc(x, dec)}</span>`).join("")}</div>` +
      `<div class="note"><span>${t(SL.isDark() ? "lgLight" : "lgDark")}${t(state.scale === "q" ? "lgQ" : "lgE")}</span>${d.n < geo.ids.length ? `<span><i class="nd"></i>${t("noData", { n: geo.ids.length - d.n })}</span>` : ""}</div>`;
  }
  function setupZoomButtons() {
    const by = (f) => () => M.svg && M.svg.transition().duration(220).call(M.zoom.scaleBy, f);
    $("#zin").addEventListener("click", by(1.7));
    $("#zout").addEventListener("click", by(1 / 1.7));
    $("#zreset").addEventListener("click", () => M.svg && M.svg.transition().duration(260).call(M.zoom.transform, d3.zoomIdentity));
  }

  /* ---------- top / bottom lists ---------- */
  function renderLists() {
    const d = cur(), k = state.kpi, def = kdef.get(k), box = $("#lists");
    if (!d) return;
    const neutral = def.better === null;
    $("#listTitle").textContent = t(neutral ? "listHL" : "listBW");
    $("#listSub").textContent = t("listSub", { ind: kn(k), y: yearOf(), hint: rankHint(def.better) });
    $("#listAns").innerHTML = listAnswer(d);
    const top = d.order.slice(0, 10), bot = d.order.slice(-10), mx = d3.max(d.order, (o) => Math.abs(o.v)) || 1;
    const li = (o) => `<li><button type="button" data-id="${o.id}" class="${state.sel.includes(o.id) ? "on" : ""}" style="${state.sel.includes(o.id) ? "--sc:" + slotVar(o.id) : ""}" title="${esc(t("rowTip", { n: nm(o.id), v: fv(k, o.v), r: d.rank.get(o.id), all: d.n }))}"><span class="rk">${d.rank.get(o.id)}</span><span class="nm">${esc(nm(o.id))}</span><span class="vl">${fv(k, o.v)}</span></button></li>`;
    box.innerHTML = `<div><h3>${t(neutral ? "highest" : "top10")}</h3><ol>${top.map(li).join("")}</ol></div><div><h3>${t(neutral ? "lowest" : "bot10")}</h3><ol>${bot.map(li).join("")}</ol></div>`;
    box.querySelectorAll("button[data-id]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.id)));
    void mx;
  }

  /* ---------- ranked strip ---------- */
  function renderStrip() {
    const box = $("#strip"), d = cur();
    if (!d) return;
    const W = box.clientWidth; if (!W) return;
    const k = state.kpi, def = kdef.get(k), arr = d.order, n = arr.length;
    $("#stripSub").textContent = t(def.better === null ? "stripSubN" : "stripSubB", { n, y: yearOf() });
    $("#stripAns").innerHTML = stripAnswer(d);
    const mob = W < 520, ml = mob ? 38 : 46, mr = 10, mb = 24, ph = mob ? 150 : 170;
    const iw = W - ml - mr, bw = iw / n, xc = (i) => ml + (i + 0.5) * bw;
    // label layout in stacked rows so names never overlap
    const L = state.sel.map((id) => ({ id, i: arr.findIndex((a) => a.id === id) })).filter((s) => s.i >= 0).sort((a, b) => a.i - b.i)
      .map((s) => { const lb = `${nm(s.id)} #${d.rank.get(s.id)}`, w = lb.length * 6 + 8, x = xc(s.i); return { ...s, t: lb, w, x, left: Math.max(2, Math.min(W - 2 - w, x - w / 2)) }; });
    const ends = [];
    L.forEach((l) => { let r = 0; while (ends[r] != null && l.left < ends[r] + 4) r++; l.row = r; ends[r] = l.left + l.w; });
    const rows = Math.max(1, ends.length), top = 10 + rows * 15 + 6, H = top + ph + mb;
    const vs = arr.map((a) => a.v), lo = d3.min(vs), hi = d3.max(vs);
    const logS = lo > 0 && hi / lo > 40;   // e.g. population: use a log axis so small kommuner stay visible
    let y0 = lo < 0 ? lo : lo / hi > 0.35 ? Math.max(0, lo - (hi - lo) * 0.25) : 0;
    const y = (logS ? d3.scaleLog().domain([Math.pow(10, Math.floor(Math.log10(lo))), Math.pow(10, Math.ceil(Math.log10(hi)))]) : d3.scaleLinear().domain([y0, hi]).nice()).range([top + ph, top]);
    const svg = d3.select(box).html("").append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("height", H).attr("role", "img").attr("aria-label", t("stripAria", { n, ind: kn(k) }));
    const ticks = logS ? d3.range(Math.log10(y.domain()[0]), Math.log10(y.domain()[1]) + 0.5).map((e) => Math.pow(10, e)) : y.ticks(4);
    svg.append("g").selectAll("line").data(ticks).join("line").attr("x1", ml).attr("x2", W - mr).attr("y1", y).attr("y2", y).attr("class", "grid").attr("stroke", SL.css("--grid"));
    svg.append("g").selectAll("text").data(ticks).join("text").attr("x", ml - 6).attr("y", (t) => y(t) + 4).attr("text-anchor", "end").text((t) => fc(t, def.dec));
    const base = logS ? top + ph : y(Math.max(y.domain()[0], 0));
    const selSet = new Set(L.map((l) => l.id));
    svg.append("g").attr("shape-rendering", "crispEdges").selectAll("rect").data(arr.map((a, i) => ({ ...a, i })).filter((a) => !selSet.has(a.id))).join("rect")
      .attr("x", (a) => ml + a.i * bw).attr("width", Math.max(0.8, bw - (bw > 2.5 ? 0.6 : 0))).attr("y", (a) => Math.min(y(a.v), base)).attr("height", (a) => Math.abs(base - y(a.v))).attr("fill", SL.css("--border-strong"));
    // Riket reference
    if (d.riket != null && d.riket >= y.domain()[0] && d.riket <= y.domain()[1]) {
      const ry = y(d.riket);
      svg.append("line").attr("x1", ml).attr("x2", W - mr).attr("y1", ry).attr("y2", ry).attr("stroke", SL.css("--text")).attr("stroke-width", 1.3).attr("stroke-dasharray", "5 4");
      svg.append("text").attr("x", W - mr - 2).attr("y", ry - 5).attr("text-anchor", "end").style("fill", SL.css("--text")).style("font-weight", 650).text(t("riketLbl", { v: fv(k, d.riket) }));
    }
    // selected kommuner: coloured bar, dot and label
    const gs = svg.append("g");
    L.forEach((l) => {
      const v = d.m.get(l.id), c = slotCol(l.id), yy = y(v), ly = 10 + l.row * 15 + 4;
      gs.append("line").attr("x1", l.x).attr("x2", l.x).attr("y1", ly + 3).attr("y2", yy).attr("stroke", c).attr("stroke-width", 1).attr("stroke-dasharray", "2 2").attr("opacity", 0.7);
      gs.append("rect").attr("x", l.x - Math.max(bw, 3) / 2).attr("width", Math.max(bw, 3)).attr("y", Math.min(yy, base)).attr("height", Math.abs(base - yy)).attr("fill", c);
      gs.append("circle").attr("cx", l.x).attr("cy", yy).attr("r", 4).attr("fill", c).attr("stroke", SL.css("--surface")).attr("stroke-width", 1.5);
      gs.append("text").attr("x", l.left + l.w / 2).attr("y", ly).attr("text-anchor", "middle").style("fill", c).style("font-weight", 650).text(l.t);
    });
    // axis captions
    const neutral = def.better === null;
    svg.append("text").attr("x", ml).attr("y", H - 6).text(t(neutral ? "capHigh" : "capBest") + (logS ? t("logScale") : ""));
    svg.append("text").attr("x", W - mr).attr("y", H - 6).attr("text-anchor", "end").text(t(neutral ? "capLow" : "capWorst", { n }));
    // hover layer
    const hv = svg.append("line").attr("class", "hov").attr("y1", top).attr("y2", top + ph).attr("stroke", SL.css("--text")).attr("stroke-width", 1).attr("opacity", 0);
    const at = (e) => { const [px] = d3.pointer(e, svg.node()); return Math.max(0, Math.min(n - 1, Math.floor((px - ml) / bw))); };
    svg.append("rect").attr("x", ml).attr("y", top).attr("width", iw).attr("height", ph).attr("fill", "transparent").style("cursor", "pointer")
      .on("pointermove", (e) => { const a = arr[at(e)]; hv.attr("x1", xc(at(e))).attr("x2", xc(at(e))).attr("opacity", 0.6); mapTip(e, a.id); })
      .on("pointerleave", () => { hv.attr("opacity", 0); SL.hideTip(); })
      .on("click", (e) => toggle(arr[at(e)].id));
  }

  /* ---------- trend ---------- */
  async function loadTrend() {
    const my = ++trendTok, k = state.kpi, box = $("#trend");
    const years = (avail.get(k) || []).slice(0, 10).slice().reverse();
    trendErr = null;
    if (!years.length) { box.innerHTML = `<div class="nodata">${t("noYear")}</div>`; $("#trendAns").innerHTML = ""; return; }
    if (!trendData || trendData.k !== k) box.innerHTML = `<div class="loading">${t("loadingTrend")}</div>`;
    const ids = ["0000", ...state.sel];
    try {
      const rows = await kget(`/data/kpi/${k}/municipality/${ids.join(",")}/year/${years.join(",")}?per_page=5000`);
      if (my !== trendTok) return;
      const series = new Map(ids.map((id) => [id, []]));
      rows.forEach((r) => { const v = tval(r); if (v != null && series.has(r.municipality)) series.get(r.municipality).push({ y: r.period, v }); });
      series.forEach((s) => s.sort((a, b) => a.y - b.y));
      trendData = { k, years, series, ids };
      renderTrend();
    } catch (e) {
      if (my !== trendTok) return;
      trendErr = e.message; showTrendError();
    }
  }
  function showTrendError() {
    $("#trend").innerHTML = `<div class="error">${t("trendErr", { e: esc(trendErr) })} <button class="btn sm" id="trRetry">${t("retry")}</button></div>`;
    $("#trRetry").addEventListener("click", loadTrend);
  }
  function renderTrend() {
    const box = $("#trend");
    if (trendErr) return showTrendError();
    if (!trendData || trendData.k !== state.kpi) return;
    const W = box.clientWidth; if (!W) return;
    const { k, years, series, ids } = trendData, def = kdef.get(k);
    const have = years.filter((y) => ids.some((id) => series.get(id).some((p) => p.y === y)));
    $("#trendLegend").innerHTML = ids.filter((id) => id !== "0000").map((id) => `<span style="--sc:${slotVar(id)}"><i class="sw"></i>${esc(nm(id))}</span>`).join("") + `<span style="--sc:${"var(--text)"}"><i class="sw dash"></i>Riket</span>`;
    $("#trendAns").innerHTML = trendAnswer();
    const raw = ids.flatMap((id) => series.get(id)).map((p) => p.v);
    if (!raw.length) { box.innerHTML = `<div class="nodata">${t("noSelData")}</div>`; return; }
    // "Index" mode rebases every line to 100 in its first year, so very different levels (e.g. population) stay comparable
    const wide = d3.min(raw) > 0 && d3.max(raw) / d3.min(raw) > 5;
    const idx = state.trendMode === "idx" || (state.trendMode === "auto" && wide);
    $("#trendSeg").querySelectorAll("button").forEach((b) => b.classList.toggle("on", (b.dataset.m === "idx") === idx));
    $("#trendSub").textContent = t("trendSub", { ind: kn(k), span: `${have[0] ?? ""}${have.length > 1 ? "–" + have[have.length - 1] : ""}`, idx: idx ? t("idxSuffix") : "" });
    const sv = new Map(ids.map((id) => { const s0 = series.get(id); const b0 = s0.length ? s0[0].v : null; return [id, s0.map((p) => ({ y: p.y, raw: p.v, v: idx ? (b0 ? (p.v / b0) * 100 : null) : p.v })).filter((p) => p.v != null)]; }));
    const all = ids.flatMap((id) => sv.get(id)).map((p) => p.v);
    const fv2 = (v) => (idx ? SL.fmt(v, 1) : null);
    const mob = W < 520, ml = mob ? 38 : 46, mr = 12, mt = 10, mb = 24, ph = mob ? 190 : 230, H = mt + ph + mb;
    const x = have.length > 1 ? d3.scaleLinear().domain([have[0], have[have.length - 1]]).range([ml + 6, W - mr - 6]) : () => ml + (W - ml - mr) / 2;
    let a = d3.min(all), b = d3.max(all); if (a === b) { a -= 1; b += 1; }
    const pad = (b - a) * 0.08, y = d3.scaleLinear().domain([a - pad, b + pad]).nice().range([mt + ph, mt]);
    const svg = d3.select(box).html("").append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("height", H).attr("role", "img").attr("aria-label", `${t("trendT")}: ${kn(k)}`);
    const ticks = y.ticks(5);
    svg.append("g").selectAll("line").data(ticks).join("line").attr("x1", ml).attr("x2", W - mr).attr("y1", y).attr("y2", y).attr("stroke", SL.css("--grid"));
    svg.append("g").selectAll("text").data(ticks).join("text").attr("x", ml - 6).attr("y", (t) => y(t) + 4).attr("text-anchor", "end").text((t) => fc(t, idx ? 0 : def.dec));
    const xt = mob && have.length > 5 ? have.filter((_, i) => i % 2 === (have.length - 1) % 2) : have;
    svg.append("g").selectAll("text").data(xt).join("text").attr("x", x).attr("y", H - 6).attr("text-anchor", "middle").text((t) => t);
    const line = d3.line().defined((p) => p.v != null).x((p) => x(p.y)).y((p) => y(p.v));
    const draw = (id, col, dash, w) => {
      const s = sv.get(id); if (!s || !s.length) return;
      if (s.length > 1) svg.append("path").datum(s).attr("d", line).attr("fill", "none").attr("stroke", col).attr("stroke-width", w).attr("stroke-dasharray", dash).attr("stroke-linejoin", "round");
      svg.append("g").selectAll("circle").data(s.length > 1 ? [s[s.length - 1]] : s).join("circle").attr("cx", (p) => x(p.y)).attr("cy", (p) => y(p.v)).attr("r", s.length > 1 ? 3.2 : 4.5).attr("fill", col).attr("stroke", SL.css("--surface")).attr("stroke-width", 1.2);
    };
    draw("0000", SL.css("--text"), "5 4", 1.8);
    state.sel.forEach((id) => draw(id, slotCol(id), null, 2.4));
    if (have.length < 2) svg.append("text").attr("x", ml + (W - ml - mr) / 2).attr("y", mt + 14).attr("text-anchor", "middle").text(t("oneYear"));
    // hover
    const hv = svg.append("line").attr("class", "hov").attr("y1", mt).attr("y2", mt + ph).attr("stroke", SL.css("--text")).attr("opacity", 0);
    svg.append("rect").attr("x", ml).attr("y", mt).attr("width", W - ml - mr).attr("height", ph).attr("fill", "transparent")
      .on("pointermove", (e) => {
        const [px] = d3.pointer(e, svg.node()); const yr = have.reduce((best, c) => (Math.abs(x(c) - px) < Math.abs(x(best) - px) ? c : best), have[0]);
        hv.attr("x1", x(yr)).attr("x2", x(yr)).attr("opacity", 0.5);
        const row = (id, c) => { const p = (sv.get(id) || []).find((q) => q.y === yr); return p ? `<span style="color:${c}">●</span> ${esc(nm(id))}: <b>${fv(k, p.raw)}</b>${idx ? ` <span style="opacity:.7">${t("idxTip", { v: fv2(p.v) })}</span>` : ""}` : null; };
        SL.tip(e, `<b>${yr}</b><br>` + [...state.sel.map((id) => row(id, slotCol(id))), row("0000", SL.css("--bg"))].filter(Boolean).join("<br>"));
      })
      .on("pointerleave", () => { hv.attr("opacity", 0); SL.hideTip(); });
  }

  /* ---------- profile table ---------- */
  async function loadProfile() {
    if (profileStarted) return; profileStarted = true; profErr = null;
    const rest = KPIS.map((k) => k.id).filter((k) => !latest.has(k));
    profileDone = KPIS.length - rest.length; renderProfile();
    try {
      // first group them by newest candidate year so shared requests are reused
      await resolveLatest(rest);
    } catch (e) {
      profErr = e.message; showProfileError();
      return;
    }
    renderProfile();
  }
  function showProfileError() {
    $("#profile").innerHTML = `<div class="error">${t("profErr", { e: esc(profErr) })} <button class="btn sm" id="pfRetry">${t("retry")}</button></div>`;
    $("#pfRetry").addEventListener("click", () => { profileStarted = false; loadProfile(); });
  }
  function pctBg(p) {
    const d = p - 0.5, a = Math.round(Math.abs(d) * 2 * 46);
    return `color-mix(in srgb, var(${d >= 0 ? "--good" : "--bad"}) ${a}%, transparent)`;
  }
  function renderProfile() {
    const box = $("#profile");
    if (profErr) return showProfileError();
    const ready = KPIS.filter((k) => latest.has(k.id)).length;
    if (!ready) return;
    const cols = state.sel;
    let h = `<table class="prof"><thead><tr><th>${t("colInd")}</th><th>${t("colYear")}</th>${cols.map((id) => `<th style="--sc:${slotVar(id)}"><span class="dot"></span>${esc(nm(id))}</th>`).join("")}<th>Riket</th></tr></thead><tbody>`;
    CATS.forEach(([c, name]) => {
      h += `<tr class="cat"><td colspan="${3 + cols.length}">${esc(name[SL.lang()])}</td></tr>`;
      KPIS.filter((k) => k.cat === c).forEach((k) => {
        const ly = latest.get(k.id), d = ly != null ? vals.get(k.id + ":" + ly) : null;
        const label = `<td><button type="button" class="kb" data-kpi="${k.id}" title="${esc((meta.get(k.id) || {}).title || k.title)}">${esc(k.name[SL.lang()])}</button></td>`;
        if (!latest.has(k.id)) { h += `<tr>${label}<td class="yr">…</td>${cols.map(() => "<td>…</td>").join("")}<td>…</td></tr>`; return; }
        if (!d) { h += `<tr>${label}<td class="yr">–</td>${cols.map(() => "<td>–</td>").join("")}<td>–</td></tr>`; return; }
        h += `<tr class="${k.id === state.kpi ? "cur" : ""}">${label}<td class="yr">${ly}</td>`;
        cols.forEach((id) => {
          const v = d.m.get(id);
          if (v == null) { h += "<td>–</td>"; return; }
          const r = d.rank.get(id), p = d.n > 1 ? 1 - (r - 1) / (d.n - 1) : 0.5;
          h += `<td style="background:${k.better === null ? "var(--surface-2)" : pctBg(p)}" title="${esc(t("rowRank", { r, n: d.n, hint: rankHint(k.better) }))}">${SL.fmt(v, k.dec)}<small>#${r}</small></td>`;
        });
        h += `<td>${d.riket != null ? SL.fmt(d.riket, k.dec) : "–"}</td></tr>`;
      });
    });
    h += "</tbody></table>";
    box.innerHTML = h;
    $("#profAns").innerHTML = profileAnswer();
    box.querySelectorAll("button[data-kpi]").forEach((b) => b.addEventListener("click", () => { state.kpi = b.dataset.kpi; state.year = null; $("#kpiSel").value = state.kpi; update(); window.scrollTo({ top: 0, behavior: "smooth" }); }));
    const done = KPIS.filter((k) => latest.has(k.id)).length;
    $("#profSub").textContent = done < KPIS.length ? t("profLoading", { a: done, n: KPIS.length }) : t("profSub", { n: KPIS.length });
  }

  /* ---------- answer sentences and tables ---------- */
  const extremes = (d) => ({ lo: d.order.reduce((a, o) => (o.v < a.v ? o : a)), hi: d.order.reduce((a, o) => (o.v > a.v ? o : a)) });
  function mapAnswer(d) {
    const k = state.kpi, id = state.sel[0], v = id ? d.m.get(id) : null, { lo, hi } = extremes(d);
    let h = "";
    if (id) h += v == null ? t("ansNoData", { name: esc(nm(id)), y: yearOf() }) : t("ansVal", { ind: esc(kn(k)), name: esc(nm(id)), v: fv(k, v), rank: ordinal(d.rank.get(id)), n: d.n });
    h += t("ansRange", { lo: esc(nm(lo.id)), lov: fv(k, lo.v), hi: esc(nm(hi.id)), hiv: fv(k, hi.v) });
    if (d.riket != null) h += t("ansRiket", { v: fv(k, d.riket) });
    return h.trim();
  }
  function listAnswer(d) {
    const k = state.kpi, a = d.order[0], z = d.order[d.order.length - 1];
    return t(kdef.get(k).better === null ? "ansHigh" : "ansBest", { a: esc(nm(a.id)), av: fv(k, a.v), z: esc(nm(z.id)), zv: fv(k, z.v) });
  }
  function stripAnswer(d) {
    const k = state.kpi, id = state.sel[0], asc = d.order.map((o) => o.v).sort(d3.ascending), md = d3.quantile(asc, 0.5);
    let h = t("ansStrip", { q1: fv(k, d3.quantile(asc, 0.25)), q3: fv(k, d3.quantile(asc, 0.75)), md: fv(k, md) });
    const v = id ? d.m.get(id) : null;
    if (v != null) h += t("ansStripSel", { name: esc(nm(id)), v: fv(k, v), pos: t(v > md ? "above" : v < md ? "below" : "at") });
    return h;
  }
  function trendAnswer() {
    if (!trendData || trendData.k !== state.kpi) return "";
    const k = trendData.k, id = state.sel[0], ind = esc(kn(k)), one = (s) => s && s.length === 1, many = (s) => s && s.length > 1;
    const s = id && trendData.ids.includes(id) ? trendData.series.get(id) : null, r = trendData.series.get("0000"), first = (a) => a[0], last = (a) => a[a.length - 1];
    let h = "";
    if (many(s)) h += t(first(s).v === last(s).v ? "ansTrendFlat" : "ansTrend", { ind, name: esc(nm(id)), a: fv(k, first(s).v), b: fv(k, last(s).v), y0: first(s).y, y1: last(s).y });
    else if (one(s)) h += t("ansTrendOne", { ind, name: esc(nm(id)), a: fv(k, first(s).v), y0: first(s).y });
    if (many(r)) h += t("ansTrendRiket", { a: fv(k, first(r).v), b: fv(k, last(r).v) });
    else if (one(r)) h += t("ansTrendRiketOne", { a: fv(k, first(r).v), y0: first(r).y });
    return h.trim();
  }
  function profileAnswer() {
    const id = state.sel[0];
    if (!id) return t("ansProfNone");
    const rows = KPIS.filter((k) => k.better !== null && latest.get(k.id) != null).map((k) => {
      const d = vals.get(k.id + ":" + latest.get(k.id)), r = d && d.rank.get(id);
      return r ? { k, r, p: d.n > 1 ? 1 - (r - 1) / (d.n - 1) : 0.5 } : null;
    }).filter(Boolean);
    if (rows.length < 2) return "";
    const a = rows.reduce((x, y) => (y.p > x.p ? y : x)), z = rows.reduce((x, y) => (y.p < x.p ? y : x));
    return t("ansProf", { n: KPIS.length, name: esc(nm(id)), a: esc(kn(a.k.id)), ar: a.r, z: esc(kn(z.k.id)), zr: z.r });
  }
  function renderNetto() {
    const a = $("#nettoLink"), id = state.sel[0];
    if (!id) { a.hidden = true; return; }
    const here = new URLSearchParams(location.search), p = new URLSearchParams({ k: id }), hot = state.kpi === "N00901", n = esc(nm(id));
    ["lang", "theme"].forEach((x) => here.has(x) && p.set(x, here.get(x)));
    a.href = "../netto/?" + p;
    a.className = "netto" + (hot ? " hot" : "");
    a.innerHTML = hot ? `<b>${t("nettoLink", { n })}</b><span>${t("nettoHot", { n })}</span>` : t("nettoLink", { n });
    a.hidden = false;
  }
  function mapTable() {
    const d = cur(); if (!d) return null;
    const k = state.kpi, none = geo.ids.filter((id) => !d.m.has(id)).map((id) => [nm(id), "–", "–"]).sort((a, b) => a[0].localeCompare(b[0], "sv"));
    return { caption: t("tCapMap", { ind: kn(k), y: yearOf(), hint: rankHint(kdef.get(k).better) }), cols: [t("tKommun"), t("tValue"), t("tRank")],
      rows: d.order.map((o) => [nm(o.id), fv(k, o.v), String(d.rank.get(o.id))]).concat(none) };
  }
  function stripTable() {
    const d = cur(); if (!d) return null;
    const k = state.kpi, asc = d.order.map((o) => o.v).sort(d3.ascending), q = (p) => fv(k, d3.quantile(asc, p));
    const rows = [[t("tLowest"), q(0), ""], [t("tQ1"), q(0.25), ""], [t("tMedian"), q(0.5), ""], [t("tQ3"), q(0.75), ""], [t("tHighest"), q(1), ""]];
    if (d.riket != null) rows.push([nm("0000"), fv(k, d.riket), ""]);
    state.sel.forEach((id) => rows.push([nm(id), fv(k, d.m.get(id)), d.m.has(id) ? String(d.rank.get(id)) : "–"]));
    return { caption: t("tCapStrip", { ind: kn(k), y: yearOf() }), cols: [t("tMeasure"), t("tValue"), t("tRank")], rows };
  }
  function trendTable() {
    if (!trendData || trendData.k !== state.kpi) return null;
    const { k, years, series, ids } = trendData, cols = [...state.sel.filter((id) => ids.includes(id)), "0000"];
    const rows = years.filter((y) => cols.some((id) => series.get(id).some((p) => p.y === y)))
      .map((y) => [String(y), ...cols.map((id) => { const p = series.get(id).find((q) => q.y === y); return p ? fv(k, p.v) : "–"; })]);
    return { caption: t("tCapTrend", { ind: kn(k) }), cols: [t("tYear"), ...cols.map(nm)], rows };
  }

  /* ---------- orchestration ---------- */
  function setLoading() {
    ["#strip", "#lists"].forEach((s) => ($(s).innerHTML = `<div class="loading">${t("loadingK")}</div>`));
    $("#mapLegend").innerHTML = "";
  }
  const errText = (m) => (m === "cover" ? t("errCover") : m);
  function showError(msg) {
    failed = msg;
    setStat("err", () => t("statusErr", { e: esc(errText(msg)) }));
    const e = `<div class="error">${t("errLoad", { e: esc(errText(msg)) })} <button class="btn sm" data-retry>${t("retry")}</button></div>`;
    ["#lists", "#strip", "#trend", "#profile"].forEach((s) => ($(s).innerHTML = e));
    ["#mapAns", "#listAns", "#stripAns", "#trendAns", "#profAns"].forEach((s) => ($(s).innerHTML = ""));
    document.querySelectorAll("[data-retry]").forEach((b) => b.addEventListener("click", () => { profileStarted = false; failed = null; boot(); }));
  }
  function setStat(st, fn) { stat = { st, fn }; SL.setStatus($("#status"), st, fn()); }
  async function update() {
    const my = ++updTok, k = state.kpi, def = kdef.get(k);
    $("#kpiSel").value = k;
    setLoading();
    try {
      await resolveLatest([k]);
      if (my !== updTok) return;
      const ly = latest.get(k);
      if (ly == null) throw new Error("cover");
      if (state.year != null && !avail.get(k).includes(state.year)) state.year = null;
      const y = yearOf();
      if (!vals.has(k + ":" + y)) { await fetchBatch([k], y); if (my !== updTok) return; }
    } catch (e) {
      if (my !== updTok) return;
      showError(e.message); return;
    }
    failed = null;
    fillYears(); renderInfo(); syncURL(); renderMapHead(); renderStatus();
    renderChips(); renderNetto(); paintMap(); renderStrip(); renderLists(); renderProfile(); loadTrend();
    loadProfile();
    if (!update.ready) { update.ready = true; window.dispatchEvent(new CustomEvent("sl:ready")); }
  }
  function renderMapHead() {
    const d = cur(), k = state.kpi, y = yearOf(), ly = latest.get(k);
    if (!d) return;
    $("#mapTitle").textContent = kn(k);
    $("#mapSub").textContent = t("mapSub", { y, late: y !== ly ? t("latestOf", { ly }) : "", n: d.n, all: geo.ids.length });
    $("#mapAns").innerHTML = mapAnswer(d);
  }
  function renderStatus() {
    const d = cur(), k = state.kpi, y = yearOf(), ly = latest.get(k);
    if (!d) return;
    setStat(d.n < MIN_COVER ? "stale" : "ok", () => t("statusOk", { title: esc(kn(k)), yl: t(y === ly ? "yLatest" : "yPlain"), y, late: y !== ly ? t("latestPar", { ly }) : "", t: SL.fmtTime(d.fetched) }));
  }
  function redraw() { paintMap(); renderStrip(); renderTrend(); }

  /* ---------- language ---------- */
  function applyLang() {
    SL.applyText(window.KOM_TEXT);
    $("#q").placeholder = t("search"); $("#q").setAttribute("aria-label", t("searchAria"));
    $("#map").setAttribute("aria-label", t("mapAria"));
    $("#zin").setAttribute("aria-label", t("zin")); $("#zout").setAttribute("aria-label", t("zout")); $("#zreset").setAttribute("aria-label", t("zreset"));
    $("#trendSeg").setAttribute("aria-label", t("trendScale")); $("#scaleSeg").setAttribute("aria-label", t("scale"));
    $("#scaleSeg").querySelector('[data-s="q"]').title = t("quantTip"); $("#scaleSeg").querySelector('[data-s="e"]').title = t("equalTip");
    if (stat) SL.setStatus($("#status"), stat.st, stat.fn());
  }
  function onLang() {
    applyLang(); buildKpiSelect();
    if (failed) return showError(failed);
    if (!update.ready) return;
    $("#hint").textContent = "";
    fillYears(); renderInfo(); renderMapHead(); renderChips(); renderNetto();
    renderStatus(); paintMap(); renderStrip(); renderLists(); renderTrend(); renderProfile();
  }

  async function boot() {
    setStat("stale", () => t("statusConn"));
    try {
      const [fc] = await Promise.all([SL.fetchJSON(GEO_URL, { timeout: 30000 }), loadAvail()]);
      geo.fc = fc;
      // d3 wants clockwise exterior rings; RFC 7946 data is counter-clockwise, which makes d3 fill the whole sphere except the shape
      fc.features.forEach((f) => { if (d3.geoArea(f) > 2 * Math.PI) { const g = f.geometry, rv = (poly) => poly.map((r) => r.slice().reverse()); g.coordinates = g.type === "Polygon" ? rv(g.coordinates) : g.coordinates.map(rv); } });
      fc.features.forEach((f) => { geo.names.set(f.properties.id, f.properties.kom_namn); geo.pts.set(f.properties.id, f.properties.geo_point_2d); });
      geo.ids = fc.features.map((f) => f.properties.id).sort();
    } catch (e) { showError(e.message); return; }
    failed = null;
    if (!boot.done) {
      readURL(); setupControls(); setupSearch(); setupZoomButtons();
      SL.tableToggle($("#mapLegend"), mapTable); SL.tableToggle($("#strip"), stripTable); SL.tableToggle($("#trend"), trendTable);
      SL.onResize(redraw); SL.onTheme(() => { redraw(); renderChips(); });
      boot.done = true;
    }
    update();
  }
  window.addEventListener("sl:lang", onLang);
  applyLang();
  boot();
})();
