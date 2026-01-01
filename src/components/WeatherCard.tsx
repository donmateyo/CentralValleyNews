import type { LocationKey } from '../types';
import { LOCATIONS, WEATHER_CODES } from '../config';
import { useWeather } from '../hooks/useWeather';

interface WeatherCardProps {
  locationKey: LocationKey;
  accentColor: string;
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const iconName = WEATHER_CODES[code]?.icon || 'cloud';

  const icons: Record<string, JSX.Element> = {
    sun: (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M120,40V32a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-8-8A8,8,0,0,0,50.34,61.66Zm0,116.68-8,8a8,8,0,0,0,11.32,11.32l8-8a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l8,8a8,8,0,0,0,11.32-11.32ZM40,120H32a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Zm88,88a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,128,208Zm96-88h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z"/>
      </svg>
    ),
    'cloud-sun': (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M164,72a76.2,76.2,0,0,0-12.36,1A71.93,71.93,0,0,0,88,0,71.93,71.93,0,0,0,24.36,104.5,52,52,0,0,0,52,200h112a76,76,0,1,0,0-152ZM88,16a55.92,55.92,0,0,1,55.41,48.09A75.93,75.93,0,0,0,88,88a76.32,76.32,0,0,0-26.71,4.84A56,56,0,0,1,88,16ZM164,184H52a36,36,0,0,1-4.68-71.71,75.51,75.51,0,0,0-.3,7.71,8,8,0,0,0,16,0,60,60,0,1,1,100.98,43.62,8,8,0,1,0,10.63,11.96A75.87,75.87,0,0,0,164,184Z"/>
      </svg>
    ),
    cloud: (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M160,40A88.09,88.09,0,0,0,81.29,88.68,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88.13,88.13,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z"/>
      </svg>
    ),
    'cloud-fog': (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M120,208a8,8,0,0,1-8,8H24a8,8,0,0,1,0-16h88A8,8,0,0,1,120,208Zm112-8H160a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Zm-48,32H104a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Zm68-96a76.08,76.08,0,0,1-76,76H76a52,52,0,0,1,0-104,53.26,53.26,0,0,1,8.92.76A76.08,76.08,0,0,1,252,136Z"/>
      </svg>
    ),
    'cloud-rain': (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M158.66,196.44l-32,48a8,8,0,1,1-13.32-8.88l32-48a8,8,0,0,1,13.32,8.88Zm-60-8.88a8,8,0,0,0-11.1,2.22l-32,48a8,8,0,1,0,13.32,8.88l32-48A8,8,0,0,0,98.66,187.56Zm112,0a8,8,0,0,0-11.1,2.22l-32,48a8,8,0,1,0,13.32,8.88l32-48A8,8,0,0,0,210.66,187.56ZM152,24A76.08,76.08,0,0,0,84.92,68.76,52,52,0,1,0,76,172h76a76,76,0,0,0,0-152Z"/>
      </svg>
    ),
    snowflake: (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M223.77,150.09a8,8,0,0,1-5.86,9.68l-24.64,6.21,6.19,24.51a8,8,0,0,1-5.82,9.7,8.13,8.13,0,0,1-1.95.24,8,8,0,0,1-7.75-6.06l-7.72-30.51L136,140.78v48.44l22.15,22.15a8,8,0,0,1-11.32,11.32L128,203.88l-18.83,18.81a8,8,0,0,1-11.32-11.32L120,189.22V140.78L79.78,163.86l-7.72,30.51a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24,8,8,0,0,1-5.82-9.7l6.19-24.51-24.64-6.21a8,8,0,0,1,3.82-15.54l30.77,7.77L113,128,72.68,104.09l-30.77,7.77a8.13,8.13,0,0,1-1.95.24,8,8,0,0,1-1.91-15.78l24.64-6.21-6.19-24.51a8,8,0,1,1,15.52-3.92l7.72,30.51L120,115.27V66.78L97.88,44.63a8,8,0,0,1,11.32-11.32L128,52.12l18.83-18.81a8,8,0,0,1,11.32,11.32L136,66.78v48.49l40.22-23.08,7.72-30.51a8,8,0,1,1,15.52,3.92l-6.19,24.51,24.64,6.21a8,8,0,0,1-1.91,15.78,8.13,8.13,0,0,1-1.95-.24l-30.77-7.77L143,128l40.27,23.19,30.77-7.77A8,8,0,0,1,223.77,150.09Z"/>
      </svg>
    ),
    'cloud-lightning': (
      <svg className={className} fill="currentColor" viewBox="0 0 256 256">
        <path d="M156,168a8,8,0,0,1-6.4,3.2h-20l-12.8,38.4a8,8,0,0,1-14.4,1.6l-32-48A8,8,0,0,1,76,152h20l12.8-38.4a8,8,0,0,1,14.4-1.6l32,48A8,8,0,0,1,156,168ZM152,24A76.08,76.08,0,0,0,84.92,68.76,52,52,0,1,0,76,172h4.46L77.6,176.8a24,24,0,0,0,43.2,4.8l8.27-24.8A76,76,0,0,0,152,24Z"/>
      </svg>
    )
  };

