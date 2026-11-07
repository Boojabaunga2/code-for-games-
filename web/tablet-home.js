"use strict";
const games = [
  ["Home Run Derby", "arcadium_home_run_v7_matching_team_colors.html"],
  ["Gridiron Riot", "gridiron_riot_v16_spaced_defense.html"],
  ["Neon Cycle Riot", "neon_cycle_riot_true_tron.html"],
  ["Tankageddon", "tankageddon_ground_combat_v2.html"],
  ["Galactic Riot", "galactic_riot_balanced_v3.html"],
  ["Crash Landing", "crash_landing_challenge_v2.html"],
  ["Rockageddon", "rockageddon_arcadium_collision_fixed.html"],
  ["Brick Riot", "brick_riot_2026_visual_test.html"],
  ["Ghost Grab", "ghost_grab.html"],
];
const colors = ["red", "blue", "green", "yellow", "pink", "white"];
const hex = ["#ff5366", "#5b9cff", "#60dc98", "#f9d85c", "#f797ce", "#eeeeff"];
let current = { active: 0, seats: [] };
let addressKey = "",
  catalogKey = "";
function refresh() {
  try {
    current = JSON.parse(ArcadiumTablet.status());
  } catch (e) {
    document.getElementById("network").textContent =
      "Open the Arcadium Home Tablet Android app to host controllers.";
    return;
  }
  renderLibrary();
  if (window.HomeVibeShowtime) window.HomeVibeShowtime.sync(current);
  document.getElementById("phoneCount").textContent =
    (current.seats || []).filter((s) => s.connected).length + " / 6";
  document.getElementById("pin").textContent = current.pin || "—";
  const urls = current.urls || [];
  const key = urls.join(",");
  if (key !== addressKey) {
    addressKey = key;
    const box = document.getElementById("addresses");
    box.replaceChildren();
    for (const url of urls) {
      const item = document.createElement("code");
      item.textContent = url;
      box.append(item);
    }
    const qr = document.getElementById("joinQr");
    if (urls.length && ArcadiumTablet.qr) {
      qr.src = ArcadiumTablet.qr(urls[0] + "#pin=" + current.pin);
      qr.style.display = "block";
    }
  }
  const network = document.getElementById("network");
  network.textContent =
    current.error ||
    current.storageWarning ||
    ((current.urls || []).length
      ? "Use the address for your Wi-Fi network. The router does not need an internet connection."
      : "No local Wi-Fi address found. Connect the tablet to Wi-Fi, or enable its hotspot and connect your phones.");
  network.classList.toggle("error", !!current.error);
  document.querySelectorAll(".seat").forEach((b, i) => {
    const s = current.seats[i];
    b.classList.toggle("active", i === current.active);
    b.setAttribute("aria-pressed", String(i === current.active));
    b.querySelector("small").textContent =
      s && s.connected ? "Connected" : "Not connected";
  });
  const g = current.game || { phase: "LOBBY" },
    board = document.getElementById("signalBoard");
  board.replaceChildren();
  const title = document.createElement("h3");
  title.textContent =
    g.phase === "RUNNING"
      ? "Round " + g.round + " / 5 · " + Math.ceil(g.remainingMs / 1000) + "s"
      : g.phase === "COMPLETED"
        ? "Finished — play again for free"
        : "Connect phones, then start free play";
  board.append(title);
  if (g.scores) {
    const top = Math.max(...g.scores.filter((_, i) => g.players[i]));
    for (let i = 0; i < 6; i++)
      if (g.players[i]) {
        const row = document.createElement("p");
        row.style.color = hex[i];
        row.textContent =
          colors[i].toUpperCase() +
          " · " +
          g.scores[i] +
          " points" +
          (g.phase === "COMPLETED" && g.scores[i] === top ? " · WINNER" : "");
        board.append(row);
      }
  }
  document.getElementById("startSignal").disabled = g.phase === "RUNNING";
  const h = document.getElementById("history");
  h.replaceChildren();
  for (const session of current.history || []) {
    const p = document.createElement("p");
    p.textContent =
      "Signal Sprint · FREE · " +
      session.phase +
      (session.scores ? " · Scores " + session.scores.join(" / ") : "");
    h.append(p);
  }
  document.getElementById("device").textContent = current.apiLevel
    ? "Device: " +
      current.model +
      " · Android " +
      current.androidRelease +
      " · API " +
      current.apiLevel +
      " · WebView " +
      current.webView
    : "";
  document.getElementById("activePlayer").textContent =
    "Active player: " + colors[current.active];
  document.getElementById("clock").textContent = new Date().toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" },
  );
}
for (let i = 0; i < 6; i++) {
  const b = document.createElement("button");
  b.className = "seat";
  b.style.setProperty("--color", hex[i]);
  const art = document.createElement("img");
  art.src = "/classic/arcadium-card-" + colors[i] + ".jpg";
  art.alt = "";
  b.append(art, document.createTextNode(colors[i]));
  const connection = document.createElement("small");
  connection.textContent = "Not connected";
  b.append(connection);
  b.onclick = () => {
    ArcadiumTablet.select(i);
    refresh();
  };
  document.getElementById("seats").append(b);
}
function renderLibrary() {
  const state = current.library || { hidden: [], imported: [] },
    key = JSON.stringify(state);
  if (key === catalogKey) return;
  catalogKey = key;
  const hidden = new Set(state.hidden || []),
    catalog = (
      current.catalog ||
      games.map(([title, file], i) => ({
        id: "classic-" + i,
        title,
        entry: "classic/games/" + file,
        cover: "classic/covers/cover" + i + ".jpg",
      }))
    ).concat(state.imported || []);
  const library = document.getElementById("library");
  library.replaceChildren();
  for (const item of catalog) {
    if (hidden.has(item.id)) continue;
    const b = document.createElement("button");
    b.className = "card";
    b.dataset.gameId = item.id;
    const art = document.createElement("img");
    art.src = item.cover || "classic/arcadium-logo.jpg";
    art.alt = "";
    const title = document.createElement("span");
    title.textContent = item.title;
    b.classList.toggle("coming-soon", !!item.comingSoon);
    b.setAttribute("aria-disabled", String(!!item.comingSoon));
    const note = document.createElement("small");
    note.textContent = item.comingSoon
      ? "COMING SOON"
      : item.requiresBackend
        ? "HOST SERVICE REQUIRED"
        : item.compatibilityWarning
          ? "SOURCE ASSETS MISSING"
          : "FREE PLAY →";
    b.append(art, title, note);
    b.onclick = () => {
      if (item.comingSoon) {
        document.getElementById("libraryMessage").textContent =
          item.title + " · Coming soon";
        return;
      }
      if (item.requiresBackend) {
        document.getElementById("libraryMessage").textContent =
          item.requiresBackend;
        return;
      }
      if (
        ArcadiumTablet.activate &&
        current.catalog &&
        !ArcadiumTablet.activate(item.id)
      ) {
        document.getElementById("startMessage").textContent =
          "This game could not be activated.";
        return;
      }
      if (ArcadiumTablet.classic && !ArcadiumTablet.classic()) {
        document.getElementById("startMessage").textContent =
          "Finish Signal Sprint before starting another game.";
        return;
      }
      document.getElementById("title").textContent = item.title;
      document.getElementById("game").src = item.entry.replace(
        "{origin}",
        encodeURIComponent(location.origin),
      );
      document.getElementById("home").style.display = "none";
      document.getElementById("play").style.display = "flex";
    };
    library.append(b);
  }
}
document.getElementById("adminGames").onclick = () => ArcadiumTablet.admin();

