/* A.O.P.A. equipment cargo manifest: holds, stock levels, sign-out / return, receiving */
(function inventory() {
  var root = document.getElementById("inv");
  if (!root) return;
  var el = AOPA.el;

  var HOLDS = [
    { id: "A", name: "WARDS & BARRIERS" },
    { id: "B", name: "DETECTION" },
    { id: "C", name: "CONTAINMENT" },
    { id: "D", name: "FIELD DEFENSE" },
    { id: "E", name: "SCIENTIFIC INSTRUMENTS" },
    { id: "F", name: "QUARANTINE (RECOVERED)", locked: true }
  ];
  var HAZ = ["NONE", "I", "II", "III", "IV", "V"];

  // mf, name, cover, hold, qty on hand, authorized stock, unit weight (lb), hazard 0-5
  function I(mf, name, cover, hold, qty, auth, wt, haz) {
    return { mf: mf, name: name, cover: cover, hold: hold, qty: qty, auth: auth, wt: wt, haz: haz };
  }
  var SEED = [
    I("AF-A-0101", "Standard-issue banishment barrier (50 lb sack)", "Perimeter Salt Line Kit", "A", 212, 300, 50, 0),
    I("AF-A-0102", "Threshold seal; bars entry to the uninvited", "Liberty Steel Entry Door", "A", 18, 40, 180, 0),
    I("AF-A-0103", "Cold-iron fae deterrent", "Iron Horseshoe Door Knocker", "A", 64, 100, 3, 0),
    I("AF-A-0104", "Scrying countermeasure (36 in. roll)", "Mirror-Guard Window Film", "A", 41, 60, 8, 0),
    I("AF-A-0105", "Protective circle kit (Field Manual, Ch. 4)", "Emergency Candle Pack", "A", 150, 150, 2, 1),
    I("AF-A-0106", "Consecrated chalk (gross)", "Sidewalk Chalk, Jumbo", "A", 9, 40, 6, 0),
    I("AF-B-0201", "Ectoplasmic intrusion detection array", "Sentinel 3000 Home Security System", "B", 37, 80, 22, 0),
    I("AF-B-0202", "Infernal presence early warning", "Smoke, CO & Sulfur Detector", "B", 120, 200, 1, 0),
    I("AF-B-0203", "EMF meter, modified for residual hauntings", "Stud Finder Deluxe", "B", 16, 30, 1.5, 0),
    I("AF-B-0204", "Dowsing rods, brass (pair)", "Garden Irrigation Locator", "B", 22, 20, 2, 0),
    I("AF-B-0205", "Spirit photography camera", "Instant Camera", "B", 11, 24, 1.2, 0),
    I("AF-C-0301", "Class IV warded sanctuary (flat-packed)", "Homestead Hardened Shelter", "C", 3, 5, 9800, 1),
    I("AF-C-0302", "Closet & under-bed containment field", "Night-Watch Nightlight", "C", 0, 250, 0.4, 0),
    I("AF-C-0303", "Lead-lined food storage (assorted)", "Keep-Fresh Containers", "C", 88, 100, 3, 0),
    I("AF-C-0304", "Warded mason jar, quart", "Canning Jars (12-pack)", "C", 140, 200, 1.1, 0),
    I("AF-D-0401", "Hellhound territorial marker", "\"Beware of Dog\" Sign", "D", 75, 75, 2, 0),
    I("AF-D-0402", "Rock salt shotgun shells (box of 25)", "Varmint Control Shells", "D", 30, 60, 3, 2),
    I("AF-D-0403", "Pressurized holy water sprayer", "Super Sprayer 50 Water Toy", "D", 12, 40, 1.5, 1),
    I("AF-D-0404", "Cold-iron poker", "Fireplace Tool Set", "D", 19, 25, 4, 1),
    I("AF-E-0501", "Geiger counter, civil defense surplus", "Radon Test Kit", "E", 8, 10, 5, 2),
    I("AF-E-0502", "Virtual pet containment sleeve", "Keychain Toy Case", "E", 14, 30, 0.2, 1),
    I("AF-E-0503", "Oscilloscope, calibrated to \"the static\"", "TV Antenna Signal Booster", "E", 4, 6, 25, 0),
    I("AF-E-0504", "Dial-up line isolator (kitchen phone)", "Phone Line Surge Protector", "E", 3, 25, 0.5, 1),
    I("AF-F-9001", "Unlabeled VHS cassette. DO NOT PLAY. DO NOT REWIND.", "(none: evidence)", "F", 17, 0, 0.6, 4),
    I("AF-F-9002", "Virtual pet, fed after midnight", "(none: evidence)", "F", 6, 0, 0.2, 3),
    I("AF-F-9003", "Monkey's paw (two fingers remaining)", "(none: evidence)", "F", 1, 0, 0.3, 5),
    I("AF-F-9004", "Wishing well capstone, Branson MO", "(none: evidence)", "F", 1, 0, 400, 3),
    I("AF-F-9005", "Choir practice tapes, Savannah GA (13 voices)", "(none: evidence)", "F", 4, 0, 0.1, 5)
  ];

  var KEY = "aopa-inventory";
  function load() {
    var s = AOPA.loadJSON(KEY, {});
    s.qty = s.qty || {};
    s.added = s.added || [];
    s.log = s.log || [];
    return s;
  }
  var state = load();
  function save() { AOPA.saveJSON(KEY, state); }

  function items() {
    return SEED.concat(state.added).map(function (it) {
      var o = {};
      for (var k in it) o[k] = it[k];
      if (state.qty[o.mf] != null) o.qty = state.qty[o.mf];
      return o;
    });
  }
  function holdOf(id) {
    for (var i = 0; i < HOLDS.length; i++) if (HOLDS[i].id === id) return HOLDS[i];
    return HOLDS[0];
  }
  function stock(it) {
    if (holdOf(it.hold).locked) return { cls: "quar", txt: "QUARANTINE" };
    if (it.qty <= 0) return { cls: "out", txt: "OUT" };
    if (it.auth && it.qty / it.auth < 0.25) return { cls: "low", txt: "LOW" };
    return { cls: "ok", txt: "IN STOCK" };
  }
  function lb(n) { return (Math.round(n * 10) / 10).toLocaleString("en-US") + " LB"; }

  var hold = "", sortKey = "mf", sortDir = 1;
  var tbl = document.getElementById("inv-table");
  var holdsBox = document.getElementById("inv-holds");
  var totals = document.getElementById("inv-totals");
  var q = document.getElementById("inv-q");
  var lowOnly = document.getElementById("inv-low");
  var shown = document.getElementById("inv-shown");
  var logBox = document.getElementById("inv-log");
  var form = document.getElementById("inv-form");

  HOLDS.forEach(function (h) {
    if (!h.locked) document.getElementById("inv-hold-sel").appendChild(el("option", { value: h.id }, "HOLD " + h.id + " - " + h.name));
  });

  function renderTotals(all) {
    var units = 0, weight = 0, low = 0;
    all.forEach(function (it) {
      units += it.qty;
      weight += it.qty * it.wt;
      var s = stock(it).cls;
      if (s === "low" || s === "out") low++;
    });
    totals.innerHTML = "";
    [["LINE ITEMS", String(all.length)], ["UNITS ON HAND", units.toLocaleString("en-US")],
     ["GROSS WEIGHT", lb(weight)], ["LOW / OUT OF STOCK", String(low)]].forEach(function (p) {
      totals.appendChild(el("div", null, [p[0], el("b", null, p[1])]));
    });
  }

  function renderHolds(all) {
    holdsBox.innerHTML = "";
    HOLDS.forEach(function (h) {
      var its = all.filter(function (it) { return it.hold === h.id; });
      var units = 0, auth = 0, wt = 0;
      its.forEach(function (it) { units += it.qty; auth += it.auth; wt += it.qty * it.wt; });
      var fill = h.locked ? 100 : auth ? Math.min(100, Math.round(units / auth * 100)) : 100;
      holdsBox.appendChild(el("button", { type: "button", className: "hold" + (h.locked ? " q" : ""),
        "aria-pressed": hold === h.id ? "true" : "false", dataset: { hold: h.id } }, [
        el("span", { className: "stripe" }),
        el("span", { className: "hid" }, h.id),
        el("span", { className: "hname" }, h.name),
        el("span", { className: "hstat" }, its.length + " LINES / " + units.toLocaleString("en-US") + " UNITS"),
        el("span", { className: "hstat" }, lb(wt)),
        el("span", { className: "bar", title: h.locked ? "Sealed" : fill + "% of authorized stock" },
          el("i", { style: "width:" + fill + "%" + (h.locked ? ";background:var(--red)" : fill < 25 ? ";background:var(--amber)" : "") }))
      ]));
    });
  }

  var COLS = [
    ["mf", "MANIFEST #"], ["name", "ITEM / COVER NAME"], ["hold", "HOLD"], ["qty", "ON HAND"],
    ["auth", "AUTH."], ["wt", "UNIT WT."], ["tw", "TOTAL WT."], ["haz", "HAZARD"], ["st", "STATUS"]
  ];

  function sortVal(it, k) {
    if (k === "tw") return it.qty * it.wt;
    if (k === "st") return stock(it).txt;
    var v = it[k];
    return typeof v === "string" ? v.toLowerCase() : v;
  }

  function renderTable(all) {
    var term = q.value.trim().toLowerCase();
    var rows = all.filter(function (it) {
      if (hold && it.hold !== hold) return false;
      if (lowOnly.checked) { var s = stock(it).cls; if (s !== "low" && s !== "out") return false; }
      if (term && (it.mf + " " + it.name + " " + it.cover).toLowerCase().indexOf(term) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var x = sortVal(a, sortKey), y = sortVal(b, sortKey);
      return (x < y ? -1 : x > y ? 1 : 0) * sortDir;
    });
    shown.textContent = "SHOWING " + rows.length + " OF " + all.length + (hold ? " (HOLD " + hold + ")" : "");

    tbl.innerHTML = "";
    tbl.appendChild(el("tr", null, COLS.map(function (c) {
      var arrow = sortKey === c[0] ? (sortDir > 0 ? " ▲" : " ▼") : "";
      return el("th", { "aria-sort": sortKey === c[0] ? (sortDir > 0 ? "ascending" : "descending") : "none" },
        el("button", { type: "button", dataset: { sort: c[0] } }, c[1] + arrow));
    })));
    if (!rows.length) {
      tbl.appendChild(el("tr", null, el("td", { colSpan: COLS.length, className: "dim" }, "> NO CARGO MATCHES.")));
      return;
    }
    rows.forEach(function (it) {
      var s = stock(it), locked = holdOf(it.hold).locked;
      tbl.appendChild(el("tr", null, [
        el("td", { className: "mf" }, it.mf),
        el("td", null, [it.name, el("span", { className: "cover" }, "COVER: " + (it.cover || "--"))]),
        el("td", null, it.hold),
        el("td", { className: "qty-cell" }, [
          el("button", { type: "button", dataset: { out: it.mf }, disabled: locked || it.qty <= 0,
            "aria-label": "Sign out one " + it.name, title: locked ? "Requires Council authorization" : "Sign out one" }, "-"),
          el("span", { className: "qty" }, String(it.qty)),
          el("button", { type: "button", dataset: { ret: it.mf }, disabled: locked,
            "aria-label": "Return one " + it.name, title: locked ? "Requires Council authorization" : "Return one" }, "+")
        ]),
        el("td", { className: "num" }, it.auth ? String(it.auth) : "--"),
        el("td", { className: "num" }, lb(it.wt)),
        el("td", { className: "num" }, lb(it.qty * it.wt)),
        el("td", null, el("span", { className: "haz h" + it.haz }, it.haz ? "CLASS " + HAZ[it.haz] : "NONE")),
        el("td", null, el("span", { className: "stk " + s.cls }, s.txt))
      ]));
    });
  }

  function renderLog() {
    logBox.innerHTML = "";
    if (!state.log.length) {
      logBox.appendChild(el("div", { className: "dim" }, "> NO REQUISITIONS FROM THIS TERMINAL YET."));
      return;
    }
    state.log.forEach(function (l) {
      logBox.appendChild(el("div", null, [
        el("span", { className: "t" }, l.t + "  "),
        el("span", { className: l.k }, l.k === "out" ? "SIGNED OUT" : l.k === "in" ? "RETURNED  " : "RECEIVED  "),
        "  " + l.n + " x " + l.mf + "  " + l.name + "  // " + l.a
      ]));
    });
  }

  function render() {
    var all = items();
    renderTotals(all);
    renderHolds(all);
    renderTable(all);
    renderLog();
  }

  function stamp() {
    var d = new Date();
    return ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/98 " +
      ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  function log(kind, it, n) {
    state.log.unshift({ t: stamp(), k: kind, mf: it.mf, name: it.name, n: n, a: AOPA.agentName() });
    state.log = state.log.slice(0, 100);
  }

  tbl.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.sort) {
      if (sortKey === b.dataset.sort) sortDir = -sortDir;
      else { sortKey = b.dataset.sort; sortDir = 1; }
      renderTable(items());
      return;
    }
    var mf = b.dataset.out || b.dataset.ret;
    if (!mf) return;
    var it = null;
    items().forEach(function (x) { if (x.mf === mf) it = x; });
    if (!it || holdOf(it.hold).locked) return;
    var delta = b.dataset.out ? -1 : 1;
    if (it.qty + delta < 0) return;
    state.qty[mf] = it.qty + delta;
    log(delta < 0 ? "out" : "in", it, 1);
    save();
    render();
  });

  holdsBox.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    hold = hold === b.dataset.hold ? "" : b.dataset.hold;
    render();
  });
  q.addEventListener("input", function () { renderTable(items()); });
  lowOnly.addEventListener("change", function () { renderTable(items()); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var h = f.hold.value;
    var n = state.added.filter(function (it) { return it.hold === h; }).length;
    var it = {
      mf: "AF-" + h + "-" + (7001 + n),
      name: f.name.value.trim().slice(0, 60),
      cover: f.cover.value.trim().slice(0, 60) || "(no cover assigned)",
      hold: h,
      qty: Math.max(1, Math.min(9999, parseInt(f.qty.value, 10) || 1)),
      auth: 0,
      wt: Math.max(0, parseFloat(f.wt.value) || 0),
      haz: Math.max(0, Math.min(5, parseInt(f.haz.value, 10) || 0))
    };
    it.auth = it.qty;
    state.added.push(it);
    log("recv", it, it.qty);
    save();
    form.reset();
    hold = "";
    render();
  });

  document.getElementById("inv-reset").addEventListener("click", function () {
    if (!confirm("Reset the manifest to Depot 7's official counts? Received cargo and the requisition log on this terminal will be cleared.")) return;
    state = { qty: {}, added: [], log: [] };
    save();
    render();
  });

  render();
})();
