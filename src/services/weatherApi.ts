// --- Global API Rate Limiter ---
const REQUEST_LIMIT = 20;
const WINDOW_MS = 60 * 1000; // 1 minute

let requestTimestamps: number[] = [];
let requestQueue: (() => void)[] = [];

function processQueue() {
  // Remove timestamps older than 1 minute
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
  while (requestQueue.length > 0 && requestTimestamps.length < REQUEST_LIMIT) {
    const next = requestQueue.shift();
    if (next) next();
  }
}

// Always check the queue every second
setInterval(processQueue, 1000);

async function rateLimitedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      // Remove timestamps older than 1 minute
      const now = Date.now();
      requestTimestamps = requestTimestamps.filter(ts => now - ts < WINDOW_MS);
      if (requestTimestamps.length < REQUEST_LIMIT) {
        requestTimestamps.push(now);
        fetch(input, init).then(resolve).catch(reject);
        setTimeout(processQueue, WINDOW_MS); // Clean up queue after window
      } else {
        // Queue the request
        requestQueue.push(tryRequest);
      }
    };
    tryRequest();
  });
}
import { ApiStation, ApiWeatherResponse, WeatherStation, WeatherData } from '../types/weather';

const BASE_URL = 'https://sfc.windbornesystems.com';

// Fetch all available weather stations
export const fetchStations = async (): Promise<WeatherStation[]> => {
  try {
    const response = await rateLimitedFetch(`${BASE_URL}/stations`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stations: ${response.statusText}`);
    }
    const apiStations: ApiStation[] = await response.json();
    return apiStations.map(station => ({
      id: station.station_id,
      name: station.station_name,
      lat: station.latitude,
      lon: station.longitude,
      city: station.city,
      state: station.state,
      country: station.country,
      elevation: station.elevation
    }));
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

// Fetch historical weather data for a specific station
export const fetchStationWeather = async (stationId: string): Promise<WeatherData[]> => {
  try {
    const response = await rateLimitedFetch(`${BASE_URL}/historical_weather?station=${stationId}`);
    const text = await response.text();
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      console.error('Response text:', text);
      throw new Error(`Failed to fetch weather for station ${stationId}: ${response.statusText}`);
    }
    try {
      let jsonText = text.trim();
      // Patch: If response starts with '"points":', wrap in curly braces
      if (jsonText.startsWith('"points":')) {
        jsonText = `{${jsonText}}`;
      }
      // Attempt to auto-fix missing closing brace
      if (!jsonText.endsWith('}')) {
        jsonText = jsonText + '}';
      }
      try {
        const data: ApiWeatherResponse = JSON.parse(jsonText);
        return data.points || [];
      } catch (jsonError) {
        console.error(`JSON parse error for station ${stationId} (after auto-fix):`, jsonError);
        console.error('Raw response text:', text);
        return [];
      }
    } catch (jsonError) {
      console.error(`JSON parse error for station ${stationId}:`, jsonError);
      console.error('Raw response text:', text);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching weather for station ${stationId}:`, error);
    return [];
  }
};

// Fetch current/latest weather for multiple stations (with rate limiting)
export const fetchMultipleStationWeather = async (stationIds: string[]): Promise<Map<string, WeatherData>> => {
  const weatherMap = new Map<string, WeatherData>();
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Rate limiting: 20 requests per minute = 3 seconds between requests
  const delayBetweenRequests = 3000;
  
  for (let i = 0; i < stationIds.length; i++) {
    const stationId = stationIds[i];
    
    try {
      const weatherData = await fetchStationWeather(stationId);
      if (weatherData.length > 0) {
        // Get the most recent data point
        const latestWeather = weatherData[weatherData.length - 1];
        weatherMap.set(stationId, latestWeather);
      }
      
      // Rate limiting delay (except for the last request)
      if (i < stationIds.length - 1) {
        await delay(delayBetweenRequests);
      }
    } catch (error) {
      console.error(`Failed to fetch weather for station ${stationId}:`, error);
    }
  }
  
  return weatherMap;
};

// Batch fetch with progress callback
export const fetchWeatherDataBatch = async (
  stations: WeatherStation[],
  onProgress?: (completed: number, total: number) => void,
  batchSize = 10
): Promise<WeatherStation[]> => {
  const updatedStations = [...stations];
  const totalStations = stations.length;
  let completed = 0;
  
  for (let i = 0; i < stations.length; i += batchSize) {
    const batch = stations.slice(i, i + batchSize);
    const stationIds = batch.map(s => s.id);
    
    const weatherMap = await fetchMultipleStationWeather(stationIds);
    
    // Update stations with weather data
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
      if (onProgress) {
        onProgress(completed, totalStations);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < stations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return updatedStations;
};