window.tabletHome = () => {
  document.getElementById("splash").hidden = true;
  document.getElementById("connections").hidden = true;
  document.getElementById("home").hidden = false;
  document.getElementById("joinOverlay").hidden = true;
  if (ArcadiumTablet.leaveGame) ArcadiumTablet.leaveGame();
  document.getElementById("game").src = "about:blank";
  document.getElementById("play").style.display = "none";
  document.getElementById("home").style.display = "block";
  refresh();
};
document.getElementById("back").onclick = window.tabletHome;
document.getElementById("next").onclick = () => {
  const seats = current.seats || [];
  let next = current.active;
  for (let i = 1; i <= 6; i++) {
    const n = (current.active + i) % 6;
    if (seats[n] && seats[n].connected) {
      next = n;
      break;
    }
  }
  ArcadiumTablet.select(next);
  refresh();
};
refresh();
setInterval(refresh, 1000);

document.getElementById("startSignal").onclick = () => {
  document.getElementById("startMessage").textContent =
    ArcadiumTablet.startGame()
      ? "Free game started. Follow the private signals on your phones."
      : "Connect at least one phone first, or finish the active game.";
  refresh();
};
document.getElementById("resetSeats").onclick = () => {
  if (confirm("Disconnect all phones? Each phone will need to join again.")) {
    document.getElementById("startMessage").textContent =
      ArcadiumTablet.resetPlayers()
        ? "Phone seats cleared."
        : "Finish the active game before clearing seats.";
    refresh();
  }
};
document.getElementById("official").onclick = () =>
  (document.getElementById("featureMessage").textContent =
    "Official competitions are unavailable until license, player, payment and seven-card pack verification are connected. Free play stays unlimited.");
