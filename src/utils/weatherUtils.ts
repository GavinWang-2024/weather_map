// Temperature color mapping for visualization
export const getTemperatureColor = (temperature: number | null): [number, number, number, number] => {
  if (temperature === null) {
    return [100, 100, 100, 180]; // Gray for null data
  }

  // Temperature ranges in Fahrenheit
  if (temperature <= 32) {
    // Very cold - Blue
    return [100, 150, 255, 200];
  } else if (temperature <= 50) {
    // Cold - Light blue
    return [120, 180, 255, 200];
  } else if (temperature <= 70) {
    // Moderate - Green/Yellow
    return [120, 200, 120, 200];
  } else if (temperature <= 85) {
    // Warm - Orange
    return [255, 180, 60, 200];
  } else {
    // Hot - Red
    return [255, 100, 100, 200];
  }
};

export const formatTemperature = (temp: number | null): string => {
  if (temp === null) return 'N/A';
  return `${Math.round(temp)}°F`;
};

export const getWindSpeed = (wind_x: number | null, wind_y: number | null): number | null => {
  if (wind_x === null || wind_y === null) return null;
  return Math.sqrt(wind_x * wind_x + wind_y * wind_y);
};

export const getWindDirection = (wind_x: number | null, wind_y: number | null): number | null => {
  if (wind_x === null || wind_y === null) return null;
  return Math.atan2(wind_y, wind_x) * 180 / Math.PI;
};

export const formatPrecipitation = (precip: number | null): string => {
  if (precip === null) return 'N/A';
  return `${precip.toFixed(2)}"`;
};

export const formatDateTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return timestamp;
  }
};