  return icons[iconName] || icons.cloud;
}

export function WeatherCard({ locationKey, accentColor }: WeatherCardProps) {
  const location = LOCATIONS[locationKey];
  const { weather, aqi, sun, pollen, loading, error } = useWeather(locationKey);

  return (
    <div className="glass-panel rounded-xl p-3 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-sm font-bold text-white">{location.name}</h3>
          <p className="text-[10px] text-slate-400">{location.county}</p>
        </div>
        {/* AQI Badge */}
        {aqi && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/40 border border-white/5 backdrop-blur-sm">
            <span className="text-[9px] font-bold text-slate-400">AQI</span>
            <span className={`text-[10px] font-bold ${aqi.colorClass}`}>
              {aqi.value} {aqi.label}
            </span>
          </div>
        )}
      </div>

      {/* Weather Content */}
      <div className="mt-2 flex items-center gap-2 relative z-10">
        {loading ? (
          <>
            <div className="text-3xl text-slate-500">
              <svg className="w-8 h-8 animate-spin" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,176A72,72,0,1,1,200,128,72.08,72.08,0,0,1,128,200Z" opacity="0.2"/>
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,16a88.1,88.1,0,0,1,88,88,8,8,0,0,1-16,0,72,72,0,0,0-72-72,8,8,0,0,1,0-16Z"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white/50 leading-none">--°</div>
              <div className="text-[10px] text-slate-500 mt-1">Loading</div>
            </div>
          </>
        ) : error ? (
          <div className="text-[10px] text-red-400">{error}</div>
        ) : weather ? (
          <>
            <div className="text-3xl text-yellow-400">
              <WeatherIcon code={weather.weatherCode} className="w-8 h-8" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white leading-none">
                {weather.temperature}°
              </div>
              <div className="text-[10px] text-slate-300 mt-1">
                {weather.description}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Row: H/L, Pollen, Sunrise/Sunset */}
      <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 relative z-10 font-medium">
        {/* Left: High/Low */}
        <div className="flex gap-2">
          <span>
            H:<span className="text-white ml-0.5">{weather?.high ?? '--'}°</span>
          </span>
          <span>
            L:<span className="text-white ml-0.5">{weather?.low ?? '--'}°</span>
          </span>
        </div>

        {/* Center: Pollen */}
        {pollen && (
          <span className="text-slate-400">
            Pollen: <span className={pollen.colorClass}>{pollen.level}</span>
          </span>
        )}

        {/* Right: Sunrise/Sunset stacked */}
        {sun && (
          <div className="flex flex-col items-end gap-0.5 text-slate-400 font-mono text-[9px]">
            <span className="flex items-center gap-1">
              <span>🌅</span>
              <span className="w-14 text-right">{sun.sunrise}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🌇</span>
              <span className="w-14 text-right">{sun.sunset}</span>
            </span>
          </div>
        )}
      </div>

      {/* Background Accent */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 ${accentColor} rounded-full blur-xl`} />
    </div>
  );
}