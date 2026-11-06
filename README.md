# ARCADIUM / HAUNT & SEEK V2 — SCARCE GHOSTS + STUN GUN

Six hunters. Five castles. One champion. Every castle has **nine connected rooms**—45 rooms over the five hunts. Each hunt lasts 90 active seconds. The lowest round score becomes a Ghost Captain and keeps playing through the remaining castles. Five eliminations leave one champion.

## Start on the PC — no new APK

1. Extract the **entire ZIP** into a folder you will keep. Keep the launcher, host module, checksums and games together.
2. Close the existing Arcadium **server console window**, not only the browser. The launcher will explain this if port 8787 is already occupied; it will not kill processes.
3. In the extracted **ARCADIUM_HAUNT_AND_SEEK_V2** folder, double-click **START_HAUNT_SEEK.py**. On the first run, select your existing **Arcadium_OS_COMPACT** folder. Use the Python 3.9+ with Tkinter that already runs your Arcadium OS.
4. Your existing Arcadium server starts with the shared live-game host enabled, and the game opens. Your current shared Mini Vibe app switches to your personal tracker. **Do not install another APK.**

Use this launcher when playing Haunt & Seek. It can also run your other Arcadium games normally. It remembers your selected OS folder. A desktop shortcut to this launcher is optional. Your old OS shortcut remains unchanged; it does not load this additional live-game host, so use the included launcher for the Mini Vibe trackers. No Windows startup settings are changed.

The launcher copies only games/haunt-and-seek and updates only its own catalogue entry. Overwritten own game/data files are backed up under arcadium_backups/haunt_seek_*. The existing server, bridge, shared input receiver, Home, pairing and every other game file remain unchanged. Extra routing is attached **in memory**, then the original server runs normally on its existing port 8787. There is no extra listener, dependency download, compiled installer, shell launcher, source-code patch or security exclusion.

The shared host reads only declarative arcadium-live.json descriptors. It does not load server-side code from game folders. Future compatible games can use the same host and shared controller without a game-specific APK.

## Hunters

A on each Mini Vibe joins your color in the lobby. Empty seats are explicitly marked CPU; click a seat on PC to switch it. START from a ready human launches, or use ENTER MOONVEIL MANOR. No silent lobby timeout forces a start. Join before the match; CPU seats do not silently hand over collected scores midway. A late controller sees a clear CPU-seat / join-next-match message.

- Hold D-pad to move in the direction shown on screen. Release stops immediately. Walls, furniture and closed doors block hunters.
- Hold A to charge a capture lock on a nearby ghost with a clear line of sight. Stay within range. Releasing A or losing the target resets the lock. Common ghosts take 0.9 seconds and score 100; rare royal ghosts take 1.3 seconds and score 250.
- **R shoulder fires a stun gun** toward the nearest living rival in front of you, within 5.5 world units and with a clear line of sight. Face the rival by moving toward them, then fire. A hit freezes movement, capture, radar and gun use for **1.5 seconds**, breaks their capture lock, then gives them **four seconds of stun immunity after recovery**. Every shot, including a miss, has an **eight-second recharge**. Captains cannot be stunned.
- **Steal the capture:** hold A while firing near the rival's target ghost. If the ghost is within your own capture range and clear line of sight, you inherit **60% of their current lock progress, capped at 60%**, and must finish the lock to earn its points. You never steal points or ghosts already collected. At longer range, the shot only breaks their lock so you can race for the ghost.
- B sends a three-second radar pulse, recharging every six seconds. It reveals more of the castle and distinguishes pink decoys. A pulse also helps you see through tracker jamming.
- The Mini Vibe shows your radar, room map, signal strength, capture gauge, score, collection count, clock and cooldown. Optional tracker sounds can be enabled with the music button.
- START pauses/resumes. A missing held-input heartbeat stops control after 650ms; it never becomes a movement latch. Disconnected human seats do not silently turn into CPUs.

