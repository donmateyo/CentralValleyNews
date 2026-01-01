import { useState, useEffect, useCallback } from 'react';
import type { WeatherState, LocationKey, SunData, PollenData } from '../types';
import { LOCATIONS, WEATHER_CODES } from '../config';

const AIRNOW_API_KEY = '1EF0DDE4-CA90-44AF-897B-379AEA29021E';

interface NWSPointsResponse {
  properties: {
    forecast: string;
    forecastHourly: string;
    observationStations: string;
  };
}

interface NWSStationsResponse {
  features: Array<{
    properties: {
      stationIdentifier: string;
    };
  }>;
}

interface NWSObservationResponse {
  properties: {
    temperature: {
      value: number | null;
      unitCode: string;
    };
    textDescription: string;
  };
}

interface NWSForecastResponse {
  properties: {
    periods: Array<{
      temperature: number;
      temperatureUnit: string;
      shortForecast: string;
      isDaytime: boolean;
    }>;
  };
}

interface AirNowResponse {
  DateObserved: string;
  HourObserved: number;
  AQI: number;
  Category: {
    Number: number;
    Name: string;
  };
}

interface OpenMeteoSunResponse {
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

interface OpenMeteoPollenResponse {
  current: {
    grass_pollen: number;
    birch_pollen: number;
    ragweed_pollen: number;
  };
}

function getAQIInfo(aqi: number): { label: string; colorClass: string } {
  if (aqi <= 50) return { label: 'Good', colorClass: 'text-green-400' };
  if (aqi <= 100) return { label: 'Moderate', colorClass: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy (Sens.)', colorClass: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy', colorClass: 'text-red-400' };
  return { label: 'Hazardous', colorClass: 'text-purple-400' };
}

function getPollenLevel(grass: number, birch: number, ragweed: number): PollenData {
  const max = Math.max(grass, birch, ragweed);
  if (max <= 10) return { level: 'Low', colorClass: 'text-green-400' };
  if (max <= 50) return { level: 'Moderate', colorClass: 'text-yellow-400' };
  if (max <= 100) return { level: 'High', colorClass: 'text-orange-400' };
  return { level: 'Very High', colorClass: 'text-red-400' };
}

function mapNWSToWeatherCode(description: string): number {
  const text = description.toLowerCase();
  if (text.includes('thunder')) return 95;
  if (text.includes('snow') || text.includes('flurr')) return 71;
  if (text.includes('rain') || text.includes('shower')) return 61;
  if (text.includes('drizzle')) return 51;
  if (text.includes('fog') || text.includes('mist')) return 45;
  if (text.includes('overcast')) return 3;
  if (text.includes('cloudy') || text.includes('cloud')) return 2;
  if (text.includes('partly')) return 2;
  if (text.includes('mostly sunny') || text.includes('mostly clear')) return 1;
  if (text.includes('sunny') || text.includes('clear') || text.includes('fair')) return 0;
  return 3;
}

function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function useWeather(locationKey: LocationKey) {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    aqi: null,
    sun: null,
    pollen: null,
    loading: true,
    error: null
  });

  const fetchWeather = useCallback(async () => {
    const location = LOCATIONS[locationKey];
    setState(prev => ({ ...prev, loading: true, error: null }));

    const headers = { 'User-Agent': 'ValleyPulse/1.0 (weather app)' };

    try {
      let weatherData = null;

      try {
        const pointsRes = await fetch(
          `https://api.weather.gov/points/${location.lat},${location.lon}`,
          { headers }
        );

        if (pointsRes.ok) {
          const pointsData: NWSPointsResponse = await pointsRes.json();

          let currentTemp: number | null = null;
          let currentDescription = '';

          try {
            const stationsRes = await fetch(pointsData.properties.observationStations, { headers });
            if (stationsRes.ok) {
              const stationsData: NWSStationsResponse = await stationsRes.json();
              if (stationsData.features && stationsData.features.length > 0) {
                const stationId = stationsData.features[0].properties.stationIdentifier;

                const obsRes = await fetch(
                  `https://api.weather.gov/stations/${stationId}/observations/latest`,
                  { headers }
                );

                if (obsRes.ok) {
                  const obsData: NWSObservationResponse = await obsRes.json();

                  if (obsData.properties.temperature.value !== null) {
                    currentTemp = celsiusToFahrenheit(obsData.properties.temperature.value);
                  }
                  currentDescription = obsData.properties.textDescription || '';
                }
              }
            }
          } catch (e) {
            console.warn('NWS observation fetch failed:', e);
          }

          let high: number | null = null;
          let low: number | null = null;

          try {
            const forecastRes = await fetch(pointsData.properties.forecast, { headers });
            if (forecastRes.ok) {
              const forecastData: NWSForecastResponse = await forecastRes.json();
              const periods = forecastData.properties.periods;

              const dayPeriod = periods.find(p => p.isDaytime);
              const nightPeriod = periods.find(p => !p.isDaytime);

              high = dayPeriod?.temperature ?? null;
              low = nightPeriod?.temperature ?? null;

              if (currentTemp === null && periods.length > 0) {
                currentTemp = periods[0].temperature;
                currentDescription = periods[0].shortForecast;
              }
            }
          } catch (e) {
            console.warn('NWS forecast fetch failed:', e);
          }

          if (currentTemp !== null) {
            weatherData = {
              temperature: currentTemp,
              weatherCode: mapNWSToWeatherCode(currentDescription),
              description: currentDescription,
              high: high ?? currentTemp,
              low: low ?? currentTemp - 15
            };
          }
        }
      } catch (e) {
        console.warn('NWS fetch failed:', e);
      }

      // Fetch AQI from AirNow
      let aqiData = null;
      try {
        // Use zip code for more accurate local AQI
        const aqiRes = await fetch(
          `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=${location.zip}&API_KEY=${AIRNOW_API_KEY}`
        );
        if (aqiRes.ok) {
          const aqiJson: AirNowResponse[] = await aqiRes.json();
          if (aqiJson && aqiJson.length > 0) {
            // Find the highest AQI among all pollutants (this is what AirNow website shows)
            const highest = aqiJson.reduce((max, current) => {
              if (current.AQI !== undefined && current.AQI > (max?.AQI ?? -1)) {
                return current;
              }
              return max;
            }, aqiJson[0]);

            if (highest && highest.AQI !== undefined) {
              const aqiValue = highest.AQI;
              const label = highest.Category?.Name || getAQIInfo(aqiValue).label;
              const { colorClass } = getAQIInfo(aqiValue);
              aqiData = { value: aqiValue, label, colorClass };
            }
          }
        }
      } catch (e) {
        console.warn('AirNow fetch failed:', e);
      }

      // Fetch sunrise/sunset from Open-Meteo
      let sunData: SunData | null = null;
      try {
        const sunRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=sunrise,sunset&timezone=America%2FLos_Angeles`
        );
        if (sunRes.ok) {
          const sunJson: OpenMeteoSunResponse = await sunRes.json();
          sunData = {
            sunrise: formatTime(sunJson.daily.sunrise[0]),
            sunset: formatTime(sunJson.daily.sunset[0])
          };
        }
      } catch (e) {
        console.warn('Sunrise/sunset fetch failed:', e);
      }

      // Fetch pollen from Open-Meteo
      let pollenData: PollenData | null = null;
      try {
        const pollenRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=grass_pollen,birch_pollen,ragweed_pollen`
        );
        if (pollenRes.ok) {
          const pollenJson: OpenMeteoPollenResponse = await pollenRes.json();
          pollenData = getPollenLevel(
            pollenJson.current.grass_pollen || 0,
            pollenJson.current.birch_pollen || 0,
            pollenJson.current.ragweed_pollen || 0
          );
        }
      } catch (e) {
        console.warn('Pollen fetch failed:', e);
      }

      setState({
        weather: weatherData,
        aqi: aqiData,
        sun: sunData,
        pollen: pollenData,
        loading: false,
        error: weatherData ? null : 'Weather unavailable'
      });
    } catch (error) {
      console.error('Weather error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load weather'
      }));
    }
  }, [locationKey]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { ...state, refresh: fetchWeather };
}