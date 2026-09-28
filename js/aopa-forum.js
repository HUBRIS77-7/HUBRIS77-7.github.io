/* A.O.P.A. agent forum: boards -> threads -> posts (views live in the #hash) */
(function forum() {
  var root = document.getElementById("forum-view");
  if (!root) return;
  var el = AOPA.el;

  var BOARDS = [
    { id: "briefing", name: "GENERAL BRIEFING ROOM", desc: "Council announcements, standing orders, and things every agent must read." },
    { id: "magic", name: "MAGIC DIVISION", desc: "Wards, workings, curses, wishes and the paperwork that follows them." },
    { id: "occult", name: "OCCULT DIVISION", desc: "Hauntings, entities and after-action reports. Do not post names in full." },
    { id: "science", name: "SCIENTIFIC DIVISION", desc: "Anomalous physics, radio, time slips and consumer electronics." },
    { id: "quartermaster", name: "QUARTERMASTER / REQUISITIONS", desc: "Equipment questions. Return what you sign out." },
    { id: "breakroom", name: "BREAK ROOM", desc: "Off-duty chatter. Potlucks, bowling league, recipes (non-ritual)." }
  ];

  var RANKS = {
    "THE COUNCIL": "Governing Body",
    "DALE (HQ)": "Director, Cover Operations",
    "GARY_WEBMASTER": "Webmaster (On Probation)",
    "BOB_H": "Team Leader, Field Team 4",
    "LINDA_H": "Wards & Containment, FT-4",
    "TYLER_H": "Junior Agent (Trainee)",
    "BRITTANY_H": "Sensitive, FT-4",
    "QM_DOROTHY": "Quartermaster, Depot 7"
  };

  function P(a, d, t) { return { a: a, d: d, t: t }; }

  var SEED = [
    { id: "s1", board: "briefing", pinned: true, title: "STANDING ORDERS - READ BEFORE POSTING", posts: [
      P("THE COUNCIL", "01/01/98 12:00 AM",
        "1. Keep the salt lines unbroken.\n2. Check your wards weekly.\n3. Never say its name three times.\n4. Never invite anything in.\n5. The public must never know. Sell them the alarm system.\n\nThis thread is locked in spirit if not in software.")
    ] },
    { id: "s2", board: "briefing", title: "Re: the public web site incident (01/19/98)", posts: [
      P("DALE (HQ)", "01/20/98 09:14 AM", "A classified page was posted on the public web site for about six hours. Gary has been spoken to.\n\nGary, please also take the little triangle out of the footer."),
      P("GARY_WEBMASTER", "01/20/98 09:31 AM", "its HIDDEN dale. its gray on gray. nobody is going to click a triangle"),
      P("DALE (HQ)", "01/20/98 09:33 AM", "Gary."),
      P("TYLER_H", "01/20/98 04:02 PM", "i clicked the triangle")
    ] },
    { id: "s3", board: "briefing", title: "Millennium convergence: preparedness memo", posts: [
      P("THE COUNCIL", "02/02/98 08:00 AM", "The threat level is HIGH and will remain so through 01/01/2000. Y2K is not a computer problem. All field teams will stock two years of salt, candles and canned goods. Civilians will be encouraged to do the same. Marketing is calling it \"Y2K Ready.\""),
      P("BOB_H", "02/02/98 08:45 AM", "Acknowledged. Linda has already filled the pantry. Twice.")
    ] },
    { id: "s4", board: "occult", title: "Dayton cul-de-sac: after action report", posts: [
      P("BOB_H", "03/06/98 07:12 PM", "Four houses, one entity, very fond of dining chairs. Three Sentinel 3000 units deployed in a triangle around the cul-de-sac. Resolved by 2 AM. Neighbors think it was a gas leak. Good work everyone."),
      P("LINDA_H", "03/06/98 07:40 PM", "For the record: the chairs were stacked in the shape of a door. That is why I told everyone not to walk under them."),
      P("BRITTANY_H", "03/06/98 08:03 PM", "it wasn't mad. it was just lonely. i told it about the guestbook")
    ] },
    { id: "s5", board: "occult", title: "the VHS thing - has anyone actually watched one", posts: [
      P("TYLER_H", "03/13/98 11:52 PM", "asking for a friend"),
      P("LINDA_H", "03/13/98 11:53 PM", "Tyler, come downstairs right now."),
      P("TYLER_H", "03/13/98 11:53 PM", "my friend says the phone is ringing")
    ] },
    { id: "s6", board: "magic", title: "Cold iron shortage after the Branson well job", posts: [
      P("AGENT LOWELL", "02/19/98 10:20 AM", "We used every scrap of cold iron in the Missouri depot to cap that wishing well. If anyone in Magic Division has spare horseshoes, please send them to Branson. Do not wish for them."),
      P("QM_DOROTHY", "02/19/98 01:05 PM", "Depot 7 has 64 Iron Horseshoe Door Knockers on hand. Requisition them properly and they ship Monday.")
    ] },
    { id: "s7", board: "magic", title: "Sedona ley tap: do we tell the shop owner?", posts: [
      P("AGENT MORROW", "02/25/98 03:33 PM", "He thinks the crystals are working. They are not. The parking lot is. Do I explain, or do we just buy the building?"),
      P("THE COUNCIL", "02/25/98 05:00 PM", "Buy the building.")
    ] },
    { id: "s8", board: "science", title: "Tamagotchi containment protocol (UPDATED)", posts: [
      P("AGENT PRUETT", "02/28/98 09:00 AM", "Updated steps:\n1. Do NOT press any buttons.\n2. Slide the unit into a containment sleeve (Hold E).\n3. If it beeps, it is hungry. It is always hungry.\n4. Never feed after midnight. We checked. It is not a joke from the movie. The movie got it from us."),
      P("TYLER_H", "02/28/98 03:15 PM", "what if it dies"),
      P("AGENT PRUETT", "02/28/98 03:40 PM", "They do not die, Tyler. They wait.")
    ] },
    { id: "s9", board: "science", title: "Something is answering the dial-up tone", posts: [
      P("GARY_WEBMASTER", "02/15/98 01:17 AM", "ok so when i dial into the office there's a voice between the screech and the static. it says \"you've got mail\" but we are not on AOL"),
      P("DALE (HQ)", "02/15/98 08:02 AM", "Gary, unplug the kitchen phone during all connections. That goes for everyone.")
    ] },
    { id: "s10", board: "quartermaster", title: "WHO signed out every Night-Watch Nightlight", posts: [
      P("QM_DOROTHY", "03/10/98 08:15 AM", "Hold C shows ZERO Night-Watch Nightlights. The requisition log shows zero sign-outs. Someone bring them back. The closets of America are counting on you."),
      P("BRITTANY_H", "03/10/98 09:30 AM", "the lady in the hallway says she borrowed them. she says it's too dark where she is"),
      P("QM_DOROTHY", "03/10/98 09:31 AM", "Please ask her to fill out Form Q-12.")
    ] },
    { id: "s11", board: "quartermaster", title: "Reminder: Hold F is NOT a lending library", posts: [
      P("QM_DOROTHY", "03/02/98 10:00 AM", "Items in Hold F (Quarantine) cannot be signed out. That includes the monkey's paw. Especially the monkey's paw. Whoever keeps putting in requests for it: it only has two fingers left. Think about what that means.")
    ] },
    { id: "s12", board: "breakroom", title: "Council Bluffs potluck - sign up here", posts: [
      P("LINDA_H", "03/08/98 06:00 PM", "Potluck at the Monitoring Center, Saturday the 21st. I'm bringing seven-layer dip. Bob is bringing his chili. No garlic dishes this year, we have guests from the Pennsylvania office."),
      P("BOB_H", "03/08/98 06:22 PM", "The chili has garlic in it. It is protective chili."),
      P("TYLER_H", "03/08/98 07:10 PM", "can i bring my N64")
    ] },
    { id: "s13", board: "breakroom", title: "Brittany says the lady in the hallway says hi", posts: [
      P("BRITTANY_H", "03/11/98 04:44 PM", "she also says the monitoring center has a third floor. it does not have a third floor"),
      P("DALE (HQ)", "03/11/98 04:50 PM", "Nobody go looking for the third floor.")
    ] }
  ];

  var KEY = "aopa-forum";
  function store() {
    var s = AOPA.loadJSON(KEY, {});
    s.threads = s.threads || [];
    s.replies = s.replies || {};
    return s;
  }

  function stamp() {
    var d = new Date();
    var h = d.getHours(), m = ("0" + d.getMinutes()).slice(-2);
    return ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/98 " +
      ((h % 12) || 12) + ":" + m + (h < 12 ? " AM" : " PM");
  }

  // all threads, with this terminal's own threads and replies folded in
  function threads() {
    var s = store();
    return s.threads.map(function (t) { t.mine = true; return t; }).concat(SEED).map(function (t) {
      var extra = (s.replies[t.id] || []).map(function (p) { p.mine = true; return p; });
      return { id: t.id, board: t.board, title: t.title, pinned: t.pinned, mine: t.mine,
        posts: t.posts.map(function (p) { if (t.mine) p.mine = true; return p; }).concat(extra) };
    });
  }

  // "03/13/98 11:52 PM" -> sortable "03131552"-style key (it is always 1998 in here)
  function key(d) {
    var m = /^(\d\d)\/(\d\d)\/\d\d (\d+):(\d\d) (AM|PM)$/.exec(d || "");
    if (!m) return "";
    var h = (+m[3] % 12) + (m[5] === "PM" ? 12 : 0);
    return m[1] + m[2] + ("0" + h).slice(-2) + m[4];
  }
  function lastPost(t) { return t.posts[t.posts.length - 1]; }
  function byActivity(x, y) {
    var a = key(lastPost(x).d), b = key(lastPost(y).d);
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function boardById(id) {
    for (var i = 0; i < BOARDS.length; i++) if (BOARDS[i].id === id) return BOARDS[i];
    return null;
  }

  function crumbs(parts) {
    var c = el("div", { className: "crumbs" });
    parts.forEach(function (p, i) {
      if (i) c.appendChild(document.createTextNode(" > "));
      c.appendChild(p.href ? el("a", { href: p.href }, p.text) : el("span", null, p.text));
    });
    return c;
  }

  /* ---------- views ---------- */
  function viewBoards() {
    var all = threads();
    var tbl = el("table", { className: "grid-table" }, el("tr", null, [
      el("th", null, "BOARD"), el("th", null, "THREADS"), el("th", null, "POSTS"), el("th", null, "LAST POST")
    ]));
    BOARDS.forEach(function (b) {
      var ts = all.filter(function (t) { return t.board === b.id; }).sort(byActivity);
      var posts = ts.reduce(function (n, t) { return n + t.posts.length; }, 0);
      var last = ts.length ? lastPost(ts[0]) : null;
      tbl.appendChild(el("tr", null, [
        el("td", null, [el("a", { className: "board-name", href: "#b/" + b.id }, b.name), el("div", { className: "board-desc" }, b.desc)]),
        el("td", { className: "num" }, String(ts.length)),
        el("td", { className: "num" }, String(posts)),
        el("td", { className: "small" }, last ? last.d + " by " + last.a : "--")
      ]));
    });
    return [crumbs([{ text: "BBS" }]), el("div", { className: "cargo-wrap" }, tbl)];
  }

  function viewBoard(bid) {
    var b = boardById(bid);
    if (!b) return viewBoards();
    var ts = threads().filter(function (t) { return t.board === bid; })
      .sort(function (x, y) { return (y.pinned ? 1 : 0) - (x.pinned ? 1 : 0) || byActivity(x, y); });
    var tbl = el("table", { className: "grid-table" }, el("tr", null, [
      el("th", null, "THREAD"), el("th", null, "STARTED BY"), el("th", null, "REPLIES"), el("th", null, "LAST POST")
    ]));
    ts.forEach(function (t) {
      var last = lastPost(t);
      tbl.appendChild(el("tr", null, [
        el("td", null, [t.pinned ? el("span", { className: "pin" }, "PINNED") : null, el("a", { href: "#t/" + t.id }, t.title)]),
        el("td", { className: "small" }, t.posts[0].a),
        el("td", { className: "num" }, String(t.posts.length - 1)),
        el("td", { className: "small" }, last.d + " by " + last.a)
      ]));
    });
    if (!ts.length) tbl.appendChild(el("tr", null, el("td", { colSpan: 4, className: "dim" }, "> NO THREADS YET.")));

    var f = el("form", { className: "reply-box", id: "new-thread" }, [
      el("h3", null, "// START A NEW THREAD IN " + b.name),
      el("p", null, el("label", null, ["SUBJECT", el("br"), el("input", { type: "text", name: "title", maxLength: 80, required: true, size: 50 })])),
      el("p", null, el("label", null, ["MESSAGE", el("br"), el("textarea", { name: "text", rows: 6, maxLength: 3000, required: true })])),
      el("p", null, el("input", { type: "submit", value: "POST THREAD" }))
    ]);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = store();
      var id = "u" + Date.now().toString(36);
      s.threads.unshift({ id: id, board: bid, title: f.elements.title.value.trim().slice(0, 80),
        posts: [P(AOPA.agentName(), stamp(), f.elements.text.value.trim().slice(0, 3000))] });
      AOPA.saveJSON(KEY, s);
      location.hash = "t/" + id;
    });

    return [
      crumbs([{ text: "BBS", href: "#" }, { text: b.name }]),
      el("p", { className: "dim small" }, b.desc),
      el("div", { className: "cargo-wrap" }, tbl),
      f
    ];
  }

  function viewThread(tid) {
    var t = null;
    threads().forEach(function (x) { if (x.id === tid) t = x; });
    if (!t) return viewBoards();
    var b = boardById(t.board);
    var out = [crumbs([{ text: "BBS", href: "#" }, { text: b.name, href: "#b/" + b.id }, { text: t.title }]),
      el("h2", null, t.title)];

    t.posts.forEach(function (p, i) {
      out.push(el("div", { className: "post" + (p.mine ? " mine" : "") }, [
        el("div", { className: "who" }, [el("b", null, p.a), el("span", null, RANKS[p.a] || "Field Agent")]),
        el("div", { className: "what" }, [
          el("div", { className: "when" }, "#" + (i + 1) + "  POSTED " + p.d),
          el("div", { className: "text" }, p.t)
        ])
      ]));
    });

    var f = el("form", { className: "reply-box" }, [
      el("h3", null, "// POST A REPLY"),
      el("p", null, el("textarea", { name: "text", rows: 5, maxLength: 3000, required: true, "aria-label": "Reply" })),
      el("p", null, [el("input", { type: "submit", value: "POST REPLY" }), " ",
        el("span", { className: "dim small" }, "Posting as " + AOPA.agentName())])
    ]);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = store();
      var own = null;
      s.threads.forEach(function (x) { if (x.id === tid) own = x; });
      var post = P(AOPA.agentName(), stamp(), f.elements.text.value.trim().slice(0, 3000));
      if (own) own.posts.push(post);
      else (s.replies[tid] = s.replies[tid] || []).push(post);
      AOPA.saveJSON(KEY, s);
      render();
      window.scrollTo(0, document.body.scrollHeight);
    });
    out.push(f);
    return out;
  }

  function render() {
    var h = location.hash.replace(/^#/, "");
    var view = h.indexOf("b/") === 0 ? viewBoard(h.slice(2))
      : h.indexOf("t/") === 0 ? viewThread(h.slice(2))
      : viewBoards();
    root.innerHTML = "";
    view.forEach(function (n) { root.appendChild(n); });
  }

  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });

  /* ---------- codename ---------- */
  var af = document.getElementById("agent-form");
  var aok = document.getElementById("agent-ok");
  af.elements.agent.value = AOPA.agentName();
  af.addEventListener("submit", function (e) {
    e.preventDefault();
    af.elements.agent.value = AOPA.setAgentName(af.elements.agent.value);
    aok.textContent = "> CODENAME UPDATED.";
    render();
  });

  render();
})();
