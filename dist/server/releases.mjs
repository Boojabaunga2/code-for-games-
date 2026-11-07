// Global staged releases. Room hosting never grants site-owner privileges.
export const LAUNCH_GAMES = ["arcadium-10000", "ghost-grind", "what-the-duck"];
const SCOPE = "__site__",
  KEY = "releases";
export function releasesService({
  store,
  catalog,
  ownerEmail,
  reply,
  fail,
  serveAsset,
}) {
  const defaults = { ids: LAUNCH_GAMES, revision: 0 };
  const get = () => store.value(SCOPE, KEY, defaults);
  async function owner(req) {
    const id = req.headers.get("oai-authenticated-user-id");
    if (!id) return false;
    const bound = await store.value(SCOPE, "owner-id", null);
    if (bound) return id === bound;
    if (
      !ownerEmail ||
      req.headers.get("oai-authenticated-user-email")?.toLowerCase() !==
        ownerEmail.toLowerCase()
    )
      return false;
    await store.run(
      "INSERT OR IGNORE INTO hv_values(room,key,value) VALUES(?,?,?)",
      [SCOPE, "owner-id", JSON.stringify(id)],
    );
    return id === (await store.value(SCOPE, "owner-id", null));
  }
  async function handle(req, url) {
    if (url.pathname !== "/admin" && !url.pathname.startsWith("/web/admin/"))
      return null;
    if (
      url.pathname === "/admin" &&
      !req.headers.get("oai-authenticated-user-id")
    )
      return new Response(
        '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Home Vibe owner controls</title><body style="background:#101528;color:white;font:20px system-ui;padding:40px"><h1>Owner controls</h1><p>Sign in with the ChatGPT account that owns this Home Vibe site.</p><a style="color:#c7a5ff" href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">Sign in to manage releases →</a><p><a style="color:#a9b6ce" href="/">Back to Home Vibe</a></p></body></html>',
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        },
      );
    if (!(await owner(req)))
      fail("Only the site owner can manage game releases.", 403);
    if (url.pathname === "/admin")
      return serveAsset("web/admin.html", null, false, req);
    if (url.pathname === "/web/admin/art") {
      const game = catalog.find((g) => g.id === url.searchParams.get("id"));
      if (!game?.cover) fail("Artwork not found.", 404);
      return serveAsset(game.cover.replace(/^\//, ""), null, false, req);
    }
    if (url.pathname !== "/web/admin/releases") fail("Not found.", 404);
    if (req.method === "GET") {
      const record = await get();
      return reply({
        ...record,
        games: catalog.map((g) => ({
          id: g.id,
          title: g.title,
          cover: "/web/admin/art?id=" + encodeURIComponent(g.id),
          requiresBackend: g.requiresBackend || "",
          compatibilityWarning: g.compatibilityWarning || "",
        })),
      });
    }
    if (req.method !== "POST") fail("Use POST to save releases.", 405);
    let data;
    try {
      const text = await req.text();
      if (text.length > 10000) fail("Request too large.", 413);
      data = JSON.parse(text);
    } catch (e) {
      if (e.status) throw e;
      fail("Invalid release selection.");
    }
    if (
      !Array.isArray(data.ids) ||
      data.ids.length > catalog.length ||
      new Set(data.ids).size !== data.ids.length ||
      data.ids.some(
        (id) => !catalog.some((g) => g.id === id && !g.requiresBackend),
      )
    )
      fail("Choose valid games with their required services available.");
    const current = await get();
    if (data.expectedRevision !== current.revision)
      fail("Releases changed in another tab. Reload before saving.", 409);
    const added = data.ids.filter((id) => !current.ids.includes(id));
    if (added.length > 2) fail("Release one or two new games at a time.");
    const next = { ids: data.ids, revision: current.revision + 1 };
    await store.run(
      "INSERT OR IGNORE INTO hv_values(room,key,value) VALUES(?,?,?)",
      [SCOPE, KEY, JSON.stringify(defaults)],
    );
    const result = await store.run(
      "UPDATE hv_values SET value=? WHERE room=? AND key=? AND value=?",
      [JSON.stringify(next), SCOPE, KEY, JSON.stringify(current)],
    );
    if (!result.meta.changes)
      fail("Releases changed in another tab. Reload before saving.", 409);
    return reply({ ...next, added });
  }
  return { get, handle };
}
