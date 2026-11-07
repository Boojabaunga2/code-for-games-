# ARCADIUM: PROJECT GHOST — ZERO TRUST (v2 rebuild)

Six players on one 1920x1080 screen. Each player cracks their own number codes. An animated
bank-heist scene on top of that shows every keypress, solve, miss, ability and ghost power.

## Files

| Path | What it is |
|---|---|
| `dist/project-ghost-zero-trust.html` | **The game.** One self-contained file with all art, fonts and code embedded. Runs in Chrome or Arcadium OS, or inside Electron. Pure ASCII. |
| `electron/` | Electron shell (`main.js`, `preload.js`, `hid_router.js`, `package.json`, plus a copy of the game as `game.html`). |
| `relay/pg_relay.py` | Mini Vibe relay. Plain Python 3 with no extra installs, port 8786. It does not touch your 8784 Multi-Vibe server. |
| `src/` | Game source. `core.js` = rules, `input.js` = devices, `scene.js` + `sprites.js` = animation, `app.js` = lobby/HUD. `orig_*.js` are copied word-for-word from the original `game.html`: SKYNET voice, audio and the node table. |
| `assets/` | Art as separate files: 5 rooms, props, effects, safes, UI icons, ghost-power icons, card portraits, splash. |
| `build.py` | Rebuilds `dist/` from `src/` + `assets/`, checks every script with `node --check`, and copies the result into `electron/game.html`. |
| `tests/` | `core_test.js` (rules), `hid_test.js` (USB router with fake hardware), `e2e_shots.js`, `rooms_shots.js` and `vibe_test.js` (headless browser). |

## Launch

**Chrome / Arcadium OS:** open `dist/project-ghost-zero-trust.html`. Press F11 for full screen. The
Arcadium splash shows while the art loads, then the Agent Lobby opens.

**Electron (Windows):**
```
cd electron
npm install
npm start            (full screen)   |   npm run windowed
npm run build-win    (portable .exe via electron-builder)
```

## Controls (three input types per seat; turn on any combination in the lobby)

1. **USB 10-Key.** Uses your existing `arcadium-keypads.lua` LuaMacros tagger, unchanged. Pad 1 is plain,
   and pads 2–6 send F13–F17 just before each key. The default is pad N → seat N. To change it, click
   **ASSIGN** on a seat and press any key on the pad you want for that seat. The choice is saved.
   Keys: 0–9, Enter, Backspace (delete), `.`/Del/`-` (clear). A held key counts once.
2. **Touch Keypad.** Tap your player tab above the keypad, or your player panel, to *arm* your seat,
   then type. Only one seat is armed at a time and it is highlighted in white. It releases itself
   after 12 s idle so the next player can't type into it by accident.
3. **Mini Vibe.** Run `python relay/pg_relay.py` on the game PC. Each handheld opens
   `http://<game-pc-ip>:8786/pg` and taps its seat. In the lobby, switch MINI VIBE RELAY to ON and
   tick "Mini Vibe" on those seats. The handheld shows its own code and entry. A second device can't
   take a seat that is already claimed.

In the lobby, every seat shows its assigned pad, whether it has been seen, and the last test key and
which device sent it. Pressing ENTER on a seat's device readies that seat.
Dev only: **Alt+1…6** sends the plain keyboard to a seat, so one person can test all six; Alt+0 resets.
**Ctrl+M** mutes. **Shift+Esc** returns to the lobby.

## Rules (from the original `game.html`)

- Each seat gets its own code: 4 digits, growing to 5/6/7 after 5/15/30 solves in a round. You have 8 s per code.
- Points: 4 digits $300, 5 digits $500, 6 digits $800, 7 digits $1000. Solving in under 2.5 s adds $100,
  and every 3rd solve in a row adds $250. A wrong entry or timeout costs $150; a Phase Shift blocks that penalty.
- Cull every 3:00 (lobby: 1/2/3 min). The lowest score becomes a ghost. When two are left: **Final Duel in the Vault**.
- SKYNET security nodes (original 8-node table) take damage from solves. At aggro/critical they hit
  back on a human solver (scramble, blackout, keypad freeze, drain), and they rage at 0 HP.
- **Ability codes** (3 digits = command; 3rd digit = target player 1–6, 0 = random). Any player can use any code,
  3 uses per game. Each use loads a fresh code.
  `17x` System Override · `210` Phase Shift · `38x` Data Leach · `44x` Signal Jam · `55x` Phantom Shift · `690` Safeguard
- **Ghost powers** `81x` System Glitch · `82x` False Signal · `83x` Data Corruption. These now work **alive or eliminated**,
  with the original limits: 1 per round, and never the same target twice in a row.

### Changes from the original, all deliberate

| | Original behaviour | Now |
|---|---|---|
| Multi-player | Only the first picked seat was human; the rest became AI | All 6 seats are human (or bot/empty, per seat) |
| Packets starting 17/21/38/44/55/69 | Input locked at 3 digits and fired an ability | 3 digits + ENTER = command, 4–7 = code attempt |
| Electron | Page called `GhostCodeNative.onKey` (missing) and crashed; numpads never opened | Bridge names match; tested in Electron |
| Ghost powers 81–83 | Could never fire: blocked by the ENTER handler and `spectatorPhase` gate; 81 set a flag nothing read; effects hit seat 1 | Fire alive or dead and hit the chosen target |
| Signal Jam 44 | Set a flag nothing ever checked | Target's next ability fizzles |
| Safeguard/Phase vs self-abilities | A random player's shield could cancel *your* 21/69 | Defences only stop abilities aimed at the defender |
| 38 Data Leach | "Peek" at a code already visible to everyone | Blanks the target's code for 3 s (your choice) |
| 55 Phantom Shift | No limit beyond 3 uses | Once per game (your balance rule) |
| 7-digit codes | Scored $300 on the main path | $1000 (the original's multi-player table) |
| Final duel | Kept the previous room | Moves to the Vault Chamber with a 4 s transition |

Removed from this version: the ghost-credit shop (a one-player touch panel), the trash-talk panel, and the
unused Firebase stub. Ghosts now use 81/82/83 instead.

## Known limitations (honest)

- **Electron raw-HID on Windows:** Windows keeps keyboard-type USB devices to itself, so `node-hid` usually
  can't read numpads there. The Electron HID router (identity-based, saved, key-down only,
  hot-plug) is tested with simulated hardware only and is meant for Linux/macOS. **On Windows, use the LuaMacros
  tagger**; it works the same in Chrome, Arcadium OS and Electron.
- LuaMacros routing hasn't been tested on real pads here. The tests send the same F13–F17 tag key + numpad key
  sequence. Tag window: 250 ms (`Input.tagWindow`).
- Two identical HID pads without serial numbers are told apart by USB port path. Plugging one into a
  different port can swap their seats; use ASSIGN to fix it.
- The Mini Vibe relay is new and runs on its own port. It is not wired into your 8784 server (I don't have that file).
  Tested with two simulated handheld browsers, not real RG Rotate devices.
- Arcadium splash: cut from your screenshot of the blue splash (~570 px). Send the original file and it will be
  swapped in at full resolution.
- The operative sprites are hand-built vector characters (canvas) based on the six cards. The rooms, props, safes,
  effects and icons are cut from your sprite sheet. The sheet's monkey characters are not used.
- SKYNET voice uses the browser's speech voices, the same as the original. Some kiosk browsers have none; the text still shows on the ticker.
