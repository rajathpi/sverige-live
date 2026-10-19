/* Löner: salaries by occupation from SCB's salary structure statistics, read live from PxWebApi 2.0.
   No build step. Needs d3 v7, ../assets/js/core.js (window.SL) and i18n.js (LON_TEXT, LON_FIELDS, LON_EDU, LON_REGIONS). */
(function () {
  "use strict";
  const API = "https://api.scb.se/ov0104/v2beta/api/v2/tables";
  const JOBS = "https://jobsearch.api.jobtechdev.se/search";
  const TAXO = "https://taxonomy.api.jobtechdev.se/v1/taxonomy/specific/concepts/ssyk";
  const TXT = window.LON_TEXT, FIELDS = window.LON_FIELDS, EDU = window.LON_EDU, REGIONS = window.LON_REGIONS;
  const NEW_FROM = 2023;            // SCB split the series: 2014–2022 in one table, 2023 onwards in another
  const MAXSEL = 5, PROJ_YEARS = 3, ALL = "0000";
  const SEXES = ["1+2", "2", "1"];
  const NOT_OCC = new Set([ALL, "0001", "0002"]);   // "all", "other", "unidentifiable"
  const DEFAULT_SEL = ["2512", "2221", "2341"];     // software developers, nurses, compulsory school teachers

  // Each topic has an older and a newer table; the content codes differ between them.
  const TABS = {
    disp: { old: "TAB4265", new: "TAB5932", c: {
      old: { avg: "000000C5", med: "000000C6", p10: "000000C7", p25: "000000C8", p75: "000000C9", p90: "000000CA" },
      new: { avg: "000007CD", med: "000007CE", p10: "000007CF", p25: "000007CG", p75: "000007CH", p90: "000007CI" } } },
    edu: { old: "TAB4263", new: "TAB5841", dim: "UtbildningsNiva", c: { old: { avg: "000000C0", n: "000000BX" }, new: { avg: "000007BH", n: "000007BE" } } },
    age: { old: "TAB4264", new: "TAB5844", dim: "Alder", c: { old: { avg: "000000C4", n: "000000C1" }, new: { avg: "000007BN", n: "000007BK" } } },
    reg: { old: "TAB4262", new: "TAB5696", dim: "Region", c: { old: { avg: "000000BW", n: "000000BT" }, new: { avg: "000007AS", n: "000007AP" } } }
  };
  const GROUPS_TAB = "TAB5709";
  const $ = (s) => document.querySelector(s);
  const esc = SL.esc;
  const isNum = (v) => v != null && isFinite(v);

  /* ---------- state ---------- */
  const st = { sel: [], sector: "0", sex: "1+2", year: null, meas: "med", proj: true, idx: false, lb: "top", lang: "en", mine: null };
  const slots = new Map();
  const META = { occ: { en: {}, sv: {} }, grp: { en: {}, sv: {} }, sec: { en: [], sv: [] }, years: [], notes: { en: [], sv: [] }, updated: null };
  const DISP = new Map();     // sector|code -> { sex: { year: {avg,med,p10,p25,p75,p90} } }
  const BRK = new Map();      // kind|sector|year|code -> { sex: { cat: {avg,n} } }
  const LB = new Map();       // sector|year -> Map(code -> {med, avg, w, m, n, med5, y5})
  const CONCEPT = new Map();  // ssyk code -> JobTech concept id
  const SNAP = { d: null }, FC = { d: null };  // ../data/loner.json and ../data/loner-forecast.json, written nightly
  let tok = 0, ready = false;

  const t = (k, vars) => { let s = (TXT[st.lang] && TXT[st.lang][k]) ?? TXT.en[k] ?? k; if (vars) for (const [a, b] of Object.entries(vars)) s = s.split("{" + a + "}").join(b); return s; };
  const occName = (c) => (c === ALL ? t("allOcc") : META.occ[st.lang][c] || META.occ.en[c] || c);
  const secName = (c) => { const r = META.sec[st.lang].find((x) => x[0] === c) || META.sec.en.find((x) => x[0] === c); return r ? r[1] : c; };
  const sexName = (k) => t(k === "2" ? "women" : k === "1" ? "men" : "total");
  const kr = (v) => (isNum(v) ? SL.fmt(v) + " kr" : "–");
  const kAxis = (v) => (st.lang === "sv" ? SL.fmt(v / 1000) + " tkr" : SL.fmt(v / 1000) + "k");
  const colOf = (c) => (c === ALL ? "var(--c8)" : `var(--c${(slots.get(c) ?? 0) + 1})`);
  const tabFor = (kind, y) => (y >= NEW_FROM ? "new" : "old");
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const lastYear = () => META.years[META.years.length - 1];

  /* ---------- SCB access: json-stat2, at most 25 calls per 10 s (the API allows 30) ---------- */
  const stamps = []; let active = 0;
  async function slot() {
    for (;;) {
      const now = Date.now();
      while (stamps.length && now - stamps[0] > 10500) stamps.shift();
      if (active < 4 && stamps.length < 25) { active++; stamps.push(now); return; }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  async function limited(f) { await slot(); try { return await f(); } finally { active--; } }
  function scb(tab, sel, lang = "en") {
    const p = new URLSearchParams({ lang, outputFormat: "json-stat2" });
    for (const [k, v] of Object.entries(sel)) p.append(`valueCodes[${k}]`, v.join(","));
    return limited(() => SL.fetchJSON(`${API}/${tab}/data?${p}`, { timeout: 30000, cacheMinutes: 180 }));
  }
  const scbMeta = (tab, lang) => limited(() => SL.fetchJSON(`${API}/${tab}/metadata?lang=${lang}`, { timeout: 30000, cacheMinutes: 720 }));

  function cube(js) {
    const ids = js.id, size = js.size;
    const idx = ids.map((i) => { const x = js.dimension[i].category.index; return Array.isArray(x) ? Object.fromEntries(x.map((c, n) => [c, n])) : x; });
    const stride = []; let s = 1;
    for (let k = ids.length - 1; k >= 0; k--) { stride[k] = s; s *= size[k]; }
    return {
      get(o) {
        let i = 0;
        for (let k = 0; k < ids.length; k++) {
          const c = o[ids[k]], n = c == null ? 0 : idx[k][c];
          if (n == null) return null;
          i += n * stride[k];
        }
        const v = js.value[i];
        return v == null ? null : +v;
      },
      codes: (id) => { const x = idx[ids.indexOf(id)]; return Object.keys(x).sort((a, b) => x[a] - x[b]); }
    };
  }

  // The nightly snapshot carries names and the default sector's figures, so the first view needs no SCB call.
  async function loadSnap() {
    const get = (u) => SL.fetchJSON(u, { timeout: 15000 }).catch(() => null);
    const [s, f] = await Promise.all([get("../data/loner.json"), get("../data/loner-forecast.json")]);
    FC.d = f && f.f ? f : null;
    if (!s || !s.meta || !s.occ) return false;
    SNAP.d = s;
    Object.assign(META, { occ: s.meta.occ, grp: s.meta.grp, sec: s.meta.sec, years: s.years, notes: s.meta.notes, updated: s.updated });
    return true;
  }
  // An occupation missing from the snapshot has no published figures in that sector, so it is not fetched either.
  function fromSnap(codes) {
    const d = SNAP.d;
    if (!d || st.sector !== d.sector) return codes;
    codes.forEach((c) => {
      const o = d.occ[c], rec = {};
      if (o) d.sexes.forEach((k, si) => {
        rec[k] = {};
        d.years.forEach((y, yi) => { const r = {}; d.measures.forEach((m, mi) => (r[m] = o[si][mi][yi])); if (Object.values(r).some(isNum)) rec[k][y] = r; });
      });
      DISP.set(st.sector + "|" + c, rec);
    });
    return [];
  }

  async function loadMeta() {
    const [en, sv, gen, gsv] = await Promise.all([scbMeta(TABS.disp.new, "en"), scbMeta(TABS.disp.new, "sv"), scbMeta(GROUPS_TAB, "en"), scbMeta(GROUPS_TAB, "sv")]);
    const lab = (m, d) => m.dimension[d].category.label;
    META.occ.en = lab(en, "Yrke2012"); META.occ.sv = lab(sv, "Yrke2012");
    META.grp.en = lab(gen, "Yrkesgrupp12"); META.grp.sv = lab(gsv, "Yrkesgrupp12");
    const secs = (m) => { const c = m.dimension.Sektor.category; return Object.keys(c.index).sort((a, b) => c.index[a] - c.index[b]).map((k) => [k, c.label[k]]); };
    META.sec.en = secs(en); META.sec.sv = secs(sv);
    const ny = Object.keys(en.dimension.Tid.category.index).map(Number);
    META.years = d3.range(2014, NEW_FROM).concat(ny).sort((a, b) => a - b);
    META.notes.en = en.note || []; META.notes.sv = sv.note || [];
    META.updated = en.updated;
  }

  /* ---------- data loaders ---------- */
  async function loadDisp(codes) {
    const need = fromSnap(codes.filter((c) => !DISP.has(st.sector + "|" + c)));
    if (!need.length) return;
    const sector = st.sector;
    const parts = await Promise.all(["old", "new"].map((w) => scb(TABS.disp[w], {
      Sektor: [sector], Yrke2012: need, Kon: SEXES, ContentsCode: Object.values(TABS.disp.c[w]), Tid: ["*"]
    }).then((js) => ({ w, cb: cube(js) }))));
    need.forEach((c) => {
      const rec = {};
      SEXES.forEach((k) => {
        rec[k] = {};
        parts.forEach(({ w, cb }) => cb.codes("Tid").forEach((y) => {
          const r = {};
          for (const [m, code] of Object.entries(TABS.disp.c[w])) r[m] = cb.get({ Sektor: sector, Yrke2012: c, Kon: k, ContentsCode: code, Tid: y });
          if (Object.values(r).some(isNum)) rec[k][+y] = r;
        }));
      });
      DISP.set(sector + "|" + c, rec);
    });
  }
  const disp = (c, k, y) => { const r = DISP.get(st.sector + "|" + c); return r && r[k] && r[k][y] ? r[k][y] : null; };

  async function loadBreak(kind, codes, year) {
    const key = (c) => [kind, st.sector, year, c].join("|");
    const need = codes.filter((c) => !BRK.has(key(c)));
    if (!need.length) return;
    const T = TABS[kind], w = tabFor(kind, year), cc = T.c[w], sector = st.sector;
    const cb = cube(await scb(T[w], { Sektor: [sector], Yrke2012: need, Kon: SEXES, [T.dim]: ["*"], ContentsCode: [cc.avg, cc.n], Tid: [String(year)] }));
    const cats = cb.codes(T.dim);
    need.forEach((c) => {
      const rec = {};
      SEXES.forEach((k) => {
        rec[k] = {};
        cats.forEach((cat) => {
          const o = { Sektor: sector, Yrke2012: c, Kon: k, [T.dim]: cat, Tid: String(year) };
          rec[k][cat] = { avg: cb.get({ ...o, ContentsCode: cc.avg }), n: cb.get({ ...o, ContentsCode: cc.n }) };
        });
      });
      BRK.set(key(c), rec);
    });
  }
  const brk = (kind, c, k, cat) => { const r = BRK.get([kind, st.sector, st.year, c].join("|")); return r && r[k] ? r[k][cat] : null; };

  async function loadBoard(year) {
    const key = st.sector + "|" + year;
    if (LB.has(key)) return LB.get(key);
    const d = SNAP.d;
    if (d && st.sector === d.sector && year === d.empYear) {
      const yi = d.years.indexOf(year), y5 = Math.max(2014, year - 5), i5 = d.years.indexOf(y5);
      const S = (k) => d.sexes.indexOf(k), M = (k) => d.measures.indexOf(k), m = new Map();
      for (const [c, o] of Object.entries(d.occ)) m.set(c, { med: o[S("1+2")][M("med")][yi], avg: o[S("1+2")][M("avg")][yi], w: o[S("2")][M("med")][yi], m: o[S("1")][M("med")][yi], n: d.emp[c] ?? null, med5: o[S("1+2")][M("med")][i5], y5 });
      LB.set(key, m);
      return m;
    }
    const sector = st.sector, y5 = Math.max(2014, year - 5);
    const w = tabFor("disp", year), cc = TABS.disp.c[w];
    const w5 = tabFor("disp", y5), cc5 = TABS.disp.c[w5];
    const we = tabFor("edu", year), ce = TABS.edu.c[we];
    const [cur, old, emp] = await Promise.all([
      scb(TABS.disp[w], { Sektor: [sector], Yrke2012: ["*"], Kon: SEXES, ContentsCode: [cc.med, cc.avg], Tid: [String(year)] }).then(cube),
      y5 < year ? scb(TABS.disp[w5], { Sektor: [sector], Yrke2012: ["*"], Kon: ["1+2"], ContentsCode: [cc5.med], Tid: [String(y5)] }).then(cube) : null,
      scb(TABS.edu[we], { Sektor: [sector], Yrke2012: ["*"], Kon: ["1+2"], UtbildningsNiva: ["TOTALT"], ContentsCode: [ce.n], Tid: [String(year)] }).then(cube)
    ]);
    const m = new Map();
    cur.codes("Yrke2012").forEach((c) => {
      const g = (k, code) => cur.get({ Sektor: sector, Yrke2012: c, Kon: k, ContentsCode: code, Tid: String(year) });
      m.set(c, {
        med: g("1+2", cc.med), avg: g("1+2", cc.avg), w: g("2", cc.med), m: g("1", cc.med),
        n: emp.get({ Sektor: sector, Yrke2012: c, Kon: "1+2", UtbildningsNiva: "TOTALT", ContentsCode: ce.n, Tid: String(year) }),
        med5: old ? old.get({ Sektor: sector, Yrke2012: c, Kon: "1+2", ContentsCode: cc5.med, Tid: String(y5) }) : null, y5
      });
    });
    LB.set(key, m);
    return m;
  }

  /* ---------- helpers on series ---------- */
  // The model forecast covers the median in the snapshot's sector; anything else falls back to the simple projection.
  const fc = (c, meas = st.meas) => { const f = FC.d; return f && st.sector === f.sector && meas === "med" && f.base === lastYear() && f.f[c] && f.f[c][st.sex] ? f.f[c][st.sex] : null; };
  function series(c, k, m) { return META.years.map((y) => [y, disp(c, k, y)?.[m] ?? null]); }
  function growth(pts) { // average yearly change over the last five years with data
    const ok = pts.filter((p) => isNum(p[1]));
    if (ok.length < 2) return null;
    const L = ok[ok.length - 1], F = ok.find((p) => p[0] >= L[0] - 5) || ok[0];
    if (F[0] === L[0]) return null;
    return { g: Math.pow(L[1] / F[1], 1 / (L[0] - F[0])) - 1, from: F[0], to: L[0], last: L };
  }
  function percentileOf(r, v) {
    const pts = [[10, r.p10], [25, r.p25], [50, r.med], [75, r.p75], [90, r.p90]].filter((p) => isNum(p[1]));
    if (pts.length < 2) return null;
    if (v < pts[0][1]) return { below: true, p: pts[0][0] };
    if (v > pts[pts.length - 1][1]) return { above: true, p: pts[pts.length - 1][0] };
    for (let i = 1; i < pts.length; i++) {
      const [p0, v0] = pts[i - 1], [p1, v1] = pts[i];
      if (v <= v1) return { p: v1 === v0 ? p1 : p0 + (p1 - p0) * (v - v0) / (v1 - v0) };
    }
    return null;
  }

  /* ---------- selection, chips, search, browser ---------- */
  function setSlot(c) { if (slots.has(c)) return; const used = new Set(slots.values()); let s = 0; while (used.has(s)) s++; slots.set(c, s); }
  function add(c) {
    if (st.sel.includes(c)) { focus(c); return; }
    if (st.sel.length >= MAXSEL) { hint(t("max")); return; }
    st.sel.push(c); setSlot(c); changed();
  }
  function remove(c) { st.sel = st.sel.filter((x) => x !== c); slots.delete(c); changed(); }
  function focus(c) { st.sel = [c, ...st.sel.filter((x) => x !== c)]; changed(); }
  function hint(s) { const el = $("#hint"); el.textContent = s; clearTimeout(hint.t); hint.t = setTimeout(() => (el.textContent = ""), 3500); }

  function renderChips() {
    const el = $("#chips");
    if (!st.sel.length) { el.innerHTML = `<span class="none">${esc(t("none"))}</span>`; return; }
    el.innerHTML = st.sel.map((c, i) => `<span class="chip${i === 0 ? " lead" : ""}" style="--sc:${colOf(c)}"><button class="nm" type="button" data-f="${c}" title="${esc(t("focus"))}"><span class="dot"></span>${esc(occName(c))} <small>${c}</small></button><button class="x" type="button" data-x="${c}" aria-label="${esc(t("remove"))} ${esc(occName(c))}">×</button></span>`).join("");
  }

  let sugItems = [], sugIdx = -1;
  function searchIndex() {
    return Object.keys(META.occ.en).filter((c) => !NOT_OCC.has(c)).map((c) => ({ c, s: norm(c + " " + META.occ.en[c] + " " + (META.occ.sv[c] || "")) }));
  }
  let SIDX = null;
  function suggest() {
    const q = norm($("#q").value.trim()), ul = $("#sug");
    if (!q) { ul.hidden = true; $("#q").setAttribute("aria-expanded", "false"); return; }
    SIDX = SIDX || searchIndex();
    const words = q.split(/\s+/);
    const board = LB.get(st.sector + "|" + st.year);
    sugItems = SIDX.filter((x) => words.every((w) => x.s.includes(w)))
      .map((x) => ({ ...x, score: (x.c.startsWith(q) ? 3 : 0) + (norm(occName(x.c)).startsWith(words[0]) ? 2 : 0) + (x.s.includes(" " + words[0]) ? 1 : 0) }))
      .sort((a, b) => b.score - a.score || occName(a.c).localeCompare(occName(b.c))).slice(0, 14);
    sugIdx = sugItems.length ? 0 : -1;
    ul.innerHTML = sugItems.length ? sugItems.map((x, i) => {
      const md = board && board.get(x.c) ? board.get(x.c).med : null;
      return `<li role="option" id="sug${i}" data-c="${x.c}" aria-selected="${i === sugIdx}"><span>${esc(occName(x.c))} <small>${x.c}</small></span><small>${isNum(md) ? kr(md) : ""}</small></li>`;
    }).join("") : `<li class="nohit">${esc(t("empty"))}</li>`;
    ul.hidden = false; $("#q").setAttribute("aria-expanded", "true");
  }
  function pick(c) { $("#q").value = ""; $("#sug").hidden = true; add(c); $("#q").focus(); }

  function renderBrowser() {
    const el = $("#browser"), board = LB.get(st.sector + "|" + st.year);
    const codes = Object.keys(META.occ.en).filter((c) => !NOT_OCC.has(c));
    const groups = Object.keys(META.grp.en).filter((g) => g.length === 3);
    el.innerHTML = Object.keys(FIELDS).map((f) => {
      const gs = groups.filter((g) => g[0] === f);
      const n = codes.filter((c) => c[0] === f).length;
      return `<details class="fieldset"><summary><b>${f}</b> ${esc(FIELDS[f][st.lang])} <small>${n}</small></summary>` + gs.map((g) => {
        const occs = codes.filter((c) => c.startsWith(g));
        return `<details class="grp"><summary><b>${g}</b> ${esc(META.grp[st.lang][g] || META.grp.en[g])} <small>${occs.length}</small></summary><ul>` + occs.map((c) => {
          const md = board && board.get(c) ? board.get(c).med : null;
          const on = st.sel.includes(c);
          return `<li><button type="button" data-add="${c}" class="${on ? "on" : ""}"><b>${c}</b> ${esc(occName(c))}<small>${isNum(md) ? kr(md) : ""}</small></button></li>`;
        }).join("") + "</ul></details>";
      }).join("") + "</details>";
    }).join("");
  }

  /* ---------- URL ---------- */
  function readURL() {
    const p = new URLSearchParams(location.search);
    let lang = p.get("lang"); try { lang = lang || localStorage.getItem("slLang") || localStorage.getItem("lonLang"); } catch (e) { /* ignore */ }
    if (lang === "sv" || lang === "en") st.lang = lang;
    const o = (p.get("o") || "").split(",").filter((c) => /^\d{4}$/.test(c) && META.occ.en[c] && !NOT_OCC.has(c));
    st.sel = (o.length ? o : DEFAULT_SEL).slice(0, MAXSEL);
    st.sel.forEach(setSlot);
    if (META.sec.en.some((x) => x[0] === p.get("s"))) st.sector = p.get("s");
    if (SEXES.includes(p.get("k"))) st.sex = p.get("k");
    const y = +p.get("y"); st.year = META.years.includes(y) ? y : lastYear();
    if (["med", "avg", "p10", "p25", "p75", "p90"].includes(p.get("m"))) st.meas = p.get("m");
    if (["top", "low", "grow", "big", "gap"].includes(p.get("lb"))) st.lb = p.get("lb");
  }
  function writeURL() {
    const p = new URLSearchParams(location.search);
    const set = (k, v, def) => (v === def ? p.delete(k) : p.set(k, v));
    p.set("o", st.sel.join(",")); if (!st.sel.length) p.delete("o");
    set("s", st.sector, "0"); set("k", st.sex, "1+2"); set("y", String(st.year), String(lastYear()));
    set("m", st.meas, "med"); set("lb", st.lb, "top"); set("lang", st.lang, "en");
    const qs = p.toString().replace(/%2C/g, ",");
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  /* ---------- static text and controls ---------- */
  function applyLang() {
    document.documentElement.lang = st.lang;
    document.querySelectorAll("[data-t]").forEach((el) => { el.innerHTML = t(el.dataset.t); });
    $("#q").placeholder = t("search"); $("#q").setAttribute("aria-label", t("search"));
    $("#browseBtn").textContent = $("#browser").hidden ? t("browse") : t("hideBrowse");
    document.querySelectorAll("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.l === st.lang));
    $("#secSel").innerHTML = META.sec[st.lang].map(([c, l]) => `<option value="${c}">${esc(cap(l))}</option>`).join("");
    $("#secSel").value = st.sector;
    $("#yearSel").innerHTML = META.years.slice().reverse().map((y) => `<option>${y}</option>`).join("");
    $("#yearSel").value = st.year;
    document.querySelectorAll("#sexSeg button").forEach((b) => b.classList.toggle("on", b.dataset.k === st.sex));
    document.querySelectorAll("#measSeg button").forEach((b) => b.classList.toggle("on", b.dataset.m === st.meas));
    document.querySelectorAll("#lbSeg button").forEach((b) => b.classList.toggle("on", b.dataset.b === st.lb));
    renderMethods();
  }

  function wire() {
    $("#q").addEventListener("input", suggest);
    $("#q").addEventListener("keydown", (e) => {
      const ul = $("#sug");
      if (ul.hidden || !sugItems.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        sugIdx = (sugIdx + (e.key === "ArrowDown" ? 1 : -1) + sugItems.length) % sugItems.length;
        ul.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", i === sugIdx));
        $("#q").setAttribute("aria-activedescendant", "sug" + sugIdx);
        ul.children[sugIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") { e.preventDefault(); pick(sugItems[sugIdx].c); }
      else if (e.key === "Escape") { ul.hidden = true; }
    });
    $("#sug").addEventListener("mousedown", (e) => { const li = e.target.closest("li[data-c]"); if (li) { e.preventDefault(); pick(li.dataset.c); } });
    $("#q").addEventListener("blur", () => setTimeout(() => ($("#sug").hidden = true), 120));
    $("#chips").addEventListener("click", (e) => {
      const x = e.target.closest("[data-x]"), f = e.target.closest("[data-f]");
      if (x) remove(x.dataset.x); else if (f) focus(f.dataset.f);
    });
    $("#browseBtn").addEventListener("click", () => {
      const b = $("#browser"); b.hidden = !b.hidden;
      $("#browseBtn").setAttribute("aria-expanded", String(!b.hidden));
      $("#browseBtn").textContent = b.hidden ? t("browse") : t("hideBrowse");
      if (!b.hidden) renderBrowser();
    });
    $("#browser").addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]"); if (!b) return;
      const c = b.dataset.add;
      if (st.sel.includes(c)) remove(c); else add(c);
      $("#browser").querySelectorAll(`[data-add="${c}"]`).forEach((x) => x.classList.toggle("on", st.sel.includes(c)));
    });
    $("#copyLink").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href); hint(t("copied")); } catch (e) { prompt("", location.href); }
    });
    $("#clearSel").addEventListener("click", () => { st.sel = []; slots.clear(); changed(); });
    $("#secSel").addEventListener("change", (e) => { st.sector = e.target.value; changed(true); });
    $("#yearSel").addEventListener("change", (e) => { st.year = +e.target.value; changed(true); });
    $("#sexSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { st.sex = b.dataset.k; applyLang(); changed(); } });
    $("#measSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { st.meas = b.dataset.m; applyLang(); writeURL(); drawTrend(); } });
    $("#lbSeg").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { st.lb = b.dataset.b; applyLang(); writeURL(); drawBoard(); } });
    $("#langSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      st.lang = b.dataset.l; try { localStorage.setItem("slLang", st.lang); localStorage.setItem("lonLang", st.lang); } catch (err) { /* ignore */ }
      applyLang(); if (!$("#browser").hidden) renderBrowser(); writeURL(); renderAll(); drawJobs();
      window.dispatchEvent(new CustomEvent("lon:lang", { detail: { lang: st.lang } }));
    });
    $("#projTog").addEventListener("change", (e) => { st.proj = e.target.checked; drawTrend(); drawKpis(); });
    $("#idxTog").addEventListener("change", (e) => { st.idx = e.target.checked; drawTrend(); });
    $("#mySal").addEventListener("input", (e) => {
      const v = +e.target.value.replace(/[^\d]/g, "");
      // Below 1 000 kr the number is still being typed; drawing it would stretch the axis to zero.
      st.mine = v >= 1000 ? v : null; drawStand(); drawSpread();
    });
    $("#lb").addEventListener("click", rowAdd); $("#rel").addEventListener("click", rowAdd);
    $("#lb").addEventListener("keydown", rowKey); $("#rel").addEventListener("keydown", rowKey);
    SL.onResize(renderAll);
    SL.onTheme(renderAll);
  }
  function rowAdd(e) { const li = e.target.closest("[data-add]"); if (li) add(li.dataset.add); }
  function rowKey(e) { if (e.key === "Enter" || e.key === " ") { const li = e.target.closest("[data-add]"); if (li) { e.preventDefault(); add(li.dataset.add); } } }

  /* ---------- the update cycle ---------- */
  async function changed(reloadAll) {
    const my = ++tok;
    writeURL(); renderChips();
    if (!$("#browser").hidden && reloadAll) renderBrowser();
    const codes = [...st.sel, ALL];
    try {
      await loadDisp(codes);
      if (my !== tok) return;
      drawKpis(); drawSpread(); drawStand(); drawTrend(); drawGender(); drawRatio();
      drawJobs();
      await Promise.all(["age", "edu", "reg"].map((k) => loadBreak(k, codes, st.year).then(() => { if (my === tok) drawBreak(k); })));
      if (my !== tok) return;
      drawKpis();
      await loadBoard(st.year);
      if (my !== tok) return;
      drawBoard(); drawRelated();
      if (!$("#browser").hidden && reloadAll) renderBrowser();
      SL.setStatus($("#status"), "ok", esc(t("status", { n: 429, y: lastYear() })) + (META.updated ? " · " + esc(SL.fmtDate(META.updated)) : ""));
      if (!ready) { ready = true; window.dispatchEvent(new CustomEvent("lon:ready")); }
    } catch (e) {
      console.error(e);
      if (my === tok) SL.setStatus($("#status"), "err", esc(t("statusErr", { e: e.message })));
    }
  }
  function renderAll() {
    if (!META.years.length) return;
    renderChips(); drawKpis(); drawSpread(); drawStand(); drawTrend(); drawGender(); drawRatio();
    ["age", "edu", "reg"].forEach(drawBreak); drawBoard(); drawRelated();
  }

  /* ---------- KPI tiles for the first selected occupation ---------- */
  function drawKpis() {
    const el = $("#kpis"), c = st.sel[0];
    if (!c) { el.innerHTML = ""; return; }
    const r = disp(c, st.sex, st.year), w = disp(c, "2", st.year), m = disp(c, "1", st.year);
    const n = brk("edu", c, st.sex, "TOTALT");
    const gr = growth(series(c, st.sex, "med"));
    const now = new Date().getFullYear();
    const tile = (label, value, sub, extra = "") => `<div class="card kpi"><div class="label">${esc(label)}</div><div class="value">${value}</div><div class="meta"><span>${sub}</span></div>${extra}</div>`;
    const na = `<span class="na" title="${esc(t("naWhy"))}">${esc(t("na"))}</span>`;
    const v = (x) => (isNum(x) ? SL.fmt(x) + "<small>kr</small>" : na);
    const ratio = w && m && isNum(w.med) && isNum(m.med) ? w.med / m.med * 100 : null;
    let projTile = "";
    const f = fc(c, "med"), fi = f ? FC.d.years.indexOf(now) : -1;
    if (fi >= 0) projTile = tile(t("kNow", { y: now }), "≈ " + SL.fmt(f[fi][0]) + "<small>kr</small>", esc(t("kFcSub", { lo: SL.fmt(f[fi][1]), hi: SL.fmt(f[fi][2]) })));
    else if (gr && now > gr.to) projTile = tile(t("kNow", { y: now }), "≈ " + SL.fmt(Math.round(gr.last[1] * Math.pow(1 + gr.g, now - gr.to) / 100) * 100) + "<small>kr</small>", esc(t("kNowSub")));
    el.innerHTML = `<div class="kh"><span class="dot" style="background:${colOf(c)}"></span><b>${esc(occName(c))}</b><small>SSYK ${c} · ${esc(sexName(st.sex))} · ${esc(secName(st.sector))} · ${st.year}</small>${r && isNum(r.med) ? `<a class="xlink" href="../netto/?sal=${Math.round(r.med)}">${esc(t("toNetto"))} →</a>` : ""}</div><div class="ktiles">` +
      tile(t("kMedian"), v(r && r.med), esc(t("kMedSub"))) +
      tile(t("kAverage"), v(r && r.avg), esc(t("kAvgSub"))) +
      tile(t("kEmp"), n && isNum(n.n) ? SL.fmt(n.n) : n ? na : "…", esc(t("kEmpSub", { year: st.year }))) +
      tile(t("kGap"), isNum(ratio) ? SL.fmt(ratio, 1) + "<small>%</small>" : na, esc(t("kGapSub"))) +
      tile(t("kGrowth"), gr ? `<span class="${gr.g >= 0 ? "up-good" : "down-bad"}">${SL.signed(gr.g * 100, 1)}<small>%</small></span>` : na, esc(t("kGrowSub", { a: gr ? gr.from : "", b: gr ? gr.to : "" }))) +
      projTile + "</div>";
  }

  /* ---------- chart scaffolding ---------- */
  function svgIn(el, h) {
    el.innerHTML = "";
    const w = Math.max(280, el.clientWidth || 600);
    const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("height", h);
    return { svg, w };
  }
  const clip = (s, w) => { const n = Math.max(8, Math.floor(w / 6.6)); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
  function xAxis(svg, x, y0, y1, ticks) {
    const g = svg.append("g");
    x.ticks(ticks).forEach((v) => {
      g.append("line").attr("class", "grid").attr("x1", x(v)).attr("x2", x(v)).attr("y1", y0).attr("y2", y1);
      g.append("text").attr("x", x(v)).attr("y", y1 + 14).attr("text-anchor", "middle").text(kAxis(v));
    });
  }
  const emptyMsg = (el) => (el.innerHTML = `<div class="empty">${esc(t("empty"))}</div>`);

  /* ---------- spread: box per occupation ---------- */
  function drawSpread() {
    const el = $("#spread");
    $("#spreadSub").textContent = t("spreadSub", { sex: sexName(st.sex), sector: secName(st.sector), year: st.year });
    const rows = [...st.sel, ALL].map((c) => ({ c, r: disp(c, st.sex, st.year) }));
    const vals = rows.flatMap((x) => (x.r ? [x.r.p10, x.r.p90, x.r.avg, x.r.med] : [])).filter(isNum);
    if (isNum(st.mine)) vals.push(st.mine);
    if (!vals.length) return emptyMsg(el);
    const rh = 52, top = 4, h = top + rows.length * rh + 22;
    const { svg, w } = svgIn(el, h);
    const x = d3.scaleLinear().domain(d3.extent(vals)).nice().range([6, w - 10]);
    xAxis(svg, x, top, h - 22, w < 500 ? 4 : 7);
    rows.forEach(({ c, r }, i) => {
      const y0 = top + i * rh, cy = y0 + 33, col = colOf(c);
      const g = svg.append("g").attr("class", "brow" + (c === ALL ? " ref" : ""));
      g.append("text").attr("class", "rlab").attr("x", 6).attr("y", y0 + 14).text(clip(occName(c), w - 100));
      if (!r || !isNum(r.med)) { g.append("text").attr("class", "nalab").attr("x", 6).attr("y", cy + 4).text(t("na")); return; }
      if (isNum(r.p10) && isNum(r.p90)) {
        g.append("line").attr("x1", x(r.p10)).attr("x2", x(r.p90)).attr("y1", cy).attr("y2", cy).attr("stroke", col).attr("stroke-width", 1.5);
        [r.p10, r.p90].forEach((v) => g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", cy - 6).attr("y2", cy + 6).attr("stroke", col).attr("stroke-width", 1.5));
      }
      if (isNum(r.p25) && isNum(r.p75)) g.append("rect").attr("x", x(r.p25)).attr("y", cy - 9).attr("width", Math.max(1, x(r.p75) - x(r.p25))).attr("height", 18).attr("rx", 3).attr("fill", col).attr("fill-opacity", 0.22).attr("stroke", col);
      g.append("line").attr("x1", x(r.med)).attr("x2", x(r.med)).attr("y1", cy - 10).attr("y2", cy + 10).attr("stroke", col).attr("stroke-width", 3);
      if (isNum(r.avg)) g.append("circle").attr("cx", x(r.avg)).attr("cy", cy).attr("r", 3.6).attr("fill", "var(--surface)").attr("stroke", col).attr("stroke-width", 1.8);
      g.append("text").attr("class", "vlab").attr("x", w - 10).attr("y", y0 + 14).attr("text-anchor", "end").text(kr(r.med));
      g.append("rect").attr("x", 0).attr("y", y0).attr("width", w).attr("height", rh).attr("fill", "transparent")
        .on("mousemove", (e) => SL.tip(e, `<b>${esc(occName(c))}</b><br>P90 ${kr(r.p90)}<br>P75 ${kr(r.p75)}<br>${esc(t("mMed"))} ${kr(r.med)}<br>P25 ${kr(r.p25)}<br>P10 ${kr(r.p10)}<br>${esc(t("mAvg"))} ${kr(r.avg)}`))
        .on("mouseleave", SL.hideTip);
    });
    if (isNum(st.mine)) {
      const xm = x(st.mine);
      svg.append("line").attr("class", "mine").attr("x1", xm).attr("x2", xm).attr("y1", top).attr("y2", h - 22);
      svg.append("text").attr("class", "minelab").attr("x", xm + 4).attr("y", h - 26).text(kr(st.mine));
    }
  }

  /* ---------- where do you stand ---------- */
  function drawStand() {
    const el = $("#standOut");
    if (!isNum(st.mine)) { el.innerHTML = `<p class="empty">${esc(t("standEmpty"))}</p>`; return; }
    el.innerHTML = "<ul>" + [...st.sel, ALL].map((c) => {
      const r = disp(c, st.sex, st.year);
      const p = r ? percentileOf(r, st.mine) : null;
      let txt, bar = 0;
      if (!p) txt = t("noSpread");
      else if (p.below) { txt = t("below"); bar = 5; }
      else if (p.above) { txt = t("above"); bar = 95; }
      else { const pr = Math.round(p.p); txt = t("pctl", { p: pr }) + " · " + t("earnMore", { p: pr }); bar = pr; }
      return `<li style="--sc:${colOf(c)}"><span class="nm"><i></i>${esc(occName(c))}</span><span class="pbar"><b style="width:${bar}%"></b></span><span class="pt">${esc(txt)}</span></li>`;
    }).join("") + "</ul>";
  }

  /* ---------- trend ---------- */
  function drawTrend() {
    const el = $("#trend"), lg = $("#trendLegend");
    const measName = { med: t("mMed"), avg: t("mAvg") }[st.meas] || st.meas.toUpperCase();
    $("#trendSub").textContent = t("trendSub", { meas: measName, sex: sexName(st.sex), sector: secName(st.sector) });
    const codes = [...st.sel, ALL];
    const S = codes.map((c) => {
      let pts = series(c, st.sex, st.meas);
      const gr = growth(pts);
      let proj = [], fband = null;
      const f = st.proj ? fc(c) : null, base = f ? pts.find((p) => p[0] === FC.d.base) : null;
      if (f && base && isNum(base[1])) {
        proj = [[base[0], base[1]], ...FC.d.years.map((y, i) => [y, f[i][0]])];
        if (c === st.sel[0]) fband = [[base[0], base[1], base[1]], ...FC.d.years.map((y, i) => [y, f[i][1], f[i][2]])];
      } else if (st.proj && gr) proj = d3.range(0, PROJ_YEARS + 1).map((i) => [gr.to + i, gr.last[1] * Math.pow(1 + gr.g, i)]);
      let band = null;
      if (c === st.sel[0] && st.meas === "med" && !st.idx) band = META.years.map((y) => { const r = disp(c, st.sex, y); return r && isNum(r.p25) && isNum(r.p75) ? [y, r.p25, r.p75] : null; }).filter(Boolean);
      if (st.idx) {
        const b = pts.find((p) => isNum(p[1]));
        if (b) { const f = (v) => (isNum(v) ? v / b[1] * 100 : null); pts = pts.map((p) => [p[0], f(p[1])]); proj = proj.map((p) => [p[0], f(p[1])]); if (fband) fband = fband.map((p) => [p[0], f(p[1]), f(p[2])]); }
      }
      return { c, pts, proj, band, fband, gr, model: !!(f && base && isNum(base[1])) };
    });
    lg.innerHTML = S.map((s) => `<span><i style="background:${colOf(s.c)}"></i>${esc(occName(s.c))}${s.gr ? ` <b class="${s.gr.g >= 0 ? "up-good" : "down-bad"}">${SL.signed(s.gr.g * 100, 1)} %${esc(t("perYear"))}</b>` : ""}</span>`).join("");
    const all = S.flatMap((s) => s.pts.concat(s.proj).map((p) => p[1]).concat(s.band ? s.band.flatMap((b) => [b[1], b[2]]) : []).concat(s.fband ? s.fband.flatMap((b) => [b[1], b[2]]) : [])).filter(isNum);
    const bt = FC.d && FC.d.backtest, cov = bt ? Math.round(d3.mean(Object.values(bt.coverage)) / 10) : 8;
    const note = document.querySelector('[data-t="trendNote"]');
    if (note) note.textContent = st.proj && S.some((s) => s.model) ? t("trendNoteFc", { m1: bt ? SL.fmt(bt.mape.model["1"], 1) : "–", m3: bt ? SL.fmt(bt.mape.model["3"], 1) : "–", n1: bt ? SL.fmt(bt.mape.naive["3"], 1) : "–", cov, a: bt ? bt.testedOn[0] : "", b: bt ? bt.testedOn[1] : "" }) : t("trendNote");
    if (!all.length) return emptyMsg(el);
    const h = 340, mL = 54, mR = 14, mT = 10, mB = 26;
    const { svg, w } = svgIn(el, h);
    const x1 = lastYear() + (st.proj ? PROJ_YEARS : 0);
    const x = d3.scaleLinear().domain([META.years[0], x1]).range([mL, w - mR]);
    const y = d3.scaleLinear().domain(d3.extent(all)).nice().range([h - mB, mT]);
    y.ticks(6).forEach((v) => {
      svg.append("line").attr("class", "grid").attr("x1", mL).attr("x2", w - mR).attr("y1", y(v)).attr("y2", y(v));
      svg.append("text").attr("x", mL - 8).attr("y", y(v) + 4).attr("text-anchor", "end").text(st.idx ? SL.fmt(v) : kAxis(v));
    });
    const step = w < 560 ? 3 : w < 900 ? 2 : 1;
    d3.range(META.years[0], x1 + 1).forEach((yr, i) => { if (i % step === 0) svg.append("text").attr("x", x(yr)).attr("y", h - 8).attr("text-anchor", "middle").attr("class", yr > lastYear() ? "projyr" : "").text(yr); });
    if (st.proj) svg.append("rect").attr("class", "projzone").attr("x", x(lastYear())).attr("y", mT).attr("width", x(x1) - x(lastYear())).attr("height", h - mB - mT);
    if (st.idx) svg.append("line").attr("class", "ref100").attr("x1", mL).attr("x2", w - mR).attr("y1", y(100)).attr("y2", y(100));
    const line = d3.line().defined((d) => isNum(d[1])).x((d) => x(d[0])).y((d) => y(d[1]));
    S.forEach((s) => {
      if (s.band && s.band.length > 1) svg.append("path").attr("d", d3.area().x((d) => x(d[0])).y0((d) => y(d[1])).y1((d) => y(d[2]))(s.band)).attr("fill", colOf(s.c)).attr("fill-opacity", 0.12);
      if (s.fband) svg.append("path").attr("class", "fband").attr("d", d3.area().x((d) => x(d[0])).y0((d) => y(d[1])).y1((d) => y(d[2]))(s.fband)).attr("fill", colOf(s.c)).attr("fill-opacity", 0.2).attr("stroke", colOf(s.c)).attr("stroke-opacity", 0.35).attr("stroke-dasharray", "2 3");
    });
    S.slice().reverse().forEach((s) => {
      const ref = s.c === ALL;
      svg.append("path").attr("d", line(s.pts)).attr("fill", "none").attr("stroke", colOf(s.c)).attr("stroke-width", ref ? 1.6 : 2.4).attr("stroke-linejoin", "round");
      if (s.proj.length) svg.append("path").attr("d", line(s.proj)).attr("fill", "none").attr("stroke", colOf(s.c)).attr("stroke-width", ref ? 1.4 : 2).attr("stroke-dasharray", "4 4");
      s.pts.filter((p) => isNum(p[1])).forEach((p) => svg.append("circle").attr("cx", x(p[0])).attr("cy", y(p[1])).attr("r", ref ? 2 : 2.8).attr("fill", colOf(s.c)));
    });
    const rule = svg.append("line").attr("class", "rule").attr("y1", mT).attr("y2", h - mB).style("opacity", 0);
    svg.append("rect").attr("x", mL).attr("y", mT).attr("width", w - mL - mR).attr("height", h - mB - mT).attr("fill", "transparent")
      .on("mousemove", (e) => {
        const [mx] = d3.pointer(e), yr = Math.round(x.invert(mx));
        rule.attr("x1", x(yr)).attr("x2", x(yr)).style("opacity", 1);
        const isP = yr > lastYear();
        const rows = S.map((s) => {
          const p = (isP ? s.proj : s.pts).find((q) => q[0] === yr), fb = isP && s.fband ? s.fband.find((q) => q[0] === yr) : null;
          const v = (n) => (st.idx ? SL.fmt(n, 1) : kr(Math.round(n)));
          return `<span style="color:${SL.css("--c" + (s.c === ALL ? 8 : (slots.get(s.c) ?? 0) + 1))}">●</span> ${esc(clip(occName(s.c), 260))}: ${p && isNum(p[1]) ? v(p[1]) + (fb ? ` <span style="opacity:.75">(${v(fb[1])} – ${v(fb[2])})</span>` : "") : "–"}`;
        });
        SL.tip(e, `<b>${yr}${isP ? " · " + esc(t("projected")) : ""}</b><br>` + rows.join("<br>"));
      })
      .on("mouseleave", () => { rule.style("opacity", 0); SL.hideTip(); });
  }

  /* ---------- women and men ---------- */
  function drawGender() {
    const el = $("#gender");
    $("#genderSub").textContent = t("genderSub", { sector: secName(st.sector), year: st.year });
    const rows = [...st.sel, ALL].map((c) => ({ c, w: disp(c, "2", st.year)?.med, m: disp(c, "1", st.year)?.med }));
    const vals = rows.flatMap((r) => [r.w, r.m]).filter(isNum);
    if (!vals.length) return emptyMsg(el);
    const rh = 44, h = rows.length * rh + 24;
    const { svg, w } = svgIn(el, h);
    const x = d3.scaleLinear().domain(d3.extent(vals)).nice().range([8, w - 70]);
    xAxis(svg, x, 0, h - 24, w < 460 ? 3 : 5);
    const cw = "var(--c2)", cm = "var(--c6)";
    rows.forEach((r, i) => {
      const y0 = i * rh, cy = y0 + 28;
      svg.append("text").attr("class", "rlab").attr("x", 8).attr("y", y0 + 12).text(clip(occName(r.c), w - 70));
      if (!isNum(r.w) || !isNum(r.m)) { svg.append("text").attr("class", "nalab").attr("x", 8).attr("y", cy + 4).text(t("na")); return; }
      svg.append("line").attr("x1", x(r.w)).attr("x2", x(r.m)).attr("y1", cy).attr("y2", cy).attr("stroke", "var(--border-strong)").attr("stroke-width", 3);
      svg.append("circle").attr("cx", x(r.m)).attr("cy", cy).attr("r", 6).attr("fill", cm);
      svg.append("circle").attr("cx", x(r.w)).attr("cy", cy).attr("r", 6).attr("fill", cw);
      const ratio = r.w / r.m * 100;
      svg.append("text").attr("class", "vlab").attr("x", w - 4).attr("y", cy + 4).attr("text-anchor", "end").text(SL.fmt(ratio, 1) + " %");
      svg.append("rect").attr("x", 0).attr("y", y0).attr("width", w).attr("height", rh).attr("fill", "transparent")
        .on("mousemove", (e) => SL.tip(e, `<b>${esc(occName(r.c))}</b><br>${esc(t("women"))} ${kr(r.w)}<br>${esc(t("men"))} ${kr(r.m)}<br>${SL.fmt(ratio, 1)} % ${esc(t("kGapSub"))}`))
        .on("mouseleave", SL.hideTip);
    });
  }

  function drawRatio() {
    const el = $("#ratio");
    const S = [...st.sel, ALL].map((c) => ({ c, pts: META.years.map((y) => { const a = disp(c, "2", y)?.med, b = disp(c, "1", y)?.med; return [y, isNum(a) && isNum(b) ? a / b * 100 : null]; }) }));
    const all = S.flatMap((s) => s.pts.map((p) => p[1])).filter(isNum);
    if (!all.length) return emptyMsg(el);
    const h = 250, mL = 40, mR = 10, mT = 8, mB = 24;
    const { svg, w } = svgIn(el, h);
    const ext = d3.extent(all.concat([100]));
    const x = d3.scaleLinear().domain([META.years[0], lastYear()]).range([mL, w - mR]);
    const y = d3.scaleLinear().domain([ext[0] - 1, ext[1] + 1]).nice().range([h - mB, mT]);
    y.ticks(5).forEach((v) => {
      svg.append("line").attr("class", "grid").attr("x1", mL).attr("x2", w - mR).attr("y1", y(v)).attr("y2", y(v));
      svg.append("text").attr("x", mL - 6).attr("y", y(v) + 4).attr("text-anchor", "end").text(SL.fmt(v) + "%");
    });
    const step = w < 460 ? 4 : 2;
    META.years.forEach((yr, i) => { if (i % step === 0 || yr === lastYear()) svg.append("text").attr("x", x(yr)).attr("y", h - 8).attr("text-anchor", "middle").text(yr); });
    svg.append("line").attr("class", "ref100").attr("x1", mL).attr("x2", w - mR).attr("y1", y(100)).attr("y2", y(100));
    const line = d3.line().defined((d) => isNum(d[1])).x((d) => x(d[0])).y((d) => y(d[1]));
    S.slice().reverse().forEach((s) => svg.append("path").attr("d", line(s.pts)).attr("fill", "none").attr("stroke", colOf(s.c)).attr("stroke-width", s.c === ALL ? 1.6 : 2.2));
    svg.append("rect").attr("x", mL).attr("y", mT).attr("width", w - mL - mR).attr("height", h - mB - mT).attr("fill", "transparent")
      .on("mousemove", (e) => {
        const yr = Math.round(x.invert(d3.pointer(e)[0]));
        SL.tip(e, `<b>${yr}</b><br>` + S.map((s) => { const p = s.pts.find((q) => q[0] === yr); return `${esc(clip(occName(s.c), 260))}: ${p && isNum(p[1]) ? SL.fmt(p[1], 1) + " %" : "–"}`; }).join("<br>"));
      })
      .on("mouseleave", SL.hideTip);
  }

  /* ---------- age, education, region: one row per category, one dot per occupation ---------- */
  function cats(kind) {
    if (kind === "edu") return Object.keys(EDU).map((k) => ({ k, l: EDU[k][st.lang] }));
    if (kind === "reg") return Object.keys(REGIONS).map((k) => ({ k, l: REGIONS[k][st.lang] }));
    const any = BRK.get(["age", st.sector, st.year, ALL].join("|"));
    const has = (k) => any && any["1+2"] && any["1+2"][k] && isNum(any["1+2"][k].avg);
    const old = has("65-68") ? "65-68" : "65-66";
    return ["18-24", "25-34", "35-44", "45-54", "55-64", old].map((k) => ({ k, l: k === old ? "65+" : k.replace("-", "–") }));
  }
  function drawBreak(kind) {
    const el = $("#" + kind);
    $("#" + kind + "Sub").textContent = t("breakSub", { sex: sexName(st.sex), sector: secName(st.sector), year: st.year });
    if (!BRK.has([kind, st.sector, st.year, ALL].join("|"))) { el.innerHTML = `<div class="loading">${esc(t("loading"))}</div>`; return; }
    const C = cats(kind), codes = [...st.sel, ALL];
    const vals = C.flatMap((c) => codes.map((o) => brk(kind, o, st.sex, c.k)?.avg)).filter(isNum);
    if (!vals.length) return emptyMsg(el);
    const rh = 34, h = C.length * rh + 22;
    const { svg, w } = svgIn(el, h);
    const x = d3.scaleLinear().domain(d3.extent(vals)).nice().range([8, w - 8]);
    xAxis(svg, x, 0, h - 22, w < 420 ? 3 : 4);
    C.forEach((cat, i) => {
      const y0 = i * rh, cy = y0 + 23;
      svg.append("text").attr("class", "clab").attr("x", 8).attr("y", y0 + 11).text(clip(cat.l, w));
      svg.append("line").attr("class", "track").attr("x1", 8).attr("x2", w - 8).attr("y1", cy).attr("y2", cy);
      codes.slice().reverse().forEach((o) => {
        const r = brk(kind, o, st.sex, cat.k);
        if (!r || !isNum(r.avg)) return;
        const ref = o === ALL;
        svg.append("circle").attr("cx", x(r.avg)).attr("cy", cy).attr("r", ref ? 5 : 5.5)
          .attr("fill", ref ? "var(--surface)" : colOf(o)).attr("stroke", ref ? "var(--c8)" : "var(--surface)").attr("stroke-width", ref ? 2 : 1.2)
          .on("mousemove", (e) => SL.tip(e, `<b>${esc(occName(o))}</b><br>${esc(cat.l)}<br>${kr(r.avg)}${isNum(r.n) ? `<br>${SL.fmt(r.n)} ${esc(t("empl"))}` : ""}`))
          .on("mouseleave", SL.hideTip);
      });
    });
  }

  /* ---------- leaderboards and nearby occupations ---------- */
  function boardRows(board) {
    const rows = [...board].filter(([c]) => !NOT_OCC.has(c)).map(([c, r]) => ({ c, ...r }));
    const by = {
      top: () => rows.filter((r) => isNum(r.med)).sort((a, b) => b.med - a.med).map((r) => ({ ...r, v: r.med, txt: kr(r.med) })),
      low: () => rows.filter((r) => isNum(r.med)).sort((a, b) => a.med - b.med).map((r) => ({ ...r, v: r.med, txt: kr(r.med) })),
      grow: () => rows.filter((r) => isNum(r.med) && isNum(r.med5) && r.y5 < st.year).map((r) => ({ ...r, v: Math.pow(r.med / r.med5, 1 / (st.year - r.y5)) - 1 }))
        .sort((a, b) => b.v - a.v).map((r) => ({ ...r, txt: SL.signed(r.v * 100, 1) + " %" + t("perYear") })),
      big: () => rows.filter((r) => isNum(r.n)).sort((a, b) => b.n - a.n).map((r) => ({ ...r, v: r.n, txt: SL.fmt(r.n) + " " + t("empl") })),
      gap: () => rows.filter((r) => isNum(r.w) && isNum(r.m)).map((r) => ({ ...r, v: Math.abs(r.w / r.m - 1), ratio: r.w / r.m * 100 }))
        .sort((a, b) => b.v - a.v).map((r) => ({ ...r, txt: SL.fmt(r.ratio, 1) + " % · " + (r.ratio < 100 ? t("menEarnMore") : t("womenEarnMore")) }))
    };
    return (by[st.lb] || by.top)();
  }
  function li(r, i, max) {
    const on = st.sel.includes(r.c);
    return `<li data-add="${r.c}" tabindex="0" class="${on ? "on" : ""}" style="--w:${Math.max(2, Math.abs(r.v) / max * 100)}%;${on ? "--sc:" + colOf(r.c) : ""}"><span class="rk">${i + 1}</span><span class="nm">${esc(occName(r.c))} <small>${r.c}</small></span><span class="vv">${esc(r.txt)}</span></li>`;
  }
  function drawBoard() {
    const el = $("#lb"), board = LB.get(st.sector + "|" + st.year);
    $("#lbSub").textContent = t("lbSub", { sector: cap(secName(st.sector)), year: st.year });
    if (!board) { el.innerHTML = `<li class="loading">${esc(t("loading"))}</li>`; return; }
    const rows = boardRows(board).slice(0, 15);
    if (!rows.length) { el.innerHTML = `<li class="empty">${esc(t("empty"))}</li>`; return; }
    const max = d3.max(rows, (r) => Math.abs(r.v));
    el.innerHTML = rows.map((r, i) => li(r, i, max)).join("");
  }
  function drawRelated() {
    const el = $("#rel"), board = LB.get(st.sector + "|" + st.year), c = st.sel[0];
    if (!c) { el.innerHTML = ""; $("#relSub").textContent = ""; return; }
    if (!board) { el.innerHTML = `<li class="loading">${esc(t("loading"))}</li>`; return; }
    let pre = c.slice(0, 3), group = META.grp[st.lang][pre] || META.grp.en[pre];
    let rows = [...board].filter(([k, r]) => k.startsWith(pre) && !NOT_OCC.has(k) && isNum(r.med));
    if (rows.length < 4) { pre = c.slice(0, 2); rows = [...board].filter(([k, r]) => k.startsWith(pre) && !NOT_OCC.has(k) && isNum(r.med)); group = group || FIELDS[c[0]][st.lang]; }
    $("#relSub").textContent = t("relSub", { group: group || pre, year: st.year });
    rows = rows.map(([k, r]) => ({ c: k, ...r, v: r.med, txt: kr(r.med) })).sort((a, b) => b.v - a.v);
    if (!rows.length) { el.innerHTML = `<li class="empty">${esc(t("empty"))}</li>`; return; }
    const max = d3.max(rows, (r) => r.v);
    el.innerHTML = rows.map((r, i) => li(r, i, max)).join("");
  }

  /* ---------- job ads (JobTech JobSearch, live) ---------- */
  let jobsTok = 0;
  async function drawJobs() {
    const el = $("#jobs"), c = st.sel[0], my = ++jobsTok;
    if (!c) { el.innerHTML = ""; $("#jobsSub").textContent = ""; return; }
    $("#jobsSub").textContent = t("jobsSub", { occ: occName(c) });
    el.innerHTML = `<div class="loading">${esc(t("loading"))}</div>`;
    try {
      let id = CONCEPT.get(c);
      if (!id) {
        const tx = await SL.fetchJSON(`${TAXO}?ssyk-code-2012=${c}`, { timeout: 20000, cacheMinutes: 1440 });
        id = tx && tx[0] && tx[0]["taxonomy/id"];
        if (!id) throw new Error("no JobTech concept for " + c);
        CONCEPT.set(c, id);
      }
      const d = await SL.fetchJSON(`${JOBS}?occupation-group=${encodeURIComponent(id)}&limit=8&sort=pubdate-desc&stats=region&stats.limit=21`, { timeout: 20000, cacheMinutes: 15 });
      if (my !== jobsTok) return;
      const total = d.total ? d.total.value : 0;
      const plats = "https://arbetsformedlingen.se/platsbanken/annonser?q=" + encodeURIComponent(META.occ.sv[c] || occName(c));
      if (!total) { el.innerHTML = `<p class="empty">${esc(t("noAds"))}</p><p><a href="${plats}">${esc(t("allAds"))}</a></p>`; return; }
      const reg = ((d.stats || []).find((s) => s.type === "region") || { values: [] }).values.slice(0, 10);
      const rmax = d3.max(reg, (r) => r.count) || 1;
      const safe = (u) => (/^https:\/\//.test(u || "") ? u : plats);
      el.innerHTML = `<div class="jtotal"><b>${SL.fmt(total)}</b><span>${esc(t("openAds"))}</span><a href="${plats}">${esc(t("allAds"))}</a></div>` +
        `<div class="jcol"><h3>${esc(t("byCounty"))}</h3><ol class="bars">${reg.map((r) => `<li style="--w:${r.count / rmax * 100}%"><span>${esc(r.term)}</span><b>${SL.fmt(r.count)}</b></li>`).join("")}</ol></div>` +
        `<div class="jcol"><h3>${esc(t("latest"))}</h3><ul class="ads">${(d.hits || []).map((a) => `<li><a href="${esc(safe(a.webpage_url))}">${esc(a.headline)}</a><small>${esc((a.employer && a.employer.name) || "")}${a.workplace_address && a.workplace_address.municipality ? " · " + esc(a.workplace_address.municipality) : ""} · ${esc(SL.timeAgo(a.publication_date))}</small></li>`).join("")}</ul></div>`;
    } catch (e) {
      if (my === jobsTok) el.innerHTML = `<p class="error">${esc(e.message)}</p>`;
    }
  }

  /* ---------- sources and methods ---------- */
  function renderMethods() {
    const sv = st.lang === "sv";
    const ours = sv ? [
      "Siffrorna är lönestrukturstatistiken, som SCB tar fram åt Medlingsinstitutet. De hämtas direkt från SCB:s öppna API (PxWebApi 2.0) när sidan öppnas. Inget sparas på någon server.",
      "Månadslön är grundlön plus fasta tillägg, omräknad till heltid. SCB mäter den en gång om året, på hösten.",
      "Yrken följer SSYK 2012. Åren 2014–2022 och 2023–2025 ligger i olika tabeller hos SCB; sidan slår ihop dem.",
      "Kvinnors andel av mäns lön räknas här på medianlönerna. Ökningen per år är den genomsnittliga årliga förändringen i medianlön över fem år.",
      "Platsannonserna hämtas live från Arbetsförmedlingens JobSearch-API och räknas per yrkesgrupp (SSYK 4)."
    ] : [
      "The figures are the salary structure statistics that SCB produces for the National Mediation Office (Medlingsinstitutet), fetched from SCB's open API (PxWebApi 2.0) when the page opens. Nothing is stored on a server.",
      "Monthly salary is basic pay plus fixed allowances, converted to full time. SCB measures it once a year, in the autumn.",
      "Occupations follow SSYK 2012. SCB keeps 2014–2022 and 2023–2025 in separate tables; this page joins them.",
      "Women's pay as a share of men's is computed here from the medians. Change per year is the average yearly change in the median over five years.",
      "Job ads are read live from Arbetsförmedlingen's JobSearch API and counted per occupation group (SSYK 4)."
    ];
    const notes = (META.notes[st.lang] || []).map((n) => String(n).trim()).filter(Boolean);
    $("#methods").innerHTML = `<ul>${ours.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` +
      (notes.length ? `<details><summary>${sv ? "SCB:s egna anmärkningar" : "SCB's own notes"}</summary><ul>${notes.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></details>` : "");
  }

  /* ---------- "Show as table" under every chart ---------- */
  function tables() {
    const occs = () => [...st.sel, ALL];
    const head = (first) => [first, ...occs().map(occName)];
    SL.tableToggle($("#spread"), () => ({ caption: $("#spreadSub").textContent, cols: [t("tOcc"), "P10", "P25", t("mMed"), "P75", "P90", t("mAvg")],
      rows: occs().map((c) => { const r = disp(c, st.sex, st.year) || {}; return [occName(c), r.p10, r.p25, r.med, r.p75, r.p90, r.avg]; }) }));
    SL.tableToggle($("#trend"), () => {
      const yrs = META.years.concat(st.proj && FC.d && fc(st.sel[0] || ALL) ? FC.d.years : []);
      return { caption: $("#trendSub").textContent, cols: head(t("tYear")), rows: yrs.map((y) => [y > lastYear() ? `${y} (${t("projected")})` : String(y), ...occs().map((c) => {
        if (y <= lastYear()) return disp(c, st.sex, y)?.[st.meas] ?? null;
        const f = fc(c); return f ? f[FC.d.years.indexOf(y)][0] : null;
      })]) };
    });
    SL.tableToggle($("#gender"), () => ({ caption: $("#genderSub").textContent, cols: [t("tOcc"), t("women"), t("men"), t("tRatio")],
      rows: occs().map((c) => { const w = disp(c, "2", st.year)?.med, m = disp(c, "1", st.year)?.med; return [occName(c), w, m, isNum(w) && isNum(m) ? Math.round(w / m * 1000) / 10 : null]; }) }));
    SL.tableToggle($("#ratio"), () => ({ caption: t("ratioSub"), cols: head(t("tYear")),
      rows: META.years.map((y) => [String(y), ...occs().map((c) => { const a = disp(c, "2", y)?.med, b = disp(c, "1", y)?.med; return isNum(a) && isNum(b) ? Math.round(a / b * 1000) / 10 : null; })]) }));
    ["age", "edu", "reg"].forEach((k) => SL.tableToggle($("#" + k), () => ({ caption: $("#" + k + "Sub").textContent, cols: head(t(k + "T")),
      rows: cats(k).map((cat) => [cat.l, ...occs().map((o) => brk(k, o, st.sex, cat.k)?.avg ?? null)]) })));
  }

  /* ---------- start ---------- */
  (async function init() {
    SL.setStatus($("#status"), "stale", "Connecting to SCB…");
    try {
      if (!(await loadSnap())) await loadMeta();
    } catch (e) {
      console.error(e);
      SL.setStatus($("#status"), "err", esc(TXT.en.statusErr.replace("{e}", e.message)));
      return;
    }
    readURL();
    applyLang();
    wire();
    tables();
    changed(true);
  })();
})();
