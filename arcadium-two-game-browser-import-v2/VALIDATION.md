# Validation

Passed Node importer tests: preserves 60 unrelated game entries, catalogue settings, root server and pairing file; installs selected assets; restores selected entries while preserving later unrelated entries; rolls back on missing host and injected file-write failure.

Passed both games' engine tests, including Worm Whiplash fish bowls and enhanced aiming/impact tests. Worm Whiplash Chromium regression passed: six live private canvases, native hold/release, expiry cancellation, abilities, touch input, reconnect, pause, handoff and saved best scores.

Ghostshot Chromium checks use the existing generic host and shared native-input reference fixture, with actual PC-rendered JPEGs for six seats. This is not the user's complete Windows OS. No new listener is included in the release.

The managed test browser blocks file:// navigation by administrator policy, so the local-file folder picker could not be exercised here. The importer uses desktop Edge/Chrome File System Access APIs. Physical controllers, the Windows folder picker and the installed host require a live test. The import checks the installed host before committing the catalogue and restores staged files on failure.

No claim of Microsoft publisher signing, Smart App Control approval, or completed identity validation is made. No Windows protection changes are part of this package.

## V2 visible connection check

Replaced the hidden iframe with a tab opened by an explicit button click. The check page is served through the supplied bridge's existing /arcadium-games/<id>/ path. Same-origin fetches there verify both live-host descriptors and native input. Messages must match the expected loopback origin, the opened window and a random nonce. No catalogue commit occurs until this check succeeds. No timeout runs while waiting for the user to click the button. Copy progress and cancellation are visible.

The uploaded arcadium_game_bridge.py contains both persistent adapter hooks. An end-to-end Chromium test executed that exact bridge constructor with reference Pop-A-Shot/Ruin Runners adapter files and stubbed legacy game handlers. It passed the visible cross-origin tab check for both games, preserved 60 unrelated entries and the uploaded bridge bytes, and reported an injected HTTP 404 with rollback. The uploaded bridge itself is not distributed in this ZIP. Its adapter hook declarations do not prove which versions are installed or loaded in the user's current process.
