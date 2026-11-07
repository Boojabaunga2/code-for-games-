# Ghost Grind: Half-Pipe Havoc — Android Home Vibe

All six skaters ride together in ONE shared continuous U-shaped half-pipe. The approved camera looks into the half-pipe, with large foreground riders, smaller background riders, player markers, a 01:30 timer and six portrait score pills. There is one wooden surface with a flat middle and curved walls on both ends, with gravity, momentum, aerial re-entry, steering across the ramp, and soft bumps between living skaters.

Five 90-second rounds. Each round's lowest-scoring living skater becomes a playable ghost. Exactly one living champion remains after round five. Ghosts keep skating for style points and can send short slowing gusts; they never re-enter elimination rankings.

## Install the half-pipe game pack

Download Ghost-Grind-Approved-Arena-Home-Vibe.zip and leave it compressed. On the Android Home Vibe tablet open Settings / Console settings → Manage games (ADMIN) → Add a game from ZIP. Select the ZIP and open the new Approved Arena entry. Connect six phones through Connect Players on the same Wi-Fi. A new Android or phone APK is not required. The earlier street-course ZIP is a different imported entry; choose the new Half-Pipe game.

The import uses the existing ArcadiumTablet.inputs bridge and publishes under its assigned installed UUID. Older launchers may show their standard imported-game icon; the new illustrated half-pipe cover appears inside the game. The source integration adds the cover to catalogue entry 50 for the next bundled build (0.8.0, code 12). All 49 earlier entries are preserved.

## Ride the ramp

- Hold A (or ↓) when descending and through the flat to pump. Release on the uphill. This adds speed on the downward pass; gravity carries you up the opposite wall. Enough momentum launches an aerial above the coping. Tap A near the upper wall for a small pop bonus.
- Airborne: B kickflip, X heelflip, Y 360 spin, L indy grab, R melon grab. Chain different tricks for a multiplier. Only completed, landed combos bank points. Late unfinished tricks bail and lose the pending combo; repeated tricks earn less. Unlanded points disappear at the buzzer.
- ←/→ moves across the width of the same ramp so you can choose your line. Living skaters can softly bump each other. B brakes while on the wood.
- Ghosts: ↓ pumps; A haunts; L/R selects a living rival. Gusts last 1.6 seconds with a five-second cooldown, reduce pumping temporarily and never force a crash. Ghosts pass through riders and continue landing style points.

All six phones must connect to start and remain connected. Disconnects freeze timer and simulation, reconnecting resumes a running match but preserves a deliberate tablet pause. Tablet pause/help, interruption recovery, exits and rematches are available. START starts when everyone is ready or advances results after the first three seconds. Free play needs no accounts, payments or official rewards.

Ties: best landed combo, landed combo count, previous-round score total, then the announced rotating seat order. One living loser is selected per round.

## Source and evidence

engine.js owns deterministic shared-ramp physics and rules. game.js renders the one arena and uses the existing native bridge; index.html and style.css are the local UI. All artwork is bundled. The sprite atlas is transparent; the stadium backdrop and half-pipe cover are original image_gen assets. The arena is an illustrated perspective stage derived from the approved mockup, with the original baked riders and interface removed. Live players are projected from the separate continuous U-ramp simulation. Ground and airborne sprite poses, board flips and yaw spins animate at runtime; these are not fully rigged 3D models. Six canonical colours: red, blue, green, yellow, pink, white.

Rules tests verify continuous geometry, gravity reversal, pumping and launch from both walls, landed scoring/bails, shared-depth steering/bumps, ghosts, reconnect/manual pause, and a full accelerated 450-second five-round match. Browser tests use six sessions against the actual Java Home Vibe server, real phone pointer input, the production ZIP importer and assigned UUID, one shared canvas, responsive layouts and bounded phone previews.

Run `node home-vibe-tablet/tests/ghost-grind-engine.cjs` in the source repository or extracted game-source archive. Browser harness tests require the main repository's Java modules and pinned Gson plus Chromium/Playwright. Physical Android/iPhone Wi-Fi play remains unverified. Any included video is actual browser gameplay with automated six-phone inputs, not physical-device footage.

## Approved layout update

The user approved the mockup in design-reference/ghost-grind/approved-mockup.png before this presentation rebuild. The game includes a clean environment plate and two transparent pose atlases; the game does not replay the mockup as a static screenshot. Timer, rounds, six scores, ghost status, player positions and tricks are live. Assets finish loading before the start button or a phone START can launch the game. Landscape gameplay fits the viewport; smaller portrait hosts retain all six score entries.
