/* Browser-only Home Vibe compatibility bridge. No native application needed. */
(() => {
  "use strict";
  const cfg = window.__HV_WEB;
  if (!cfg) return;
  const root = "/r/" + cfg.room,
    rawFetch = window.fetch.bind(window),
    buttons = [
      "UP",
      "DOWN",
      "LEFT",
      "RIGHT",
      "A",
      "B",
      "X",
      "Y",
      "START",
      "SELECT",
      "L1",
      "R1",
    ];
  let session = {};
  try {
    session = JSON.parse(
      localStorage.getItem("arcadium-web-session:" + cfg.room) || "{}",
    );
  } catch {}
  window.HomeVibeWeb = { gamePath: cfg.gamePath, room: cfg.room };
  let shared;
  try {
    if (parent !== window && parent.__HV_WEB?.room === cfg.room)
      shared = parent.HomeVibeWebHost;
  } catch {}
  const instance = shared
    ? parent.HomeVibeWebInstance
    : crypto.randomUUID().replaceAll("-", "");
  window.HomeVibeWebInstance = instance;
  const isConsole = cfg.role === "host" && cfg.gamePath === "/tablet-home.html";
  let state = cfg.initial || {},
    input = {
      masks: [0, 0, 0, 0, 0, 0],
      connected: [false, false, false, false, false, false],
    },
    selected = 0,
    after = 0,
    queue = Promise.resolve(),
    failed = false,
    stopped = false;
  function notice(message) {
    let box = document.getElementById("webConnectionNotice");
    if (!box) {
      box = document.createElement("div");
      box.id = "webConnectionNotice";
      box.setAttribute("role", "status");
      Object.assign(box.style, {
        position: "fixed",
        bottom: "10px",
        left: "10px",
        right: "10px",
        zIndex: "10000",
        padding: "12px",
        background: "#441a26",
        color: "#fff",
        borderRadius: "10px",
        font: "15px system-ui",
      });
      document.body?.append(box);
    }
    if (box) {
      box.textContent = message;
      box.hidden = !message;
    }
  }
  async function request(path, options = {}) {
    const response = await rawFetch(root + path, {
      ...options,
      cache: "no-store",
      headers: { ...options.headers, "x-hv-host-instance": instance },
      signal: options.signal || AbortSignal.timeout(8000),
    });
    const value = await response.json();
    if (!response.ok)
      throw Object.assign(Error(value.error || "Connection failed"), {
        status: response.status,
      });
    return value;
  }
  function command(path, data = {}) {
    queue = queue
      .catch(() => {})
      .then(() =>
        request("/web/host/" + path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        }),
      )
      .then(() => {
        failed = false;
        notice("");
      })
      .catch((e) => {
        failed = true;
        notice(e.message);
        throw e;
      });
    queue.catch(() => {});
    return queue;
  }
  const frames = [];
  let reconstructed = input.masks.slice();
  function stage(packet) {
    for (const event of packet.events || []) {
      for (const edge of event.edges || []) {
        const bit = buttons.indexOf(edge.button);
        if (bit < 0) continue;
        const n = event.seat;
        reconstructed[n] =
          edge.action === "up"
            ? reconstructed[n] & ~(1 << bit)
            : reconstructed[n] | (1 << bit);
        frames.push(reconstructed.slice());
      }
    }
    frames.push(packet.masks.slice());
    reconstructed = packet.masks.slice();
    input.connected = packet.connected;
    after = packet.latest;
    if (frames.length > 180) {
      frames.length = 0;
      frames.push([0, 0, 0, 0, 0, 0], packet.masks.slice());
    }
  }
  function frame() {
    if (frames.length) input.masks = frames.shift();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  async function pump() {
    if (stopped) return;
    try {
      await queue.catch(() => {});
      const packet = await request("/web/host/inputs?after=" + after);
      stage(packet);
      if (failed) {
        failed = false;
        notice("");
      }
    } catch (e) {
      frames.length = 0;
      reconstructed = [0, 0, 0, 0, 0, 0];
      input = {
        masks: reconstructed.slice(),
        connected: [false, false, false, false, false, false],
      };
      failed = true;
      notice("Game connection interrupted. Controls released; reconnecting…");
    }
    setTimeout(pump, 80);
  }
  async function refresh() {
    if (stopped) return;
    try {
      await queue.catch(() => {});
      const next = await request("/web/host/status");
      const retired =
        state.pc?.id &&
        next.catalog?.find((g) => g.id === state.pc.id)?.comingSoon;
      state = next;
      if (retired && typeof window.tabletHome === "function")
        window.tabletHome();
      state.active = selected;
    } catch {}
    setTimeout(refresh, 1000);
  }
  function admin() {
    const panel = document.createElement("dialog");
    panel.style.cssText =
      "background:#101528;color:white;border:1px solid #61728f;border-radius:18px;max-width:650px;width:90%;max-height:80vh";
    const title = document.createElement("h2");
    title.textContent = "Manage this room’s games";
    panel.append(title);
    const info = document.createElement("p");
    info.textContent =
      "Hide or restore games for this room. Game-file imports remain available in the Android app.";
    panel.append(info);
    const ownerLink = document.createElement("a");
    ownerLink.href = "/admin";
    ownerLink.target = "_blank";
    ownerLink.rel = "noopener";
    ownerLink.textContent = "Site owner: manage game releases →";
    ownerLink.style.color = "#c7a5ff";
    panel.append(ownerLink);
    for (const game of state.catalog || []) {
      const line = document.createElement("label");
      line.style.cssText = "display:flex;gap:12px;padding:8px";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = !(state.library?.hidden || []).includes(game.id);
      check.onchange = () =>
        command("hide", { id: game.id, hidden: !check.checked })
          .then(async () => {
            state = await request("/web/host/status");
          })
          .catch(() => {
            check.checked = !check.checked;
          });
      line.append(check, document.createTextNode(game.title));
      panel.append(line);
    }
    const close = document.createElement("button");
    close.textContent = "Done";
    close.onclick = () => {
      panel.close();
      panel.remove();
    };
    panel.append(close);
    document.body.append(panel);
    panel.showModal();
  }
  const qrCache = new Map();
  function qr(value) {
    if (!window.qrcode) return "";
    if (qrCache.has(value)) return qrCache.get(value);
    const code = window.qrcode(0, "M");
    code.addData(value);
    code.make();
    const image = code.createDataURL(5, 4);
    qrCache.set(value, image);
    return image;
  }
  const host = {
    status: () => JSON.stringify({ ...state, active: selected }),
    inputs: () => JSON.stringify(input),
    select: (n) => {
      selected = Math.max(0, Math.min(5, Number(n) || 0));
      return true;
    },
    getHeld: () => input.masks[selected] || 0,
    activate: (id) => {
      if (
        !state.catalog?.some(
          (g) => g.id === id && !g.requiresBackend && !g.comingSoon,
        ) ||
        state.game?.phase === "RUNNING"
      )
        return false;
      after = 0;
      frames.length = 0;
      command("activate", { id });
      return true;
    },
    classic: () => state.game?.phase !== "RUNNING",
    leaveGame: () => {
      command("lobby");
      return true;
    },
    publish: (raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return false;
      }
      command("publish", data);
      return true;
    },
    startGame: () => {
      if (
        state.pc?.id ||
        state.game?.phase === "RUNNING" ||
        !state.seats?.some((s) => s.connected)
      )
        return false;
      command("start-signal");
      return true;
    },
    resetPlayers: () => {
      if (state.pc?.id || state.game?.phase === "RUNNING") return false;
      command("reset");
      return true;
    },
    qr,
    admin,
    checkRegistration: () => false,
  };
  if (cfg.role === "host") {
    const bridge = shared || host;
    window.ArcadiumTablet = bridge;
    window.ArcadiumNative = { getHeld: bridge.getHeld };
    window.HomeVibeWebHost = bridge;
    if (isConsole) {
      pump();
      refresh();
      let wake;
      const keepAwake = async () => {
        try {
          if (
            document.visibilityState === "visible" &&
            navigator.wakeLock &&
            !wake
          ) {
            wake = await navigator.wakeLock.request("screen");
            wake.addEventListener("release", () => (wake = null));
          }
        } catch {}
      };
      document.addEventListener("pointerdown", keepAwake);
      document.addEventListener("visibilitychange", keepAwake);
      window.addEventListener("pagehide", () => {
        stopped = true;
      });
    }
  }
  window.fetch = async function (resource, options) {
    let target;
    try {
      target = new URL(
        typeof resource === "string" ? resource : resource.url,
        location.href,
      );
    } catch {
      return rawFetch(resource, options);
    }
    if (["localhost", "127.0.0.1"].includes(target.hostname)) {
      target.protocol = location.protocol;
      target.host = location.host;
      target.port = location.port;
    }
    if (target.origin === location.origin) {
      if (!target.pathname.startsWith(root + "/"))
        target.pathname = root + target.pathname;
      options = { ...options };
      options.headers = new Headers(
        options.headers ||
          (typeof resource !== "string" ? resource.headers : undefined),
      );
      if (cfg.role === "host")
        options.headers.set("x-hv-host-instance", instance);
      if (session.token && cfg.role !== "host")
        options.headers.set("x-home-vibe-seat", session.token);
      if (cfg.role === "host")
        await (shared ? parent.HomeVibeWebPending?.() : queue)?.catch(() => {});
      resource = target.href;
    }
    return rawFetch(resource, options);
  };
  window.HomeVibeWebPending = () => queue;
  // sendBeacon bypasses fetch: keep release packets inside the room too.
  const beacon = navigator.sendBeacon.bind(navigator);
  try {
    Object.defineProperty(navigator, "sendBeacon", {
      configurable: true,
      value: (path, data) =>
        beacon(
          new URL(path, location.origin).pathname.startsWith(root + "/")
            ? path
            : root + new URL(path, location.origin).pathname,
          data,
        ),
    });
  } catch {}
})();
