import { CloudRain, Sun, Wind, CloudLightning, Thermometer, Droplets, Loader2, MapPin, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/utils';
import PageBackground from '../components/PageBackground';

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
      <div className="flex h-[80dvh] items-center justify-center bg-white px-6 w-full">
        {!token ? (
          <div className="text-center p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 max-w-[280px] shrink-0">
            <div className="h-14 w-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <CloudRain className="h-7 w-7 text-sky-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Login Required</h3>
            <p className="text-slate-500 mb-6 text-[11px] font-medium leading-relaxed">Sign in to access hyper-local weather alerts for your exact farm location.</p>
            <a href="/login" className="block w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Sign In</a>
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
    <PageBackground className="w-full max-w-full overflow-x-hidden space-y-6 pb-20 px-4 sm:px-6">
      
      {/* ── HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left space-y-2 pt-2 px-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 mb-1">
           <Navigation className="h-3 w-3 text-sky-400 animate-pulse" />
           <span className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Live Agri-Forecast</span>
        </div>
        <h1 className="text-xl sm:text-5xl font-black tracking-tight text-white leading-none drop-shadow-2xl">
           Weather Dashboard
        </h1>
        <p className="text-white/60 font-medium text-[11px] sm:text-sm max-w-xs md:max-w-md mx-auto md:mx-0 leading-snug">
          Hyper-local conditions and forecasts tailored for your farm.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3 w-full">
         {/* ── LIVE WEATHER CARD ── */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-[32px] bg-sky-600 p-6 sm:p-12 text-white shadow-xl shadow-sky-100 relative overflow-hidden flex flex-col items-center md:items-stretch w-full max-w-full"
         >
            <div className="absolute right-0 top-0 opacity-10 -mr-20 -mt-20 pointer-events-none">
               <Sun className="h-64 w-64 md:h-96 md:w-96 animate-[spin_120s_linear_infinite]" />
            </div>
            
            <div className="relative z-10 w-full">
               <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-6 md:gap-8">
                  <div className="flex flex-col items-center md:items-start">
                     <p className="text-sky-100/60 text-[8px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Conditions</p>
                     <div className="flex items-center gap-1">
                        <h2 className="text-4xl md:text-8xl font-black tracking-tighter leading-none">{current.temp}<span className="text-xl md:text-5xl opacity-40">°C</span></h2>
                     </div>
                     <p className="text-sky-100 text-[14px] font-bold mt-2 tracking-tight line-clamp-1">{current.condition}</p>
                  </div>
                  <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                     <div className="inline-flex items-center gap-2 bg-slate-950/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 max-w-full overflow-hidden">
                        {current.isDetected && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 animate-pulse ring-4 ring-green-400/20" />}
                        <MapPin className="h-3 w-3 shrink-0 text-white/70" />
                        <span className="font-bold text-[9px] uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">{current.location}</span>
                     </div>
                     <p className="text-sky-200/40 text-[7px] font-black uppercase tracking-widest mt-2">{current.isDetected ? 'Auto-Detected' : 'Profile Source'}</p>
                  </div>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-8 bg-slate-950/30 backdrop-blur-2xl rounded-[24px] p-3 border border-white/10 w-full overflow-hidden">
               <MetricItem icon={<Thermometer className="h-3 w-3" />} label="Feels Like" value={`${current.feelsLike}°`} />
               <MetricItem icon={<Droplets className="h-3 w-3" />} label="Humidity" value={`${current.humidity}%`} isMiddle />
               <MetricItem icon={<Wind className="h-3 w-3" />} label="Wind" value={`${current.windSpeed} km/h`} />
            </div>
         </motion.div>

         {/* ── ALERTS SECTION ── */}
         <div className="glassmorphic rounded-[32px] p-8 flex flex-col w-full relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
            
            <h3 className="font-black text-white/50 text-[11px] flex items-center gap-2 mb-8 uppercase tracking-[0.2em] relative z-10">
               <div className="p-1 px-1.5 bg-white/5 rounded-lg border border-white/10">
                  <CloudLightning className="h-3.5 w-3.5 text-rose-400" />
               </div>
               Alert Center
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[180px] md:max-h-full no-scrollbar relative z-10">
               {alerts && alerts.length > 0 ? alerts.map((alert, idx) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={idx} 
                    className="rounded-2xl bg-white/5 p-4 border border-white/10 relative overflow-hidden"
                  >
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                     <span className="text-[7px] font-black text-rose-400 uppercase tracking-[0.2em]">{alert.type}</span>
                     <p className="text-[11px] text-white mt-1 font-bold leading-tight">{alert.message}</p>
                  </motion.div>
               )) : (
                  <div className="rounded-[22px] bg-emerald-500/10 p-8 flex flex-col items-center text-center border border-emerald-500/20">
                     <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mb-4">
                        <Sun className="h-4 w-4 text-emerald-400" />
                     </div>
                     <p className="text-[10px] text-emerald-400 font-black tracking-[0.2em] uppercase">Conditions Stable</p>
                  </div>
               )}
            </div>
            <button className="relative z-10 mt-8 w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/20 active:scale-95 transition-all">
               Safety Guidelines
            </button>
         </div>
      </div>

      {/* ── FORECAST SECTION ── */}
      <div className="space-y-4 pt-4 w-full">
         <div className="flex items-end justify-between px-2">
            <div>
               <h3 className="font-black text-white text-xl tracking-tight leading-none drop-shadow-lg">5-Day Forecast</h3>
               <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1.5">Growth Planning</p>
            </div>
         </div>
         
         <div className="w-full overflow-hidden">
            <div className="flex overflow-x-auto -mx-0 px-1 gap-3 no-scrollbar snap-x snap-mandatory">
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
                      className="flex-shrink-0 w-[100px] md:flex-1 snap-center"
                    >
                       <div className="flex flex-col items-center justify-center p-5 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 bg-white shadow-md shadow-slate-50 transition-all">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">{dayData.day}</p>
                          <div className={cn("h-10 w-10 md:h-16 md:w-16 rounded-[14px] md:rounded-[22px] flex items-center justify-center mb-5 shadow-inner", iconBg)}>
                             <IconComponent className={cn("h-5 w-5 md:h-8 md:w-8", iconColor)} />
                          </div>
                          <p className="text-xl md:text-3xl font-black text-slate-900">{dayData.temp}<span className="text-xs font-bold opacity-30">°</span></p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1">{dayData.condition}</p>
                       </div>
                    </motion.div>
                  );
               })}
            </div>
         </div>
      </div>
    </PageBackground>
  );
}

function MetricItem({ icon, label, value, isMiddle }) {
   return (
      <div className={cn(
         "flex flex-col gap-0.5 items-center justify-center p-3 md:p-6 transition-all",
         isMiddle && "sm:border-l sm:border-r border-white/5"
      )}>
         <div className="p-1 px-1.5 bg-white/10 rounded-lg mb-1.5 text-sky-200">
            {icon}
         </div>
         <span className="text-[7px] text-sky-200/50 font-black uppercase tracking-[0.2em]">{label}</span>
         <span className="text-sm font-black tracking-tight">{value}</span>
      </div>
   );
}
