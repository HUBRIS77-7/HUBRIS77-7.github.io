/* ================================================================
   A.O.P.A. SECURE INTRANET v3.0 - shared routines + dashboard
   Everything here is make-believe. The "lock" is a toy and all
   agent data lives in this browser's localStorage only.
   ================================================================ */

var AOPA = (function () {
  function get(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }
  function set(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) { /* no storage, no memory */ }
  }
  function loadJSON(key, fallback) {
    try { return JSON.parse(get("localStorage", key)) || fallback; } catch (e) { return fallback; }
  }
  function saveJSON(key, value) { set("localStorage", key, JSON.stringify(value)); }

  // tiny DOM helper: el("div", {className: "x"}, "text" | [children])
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === "dataset") for (var d in props[k]) n.dataset[d] = props[k][d];
      else if (k in n) n[k] = props[k];
      else n.setAttribute(k, props[k]);
    }
    if (kids != null) {
      if (!Array.isArray(kids)) kids = [kids];
      kids.forEach(function (c) {
        if (c == null || c === false) return;
        n.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
      });
    }
    return n;
  }

  // "1998-03-12" -> "03/12/98"
  function shortDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "??/??/??";
    return p[1] + "/" + p[2] + "/" + p[0].slice(2);
  }
  // today's month/day, but it is always 1998 in here
  function todayISO() {
    var d = new Date();
    return "1998-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  var STATES = (window.AOPA_STATES || []).map(function (s) {
    return { abbr: s[0], name: s[1], d: s[2], x: s[3], y: s[4] };
  });
  var STATE_BY_ABBR = {};
  STATES.forEach(function (s) { STATE_BY_ABBR[s.abbr] = s; });

  var CATS = ["MAGIC", "OCCULT", "SCIENTIFIC"];

  /* ---------- the incident register (seed) ---------- */
  var SEED = [
    { id: "98-0312-IA", date: "1998-03-12", cat: "OCCULT", cls: "III", status: "OPEN", st: "IA", city: "Cedar Rapids",
      title: "Cursed VHS tapes in video store return bins", agent: "FIELD TEAM 9",
      body: "Unlabeled VHS cassettes are circulating through video store return bins across the Midwest. Viewers report a phone call exactly seven minutes after the tape ends. If a tape has no label, do NOT be kind. Do NOT rewind." },
    { id: "98-0309-MA", date: "1998-03-09", cat: "OCCULT", cls: "III", status: "OPEN", st: "MA", city: "Salem",
      title: "Uninvited guest traced through the public Guestbook", agent: "WEBMASTER GARY",
      body: "An \"Anonymous\" entry on the public Guestbook reads: \"Let me in, they didn't even notice.\" Connection traced to Salem. The household in question has a Sentinel 3000 that reports no intrusions. That is the problem." },
    { id: "98-0305-OH", date: "1998-03-05", cat: "OCCULT", cls: "II", status: "RESOLVED", st: "OH", city: "Dayton",
      title: "Cul-de-sac poltergeist, Maple Court", agent: "FIELD TEAM 4 (HENDERSONS)",
      body: "Poltergeist activity across four houses on one cul-de-sac. Dining chairs were found stacked to the ceiling in every kitchen. Three Sentinel 3000 units deployed. Furniture has stopped stacking itself." },
    { id: "98-0303-KS", date: "1998-03-03", cat: "SCIENTIFIC", cls: "IV", status: "UNDER REVIEW", st: "KS", city: "Salina",
      title: "Crop formations containing correct mathematics", agent: "AGENT PRUETT",
      body: "Formations in a wheat field solve an open problem in number theory. The farmer insists he \"just grows wheat.\" Scientific Division has requested the field be left standing until the proof is checked." },
    { id: "98-0301-NV", date: "1998-03-01", cat: "OCCULT", cls: "III", status: "OPEN", st: "NV", city: "Ely",
      title: "Hitchhiker who is always sixty miles ahead", agent: "HIGHWAY DETAIL 50",
      body: "Motorists on U.S. Route 50 report passing the same hitchhiker every sixty miles, no matter their speed. He is holding a sign with the driver's name on it. Do not stop. Do not read the sign twice." },
    { id: "98-0227-CA", date: "1998-02-27", cat: "SCIENTIFIC", cls: "II", status: "CONTAINED", st: "CA", city: "Fresno",
      title: "Tamagotchi units feeding on owners' sleep", agent: "SECTOR 7 COMMAND",
      body: "Virtual pet units in Sector 7 have begun feeding on their owners' sleep. Symptoms: grey dreams, beeping at 3 AM when no unit is present. Confiscate on sight. Do not feed them after midnight." },
    { id: "98-0224-AZ", date: "1998-02-24", cat: "MAGIC", cls: "IV", status: "UNDER REVIEW", st: "AZ", city: "Sedona",
      title: "Unlicensed ley-line tap in a crystal shop", agent: "AGENT MORROW",
      body: "A crystal and incense shop is drawing current from a ley intersection under its parking lot. Every compass in town now points at the cash register. The owner has not been told what he is doing, and must not be." },
    { id: "98-0220-WV", date: "1998-02-20", cat: "OCCULT", cls: "III", status: "UNDER REVIEW", st: "WV", city: "Point Pleasant",
      title: "Winged figure on the bridge (again)", agent: "AGENT CROSS",
      body: "Multiple sightings of a tall winged figure with red eyes near the river. Local Council liaison says \"this is the fourth time this year, please stop sending forms.\" Monitoring continues." },
    { id: "98-0217-MO", date: "1998-02-17", cat: "MAGIC", cls: "II", status: "CONTAINED", st: "MO", city: "Branson",
      title: "Tourist wishing well granting literal wishes", agent: "AGENT LOWELL",
      body: "A roadside wishing well has begun granting wishes, literally. A visitor who wished to \"be on TV\" is now on the television, at the motel, in Room 6. The well has been capped with cold iron. Recovery of the visitor is pending." },
    { id: "98-0214-NE", date: "1998-02-14", cat: "SCIENTIFIC", cls: "III", status: "OPEN", st: "NE", city: "Omaha",
      title: "Something is answering the dial-up tone", agent: "COUNCIL BLUFFS MONITORING",
      body: "Something has been answering the modem handshake. Families report a voice in the static saying \"you've got mail\" when they have not. Do not pick up the kitchen phone while a family member is online." },
    { id: "98-0211-OR", date: "1998-02-11", cat: "SCIENTIFIC", cls: "V", status: "OPEN", st: "OR", city: "Crater Lake",
      title: "Lake is deeper than it is", agent: "SURVEY TEAM DELTA",
      body: "Sonar sweeps read 1,943 feet. Then 19,430 feet. Then the word HELLO. Survey boat has been withdrawn. Nobody is to swim in the lake, which is also the Park Service's position, for different reasons." },
    { id: "98-0209-AK", date: "1998-02-09", cat: "MAGIC", cls: "III", status: "UNDER REVIEW", st: "AK", city: "Fairbanks",
      title: "Aurora spelling words in Old Norse", agent: "NORTHERN POST",
      body: "The aurora borealis spelled a woman's name in Old Norse runes for eleven minutes. A local resident by that name has not been located. Her dog is still waiting on the porch." },
    { id: "98-0206-GA", date: "1998-02-06", cat: "OCCULT", cls: "V", status: "OPEN", st: "GA", city: "Savannah",
      title: "Church choir records a thirteenth voice", agent: "AGENT BELL",
      body: "Choir practice recordings contain one extra voice. There are twelve members. With each new recording the voice is closer to the microphone. Practice has been suspended. The tapes are in Hold F." },
    { id: "98-0203-NJ", date: "1998-02-03", cat: "MAGIC", cls: "IV", status: "OPEN", st: "NJ", city: "Atlantic City",
      title: "Casino dice roll sevens indefinitely", agent: "AGENT VOSS",
      body: "A craps table has rolled seven for 212 consecutive throws. The dice are ordinary. The table is ordinary. The man in the white suit at the end of the table is not. Do not accept a drink from him." },
    { id: "98-0130-AL", date: "1998-01-30", cat: "SCIENTIFIC", cls: "III", status: "OPEN", st: "AL", city: "Birmingham",
      title: "Time slip at an all-night waffle restaurant", agent: "AGENT PRUETT",
      body: "Diners report being served before they ordered. A waitress poured coffee for a man who walked in forty minutes later. Receipts are dated 2011. The hash browns are fine." },
    { id: "98-0127-TX", date: "1998-01-27", cat: "SCIENTIFIC", cls: "III", status: "OPEN", st: "TX", city: "Amarillo",
      title: "Cattle levitating six feet off the ground", agent: "PANHANDLE DETAIL",
      body: "About forty head of cattle have been floating six feet off the ground at sundown. They come down at dawn and appear unbothered. The rancher has begun charging admission, which must be stopped." },
    { id: "98-0124-WA", date: "1998-01-24", cat: "MAGIC", cls: "II", status: "CONTAINED", st: "WA", city: "Seattle",
      title: "Bridge troll statue collecting tolls", agent: "AGENT HALE",
      body: "The troll under the bridge has moved three inches and is now holding out one hand. Cyclists who do not leave a coin report flat tires within the block. Toll negotiation handled by Magic Division." },
    { id: "98-0121-HI", date: "1998-01-21", cat: "SCIENTIFIC", cls: "II", status: "RESOLVED", st: "HI", city: "Hilo",
      title: "Lava flow runs uphill for forty minutes", agent: "PACIFIC POST",
      body: "A lava flow reversed direction and climbed back toward the vent for forty minutes before resuming normal behavior. Gravity has been verified as working. Local officials were told it was the wind." },
    { id: "98-0118-ME", date: "1998-01-18", cat: "OCCULT", cls: "II", status: "CONTAINED", st: "ME", city: "Bar Harbor",
      title: "Decommissioned lighthouse lit with no keeper", agent: "AGENT CROSS",
      body: "A lighthouse closed since 1934 has been lit every night this month. The lens was removed in 1935. Ships report the light guides them toward the rocks. Salt line laid around the base. The light has dimmed." },
    { id: "98-0115-CA", date: "1998-01-15", cat: "MAGIC", cls: "II", status: "UNDER REVIEW", st: "CA", city: "Bakersfield",
      title: "Customer reports \"the salt worked\"", agent: "WEBMASTER GARY",
      body: "A civilian customer wrote in to say the Perimeter Salt Line Kit worked. It should not have needed to. Magic Division is checking what he kept out and whether it is still waiting at the property line." },
    { id: "98-0112-MN", date: "1998-01-12", cat: "MAGIC", cls: "I", status: "RESOLVED", st: "MN", city: "Bloomington",
      title: "Hex bag found in a shopping mall food court", agent: "AGENT LOWELL",
      body: "A hex bag was found taped under a table at a mall food court. It contained hair, a penny from 1957 and a coupon. Neutralized on site. The coupon was expired." },
    { id: "98-0109-OK", date: "1998-01-09", cat: "OCCULT", cls: "II", status: "RESOLVED", st: "OK", city: "Tulsa",
      title: "Buzzing in the attic", agent: "FIELD TEAM 11",
      body: "A customer reported a persistent buzzing in the attic after dusk. A nest of something that was not wasps was removed. After the Sentinel 3000 went in the buzzing stopped. The customer has signed our Guestbook." },
    { id: "98-0105-FL", date: "1998-01-05", cat: "SCIENTIFIC", cls: "IV", status: "OPEN", st: "FL", city: "Cape Canaveral",
      title: "Launch pad receiving signal from the pad itself", agent: "AGENT OKAFOR",
      body: "A decommissioned launch pad is receiving a radio signal that triangulates to the pad itself, forty feet underground. There is nothing forty feet underground. The signal is a countdown. It is at 3,402." }
  ];

  var USER_KEY = "aopa-incidents";
  function userIncidents() { return loadJSON(USER_KEY, []); }
  function allIncidents() {
    return userIncidents().map(function (i) { i.mine = true; return i; }).concat(SEED)
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }
  function addIncident(inc) {
    var list = userIncidents();
    list.unshift(inc);
    saveJSON(USER_KEY, list.slice(0, 200));
  }
  function removeIncident(id) {
    saveJSON(USER_KEY, userIncidents().filter(function (i) { return i.id !== id; }));
  }

  /* ---------- clearance ---------- */
  function cleared() { return !!get("sessionStorage", "aopa-cleared"); }
  function logoff() {
    try { sessionStorage.removeItem("aopa-cleared"); } catch (e) {}
    location.href = "aopa.html";
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-logoff]");
    if (t) logoff();
  });

  // agent codename used for forum posts / requisitions
  function agentName() {
    var n = get("localStorage", "aopa-agent");
    if (!n) {
      n = "AGENT-" + (100 + Math.floor(Math.random() * 900));
      set("localStorage", "aopa-agent", n);
    }
    return n;
  }
  function setAgentName(n) {
    n = String(n || "").toUpperCase().replace(/[^A-Z0-9 ._\-()]/g, "").trim().slice(0, 24);
    if (n) set("localStorage", "aopa-agent", n);
    return agentName();
  }

  return {
    get: get, set: set, loadJSON: loadJSON, saveJSON: saveJSON, el: el,
    shortDate: shortDate, todayISO: todayISO,
    STATES: STATES, STATE_BY_ABBR: STATE_BY_ABBR, CATS: CATS,
    allIncidents: allIncidents, addIncident: addIncident, removeIncident: removeIncident,
    cleared: cleared, logoff: logoff, agentName: agentName, setAgentName: setAgentName
  };
})();

