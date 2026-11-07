/* Home Vibe presentation only. Native authority, game engines and phone transport stay in their existing modules. */
(function () {
  "use strict";
  let selected = "",
    filter = "All",
    search = "",
    items = [],
    signature = "";
  const el = (id) => document.getElementById(id),
    safe = (s) => String(s ?? "");
  function title(g) {
    return safe(g.title)
      .replace(/^ARCADIUM\s*[:—-]\s*/i, "")
      .replace(
        /\s*[—-]\s*(?:PLAYABLE ARCADIUM BUILD|Prototype|Arcadium|BIG SCREEN)$/i,
        "",
      )
      .replace(/^ARCADIUM CHIMP AUCTION.*/i, "Chimp Auction");
  }
  function availability(g) {
    return g.comingSoon
      ? "COMING SOON"
      : g.requiresBackend
        ? "Not ready on Home Vibe"
        : g.compatibilityWarning
          ? "Needs game assets"
          : "UNLIMITED FREE PLAY";
  }
  function visible() {
    return items.filter(
      (g) =>
        (filter === "All" || safe(g.category || "Arcade") === filter) &&
        title(g).toLowerCase().includes(search),
    );
  }
  function show(g) {
    if (!g) return;
    selected = g.id;
    const n = items.indexOf(g),
      left = items[(n - 1 + items.length) % items.length],
      right = items[(n + 1) % items.length];
    for (const [id, item] of [
      ["featureArt", g],
      ["featureLeftArt", left],
      ["featureRightArt", right],
    ]) {
      const image = el(id);
      if (image && item) {
        if (image.getAttribute("src") !== item.cover)
          image.src = item.cover || "classic/arcadium-logo.jpg";
        image.alt = title(item) + " game cover";
        image.style.filter = item.comingSoon ? "grayscale(1)" : "";
        image.style.opacity = item.comingSoon ? ".5" : "1";
      }
    }
    el("spotlightTitle").textContent = title(g);
    el("featureGenre").textContent = safe(g.category || "Arcade").toUpperCase();
    el("featurePosition").textContent =
      String(n + 1).padStart(2, "0") + " / " + items.length;
    el("featureStatus").textContent = availability(g);
    el("featureStatus").classList.toggle(
      "unavailable",
      !!(g.comingSoon || g.requiresBackend),
    );
    el("featurePlay").disabled = !!(g.comingSoon || g.requiresBackend);
    el("featurePlay").textContent = g.comingSoon
      ? "COMING SOON"
      : g.requiresBackend
        ? "NOT AVAILABLE YET"
        : "▶  PLAY GAME";
    el("featureFootnote").textContent = g.comingSoon
      ? "The next games are on their way. Watch for new releases."
      : g.requiresBackend
        ? "This game still needs its original host service. Other games remain free to play."
        : g.compatibilityWarning
          ? "Some original game assets are missing. See the game notice before playing."
          : "The tablet is your arena. Your phone is your controller.";
    document
      .querySelectorAll(".card")
      .forEach((b) =>
        b.classList.toggle("featured", b.dataset.gameId === selected),
      );
  }
  function apply() {
    let count = 0;
    const found = new Set(visible().map((g) => g.id));
    for (const b of document.querySelectorAll("#library .card")) {
      b.hidden = !found.has(b.dataset.gameId);
      if (!b.hidden) count++;
    }
    el("libraryCount").textContent = count + " / " + items.length;
    el("emptyLibrary").hidden = count !== 0;
  }
  function sync(state) {
    const lib = state.library || { hidden: [], imported: [] },
      hidden = new Set(lib.hidden || []);
    let list = state.catalog;
    if (!list && typeof games !== "undefined")
      list = games.map(([name, file], i) => ({
        id: "classic-" + i,
        title: name,
        entry: "classic/games/" + file,
        cover: "classic/covers/cover" + i + ".jpg",
        category: "Classics",
      }));
    list = (list || [])
      .concat(lib.imported || [])
      .filter((g) => !hidden.has(g.id));
    const key = JSON.stringify(
      list.map((g) => [
        g.id,
        g.title,
        g.cover,
        g.category,
        g.comingSoon,
        g.requiresBackend,
        g.compatibilityWarning,
      ]),
    );
    if (key !== signature) {
      signature = key;
      items = list;
      const categories = [
        "All",
        ...new Set(items.map((g) => safe(g.category || "Arcade"))),
      ];
      if (!categories.includes(filter)) filter = "All";
      el("categoryTabs").replaceChildren();
      for (const category of categories) {
        const b = document.createElement("button");
        b.textContent =
          category === "All" ? "ALL GAMES" : category.toUpperCase();
        b.dataset.category = category;
        b.classList.toggle("selected", category === filter);
        b.setAttribute("aria-pressed", String(category === filter));
        b.onclick = () => {
          filter = category;
          for (const x of el("categoryTabs").children) {
            const yes = x.dataset.category === category;
            x.classList.toggle("selected", yes);
            x.setAttribute("aria-pressed", String(yes));
          }
          apply();
        };
        el("categoryTabs").append(b);
      }
      for (const b of document.querySelectorAll("#library .card")) {
        const g = items.find((g) => g.id === b.dataset.gameId);
        if (!g) continue;
        const img = b.querySelector("img");
        img.loading = "lazy";
        img.decoding = "async";
        b.querySelector("span").textContent = title(g);
        b.querySelector("small").textContent = g.comingSoon
          ? "COMING SOON"
          : g.requiresBackend
            ? "NOT AVAILABLE YET"
            : g.compatibilityWarning
              ? "NEEDS GAME ASSETS"
              : "FREE PLAY";
        b.classList.toggle(
          "unavailable",
          !!(g.comingSoon || g.requiresBackend),
        );
        b.classList.toggle("needs-assets", !!g.compatibilityWarning);
        b.setAttribute("aria-label", title(g) + " · " + availability(g));
        b.addEventListener("focus", () => show(g));
      }
      if (items.length)
        show(
          items.find((g) => g.id === selected) ||
            items.find((g) => !g.comingSoon && !g.requiresBackend) ||
            items[0],
        );
      else {
        selected = "";
        el("spotlightTitle").textContent = "Your game room is empty";
        el("featurePlay").disabled = true;
        el("featureStatus").textContent = "OPEN MANAGE GAMES TO RESTORE TITLES";
        el("featurePosition").textContent = "00 / 00";
        el("featureGenre").textContent = "YOUR LIBRARY";
        el("featureFootnote").textContent =
          "Hidden games can be restored in console settings.";
        for (const id of ["featureArt", "featureLeftArt", "featureRightArt"])
          el(id).removeAttribute("src");
      }
      apply();
    }
    const connected = (state.seats || []).filter((s) => s.connected).length;
    el("heroPhones").textContent = connected + " / 6";
    el("heroPhoneLabel").textContent = connected
      ? "PHONES CONNECTED"
      : "BRING YOUR PEOPLE";
    el("homeClock").textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  window.HomeVibeShowtime = { sync, preview: show };
  el("featurePrevious").onclick = () =>
    show(
      items[
        (items.findIndex((g) => g.id === selected) - 1 + items.length) %
          items.length
      ],
    );
  el("featureNext").onclick = () =>
    show(items[(items.findIndex((g) => g.id === selected) + 1) % items.length]);
  el("featurePlay").onclick = () => {
    const b = [...el("library").children].find(
      (b) => b.dataset.gameId === selected,
    );
    if (b) b.click();
  };
  el("heroConnect").onclick = () => el("connectPhones").click();
  el("gameSearch").addEventListener("input", (e) => {
    search = e.target.value.toLowerCase().trim();
    apply();
  });
  if (typeof current !== "undefined") sync(current);
})();
