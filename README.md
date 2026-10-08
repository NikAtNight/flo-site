# Flo site

This folder is a directly deployable static site. Open `index.html` in a browser or serve the folder with any static host. It uses no framework, package manager, build step, or web fonts.

`site.js` runs the hero demo, draws five of the app's HUD themes on canvas, animates the header dots to match the demo, and points the download buttons at the latest DMG from the GitHub releases API. If that request fails, the buttons fall back to the latest release page.

`npx wrangler deploy` publishes it to flo.talix.app.

The app used to be called LocalFlow, then Walkie. The old localflow.talix.app
and walkie.talix.app domains are served by the redirect Worker in `redirect/`,
which 301s every path to flo.talix.app. Deploy it once per domain from
`redirect/`: `npx wrangler deploy` for localflow.talix.app and
`npx wrangler deploy -c wrangler.walkie.jsonc` for walkie.talix.app.
