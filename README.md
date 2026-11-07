# Home Vibe browser host

This is the browser-hosted edition of **Android Home Vibe**. It is separate from Arcadium PC OS and Mini Vibe. The existing Android application is unchanged.

An Android tablet opens the host page in Chrome. Up to six Android/iPhone controllers open the room link in Chrome/Safari, choose a distinct colour, and play together. The hosted edition requires internet during play. The tablet tab runs the game; the server transports authenticated controls and private per-seat views. Closing the tablet tab pauses the connection, rather than moving the game to a server.

## Run on your own server

Requires Node 22.13+ (tested with Node 24) and the adjacent `home-vibe-tablet` directory from this repository.

```sh
cd home-vibe-web
npm ci
npm run build
npm test
npm start
```

Open the server's LAN address on port 8789 from the tablet and phones. A LAN deployment requires a separate computer/server; Chrome on an Android tablet cannot accept incoming network connections by itself. For internet hosting, run the Worker build with D1 and static assets, or put the Node server behind HTTPS. Never expose the Node port directly to the internet without TLS, request limits, and normal server operations.

## Hosting

`npm run build` emits `dist/server/index.js`, its ESM imports, and `dist/client`. The Worker expects a `DB` D1 binding and an `ASSETS` static-asset binding. Apply the checked-in schema migration before serving traffic. The Node adapter creates its SQLite database at first startup; database files are ignored. Durable room records expire after 24 hours without a host heartbeat and are cleaned in bounded batches when new rooms are created.

The Sites source mirror preserves this module alongside the original game assets. Its `.openai/hosting.json` identifies the specific Site; it is not part of the Android APK.

## Connection and privacy

- Six canonical seats: red, blue, green, yellow, pink, white.
- Owner-only cookie controls the game screen. Shareable QR codes include the room code, never the owner cookie.
- Each phone receives its own token; private game views use the authenticated seat rather than the requested player number.
- Monotonic input sequences reject stale packets. Missed heartbeats release held buttons after 1.5 seconds.
- A five-second host lease prevents two browser tabs from running one room simultaneously.
- A room refresh can reconnect controllers; game-engine state remains in the host tab, so reloading that tab restarts the current game.
- Signal Sprint retains five four-second rounds and private targets. Existing legacy relay interfaces are adapted at runtime; game engine source files remain unchanged.

## Verification and limits

Automated checks cover six-phone input, stale packets, disconnect release, room separation, host authority, concurrent host tabs, private poker views, stable Signal Sprint targets, What The Duck socket routing, browser URL rewriting, queued game activation, and all 50 catalogue launch/cover assets.

Physical Android Chrome and iPhone Safari playtests remain necessary, particularly latency and game-specific private screens. The managed environment lacks the Sites browser-control tool, so no browser QA or physical-device compatibility claim is made. Existing catalogue warnings/gates remain: a game requiring an unported host service is not silently enabled. This is a browser transport release, not certification that every game completes correctly on every device.

Game imports remain in the Android application; browser management currently hides/restores bundled games per room. Official competition, licensing, account ownership, payments, ViBUCKS and rewards remain unavailable until their actual backend services are connected. Free play stays unlimited.

Hosting access is separate from room privacy: an owner-private Sites deployment requires the owner's ChatGPT login and is not a guest phone launch. Guest controller access needs a public entry page (with individual rooms still protected by pairing codes and seat tokens), enabled explicitly by the owner.

## Staged releases and owner controls

The initial online lineup is 10,000 (dice), Ghost Grind (action), and What The Duck?! (funny). The other 47 covers remain visible in grey with Coming soon labels. Launch APIs and game-page routes reject unreleased games.

Visit `/admin`, or choose Owner controls from the landing page, and sign in with the ChatGPT account that owns this Site. Owner identity is bootstrapped against the secret `HOME_VIBE_OWNER_EMAIL` runtime value and then bound to the stable, dispatch-verified Site user ID when supplied. Sessions that supply only the dispatch-verified email remain restricted to the configured owner email; anonymous client identity headers are stripped by Sites. Room ownership grants no global release permission. Do not trust user-supplied identity headers on a self-hosted Node server; its owner panel is disabled without the Sites identity integration.

Select one or two new games and save to release them across every room. The panel can also take games offline; their cards return to Coming soon, and active sessions stop that game. Concurrent saves are checked against the release revision. Global release choices persist independently of individual room expiry. Existing service requirements still apply.

## Product direction

Home Vibe's core experience uses players' own Android or iPhone browsers. Mini Vibes are an optional dedicated-controller upgrade, reusing their physical controls and established main-OS capabilities. Home Vibe's Mini Vibe input connection and actual hardware/browser compatibility must be implemented and tested before advertising support. Casting or a supported wired video output can put the tablet's public game screen on a TV; private controller screens stay on each player's device.
