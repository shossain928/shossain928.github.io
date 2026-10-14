/* Sorif Hossain — site behaviour.
   Every page shows its full content without this file;
   it only adds the theme switch, mobile menu, publication
   filters and the Cite button. The Projects figure lives in projects.js. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- Theme ---------- */
  var root = document.documentElement, themeBtn = $("#theme");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-theme");
    var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var navBtn = $(".nav-toggle"), navList = $("#nav-list");
  if (navBtn && navList) {
    navBtn.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("open")) {
        navList.classList.remove("open"); navBtn.setAttribute("aria-expanded", false); navBtn.focus();
      }
    });
  }

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Cite dialog (any page with papers) ---------- */
  var dlg = $("#cite-dialog");
  function nameParts(n) { var p = n.trim().split(/\s+/); var last = p.pop(); return { last: last, given: p }; }
  function isGap(n) { return /^(…|\.\.\.|et al\.?)$/.test(n.trim()); }
  function bibtex(d) {
    var names = d.authors.split(/,\s*/), gap = names.some(isGap);
    var authors = names.filter(function (n) { return !isGap(n); })
      .map(function (n) { var p = nameParts(n); return p.last + ", " + p.given.join(" "); }).join(" and ") + (gap ? " and others" : "");
    var key = (nameParts(d.authors.split(",")[0]).last + d.year + d.title.split(/\s+/)[0]).toLowerCase().replace(/[^a-z0-9]/g, "");
    var pre = d.venue === "Preprint";
    return (pre ? "@misc{" : "@article{") + key + ",\n  title   = {" + d.title + "},\n  author  = {" + authors + "}," +
      (pre ? "\n  note    = {Preprint}," : "\n  journal = {" + d.venue + "},") +
      "\n  year    = {" + d.year + "}" + (d.details ? ",\n  note    = {" + d.details + "}" : "") +
      (d.doi ? ",\n  doi     = {" + d.doi + "}" : "") + "\n}";
  }
  function apa(d) {
    var list = d.authors.split(/,\s*/).map(function (n) {
      if (isGap(n)) return "…";
      var p = nameParts(n);
      return p.last + ", " + p.given.map(function (g) { return g.replace(/\.$/, "").charAt(0) + "."; }).join(" ");
    });
    var a = list.length > 1 ? list.slice(0, -1).join(", ") + ", & " + list[list.length - 1] : list[0];
    return a + " (" + d.year + "). " + d.title + ". " + d.venue + (d.details ? ", " + d.details : "") + "." + (d.doi ? " https://doi.org/" + d.doi : "");
  }
  function copy(text, btn) {
    var label = btn.textContent;
    var ok = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, function () { window.prompt("Copy:", text); });
    else window.prompt("Copy:", text);
  }
  if (dlg && dlg.showModal) {
    var current = null;
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".cite-btn"); if (!b) return;
      var li = b.closest(".pub"); current = li.dataset;
      $("#cite-bib").textContent = bibtex(current);
      $("#cite-apa").textContent = apa(current);
      dlg.showModal();
    });
    $("#copy-bib").addEventListener("click", function () { copy($("#cite-bib").textContent, this); });
    $("#copy-apa").addEventListener("click", function () { copy($("#cite-apa").textContent, this); });
    $("#dl-bib").addEventListener("click", function () {
      var blob = new Blob([$("#cite-bib").textContent], { type: "application/x-bibtex" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = "citation.bib"; document.body.appendChild(a); a.click(); a.remove();
    });
    $("#cite-close").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  } else {
    $$(".cite-btn").forEach(function (b) { b.hidden = true; });
  }

  /* ---------- Publication filters ---------- */
  var list = $("#pub-list");
  if (list) {
    var pubs = $$(".pub", list), groups = $$(".pub-year", list);
    var state = { q: "", topic: "all", type: "all", year: "all", first: false, review: false };
    var originals = pubs.map(function (p) {
      return { t: $(".pub-title", p).innerHTML, a: $(".pub-authors", p).innerHTML, v: $(".pub-venue", p).innerHTML };
    });

    // topic buttons with live counts
    var topicBox = $("#topics");
    $$(".topic", topicBox).forEach(function (b) {
      var t = b.dataset.topic;
      var n = t === "all" ? pubs.length : pubs.filter(function (p) { return p.dataset.topic === t; }).length;
      $(".n", b).textContent = n;
    });
    // year options
    var yearSel = $("#year-filter");
    var years = pubs.map(function (p) { return p.dataset.year; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort().reverse();
    years.forEach(function (yv) { var o = document.createElement("option"); o.value = yv; o.textContent = yv; yearSel.appendChild(o); });

    var hl = function (html, q) {
      if (!q) return html;
      var re = new RegExp("(" + esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![^<]*>)", "gi");
      return html.replace(re, "<mark>$1</mark>");
    };
    var render = function () {
      var q = state.q.toLowerCase(), shown = 0;
      pubs.forEach(function (p, i) {
        var d = p.dataset;
        var hay = (d.title + " " + d.authors + " " + d.venue).toLowerCase();
        var ok = (state.topic === "all" || d.topic === state.topic) &&
                 (state.year === "all" || d.year === state.year) &&
                 (state.type === "all" || d.type === state.type) &&
                 (!state.first || d.first === "yes") &&
                 (!state.review || d.review === "yes") &&
                 (!q || hay.indexOf(q) !== -1);
        p.hidden = !ok; if (ok) shown++;
        $(".pub-title", p).innerHTML = hl(originals[i].t, state.q);
        $(".pub-authors", p).innerHTML = hl(originals[i].a, state.q);
        $(".pub-venue", p).innerHTML = hl(originals[i].v, state.q);
      });
      groups.forEach(function (g) { g.hidden = !$$(".pub", g).some(function (p) { return !p.hidden; }); });
      var count = function (t) { return pubs.filter(function (p) { return p.dataset.type === t; }).length; };
      var firsts = pubs.filter(function (p) { return p.dataset.first === "yes" && p.dataset.type === "article"; }).length;
      var nl = count("letter"), np = count("preprint");
      $("#pub-count").textContent = shown === pubs.length
        ? count("article") + " journal articles (" + firsts + " as first author)" +
          (nl ? ", " + nl + (nl > 1 ? " letters" : " letter") : "") + (np ? " and " + np + (np > 1 ? " preprints" : " preprint") : "")
        : "Showing " + shown + " of " + pubs.length;
      $("#pub-empty").hidden = shown !== 0;
    };
    var setTopic = function (t) {
      state.topic = t;
      $$(".topic", topicBox).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.topic === t); });
    };
    topicBox.addEventListener("click", function (e) { var b = e.target.closest(".topic"); if (b) { setTopic(b.dataset.topic); render(); } });
    $("#pub-q").addEventListener("input", function (e) { state.q = e.target.value.trim(); render(); });
    yearSel.addEventListener("change", function (e) { state.year = e.target.value; render(); });
    $("#type-filter").addEventListener("change", function (e) { state.type = e.target.value; render(); });
    $("#only-first").addEventListener("change", function (e) { state.first = e.target.checked; render(); });
    $("#only-review").addEventListener("change", function (e) { state.review = e.target.checked; render(); });
    $("#pub-reset").addEventListener("click", function () {
      state = { q: "", topic: "all", type: "all", year: "all", first: false, review: false };
      $("#pub-q").value = ""; yearSel.value = "all"; $("#type-filter").value = "all"; $("#only-first").checked = false; $("#only-review").checked = false;
      setTopic("all"); render();
    });

    // links like publications.html?topic=nutrition open pre-filtered
    var m = /[?&]topic=([a-z]+)/.exec(location.search);
    if (m && $('.topic[data-topic="' + m[1] + '"]', topicBox)) setTopic(m[1]);
    render();
  }
})();
