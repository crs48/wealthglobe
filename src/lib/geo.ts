import { geoArea, geoBounds, geoCentroid, geoCircle } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson'

export const EARTH_RADIUS_KM = 6371

export interface CountryFeatureProps {
  iso3: string
  name: string
  continent: string
  subregion: string
  pop: number
}

export type CountryFeature = Feature<Geometry, CountryFeatureProps>
export type CountryCollection = FeatureCollection<Geometry, CountryFeatureProps>

/** Geodesic circle as a GeoJSON polygon, ready for the globe's polygon layer. */
export function claimCirclePolygon(lat: number, lng: number, radiusKm: number, precision = 1.5): Polygon {
  const radiusDeg = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)
  return geoCircle().center([lng, lat]).radius(radiusDeg).precision(precision)()
}

/** Angular radius in degrees, for the globe's ring layer. */
export function radiusKmToDeg(radiusKm: number): number {
  return (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)
}

export interface Framing {
  lat: number
  lng: number
  /** Largest side of the bounding box, degrees. */
  spanDeg: number
}

/**
 * Frame a country by its largest polygon so France is framed by metropolitan
 * France rather than the midpoint between Paris and French Guiana, and the
 * United States by the contiguous states.
 */
export function frameFeature(feature: CountryFeature): Framing {
  let geometry: Geometry = feature.geometry
  if (geometry.type === 'MultiPolygon') {
    let best = geometry.coordinates[0]
    let bestArea = -1
    for (const poly of geometry.coordinates) {
      const a = geoArea({ type: 'Polygon', coordinates: poly })
      if (a > bestArea) {
        bestArea = a
        best = poly
      }
    }
    geometry = { type: 'Polygon', coordinates: best }
  }
  const [lng, lat] = geoCentroid(geometry)
  const [[w, s], [e, n]] = geoBounds(geometry)
  let width = e - w
  if (width < 0) width += 360
  // Countries straddling the antimeridian (Russia, Fiji) report absurd widths.
  if (width > 180) width = 360 - width
  const span = Math.max(width, n - s)
  return { lat, lng, spanDeg: span }
}

/** Camera altitude (globe radii) that comfortably frames a span in degrees. */
export function altitudeForSpan(spanDeg: number): number {
  // Tuned by eye against react-globe.gl's 50° FOV: 2.5 shows the whole
  // globe, 0.12 shows a city region.
  const alt = 0.06 + spanDeg * 0.035
  return Math.min(2.2, Math.max(0.12, alt))
}

/** Camera altitude that frames a claim circle of the given radius. */
export function altitudeForRadiusKm(radiusKm: number): number {
  const diameterDeg = 2 * radiusKmToDeg(radiusKm)
  return Math.min(2.2, Math.max(0.16, 0.08 + diameterDeg * 0.07))
}
