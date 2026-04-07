import { CloudRain, Sun, Wind, CloudLightning, Thermometer, Droplets, Loader2, MapPin, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/utils';

export default function WeatherDash() {
  const { token } = useAuth();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = (lat = null, lon = null) => {
    let url = `${API_URL}/api/weather/current`;
    if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    }

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWeatherData(data.data);
        }
      })
      .catch(err => console.error('Error fetching weather:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation access denied or failed. Falling back to profile location.");
          fetchWeather();
        }
      );
    } else {
      fetchWeather();
    }
  }, [token]);

  if (loading || !weatherData) {
    return (
      <div className="flex h-[80dvh] items-center justify-center bg-white px-6">
        {!token ? (
          <div className="text-center p-10 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 max-w-sm shrink-0">
            <div className="h-16 w-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <CloudRain className="h-8 w-8 text-sky-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Login Required</h3>
            <p className="text-slate-500 mb-8 text-[13px] font-medium leading-relaxed">Sign in to access hyper-local weather alerts and 5-day forecasts for your exact farm location.</p>
            <a href="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Sign In</a>
          </div>
        ) : (
          <div className="relative">
             <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
             <div className="absolute inset-0 blur-xl bg-sky-400/20 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  const { current, alerts, forecast } = weatherData;
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 px-4 sm:px-6">
      
      {/* ── HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left space-y-1.5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 rounded-full border border-sky-100 mb-2">
           <Navigation className="h-3 w-3 text-sky-600 animate-pulse" />
           <span className="text-[9px] font-black text-sky-700 uppercase tracking-widest">Live Agri-Forecast</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Weather Dashboard
        </h1>
        <p className="text-slate-500 font-medium text-[13px] max-w-md mx-auto md:mx-0">
          Hyper-local conditions and 5-day forecasts tailored for farm planning.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* ── LIVE WEATHER CARD ── */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-[32px] md:rounded-[40px] bg-sky-600 p-6 sm:p-8 md:p-12 text-white shadow-xl shadow-sky-100 relative overflow-hidden group"
         >
            <div className="absolute right-0 top-0 opacity-10 -mr-16 -mt-16 md:-mr-20 md:-mt-20 group-hover:scale-105 transition-transform duration-1000">
               <Sun className="h-64 w-64 md:h-96 md:w-96 animate-[spin_120s_linear_infinite]" />
            </div>
            
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-6 md:gap-8">
                  <div>
                     <p className="text-sky-100/60 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Current Conditions</p>
                     <div className="flex items-center justify-center md:justify-start gap-3">
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter">{current.temp}<span className="text-3xl md:text-5xl opacity-40">°C</span></h2>
                     </div>
                     <p className="text-sky-100 text-lg font-bold mt-3 tracking-tight">{current.condition}</p>
                  </div>
                  <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                     <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 w-max">
                        {current.isDetected && <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse outline outline-4 outline-green-400/20" />}
                        <MapPin className="h-3.5 w-3.5 text-white/70" />
                        <span className="font-black text-[11px] uppercase tracking-wider truncate max-w-[140px]">{current.location}</span>
                     </div>
                     <p className="text-sky-200/50 text-[9px] font-black uppercase tracking-widest mt-2">
                        {current.isDetected ? 'Detected Source' : 'Profile Source'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-10 bg-slate-900/40 backdrop-blur-2xl rounded-[28px] p-4 border border-white/10 overflow-hidden">
               <MetricItem icon={<Thermometer className="h-4 w-4" />} label="Feels Like" value={`${current.feelsLike}°`} />
               <MetricItem icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${current.humidity}%`} isMiddle />
               <MetricItem icon={<Wind className="h-4 w-4" />} label="Wind" value={`${current.windSpeed} km/h`} />
            </div>
         </motion.div>

         {/* ── ALERTS SECTION ── */}
         <div className="rounded-[32px] md:rounded-[40px] border border-slate-100 bg-white p-6 sm:p-8 shadow-xl shadow-slate-100/50 flex flex-col">
            <h3 className="font-black text-slate-900 text-[16px] flex items-center gap-3 mb-6 font-bold uppercase tracking-tight">
               <div className="p-1.5 bg-rose-50 rounded-lg">
                  <CloudLightning className="h-4 w-4 text-rose-600" />
               </div>
               Alerts Center
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
               {alerts && alerts.length > 0 ? alerts.map((alert, idx) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="rounded-2xl bg-rose-50/50 p-4 border border-rose-50 relative overflow-hidden"
                  >
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                     <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em]">{alert.type}</span>
                     <p className="text-[12px] text-slate-800 mt-1 font-bold leading-snug">{alert.message}</p>
                  </motion.div>
               )) : (
                  <div className="rounded-[24px] bg-emerald-50/50 p-6 flex flex-col items-center text-center border border-emerald-50">
                     <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                        <Sun className="h-5 w-5 text-emerald-500" />
                     </div>
                     <p className="text-[12px] text-emerald-900 font-black tracking-tight mb-1">Stable Conditions</p>
                     <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest leading-none">No Active Risks</p>
                  </div>
               )}
            </div>
            
            <button className="mt-6 w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
               Guidelines
            </button>
         </div>
      </div>

      {/* ── FORECAST SECTION ── */}
      <div className="space-y-6 pt-4">
         <div className="flex items-end justify-between px-1">
            <div>
               <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none">5-Day Forecast</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 leading-none">Growth Phase</p>
            </div>
            <div className="hidden sm:flex gap-1.5 h-1.5 overflow-hidden">
               <div className="w-6 bg-sky-500 rounded-full" />
               <div className="w-1.5 bg-slate-100 rounded-full" />
            </div>
         </div>
         
         <div className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 gap-4 no-scrollbar snap-x snap-mandatory">
            {forecast.map((dayData, idx) => {
               let iconColor = 'text-sky-500';
               let iconBg = 'bg-sky-50';
               let IconComponent = Sun;
               
               if (dayData.condition === 'Rain') {
                  IconComponent = CloudRain;
                  iconColor = 'text-blue-500';
                  iconBg = 'bg-blue-50';
               } else if (dayData.condition === 'Storm') {
                  IconComponent = CloudLightning;
                  iconColor = 'text-indigo-600';
                  iconBg = 'bg-indigo-50';
               } else {
                  iconColor = 'text-amber-500';
                  iconBg = 'bg-amber-50';
               }
               
               return (
                 <motion.div 
                   key={idx} 
                   whileHover={{ y: -4 }}
                   className="flex-shrink-0 w-[120px] md:flex-1 snap-center"
                 >
                    <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-slate-100 bg-white shadow-md shadow-slate-50 group transition-all">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{dayData.day}</p>
                       <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-[18px] md:rounded-[22px] flex items-center justify-center mb-6 shadow-inner", iconBg)}>
                          <IconComponent className={cn("h-6 w-6 md:h-8 md:w-8", iconColor)} />
                       </div>
                       <p className="text-2xl md:text-3xl font-black text-slate-900 group-hover:scale-110 transition-transform">{dayData.temp}<span className="text-sm font-bold opacity-30">°</span></p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{dayData.condition}</p>
                    </div>
                 </motion.div>
               );
            })}
         </div>
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value, isMiddle }) {
   return (
      <div className={cn(
         "flex flex-col gap-1 items-center justify-center p-4 md:p-6 transition-all hover:bg-white/5 cursor-default",
         isMiddle && "sm:border-l sm:border-r border-white/5 lg:border-white/5"
      )}>
         <div className="p-2 bg-white/10 rounded-lg mb-2 text-sky-200">
            {icon}
         </div>
         <span className="text-[8px] text-sky-200/50 font-black uppercase tracking-[0.2em]">{label}</span>
         <span className="text-base font-black tracking-tight">{value}</span>
      </div>
   );
}
