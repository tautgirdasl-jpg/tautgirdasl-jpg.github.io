
export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  iconType: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
}

export interface WeatherForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  iconType: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  hourly?: HourlyForecast[];
}

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: string;
  };
  forecast: WeatherForecastDay[];
  sources: { title: string; uri: string }[];
  rawSummary: string;
}

export interface CityInfo {
  name: string;
  country: string;
}