document.getElementById("stats").onclick = () =>
  (document.getElementById("featureMessage").textContent =
    "Stats upload is unavailable until verified credentials and payment are connected. Only a completed session would qualify; no charge is made here.");

window.addEventListener("message", (e) => {
  if (e.source !== document.getElementById("game").contentWindow) return;
  const d = e.data || {};
  const value = String(d.type || d.action || d.arcadium || "");
  if (
    value === "ARCADIUM_GAME_EXIT" ||
    /^(?:ARCADIUM[_:-])?(?:EXIT(?:[_-]GAME)?|RETURN[_-]HOME|HOME|CLOSE[_-]GAME|QUIT)$/i.test(
      value,
    )
  )
    window.tabletHome();
});

document.getElementById("joinInGame").onclick = () => {
  document.getElementById("joinOverlayUrl").textContent =
    (current.urls || [])[0] || "Connect the tablet to Wi-Fi";
  document.getElementById("joinOverlayPin").textContent = current.pin || "";
  document.getElementById("joinOverlayQr").src =
    document.getElementById("joinQr").src;
  document.getElementById("joinOverlay").hidden = false;
};
document.getElementById("closeJoinOverlay").onclick = () =>
  (document.getElementById("joinOverlay").hidden = true);

let connectingFromGame = false;
function openConnections(inGame) {
  connectingFromGame = inGame;
  document.getElementById("connections").hidden = false;
  document.getElementById("backToGames").textContent = inGame
    ? "← Back to game"
    : "← Games";
  if (!inGame) document.getElementById("home").hidden = true;
  document.getElementById("backToGames").focus();
}
document.getElementById("connectPhones").onclick = () => openConnections(false);
document.getElementById("joinInGame").onclick = () => openConnections(true);
document.getElementById("backToGames").onclick = () => {
  document.getElementById("connections").hidden = true;
  if (!connectingFromGame) {
    document.getElementById("home").hidden = false;
    document.getElementById("connectPhones").focus();
  }
};
const splash = document.getElementById("splash"),
  openingFrame = document.getElementById("openingFrame");
try {
  if (sessionStorage.getItem("arcadium-entered-v042")) splash.hidden = true;
} catch (e) {}
function enterArcadium() {
  splash.hidden = true;
  try {
    sessionStorage.setItem("arcadium-entered-v042", "1");
  } catch (e) {}
  document.getElementById("connectPhones").focus();
}
let registrationQrKey = "",
  registrationQrImage = "",
  recoveryQrKey = "",
  recoveryQrImage = "";
