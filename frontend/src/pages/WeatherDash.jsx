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
          <div className="text-center p-12 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 max-w-sm">
            <div className="h-16 w-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <CloudRain className="h-8 w-8 text-sky-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Login Required</h3>
            <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">Sign in to access hyper-local weather alerts and 5-day forecasts for your exact farm location.</p>
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
    <div className="mx-auto max-w-5xl space-y-10 pb-24 px-4 sm:px-6">
      
      {/* ── HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-50 rounded-full border border-sky-100 mb-4">
           <Navigation className="h-3 w-3 text-sky-600 animate-pulse" />
           <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Live Agri-Forecast</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
          Weather Dashboard
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto md:mx-0">
          Hyper-local conditions and 5-day forecasts tailored for precision farm planning.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* ── LIVE WEATHER CARD ── */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-[40px] bg-sky-600 p-8 md:p-12 text-white shadow-2xl shadow-sky-200 relative overflow-hidden group"
         >
            <div className="absolute right-0 top-0 opacity-10 -mr-20 -mt-20 group-hover:scale-105 transition-transform duration-1000">
               <Sun className="h-96 w-96 animate-[spin_120s_linear_infinite]" />
            </div>
            
            <div className="relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-8">
                  <div>
                     <p className="text-sky-100/70 text-xs font-black uppercase tracking-[0.3em] mb-4">Current Conditions</p>
                     <div className="flex items-center justify-center md:justify-start gap-4">
                        <h2 className="text-7xl md:text-8xl font-black tracking-tighter">{current.temp}<span className="text-4xl md:text-5xl opacity-40">°C</span></h2>
                     </div>
                     <p className="text-sky-100 text-xl font-bold mt-4 tracking-tight">{current.condition}</p>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                     <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
                        {current.isDetected && <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse outline outline-4 outline-green-400/20" />}
                        <MapPin className="h-4 w-4 text-white/70" />
                        <span className="font-black text-sm uppercase tracking-wider">{current.location}</span>
                     </div>
                     <p className="text-sky-200/50 text-[10px] font-black uppercase tracking-widest mt-3">
                        {current.isDetected ? 'Detected Source' : 'Profile Source'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 bg-slate-900/40 backdrop-blur-3xl rounded-[32px] p-6 border border-white/10">
               <MetricItem icon={<Thermometer />} label="Feels Like" value={`${current.feelsLike}°`} />
               <MetricItem icon={<Droplets />} label="Humidity" value={`${current.humidity}%`} isMiddle />
               <MetricItem icon={<Wind />} label="Wind" value={`${current.windSpeed} km/h`} />
            </div>
         </motion.div>

         {/* ── ALERTS SECTION ── */}
         <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/50 flex flex-col">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-3 mb-8">
               <div className="p-2 bg-rose-50 rounded-xl">
                  <CloudLightning className="h-5 w-5 text-rose-600" />
               </div>
               Alerts Center
            </h3>
            <div className="space-y-4 flex-1">
               {alerts && alerts.length > 0 ? alerts.map((alert, idx) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="rounded-3xl bg-rose-50/50 p-5 border border-rose-50 relative overflow-hidden"
                  >
                     <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
                     <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">{alert.type}</span>
                     <p className="text-[13px] text-slate-800 mt-2 font-bold leading-relaxed">{alert.message}</p>
                  </motion.div>
               )) : (
                  <div className="rounded-[32px] bg-emerald-50/50 p-8 flex flex-col items-center text-center border border-emerald-50">
                     <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <Sun className="h-6 w-6 text-emerald-500" />
                     </div>
                     <p className="text-sm text-emerald-900 font-black tracking-tight mb-1">Stable Conditions</p>
                     <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest">No Active Risks</p>
                  </div>
               )}
            </div>
            
            <button className="mt-8 w-full py-4 rounded-[20px] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
               Safety Guidelines
            </button>
         </div>
      </div>

      {/* ── FORECAST SECTION ── */}
      <div className="space-y-8 pt-10">
         <div className="flex items-end justify-between px-2">
            <div>
               <h3 className="font-black text-slate-900 text-2xl tracking-tight">5-Day Forecast</h3>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Growth phase planning</p>
            </div>
            <div className="hidden md:flex gap-2">
               <div className="h-2 w-8 bg-sky-500 rounded-full" />
               <div className="h-2 w-2 bg-slate-100 rounded-full" />
            </div>
         </div>
         
         <div className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 gap-5 no-scrollbar snap-x snap-mandatory">
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
                   whileHover={{ y: -5 }}
                   className="flex-shrink-0 w-[140px] md:flex-1 snap-center"
                 >
                    <div className="flex flex-col items-center justify-center p-8 rounded-[32px] border border-slate-100 bg-white shadow-lg shadow-slate-100/50 group transition-all">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{dayData.day}</p>
                       <div className={cn("h-16 w-16 rounded-[22px] flex items-center justify-center mb-8 shadow-inner", iconBg)}>
                          <IconComponent className={cn("h-8 w-8", iconColor)} />
                       </div>
                       <p className="text-3xl font-black text-slate-900 group-hover:scale-110 transition-transform">{dayData.temp}<span className="text-base font-bold opacity-30">°</span></p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-2">{dayData.condition}</p>
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
         "flex flex-col gap-1 items-center justify-center p-6 transition-all hover:bg-white/5 cursor-default",
         isMiddle && "sm:border-l sm:border-r border-white/5"
      )}>
         <div className="p-2.5 bg-white/10 rounded-xl mb-3 text-sky-200">
            {icon}
         </div>
         <span className="text-[9px] text-sky-200/50 font-black uppercase tracking-[0.2em]">{label}</span>
         <span className="text-xl font-black tracking-tight">{value}</span>
      </div>
   );
}
