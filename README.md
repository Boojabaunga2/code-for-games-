# ARCADIUM / SPORDLE

Six minds. One secret. One last genius. A six-seat speed word race, private Mini Vibe boards and keyboards, original genius characters, ghost eliminations and physical-coin comebacks.

## Install and start — use your current Mini Vibe app

1. Download **ARCADIUM_SPORDLE_V1.zip** and extract the **entire ZIP** into a folder you will keep. Do not run from inside the ZIP.
2. Close your current Arcadium **server console window**, not just its browser tab.
3. Open **ARCADIUM_SPORDLE_V1/START_SPORDLE.py** with your installed Python **3.9 or newer**, including Tkinter (the Python installation that runs your OS). If needed, right-click → Open with → Python.
4. In the folder picker, select your existing **Arcadium_OS_COMPACT** folder: the folder containing **arcadium_server.py**, **arcadium_game_bridge.py**, **universal_input_routes.py** and **data/arcadium.json**. Select the OS folder, not the extracted SPORDLE folder, its games folder or its parent.
5. The launcher installs the game and its branded carousel entry, starts your original server on **8787** with the generic live-game broker attached in memory, and opens SPORDLE. Use your **existing shared Mini Vibe app and pairing**. **No APK is included or required.**

**Use START_SPORDLE.py for this game.** Old startup shortcuts are unchanged and do not automatically load the extra routing. This launcher can also run the other installed Arcadium games. Haunt & Seek's descriptor is recognized if that game is already installed. It does not install Haunt & Seek itself.

Only `games/spordle/` and SPORDLE's entry in `data/arcadium.json` are written. Existing own game/catalogue files are backed up under `arcadium_backups/spordle_*`. Existing server, shared bridge, native receiver, pairing, Home, other games and startup shortcuts are preserved. No compiled executable, installer, shell script, dependency download or protection exclusion is used. The shared `native-input.js` is byte-for-byte identical to Haunt & Seek. The host adds declarative allowed touch keys and optional scoped frame tokens; old descriptors keep their behavior.

If the launcher reports a missing platform file, choose the correct shared-controller OS installation. It deliberately does not rewrite an incompatible server. If port 8787 is already occupied, close that server and retry; the launcher does not kill processes.

## Join and play

Press **A** on each Mini Vibe in the lounge to join its color. Unjoined seats are visibly **CPU**, and the PC can select all six humans. Press START from a joined seat, or START THE RACE on the PC. Join before starting; CPU seats do not silently convert to humans mid-match.

Everyone solves the **same five-letter secret word**, with **six valid guesses** and **120 active seconds**. Green means right letter/right place; gold means right letter/wrong place; gray means absent. Duplicate-letter scoring respects the answer's actual letter count. Invalid/short words do not cost a guess. The included curated offline vocabulary is authoritative; no internet lookup interrupts the race. The small answer deck has no repeated word within a match.

Your board, draft, keyboard colors and messages stay on your personal Mini Vibe. The main display shows only guess counts, completion, timing, standings and character reactions during play. It reveals the answer only after the race closes. Device pages receive only their selected color's dashboard. This is a trusted local party setup using the existing color assignment, not an account-authenticated or anti-cheat system; anyone deliberately choosing another color can request that seat.

### Controls

- **Hold D-pad:** select letters continuously, with an initial repeat delay. Press another direction to change direction. **Release stops.** Missing native heartbeat expires after 650 ms.
- **A:** choose the highlighted letter/key. **B or L shoulder:** erase. **R shoulder:** submit.
- Touch the letters, ENTER and erase key directly on the Mini Vibe if preferred.
- **START:** pause/resume. Pausing freezes the countdown, race and challenges; inputs cannot edit a paused board. Losing PC focus pauses the match; use START or RESUME to continue.
- In a comeback offer: **A** challenges; **B** passes. During your physical Flip-Off: **A reports green**, **B reports red**. A submitted side is locked until the joint reveal.
- After the reveal, A from a human seat or CONTINUE on the PC advances. A tie starts another real flip. No automatic timer skips the physical challenge.
- PC: type letters for red, Backspace erases, Enter submits. Arrows select, Space selects the highlighted key. Six standard local gamepads are also supported.

The personalities are Dr. Rocket (red scientist/goggles), Checkmate (blue chess mastermind), Gizmo (green gadget inventor), Ada Numbers (yellow calculator prodigy), Lexica (pink letter wizard) and Prof. Scatter (white professor/chalk/mismatched shoes). Their accessories remain in ghost form.

## Elimination and comebacks

The slowest finisher becomes a ghost. Solved players rank by elapsed solve time. Unsolved players rank below solvers, by their **best single guess's green count**, then **gold count**, then **earliest time reaching that best pattern**. Exact ties use a rotating seat priority: round one starts at blue, round two at green, and so on, wrapping around. The results list is the race ranking; a comeback may subsequently change which player is eliminated.

The newly eliminated player may spend their **one comeback per match**, immediately, to challenge the **second-to-last race finisher**. Both flip real physical Arcadium green/red coins and privately report the side facing up on their own Mini Vibes. Neither side is exposed to the other device or the main screen before both submit. **Green beats red. Matching colors mean both flip again.** The challenger winning swaps their living/ghost status with the opponent; losing leaves them eliminated. The chance is consumed when the challenge starts, even if several matching flips are needed.

An earlier ghost cannot initiate a challenge in a later round. The final loser can challenge the winner if their chance is unused. Five eliminations leave one champion. Ghosts retain their character/accessories and watch the race; they cannot submit guesses or affect the running round.

**CPU seats never generate coin results.** If a CPU is eligible, the PC explicitly offers use/pass; the table operator must flip a physical coin for each CPU participant and enter the result. For an all-human match, use all six humans before starting.

**Decisions made for this build, not previously agreed rules:** 120-second deadline, six guesses, the unsolved/tie ranking above, immediate-only comeback eligibility and manual progression through physical challenges.

## Delivery checks and antivirus

See `VALIDATION.md` for the checks actually performed and their limitations. Keep Windows protection enabled. A build-machine scan cannot guarantee your PC will accept a download. If this package is flagged, leave it blocked; no renaming or re-zipping is presented as a safety fix.

`CHECKSUMS.json` records every distributed source/asset/document file. The launcher verifies it before installing. Source, original artwork, tests and reproducible packaging are published with the build. There is no security software exclusion and no new APK.

To uninstall, close the server, remove only the SPORDLE catalogue entry and `games/spordle` folder if desired, then start your original OS normally. Do not restore an old whole-catalogue backup over later unrelated changes. The old server's original routing returns because its source was never patched.
