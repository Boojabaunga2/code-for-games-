import { readFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
export const contentType = (name) =>
  ({
    html: "text/html; charset=utf-8",
    js: "text/javascript; charset=utf-8",
    css: "text/css; charset=utf-8",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    woff2: "font/woff2",
    mp4: "video/mp4",
  })[name.split(".").at(-1)] || "application/octet-stream";
export function fileAssets(directory) {
  const compressed = readFile(
    path.join(directory, "asset-compression.json"),
    "utf8",
  )
    .then(JSON.parse)
    .catch(() => ({}));
  const aliases = readFile(path.join(directory, "asset-aliases.json"), "utf8")
    .then(JSON.parse)
    .catch(() => ({}));
  return async (name) => {
    if (name.split("/").includes("..") || name.includes("\\")) return null;
    try {
      const canonical = (await aliases)[name] || name;
      const packed = (await compressed)[canonical];
      const bytes = await readFile(path.join(directory, packed || canonical));
      return {
        bytes: new Uint8Array(packed ? gunzipSync(bytes) : bytes),
        type: contentType(name),
      };
    } catch {
      return null;
    }
  };
}