function updateOpening() {
  if (!openingFrame.contentWindow) return;
  const r = Object.assign({}, current.registration || {});
  if (r.qrPayload && r.qrPayload !== registrationQrKey && ArcadiumTablet.qr) {
    registrationQrKey = r.qrPayload;
    registrationQrImage = ArcadiumTablet.qr(r.qrPayload);
  }
  if (r.recoveryUrl && r.recoveryUrl !== recoveryQrKey && ArcadiumTablet.qr) {
    recoveryQrKey = r.recoveryUrl;
    recoveryQrImage = ArcadiumTablet.qr(r.recoveryUrl);
  }
  r.qr = registrationQrImage;
  r.recoveryQr = recoveryQrImage;
  openingFrame.contentWindow.postMessage(
    {
      type: "arcadium-opening-state",
      registration: r,
      connected: (current.seats || []).filter((s) => s.connected).length,
    },
    location.origin,
  );
  const label = document.getElementById("registrationStatus");
  if (label)
    label.textContent = r.verified
      ? "DEVICE REGISTERED"
      : "DEVICE · " +
        ({ PENDING: "PENDING", OFFLINE: "OFFLINE", FAILED: "NEEDS ATTENTION" }[
          r.state
        ] || "NOT REGISTERED");
}
window.addEventListener("message", (e) => {
  if (e.source !== openingFrame.contentWindow || e.origin !== location.origin)
    return;
  if (e.data?.type === "arcadium-enter") enterArcadium();
  if (e.data?.type === "arcadium-connect") {
    enterArcadium();
    openConnections(false);
  }
  if (e.data?.type === "arcadium-opening-ready") updateOpening();
  if (
    e.data?.type === "arcadium-check-registration" &&
    ArcadiumTablet.checkRegistration
  )
    ArcadiumTablet.checkRegistration();
});
setInterval(updateOpening, 1000);

document.getElementById("navPlay").onclick = () =>
  document.getElementById("library").scrollIntoView({ behavior: "smooth" });
document.getElementById("navConnect").onclick = () => openConnections(false);
document.getElementById("navSettings").onclick = () => {
  document.querySelector(".extras").open = true;
  document.querySelector(".extras").scrollIntoView({ behavior: "smooth" });
};
document.getElementById("registrationStatus").onclick = () => {
  splash.hidden = false;
  openingFrame.contentWindow.postMessage(
    { type: "arcadium-show-registration" },
    location.origin,
  );
  updateOpening();
};
const features = {
  navCards: [
    "Cardboard Vibes",
    "Your permanent NFC collectibles belong to you. Phone scanning, account ownership and collectible inventory are not connected yet. Free play needs no cards.",
  ],
  navWallet: [
    "ViBUCKS",
    "Verified rewards balance is unavailable until your Arcadium account is connected. Free play and stats-only uploads award no ViBUCKS.",
  ],
  navCompetition: [
    "Competition Access",
    "Official competitions are not available yet. Each $7.99 competition requires a verified Vibe License, six registered players and one unused seven-card pack: six participation cards plus one winner’s prize card. Free play is unlimited. No payment is taken.",
  ],
};
for (const [id, [title, message]] of Object.entries(features))
  document.getElementById(id).onclick = () => {
    document.getElementById("featureTitle").textContent = title;
    document.getElementById("featureBody").textContent = message;
    document.getElementById("featurePanel").hidden = false;
    document.getElementById("closeFeature").focus();
  };
document.getElementById("closeFeature").onclick = () =>
  (document.getElementById("featurePanel").hidden = true);

const releaseStyle = document.createElement("style");
releaseStyle.textContent =
  ".card.coming-soon img{filter:grayscale(1);opacity:.5}.card.coming-soon small{color:#c2c8d8}.card.coming-soon{border-color:#465064;cursor:default}";
document.head.append(releaseStyle);