/* ---------- CRT tube: bowed scanlines, rolling scan bar, vignette, flicker ---------- */
(function crt() {
  var NS = "http://www.w3.org/2000/svg";
  var tube = document.createElement("div");
  tube.className = "crt";
  tube.setAttribute("aria-hidden", "true");
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "crt-lines");
  var lines = document.createElementNS(NS, "path");
  svg.appendChild(lines);
  tube.appendChild(svg);
  ["crt-roll", "crt-glass"].forEach(function (c) {
    var d = document.createElement("div");
    d.className = c;
    tube.appendChild(d);
  });
  document.body.appendChild(tube);

  // Horizontal scanlines, bent like they're drawn on the inside of a curved tube:
  // the further a line sits from the middle of the screen, the more its ends droop toward it.
  var GAP = 3, BOW = 0.035;
  function draw() {
    var w = window.innerWidth, h = window.innerHeight, cx = w / 2, cy = h / 2, d = "";
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    for (var y = 0.5; y < h; y += GAP) {
      var sag = (cy - y) * BOW;   // how far the ends move toward the center
      d += "M0 " + (y + sag).toFixed(1) + "Q" + cx + " " + (y - sag).toFixed(1) + " " + w + " " + (y + sag).toFixed(1);
    }
    lines.setAttribute("d", d);
  }
  var t = null;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 120); });
  draw();

  function apply(on) {
    document.body.classList.toggle("crt-on", on);
    Array.prototype.forEach.call(document.querySelectorAll("[data-crt]"), function (b) {
      b.textContent = "CRT: " + (on ? "ON" : "OFF");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  apply(AOPA.get("localStorage", "aopa-crt") !== "off");
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("[data-crt]")) return;
    var on = !document.body.classList.contains("crt-on");
    AOPA.set("localStorage", "aopa-crt", on ? "on" : "off");
    apply(on);
  });
})();

