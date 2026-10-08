# Flo site

This folder is a directly deployable static site. Open `index.html` in a browser or serve the folder with any static host. It uses no framework, package manager, build step, or web fonts.

The site uses concept 6 from the redesign prototypes: a large wordmark, an orbit around the voice control, and a sparse monochrome layout. The header contains only the Source link. The favicon switches between light and dark appearances. Import-ready desktop icon assets and rebuild instructions are in [brand/README.md](brand/README.md).

`site.js` runs a simulated dictation demo, draws five of the app's HUD themes on canvas, and points the download link at the latest DMG from the GitHub releases API. If that request fails or returns no DMG, the link keeps its latest-release-page fallback.

The demo starts idle. Hold the circle, Space or Enter while it has focus, or Right Option to play an example. Release to transcribe and paste into the selected sample app. Click-only activation starts the example, then a second activation pastes it. Escape cancels recording or pending transcription. Losing window focus cancels; closing the demo returns focus to the circle. A quick tap shows a hint instead of pasting empty text. The demo uses no microphone and never autoplays.

Mail, Messages, and Notes use arrow-key tab selection. The five theme options use arrow keys, Home, and End. Reduced motion freezes the visualizers and disables CSS motion while keeping the example functional. Privacy, writing tools, engines, and requirements use native expandable details.

## Validation

Run `node --check site.js` and `git diff --check`. Serve locally with `python3 -m http.server 8765` for browser checks. There is no build, lint, typecheck, or automated test setup.

The October 8, 2026 redesign was checked in the collaborative Chromium preview at desktop, tablet, and mobile widths. Checks covered overflow, keyboard focus and selection, quick taps, held Space/Enter/Right Option, click-only activation, recording and processing cancellation, window blur, closing, formatted Notes output, live download resolution, and release API failure/no-DMG fallbacks. Reduced motion was checked in an isolated browser fixture with the preference emulated. Sustained holds used synthetic keyboard events; physical Right Option, touch hardware, screen-reader speech, and other browser engines were not tested.

`npx wrangler deploy` publishes it to flo.talix.app.

`design-prototype.html` contains ten throwaway redesign concepts. Run
`python3 -m http.server 8765`, then open `/design-prototype.html` to compare
them. Use `?variant=1` through `?variant=10` for a specific concept. The
prototype is excluded from deployment through `.assetsignore`.

The app used to be called LocalFlow, then Walkie. The old localflow.talix.app
and walkie.talix.app domains are served by the redirect Worker in `redirect/`,
which 301s every path to flo.talix.app. Deploy it once per domain from
`redirect/`: `npx wrangler deploy` for localflow.talix.app and
`npx wrangler deploy -c wrangler.walkie.jsonc` for walkie.talix.app.
