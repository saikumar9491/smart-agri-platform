import { 
  Droplets, 
  Sprout, 
  TrendingUp, 
  SunSnow, 
  Users, 
  Play, 
  Loader2, 
  MapPin,
  Calendar,
  ChevronRight,
  Wind,
  CloudLightning
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/utils';
import { API_URL } from '../config';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    weather: null,
    irrigation: null,
    community: null,
    market: null,
    agriCamUrl: '',
    notifications: [],
    spotlights: [],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, irrigationRes, communityRes, marketRes, camResRes, notifRes, spotlightRes] = await Promise.all([
          fetch(`${API_URL}/api/weather/current`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/irrigation/advice`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/community/posts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/agriCamUrl`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/spotlights`)
        ]);

        const [weather, irrigation, community, market, camData, notif, spotlights] = await Promise.all([
          weatherRes.json(), irrigationRes.json(), communityRes.json(), marketRes.json(), camResRes.json(), notifRes.json(), spotlightRes.json()
        ]);

        setData({
          weather: weather.success ? weather.data : null,
          irrigation: irrigation.success ? irrigation.data : null,
          community: community.success ? community.data : null,
          market: market.success ? market.data : null,
          agriCamUrl: camData.success ? camData.data : '',
          notifications: notif.success ? notif.notifications : [],
          spotlights: spotlights.success ? spotlights.data : [],
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, [token]);

  // Dynamic Greeting Logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (data.loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-white">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          <div className="absolute inset-0 blur-xl bg-green-400/20 animate-pulse" />
        </div>
      </div>
    );
  }

  const topPost = data.community?.sort((a, b) => b.likes - a.likes)[0];
  const irrigationTasks = Object.entries(data.irrigation || {})
    .filter(([key, val]) => key.startsWith('Zone'))
    .map(([key, val]) => ({ name: key, ...val }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-24 px-4 sm:px-6">
      
      {/* ── AGRI-PULSE HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Smart Farm Control Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
            {greeting}, <span className="text-green-700">{user?.name?.split(' ')[0] || 'Farmer'}</span> 🌻
          </h1>
          <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {user?.location || 'India'} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Quick Weather Chip */}
        <div className="bg-white rounded-[28px] border border-slate-100 p-4 shadow-xl shadow-slate-100/50 flex items-center gap-5 min-w-[240px]">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <SunSnow className="h-6 w-6 text-amber-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</p>
                <p className="text-xl font-black text-slate-900">{data.weather?.temp || '28'}°C</p>
             </div>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Wind className="h-6 w-6 text-blue-500" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</p>
                <p className="text-xl font-black text-slate-900">{data.weather?.humidity || '45'}%</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* WIDGET 1: Moisture Wave (1x2) */}
        <BentoCard className="md:row-span-2 flex flex-col justify-between overflow-hidden">
           <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                 <div className="p-3 bg-blue-50 rounded-2xl">
                    <Droplets className="h-6 w-6 text-blue-500" />
                 </div>
                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase">Zone A</span>
              </div>
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1 pl-1">Soil Moisture</h3>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">
                {data.irrigation?.['Zone A']?.moisture || 45}<span className="text-xl text-slate-400">%</span>
              </p>
           </div>
           
           <div className="relative h-40 w-full bg-blue-50/30">
              <MoistureWave level={data.irrigation?.['Zone A']?.moisture || 45} />
              <div className="absolute bottom-6 left-6 text-blue-900/50 text-[10px] font-black uppercase tracking-tighter z-20">
                Optimal Level
              </div>
           </div>
        </BentoCard>

        {/* WIDGET 2: Market Pulse (2x1) */}
        <BentoCard className="md:col-span-2 p-6 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 h-32 w-32 bg-indigo-500/5 blur-3xl rounded-full" />
           <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                    <TrendingUp className="h-6 w-6 text-white" />
                 </div>
                 <div>
                    <h3 className="text-slate-900 font-black text-lg">Market Pulse</h3>
                    <p className="text-xs font-bold text-slate-400">Live Trade Trends</p>
                 </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Bullish Market</span>
           </div>

           <div className="mt-8 flex items-end justify-between gap-4 z-10">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Crop: Wheat</p>
                 <p className="text-4xl font-black text-slate-900 leading-none">₹2,840/q</p>
              </div>
              <div className="flex-1 max-w-[140px] h-16 pb-2">
                 <PriceSparkline />
              </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between z-10">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i*10}`} alt="" />
                  </div>
                ))}
                <div className="h-7 w-7 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">+12</div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Farmers are listing now</p>
           </div>
        </BentoCard>

        {/* WIDGET 3: Weather Alert (1x1) */}
        <BentoCard className="p-6 bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-xl shadow-orange-100 flex flex-col justify-between group">
           <div className="flex items-center justify-between">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30">
                 <CloudLightning className="h-5 w-5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/10 rounded-md">Advisory</span>
           </div>
           <div className="mt-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/70">Weather Alert</h3>
              <p className="text-2xl font-black leading-tight mt-1 group-hover:translate-x-1 transition-transform cursor-pointer">Rain Expected <span className="block text-sm text-white/50">in 14 hours</span></p>
           </div>
           <button className="mt-4 text-[10px] font-black uppercase tracking-widest underline underline-offset-4 decoration-2 decoration-white/30">Detailed Forecast</button>
        </BentoCard>

        {/* WIDGET 4: Harvest Timeline (2x2) */}
        <BentoCard className="md:col-span-2 md:row-span-2 p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <div className="p-3.5 bg-green-600 rounded-[22px] shadow-lg shadow-green-100">
                    <Sprout className="h-7 w-7 text-white" />
                 </div>
                 <div>
                    <h3 className="text-slate-900 font-black text-xl tracking-tight">Harvest Timeline</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth Progress Tracking</p>
                 </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                 <Calendar className="h-5 w-5 text-slate-400" />
              </div>
           </div>

           <div className="space-y-8 flex-1">
              {irrigationTasks.slice(0, 3).map((task, idx) => (
                <div key={idx} className="group cursor-pointer">
                   <div className="flex items-center justify-between mb-3 pr-1">
                      <div className="flex items-center gap-3">
                         <div className={cn("h-2.5 w-2.5 rounded-full", task.status === 'Critical' ? "bg-rose-500 animate-pulse" : "bg-green-500")} />
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{task.crop}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase">12 Days to Harvest</span>
                   </div>
                   
                   {/* Progress Bar */}
                   <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: task.status === 'Critical' ? '40%' : '75%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full relative overflow-hidden",
                          task.status === 'Critical' ? "bg-rose-500" : "bg-green-500"
                        )}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                   </div>
                   
                   <div className="flex justify-between items-center mt-2 px-1 text-[9px] font-bold uppercase text-slate-400 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Seedling</span>
                      <span className="text-slate-600 font-black">Growth Phase</span>
                      <span>Ripening</span>
                   </div>
                </div>
              ))}
           </div>

           <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all hover:bg-slate-800">
              Update Crop Health Manual
           </button>
        </BentoCard>

        {/* WIDGET 5: Community Buzz (1x1) */}
        <BentoCard className="p-6 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute -right-8 bottom-0 opacity-10 group-hover:translate-x-2 group-hover:rotate-6 transition-transform duration-700">
              <Users className="h-40 w-40" />
           </div>
           
           <div className="z-10">
              <div className="flex items-center gap-2 mb-4">
                 <div className="flex -space-x-1.5">
                    {[1, 2].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i*50}`} className="h-6 w-6 rounded-full border-2 border-slate-900" />)}
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trending Now</span>
              </div>
              <h3 className="text-base font-bold leading-tight line-clamp-3">"{topPost?.title || "Community Update"}"</h3>
           </div>
           
           <div className="z-10 flex items-center justify-between border-t border-white/10 pt-4 mt-4">
              <span className="text-[9px] font-black text-slate-500 uppercase">Nearby Bihar</span>
              <ChevronRight className="h-4 w-4 text-slate-500" />
           </div>
        </BentoCard>

        {/* WIDGET 6: Live Control Room (1x1) */}
        <BentoCard className="flex flex-col relative group overflow-hidden bg-slate-200">
           {data.agriCamUrl ? (
             <>
                <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover brightness-50 contrast-125" playsInline>
                   <source src={data.agriCamUrl?.startsWith('/uploads') ? `${API_URL}${data.agriCamUrl}` : (data.agriCamUrl || "")} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-transparent transition-colors z-10" />
                <div className="relative z-20 p-5 flex flex-col justify-between h-full text-white pointer-events-none">
                   <div className="flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">Live Cam</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 fill-white" />
                      <span className="text-xs font-black uppercase tracking-widest drop-shadow-md">Area 12 Feed</span>
                   </div>
                </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
                <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connecting Feed...</span>
             </div>
           )}
        </BentoCard>

      </div>
    </div>
  );
}

function BentoCard({ children, className, style }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={cn(
        "rounded-[38px] bg-white border border-slate-100 shadow-xl shadow-slate-100/30 transition-all hover:shadow-2xl hover:shadow-slate-200/50",
        className
      )}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function MoistureWave({ level }) {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d="M0 20 C 30 10, 70 30, 100 20 V 40 H 0 Z" fill="url(#waveGrad)">
           <animate attributeName="d" 
             values="M0 20 C 30 10, 70 30, 100 20 V 40 H 0 Z;
                     M0 20 C 30 30, 70 10, 100 20 V 40 H 0 Z;
                     M0 20 C 30 10, 70 30, 100 20 V 40 H 0 Z" 
             dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M0 25 C 20 15, 80 35, 100 25 V 40 H 0 Z" fill="#3b82f6" opacity="0.3">
           <animate attributeName="d" 
             values="M0 25 C 20 15, 80 35, 100 25 V 40 H 0 Z;
                     M0 25 C 20 35, 80 15, 100 25 V 40 H 0 Z;
                     M0 25 C 20 15, 80 35, 100 25 V 40 H 0 Z" 
             dur="6s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
}

function PriceSparkline() {
  return (
    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
      <motion.path
        d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 10 L90 8 L100 12"
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.circle cx="100" cy="12" r="3" fill="#6366f1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} />
    </svg>
  );
}
