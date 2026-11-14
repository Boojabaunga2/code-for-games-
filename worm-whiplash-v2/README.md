# ARCADIUM · WORM WHIPLASH V2

Gameplay upgrade for the existing main PC OS and six shared Mini Vibes. Colourful illustrated worms, a backyard arena and real rigid-body fort collapse. The worm itself stretches and launches; there is no slingshot.

## Install

1. Extract the entire `ARCADIUM_WORM_WHIPLASH_V2.zip`.
2. Close the existing Arcadium server console.
3. Double-click `START_INSTALL.cmd`.
4. Select the existing `Arcadium_OS_COMPACT` folder containing `arcadium_server.py`.

The installer adds one game and its square cover. It preserves Home, other games, pairing and the original server. It adds an owned, removable hook to the existing bridge so both normal OS startup and the included launcher load the controller routes on port **8787**. No extra game listener or APK update. Original affected files are backed up before changes. Unknown bridge layouts stop before installation.

For a selective rollback, close the server and run `RESTORE_WORM_WHIPLASH.py`; select the installed OS and the generated backup. Restore removes this game's entry/files/hook while preserving later unrelated catalogue and bridge edits. It refuses to overwrite later edits to this game's own files.

## Play

Six simultaneous independent arenas use the same fort layout. Each player has three launches per round, three rounds, and up to 90 seconds per round. Damage, destroyed blocks and the three gold fort cores award points. Hit red explosive barrels to set off chain reactions. Striped weak supports break more easily; floating gold skill targets pay 1,600 base points. Consecutive breaks within 1.5 seconds add up to a 2.5× destruction multiplier. Falling blocks cause further collision damage. Highest cumulative destruction score wins; current-round cores then canonical seat order break exact ties. Wood, glass and stone have different weight and durability. Practice has unlimited launches; its scores reset when a match begins.

Hold **A**, pull with the **D-pad**, then **release A**. Left/right change power without changing angle; Up lofts the arc and Down flattens it without changing power. A complete dotted trajectory and gold predicted-contact reticle guide the shot. The preview uses the same fixed-step gravity and drag as the real projectile; the contact marker uses expanded block bounds and moving structures may change the eventual hit. Press **B once per flight** near the structure:

| Worm | Ability |
|---|---|
| Red | Blast: concentrated explosion |
| Blue | Split: three separate flying worms |
| Green | Acid: timed corrosion spreads to nearby blocks |
| Yellow | Ricochet: boosted flight and three extra damaging bounces |
| Pink | Grapple: tether a horizontal beam and yank it loose |
| White | Shockwave: two delayed structural pulses |

In practice B rebuilds your own fort when idle. START pauses. Held input expiry cancels an unfinished pull without launching. PC: drag the worm directly, click while in flight for B, or select seat 1–6 and hold Space + arrows; release Space to launch. Enter starts/pauses. CPU demo is available from the lobby.

Reloads are quicker after contact and misses retire sooner. A shot score and personal best appear in each arena. Personal bests are stored on the PC browser for each colour and survive match reset/reload; clearing browser storage clears them. Sound unlocks on the first real interaction and can be toggled in the header. Original procedural launch, impact, glass, explosion and reward effects accompany the larger debris bursts and brief per-arena shake.

The Mini page renders only its own authoritative PC snapshot. It has no independent physics simulation and no rival dashboard. Its touch screen also supports pulling the worm directly and the shared A/B/D-pad layout. Use the existing shared controller app.

## Scope and verification

This is a 2D rigid-body game with shaded canvas scenery, illustrated character art and textured blocks. It is not a full 3D engine. Source, bundled offline Matter.js, art, metadata, bridge adapters, installer, verifier and checksums are included. The public gameplay video is recorded from the running browser build.

Automated checks exercise all six abilities, three full CPU rounds, score ranking, private controller state, native held/released/expired input, touch input, reconnect, pause, 720p layout, owner handoff, normal startup, repeat installation and selective restore. Fixtures represent the documented existing bridge contract. Physical Mini Vibes, the owner's exact installed OS/carousel, Wi-Fi behaviour and recipient antivirus acceptance still require a live playtest. See `VALIDATION.md`.
