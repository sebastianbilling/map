import * as esbuild from 'esbuild'
import { writeFileSync, mkdirSync, cpSync } from 'node:fs'

mkdirSync('dist-dev', { recursive: true })

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outdir: 'dist-dev',
  entryNames: 'assets/[name]',
  assetNames: 'assets/[name]',
  jsx: 'automatic',
  jsxImportSource: 'preact',
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  sourcemap: true,
})

writeFileSync('dist-dev/index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <title>my-map-mvp (dev)</title>
    <link rel="stylesheet" href="/assets/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/main.js"></script>
    <script>new EventSource('/esbuild').addEventListener('change', () => location.reload())</script>
  </body>
</html>`)

cpSync('public', 'dist-dev', { recursive: true })

const { host, port } = await ctx.serve({
  servedir: 'dist-dev',
  port: 3000,
})

console.log(`Dev server running at http://localhost:${port}`)

await ctx.watch()
console.log('Watching for changes...')
