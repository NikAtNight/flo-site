# Walkie site

This folder is a directly deployable static site. Open `index.html` in a browser or serve the folder with any static host. It uses no framework, package manager, build step, or web fonts.

`site.js` runs the hero demo, draws five of the app's HUD themes on canvas, and points the download buttons at the latest DMG from the GitHub releases API. If that request fails, the buttons fall back to the latest release page.

`npx wrangler deploy` publishes it to walkie.talix.app. The old
localflow.talix.app domain is served by the redirect Worker in `redirect/`
(`cd redirect && npx wrangler deploy`), which 301s every path to the new domain.
