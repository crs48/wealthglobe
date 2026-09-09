# Wealth Globe

> If every square meter of Earth's land were divided in proportion to personal net worth, how much ground would one person stand on?

A static, single-page data-visual essay on a spinning 3D globe. Click a country, a curated life, or a named fortune and see the plot of land that person would hold. The contrast is the product: Elon Musk's plot is the size of the United Kingdom; the median adult in Haiti would stand on about 60 m².

It covers the entire globe. Every country in the Natural Earth 110m polygon set has at least a mean figure, and every country with a published median has that too. Sub-Saharan Africa is the first group in the Places list, not the last.

## The rule

```ts
const EARTH_LAND_KM2 = 148_940_000;
const TRACKED_WEALTH_USD = 517.69e12; // UBS 2026 sample, ~92% of world personal wealth

function landClaimKm2(netWorthUsd: number): number {
  return (netWorthUsd / TRACKED_WEALTH_USD) * EARTH_LAND_KM2;
}
```

Derived from that: share of all land (`claim / EARTH_LAND_KM2`), the radius of an equivalent circle (`sqrt(area / π)`), the side of an equivalent square, and a nearest reference ("about the size of Belgium", "a tennis court", "Russia, China, the United States, Canada and Brazil combined").

**This is area, not value.** Manhattan and the Sahara count the same. It is a thought experiment, not a deed. The UI says so in the empty state, the footer, and the inspector.

Fixture checks live in [`src/lib/allocation.test.ts`](src/lib/allocation.test.ts):

| Input | Claim |
| --- | --- |
| $908.2B (Elon Musk) | ≈ 261,000 km² (between the UK and New Zealand) |
| $696,277 (US mean adult) | ≈ 0.20 km² |
| $68,998 (US median adult) | ≈ 0.020 km² |
| $2,000 | ≈ 575 m² |
| Millionaire tier, 48.4% of wealth | ≈ 72 million km² |

## What is on screen

- **Globe** (full viewport): night texture, thin atmosphere, Natural Earth 110m country polygons colored on a log scale by mean wealth, median wealth, or either one's land claim. Hover for a tooltip with mean, median, adults, land area, both claims and the mean/median ratio. Click to select, fly the camera in, and draw the claim.
- **Claim circle**: a geodesic polygon extruded slightly above the surface with a soft pulsing ring. Claims under 1 km² get a pin instead of a microscopic circle, plus a magnified inset that draws the plot to scale against a parking space, a tennis court, a football pitch, and so on.
- **Top chrome**: title, thesis, the metric toggle (Typical person = median, Average person = mean, Named fortunes = billionaire markers), and a search box for countries, cities, people, and lives. Press `/` to focus it.
- **Inspector** (right panel; a bottom sheet on phones) with four tabs:
  - **Places**: every country, grouped by region with Sub-Saharan Africa first, sorted by the active statistic, filterable.
  - **People**: the Forbes snapshot plus the "your net worth" input.
  - **Lives**: curated personas, from the median adult in Haiti to the mean Swiss adult, including "Someone in Tibet" and "Someone in Bali". Those two use the China and Indonesia national medians and say so on the card.
  - **Tiers**: the UBS wealth pyramid. Selecting a tier shades the globe with the countries the tier would jointly hold.
- **Compare**: pin the current subject, pick a second, and read the ratio ("The median American's plot is 16× the median Kenyan's"). Both circles or both inset squares are drawn.
- **Your net worth**: a persistent input; the last value is kept in `localStorage`.
- The selected subject and comparison are mirrored into the URL hash, so a view can be shared.

Reduced motion turns off auto-rotate, the ring pulses, and camera transitions. Touch devices start with auto-rotate off. Panel contents are real DOM with keyboard list navigation (arrow keys, Home, End).

## Data and vintages

All data is committed as typed TypeScript modules in [`src/data/`](src/data/). There is no backend, no API key, and no runtime request other than the page, its local textures and GeoJSON, and Google Fonts.

