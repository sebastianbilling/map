import { mkdirSync, existsSync, writeFileSync } from 'node:fs'

const MAX_ZOOM = 14
// Bounding box [west, south, east, north] — Gothenburg city center
const BOUNDS = [11.9, 57.67, 12.05, 57.73]

function lat2tile(lat, z) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * (1 << z),
  )
}

function lon2tile(lon, z) {
  return Math.floor(((lon + 180) / 360) * (1 << z))
}

async function download() {
  let count = 0
  for (let z = 0; z <= MAX_ZOOM; z++) {
    const xMin = lon2tile(BOUNDS[0], z)
    const xMax = lon2tile(BOUNDS[2], z)
    const yMin = lat2tile(BOUNDS[3], z) // lat is inverted in tile coords
    const yMax = lat2tile(BOUNDS[1], z)

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const dir = `public/tiles/${z}/${x}`
        const file = `${dir}/${y}.png`
        if (existsSync(file)) continue

        mkdirSync(dir, { recursive: true })
        const url = `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`
        const res = await fetch(url)
        if (res.ok) {
          writeFileSync(file, Buffer.from(await res.arrayBuffer()))
          count++
          if (count % 50 === 0) console.log(`Downloaded ${count} tiles...`)
        } else {
          console.warn(`Failed: ${url} (${res.status})`)
        }
      }
    }
  }
  console.log(`Done — ${count} tiles downloaded to public/tiles/`)
}

download()
