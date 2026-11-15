# Validation

Passed Node importer tests: preserves 60 unrelated game entries, catalogue settings, root server and pairing file; installs selected assets; restores selected entries while preserving later unrelated entries; rolls back on missing host and injected file-write failure.

Passed both games' engine tests, including Worm Whiplash fish bowls and enhanced aiming/impact tests. Worm Whiplash Chromium regression passed: six live private canvases, native hold/release, expiry cancellation, abilities, touch input, reconnect, pause, handoff and saved best scores.

Ghostshot Chromium checks use the existing generic host and shared native-input reference fixture, with actual PC-rendered JPEGs for six seats. This is not the user's complete Windows OS. No new listener is included in the release.

The managed test browser blocks file:// navigation by administrator policy, so the local-file folder picker could not be exercised here. The importer uses desktop Edge/Chrome File System Access APIs. Physical controllers, the Windows folder picker and the installed host require a live test. The import checks the installed host before committing the catalogue and restores staged files on failure.

No claim of Microsoft publisher signing, Smart App Control approval, or completed identity validation is made. No Windows protection changes are part of this package.
