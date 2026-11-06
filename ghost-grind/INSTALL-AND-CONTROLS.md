# Ghost Grind — Android Home Vibe

Six phone-controlled skateboarders. Five rounds of 90 seconds each. Lowest-scoring living skater becomes a ghost at the end of each round. One living champion remains after round five. Existing ghosts cannot be eliminated again; they stay in play for ghost style points and limited gust powers.

## Install without replacing the Android app

Keep the downloaded Ghost-Grind-Home-Vibe.zip compressed. On the Android Home Vibe tablet, open Settings / Console settings, then Manage games (ADMIN), Add a game from ZIP, and choose the file. Give it the name Ghost Grind if prompted. Open the imported game and connect six phones using Home Vibe's Connect Players screen. All phones and tablet must share Wi-Fi. No phone APK, PC server or Mini Vibe is required.

The game reads the tablet's existing ArcadiumTablet.inputs bridge directly. Imported games receive a unique installed ID; the game publishes under that ID. This pack does not need a new Android installer or expanded GitHub workflow permissions. Older launcher versions may show the standard imported-game icon; the illustrated cover is inside the game. The source integration also adds the illustrated library card for a future bundled APK.

## Controls

Left brakes; right pushes. A ollies (ramps also launch automatically). In the air: B kickflip, X heelflip, Y 180 shuvit, L indy grab. Hold R over the glowing rail to grind. Different tricks build a multiplier; repeated tricks earn less. Only fully landed combos score. Landing before a flip completes loses that pending combo. Unlanded points vanish at the buzzer.

Ghosts: up jumps, A sends a 1.6-second slowing gust, L/R selects a living target. Gust cooldown is five seconds, cannot stack above the same short slowdown, and never forces a bail. Ghost style points do not re-enter survival rankings.

All six phones must be connected to start. Disconnection freezes the timer and simulation until all six reconnect. Tablet pause/help also freeze the match. Tablet interruption requires explicit resume. The tablet controls exits and rematches. Press START on a phone to start when everyone is connected; between rounds it can advance after the initial three-second result display.

Ties: lowest best landed combo, then fewest landed combos, then lowest score total from earlier rounds, then the announced rotating seat order. Exactly one living skater is eliminated each round.

## Source and validation

engine.js is the deterministic rules/physics module. game.js contains rendering and the existing native bridge integration; style.css and index.html are the local UI. All assets ship in the pack; no external CDNs, accounts or online services are used. Optional sounds are generated locally with Web Audio.

Cover and six-skater sprite atlas are original AI-generated production assets; sprites use real transparency. Canonical colours: red, blue, green, yellow, pink, white.

Run `node home-vibe-tablet/tests/ghost-grind-engine.cjs` from the source repository for the full 450-second accelerated simulation, land/bail/buzzer, ties, disconnects and ghost cooldown checks. Browser checks use actual Java Home Vibe transport and six browser phone sessions; these do not establish physical Android tablet/iPhone Wi-Fi verification.