| Module | Contents | Source |
| --- | --- | --- |
| `meta.ts` | Earth land area, tracked wealth, coverage, vintages | UBS Global Wealth Report 2026 |
| `countries.ts` | 178 countries: mean, median, adults, land km², region, vintage, confidence | See below |
| `people.ts` | 12 billionaires with home coordinates | Forbes Real-Time Billionaires, September 2026 |
| `personas.ts` | The Lives cards and the three mean-vs-median pairs | Derived from `countries.ts` and `regions.ts` |
| `places.ts` | Named fly-to points (Bali, Lhasa, Lagos, Nairobi, …) | Hand-entered coordinates |
| `tiers.ts` | The four-tier wealth pyramid | UBS Global Wealth Report 2026 |
| `regions.ts` | Region groupings and regional means | UBS 2026; Credit Suisse Databook 2023 for Africa |
| `landRefs.ts` | Reference areas from a phone screen to Asia | CIA World Factbook land figures, common objects |

Every country row carries a `confidence`:

- `official-ubs`: the 30 markets whose mean and median are published in the UBS Global Wealth Report 2026 (end-2025). Used exactly as published.
- `databook-estimate`: everywhere else, rounded from the UBS Global Wealth Databook 2023 (end-2022) country table. These are order-of-magnitude figures, and the app labels them as such.
- `regional-proxy`: places with no survey of their own (Greenland ← Denmark, Western Sahara ← regional scale, Somaliland ← Somalia, and so on). The inspector shows a note naming the proxy.

Adults per country are UBS/databook counts for the large markets and population × a regional adult share for the rest. Land areas are land only (no inland water) from the CIA World Factbook.

The world median ($8,654) is from the UBS Global Wealth Report 2024 (end-2023) and is labeled with that year in the app.

To update figures, edit the modules directly. `scripts/trim-geojson.mjs` is the only build-time script and only needs to run if the Natural Earth file is replaced.

## Stack

Vite 8, React 19, TypeScript 6, Tailwind CSS 4, `react-globe.gl` + `three`, `d3-scale` and `d3-geo`, `zustand`, `framer-motion`, `lucide-react`, Vitest.

## Develop

```bash
npm install
npm run dev
```

The dev server serves the app under the same base path GitHub Pages will use (`/wealthglobe/` by default), so open the URL Vite prints.

```bash
npm test          # allocation fixtures and data integrity checks
npm run build     # tsc + vite build, then copies dist/index.html to dist/404.html
npm run preview   # serves dist/ at the Pages base path
```

## Deploy to GitHub Pages

1. Push the repository to GitHub with `main` as the default branch.
2. In the repository settings, under **Pages**, set the source to **GitHub Actions**.
3. Push to `main`. The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs the tests, builds with `BASE_PATH=/<repo-name>/`, and deploys `dist/`.

The site will be at `https://<owner>.github.io/<repo-name>/`. If you rename the repository nothing needs to change; the base path is derived from the repository name at build time. For local previews with a different name, set `BASE_PATH` explicitly:

```bash
BASE_PATH=/my-repo/ npm run build && npm run preview
```

`dist/404.html` is a copy of `index.html`, so a deep link with a hash or query string still loads the app rather than the Pages 404 page.

## Screenshots for the README

Run `npm run dev`, then capture:

- The empty state: auto-rotating globe, inspector explaining the rule with the pyramid bars.
- Elon Musk selected: the circle over Texas the size of the UK.
- The median adult in Haiti selected: the pin over Port-au-Prince and the inset square against a tennis court.
- The Germany pair: both squares in the inset and the 6.5× ratio.

Save them under `docs/` and reference them here.

## Out of scope, and a future mode

Live tickers, user accounts, a backend, and drawing eight billion dots are all out of scope. Allocating by land *price* rather than area (so that Manhattan counts for more than the Sahara) is a possible future mode; it needs a land-value raster that is not in the repository today.
