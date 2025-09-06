import React, { useState, useEffect } from 'react';
import { WeatherStation } from '../types/weather';
import { fetchStations, fetchWeatherDataBatch, fetchMultipleStationWeather } from '../services/weatherApi';
import WeatherMap from './WeatherMap';
import WeatherControls from './WeatherControls';
import StationDetail from './StationDetail';
import { useToast } from '@/hooks/use-toast';

const WeatherDashboard: React.FC = () => {
  const [stations, setStations] = useState<WeatherStation[]>([]);
  const [stationsWithWeather, setStationsWithWeather] = useState<WeatherStation[]>([]);

  // Log the number of stations shown on the map every minute
  useEffect(() => {
    const logInterval = setInterval(() => {
      console.log(`Stations currently shown on map: ${stationsWithWeather.length}`);
    }, 60000); // 60,000 ms = 1 minute
    return () => clearInterval(logInterval);
  }, [stationsWithWeather.length]);
  const [selectedStation, setSelectedStation] = useState<WeatherStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState({ completed: 0, total: 0 });
  const { toast } = useToast();

  // Load initial stations data
  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true);
      try {
        const stationData = await fetchStations();
        setStations(stationData);
        
        if (stationData.length > 0) {
          toast({
            title: "Stations Loaded",
            description: `Found ${stationData.length.toLocaleString()} weather stations`,
          });
          
          // Load weather data for a subset of stations to start
          const limitedStations = stationData.slice(0, 50); // Start with 50 stations
          await loadWeatherData(limitedStations);
        }
      } catch (error) {
        console.error('Error loading stations:', error);
        toast({
          title: "Error",
          description: "Failed to load weather stations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, [toast]);

  const loadWeatherData = async (stationsToLoad: WeatherStation[]) => {
    setIsLoading(true);
    setLoadProgress({ completed: 0, total: stationsToLoad.length });

    try {
      const batchSize = 5; // Small batch size to respect rate limits
      let updatedStations = [...stationsToLoad];
      let completed = 0;
      for (let i = 0; i < stationsToLoad.length; i += batchSize) {
        const batch = stationsToLoad.slice(i, i + batchSize);
        const weatherMap = await fetchMultipleStationWeather(batch.map(s => s.id));
        batch.forEach((station, index) => {
          const stationIndex = i + index;
          const weatherData = weatherMap.get(station.id);
          if (weatherData) {
            updatedStations[stationIndex] = {
              ...station,
              currentWeather: weatherData
            };
          }
          completed++;
        });
        // Update as each batch loads
        const stationsWithData = updatedStations.filter(s => s.currentWeather);
        setStationsWithWeather([...stationsWithData]);
        setLoadProgress({ completed, total: stationsToLoad.length });
        // Small delay between batches
        if (i + batchSize < stationsToLoad.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      toast({
        title: "Weather Data Loaded",
        description: `${updatedStations.filter(s => s.currentWeather).length} stations have current weather data`,
      });
    } catch (error) {
      console.error('Error loading weather data:', error);
      toast({
        title: "Error",
        description: "Failed to load weather data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = () => {
    if (stations.length > 0) {
      const limitedStations = stations.slice(0, 100); // Increase to 100 for refresh
      loadWeatherData(limitedStations);
    }
  };

  const handleStationClick = (station: WeatherStation) => {
    setSelectedStation(station);
  };

  const handleCloseDetail = () => {
    setSelectedStation(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <WeatherMap
        stations={stationsWithWeather}
        onStationClick={handleStationClick}
      />
      
      <WeatherControls
        isLoading={isLoading}
        onRefreshData={handleRefreshData}
        stationCount={stations.length}
        loadedStations={stationsWithWeather.length}
      />

      {selectedStation && (
        <StationDetail
          station={selectedStation}
          onClose={handleCloseDetail}
        />
      )}

      {isLoading && loadProgress.total > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="weather-panel px-4 py-2">
            <div className="text-sm text-center">
              Loading weather data... {loadProgress.completed}/{loadProgress.total}
            </div>
            <div className="w-48 bg-secondary rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(loadProgress.completed / loadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;