/* ---------- login (a toy lock: this is a fan site, not a vault) ---------- */
(function login() {
  var form = document.getElementById("aopa-form");
  if (!form) return;
  var loginBox = document.getElementById("aopa-login");
  var secret = document.getElementById("aopa-secret");
  var error = document.getElementById("aopa-error");

  function unlock() {
    loginBox.hidden = true;
    secret.hidden = false;
    document.dispatchEvent(new Event("aopa:unlocked"));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var guess = form.elements.pass.value.replace(/[^a-z]/gi, "").toUpperCase();
    // the first letters of Our Values, spelled backwards so Gary can't just search for it
    if (guess === "ECNALIGIV".split("").reverse().join("")) {
      AOPA.set("sessionStorage", "aopa-cleared", "1");
      error.hidden = true;
      form.reset();
      unlock();
    } else {
      error.hidden = false;
      form.elements.pass.value = "";
    }
  });

  if (AOPA.cleared()) unlock();
})();

/* ---------- dashboard: event wheel + field map ---------- */
(function dashboard() {
  var svg = document.getElementById("usmap");
  var wheel = document.getElementById("wheel");
  if (!svg || !wheel) return;

  var el = AOPA.el;
  var NS = "http://www.w3.org/2000/svg";
  var desc = document.getElementById("event-desc");
  var readout = document.getElementById("map-readout");
  var count = document.getElementById("wheel-count");
  var legend = document.getElementById("legend");

  var ITEM_H = 56;          // px between wheel slots
  var STEP = 15;            // degrees of drum rotation per slot
  var RADIUS = Math.round((ITEM_H / 2) / Math.sin(STEP / 2 * Math.PI / 180));

  var all = [], shown = [], sel = 0, built = false;
  var dotLayer, stateCounts = {};

  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildMap() {
    var defs = svgEl("defs", {});
    var pat = svgEl("pattern", { id: "grid", width: 25, height: 25, patternUnits: "userSpaceOnUse" });
    pat.appendChild(svgEl("path", { d: "M25 0H0V25", fill: "none", stroke: "#0b3d0b", "stroke-width": 1 }));
    defs.appendChild(pat);
    svg.appendChild(defs);
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: 975, height: 610, fill: "url(#grid)" }));

    var g = svgEl("g", { "class": "states" });
    AOPA.STATES.forEach(function (s) {
      var p = svgEl("path", { d: s.d, "data-abbr": s.abbr });
      var t = svgEl("title", {});
      t.textContent = s.name;
      p.appendChild(t);
      g.appendChild(p);
    });
    svg.appendChild(g);

    var labels = svgEl("g", { "class": "state-labels", "aria-hidden": "true" });
    AOPA.STATES.forEach(function (s) {
      var t = svgEl("text", { x: s.x, y: s.y + 16 });
      t.textContent = s.abbr;
      labels.appendChild(t);
    });
    svg.appendChild(labels);

    dotLayer = svgEl("g", { "class": "dots" });
    svg.appendChild(dotLayer);

    g.addEventListener("mouseover", function (e) {
      var abbr = e.target.getAttribute && e.target.getAttribute("data-abbr");
      if (!abbr) return;
      var s = AOPA.STATE_BY_ABBR[abbr];
      var n = stateCounts[abbr] || 0;
      readout.textContent = "SECTOR: " + s.name.toUpperCase() + " // " + n + " EVENT" + (n === 1 ? "" : "S");
    });
    g.addEventListener("mouseleave", function () { readout.textContent = "SECTOR: --"; });
  }

  function activeCats() {
    var on = {};
    Array.prototype.forEach.call(legend.querySelectorAll("input"), function (c) { on[c.value] = c.checked; });
    return on;
  }

  function renderDots() {
    while (dotLayer.firstChild) dotLayer.removeChild(dotLayer.firstChild);
    var perState = {};
    stateCounts = {};
    shown.forEach(function (inc, i) {
      var s = AOPA.STATE_BY_ABBR[inc.st];
      if (!s) return;
      stateCounts[inc.st] = (stateCounts[inc.st] || 0) + 1;
      // fan multiple events in one state out in a little spiral around its center
      var k = perState[inc.st] = (perState[inc.st] || 0) + 1;
      var a = (k - 1) * 2.4, r = 13 * Math.sqrt(k - 1);
      var x = s.x + Math.cos(a) * r, y = s.y + Math.sin(a) * r;
      var dot = svgEl("g", { "class": "dot cat-" + inc.cat.toLowerCase(), "data-i": i, tabindex: 0, role: "button",
        "aria-label": inc.title + ", " + inc.city + ", " + s.name });
      dot.appendChild(svgEl("circle", { "class": "ring", cx: x, cy: y, r: 9 }));
      dot.appendChild(svgEl("circle", { "class": "core", cx: x, cy: y, r: 6 }));
      var t = svgEl("title", {});
      t.textContent = inc.title + " (" + inc.city + ", " + inc.st + ")";
      dot.appendChild(t);
      dotLayer.appendChild(dot);
    });
  }

  function renderWheel() {
    wheel.innerHTML = "";
    if (!shown.length) {
      wheel.appendChild(el("div", { className: "wheel-empty dim" }, "> NO EVENTS MATCH THE CURRENT FILTER."));
      return;
    }
    shown.forEach(function (inc, i) {
      var item = el("div", { className: "wheel-item cat-" + inc.cat.toLowerCase(), role: "option", dataset: { i: i } }, [
        el("div", { className: "wi-top" }, [
          el("span", { className: "wi-cat" }, inc.cat.charAt(0)),
          el("span", { className: "wi-date" }, AOPA.shortDate(inc.date)),
          el("span", { className: "wi-st" }, inc.st)
        ]),
        el("div", { className: "wi-title" }, inc.title)
      ]);
      wheel.appendChild(item);
    });
  }

  function layoutWheel() {
    var items = wheel.querySelectorAll(".wheel-item");
    var n = items.length;
    Array.prototype.forEach.call(items, function (item, i) {
      // the drum wraps around: measure the short way round
      var d = ((i - sel) % n + n) % n;
      if (d > n / 2) d -= n;
      // an item jumping across the back of the drum shouldn't animate the long way
      if (item._d != null && Math.abs(d - item._d) > 1) {
        item.style.transition = "none";
        item.getBoundingClientRect();
      } else item.style.transition = "";
      item._d = d;
      var ang = -d * STEP;
      var far = Math.abs(d) > 5;
      item.style.transform = "translateZ(-" + RADIUS + "px) rotateX(" + ang + "deg) translateZ(" + RADIUS + "px)";
      item.style.opacity = far ? 0 : String(Math.max(0.12, 1 - Math.abs(d) * 0.17));
      item.style.visibility = far ? "hidden" : "visible";
      item.classList.toggle("sel", d === 0);
      item.setAttribute("aria-selected", d === 0 ? "true" : "false");
    });
    count.textContent = shown.length ? "EVENT " + (sel + 1) + " OF " + shown.length : "EVENT 0 OF 0";
  }

  function showDesc(inc) {
    desc.innerHTML = "";
    if (!inc) {
      desc.appendChild(el("div", { className: "panel-head" }, "EVENT DESCRIPTION"));
      desc.appendChild(el("p", { className: "dim" }, "> NO EVENT SELECTED."));
      return;
    }
    var s = AOPA.STATE_BY_ABBR[inc.st];
    desc.appendChild(el("div", { className: "panel-head" }, [
      "EVENT DESCRIPTION ",
      el("span", { className: "tag cat-" + inc.cat.toLowerCase() }, inc.cat)
    ]));
    desc.appendChild(el("h3", { className: "ev-title" }, inc.title));
    desc.appendChild(el("table", { className: "ev-facts" }, [
      el("tr", null, [el("th", null, "FILE"), el("td", null, inc.id), el("th", null, "DATE"), el("td", null, AOPA.shortDate(inc.date))]),
      el("tr", null, [el("th", null, "LOCATION"), el("td", null, inc.city + ", " + (s ? s.name : inc.st)), el("th", null, "CLASS"), el("td", null, inc.cls)]),
      el("tr", null, [el("th", null, "REPORTED BY"), el("td", null, inc.agent), el("th", null, "STATUS"),
        el("td", null, el("span", { className: "status st-" + inc.status.toLowerCase().replace(/\s+/g, "-") }, inc.status))])
    ]));
    desc.appendChild(el("p", { className: "ev-body" }, inc.body));
    desc.appendChild(el("p", { className: "small" },
      el("a", { href: "aopa-incidents.html#" + encodeURIComponent(inc.id) }, "> OPEN IN INCIDENT LOG")));
  }

  function select(i, fromMap) {
    if (!shown.length) { showDesc(null); layoutWheel(); return; }
    sel = ((i % shown.length) + shown.length) % shown.length;
    layoutWheel();
    showDesc(shown[sel]);
    Array.prototype.forEach.call(dotLayer.querySelectorAll(".dot"), function (d) {
      var on = +d.getAttribute("data-i") === sel;
      d.classList.toggle("sel", on);
      if (on) dotLayer.appendChild(d); // bring to front
    });
    if (fromMap) wheel.focus({ preventScroll: true });
  }

  function refresh() {
    var cats = activeCats();
    var keep = shown[sel] && shown[sel].id;
    shown = all.filter(function (inc) { return cats[inc.cat]; });
    renderWheel();
    renderDots();
    var idx = 0;
    shown.forEach(function (inc, i) { if (inc.id === keep) idx = i; });
    select(idx);
  }

  /* ---- wheel controls ---- */
  document.getElementById("wheel-up").addEventListener("click", function () { select(sel - 1); });
  document.getElementById("wheel-down").addEventListener("click", function () { select(sel + 1); });
  wheel.addEventListener("click", function (e) {
    var item = e.target.closest(".wheel-item");
    if (item) select(+item.dataset.i);
  });
  var wheelAcc = 0;
  wheel.addEventListener("wheel", function (e) {
    e.preventDefault();
    wheelAcc += e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
    while (Math.abs(wheelAcc) >= 45) {
      select(sel + (wheelAcc > 0 ? 1 : -1));
      wheelAcc -= wheelAcc > 0 ? 45 : -45;
    }
  }, { passive: false });
  wheel.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowUp" || k === "ArrowLeft") select(sel - 1);
    else if (k === "ArrowDown" || k === "ArrowRight") select(sel + 1);
    else if (k === "PageUp") select(sel - 5);
    else if (k === "PageDown") select(sel + 5);
    else if (k === "Home") select(0);
    else if (k === "End") select(shown.length - 1);
    else return;
    e.preventDefault();
  });
  var touchY = null, touchSel = 0;
  wheel.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; touchSel = sel; }, { passive: true });
  wheel.addEventListener("touchmove", function (e) {
    if (touchY == null) return;
    e.preventDefault();
    var steps = Math.round((touchY - e.touches[0].clientY) / (ITEM_H * 0.6));
    if (touchSel + steps !== sel) select(touchSel + steps);
  }, { passive: false });
  wheel.addEventListener("touchend", function () { touchY = null; });

  /* ---- map controls ---- */
  svg.addEventListener("click", function (e) {
    var dot = e.target.closest && e.target.closest(".dot");
    if (dot) select(+dot.getAttribute("data-i"), true);
  });
  svg.addEventListener("keydown", function (e) {
    var dot = e.target.closest && e.target.closest(".dot");
    if (dot && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(+dot.getAttribute("data-i")); }
  });
  legend.addEventListener("change", refresh);

  function start() {
    if (built) return;
    built = true;
    buildMap();
    all = AOPA.allIncidents();
    refresh();
  }
  if (!document.getElementById("aopa-secret").hidden) start();
  document.addEventListener("aopa:unlocked", start);
})();
