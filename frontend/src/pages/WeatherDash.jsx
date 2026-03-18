import { CloudRain, Sun, Wind, CloudLightning, Thermometer, Droplets, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WeatherDash() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/weather/current')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWeatherData(data.data);
        }
      })
      .catch(err => console.error('Error fetching weather:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !weatherData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const { current, alerts, forecast } = weatherData;
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <CloudRain className="h-8 w-8 text-sky-500" />
          Agri-Weather Dashboard
        </h1>
        <p className="mt-2 text-slate-500">
          Hyper-local weather conditions and 5-day forecasts tailored for farm planning.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Live weather large card */}
         <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-600 p-8 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-20 -mr-10 -mt-10">
               <Sun className="h-64 w-64 animate-[spin_60s_linear_infinite]" />
            </div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start">
                  <div>
                     <h2 className="text-5xl font-black">{current.temp}°C</h2>
                     <p className="text-sky-100 text-lg font-medium mt-1">{current.condition}</p>
                  </div>
                  <div className="text-right">
                     <p className="font-semibold text-lg">{current.location}</p>
                     <p className="text-sky-200 text-sm">Updated via INSAT-3D</p>
                  </div>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-4 mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
               <div className="flex flex-col gap-1 items-center justify-center p-2">
                  <Thermometer className="h-6 w-6 text-sky-200" />
                  <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider">Feels Like</span>
                  <span className="text-lg font-bold">{current.feelsLike}°C</span>
               </div>
               <div className="flex flex-col gap-1 items-center justify-center p-2 border-l border-r border-white/10">
                  <Droplets className="h-6 w-6 text-sky-200" />
                  <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider">Humidity</span>
                  <span className="text-lg font-bold">{current.humidity}%</span>
               </div>
               <div className="flex flex-col gap-1 items-center justify-center p-2">
                  <Wind className="h-6 w-6 text-sky-200" />
                  <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider">Wind Speed</span>
                  <span className="text-lg font-bold">{current.windSpeed} km/h</span>
               </div>
            </div>
         </div>

         {/* Alerts card */}
         <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="font-bold text-rose-900 flex items-center gap-2 mb-4">
                  <CloudLightning className="h-5 w-5 text-rose-600" /> Weather Alerts
               </h3>
               {alerts && alerts.map((alert, idx) => (
                  <div key={idx} className="rounded-xl bg-white p-4 border border-rose-100 shadow-sm relative overflow-hidden mb-3">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                     <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{alert.type}</span>
                     <p className="text-sm text-slate-800 mt-1 font-medium">{alert.message}</p>
                  </div>
               ))}
               {(!alerts || alerts.length === 0) && (
                  <div className="rounded-xl bg-green-50 p-4 border border-green-100 shadow-sm">
                     <p className="text-sm text-green-800 font-medium">No active alerts. Conditions are stable.</p>
                  </div>
               )}
            </div>
            
            <button className="mt-6 w-full py-2.5 rounded-xl bg-rose-100/50 text-rose-700 font-semibold text-sm hover:bg-rose-100 transition-colors">
               Acknowledge Setup
            </button>
         </div>
      </div>

      {/* Forecast Row */}
      <h3 className="font-bold text-slate-800 text-xl border-b border-slate-200 pb-2">5-Day Forecast</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
         {forecast.map((dayData, idx) => {
            let IconComponent = Sun;
            let iconColor = 'text-orange-500';
            
            if (dayData.condition === 'Rain') {
               IconComponent = CloudRain;
               iconColor = 'text-sky-500';
            } else if (dayData.condition === 'Storm') {
               IconComponent = CloudLightning;
               iconColor = 'text-indigo-500';
            }
            
            return (
              <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow transition-shadow">
                 <p className="text-sm font-semibold text-slate-500 uppercase mb-3">{dayData.day}</p>
                 <IconComponent className={`h-8 w-8 mb-3 ${iconColor}`} />
                 <p className="text-xl font-bold text-slate-800">{dayData.temp}°</p>
              </div>
            );
         })}
      </div>
    </div>
  );
}
