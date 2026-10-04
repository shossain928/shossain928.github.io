/* Live SIR model with behavioural change (alarm functions).
   Discrete-time chain-binomial SIR, following Ward, Deardon & Schmidt (2023):
     I*_t ~ Bin(S_t, 1 - exp(-beta (1 - a_t) I_t / N)),  R*_t ~ Bin(I_t, 1 - exp(-gamma))
     a_t = f(x_t), x_t = mean incidence over the previous m days.
   Smooth curves are the expected path; "Stochastic runs" adds binomial realizations. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!$("#p-sir")) return;

  var NS = "http://www.w3.org/2000/svg";
  var N = 1e6, I0 = 5, T = 300, TAIL = 120, NRUNS = 12;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- controls ---------- */
  var logMap = function (v, lo, hi) { return lo * Math.pow(hi / lo, v / 100); };
  var kind = "power", view = "all";
  var read = {
    power: function () { return { k: logMap(+$("#pw-k").value, 1e-3, 1e-1) }; },
    exponential: function () { return { d: logMap(+$("#ex-d").value, 1e-5, 1e-3) }; },
    hill: function () { return { d: +$("#hi-d").value, x0: logMap(+$("#hi-x0").value, 500, 20000), nu: +$("#hi-nu").value }; },
    threshold: function () { return { d: +$("#th-d").value, H: logMap(+$("#th-h").value, 500, 20000) }; }
  };
  var common = function () {
    var ip = +$("#c-ip").value;
    return { beta: +$("#c-beta").value, gamma: 1 / ip, ip: ip, m: +$("#c-m").value };
  };
  var SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  var sci = function (v) {
    var s = v.toExponential(1).split("e");
    return s[0] + " × 10" + s[1].replace("+", "").split("").map(function (c) { return SUP[c] || c; }).join("");
  };
  var fmtInt = function (x) { return Math.round(x).toLocaleString("en-US"); };
  var round2 = function (x) { var p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };
  var fmtK = function (x) {
    if (x >= 1000) { var v = x / 1000; return (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) + "k"; }
    return String(Math.round(x));
  };
  var pct = function (v) { return v < 0.001 ? "<0.1%" : (v * 100).toFixed(v < 0.1 ? 1 : 0) + "%"; };

  function updateOutputs() {
    var p = read[kind](), c = common();
    $("#pw-k-out").textContent = read.power().k.toPrecision(2);
    $("#ex-d-out").textContent = sci(read.exponential().d);
    var h = read.hill(), th = read.threshold();
    $("#hi-d-out").textContent = h.d.toFixed(2);
    $("#hi-x0-out").textContent = fmtInt(round2(h.x0)) + " cases/day";
    $("#hi-nu-out").textContent = h.nu.toFixed(1);
    $("#th-d-out").textContent = th.d.toFixed(2);
    $("#th-h-out").textContent = fmtInt(round2(th.H)) + " cases/day";
    $("#c-beta-out").textContent = c.beta.toFixed(2) + "  (β/γ = " + (c.beta * c.ip).toFixed(1) + ")";
    $("#c-ip-out").textContent = c.ip.toFixed(1) + " days";
    return { p: p, c: c };
  }

  /* ---------- model ---------- */
  function alarm(k, x, p) {
    if (k === "power") return 1 - Math.pow(1 - Math.min(x, N) / N, 1 / p.k);
    if (k === "exponential") return 1 - Math.exp(-p.d * x);
    if (k === "hill") return x <= 0 ? 0 : p.d / (1 + Math.pow(p.x0 / x, p.nu));
    if (k === "threshold") return x > p.H ? p.d : 0;
    return 0;
  }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function binom(n, p) {
    n = Math.round(n);
    if (n <= 0 || p <= 0) return 0;
    if (p >= 1) return n;
    if (n < 60) { var c = 0; for (var i = 0; i < n; i++) if (Math.random() < p) c++; return c; }
    var mu = n * p;
    if (mu < 25) {                                    // Poisson approximation
      var L = Math.exp(-mu), k = 0, q = 1;
      do { k++; q *= Math.random(); } while (q > L);
      return Math.min(k - 1, n);
    }
    return Math.max(0, Math.min(n, Math.round(mu + Math.sqrt(mu * (1 - p)) * gauss())));
  }
  function simulate(k, p, c, stochastic) {
    var len = T + TAIL, S = N - I0, I = I0, R = 0, win = 0;
    var o = { S: [], I: [], R: [], inc: [], x: [], a: [], b: [] }, pIR = 1 - Math.exp(-c.gamma);
    for (var t = 0; t < len; t++) {
      var n = Math.min(c.m, t), x = n ? win / n : 0;
      var a = k ? alarm(k, x, p) : 0, bt = c.beta * (1 - a);
      var pSI = 1 - Math.exp(-bt * I / N);
      var is = stochastic ? binom(S, pSI) : S * pSI;
      var rs = stochastic ? binom(I, pIR) : I * pIR;
      o.S.push(S); o.I.push(I); o.R.push(R); o.x.push(x); o.a.push(a); o.b.push(bt);
      S -= is; I += is - rs; R += rs;
      o.inc.push(is); win += is;
      if (t - c.m >= 0) win -= o.inc[t - c.m];
    }
    // R(t) = S_t * sum_{k>=t} [1 - exp(-beta_k / N)] exp(-gamma)^(k-t), by backward recursion
    var G = new Array(len + 1); G[len] = 0;
    var eg = Math.exp(-c.gamma);
    for (var j = len - 1; j >= 0; j--) G[j] = (1 - Math.exp(-o.b[j] / N)) + eg * G[j + 1];
    o.Rt = o.S.map(function (s, j) { return s * G[j]; });
    return o;
  }

  /* ---------- drawing helpers ---------- */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function niceStep(max, count) {
    var raw = max / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
    return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
  }
  function frame(svg, W, H, M, xmax, ymax, opts) {
    svg.innerHTML = "";
    var f = {
      x: function (v) { return M.l + (v / xmax) * (W - M.l - M.r); },
      y: function (v) { return M.t + (1 - Math.min(v, ymax) / ymax) * (H - M.t - M.b); },
      W: W, H: H, M: M
    };
    var grid = el("g", { "class": "grid" }, svg), axis = el("g", { "class": "axis" }, svg);
    var ys = opts.ystep || niceStep(ymax, 4);
    for (var v = 0; v <= ymax + 1e-9; v += ys) {
      if (v > 0) el("line", { x1: M.l, x2: W - M.r, y1: f.y(v), y2: f.y(v) }, grid);
      el("text", { x: M.l - 6, y: f.y(v) + 4, "text-anchor": "end" }, axis).textContent = opts.yfmt(v);
    }
    var xs = opts.xstep || niceStep(xmax, 4);
    for (var u = 0; u <= xmax + 1e-9; u += xs)
      el("text", { x: f.x(u), y: H - M.b + 16, "text-anchor": "middle" }, axis).textContent = opts.xfmt(u);
    el("line", { x1: M.l, x2: W - M.r, y1: f.y(0), y2: f.y(0) }, axis);
    if (opts.xlabel) el("text", { x: W - M.r, y: H - 2, "text-anchor": "end" }, axis).textContent = opts.xlabel;
    f.marks = el("g", {}, svg);
    return f;
  }
  function line(f, ys, upto, scale) {
    var d = "", n = Math.min(upto, ys.length - 1);
    for (var t = 0; t <= n; t++) d += (t ? "L" : "M") + f.x(t).toFixed(1) + "," + f.y(ys[t] / (scale || 1)).toFixed(1);
    return d;
  }

  /* ---------- state + render ---------- */
  var cur = null, base = null, runs = [], tNow = T, anim = null;
  var svgSIR = $("#p-sir"), svgRt = $("#p-rt"), svgA = $("#p-alarm");

  function compute(regenRuns) {
    var s = updateOutputs();
    cur = simulate(kind, s.p, s.c, false);
    base = simulate(null, s.p, s.c, false);
    cur.p = s.p; cur.c = s.c;
    if ($("#bc-stoch").checked && (regenRuns || true)) {
      runs = [];
      for (var i = 0; i < NRUNS; i++) runs.push(simulate(kind, s.p, s.c, true));
    } else runs = [];
    readouts();
    $$(".alarm-table tr").forEach(function (tr) { tr.classList.toggle("on", tr.dataset.kind === kind); });
  }

  function readouts() {
    var I = cur.I.slice(0, T + 1), pk = Math.max.apply(null, I), pd = I.indexOf(pk);
    $("#o-peak").textContent = pct(pk / N);
    $("#o-day").textContent = pd;
    $("#o-final").textContent = pct((N - cur.S[T]) / N);
    $("#o-base").textContent = pct((N - base.S[T]) / N);
    var r1 = -1;
    for (var t = 1; t <= T; t++) if (cur.Rt[t] < 1) { r1 = t; break; }
    $("#o-r1").textContent = r1 < 0 ? "never" : r1;
    var inc = cur.inc.slice(0, T + 1), mx = Math.max.apply(null, inc), waves = 0, last = -99;
    for (var j = 1; j < T; j++)
      if (inc[j] > inc[j - 1] && inc[j] >= inc[j + 1] && inc[j] > 0.05 * mx && j - last >= 10) { waves++; last = j; }
    $("#o-waves").textContent = waves || 1;
  }

  function drawSIR(upto) {
    var narrow = svgSIR.getBoundingClientRect().width < 520;
    var W = narrow ? 420 : 680, H = narrow ? 300 : 280, M = { t: 14, r: narrow ? 40 : 46, b: 30, l: narrow ? 50 : 46 };
    svgSIR.setAttribute("viewBox", "0 0 " + W + " " + H);
    var all = view === "all", ymax;
    if (all) ymax = 1;
    else {
      var m = Math.max(Math.max.apply(null, cur.I.slice(0, T + 1)), Math.max.apply(null, base.I.slice(0, T + 1)));
      runs.forEach(function (r) { m = Math.max(m, Math.max.apply(null, r.I.slice(0, T + 1))); });
      var st = niceStep(m / N * 1.08, 5); ymax = Math.ceil((m / N * 1.08) / st) * st;
    }
    var f = frame(svgSIR, W, H, M, T, ymax, {
      xstep: narrow ? 100 : 50, xfmt: String, xlabel: "Day",
      ystep: all ? 0.25 : undefined,
      yfmt: function (v) { return (v * 100).toFixed(ymax < 0.05 ? 1 : 0).replace(/\.0$/, "") + "%"; }
    });
    var g = f.marks;
    el("path", { "class": "c-base", d: line(f, base.I, upto, N) }, g);
    runs.forEach(function (r) { el("path", { "class": "c-stoch", d: line(f, r.I, upto, N) }, g); });
    var di = line(f, cur.I, upto, N);
    el("path", { "class": "c-i-area", d: di + "L" + f.x(Math.min(upto, T)) + "," + f.y(0) + "L" + f.x(0) + "," + f.y(0) + "Z" }, g);
    if (all) {
      el("path", { "class": "c-s", d: line(f, cur.S, upto, N) }, g);
      el("path", { "class": "c-r", d: line(f, cur.R, upto, N) }, g);
    }
    el("path", { "class": "c-i", d: di }, g);
    // direct labels
    var u = Math.min(upto, T), lx = f.x(u) + 6;
    if (all) {
      var ls = [["S", cur.S[u] / N, "lab-s"], ["R", cur.R[u] / N, "lab-r"], ["I", cur.I[u] / N, "lab-i"]]
        .map(function (q) { return { t: q[0], y: f.y(q[1]), c: q[2] }; }).sort(function (a, b) { return a.y - b.y; });
      for (var i = 1; i < ls.length; i++) if (ls[i].y - ls[i - 1].y < 13) ls[i].y = ls[i - 1].y + 13;
      ls.forEach(function (q) { el("text", { "class": "lab " + q.c, x: lx, y: q.y + 4 }, g).textContent = q.t; });
    }
    var bpk = Math.max.apply(null, base.I.slice(0, T + 1)), bpd = base.I.indexOf(bpk);
    if (upto >= bpd) el("text", { "class": "lab-base", x: f.x(bpd) + 10, y: f.y(bpk / N) - 4 }, g).textContent = "I without alarm";
    if (!all) {
      var I = cur.I.slice(0, u + 1), pk = Math.max.apply(null, I), pd = I.indexOf(pk);
      el("text", { "class": "lab lab-i", x: Math.min(f.x(pd) + 6, W - M.r - 60), y: f.y(pk / N) - 8 }, g).textContent = "I with alarm";
    }
    if (upto < T) el("line", { "class": "c-cursor", x1: f.x(upto), x2: f.x(upto), y1: M.t, y2: H - M.b }, g);
  }

  function drawRt(upto) {
    var W = 340, H = 230, M = { t: 12, r: 14, b: 30, l: 34 };
    var mx = Math.max(Math.max.apply(null, base.Rt.slice(0, T + 1)), Math.max.apply(null, cur.Rt.slice(0, T + 1)), 1.2);
    var st = niceStep(mx * 1.1, 4), ymax = Math.ceil(mx * 1.1 / st) * st;
    var f = frame(svgRt, W, H, M, T, ymax, { xstep: 100, xfmt: String, xlabel: "Day", yfmt: function (v) { return +v.toFixed(2) + ""; } });
    var g = f.marks;
    el("line", { "class": "c-one", x1: M.l, x2: W - M.r, y1: f.y(1), y2: f.y(1) }, g);
    el("text", { "class": "lab-note", x: W - M.r, y: f.y(1) - 5, "text-anchor": "end" }, g).textContent = "R(t) = 1";
    el("path", { "class": "c-base", d: line(f, base.Rt, upto) }, g);
    el("path", { "class": "c-rt", d: line(f, cur.Rt, upto) }, g);
    if (upto < T) el("line", { "class": "c-cursor", x1: f.x(upto), x2: f.x(upto), y1: M.t, y2: H - M.b }, g);
  }

  function drawAlarm(upto) {
    var W = 340, H = 230, M = { t: 12, r: 14, b: 30, l: 34 }, p = cur.p;
    var scale = kind === "power" ? N * p.k : kind === "exponential" ? 1 / p.d : kind === "hill" ? p.x0 : p.H;
    var maxX = Math.max.apply(null, cur.x.slice(0, T + 1));
    var xmax = Math.max(2.5 * scale, 1.25 * maxX, 10);
    var xs = niceStep(xmax, 4); xmax = Math.ceil(xmax / xs) * xs;
    var f = frame(svgA, W, H, M, xmax, 1, { xstep: xs, xfmt: fmtK, ystep: 0.25, xlabel: "Smoothed daily cases x", yfmt: function (v) { return v.toFixed(2).replace(/0$/, ""); } });
    var g = f.marks;
    el("rect", { "class": "c-visited", x: f.x(0), y: M.t, width: Math.max(0, f.x(Math.min(maxX, xmax)) - f.x(0)), height: H - M.t - M.b }, g);
    var d = "";
    if (kind === "threshold") {
      d = "M" + f.x(0) + "," + f.y(0) + "L" + f.x(Math.min(p.H, xmax)) + "," + f.y(0) +
          "L" + f.x(Math.min(p.H, xmax)) + "," + f.y(p.d) + "L" + f.x(xmax) + "," + f.y(p.d);
    } else {
      for (var i = 0; i <= 200; i++) { var x = xmax * i / 200; d += (i ? "L" : "M") + f.x(x).toFixed(1) + "," + f.y(alarm(kind, x, p)).toFixed(1); }
    }
    el("path", { "class": "c-alarm", d: d }, g);
    var t = Math.min(upto, T), xt = cur.x[t], at = cur.a[t];
    if (upto >= T) { var mi = cur.x.slice(0, T + 1).indexOf(maxX); xt = maxX; at = cur.a[mi]; }
    el("circle", { "class": "c-dot", cx: f.x(Math.min(xt, xmax)), cy: f.y(at), r: 5 }, g);
    var note = upto >= T ? "Highest alarm " + at.toFixed(2) : "Day " + t + ": alarm " + at.toFixed(2);
    el("text", { "class": "lab-note", x: W - M.r, y: M.t + 10, "text-anchor": "end" }, g).textContent = note;
    if (f.x(Math.min(maxX, xmax)) - f.x(0) > 60)
      el("text", { "class": "lab-note", x: f.x(0) + 5, y: M.t + 26 }, g).textContent = "range reached";
  }

  function render(upto) {
    tNow = upto;
    drawSIR(upto); drawRt(upto); drawAlarm(upto);
  }

  /* ---------- animation ---------- */
  var playBtn = $("#bc-play");
  function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } playBtn.textContent = "Play outbreak"; }
  playBtn.addEventListener("click", function () {
    if (anim) { stop(); render(T); return; }
    if (reduceMotion) { render(T); return; }
    var t0 = null, dur = 6000;
    playBtn.textContent = "Stop";
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var d = Math.min(T, Math.round((ts - t0) / dur * T));
      render(d);
      if (d < T) anim = requestAnimationFrame(step); else stop();
    };
    anim = requestAnimationFrame(step);
  });

  /* ---------- events ---------- */
  function refresh() { stop(); compute(); render(T); }
  $$("#alarm-type button").forEach(function (b) {
    b.addEventListener("click", function () {
      kind = b.dataset.kind;
      $$("#alarm-type button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      $$(".ctl-group[data-kind]").forEach(function (fs) { fs.hidden = fs.dataset.kind !== kind; });
      refresh();
    });
  });
  $$("#sir-view button").forEach(function (b) {
    b.addEventListener("click", function () {
      view = b.dataset.view;
      $$("#sir-view button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      render(tNow);
    });
  });
  $$(".bc-controls input, .bc-controls select").forEach(function (i) { i.addEventListener("input", refresh); });
  $("#bc-stoch").addEventListener("change", function () { $("#bc-redraw").hidden = !this.checked; refresh(); });
  $("#bc-redraw").addEventListener("click", refresh);

  var lastNarrow = null;
  window.addEventListener("resize", function () {
    var n = svgSIR.getBoundingClientRect().width < 520;
    if (n !== lastNarrow) { lastNarrow = n; if (!anim) render(tNow); }
  });

  compute(); render(T);
})();
