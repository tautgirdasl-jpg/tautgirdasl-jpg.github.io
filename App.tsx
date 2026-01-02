
import React, { useState, useCallback } from 'react';
import { EUROPEAN_CITIES, WEATHER_ICONS } from './constants';
import { WeatherData, WeatherForecastDay } from './types';
import { fetchWeatherWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(EUROPEAN_CITIES.slice(0, 5));
  const [selectedDay, setSelectedDay] = useState<WeatherForecastDay | null>(null);

  const handleSearch = useCallback(async (location: string) => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setSelectedDay(null);
    try {
      const data = await fetchWeatherWithGemini(location);
      setWeather(data);
    } catch (err) {
      setError("Mamma Mia! We couldn't find that castle... (API Error)");
    } finally {
      setLoading(false);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 1) {
      const filtered = EUROPEAN_CITIES.filter(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        c.country.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions(EUROPEAN_CITIES.slice(0, 5));
    }
  };

  const handleSuggestionClick = (city: string) => {
    setSearchQuery(city);
    handleSearch(city);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pb-24 relative overflow-hidden text-white">
      {/* Decorative Mario Elements */}
      <div className="fixed top-20 left-10 text-6xl floating opacity-50 select-none pointer-events-none">☁️</div>
      <div className="fixed top-40 right-20 text-5xl floating opacity-50 select-none pointer-events-none" style={{animationDelay: '1s'}}>☁️</div>
      
      {/* Header */}
      <header className="z-10 text-center mb-8 mt-12">
        <h1 className="text-white text-2xl md:text-4xl drop-shadow-[4px_4px_0px_#000] mb-4">
          WEATHER WORLD
        </h1>
        <p className="text-white text-[10px] md:text-sm drop-shadow-[2px_2px_0px_#000]">
          CHOOSE YOUR STAGE (EUROPE)
        </p>
      </header>

      {/* Search Input Box */}
      <div className="z-20 w-full max-w-md mb-8">
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={onInputChange}
            placeholder="Search City..."
            className="w-full bg-white pixel-border p-4 text-sm text-black focus:outline-none placeholder:text-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <button 
            onClick={() => handleSearch(searchQuery)}
            className="absolute right-2 top-2 bottom-2 px-4 bg-[#FBD000] text-black pixel-border hover:bg-[#FFE040] active:translate-y-1 transition-all"
          >
            GO!
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !weather && !loading && (
          <div className="mt-2 bg-white pixel-border">
            {suggestions.map((city, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSuggestionClick(`${city.name}, ${city.country}`)}
                className="p-3 text-[10px] text-black cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-0"
              >
                {city.name}, {city.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Screen */}
      {loading && (
        <div className="z-30 text-center mt-20 animate-bounce">
          <div className="text-white text-lg mb-4">LOADING...</div>
          <div className="text-4xl">🍄</div>
          <p className="text-white text-[8px] mt-4 max-w-xs mx-auto">
            MARIO IS CHECKING THE FORECAST WITH A TELESCOPE...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="z-30 bg-red-500 text-white pixel-border p-4 text-[10px] max-w-sm text-center">
          {error}
        </div>
      )}

      {/* Weather Content */}
      <div className="z-20 w-full max-w-5xl">
        {weather && !loading && (
          <>
            {/* Current Weather Card */}
            <div className="bg-[#E4000F] pixel-border p-6 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-xl mb-2">{weather.location.toUpperCase()}</h2>
                <div className="text-4xl mb-2">{weather.current.temp}°C</div>
                <p className="text-[10px]">{weather.current.condition}</p>
              </div>
              
              <div className="flex gap-8 text-[10px] bg-black/20 p-4 pixel-border">
                <div>
                  <p className="mb-2">HUMIDITY</p>
                  <p>{weather.current.humidity}%</p>
                </div>
                <div>
                  <p className="mb-2">WIND</p>
                  <p>{weather.current.wind}</p>
                </div>
              </div>

              <div className="text-6xl animate-pulse">
                {WEATHER_ICONS[weather.forecast[0]?.iconType as keyof typeof WEATHER_ICONS] || '☀️'}
              </div>
            </div>

            {/* 7-Day Forecast Grid */}
            <h3 className="text-white text-center mb-6 text-sm">7-DAY COURSE FORECAST (TAP BOX FOR DETAILS)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {weather.forecast.map((day, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDay(day)}
                  className={`pixel-card p-4 text-center transform hover:-translate-y-2 transition-transform cursor-pointer group relative`}
                >
                  <div className="text-[8px] mb-2 text-gray-500">{day.date}</div>
                  <div className="text-[10px] text-black font-bold mb-4">{day.day.substring(0, 3).toUpperCase()}</div>
                  <div className="text-4xl mb-4">{WEATHER_ICONS[day.iconType as keyof typeof WEATHER_ICONS] || '⛅'}</div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[12px] text-red-600 font-bold">{day.high}°</div>
                    <div className="text-[12px] text-blue-600">{day.low}°</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hourly Detail Modal (Mario Pop-up) */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedDay(null)}>
          <div 
            className="w-full max-w-lg bg-[#5C94FC] pixel-border relative animate-in fade-in zoom-in duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#E4000F] p-4 flex justify-between items-center border-b-4 border-black shadow-lg">
              <h2 className="text-white text-sm">STAGE: {selectedDay.day.toUpperCase()}</h2>
              <button 
                onClick={() => setSelectedDay(null)}
                className="bg-black text-white w-10 h-10 flex items-center justify-center pixel-border hover:bg-red-800 transition-colors"
              >
                X
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] bg-sky-200/50">
              <div className="grid grid-cols-1 gap-4">
                {selectedDay.hourly && selectedDay.hourly.length > 0 ? (
                  selectedDay.hourly.map((hour, hIdx) => (
                    <div key={hIdx} className="bg-white pixel-border p-4 flex items-center justify-between text-black hover:bg-yellow-50 transition-colors">
                      <div className="text-[10px] font-bold w-16">{hour.time}</div>
                      <div className="text-3xl drop-shadow-sm">{WEATHER_ICONS[hour.iconType as keyof typeof WEATHER_ICONS] || '⛅'}</div>
                      <div className="text-[10px] flex-1 px-4 truncate font-bold">{hour.condition.toUpperCase()}</div>
                      <div className="text-[14px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{hour.temp}°C</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-white pixel-border text-black text-[10px]">
                    GAME OVER: NO HOURLY DATA FOR THIS STAGE!
                  </div>
                )}
              </div>
            </div>
            <div className="h-6 grass border-t-4 border-black"></div>
          </div>
        </div>
      )}

      {/* Mario Ground/Grass at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#924E00] z-0 border-t-4 border-black overflow-hidden shadow-2xl">
        <div className="grass h-4 absolute top-0 left-0 right-0"></div>
        {loading && (
          <div className="mario-sprite" style={{ animation: 'mario-walk 3s linear infinite' }}>
            🏃
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex pointer-events-none opacity-30">
         {Array.from({length: 20}).map((_, i) => (
           <div key={i} className="w-16 h-16 border-4 border-black/10 bg-[#924E00]"></div>
         ))}
      </div>
    </div>
  );
};

export default App;
