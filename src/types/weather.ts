export interface WeatherData {
  timestamp: string;
  temperature: number | null;
  wind_x: number | null;
  wind_y: number | null;
  dewpoint: number | null;
  pressure: number | null;
  precip: number | null;
}

export interface WeatherStation {
  id: string;
  name?: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  elevation?: number;
  currentWeather?: WeatherData;
  historicalData?: WeatherData[];
}

export interface ApiStation {
  station_id: string;
  station_name?: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  elevation?: number;
}

export interface ApiWeatherResponse {
  points: WeatherData[];
}