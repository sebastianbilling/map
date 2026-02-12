import * as esbuild from 'esbuild'
import { cpSync, writeFileSync, rmSync } from 'node:fs'

const BASE = '/map/'

rmSync('dist', { recursive: true, force: true })

const result = await esbuild.build({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'esm',
  outdir: 'dist',
  entryNames: 'assets/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  publicPath: BASE,
  jsx: 'automatic',
  jsxImportSource: 'preact',
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  metafile: true,
})

const outputs = Object.keys(result.metafile.outputs)
const jsFile = outputs.find(f => f.endsWith('.js'))
const cssFile = outputs.find(f => f.endsWith('.css'))

const jsPath = BASE + jsFile.replace('dist/', '')
const cssPath = cssFile ? BASE + cssFile.replace('dist/', '') : null

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>my-map-mvp</title>
    ${cssPath ? `<link rel="stylesheet" href="${cssPath}" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${jsPath}"></script>
  </body>
</html>`

writeFileSync('dist/index.html', html)
cpSync('public', 'dist', { recursive: true })

console.log('Build complete.')
