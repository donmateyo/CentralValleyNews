import { useState, useEffect, useCallback } from 'react';
import type { WeatherState, LocationKey } from '../types';
import { LOCATIONS, WEATHER_CODES } from '../config';

interface OpenMeteoWeatherResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

interface OpenMeteoAQIResponse {
  current: {
    us_aqi: number;
  };
}

function getAQIInfo(aqi: number): { label: string; colorClass: string } {
  if (aqi <= 50) return { label: 'Good', colorClass: 'text-green-400' };
  if (aqi <= 100) return { label: 'Moderate', colorClass: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'Unhealthy (Sens.)', colorClass: 'text-orange-400' };
  if (aqi <= 200) return { label: 'Unhealthy', colorClass: 'text-red-400' };
  return { label: 'Hazardous', colorClass: 'text-purple-400' };
}

function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code]?.description || 'Cloudy';
}

export function useWeather(locationKey: LocationKey) {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    aqi: null,
    loading: true,
    error: null
  });

  const fetchWeather = useCallback(async () => {
    const location = LOCATIONS[locationKey];
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch weather
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FLos_Angeles`;

      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error('Weather fetch failed');

      const weatherData: OpenMeteoWeatherResponse = await weatherRes.json();
      const current = weatherData.current_weather;
      const daily = weatherData.daily;

      // Fetch AQI
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=us_aqi`;

      let aqiData = null;
      try {
        const aqiRes = await fetch(aqiUrl);
        if (aqiRes.ok) {
          const aqiJson: OpenMeteoAQIResponse = await aqiRes.json();
          const aqiValue = aqiJson.current.us_aqi;
          const aqiInfo = getAQIInfo(aqiValue);
          aqiData = {
            value: aqiValue,
            label: aqiInfo.label,
            colorClass: aqiInfo.colorClass
          };
        }
      } catch (e) {
        console.warn('AQI fetch failed:', e);
      }

      setState({
        weather: {
          temperature: Math.round(current.temperature),
          weatherCode: current.weathercode,
          description: getWeatherDescription(current.weathercode),
          high: Math.round(daily.temperature_2m_max[0]),
          low: Math.round(daily.temperature_2m_min[0])
        },
        aqi: aqiData,
        loading: false,
        error: null
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
