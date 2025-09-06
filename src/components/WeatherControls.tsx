import React from 'react';
import { Play, Pause, RotateCcw, Thermometer, CloudRain, Wind } from 'lucide-react';

interface WeatherControlsProps {
  isLoading: boolean;
  onRefreshData: () => void;
  stationCount: number;
  loadedStations: number;
}

const WeatherControls: React.FC<WeatherControlsProps> = ({
  isLoading,
  onRefreshData,
  stationCount,
  loadedStations
}) => {
  return (
    <div className="weather-panel absolute top-4 left-4 p-4 space-y-4 min-w-[280px] bg-zinc-800 text-white border border-zinc-700 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">ASOS Weather Stations</h2>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Total Stations:</span>
          <span className="font-medium">{stationCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">With Data:</span>
          <span className="font-medium">{loadedStations.toLocaleString()}</span>
        </div>
        
        {isLoading && (
          <div className="flex justify-between">
            <span className="text-zinc-400">Loading:</span>
            <span className="font-medium text-primary">
              {Math.round((loadedStations / stationCount) * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-50 bg-zinc-700 text-white hover:bg-zinc-600 h-9 px-3 flex-1"
          onClick={onRefreshData}
          disabled={isLoading}
        >
          <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="border-t border-zinc-700 pt-3 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-weather-cold"></div>
          <span>Cold (&lt; 32°F)</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-weather-cool"></div>
          <span>Cool (32-50°F)</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-weather-moderate"></div>
          <span>Moderate (50-70°F)</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-weather-warm"></div>
          <span>Warm (70-85°F)</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-weather-hot"></div>
          <span>Hot (&gt; 85°F)</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherControls;