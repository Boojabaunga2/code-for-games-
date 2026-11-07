import { Store } from "./store.mjs";
export const COLORS = ["red", "blue", "green", "yellow", "pink", "white"];
const BUTTONS = [
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
const enc = new TextEncoder(),
  json = JSON.stringify,
  parse = (s, f = {}) => {
    try {
      return JSON.parse(s);
    } catch {
      return f;
    }
  },
  random = () => crypto.randomUUID().replaceAll("-", "");
export async function hash(s) {
  return [
    ...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s))),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
function reply(value, status = 200, headers = {}) {
  return new Response(json(value), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}
function fail(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  throw e;
}
function cookie(req, name) {
  for (const entry of (req.headers.get("cookie") || "").split(";")) {
    const at = entry.indexOf("=");
    if (entry.slice(0, at).trim() === name) return entry.slice(at + 1).trim();
  }
  return "";
}
function setCookie(req, name, value, path) {
  return `${name}=${value}; Path=${path}; HttpOnly; SameSite=Lax; Max-Age=86400${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function createApp({
  db,
  readAsset: assetReader,
  catalog,
  now = () => Date.now(),
}) {
  const store = new Store(db);
  async function limit(req, key, max, windowMs) {
    const ip = await hash(req.headers.get("cf-connecting-ip") || "local");
    key = key + ":" + ip;
    const t = now();
    const r = await store.get(
      "SELECT started,count FROM hv_limits WHERE key=?",
      [key],
    );
    if (!r || t - r.started > windowMs) {
      await store.run(
        "INSERT INTO hv_limits(key,started,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET started=excluded.started,count=1",
        [key, t],
      );
      return;
    }
    if (r.count >= max) fail("Too many attempts. Try again shortly.", 429);
    await store.run("UPDATE hv_limits SET count=count+1 WHERE key=?", [key]);
  }
  async function seatFor(req, room, body = {}) {
    const token =
      req.headers.get("x-home-vibe-seat") ||
      body.token ||
      cookie(req, "hv-seat-" + room.id);
    if (!token) return null;
    return store.get("SELECT * FROM hv_seats WHERE room=? AND token_hash=?", [
      room.id,
      await hash(token),
    ]);
  }
  async function ownerFor(req, room) {
    const raw = cookie(req, "hv-owner-" + room.id);
    return !!raw && (await hash(raw)) === room.owner_hash;
  }
  async function seats(room) {
    const rows = await store.all(
      "SELECT seat,seen,mask FROM hv_seats WHERE room=? ORDER BY seat",
      [room.id],
    );
    return COLORS.map((color, i) => {
      const r = rows.find((r) => r.seat === i);
      return {
        color,
        player: i + 1,
        slot: i,
        seat: i + 1,
        connected: !!r && now() - r.seen < 3000,
        claimed: !!r,
        live: !!r && now() - r.seen < 3000,
        online: !!r && now() - r.seen < 3000,
        lastSeen: r?.seen || 0,
        lastButton: "",
        count: 0,
        buttons: BUTTONS.filter(
          (_, bit) => (r && now() - r.seen < 1500 ? r.mask : 0) & (1 << bit),
        ),
        held: Object.fromEntries(
          BUTTONS.map((b, k) => [
            b,
            !!((r && now() - r.seen < 1500 ? r.mask : 0) & (1 << k)),
          ]),
        ),
      };
    });
  }
  function signal(room, seat = -1) {
    const g = parse(room.signal, { phase: "LOBBY" });
    if (g.phase === "RUNNING") {
      g.round = Math.floor((now() - g.started) / 4000) + 1;
      if (g.round > 5) g.phase = "COMPLETED";
    }
    const out = {
      id: g.id || "",
      phase: g.phase || "LOBBY",
      round: Math.min(g.round || 0, 5),
      totalRounds: 5,
      remainingMs:
        g.phase === "RUNNING"
          ? Math.max(0, 4000 - ((now() - g.started) % 4000))
          : 0,
      players: g.players || COLORS.map(() => false),
      scores: g.scores || COLORS.map(() => 0),
    };
    if (seat >= 0)
      Object.assign(out, {
        yourTarget:
          g.phase === "RUNNING" && out.players[seat]
            ? g.targets[g.round - 1][seat]
            : -1,
        yourAnswered: g.answered?.[seat] === g.round,
        participating: out.players[seat],
      });
    return { g, out };
  }
  async function state(room, seat = -1) {
    const slot = await seats(room),
      active = parse(room.active);
    return {
      active: 0,
      seats: slot.map((s) => ({ color: s.color, connected: s.connected })),
      pc: {
        ...active,
        live: parse(room.public_state),
        ghostPowers: await store.value(room.id, "ghost-powers"),
      },
      game: signal(room, seat).out,
      hostConnected: now() - room.host_seen < 3500,
    };
  }
  async function events(room, after = 0, kind = "input", seat = null) {
    let sql =
        "SELECT id,seat,payload,created FROM hv_events WHERE room=? AND game=? AND kind=? AND id>?",
      params = [room.id, parse(room.active).id || "", kind, after];
    if (seat !== null) {
      sql += " AND seat=?";
      params.push(seat);
    }
    return store.all(sql + " ORDER BY id LIMIT 1024", params);
  }
  async function transport(req, room, path, body, owner, seat) {
    const url = new URL(req.url),
      q = url.searchParams,
      active = parse(room.active),
      id = active.id || "",
      n = seat?.seat;
    if (!owner && !seat) fail("Join this game room first.", 403);
    if (
      owner &&
      room.host_instance &&
      now() - room.host_seen < 5000 &&
      req.headers.get("x-hv-host-instance") !== room.host_instance
    )
      fail("Use the active host tab.", 409);
    if (
      !owner &&
      ((q.has("token") && (await hash(q.get("token"))) !== seat.token_hash) ||
        (body.player !== undefined && Number(body.player) !== n + 1))
    )
      fail("Seat mismatch.", 403);
    if (path.includes("/host/") && !owner) fail("Game screen only.", 403);
    const slots = await seats(room);
    if (path.startsWith("/home-vibe/socket/")) {
      if (id !== "what-the-duck") fail("Game changed.", 409);
      const sid = body.id || q.get("id") || "";
      if (!/^[A-Za-z0-9-]{10,80}$/.test(sid)) fail("Invalid connection.");
      const message = body.message || {};
      if (path.endsWith("/send") && message.role) {
        const who = message.role === "host" ? -1 : n;
        if (
          (who === -1 && !owner) ||
          (who !== -1 && (!seat || Number(message.seat) !== n))
        )
          fail("Connection owner mismatch.", 403);
        const old = await store.get(
          "SELECT seat FROM hv_sockets WHERE room=? AND id=?",
          [room.id, sid],
        );
        if (old && old.seat !== who) fail("Connection owner mismatch.", 403);
        await store.run(
          "INSERT OR IGNORE INTO hv_sockets(room,id,seat) VALUES(?,?,?)",
          [room.id, sid, who],
        );
        const sockets = await store.all(
          "SELECT id,seat FROM hv_sockets WHERE room=?",
          [room.id],
        );
        for (const s of sockets) {
          if (who === -1 && s.seat >= 0)
            await store.run(
              "INSERT INTO hv_socket_messages(room,socket,payload) VALUES(?,?,?)",
              [room.id, sid, json({ from: s.seat, sys: "open" })],
            );
          else if (who >= 0 && s.seat === -1)
            await store.run(
              "INSERT INTO hv_socket_messages(room,socket,payload) VALUES(?,?,?)",
              [room.id, s.id, json({ from: who, sys: "open" })],
            );
        }
        return reply({ ok: true });
      }
      const socket = await store.get(
        "SELECT seat FROM hv_sockets WHERE room=? AND id=?",
        [room.id, sid],
      );
      if (!socket) fail("Connection closed.", 404);
      if (socket.seat === -1 ? !owner : socket.seat !== n)
        fail("Connection owner mismatch.", 403);
      if (path.endsWith("/close")) {
        await store.run("DELETE FROM hv_sockets WHERE room=? AND id=?", [
          room.id,
          sid,
        ]);
        return reply({ ok: true });
      }
      if (path.endsWith("/poll")) {
        const messages = await store.all(
          "SELECT id,payload FROM hv_socket_messages WHERE room=? AND socket=? ORDER BY id LIMIT 256",
          [room.id, sid],
        );
        if (messages.length)
          await store.run(
            "DELETE FROM hv_socket_messages WHERE room=? AND socket=? AND id<=?",
            [room.id, sid, messages.at(-1).id],
          );
        return reply({ messages: messages.map((m) => parse(m.payload)) });
      }
      if (path.endsWith("/send")) {
        const destinations = await store.all(
          "SELECT id,seat FROM hv_sockets WHERE room=?",
          [room.id],
        );
        for (const s of destinations) {
          if (
            socket.seat === -1
              ? s.seat >= 0 &&
                (message.to === "all" || Number(message.to) === s.seat)
              : s.seat === -1
          )
            await store.run(
              "INSERT INTO hv_socket_messages(room,socket,payload) VALUES(?,?,?)",
              [
                room.id,
                s.id,
                json(
                  socket.seat === -1 ? message : { from: n, msg: message.msg },
                ),
              ],
            );
        }
        return reply({ ok: true });
      }
    }
    if (path === "/info") {
      const rows = await store.all("SELECT seat FROM hv_sockets WHERE room=?", [
        room.id,
      ]);
      return reply({
        ip: url.hostname,
        port: 443,
        host: rows.some((r) => r.seat === -1),
        players: rows.filter((r) => r.seat >= 0).map((r) => r.seat),
      });
    }
    if (path === "/api/vibe/events" || path === "/arcadium-controller/events") {
      const rows = await events(
        room,
        Number(q.get("after") || 0),
        "input",
        owner ? null : n,
      );
      return reply({
        ok: true,
        events: rows.flatMap((e) =>
          parse(e.payload, [])
            .filter(
              (x) =>
                !(
                  [
                    "anti-gravity-brothers",
                    "barrel-bash",
                    "escape-3-monkey-island",
                  ].includes(id) && x.action === "up"
                ),
            )
            .map((x) => ({ ...x, id: e.id, seq: e.id, at: e.created })),
        ),
        latest: rows.at(-1)?.id || Number(q.get("after") || 0),
        slots: owner ? slots : [slots[n]],
      });
    }
    if (path === "/api/vibe/status")
      return reply({
        slots: owner ? slots : [slots[n]],
        latest: 0,
        events: [],
      });
    if (path === "/api/vibe/config")
      return reply({ url: url.origin + "/r/" + room.id + "/" });
    if (path === "/home-vibe/public") return reply((await state(room, n)).pc);
    if (path === "/api/vibe/input") {
      if (!seat) fail("Choose a player colour.", 403);
      if (body.color && body.color !== COLORS[n]) fail("Seat mismatch.", 403);
      const name = String(body.button || "").toUpperCase(),
        bit = BUTTONS.indexOf(name);
      if (
        id === "worm-riders-stunt-mayhem" &&
        /^WR_(brake|throttle|jump|back|fwd|nohander|whip|superman|spin|confirm)_(ON|OFF)$/.test(
          String(body.button),
        )
      ) {
        await store.emit(
          room.id,
          id,
          n,
          "input",
          [{ color: COLORS[n], player: n + 1, button: body.button }],
          now(),
        );
        return reply({ ok: true });
      }
      if (bit < 0) fail("Unknown button.");
      const down = body.action !== "up";
      const before = seat.mask,
        mask = down ? before | (1 << bit) : before & ~(1 << bit);
      await store.run(
        "UPDATE hv_seats SET mask=?,seen=? WHERE room=? AND seat=?",
        [mask, now(), room.id, n],
      );
      await store.emit(
        room.id,
        id,
        n,
        "input",
        [
          {
            color: COLORS[n],
            player: n + 1,
            button: name,
            action: down ? "down" : "up",
          },
        ],
        now(),
      );
      return reply({ ok: true });
    }
    if (path === "/api/vibe/ghost/configure") {
      if (!owner) fail("Game screen only.", 403);
      if (!COLORS.includes(body.color) || !Array.isArray(body.powers))
        fail("Invalid ghost configuration.");
      const powers = await store.value(room.id, "ghost-powers");
      powers[body.color] = body.powers;
      await store.put(room.id, "ghost-powers", powers);
      return reply({ ok: true });
    }
    if (path === "/home-vibe/ghost-action") {
      if (!seat) fail("Reconnect.", 403);
      const choices =
        (await store.value(room.id, "ghost-powers"))[COLORS[n]] || [];
      if (
        !choices.some(
          (x) => (typeof x === "string" ? x : x.id || x.name) === body.power,
        )
      )
        fail("Power is unavailable.", 403);
      await store.emit(
        room.id,
        id,
        n,
        "ghost",
        { color: COLORS[n], power: body.power },
        now(),
      );
      return reply({ ok: true });
    }
    if (path === "/api/vibe/ghost/actions") {
      if (!owner) fail("Game screen only.", 403);
      const rows = await events(room, Number(q.get("after") || 0), "ghost");
      return reply({
        actions: rows.map((e) => ({ ...parse(e.payload), seq: e.id })),
        latest: rows.at(-1)?.id || Number(q.get("after") || 0),
      });
    }
    const prefixes = {
        mp: "monkey-poker",
        dd: "dirty-deeds",
        gp: "gumpy",
        pg: "project-ghost",
        bb: "bumper-brawl",
      },
      prefix = path.split("/")[1];
    if (prefixes[prefix]) {
      if (id !== prefixes[prefix])
        fail("The game screen has changed games.", 409);
      if (path.endsWith("/view")) {
        if (!seat) fail("Choose your colour first.", 403);
        return reply({
          ok: true,
          boot: room.id,
          host: true,
          rev: now(),
          view: await store.value(room.id, prefix + ":view:" + n),
        });
      }
      if (path.endsWith("/host/views")) {
        if (!owner) fail("Game screen only.", 403);
        for (const [key, value] of Object.entries(body.views || {})) {
          const i = Number(key) - 1;
          if (i >= 0 && i < 6)
            await store.put(room.id, prefix + ":view:" + i, value);
        }
        return reply({ ok: true });
      }
      if (path.endsWith("/send") || path.endsWith("/join")) {
        if (!seat) fail("Choose your colour first.", 403);
        const msg = path.endsWith("/join") ? { t: "hello" } : body.msg || body;
        await store.emit(
          room.id,
          id,
          n,
          prefix,
          {
            seat: n + 1,
            player: n + 1,
            msg,
            key: body.key || msg.key || "",
            t: prefix === "pg" ? "press" : "message",
          },
          now(),
        );
        return reply({
          ok: true,
          token: body.token || req.headers.get("x-home-vibe-seat"),
          player: n + 1,
          seat: n + 1,
          boot: room.id,
        });
      }
      if (path.endsWith("/host/inbox")) {
        if (!owner) fail("Game screen only.", 403);
        const rows = await events(room, Number(q.get("since") || 0), prefix);
        return reply({
          ok: true,
          boot: room.id,
          next: rows.at(-1)?.id || Number(q.get("since") || 0),
          latest: rows.at(-1)?.id || 0,
          events: rows.map((e) => ({
            ...parse(e.payload),
            seq: e.id,
            n: e.id,
            at: e.created,
          })),
          seats:
            prefix === "pg"
              ? Object.fromEntries(slots.map((s, i) => [i + 1, s]))
              : slots,
          hosts: 1,
          host: true,
        });
      }
      if (path.endsWith("/seats"))
        return reply({ seats: slots, boot: room.id });
      if (path.endsWith("/host/release")) return reply({ ok: true });
    }
    if (path === "/barrel-bash/state" || path === "/hn/state") {
      const key = path === "/barrel-bash/state" ? "barrel" : "high-noon";
      if (req.method === "POST") {
        if (!owner) fail("Game screen only.", 403);
        await store.put(room.id, key, body);
        return reply({ ok: true });
      }
      let view = await store.value(room.id, key);
      if (key === "barrel" && Array.isArray(view.seats)) {
        view = {
          ...view,
          seat: view.seats[
            owner ? Math.max(0, COLORS.indexOf(q.get("color") || "red")) : n
          ],
        };
        delete view.seats;
      }
      return reply(key === "high-noon" ? { state: view } : view);
    }
    if (path === "/hn/host/sync") {
      if (!owner) fail("Game screen only.", 403);
      if (body.state) await store.put(room.id, "high-noon", body.state);
      const rows = await events(room, 0, "hn");
      if (rows.length)
        await store.run(
          "DELETE FROM hv_events WHERE room=? AND kind=? AND id<=?",
          [room.id, "hn", rows.at(-1).id],
        );
      return reply({
        ok: true,
        events: rows.map((e) => ({ ...parse(e.payload), id: e.id })),
      });
    }
    if (path === "/hn/vibe/action") {
      if (!seat) fail("Reconnect.", 403);
      await store.emit(
        room.id,
        id,
        n,
        "hn",
        { color: COLORS[n], action: body.action },
        now(),
      );
      return reply({ ok: true });
    }
    if (path.startsWith("/wr/")) {
      if (!id.startsWith("worm-")) fail("Game changed.", 409);
      if (path === "/wr/state")
        return reply({
          active: true,
          activeSeat: await store.value(room.id, "worm-seat", 0),
        });
      if (!owner) fail("Game screen only.", 403);
      if (path === "/wr/host-state")
        await store.put(room.id, "worm-seat", Number(q.get("activeSeat") || 0));
      return reply({ ok: true });
    }
    if (path === "/e3mi/frame") {
      if (id !== "escape-3-monkey-island") fail("Game changed.", 409);
      if (req.method === "POST") {
        if (!owner) fail("Game screen only.", 403);
        const i = Number(body.seat) - 1;
        if (
          i < 0 ||
          i > 5 ||
          typeof body.image !== "string" ||
          body.image.length > 500000
        )
          fail("Invalid frame.");
        await store.put(room.id, "e3mi:" + i, { image: body.image });
        return reply({ ok: true });
      }
      return reply(
        await store.value(
          room.id,
          "e3mi:" + (owner ? COLORS.indexOf(q.get("color") || "red") : n),
          { error: "Waiting for game screen" },
        ),
      );
    }
    if (
      path.startsWith("/arcadium-vibe/activate/") ||
      [
        "/ca/presence",
        "/api/gumpy/presence",
        "/agb/host/presence",
        "/api/vibe/activate-dirty-deeds",
        "/api/ninja-monkeys/activate",
        "/mp/activate",
      ].includes(path)
    )
      return reply({ ok: true });
    if (path.startsWith("/arcadium-mirror/push/")) return reply({ ok: true });
    if (path === "/api/info")
      return reply({ product: "Arcadium Home Vibe Web", offline: false });
    if (path === "/api/files") return reply({ files: [] });
    fail("This service is not available in the browser host yet.", 501);
  }
  async function route(req) {
    const url = new URL(req.url);
    if (
      req.method !== "GET" &&
      req.headers.get("origin") &&
      req.headers.get("origin") !== url.origin
    )
      fail("Cross-origin request denied.", 403);
    if (Number(req.headers.get("content-length") || 0) > 2100000)
      fail("Request too large.", 413);
    if (url.pathname === "/web/rooms" && req.method === "POST") {
      await limit(req, "create", 10, 60000);
      // Bounded expiry cleanup, outside schema migrations and ordinary input polls.
      for (const table of [
        "hv_seats",
        "hv_events",
        "hv_values",
        "hv_sockets",
        "hv_socket_messages",
      ])
        await store.run(
          "DELETE FROM " +
            table +
            " WHERE room IN (SELECT id FROM hv_rooms WHERE expires<? LIMIT 50)",
          [now()],
        );
      await store.run(
        "DELETE FROM hv_rooms WHERE id IN (SELECT id FROM hv_rooms WHERE expires<? LIMIT 50)",
        [now()],
      );
      await store.run("DELETE FROM hv_limits WHERE started<?", [
        now() - 86400000,
      ]);
      const id = random(),
        owner = random() + random(),
        ownerHash = await hash(owner),
        t = now();
      let pin;
      for (let tries = 0; tries < 10; tries++) {
        pin = String(
          crypto.getRandomValues(new Uint32Array(1))[0] % 1000000,
        ).padStart(6, "0");
        if (!(await store.get("SELECT id FROM hv_rooms WHERE pin=?", [pin])))
          break;
        pin = null;
      }
      if (!pin) fail("Try again shortly.", 503);
      await store.run(
        "INSERT INTO hv_rooms(id,pin,owner_hash,created,expires) VALUES(?,?,?,?,?)",
        [id, pin, ownerHash, t, t + 86400000],
      );
      return reply(
        {
          host: "/r/" + id + "/console/tablet-home.html",
          join: "/r/" + id + "/#pin=" + pin,
          pin,
        },
        201,
        {
          "set-cookie": setCookie(
            req,
            "hv-owner-" + id,
            owner,
            "/r/" + id + "/",
          ),
        },
      );
    }
    if (url.pathname === "/web/find-room" && req.method === "POST") {
      await limit(req, "find", 8, 60000);
      const body = await req.json();
      const room = await store.get(
        "SELECT id,pin FROM hv_rooms WHERE pin=? AND expires>?",
        [String(body.pin || ""), now()],
      );
      if (!room) fail("Check the room code.", 404);
      return reply({ join: "/r/" + room.id + "/#pin=" + room.pin });
    }
    const match = url.pathname.match(/^\/r\/([a-f0-9]{32})(\/.*)?$/);
    if (!match) {
      if (url.pathname === "/" || url.pathname.startsWith("/web-assets/"))
        return serveAsset(
          url.pathname === "/"
            ? "web/index.html"
            : "web/" + url.pathname.slice(12),
          null,
          false,
          req,
        );
      fail("Not found.", 404);
    }
    const room = await store.get("SELECT * FROM hv_rooms WHERE id=?", [
      match[1],
    ]);
    if (!room || room.expires < now())
      fail("This room has closed. Create a new room.", 410);
    const path = decodeURIComponent(match[2] || "/");
    if (path.includes("..") || path.includes("\\")) fail("Invalid path.", 403);
    let body = {};
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.length > 2100000) fail("Request too large.", 413);
      body = req.headers.get("content-type")?.includes("application/json")
        ? parse(raw)
        : Object.fromEntries(new URLSearchParams(raw));
    }
    const owner = await ownerFor(req, room),
      seat = await seatFor(req, room, body);
    if (path === "/api/join" && req.method === "POST") {
      await limit(req, "join:" + room.id, 24, 60000);
      if (room.pin !== body.pin) fail("Check the pairing code.", 403);
      const n = COLORS.indexOf(body.color);
      if (n < 0) fail("Choose a player colour.");
      if (signal(room).out.phase === "RUNNING")
        fail("Wait for Signal Sprint to finish.", 409);
      const token = random() + random();
      try {
        await store.run(
          "INSERT INTO hv_seats(room,seat,token_hash,seen) VALUES(?,?,?,?)",
          [room.id, n, await hash(token), now()],
        );
      } catch (e) {
        fail("That colour is already connected.", 409);
      }
      return reply({ token, color: COLORS[n] }, 200, {
        "set-cookie": setCookie(
          req,
          "hv-seat-" + room.id,
          token,
          "/r/" + room.id + "/",
        ),
      });
    }
    if (
      ["/api/input", "/api/leave", "/api/answer"].includes(path) &&
      req.method === "POST"
    ) {
      if (!seat) fail("Reconnect to this game room.", 401);
      if (path === "/api/leave") {
        await store.run("DELETE FROM hv_seats WHERE room=? AND seat=?", [
          room.id,
          seat.seat,
        ]);
        return reply({});
      }
      if (path === "/api/answer") {
        let { g, out } = signal(room, seat.seat);
        const choice = Number(body.choice);
        if (
          out.phase !== "RUNNING" ||
          !out.participating ||
          out.yourAnswered ||
          Number(body.round) !== out.round ||
          !Number.isInteger(choice) ||
          choice < 0 ||
          choice > 3
        )
          fail("That signal has moved on.", 409);
        g.answered[seat.seat] = g.round;
        if (choice === g.targets[g.round - 1][seat.seat]) g.scores[seat.seat]++;
        const r = await store.run(
          "UPDATE hv_rooms SET signal=?,revision=revision+1 WHERE id=? AND revision=?",
          [json(g), room.id, room.revision],
        );
        if (!r.meta.changes) fail("Try that signal again.", 409);
        room.signal = json(g);
        return reply(await state(room, seat.seat));
      }
      const sequence = Number(body.seq),
        mask = Number(body.mask);
      if (
        !Number.isSafeInteger(sequence) ||
        sequence < 0 ||
        !Number.isInteger(mask) ||
        mask < 0 ||
        mask > 4095
      )
        fail("Invalid input.");
      if (sequence > seat.sequence) {
        const updated = await store.run(
          "UPDATE hv_seats SET mask=?,sequence=?,seen=? WHERE room=? AND seat=? AND sequence<?",
          [mask, sequence, now(), room.id, seat.seat, sequence],
        );
        if (updated.meta.changes && mask !== seat.mask) {
          const edges = [];
          for (let b = 0; b < 12; b++)
            if ((mask ^ seat.mask) & (1 << b))
              edges.push({
                color: COLORS[seat.seat],
                player: seat.seat + 1,
                button: BUTTONS[b],
                action: mask & (1 << b) ? "down" : "up",
              });
          await store.emit(
            room.id,
            parse(room.active).id || "",
            seat.seat,
            "input",
            edges,
            now(),
          );
        }
      }
      return reply(await state(room, seat.seat));
    }
    if (path.startsWith("/web/host/")) {
      if (!owner) fail("This link does not control the game screen.", 403);
      if (
        !["/web/host/status", "/web/host/inputs"].includes(path) &&
        req.method !== "POST"
      )
        fail("Use POST for host commands.", 405);
      if (path !== "/web/host/status") {
        const instance = req.headers.get("x-hv-host-instance") || "";
        if (!/^[a-f0-9]{32}$/.test(instance))
          fail("Open the host page again.", 403);
        if (
          room.host_instance &&
          room.host_instance !== instance &&
          now() - room.host_seen < 5000
        )
          fail(
            "This room is already open in another host tab. Close that tab first.",
            409,
          );
        const lease = await store.run(
          "UPDATE hv_rooms SET host_instance=?,host_seen=? WHERE id=? AND (host_instance=? OR host_seen<? OR host_instance=?)",
          [instance, now(), room.id, instance, now() - 5000, ""],
        );
        if (!lease.meta.changes) fail("Another host tab owns this room.", 409);
      }

      if (path === "/web/host/inputs") {
        await store.run(
          "UPDATE hv_rooms SET host_seen=?,expires=? WHERE id=?",
          [now(), now() + 86400000, room.id],
        );
        const ss = await seats(room),
          rows = await events(room, Number(url.searchParams.get("after") || 0));
        return reply({
          masks: ss.map((s) =>
            BUTTONS.reduce((m, b, k) => m | (s.held[b] ? 1 << k : 0), 0),
          ),
          connected: ss.map((s) => s.connected),
          events: rows.map((e) => ({
            id: e.id,
            seat: e.seat,
            edges: parse(e.payload, []),
          })),
          latest: rows.at(-1)?.id || Number(url.searchParams.get("after") || 0),
        });
      }
      if (path === "/web/host/status")
        return reply({
          ...(await state(room)),
          catalog: catalog.map((g) => scopeGame(g, room.id)),
          library: { hidden: parse(room.hidden, []), imported: [] },
          pin: room.pin,
          urls: [url.origin + "/r/" + room.id + "/"],
          registration: { verified: false, state: "OFFLINE" },
          history: [],
          model: "Home Vibe browser host",
          browserHost: true,
        });
      if (path === "/web/host/activate") {
        const game = catalog.find((g) => g.id === body.id);
        if (!game || game.requiresBackend)
          fail("This game is unavailable.", 409);
        if (signal(room).out.phase === "RUNNING")
          fail("Finish Signal Sprint first.", 409);
        await store.batch([
          [
            "UPDATE hv_rooms SET active=?,public_state=? WHERE id=?",
            [json(scopeGame(game, room.id)), "{}", room.id],
          ],
          ["DELETE FROM hv_values WHERE room=?", [room.id]],
          ["DELETE FROM hv_events WHERE room=?", [room.id]],
          ["DELETE FROM hv_sockets WHERE room=?", [room.id]],
          ["DELETE FROM hv_socket_messages WHERE room=?", [room.id]],
        ]);
        return reply({ ok: true });
      }
      if (path === "/web/host/publish") {
        if (body.id !== parse(room.active).id) fail("Game changed.", 409);
        if (typeof body.frame === "string" && body.frame.length > 200000)
          delete body.frame;
        await store.run("UPDATE hv_rooms SET public_state=? WHERE id=?", [
          json(body),
          room.id,
        ]);
        return reply({ ok: true });
      }
      if (path === "/web/host/lobby") {
        if (signal(room).out.phase === "RUNNING")
          fail("Signal Sprint is running.", 409);
        await store.run(
          "UPDATE hv_rooms SET active=?,public_state=?,signal=? WHERE id=?",
          ["{}", "{}", json({ phase: "LOBBY" }), room.id],
        );
        await store.run("DELETE FROM hv_values WHERE room=?", [room.id]);
        return reply({ ok: true });
      }
      if (path === "/web/host/hide") {
        const ids = new Set(parse(room.hidden, []));
        if (!catalog.some((g) => g.id === body.id)) fail("Unknown game.");
        body.hidden ? ids.add(body.id) : ids.delete(body.id);
        await store.run("UPDATE hv_rooms SET hidden=? WHERE id=?", [
          json([...ids]),
          room.id,
        ]);
        return reply({ ok: true });
      }
      if (path === "/web/host/reset") {
        if (parse(room.active).id || signal(room).out.phase === "RUNNING")
          fail("Finish the current game first.", 409);
        await store.run("DELETE FROM hv_seats WHERE room=?", [room.id]);
        return reply({ ok: true });
      }
      if (path === "/web/host/start-signal") {
        if (parse(room.active).id || signal(room).out.phase === "RUNNING")
          fail("Finish the current game first.", 409);
        const ss = await seats(room);
        if (!ss.some((s) => s.connected))
          fail("Connect at least one phone.", 409);
        const g = {
          id: random(),
          phase: "RUNNING",
          round: 1,
          started: now(),
          players: ss.map((s) => s.connected),
          scores: COLORS.map(() => 0),
          targets: Array.from({ length: 5 }, () =>
            COLORS.map(() => crypto.getRandomValues(new Uint32Array(1))[0] % 4),
          ),
          answered: COLORS.map(() => 0),
        };
        await store.run("UPDATE hv_rooms SET signal=? WHERE id=?", [
          json(g),
          room.id,
        ]);
        return reply({ ok: true });
      }
      fail("Unknown host command.", 404);
    }
    if (
      req.method === "GET" &&
      (path === "/" ||
        path.startsWith("/console/") ||
        path.startsWith("/games/") ||
        path.startsWith("/classic/") ||
        path.startsWith("/cards/") ||
        path.startsWith("/vendor/") ||
        [
          "/phone.js",
          "/home-showtime.css",
          "/pc-host-adapter.js",
          "/pc-game-profiles.json",
          "/web-bridge.js",
          "/tablet-home.js",
          "/home-showtime.js",
          "/home-vibe-opening.html",
          "/home-vibe-mascot.png",
          "/connect-players.png",
          "/tablet-phone.js",
        ].includes(path))
    ) {
      if (path.startsWith("/console/") && !owner)
        fail("Game screen only.", 403);
      const name =
        path === "/"
          ? "tablet-phone.html"
          : path === "/phone.js"
            ? "tablet-phone.js"
            : path.slice(path.startsWith("/console/") ? 9 : 1);
      return serveAsset(name, room, owner, req);
    }
    return transport(req, room, path, body, owner, seat);
  }
  async function serveAsset(name, room, owner, req) {
    const response = await readAssetBytes(name);
    if (!response) return reply({ error: "Not found" }, 404);
    let { bytes, type } = response;
    if (room && (name.endsWith(".html") || name.endsWith(".js"))) {
      let text = new TextDecoder().decode(bytes);
      const prefix = "/r/" + room.id;
      // Runtime compatibility rewriting only; original bundled engines stay unchanged.
      text = text
        .replaceAll(":8787", ":8789")
        .replace(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
          "/vendor/three.min.js",
        );
      text = text.replace(
        /(["'])\/(games|classic|cards|vendor|console)\//g,
        (_, quote, kind) => quote + prefix + "/" + kind + "/",
      );
      text = text
        .replaceAll(
          "'arcadium-tablet-session'",
          json("arcadium-web-session:" + room.id),
        )
        .replaceAll(
          '"arcadium-tablet-session"',
          json("arcadium-web-session:" + room.id),
        );
      if (name === "pc-host-adapter.js")
        text = text.replace(
          "target.host=location.host;",
          "target.host=location.host;target.port=location.port;",
        );
      if (name === "pc-host-adapter.js")
        text = text.replace(
          "url.pathname.split('/')[2]",
          "(window.HomeVibeWeb?.gamePath||url.pathname).split('/')[2]",
        );
      if (name === "tablet-home.js")
        text = text
          .replace(
            "Use the address for your Wi-Fi network. The router does not need an internet connection.",
            "Share this room link or scan the QR. Internet is required during play.",
          )
          .replace(
            "No local Wi-Fi address found. Connect the tablet to Wi-Fi, or enable its hotspot and connect your phones.",
            "Room connection unavailable. Reconnect to the internet.",
          );
      if (name === "tablet-home.js")
        text = text.replace(
          "Open the Arcadium Home Tablet Android app to host controllers.",
          "Reconnect to your Home Vibe browser room.",
        );
      if (name === "tablet-phone.js")
        text = text.replace(
          "status.textContent='Connected to your tablet'",
          "status.textContent=state.hostConnected?'Connected to your game screen':'Game screen disconnected. Waiting…'",
        );
      text = text
        .replaceAll(
          "LOCAL PLAY · NO INTERNET NEEDED",
          "PRIVATE ROOM · LIVE CONNECTION",
        )
        .replaceAll(
          "Local Wi-Fi · no app download or internet needed on this phone.",
          "Private game room · keep this browser open while playing.",
        )
        .replaceAll(
          "Same Wi-Fi. Scan. Choose your color. You’re in.",
          "Scan. Choose your colour. Join this private room.",
        )
        .replaceAll(
          "Connect your phones to the same Wi-Fi as this tablet. Open a browser on each phone and enter a tablet address below.",
          "Open this private room on each phone using the QR code or room link.",
        )
        .replaceAll(
          "Phones and tablet must share Wi-Fi.",
          "Keep the game screen and phones connected.",
        )
        .replaceAll(
          "Connected to your tablet",
          "Connected to your game screen",
        );
      if (name.endsWith(".html")) {
        const initial = owner
          ? {
              ...(await state(room)),
              catalog: catalog.map((g) => scopeGame(g, room.id)),
              library: { hidden: parse(room.hidden, []), imported: [] },
              pin: room.pin,
              urls: [new URL(req.url).origin + prefix + "/"],
              registration: { verified: false, state: "OFFLINE" },
              history: [],
              browserHost: true,
            }
          : null;
        const tag =
          `${name === "tablet-home.html" ? `<base href="${prefix}/">` : ""}<script src="${prefix}/vendor/qrcode.js"></script><script>window.__HV_WEB=${json({ room: room.id, role: owner ? "host" : "phone", gamePath: "/" + name, initial }).replaceAll("<", "\\u003c")};</script><script src="${prefix}/web-bridge.js"></script>` +
          (name.startsWith("games/")
            ? `<script src="${prefix}/pc-host-adapter.js"></script>`
            : "");
        text = text.replace(/<head[^>]*>/i, (m) => m + tag);
      }
      bytes = enc.encode(text);
    }
    return new Response(bytes, {
      headers: {
        "content-type": type,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-security-policy":
          "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; frame-ancestors 'self'",
      },
    });
  }
  async function readAssetBytes(name) {
    try {
      return await assetReader(name);
    } catch {
      return null;
    }
  }
  // Keep the external asset reader separate from the HTTP transformation function.
  return {
    async fetch(req) {
      try {
        return await route(req);
      } catch (e) {
        return reply(
          {
            error: e.status
              ? e.message
              : "Home Vibe could not complete this request.",
          },
          e.status || 500,
        );
      }
    },
    store,
  };
}
function scopeGame(game, room) {
  const scope = (value) =>
    value?.startsWith("/") ? "/r/" + room + value : value;
  return {
    ...game,
    entry: scope(game.entry),
    cover: scope(game.cover),
    privatePage: scope(game.privatePage),
  };
}
