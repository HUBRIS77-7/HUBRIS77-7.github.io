/* A.O.P.A. incident register: file reports & browse the log by category / state */
(function incidents() {
  var page = document.getElementById("inc-page");
  if (!page) return;

  var el = AOPA.el;
  var form = document.getElementById("inc-form");
  var ok = document.getElementById("inc-ok");
  var tabs = document.getElementById("inc-tabs");
  var stateSel = document.getElementById("inc-state");
  var q = document.getElementById("inc-q");
  var board = document.getElementById("state-board");
  var list = document.getElementById("inc-list");
  var shownLbl = document.getElementById("inc-shown");

  var cat = "ALL", st = "";

  // state dropdowns
  AOPA.STATES.forEach(function (s) {
    form.elements.st.appendChild(el("option", { value: s.abbr }, s.name));
    stateSel.appendChild(el("option", { value: s.abbr }, s.name));
  });
  form.elements.date.value = AOPA.todayISO();
  form.elements.agent.value = AOPA.agentName();

  function matches(inc) {
    if (cat !== "ALL" && inc.cat !== cat) return false;
    if (st && inc.st !== st) return false;
    var term = q.value.trim().toLowerCase();
    if (term) {
      var s = AOPA.STATE_BY_ABBR[inc.st];
      var hay = [inc.title, inc.body, inc.city, inc.agent, inc.id, s ? s.name : inc.st].join(" ").toLowerCase();
      if (hay.indexOf(term) < 0) return false;
    }
    return true;
  }

  function renderTabs(all) {
    tabs.innerHTML = "";
    ["ALL"].concat(AOPA.CATS).forEach(function (c) {
      var n = all.filter(function (i) { return c === "ALL" || i.cat === c; }).length;
      tabs.appendChild(el("button", {
        type: "button", className: c === "ALL" ? "" : "cat-" + c.toLowerCase(),
        "aria-pressed": c === cat ? "true" : "false", dataset: { cat: c }
      }, [c + " ", el("span", { className: "n" }, "(" + n + ")")]));
    });
  }

  function renderBoard(all) {
    // counts follow the category tab, so the board shows where MAGIC (etc.) is happening
    var counts = {};
    all.forEach(function (i) { if (cat === "ALL" || i.cat === cat) counts[i.st] = (counts[i.st] || 0) + 1; });
    board.innerHTML = "";
    AOPA.STATES.slice().sort(function (a, b) { return a.abbr < b.abbr ? -1 : 1; }).forEach(function (s) {
      var n = counts[s.abbr] || 0;
      board.appendChild(el("button", {
        type: "button", className: n ? "hot" : "", title: s.name + ": " + n + " incident" + (n === 1 ? "" : "s"),
        "aria-pressed": st === s.abbr ? "true" : "false", dataset: { st: s.abbr }
      }, [el("b", null, s.abbr), String(n)]));
    });
  }

  function renderList(all) {
    var rows = all.filter(matches);
    list.innerHTML = "";
    shownLbl.textContent = "SHOWING " + rows.length + " OF " + all.length;
    if (!rows.length) {
      list.appendChild(el("div", { className: "empty" }, "> NO INCIDENTS ON FILE FOR THIS FILTER. STAY VIGILANT."));
      return;
    }
    rows.forEach(function (inc) {
      var s = AOPA.STATE_BY_ABBR[inc.st];
      list.appendChild(el("div", { className: "inc cat-" + inc.cat.toLowerCase(), id: inc.id }, [
        inc.mine ? el("button", { type: "button", className: "cmd warn strike", dataset: { strike: inc.id } }, "STRIKE REPORT") : null,
        el("div", { className: "meta" }, [
          el("span", { className: "tag cat-" + inc.cat.toLowerCase() }, inc.cat),
          el("span", null, ["FILE ", el("b", null, inc.id)]),
          el("span", null, ["DATE ", el("b", null, AOPA.shortDate(inc.date))]),
          el("span", null, ["CLASS ", el("b", null, inc.cls)]),
          el("span", { className: "status st-" + inc.status.toLowerCase().replace(/\s+/g, "-") }, inc.status),
          inc.mine ? el("span", { className: "mine" }, "FILED FROM THIS TERMINAL") : null
        ]),
        el("h3", null, inc.title),
        el("div", { className: "meta" }, [
          el("span", null, ["LOCATION ", el("b", null, inc.city + ", " + (s ? s.name : inc.st))]),
          el("span", null, ["REPORTED BY ", el("b", null, inc.agent)])
        ]),
        el("p", null, inc.body)
      ]));
    });
  }

  function render() {
    var all = AOPA.allIncidents();
    renderTabs(all);
    renderBoard(all);
    renderList(all);
    stateSel.value = st;
  }

  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    cat = b.dataset.cat;
    render();
  });
  board.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    st = st === b.dataset.st ? "" : b.dataset.st;
    render();
  });
  stateSel.addEventListener("change", function () { st = stateSel.value; render(); });
  q.addEventListener("input", function () { renderList(AOPA.allIncidents()); });

  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-strike]");
    if (!b) return;
    if (!confirm("Strike this report from the register? This cannot be undone.")) return;
    AOPA.removeIncident(b.dataset.strike);
    render();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var date = f.date.value || AOPA.todayISO();
    var p = date.split("-");
    var agent = AOPA.setAgentName(f.agent.value);
    var inc = {
      id: p[0].slice(2) + "-" + p[1] + p[2] + "-" + f.st.value + "-" + (100 + Math.floor(Math.random() * 900)),
      date: date,
      cat: f.cat.value,
      cls: f.cls.value,
      status: f.status.value,
      st: f.st.value,
      city: f.city.value.trim().slice(0, 50),
      title: f.title.value.trim().slice(0, 80),
      agent: agent,
      body: f.body.value.trim().slice(0, 1500)
    };
    AOPA.addIncident(inc);
    form.reset();
    f.date.value = AOPA.todayISO();
    f.agent.value = agent;
    ok.hidden = false;
    ok.textContent = "> REPORT " + inc.id + " TRANSMITTED TO COUNCIL BLUFFS. " + inc.cat + " DIVISION HAS BEEN NOTIFIED.";
    cat = "ALL"; st = ""; q.value = "";
    render();
    var card = document.getElementById(inc.id);
    if (card) {
      card.classList.add("flash");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(function () { card.classList.remove("flash"); }, 2500);
    }
  });

  render();
  // arriving from the dashboard with #FILE-ID: make sure it's visible
  if (location.hash && location.hash !== "#report") {
    var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView({ block: "center" });
  }
})();