Ghosts become visible on the main screen near a hunter or during a pulse. Your private tracker detects farther and through walls, so the gadget matters. Decoys look like ordinary ghosts until a pulse exposes them. Gold spirits are worth more. Ghosts drift around their rooms. **Normal-ghost budgets are 12, 10, 8, 6 and 4** as hunters are eliminated, replacing the old 30–42 ghosts. A collected normal ghost respawns after **6–8 active seconds**, in a room with fewer normal ghosts. Captain decoys remain temporary extra false signals. Scarcity and rival stuns make captures contested rather than an endless nearby supply. All surviving hunters begin the next castle with a new round score; match totals remain for tie breaks and the final board.

## Ghost Captains

Losing a round changes your personal screen into a command board. You remain a captain through every later castle and cannot be eliminated again.

- D-pad moves your roaming spectral captain through walls. Your current room is highlighted on your command map.
- L1 / R1 chooses a power. B cycles the living hunter target. A deploys.
- **Decoy:** 15 energy, 3.5-second cooldown. A fake signal lasts 18 seconds. Capturing it wastes a lock and gives no points. A hunter's pulse exposes it.
- **Door Slam:** 25 energy, 7-second cooldown. A clear door in your selected room closes for eight seconds. An occupied doorway is not slammed onto a hunter. Choose another room if all its doors are occupied/closed.
- **Jam Tracker:** 30 energy, 8-second cooldown. Your selected hunter's tracker is scrambled for six seconds. Movement and capture still work, and a pulse gives temporary clarity. The hunter receives four more seconds of jam protection to prevent an endless chain.
- Energy regenerates at six per active second, up to 100. Powers, energy, doors, timers and movement all freeze on pause.

## Castles and elimination

Moonveil Manor, Briarwatch Keep, Frostglass Citadel, Embercrown Castle and Eclipse Palace each have nine named rooms, different corridor layouts and lighting. The engine checks that every layout is connected. Each castle's room art is drawn as part of the real playable map; the earlier concept image is not used as a fake gameplay screen.

Lowest **current-round score** loses. Ties use fewer captures, lower match total, then later last capture. If those are exactly equal, a seeded Castle Curse draw selects the captain and the results screen explicitly says so. Results stay up for eight seconds; START/Next Castle can skip after three. The final remaining hunter wins after castle five; eliminated players still receive their final place and haunting statistics.

## PC and local controls

WASD/arrows move P1; hold Space captures. E pulses (captains: changes target). R fires the hunter stun gun. Q/R chooses captain power. Enter starts/pauses; Escape pauses. Six local gamepads use D-pad/stick, A, B, shoulders and START. Sound can be toggled on PC. Losing PC focus pauses a live hunt; START resumes. Help pauses play and shows the controls.

## Delivery and verification

This is source/web-game software. The optional Windows Python launcher must be associated with your installed Python; if Windows opens a chooser, choose Python. It downloads no software. Keep Windows protection enabled and leave any flagged download blocked; a build-runner scan is not a guarantee of recipient acceptance.

V2 adds 9 targeted scarcity/stun tests to the 13 original engine tests, plus a fresh six-screen native-input/capture-theft browser check and extracted-ZIP installation checks. See VALIDATION.md and the private review records for actual tests and their limits. Physical Mini Vibe devices, the venue Wi-Fi and the recipient Windows installation are not available in the build environment. No manual Microsoft malware-review verdict is claimed.

To remove the game, close this host, use Admin to remove only Haunt & Seek, and remove only its game folder if desired. Starting your original server restores its original routing automatically because no server source was patched. Do not restore an old whole-catalogue backup over later unrelated edits.

## V2 delivery

Complete filename: **ARCADIUM_HAUNT_AND_SEEK_V2.zip**. Extract all files, open **ARCADIUM_HAUNT_AND_SEEK_V2/START_HAUNT_SEEK.py**, and select your existing **Arcadium_OS_COMPACT** folder containing `arcadium_server.py`, `arcadium_game_bridge.py`, `universal_input_routes.py` and `data/arcadium.json`. No new APK. This update preserves the five castles, all 45 rooms, artwork, captain powers, pairing and original startup shortcuts. Use the included launcher for the generic live-game host; the updated broker also recognizes SPORDLE's optional declared keys when SPORDLE is installed.
