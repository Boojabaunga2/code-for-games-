ARCADIUM TWO-GAME BROWSER IMPORT V2
1. Extract this ZIP and start Arcadium using your usual launcher.
2. Open OPEN_GAME_IMPORT.html in desktop Edge or Chrome on your Arcadium PC.
3. Click Choose OS folder & import and choose Arcadium_OS_COMPACT. Both games are selected.
4. Wait for copying to finish, then click CHECK RUNNING ARCADIUM below the progress log.
5. The visible check tab verifies both game hosts and the native controller feed. Return to the importer for Installed and the game links.

This replaces V1's hidden iframe connection check. It does not change your bridge, server, controller APK, pairing files or Windows settings. No downloaded CMD/EXE/Python launcher is used.
The importer saves backups, stages web assets, checks your existing shared host, and updates only the selected catalogue entries after success. Errors restore staged files.
If the check tab reports HTTP 404 for /arcadium-live/.../status, close the current Arcadium server console and reopen Arcadium through your usual existing launcher, then retry. The supplied bridge already contains Pop-A-Shot and Ruin Runners shared-host adapter hooks; an older running process may not have loaded them. This package does not install or replace those adapters.
If HTTP 404 persists, keep the exact message: it identifies the missing route. A 404 after rollback alone is not evidence that the host adapter is missing because descriptors may have been restored/removed.
Restore: click Restore backup and paste the backup path printed during import. Later changed game files stop restoration for manual review.
Do not close the importer while it is copying or waiting for the check. Use Cancel import & restore if needed.
Source, web assets and SHA-256 hashes are included. The visible-tab browser test passed with the supplied bridge constructor plus reference versions of its existing adapters. Other game handlers were stubs; this is not a full copy of your Windows OS. Physical Mini Vibes and the Windows folder picker require a live test.
