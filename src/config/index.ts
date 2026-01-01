import type { Location, LocationKey, NewsSource } from '../types';

export const LOCATIONS: Record<LocationKey, Location> = {
  fresno: {
    name: 'Fresno',
    county: 'Fresno Co.',
    lat: 36.7378,
    lon: -119.7871
  },
  visalia: {
    name: 'Visalia',
    county: 'Tulare Co.',
    lat: 36.3302,
    lon: -119.2921
  }
};

export const NEWS_SOURCES: NewsSource[] = [
  { name: 'ABC30', url: 'https://abc30.com/feed/', colorClass: 'text-blue-400' },
  { name: 'KSEE24', url: 'https://www.yourcentralvalley.com/feed/', colorClass: 'text-indigo-400' },
  { name: 'KMPH', url: 'https://kmph.com/rss', colorClass: 'text-orange-400' }
];

export const CORS_PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

export const TULARE_KEYWORDS = [
  'visalia', 'tulare', 'porterville', 'hanford', 'lemoore', 'dinuba',
  'exeter', 'kingsburg', 'strathmore', 'lindsay', 'woodlake', 'south valley',
  'earlimart', 'pixley'
];

export const FRESNO_KEYWORDS = [
  'fresno', 'clovis', 'madera', 'sanger', 'selma', 'reedley',
  'fowler', 'kerman', 'coalinga', 'firebaugh', 'mendota', 'shaver'
];

export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear', icon: 'sun' },
  1: { description: 'Fair', icon: 'cloud-sun' },
  2: { description: 'Cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Fog', icon: 'cloud-fog' },
  48: { description: 'Fog', icon: 'cloud-fog' },
  51: { description: 'Drizzle', icon: 'cloud-rain' },
  53: { description: 'Drizzle', icon: 'cloud-rain' },
  55: { description: 'Drizzle', icon: 'cloud-rain' },
  61: { description: 'Rain', icon: 'cloud-rain' },
  63: { description: 'Rain', icon: 'cloud-rain' },
  65: { description: 'Heavy Rain', icon: 'cloud-rain' },
  71: { description: 'Snow', icon: 'snowflake' },
  73: { description: 'Snow', icon: 'snowflake' },
  75: { description: 'Heavy Snow', icon: 'snowflake' },
  80: { description: 'Showers', icon: 'cloud-rain' },
  81: { description: 'Showers', icon: 'cloud-rain' },
  82: { description: 'Heavy Showers', icon: 'cloud-rain' },
  95: { description: 'Storm', icon: 'cloud-lightning' },
  96: { description: 'Hail Storm', icon: 'cloud-lightning' },
  99: { description: 'Severe Storm', icon: 'cloud-lightning' }
};

export const CACHE_KEY = 'valley_pulse_news';
export const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
