// Portable LAN/self-host deployment. HTTPS is required outside a trusted LAN.
import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { readFile, mkdir } from "node:fs/promises";
import { createApp } from "./app.mjs";
import { sqliteD1 } from "./store.mjs";
import { fileAssets } from "./assets.mjs";
await mkdir("data", { recursive: true });
const database = new DatabaseSync("data/home-vibe.sqlite");
database.exec("PRAGMA journal_mode=WAL");
if (
  !database
    .prepare("SELECT name FROM sqlite_master WHERE name='hv_rooms'")
    .get()
)
  database.exec(await readFile("drizzle/0000_browser_rooms.sql", "utf8"));
const { default: catalog } = await import("../dist/server/catalog.mjs");
const app = createApp({
  db: sqliteD1(database),
  catalog,
  readAsset: fileAssets("dist/client"),
});
const port = Number(process.env.PORT || 8789);
http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 2100000) {
          res.writeHead(413);
          res.end();
          return;
        }
        chunks.push(chunk);
      }
      const request = new Request("http://" + req.headers.host + req.url, {
        method: req.method,
        headers: req.headers,
        body: ["GET", "HEAD"].includes(req.method)
          ? undefined
          : Buffer.concat(chunks),
      });
      const response = await app.fetch(request);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(500);
      res.end("Home Vibe request failed.");
    }
  })
  .listen(port, "0.0.0.0", () =>
    console.log("Home Vibe listening on port " + port),
  );
