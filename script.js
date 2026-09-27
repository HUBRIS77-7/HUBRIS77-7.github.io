/* ================================================================
   THE AMERICAN FAMILY, INC. - JavaScript 1.2 Goodies
   Cut & pasted from the finest free script archives on the Net!
   ================================================================ */

function safeGet(store, key) {
  try { return window[store].getItem(key); } catch (e) { return null; }
}
function safeSet(store, key, value) {
  try { window[store].setItem(key, value); } catch (e) { /* no cookies? no problem */ }
}

/* ---------- Welcome pop-up (only once per visit, we're not animals) ---------- */
(function welcome() {
  if (!document.body.hasAttribute("data-welcome")) return;
  if (safeGet("sessionStorage", "taf-welcomed")) return;
  safeSet("sessionStorage", "taf-welcomed", "1");
  setTimeout(function () {
    alert("Welcome to The American Family on the Information Superhighway!\n\n" +
          "Please sign our Guestbook before you leave.\n\n" +
          "God Bless America!");
  }, 400);
})();

/* ---------- Hit counter ---------- */
(function counter() {
  var el = document.getElementById("hitcounter");
  if (!el) return;
  var base = 48213;
  var mine = parseInt(safeGet("localStorage", "taf-hits") || "0", 10) + 1;
  safeSet("localStorage", "taf-hits", String(mine));
  var n = String(base + mine * 7);
  while (n.length < 7) n = "0" + n;
  el.innerHTML = "";
  for (var i = 0; i < n.length; i++) {
    var d = document.createElement("span");
    d.className = "digit";
    d.textContent = n.charAt(i);
    el.appendChild(d);
  }
})();

/* ---------- Scrolling title bar ---------- */
(function titleScroller() {
  var msg = document.title + "  ***  ";
  var i = 0;
  setInterval(function () {
    document.title = msg.substring(i) + msg.substring(0, i);
    i = (i + 1) % msg.length;
  }, 250);
})();

/* ---------- Sparkle cursor trail ---------- */
(function sparkles() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var glyphs = ["★", "✦", "✧", "☆"];
  var colors = ["#cc0000", "#000066", "#ffcc00", "#0066ff"];
  var last = 0;
  document.addEventListener("mousemove", function (e) {
    var now = Date.now();
    if (now - last < 45) return;
    last = now;
    var s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    s.style.left = (e.clientX + 6) + "px";
    s.style.top = (e.clientY + 6) + "px";
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 900);
  });
})();

/* ---------- "MIDI" player: Yankee Doodle on a square wave ---------- */
(function midi() {
  var play = document.getElementById("midi-play");
  var stop = document.getElementById("midi-stop");
  var lcd = document.getElementById("midi-lcd");
  if (!play) return;

  var N = { G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392 };
  // [note, beats]
  var song = [
    ["C4",1],["C4",1],["D4",1],["E4",1],["C4",1],["E4",1],["D4",2],
    ["C4",1],["C4",1],["D4",1],["E4",1],["C4",2],["B3",2],
    ["C4",1],["C4",1],["D4",1],["E4",1],["F4",1],["E4",1],["D4",1],["C4",1],
    ["B3",1],["G3",1],["A3",1],["B3",1],["C4",2],["C4",2],
    ["A3",1.5],["B3",.5],["A3",1],["G3",1],["A3",1],["B3",1],["C4",2],
    ["G3",1.5],["A3",.5],["G3",1],["F4",1],["E4",2],["G3",2],
    ["A3",1.5],["B3",.5],["A3",1],["G3",1],["A3",1],["B3",1],["C4",1],["A3",1],
    ["G3",1],["C4",1],["B3",1],["D4",1],["C4",2],["C4",2]
  ];
  var ctx = null, timer = null, oscs = [];

  function stopAll() {
    oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
    oscs = [];
    clearTimeout(timer);
    lcd.textContent = "STOPPED";
  }

  play.addEventListener("click", function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { lcd.textContent = "NO SOUND CARD"; return; }
    if (!ctx) ctx = new AC();
    stopAll();
    var beat = 0.26, t = ctx.currentTime + 0.05, total = 0;
    song.forEach(function (n) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = "square";
      o.frequency.value = N[n[0]] * 2;
      g.gain.setValueAtTime(0.06, t);
      g.gain.setValueAtTime(0, t + n[1] * beat * 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + n[1] * beat);
      oscs.push(o);
      t += n[1] * beat;
      total += n[1] * beat;
    });
    lcd.textContent = "♫ yankee_dood.mid";
    timer = setTimeout(function () { lcd.textContent = "READY"; oscs = []; }, total * 1000 + 200);
  });
  stop.addEventListener("click", stopAll);
})();

