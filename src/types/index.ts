// Location types
export interface Location {
  name: string;
  county: string;
  lat: number;
  lon: number;
  zip: string;
}

export type LocationKey = 'fresno' | 'visalia';

// Weather types
export interface WeatherData {
  temperature: number;
  weatherCode: number;
  description: string;
  high: number;
  low: number;
}

export interface AQIData {
  value: number;
  label: string;
  colorClass: string;
}

export interface SunData {
  sunrise: string;
  sunset: string;
}

export interface PollenData {
  level: string;
  colorClass: string;
}

export interface WeatherState {
  weather: WeatherData | null;
  aqi: AQIData | null;
  sun: SunData | null;
  pollen: PollenData | null;
  loading: boolean;
  error: string | null;
}

// News types
export interface NewsSource {
  name: string;
  url: string;
  colorClass: string;
}

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  imageUrl: string | null;
  sourceName: string;
  sourceColor: string;
  description: string;
}

export type CountyTab = 'fresno' | 'tulare';

// Note: NewsCache removed - localStorage not supported in Poe iframe