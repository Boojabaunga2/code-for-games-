GUMPY - ARCADIUM'S BINGO GONE BANANAS!
=====================================
Six players. Five elimination rounds. 75 characters. Ghosts. Total mayhem.
No physical cards, markers or dice: everything is on the big screen and the Multi-Vibes.


WHAT'S IN THIS FOLDER
---------------------
GUMPY_Arcadium.html      The game. Import it into Arcadium OS like your other games.
                         It is the main display AND the game server (it decides every
                         card, call, mark, power and GUMPY). All art is inside it.
GUMPY_MultiVibe.html     The player screen for each Multi-Vibe (RG Rotate, 720x720).
                         The add-on serves it to the handhelds. All art is inside it.
gumpy_8784_addon.py      Add-on for your Multi-Vibe 8784 server. Loads your server file
                         UNCHANGED and adds /gp/ routes. Same pattern as 3 Monkey Mayhem,
                         Dirty Deeds and Monkey Poker.
START_GUMPY.bat          One click: starts your 8784 server with the GUMPY add-on and
                         opens the big screen in Chrome.
GUMPY_characters.json    The 75-character manifest: ID, number, category, color, name,
                         quip, sprite file, reveal art, animation, sound hook, voice line.
assets\                  Every sprite as a separate file (characters, reveal art, host
                         poses, power icons, UI) + manifest.json saying where each was cut from.
TEST_REPORT.txt          What was tested, results, and what is NOT finished.
source_and_tests.zip     Source + automated tests (for future changes).


1. SET UP (ONCE)
----------------
1. Copy everything in this folder into the SAME folder as your Multi-Vibe 8784
   server file (the .py with "MultiVibe" or "8784" in its name).
2. Import GUMPY_Arcadium.html into Arcadium OS.


2. START A GAME
---------------
1. Close your 8784 server if it is running (only ONE program can own port 8784).
2. Double-click START_GUMPY.bat
   (or run:  python gumpy_8784_addon.py)
   The black window lists one address per player, e.g.
       PLAYER 1 Multi-Vibe:  http://192.168.1.50:8784/gp/vibe?player=1
   All your server's own pages keep working.
3. On each RG Rotate, open its player's address in Chrome. Tap once to go fullscreen.
   (Tip: "Add to Home screen" in Chrome makes it open fullscreen with no browser bar.)
4. On the PC: open GUMPY from Arcadium OS (or the window START_GUMPY.bat opened).
   PLAY WITH MULTI-VIBES > each seat turns green when its handheld connects > START GAME.

Seats: the first handheld to open player N owns seat N and keeps it across reconnects.
A second device asking for the same seat is refused. To move a seat to a new device:
lobby > RELEASE on that seat.
If a handheld drops (Wi-Fi, battery), just reopen the page: it gets its own card back.


3. HOW TO PLAY
--------------
Each round every player gets a brand-new 5x5 card (columns G U M P Y, FREE center).
GUMPY the robot host calls characters one at a time. If it's on your card, mark it.
Complete the round's pattern, then hit GUMPY! The game checks your card instantly.

  ROUND 1  CLASSIC GUMPY   any row, column or diagonal       6 players
  ROUND 2  BIG X           both diagonals                    5 players
  ROUND 3  FRAME JOB       the whole outside border          4 players
  ROUND 4  CROSSFIRE       center row + center column        3 players
  ROUND 5  FULL GUMPY      blackout: every square            2 players -> CHAMPION

After rounds 1-4 the lowest player GOES GHOST. Ghosts keep playing with ghost powers.
Ranking: round winner first, then pattern completion, then legit marks, then fewest
squares still needed, then the digital Arcadium decision coin. The round winner is
never eliminated. (If EVERY player left GUMPYs in the same moment, the slowest claimer
goes ghost.) The final always ends with one champion.

Points: pattern completion % each round, +50 for a GUMPY.
False GUMPY: 5-second claim lock and -2 energy.


4. MULTI-VIBE CONTROLS
----------------------
  D-PAD       move around your card
  A           mark the square
  X           jump to a called square you haven't marked yet
  B           open POWERS (B again = back)
  L / R       pick a power (shown next to the GUMPY button)
  Y or START  GUMPY!
  Touch       tap squares, POWERS, GUMPY!, power and target buttons

Squares: called-but-unmarked = glowing border; marked = big X in your color;
bonus mark (Steal / Wild / Freebie) = purple X + star; ghost-haunted = ghost cover;
banana-splatted = banana cover; FREE = gold star.

POWERS (earn 1 energy per mark):
  STEAL 4     bonus mark in your best line + swipe 2 energy from the leader (once/round)
  SWAP 2      swap two unmarked squares in one column
  FREEZE 3    an opponent can't mark for 4 seconds
  SHIELD 2    block the next attack on you
  WILD 3      mark any square in the column of the last call
  DOUBLE 2    your next 3 marks earn double energy
  PEEK 2      see the letters of the next 2 calls (only you see it)
  CHAOS 4     random chaos event for everyone
  REVERSE 3   the next attack on you bounces back at the sender
  BANANA BOMB 3  splat 3 squares on an opponent card for 5 seconds
Bonus marks can never fill your winning square: no instant wins.

GHOST POWERS (ghost energy refills 1 per call, 4 actions per round):
  HAUNT 1          hide one of a player's unmarked squares for 6 seconds
  POSSESS 2        swap two unmarked squares on a player's card
  POLTERGEIST 1    their next mark lands 1.5 seconds late
  PHANTOM SHIELD 1 protect a player from one attack
  GHOST STORM 3    random chaos event (once per round)
Ghost controls: UP/DOWN pick a power, LEFT/RIGHT (or L/R) pick a player, A fires.
Nothing a ghost does can remove a real mark or undo a verified GUMPY.
After any attack lands, that player is immune for 3 seconds (no pile-ons).

CHAOS EVENTS: Speed Round, Power Surge, Shuffle Storm, Banana Rain, Double Call, Freebie Frenzy.


5. BIG SCREEN KEYS (host)
-------------------------
  ENTER     start / skip the current wait / play again
  SPACE     pause / resume
  ESC       pause (in game) / back
  F9        HOST MENU: marking window (4, 5.5, 7, 9 s), turbo after 30 calls,
            sound, host voice, volume, bots for empty seats, server address,
            replay last match seed
  SHIFT+C   trigger a chaos event
If the PC or browser restarts mid-match: TITLE > RESUME MATCH.


6. TESTING WITHOUT SIX PEOPLE
-----------------------------
  SANDBOX (title screen, S)   the big screen plus six live Multi-Vibe screens on one PC.
                              Click a name above a handheld to switch it between BOT
                              and YOU; play the YOU ones with the mouse.
  DEV TEST MODE (title, D)    six simulated players play a whole match. + / - = speed.
  BOTS FOR EMPTY SEATS        (lobby or F9) a bot covers any seat with no handheld.


7. SWAPPING IN ART / SOUND
--------------------------
Character sprites are in assets\characters\G1.jpg ... Y75.jpg (cut from your
production sheets). Send me new art and I'll rebuild the two HTML files with it.
Sound hooks (call, call_G..call_Y, reveal, mark, wrong, power, ghost, near,
falseGumpy, gumpy, elimination, champion, chaos, freeze, banana, shield, turbo, coin)
currently play built-in synth sounds; real audio files can replace any of them.
The host voice uses the PC's built-in speech voice. Turn it off in F9 if you prefer.
