/* Netto: take-home pay by kommun from Skatteverket's withholding tables, read live (CORS is open).
   No build step. Needs d3 v7, ../assets/js/core.js (window.SL) and i18n.js (NET_TEXT). */
(function () {
  "use strict";
  const TXT = window.NET_TEXT;
  const RS = "https://skatteverket.entryscape.net/rowstore/dataset/";
  const TAXES = RS + "88320397-5c32-4c16-ae79-d36d95b17b95/json", RATES = RS + "c67b320b-ffee-4876-b073-dd9236cd2a99/json";
  const GEO_URL = "../assets/geo/kommuner.geojson";
  // Constants of the tax year the tables cover (SKV 433); they change with the tables every December.
  const Y = { year: 2026, pbb: 59200, ibb: 83400, skikt: 643000 };
  const DEF = { sal: 40000, k: "1480" };
  const MAX_SAL = 5000000;
  const $ = (s) => document.querySelector(s);
  const esc = SL.esc, kr = (v) => SL.fmt(v, 0);

  const st = { sal: DEF.sal, k: DEF.k, old: false, church: false };
  window.NET_YEAR = Y.year;
  const koms = [], byId = new Map();   // kommun id -> { id, name, key, ex, church, muni, burial, pt }
  const geo = { fc: null };
  let ready = false, tok = 0, view = null;   // view: the last computed result set, reused by the map and lists

  const t = (k, v) => ((TXT[SL.lang()] || TXT.en)[k] ?? TXT.en[k] ?? k).replace(/\{(\w+)\}/g, (m, n) => (v && n in v ? v[n] : n === "y" ? Y.year : m));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const nm = (id) => (byId.get(id) || {}).name || id;

  /* ---------- Skatteverket data ---------- */
  const milli = (v) => Math.round(parseFloat(v) * 1000);
  const q = (base, o) => `${base}?${new URLSearchParams(o)}`;
  const get = (url) => SL.fetchJSON(url, { timeout: 30000, cacheMinutes: 360 });
  async function allRows(base, o) {
    const first = await get(q(base, { ...o, _limit: 500, _offset: 0 }));
    const more = [];
    for (let off = 500; off < first.resultCount; off += 500) more.push(get(q(base, { ...o, _limit: 500, _offset: off })));
    return first.results.concat(...(await Promise.all(more)).map((p) => p.results));
  }

  async function loadRates() {
    const rows = await allRows(RATES, { "år": Y.year });
    if (!rows.length) throw new Error(`no ${Y.year} rates`);
    const m = new Map();
    rows.forEach((r) => {
      const id = r["församlings-kod"].replace(/\s/g, "").slice(0, 4);
      let o = m.get(id);
      if (!o) m.set(id, (o = { ex: milli(r["summa, exkl. kyrkoavgift"]), burial: milli(r["begravnings-avgift"]), church: [] }));
      o.church.push(milli(r["kyrkoavgift"]));
    });
    m.forEach((o) => { o.church = Math.round(o.church.reduce((a, b) => a + b, 0) / o.church.length); });
    return m;
  }

  // Rows are 100 kr wide up to 20 000 and 200 kr wide up to 80 000 (the first one spans 1 to 2 000), so a row's lower bound can be asked for exactly.
  const rowStart = (s) => (s <= 2000 ? 1 : s <= 20000 ? 100 * Math.floor((s - 1) / 100) + 1 : 20001 + 200 * Math.floor((s - 20001) / 200));
  const amtCache = new Map();
  function loadAmt(s) {
    const fr = rowStart(s);
    if (!amtCache.has(fr)) {
      const p = get(q(TAXES, { "år": Y.year, "antal dgr": "30B", "inkomst fr.o.m.": fr, _limit: 50 })).then((d) => {
        if (!d.results.length) throw new Error("no table rows");
        return { kind: "amt", top: +d.results[0]["inkomst t.o.m."], by: new Map(d.results.map((r) => [+r.tabellnr, { 1: +r["kolumn 1"], 3: +r["kolumn 3"] }])) };
      });
      p.catch(() => amtCache.delete(fr));
      amtCache.set(fr, p);
    }
    return amtCache.get(fr);
  }
  let pctP = null;
  function loadPct() {
    if (!pctP) {
      pctP = allRows(TAXES, { "år": Y.year, "antal dgr": "30%" }).then((rows) => {
        const by = new Map();
        rows.forEach((r) => {
          const n = +r.tabellnr;
          if (!by.has(n)) by.set(n, []);
          by.get(n).push({ fr: +r["inkomst fr.o.m."], to: r["inkomst t.o.m."] === "" ? Infinity : +r["inkomst t.o.m."], 1: +r["kolumn 1"], 3: +r["kolumn 3"] });
        });
        return { kind: "pct", by };
      });
      pctP.catch(() => (pctP = null));
    }
    return pctP;
  }
  const loadTable = (s) => (s <= 80000 ? loadAmt(s) : loadPct());

  const tableNo = (m) => Math.min(42, Math.max(29, Math.ceil((m - 500) / 1000)));   // nearest whole percent, .5 rounds down
  function withheld(data, s, tbl, col) {
    if (data.kind === "amt") return data.by.get(tbl)[col];
    const row = data.by.get(tbl).find((r) => s >= r.fr && s <= r.to);
    return Math.round((s * row[col]) / 100);
  }

  /* ---------- the parts of the tax (SKV 433), only for the split in the bar ---------- */
  const up100 = (x) => Math.ceil(+(x / 100).toFixed(6)) * 100, down100 = (x) => Math.floor(+(x / 100).toFixed(6)) * 100;
  function basicAllowance(ffi, old) {
    const P = Y.pbb;
    const g = ffi <= 0.99 * P ? 0.423 * P : ffi <= 2.72 * P ? 0.423 * P + 0.2 * (ffi - 0.99 * P) : ffi <= 3.11 * P ? 0.77 * P : ffi <= 7.88 * P ? 0.77 * P - 0.1 * (ffi - 3.11 * P) : 0.293 * P;
    let h = 0;
    if (old) {
      h = ffi <= 0.91 * P ? 0.687 * P : ffi <= 1.11 * P ? 0.885 * P - ffi * 0.2 : ffi <= 1.965 * P ? 0.6 * P + ffi * 0.057 : ffi <= 2.72 * P ? 0.333 * P + ffi * 0.1949
        : ffi <= 3.11 * P ? ffi * 0.3949 - 0.212 * P : ffi <= 3.24 * P ? ffi * 0.4949 - 0.523 * P : ffi <= 5 * P ? ffi * 0.356 - 0.073 * P : ffi <= 7.88 * P ? 0.017 * P + ffi * 0.338
        : ffi <= 8.08 * P ? 0.703 * P + ffi * 0.251 : ffi <= 11.16 * P ? 2.732 * P : ffi <= 12.84 * P ? 9.651 * P - ffi * 0.62 : 1.691 * P;
    }
    return Math.min(up100(g + h), ffi);
  }
  const taxable = (annual, old) => { const ffi = down100(annual); return ffi - basicAllowance(ffi, old); };
  const stateOf = (bfi) => (bfi - Y.skikt >= 200 ? Math.floor(0.2 * (bfi - Y.skikt)) : 0);
  function stateStart(old) {
    for (let s = 30000; s < 400000; s += 100) if (stateOf(taxable(12 * s, old)) > 0) return s;
    return null;
  }

  function split(kom, s, data, c) {
    const annual = 12 * (data.kind === "amt" ? data.top : s), bfi = taxable(annual, st.old);
    const state = Math.round(stateOf(bfi) / 12);
    const ps = Math.min(Math.floor(bfi * 0.01), Math.floor(1.42 * Y.ibb * 0.01));
    const burial = Math.floor((bfi * kom.burial) / 100000), church = st.church ? Math.floor((bfi * kom.church) / 100000) : 0;
    const rest = Math.max(0, c.w - state);
    const fees = Math.min(rest, Math.round((ps + burial + church) / 12));
    return { keep: c.net, muni: rest - fees, state, fees };
  }

  /* ---------- computing every kommun for the current pay ---------- */
  function calcAll(s, data) {
    const col = st.old ? 3 : 1, rows = [];
    koms.forEach((k) => {
      const tot = st.church ? k.ex + k.church : k.ex, tbl = tableNo(tot), w = withheld(data, s, tbl, col);
      rows.push({ id: k.id, tbl, tot, w, net: s - w });
    });
    rows.sort((a, b) => b.net - a.net || a.tot - b.tot || byId.get(a.id).name.localeCompare(byId.get(b.id).name, "sv"));
    const map = new Map(rows.map((r) => [r.id, r]));
    return { s, data, rows, map, col };
  }

  /* ---------- URL and state ---------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    const sal = +String(p.get("sal") || "").replace(/\D/g, "");
    if (sal >= 1) st.sal = Math.min(sal, MAX_SAL);
    st.k = (p.get("k") || DEF.k).trim().padStart(4, "0");
    st.old = ["66", "o", "over"].includes((p.get("age") || "").toLowerCase());
    st.church = ["1", "true", "yes"].includes((p.get("ch") || "").toLowerCase());
    return ["sal", "k", "age", "ch"].some((k) => p.has(k));
  }
  function writeURL() {
    const p = new URLSearchParams(location.search);
    if (st.sal) p.set("sal", st.sal); else p.delete("sal");
    p.set("k", st.k);
    if (st.old) p.set("age", "66"); else p.delete("age");
    if (st.church) p.set("ch", "1"); else p.delete("ch");
    try { history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash); } catch (e) { /* sandboxed */ }
  }

  /* ---------- text and controls ---------- */
  function applyLang() {
    document.querySelectorAll("[data-t]").forEach((el) => { el.innerHTML = t(el.dataset.t); });
    $("#kq").placeholder = t("kPh");
    $("#zin").setAttribute("aria-label", t("zin")); $("#zout").setAttribute("aria-label", t("zout")); $("#zreset").setAttribute("aria-label", t("zreset"));
    $("#methods").innerHTML = ["m1", "m2", "m3", "m4", "m5", "m6"].map((k) => `<p>${t(k)}</p>`).join("");
    if (ready) { setStatus(); churchHint(); }
  }
  function setStatus() { SL.setStatus($("#status"), "ok", t("status")); }
  function churchHint() {
    const k = byId.get(st.k);
    $("#churchHint").textContent = k ? t("churchHint", { f: SL.fmt(k.church / 1000, 2), k: k.name }) : "";
  }
  function syncControls() {
    $("#sal").value = st.sal ? kr(st.sal) : "";
    $("#kq").value = nm(st.k);
    $("#church").checked = st.church;
    document.querySelectorAll("#ageSeg button").forEach((b) => b.classList.toggle("on", (b.dataset.a === "o") === st.old));
    churchHint();
  }

  /* kommun combobox */
  function setupSearch() {
    const input = $("#kq"), ul = $("#ksug"); let items = [], act = -1;
    const close = () => { ul.hidden = true; input.setAttribute("aria-expanded", "false"); act = -1; };
    function show(all) {
      const v = norm(input.value.trim());
      items = !v || all ? koms.slice(0, 8) : koms.filter((k) => k.key.startsWith(v)).concat(koms.filter((k) => !k.key.startsWith(v) && k.key.includes(v))).slice(0, 8);
      if (!items.length) { ul.innerHTML = `<li class="nohit" aria-disabled="true">${esc(t("noMatch"))}</li>`; ul.hidden = false; return; }
      act = 0;
      ul.innerHTML = items.map((k, i) => `<li role="option" id="ks${i}" data-id="${k.id}" aria-selected="${i === 0}"><span>${esc(k.name)}</span><small>${k.id}</small></li>`).join("");
      ul.hidden = false; input.setAttribute("aria-expanded", "true");
    }
    const mark = () => { ul.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", i === act)); input.setAttribute("aria-activedescendant", "ks" + act); ul.children[act].scrollIntoView({ block: "nearest" }); };
    function pick(id) { choose(id); input.blur(); close(); }
    input.addEventListener("focus", () => { input.select(); });
    input.addEventListener("input", () => show(false));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (ul.hidden) show(!input.value.trim()); else if (items.length) { act = (act + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; mark(); }
      } else if (e.key === "Enter") { e.preventDefault(); if (!ul.hidden && items[act]) pick(items[act].id); }
      else if (e.key === "Escape") { close(); input.value = nm(st.k); }
    });
    ul.addEventListener("pointerdown", (e) => { const li = e.target.closest("li[data-id]"); if (li) { e.preventDefault(); pick(li.dataset.id); } });
    input.addEventListener("blur", () => setTimeout(() => { close(); input.value = nm(st.k); }, 120));
  }
  function choose(id) {
    if (!byId.has(id)) return;
    st.k = id; $("#kq").value = nm(id); churchHint(); update();
  }

  function wire() {
    let timer;
    $("#sal").addEventListener("input", (e) => {
      const v = +e.target.value.replace(/\D/g, "");
      st.sal = v >= 1 ? Math.min(v, MAX_SAL) : 0;
      clearTimeout(timer); timer = setTimeout(update, 200);
    });
    $("#sal").addEventListener("blur", () => { $("#sal").value = st.sal ? kr(st.sal) : ""; });
    $("#church").addEventListener("change", (e) => { st.church = e.target.checked; update(); });
    $("#ageSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      st.old = b.dataset.a === "o";
      document.querySelectorAll("#ageSeg button").forEach((x) => x.classList.toggle("on", x === b));
      update();
    });
    addEventListener("sl:lang", () => { applyLang(); syncControls(); render(); });
    $("#copyLink").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); btn.textContent = t("copied"); } catch (err) { prompt("", location.href); }
      setTimeout(() => (btn.textContent = t("copy")), 2200);
    });
    $("#retry").addEventListener("click", init);
    SL.onResize(() => { M.built = false; paintMap(); });
    SL.onTheme(paintMap);
  }

  /* ---------- update: fetch the table row for this pay, compute, draw ---------- */
  function showPane(which) {
    ["ansLoad", "ansBody", "ansEmpty", "ansErr"].forEach((id) => ($("#" + id).hidden = id !== which));
  }
  async function update() {
    const my = ++tok;
    writeURL();
    if (!st.sal) { view = null; showPane("ansEmpty"); render(); return; }
    try {
      const data = await loadTable(st.sal);
      if (my !== tok) return;
      view = calcAll(st.sal, data);
      render();
    } catch (e) {
      if (my !== tok) return;
      SL.setStatus($("#status"), "err", t("statusErr", { e: SL.esc(e.message) }));
      $("#ansErrMsg").textContent = t("statusErr", { e: e.message });
      showPane("ansErr");
    }
  }

  function render() {
    if (view) { setStatus(); renderAnswer(); }
    renderLists(); paintMap();
  }

  function renderAnswer() {
    const s = view.s, k = byId.get(st.k), c = view.map.get(st.k);
    if (!k || !c) return;
    showPane("ansBody");
    const p = split(k, s, view.data, c);
    $("#bigNum").textContent = kr(c.net);
    const share = s ? Math.round((c.w / s) * 100) : 0;
    let sent = c.w ? t("sent", { tax: kr(c.w), share, k: k.name }) : t("sentZero", { k: k.name });
    const from = stateStart(st.old);
    if (p.state > 0) sent += " " + t("sentState", { s: kr(p.state), x: kr(from) });
    $("#sentence").textContent = sent;
    $("#yearly").textContent = t("ansYear", { n: kr(c.net * 12) });
    const parts = [
      ["keep", "kKeep", t("kKeepSub"), p.keep, "var(--c3)"],
      ["muni", "kMuni", t("kMuniSub"), p.muni, "var(--c1)"],
      ["state", "kState", p.state > 0 ? t("kStateOn", { x: kr(from) }) : t("kStateOff", { x: kr(from) }), p.state, "var(--c4)"],
      ["fees", "kFees", t(st.church ? "kFeesChurch" : "kFeesSub"), p.fees, "var(--c2)"]
    ];
    $("#bar").setAttribute("aria-label", parts.map((x) => `${t(x[1])} ${kr(x[3])} kr`).join(", "));
    $("#bar").innerHTML = parts.filter((x) => x[3] > 0).map((x) => `<span style="width:${(x[3] / s) * 100}%;background:${x[4]}" title="${esc(t(x[1]))}: ${kr(x[3])} kr"></span>`).join("");
    $("#bkey").innerHTML = parts.map((x) => `<li><i style="background:${x[4]}"></i><div><b>${esc(t(x[1]))}</b><div class="al"><span class="amt">${kr(x[3])} kr</span> <small>${x[3] > 0 && x[3] / s < 0.005 ? "&lt;1" : SL.fmt(s ? (x[3] / s) * 100 : 0, 0)} %</small></div><div class="subt">${esc(x[2])}</div></div></li>`).join("");
    $("#big80").hidden = s <= 80000;
    $("#meta").textContent = t("meta", { t: c.tbl, c: view.col, r: SL.fmt(c.tot / 1000, 2), k: k.name });
  }

  /* ---------- top and bottom five ---------- */
  function renderLists() {
    const spread = $("#spread"), rank = $("#rank"), best = $("#best"), worst = $("#worst");
    if (!view) { spread.textContent = ""; rank.textContent = ""; best.innerHTML = ""; worst.innerHTML = ""; return; }
    const rows = view.rows, me = view.map.get(st.k), top = rows.slice(0, 5), bot = rows.slice(-5).reverse();
    const d = rows[0].net - rows[rows.length - 1].net;
    spread.textContent = d > 0 ? t("spread", { d: kr(d), y: kr(d * 12), a: nm(rows[0].id), b: nm(rows[rows.length - 1].id) }) : t("spreadNone");
    rank.textContent = me ? t("rank", { k: nm(st.k), r: 1 + rows.filter((r) => r.net > me.net).length, n: rows.length }) : "";
    const li = (r) => {
      const dm = me ? r.net - me.net : 0;
      const sub = r.id === st.k ? t("rowYou") : t("rowDiff", { m: SL.signed(dm, 0), y: SL.signed(dm * 12, 0), k: nm(st.k) });
      return `<li><button type="button" data-id="${r.id}" class="${r.id === st.k ? "on" : ""}"><span class="nm">${esc(nm(r.id))} <em>${SL.fmt(r.tot / 1000, 2)} %</em></span><span class="vl">${kr(r.net)} kr</span><small>${esc(sub)}</small></button></li>`;
    };
    best.innerHTML = top.map(li).join(""); worst.innerHTML = bot.map(li).join("");
    document.querySelectorAll(".rows button").forEach((b) => b.addEventListener("click", () => choose(b.dataset.id)));
  }

  /* ---------- map ---------- */
  const M = { built: false, w: 0, h: 0, svg: null, g: null, kp: null, gs: null, proj: null, zoom: null, k: 1 };
  function ramp(n) {
    const dark = SL.isDark(), acc = SL.css("--h-blue"), sur = SL.css("--surface");
    const lo = d3.interpolateLab(sur, acc)(dark ? 0.2 : 0.13), hi = dark ? d3.color(acc).brighter(0.7) : d3.color(acc).darker(1.1);
    return d3.quantize(d3.interpolateLab(lo, hi), Math.max(n, 2)).slice(0, Math.max(n, 1));
  }
  function buildMap() {
    const box = $("#map"), w = box.clientWidth, h = box.clientHeight;
    if (!w || !h || !geo.fc) return false;
    M.w = w; M.h = h; M.built = true;
    box.innerHTML = "";
    const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("role", "img").attr("aria-label", t("mapLabel"));
    M.svg = svg;
    M.proj = d3.geoConicConformal().rotate([-15, 0]).parallels([57, 66]).fitExtent([[6, 6], [w - 6, h - 6]], geo.fc);
    const path = d3.geoPath(M.proj);
    M.g = svg.append("g");
    M.kp = M.g.append("g");
    M.kp.selectAll("path").data(geo.fc.features).join("path").attr("class", "k").attr("d", path)
      .on("pointermove", (e, f) => mapTip(e, f.properties.id))
      .on("pointerleave", () => SL.hideTip())
      .on("click", (e, f) => { choose(f.properties.id); mapTip(e, f.properties.id); });
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
    if (!view) return;
    const r = view.map.get(id), me = view.map.get(st.k);
    let h = `<b>${esc(nm(id))}</b> <span style="opacity:.7">${id}</span><br>`;
    if (!r) h += esc(t("tipNone"));
    else {
      h += `<b>${kr(r.net)} kr</b><br>${esc(t("tipTable", { t: r.tbl, r: SL.fmt(r.tot / 1000, 2) }))}`;
      h += "<br>" + (id === st.k ? esc(t("tipSame")) : esc(t("tipDiff", { d: SL.signed(r.net - me.net, 0), k: nm(st.k) })));
    }
    SL.tip(e, h);
  }
  function paintMap() {
    const legend = $("#mapLegend");
    if (!view) { legend.innerHTML = ""; $("#mapSub").textContent = ""; return; }
    if (!M.built || Math.abs(M.w - $("#map").clientWidth) > 1 || Math.abs(M.h - $("#map").clientHeight) > 1) { if (!buildMap()) return; }
    const vals = [...new Set(view.rows.map((r) => r.net))].sort((a, b) => a - b), cols = ramp(vals.length), none = SL.css("--border");
    const col = new Map(vals.map((v, i) => [v, cols[i]])), count = new Map();
    view.rows.forEach((r) => count.set(r.net, (count.get(r.net) || 0) + 1));
    M.kp.selectAll("path").attr("fill", (f) => { const r = view.map.get(f.properties.id); return r ? col.get(r.net) : none; });
    M.gs.selectAll("*").remove();
    const f = geo.fc.features.find((x) => x.properties.id === st.k);
    if (f) {
      const pt = M.proj([f.properties.geo_point_2d[1], f.properties.geo_point_2d[0]]);
      M.gs.append("path").attr("class", "sel").attr("d", d3.geoPath(M.proj)(f));
      const g = M.gs.append("g").attr("transform", `translate(${pt})`);
      g.append("circle").attr("class", "ring");
      g.append("text").attr("class", "mlab").text(nm(st.k));
    }
    scaleOverlay();
    $("#mapTbl").replaceChildren(document.createElement("i"));   // the table toggle rebuilds when this element's children change
    const n = vals.length;
    $("#mapSub").textContent = t("mapSub", { sal: kr(view.s), prof: profile() });
    legend.innerHTML = `<div class="bar">${vals.map((v) => `<i style="background:${col.get(v)}" title="${kr(v)} kr · ${count.get(v)}"></i>`).join("")}</div>` +
      `<div class="ticks">${vals.map((v, i) => (i === 0 || i === n - 1 || n <= 5 || (i % 2 === 0 && i < n - 2) ? `<span class="${i === 0 ? "first" : i === n - 1 ? "last" : ""}" style="left:${(((i + 0.5) / n) * 100).toFixed(2)}%">${kr(v)}</span>` : "")).join("")}</div>` +
      `<div class="note">${esc(t("legNote"))}</div>`;
  }
  const profile = () => (st.church ? ", " + t("profChurch") : "") + (st.old ? ", " + t("profOld") : "");
  function setupZoom() {
    const by = (f) => () => M.svg && M.svg.transition().duration(220).call(M.zoom.scaleBy, f);
    $("#zin").addEventListener("click", by(1.7)); $("#zout").addEventListener("click", by(1 / 1.7));
    $("#zreset").addEventListener("click", () => M.svg && M.svg.transition().duration(260).call(M.zoom.transform, d3.zoomIdentity));
  }

  /* ---------- start ---------- */
  async function init() {
    showPane("ansLoad");
    SL.setStatus($("#status"), "stale", t("loading"));
    try {
      const [fc, rates] = await Promise.all([SL.fetchJSON(GEO_URL, { timeout: 20000 }), loadRates()]);
      // The file uses RFC 7946 winding; d3 reads it as the whole sphere minus the kommun unless the ring is flipped.
      fc.features.forEach((f) => { if (d3.geoArea(f) > 2 * Math.PI) { const g = f.geometry, rv = (poly) => poly.map((r) => r.slice().reverse()); g.coordinates = g.type === "Polygon" ? rv(g.coordinates) : g.coordinates.map(rv); } });
      geo.fc = fc;
      koms.length = 0; byId.clear();
      fc.features.forEach((f) => {
        const r = rates.get(f.properties.id);
        if (!r) return;
        const k = { id: f.properties.id, name: f.properties.kom_namn, key: norm(f.properties.kom_namn), ex: r.ex, church: r.church, burial: r.burial };
        koms.push(k); byId.set(k.id, k);
      });
      koms.sort((a, b) => a.name.localeCompare(b.name, "sv"));
      if (!byId.has(st.k)) st.k = DEF.k;
      ready = true;
      applyLang(); syncControls();
      if (!$("#ksug").dataset.on) { setupSearch(); $("#ksug").dataset.on = "1"; }
      M.built = false;
      await update();
      if (!$("#mapTbl").dataset.on) {
        $("#mapTbl").dataset.on = "1";
        SL.tableToggle($("#mapTbl"), () => view && { caption: t("tblCap", { sal: kr(view.s), prof: profile() }), cols: [t("tcK"), t("tcRate"), t("tcTax"), t("tcNet")], rows: view.rows.map((r) => [nm(r.id), SL.fmt(r.tot / 1000, 2) + " %", r.w, r.net]) });
      }
      if (view || !st.sal) { window.dispatchEvent(new CustomEvent("sl:ready")); }
    } catch (e) {
      SL.setStatus($("#status"), "err", t("statusErr", { e: SL.esc(e.message) }));
      $("#ansErrMsg").textContent = t("statusErr", { e: e.message });
      showPane("ansErr");
    }
  }

  SL.initLang();
  const hadParams = readURL();
  applyLang();
  wire(); setupZoom();
  if (hadParams) writeURL();
  init();
})();