/* ---------- Guestbook ---------- */
(function guestbook() {
  var form = document.getElementById("gb-form");
  var list = document.getElementById("gb-list");
  if (!form || !list) return;

  var seed = [
    { name: "Darlene K.", from: "Tulsa, OK", when: "4/2/98", fav: "Casserole Kit", msg: "Love the web page!! My husband Earl and I have used the Casserole Kit every Sunday since 1991. Keep up the good work and God Bless!!!" },
    { name: "Tyler", from: "Des Moines, IA", when: "3/29/98", fav: "Other", msg: "cool site. my mom made me sign this. do you guys have a nintendo 64 section?? you should" },
    { name: "Webmaster Gary", from: "The American Family HQ", when: "3/14/98", fav: "Other", msg: "Welcome to our new Guestbook! Be the first to sign it (well, second). Remember: No flaming please! This is a FAMILY site." },
    { name: "Hank Pruitt", from: "Bakersfield, CA", when: "3/10/98", fav: "Porch Swing", msg: "HOW DO I GET TO THE PART WHERE YOU ORDER.  MY GRANDSON SET UP THE COMPUTER.  IS THIS THING ON" }
  ];

  function load() {
    try { return JSON.parse(safeGet("localStorage", "taf-guestbook") || "[]"); } catch (e) { return []; }
  }

  function render() {
    var all = load().concat(seed);
    list.innerHTML = "";
    all.forEach(function (g) {
      var box = document.createElement("div");
      box.className = "guest";
      var head = document.createElement("div");
      head.className = "ghead";
      var b = document.createElement("b");
      b.textContent = g.name;
      head.appendChild(b);
      head.appendChild(document.createTextNode(" from " + g.from + "  •  signed " + g.when + "  •  Favorite product: " + g.fav));
      var body = document.createElement("div");
      body.className = "gbody";
      body.textContent = g.msg;
      box.appendChild(head);
      box.appendChild(body);
      list.appendChild(box);
    });
    var count = document.getElementById("gb-count");
    if (count) count.textContent = all.length;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new Date();
    var entry = {
      name: form.elements.name.value.trim().slice(0, 60) || "Anonymous Surfer",
      from: form.elements.from.value.trim().slice(0, 60) || "Somewhere, USA",
      when: (d.getMonth() + 1) + "/" + d.getDate() + "/98",
      fav: form.elements.fav.value,
      msg: form.elements.msg.value.trim().slice(0, 1000) || "(left blank)"
    };
    var mine = load();
    mine.unshift(entry);
    safeSet("localStorage", "taf-guestbook", JSON.stringify(mine.slice(0, 50)));
    form.reset();
    render();
    alert("Thank you for signing our Guestbook, " + entry.name + "!\nYour entry has been added.");
  });

  render();
})();

/* ---------- Free catalog request (no actual mail will be sent) ---------- */
(function catalog() {
  var form = document.getElementById("catalog-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Thank you! Your FREE 1998 Spring Catalog is on its way.\n\n" +
          "Please allow 6 to 8 weeks for delivery.");
    form.reset();
  });
})();
