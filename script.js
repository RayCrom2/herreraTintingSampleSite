(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* header: hairline on scroll, full-screen menu on phones */
  var nav = $(".nav");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 4); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var menuBtn = $(".menu-btn");
  var setMenu = function (open) {
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
  $$("#menu a, #menu button").forEach(function (el) { el.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); lb.classList.remove("open"); } });
  window.matchMedia("(min-width:768px)").addEventListener("change", function () { setMenu(false); });

  /* footer accordions: always open on wide screens */
  var mq = window.matchMedia("(min-width:768px)");
  var cols = $$(".fcol");
  var syncCols = function () { if (mq.matches) cols.forEach(function (d) { d.open = true; }); };
  mq.addEventListener("change", syncCols); syncCols();
  cols.forEach(function (d) { $("summary", d).addEventListener("click", function (e) { if (mq.matches) e.preventDefault(); }); });

  /* sheets: quote + privacy */
  var quote = $("#quote"), privacy = $("#privacy");
  var openSheet = function (d) { if (d && !d.open) d.showModal(); };
  $$("[data-quote]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); setMenu(false); openSheet(quote); });
  });
  $$("[data-open='privacy']").forEach(function (b) { b.addEventListener("click", function () { openSheet(privacy); }); });
  $$("dialog .x, dialog [data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
  $$("dialog.sheet").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  });
  if (location.hash === "#quote") openSheet(quote);

  /* lightbox (gallery + spec sheets) */
  var lb = $("#lightbox"), lbImg = $("img", lb);
  var showLb = function (src, alt) { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); };
  lb.addEventListener("click", function () { lb.classList.remove("open"); });
  $$(".rail a").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); showLb(a.href, $("img", a).alt); });
  });
  $$("[data-img]").forEach(function (b) {
    b.addEventListener("click", function () { showLb(b.dataset.img, b.dataset.alt); });
  });

  /* before / after sliders (touch, mouse, keyboard) */
  $$(".ba").forEach(function (el) {
    var pos = 50;
    var set = function (p) {
      pos = Math.min(100, Math.max(0, p));
      el.style.setProperty("--p", pos + "%");
      el.setAttribute("aria-valuenow", Math.round(pos));
    };
    var fromX = function (x) { var r = el.getBoundingClientRect(); set((x - r.left) / r.width * 100); };
    var down = false;
    el.addEventListener("pointerdown", function (e) { down = true; el.setPointerCapture(e.pointerId); fromX(e.clientX); });
    el.addEventListener("pointermove", function (e) { if (down) fromX(e.clientX); });
    el.addEventListener("pointerup", function () { down = false; });
    el.addEventListener("pointercancel", function () { down = false; });
    el.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { set(pos - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { set(pos + 5); e.preventDefault(); }
    });
  });

  /* quote form */
  var form = $("#quote-form");
  var removal = $("#removal");
  removal.addEventListener("change", function () { $("#removal-fields").classList.toggle("show", removal.value === "Yes"); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("#form-msg");
    $$(".opt", form).forEach(function (o) { o.classList.remove("bad"); });
    $$(".invalid", form).forEach(function (o) { o.classList.remove("invalid"); });
    var missing = $$("[required]", form).filter(function (el) {
      if (el.type === "checkbox") return !el.checked;
      if (el.type === "radio") return !form.querySelector("input[name=" + el.name + "]:checked");
      return !el.value.trim();
    });
    if (!form.querySelector("input[name=film]:checked")) $$(".film-opt", form).forEach(function (o) { o.classList.add("bad"); });
    if (missing.length) {
      missing.forEach(function (el) { if (el.type !== "radio") el.classList.add("invalid"); });
      msg.className = "form-msg err show";
      msg.textContent = "Please fill in the required fields and accept the terms.";
      return;
    }
    var d = new FormData(form);
    var body = [
      "Name: " + d.get("full_name"), "Phone: " + d.get("phone"), "Vehicle: " + d.get("vehicle"),
      "Film: " + d.get("film"), "Windows: " + (d.get("windows") || "-"),
      "Tint removal: " + d.get("removal"),
      d.get("removal") === "Yes" ? "Removal windows: " + (d.get("removal_windows") || "-") + "\nOld tint condition: " + (d.get("condition") || "-") : "",
      "Comments: " + (d.get("comments") || "-")
    ].filter(Boolean).join("\n");
    // Demo behavior: opens a pre-filled email. Swap for the GoHighLevel/LeadConnector form when going live.
    window.location.href = "mailto:Herreratinting707@gmail.com?subject=" + encodeURIComponent("Quote request: " + d.get("vehicle")) + "&body=" + encodeURIComponent(body);
    msg.className = "form-msg show";
    msg.textContent = "Thanks! We'll get back to you ASAP with your quote.";
  });

  /* reveal on scroll */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  $("#yr").textContent = new Date().getFullYear();
})();
