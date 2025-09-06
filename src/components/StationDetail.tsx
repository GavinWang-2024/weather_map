import React from 'react';
import { X, MapPin, Thermometer, Droplets, Wind, Gauge } from 'lucide-react';
import { WeatherStation } from '../types/weather';
import { formatTemperature, getWindSpeed, formatPrecipitation, formatDateTime } from '../utils/weatherUtils';

interface StationDetailProps {
  station: WeatherStation | null;
  onClose: () => void;
}

const StationDetail: React.FC<StationDetailProps> = ({ station, onClose }) => {
  if (!station) return null;

  const weather = station.currentWeather;
  const windSpeed = weather ? getWindSpeed(weather.wind_x, weather.wind_y) : null;

  return (
    <div className="weather-panel absolute top-4 right-4 p-4 min-w-[320px] max-w-[400px] bg-zinc-800 text-white border border-zinc-700 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{station.name || station.id}</h3>
          <div className="flex items-center gap-1 text-sm text-zinc-400">
            <MapPin className="w-3 h-3" />
            <span>{station.city}, {station.state}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {station.lat.toFixed(4)}°, {station.lon.toFixed(4)}°
            {station.elevation && ` • ${Math.round(station.elevation)}ft`}
          </div>
        </div>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-700 text-zinc-300 h-9 w-9 p-0" 
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {weather ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Thermometer className="w-4 h-4" />
                <span>Temperature</span>
              </div>
              <div className="text-2xl font-bold">
                {formatTemperature(weather.temperature)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Droplets className="w-4 h-4" />
                <span>Dewpoint</span>
              </div>
              <div className="text-2xl font-bold">
                {formatTemperature(weather.dewpoint)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Wind className="w-4 h-4" />
                <span>Wind Speed</span>
              </div>
              <div className="text-lg font-semibold">
                {windSpeed !== null ? `${Math.round(windSpeed)} mph` : 'N/A'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Droplets className="w-4 h-4" />
                <span>Precipitation</span>
              </div>
              <div className="text-lg font-semibold">
                {formatPrecipitation(weather.precip)}
              </div>
            </div>
          </div>

          {weather.pressure && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Gauge className="w-4 h-4" />
                <span>Pressure</span>
              </div>
              <div className="text-lg font-semibold">
                {weather.pressure.toFixed(2)} inHg
              </div>
            </div>
          )}

          <div className="border-t border-zinc-700 pt-3">
            <div className="text-xs text-zinc-400">
              Last updated: {formatDateTime(weather.timestamp)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-zinc-300 mb-2">No weather data available</div>
          <div className="text-xs text-zinc-400">
            This station may not have recent observations
          </div>
        </div>
      )}
    </div>
  );
};

export default StationDetail;