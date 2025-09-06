import { GeoJsonLayer } from '@deck.gl/layers';

// Natural Earth 110m countries GeoJSON (small, public domain)
// You can download from https://geojson.xyz or use a CDN
export const COUNTRIES_GEOJSON_URL =
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

export function createCountriesLayer() {
  return new GeoJsonLayer({
    id: 'countries',
    data: COUNTRIES_GEOJSON_URL,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    getLineColor: [180, 180, 180, 180],
    getFillColor: [30, 30, 30, 180],
    pickable: false,
    opacity: 0.5,
  });
}
