/* Sverige Live: first-visit walkthrough and guide panel, shared by every dashboard. Needs core.js (window.SL).
   A page calls SLGuide.init({...}) before its own script runs, because cached data can finish the first render
   before a later script is parsed and the ready event would be missed.

   SLGuide.init({
     key:        localStorage key that remembers the tour was seen, e.g. "slTour:economy",
     content:    () => ({ en: {...}, sv: {...} })   title, close, nav, again, info, sections: [{id, h, html, sub?}],
                                                     tour: {label, of, next, back, skip, done, guide, steps: [{t, b}]},
     targets:    [null | () => [elements]]           one per tour step; null centres the popover,
     readyEvent: "sl:ready", langEvent: "sl:lang",
     setLang:    (l) => ...                          optional; defaults to SL.setLang,
     decorate:   (html, L) => html                   optional; post-processes each guide section
   })
   Markup it wires: #tourBtn, #guideBtn, #footGuide, and .info[data-g="<section id>"] placed right after a heading. */
(function () {
  "use strict";
  const esc = SL.esc, $ = (s, r = document) => r.querySelector(s);
  let C = null;
  const lang = () => (document.documentElement.lang === "sv" ? "sv" : "en");
  const T = () => C.content()[lang()] || C.content().en;
  const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = () => { try { return !!localStorage.getItem(C.key); } catch (e) { return false; } };
  const markSeen = () => { try { localStorage.setItem(C.key, "1"); } catch (e) { /* storage blocked: the tour may show again */ } };
  const forced = () => new URLSearchParams(location.search).get("tour") === "1";
  const vw = () => document.documentElement.clientWidth, vh = () => document.documentElement.clientHeight;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setLang = (l) => (C.setLang ? C.setLang(l) : SL.setLang(l));
  const langSeg = (cls) => `<div class="seg ${cls}" role="group" aria-label="Language">${["en", "sv"].map((l) => `<button type="button" data-l="${l}">${l.toUpperCase()}</button>`).join("")}</div>`;
  const syncLang = (root) => root.querySelectorAll("[data-l]").forEach((b) => b.classList.toggle("on", b.dataset.l === lang()));

  /* The page behind a dialog must not take focus or clicks; everything else on <body> goes inert. */
  const held = [];
  function lock(on, keep) {
    if (on) [...document.body.children].forEach((el) => { if (!keep.includes(el) && el.tagName !== "SCRIPT" && !el.inert) { el.inert = true; held.push(el); } });
    else while (held.length) held.pop().inert = false;
  }
  function trap(e, root) {
    if (e.key !== "Tab") return;
    const f = [...root.querySelectorAll("button, a[href], input, select")].filter((x) => !x.disabled && x.getClientRects().length);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1], cur = document.activeElement;
    if (e.shiftKey && (cur === a || cur === root)) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && (cur === z || !root.contains(cur))) { e.preventDefault(); a.focus(); }
  }
  const back = (el) => { if (el && document.contains(el)) el.focus({ preventScroll: true }); };

  /* ---------- guide ---------- */
  const gd = { el: null, back: null, open: false, from: null };
  function buildGuide() {
    gd.back = document.createElement("div"); gd.back.className = "gd-back";
    gd.el = document.createElement("aside"); gd.el.className = "gd"; gd.el.tabIndex = -1;
    gd.el.setAttribute("role", "dialog"); gd.el.setAttribute("aria-modal", "true"); gd.el.setAttribute("aria-labelledby", "gdT");
    gd.el.innerHTML = `<div class="gd-head"><h2 id="gdT"></h2>${langSeg("gd-lang")}<button class="gd-x" type="button">×</button></div><div class="gd-body"></div>`;
    document.body.append(gd.back, gd.el);
    gd.back.addEventListener("click", () => closeGuide());
    $(".gd-x", gd.el).addEventListener("click", () => closeGuide());
    gd.el.addEventListener("click", (e) => {
      const l = e.target.closest("[data-l]"), go = e.target.closest("[data-go]");
      if (l) setLang(l.dataset.l);
      else if (go) jump(go.dataset.go, true);
      else if (e.target.closest("[data-tour]")) { const from = gd.from; closeGuide(true); startTour(from); }
    });
  }
  function renderGuide() {
    const L = T(), dec = C.decorate || ((h) => h);
    const sec = (s, h) => `<section class="gd-sec" id="g-${s.id}"><h${h}>${esc(s.h)}</h${h}>${dec(s.html, L)}${(s.sub || []).map((x) => sec(x, 4)).join("")}</section>`;
    $("#gdT", gd.el).textContent = L.title;
    $(".gd-x", gd.el).setAttribute("aria-label", L.close);
    syncLang(gd.el);
    $(".gd-body", gd.el).innerHTML = `<nav class="gd-toc" aria-label="${esc(L.nav)}">${L.sections.map((s) => `<button type="button" data-go="${s.id}">${esc(s.h)}</button>`).join("")}</nav>` +
      L.sections.map((s) => sec(s, 3)).join("") + `<p class="gd-end"><button class="btn" type="button" data-tour>${esc(L.again)}</button></p>`;
  }
  function jump(id, smooth) {
    const b = $(".gd-body", gd.el), s = id && $("#g-" + id, gd.el);
    if (!s) { b.scrollTop = 0; return; }
    b.scrollTo({ top: s.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 12, behavior: smooth && !calm() ? "smooth" : "auto" });
    s.classList.remove("flash"); void s.offsetWidth; s.classList.add("flash");
  }
  function openGuide(id, from) {
    if (gd.open) return;
    if (!gd.el) buildGuide();
    renderGuide();
    gd.from = from || (document.activeElement !== document.body ? document.activeElement : null);
    gd.open = true;
    lock(true, [gd.el, gd.back]);
    gd.back.classList.add("open"); gd.el.classList.add("open");
    jump(id, false);
    gd.el.focus({ preventScroll: true });
  }
  function closeGuide(keepFocus) {
    if (!gd.open) return;
    gd.open = false; lock(false);
    gd.back.classList.remove("open"); gd.el.classList.remove("open");
    if (keepFocus !== true) back(gd.from);
  }

  /* ---------- walkthrough ---------- */
  const tr = { root: null, pop: null, spot: null, i: 0, open: false, from: null, y: 0, timer: 0, raf: 0 };
  const PAD = 8, GAP = 14;
  function buildTour() {
    tr.root = document.createElement("div"); tr.root.className = "tr"; tr.root.hidden = true;
    tr.root.innerHTML = `<div class="tr-block"></div><div class="tr-spot"></div>` +
      `<div class="tr-pop" role="dialog" aria-modal="true" aria-labelledby="trT" aria-describedby="trB" tabindex="-1">` +
      `<div class="tr-top"><span class="tr-n"></span><span class="tr-dots" aria-hidden="true"></span>${langSeg("tr-lang")}</div>` +
      `<div aria-live="polite"><h3 id="trT"></h3><p id="trB"></p></div>` +
      `<div class="tr-btns"><button class="tr-skip" type="button" data-a="skip"></button><span class="sp"></span>` +
      `<button class="btn" type="button" data-a="back"></button><button class="btn" type="button" data-a="guide"></button><button class="btn pri tr-go" type="button" data-a="next"></button></div></div>`;
    document.body.append(tr.root);
    tr.pop = $(".tr-pop", tr.root); tr.spot = $(".tr-spot", tr.root);
    tr.root.addEventListener("click", (e) => {
      const l = e.target.closest("[data-l]"), a = e.target.closest("[data-a]");
      if (l) setLang(l.dataset.l);
      else if (a) ({ next: () => go(tr.i + 1), back: () => go(tr.i - 1), skip: () => finish(), done: () => finish(), guide: () => finish(true) })[a.dataset.a]();
    });
  }
  function renderTour() {
    const L = T().tour, s = L.steps[tr.i], last = tr.i === L.steps.length - 1, q = (a) => $(`[data-a="${a}"]`, tr.pop);
    tr.pop.style.width = Math.min(340, vw() - 24) + "px";
    $(".tr-n", tr.pop).textContent = L.of.replace("{n}", tr.i + 1).replace("{total}", L.steps.length);
    $(".tr-dots", tr.pop).innerHTML = L.steps.map((_, k) => `<i${k === tr.i ? ' class="on"' : ""}></i>`).join("");
    $("#trT", tr.pop).textContent = s.t; $("#trB", tr.pop).textContent = s.b;
    tr.pop.setAttribute("aria-label", L.label);
    q("skip").textContent = L.skip; q("skip").hidden = last;
    q("back").textContent = L.back; q("back").hidden = tr.i === 0;
    q("guide").textContent = L.guide; q("guide").hidden = !last;
    const pri = $(".tr-go", tr.pop); pri.textContent = last ? L.done : L.next; pri.dataset.a = last ? "done" : "next";
    syncLang(tr.pop);
  }
  function rectOf(els) {
    const rs = els.filter(Boolean).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
    if (!rs.length) return null;
    const left = Math.min(...rs.map((r) => r.left)) - PAD, top = Math.min(...rs.map((r) => r.top)) - PAD;
    const right = Math.max(...rs.map((r) => r.right)) + PAD, bottom = Math.max(...rs.map((r) => r.bottom)) + PAD;
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }
  const target = () => { const f = C.targets[tr.i]; return f ? rectOf(f()) : null; };
  // Where the popover goes depends only on the target's size, so it stays put while the page scrolls.
  function mode(r) {
    const w = vw(), pw = tr.pop.offsetWidth, ph = tr.pop.offsetHeight;
    if (w < 600) return "dock";
    if (r.right + GAP + pw <= w - 12) return "right";
    if (r.left - GAP - pw >= 12) return "left";
    return r.height + GAP + ph + 32 <= vh() ? "below" : "dock";
  }
  function reveal(smooth) {
    const r = target();
    if (!r) return false;
    const m = mode(r), h = r.height, top = r.top + scrollY, ph = tr.pop.offsetHeight, H = vh();
    let y;
    if (m === "below") y = top - (H - h - GAP - ph) / 2;
    else if (m === "dock") { const room = H - ph - 24; y = h <= room - 24 ? top - (room - h) / 2 : top - 16; }
    else y = h <= H - 48 ? top - (H - h) / 2 : top - 24;
    y = Math.round(clamp(y, 0, document.documentElement.scrollHeight - H));
    if (Math.abs(y - scrollY) < 3) return false;
    scrollTo({ top: y, behavior: smooth && !calm() ? "smooth" : "auto" });
    return true;
  }
  function place() {
    const r = target(), pop = tr.pop, spot = tr.spot, W = vw(), H = vh(), pw = pop.offsetWidth, ph = pop.offsetHeight;
    tr.root.classList.toggle("plain", !r);
    if (!r) { pop.style.left = (W - pw) / 2 + "px"; pop.style.top = (H - ph) / 2 + "px"; return; }
    let m = mode(r), x, y;
    if (m === "right" || m === "left") {
      x = m === "right" ? r.right + GAP : r.left - GAP - pw;
      y = (clamp(r.top, 8, H) + clamp(r.bottom, 0, H - 8)) / 2 - ph / 2;
    } else if (m === "below") {
      x = clamp(r.left, 12, W - pw - 12); y = r.bottom + GAP;
      if (y + ph > H - 12) { y = r.top - GAP - ph; if (y < 12) m = "dock"; }
    }
    if (m === "dock") { x = (W - pw) / 2; y = H - ph - 12; }
    pop.style.left = clamp(x, 12, W - pw - 12) + "px"; pop.style.top = clamp(y, 12, H - ph - 12) + "px";
    const top = Math.max(r.top, 6), left = Math.max(r.left, 6), bottom = Math.min(r.bottom, m === "dock" ? y - 8 : H - 6), right = Math.min(r.right, W - 6);
    const off = bottom - top < 10 || right - left < 10;
    spot.classList.toggle("off", off);
    Object.assign(spot.style, off ? { left: W / 2 + "px", top: H / 2 + "px", width: "0px", height: "0px" } : { left: left + "px", top: top + "px", width: right - left + "px", height: bottom - top + "px" });
  }
  function settle() { tr.root.classList.remove("moving"); place(); }
  function go(n) {
    tr.i = clamp(n, 0, T().tour.steps.length - 1);
    renderTour();
    const scrolls = reveal(true);
    tr.root.classList.toggle("moving", scrolls);
    place();
    clearTimeout(tr.timer); tr.timer = setTimeout(settle, scrolls ? 1000 : 0);
    const cur = document.activeElement;
    if (!tr.pop.contains(cur) || !cur.getClientRects().length) $(".tr-go", tr.pop).focus({ preventScroll: true });
  }
  function startTour(from) {
    if (tr.open) return;
    if (gd.open) closeGuide(true);
    if (!tr.root) buildTour();
    tr.open = true; tr.y = scrollY;
    tr.from = from || (document.activeElement !== document.body ? document.activeElement : null);
    tr.root.hidden = false;
    lock(true, [tr.root]);
    go(0);
  }
  function finish(thenGuide) {
    if (!tr.open) return;
    tr.open = false; clearTimeout(tr.timer); markSeen();
    tr.root.hidden = true; lock(false);
    if (forced()) {
      const p = new URLSearchParams(location.search); p.delete("tour");
      const qs = p.toString().replace(/%2C/g, ",");
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }
    scrollTo({ top: tr.y, behavior: calm() ? "auto" : "smooth" });
    if (thenGuide === true) openGuide(null, tr.from); else back(tr.from);
  }

  /* ---------- wiring ---------- */
  function labels() {
    const l = T().info;
    document.querySelectorAll(".info").forEach((b, i) => {
      const h = b.previousElementSibling;
      b.setAttribute("aria-label", l); b.title = l;
      if (h) { h.id = h.id || "infoH" + i; b.setAttribute("aria-describedby", h.id); }
    });
  }
  function init(cfg) {
    C = cfg;
    document.addEventListener("click", (e) => {
      const info = e.target.closest(".info"), btn = e.target.closest("#guideBtn, #footGuide, #tourBtn");
      if (info) openGuide(info.dataset.g, info);
      else if (btn) { if (btn.id === "tourBtn") startTour(btn); else openGuide(null, btn); }
    });
    document.addEventListener("keydown", (e) => {
      if (tr.open) {
        if (e.key === "Escape") { e.preventDefault(); finish(); }
        else if (e.key === "ArrowRight" && tr.i < T().tour.steps.length - 1) { e.preventDefault(); go(tr.i + 1); }
        else if (e.key === "ArrowLeft" && tr.i > 0) { e.preventDefault(); go(tr.i - 1); }
        else trap(e, tr.pop);
      } else if (gd.open) {
        if (e.key === "Escape") { e.preventDefault(); closeGuide(); } else trap(e, gd.el);
      }
    });
    addEventListener("scroll", () => {
      if (!tr.open) return;
      cancelAnimationFrame(tr.raf); tr.raf = requestAnimationFrame(place);
      if (tr.root.classList.contains("moving")) { clearTimeout(tr.timer); tr.timer = setTimeout(settle, 110); }
    }, { passive: true });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (tr.open) { renderTour(); reveal(false); place(); } }, 120); });
    addEventListener(cfg.langEvent || "sl:lang", () => {
      labels();
      if (gd.open) { const b = $(".gd-body", gd.el), y = b.scrollTop; renderGuide(); b.scrollTop = y; }
      if (tr.open) { renderTour(); place(); }
    });
    addEventListener(cfg.readyEvent || "sl:ready", () => {
      labels();
      if (!forced() && seen()) return;
      // Late cards (job ads, maps) may still be loading; give them a moment so no spinner shows behind the tour.
      let tries = 0;
      (function wait() { if ([...document.querySelectorAll(".loading")].some((e) => e.offsetParent) && tries++ < 16) setTimeout(wait, 250); else if (!gd.open) startTour(null); })();
    }, { once: true });
    labels();
  }
  window.SLGuide = { init, openGuide: (id) => openGuide(id), startTour: () => startTour(null) };
})();
