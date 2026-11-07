# Ghost Grind — approved arena build

Implements the visual mockup the user approved: a camera looking into one large half-pipe, six live skaters with player markers, large foreground/smaller background characters, a 01:30 timer and a compact six-portrait score bar. Ground and aerial poses, board flips and yaw spins animate while actual shared-ramp physics controls movement, pumping, landing, bumps and ghosts.

The stage is illustrated perspective artwork derived from the approved reference, with the original baked riders and interface removed. Actual scores, timer, player movement and ghost state are live. Riders use transparent sprite atlases; these are not fully rigged 3D character models.

Download Ghost-Grind-Approved-Arena-Home-Vibe.zip and leave it compressed. On the Android Home Vibe tablet: Settings / Console settings → Manage games (ADMIN) → Add a game from ZIP. Select the ZIP and open the new Approved Arena entry. Join all six phones through Connect Players on the same Wi-Fi. No replacement tablet APK or phone APK is required. Older launchers show their standard imported-game icon; the illustrated cover appears inside the game.

Controls: hold A/↓ while descending and through the flat to pump; in air B kickflip, X heelflip, Y 360 spin, L indy grab, R melon grab. Left/right steers across the shared ramp. B brakes on the wood. Ghosts use ↓ to pump, A to haunt and L/R to target. Five 90-second rounds; one lowest-scoring living player becomes a ghost per round and one champion survives round five.

Source integration: https://github.com/Boojabaunga2/Arcadium-Home-OS/pull/36
The next bundled source version is 0.8.0/code 12; all 49 older catalogue entries remain preserved and Ghost Grind remains entry 50.

Validation: full accelerated 450-second rules simulation; six actual Java-backed phone browser sessions; real pump pointer input and score isolation; one shared canvas; transparent air artwork; six portrait cards and timer format; full-screen landscape fit and small-screen five-digit scores; ghost/cooldown and reconnect/manual pause; production ZIP import and assigned UUID publishing; bounded phone preview frames. Physical Android/iPhone Wi-Fi play remains unverified.

The preview is actual normal-speed browser gameplay with automated six-phone inputs, cut between first-round play, natural results and round-two ghost mode. Scores and clocks are not staged. It is not physical Android footage.
