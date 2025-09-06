import React, { useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { createCountriesLayer } from './CountriesLayer';
import { Map } from 'react-map-gl/maplibre';
import { WeatherStation } from '../types/weather';
import { getTemperatureColor, formatTemperature } from '../utils/weatherUtils';

interface WeatherMapProps {
  stations: WeatherStation[];
  selectedDate?: Date;
  onStationClick?: (station: WeatherStation) => void;
  onHover?: (info: any) => void;
}

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 1.5,
  pitch: 30,
  bearing: 0,
  projection: 'globe'
};


const WeatherMap: React.FC<WeatherMapProps> = ({
  stations,
  selectedDate,
  onStationClick,
  onHover
}) => {
  const deckRef = useRef<any>(null);
  const stationLayer = useMemo(() => {
    return new ScatterplotLayer({
      id: 'stations',
      data: stations,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 1,
      radiusMinPixels: 4,
      radiusMaxPixels: 12,
      lineWidthMinPixels: 1,
      getPosition: (d: WeatherStation) => [d.lon, d.lat],
      getRadius: (d: WeatherStation) => {
        return d.currentWeather?.temperature !== null ? 8 : 4;
      },
      getFillColor: (d: WeatherStation) => {
        if (!d.currentWeather?.temperature) {
          return [100, 100, 100, 180];
        }
        return getTemperatureColor(d.currentWeather.temperature);
      },
      getLineColor: [255, 255, 255, 120],
      getLineWidth: 1,
      onClick: (info) => {
        if (info.object && onStationClick) {
          onStationClick(info.object);
        }
      },
      onHover: (info) => {
        if (onHover) {
          onHover(info);
        }
      },
      updateTriggers: {
        getFillColor: [selectedDate, stations.map(s => s.currentWeather?.temperature)],
        getRadius: [stations.map(s => s.currentWeather?.temperature)]
      }
    });
  }, [stations, selectedDate, onStationClick, onHover]);

  const countriesLayer = useMemo(() => createCountriesLayer(), []);
  const layers = [countriesLayer, stationLayer];

  // Export map as image (using html2canvas for the whole map container)
  const handleExport = () => {
    const mapContainer = document.querySelector('.relative.w-full.h-full');
    if (mapContainer) {
      html2canvas(mapContainer as HTMLElement, {useCORS: true, backgroundColor: null}).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'weather-map-3d.png';
        link.click();
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <button
        onClick={handleExport}
        className="absolute z-10 top-4 right-4 bg-white/80 px-3 py-1 rounded shadow text-sm font-semibold hover:bg-white"
        title="Export 3D Map as Image"
      >
        Export 3D Map
      </button>
      <DeckGL
        ref={deckRef}
        initialViewState={INITIAL_VIEW_STATE as any}
        controller={true}
        layers={layers}
        style={{ width: '100%', height: '100%' }}
        glOptions={{ preserveDrawingBuffer: true }}
        getTooltip={({ object }) => {
          if (!object) return null;
          const station = object as WeatherStation;
          const weather = station.currentWeather;
          return {
            html: `
              <div class="weather-panel p-3 max-w-xs">
                <div class="font-semibold text-sm text-primary mb-1">${station.name || station.id}</div>
                <div class="text-xs text-muted-foreground mb-2">${station.city}, ${station.state}</div>
                ${weather ? `
                  <div class="space-y-1 text-xs">
                    <div>Temperature: <span class="font-medium">${formatTemperature(weather.temperature)}</span></div>
                    <div>Dewpoint: <span class="font-medium">${formatTemperature(weather.dewpoint)}</span></div>
                    ${weather.precip !== null ? `<div>Precipitation: <span class="font-medium">${weather.precip}"</span></div>` : ''}
                    ${weather.wind_x !== null && weather.wind_y !== null ? 
                      `<div>Wind: <span class="font-medium">${Math.round(Math.sqrt(weather.wind_x * weather.wind_x + weather.wind_y * weather.wind_y))} mph</span></div>` : 
                      ''
                    }
                    <div class="text-muted-foreground mt-1">${weather.timestamp}</div>
                  </div>
                ` : `
                  <div class="text-xs text-muted-foreground">No recent data available</div>
                `}
              </div>
            `,
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }
          };
        }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>
    </div>
  );
};

export default WeatherMap;