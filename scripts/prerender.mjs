import { readdir, readFile, writeFile } from 'node:fs/promises'
import { render } from '../dist-ssr/entry-server.js'

const distDir = new URL('../dist/', import.meta.url)
const indexPath = new URL('index.html', distDir)
const assetsPath = new URL('assets/', distDir)
const requiredFonts = [
  /bricolage-grotesque-latin-600-normal-.*\.woff2$/,
  /bricolage-grotesque-latin-700-normal-.*\.woff2$/,
  /inter-latin-400-normal-.*\.woff2$/,
]

const assets = await readdir(assetsPath)
const fontPreloads = assets
  .filter((asset) => requiredFonts.some((pattern) => pattern.test(asset)))
  .map((asset) => `    <link rel="preload" href="/assets/${asset}" as="font" type="font/woff2" crossorigin />`)
  .join('\n')

let html = await readFile(indexPath, 'utf8')
html = html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
html = html.replace('    <!-- font-preloads -->', fontPreloads)
await writeFile(indexPath, html)
