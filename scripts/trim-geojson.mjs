// Optional maintenance script. Re-run only if you replace the vendored
// Natural Earth 110m file. Keeps just the properties the app reads and
// normalises a few Natural Earth admin codes to ISO 3166-1 alpha-3.
//
//   node scripts/trim-geojson.mjs path/to/ne_110m_admin_0_countries.geojson
//
import { readFileSync, writeFileSync } from 'node:fs'

const src = process.argv[2] ?? 'public/data/countries-110m.geojson'
const out = 'public/data/countries-110m.geojson'
const CODE_FIX = { SDS: 'SSD', PSX: 'PSE', SAH: 'ESH' }

const geo = JSON.parse(readFileSync(src, 'utf8'))
const features = geo.features.map((f) => {
  const p = f.properties
  // Already-trimmed files carry `iso3`; raw Natural Earth files carry ADM0_A3.
  const raw = p.iso3 ?? p.ADM0_A3
  const iso3 = CODE_FIX[raw] ?? raw
  return {
    type: 'Feature',
    id: iso3,
    properties: {
      iso3,
      name: p.name ?? p.ADMIN,
      continent: p.continent ?? p.CONTINENT,
      subregion: p.subregion ?? p.SUBREGION,
      pop: p.pop ?? p.POP_EST,
    },
    geometry: f.geometry,
  }
})
writeFileSync(out, JSON.stringify({ type: 'FeatureCollection', features }))
console.log(`wrote ${out}: ${features.length} features`)
