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
  TrendingDown,
  CloudSun
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/utils';
import { API_URL } from '../config';
const DEFAULT_BG = "https://images.unsplash.com/photo-1592150621344-824c2889a246?q=80&w=2070&auto=format&fit=crop";

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
    dashboardBg: null,
    dashboardBgMobile: null,
    loading: true
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, irrigationRes, communityRes, marketRes, camResRes, notifRes, spotlightRes, bgRes, bgMobileRes] = await Promise.all([
          fetch(`${API_URL}/api/weather/current`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/irrigation/advice`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/community/posts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/agriCamUrl`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/spotlights`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/user_dashboard_bg`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/user_dashboard_bg_mobile`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [weather, irrigation, community, market, camData, notif, spotlight, bgData, bgMobileData] = await Promise.all([
          weatherRes.json(), irrigationRes.json(), communityRes.json(), marketRes.json(), camResRes.json(), notifRes.json(), spotlightRes.json(), bgRes.json(), bgMobileRes.json()
        ]);

        setData({
          weather: weather.success ? weather.data : null,
          irrigation: irrigation.success ? irrigation.data : null,
          community: community.success ? community.data : null,
          market: market.success ? market.data : null,
          agriCamUrl: camData.success ? camData.data : '',
          notifications: notif.success ? notif.notifications : [],
          spotlights: spotlight.success ? spotlight.data : [],
          dashboardBg: bgData.success ? bgData.data : null,
          dashboardBgMobile: bgMobileData.success ? bgMobileData.data : null,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, [token]);

  if (data.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const topPost = data.community?.sort((a, b) => b.likes - a.likes)[0];
  const irrigationTasks = Object.entries(data.irrigation || {})
    .filter(([key, val]) => key.startsWith('Zone'))
    .map(([key, val]) => ({ name: key, ...val }));

  return (
    <div className="relative min-h-screen">
      {/* ── BACKGROUND IMAGE ── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed transition-all duration-700 pointer-events-none"
        style={{ 
          backgroundImage: `url('${
            (isMobile && data.dashboardBgMobile)
              ? (data.dashboardBgMobile.startsWith('http') ? data.dashboardBgMobile : `${API_URL}${data.dashboardBgMobile}`)
              : data.dashboardBg 
                ? (data.dashboardBg.startsWith('http') ? data.dashboardBg : `${API_URL}${data.dashboardBg}`) 
                : DEFAULT_BG
          }')`,
          imageRendering: 'auto'
        }}
      >
        {/* Crisp overlay - No blur for maximum photo quality */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10 pb-20 px-4 sm:px-6 pt-10">
      
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
          Farm Overview
        </h1>
        <p className="text-white/80 font-medium tracking-tight drop-shadow-md">
          Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}. Here's a summary of your farm's status today.
        </p>
      </div>
      
      {/* ── SPOTLIGHT SECTION ── */}
      {data.spotlights && data.spotlights.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            {data.spotlights.map((spot, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={spot._id}
                className={cn(
                  "relative flex-none w-full md:w-[600px] h-[320px] rounded-[40px] overflow-hidden group snap-center border border-slate-100 shadow-sm",
                  spot.color === 'indigo-600' ? 'bg-indigo-600' : 
                  spot.color === 'green-600' ? 'bg-green-600' : 
                  spot.color === 'amber-600' ? 'bg-amber-600' : 
                  spot.color === 'rose-600' ? 'bg-rose-600' : 'bg-slate-900'
                )}
              >
                {/* Background Graphics */}
                <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
                  <img 
                    src={spot.imageUrl} 
                    className="w-full h-full object-cover"
                    alt="" 
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent" />
                
                <div className="relative h-full p-10 flex flex-col justify-between z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                        {spot.badge || 'Featured'}
                      </span>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                        {spot.brand}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight max-w-sm">
                      {spot.title}
                    </h2>
                    
                    <p className="text-white/80 text-sm font-medium max-w-xs line-clamp-2">
                      {spot.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <a 
                      href={spot.link || '#'}
                      className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-black/10 hover:bg-slate-50"
                    >
                      {spot.buttonText || 'Discover More'}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                    
                    {spot.type === 'video' && (
                      <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Image floating graphic */}
                {spot.secondaryImageUrl && (
                  <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 opacity-100 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <img src={spot.secondaryImageUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── TOP STATS ROW (COMPACT GLOSSY GRID) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            icon={<Droplets className="h-6 w-6 text-blue-500" />}
            label="Soil Moisture"
            value={`${data.irrigation?.['Zone A']?.moisture || 34}%`}
            iconBg="bg-blue-50"
        />
        <StatCard 
            icon={<Sprout className="h-6 w-6 text-green-500" />}
            label="Crop Health"
            value="Excellent"
            iconBg="bg-green-50"
        />
        <StatCard 
            icon={<TrendingUp className="h-6 w-6 text-amber-500" />}
            label="Wheat Price"
            value={`Rs. ${data.market?.[0]?.pricePerKg || '2,100'}/q`}
            iconBg="bg-amber-50"
        />
        <StatCard 
            icon={<CloudSun className="h-6 w-6 text-orange-500" />}
            label="Weather Alerts"
            value={data.weather?.condition || "Stable Conditions"}
            iconBg="bg-orange-50"
        />
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Irrigation Schedule */}
        <div className="lg:col-span-2 glassmorphic rounded-[32px] p-8">
           <h2 className="text-lg font-black text-white/90 mb-8 px-2">Irrigation Schedule</h2>
           <div className="space-y-4">
              {irrigationTasks.length > 0 ? irrigationTasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/15 transition-all cursor-pointer hover:border-white/30 hover:translate-x-1 group/item">
                   <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 group-hover/item:scale-110 transition-transform">
                         <Droplets className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                         <p className="font-black text-white tracking-tight">{task.name} ({task.crop || 'Wheat'})</p>
                         <p className="text-[10px] font-bold text-white/40 px-2 bg-white/5 rounded-md w-fit uppercase tracking-widest mt-1">Status: Optimal</p>
                      </div>
                   </div>
                   <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-blue-500/10 text-blue-200 border border-blue-500/20 group-hover/item:bg-blue-500/30 transition-colors">
                     {idx === 0 ? "GOOD" : "OPTIMAL"}
                   </span>
                </div>
              )) : (
                <p className="text-center py-10 italic text-white/40">No active schedules.</p>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: Community Focus */}
        <div className="glassmorphic rounded-[32px] p-10 flex flex-col justify-between text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="h-24 w-24" />
           </div>
           
           <div className="relative z-10 space-y-6">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Community Focus</span>
              
              {/* Featured Community Image */}
              {topPost?.image && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl group/img">
                   <img 
                     src={topPost.image} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                     alt="Featured Post" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              <div className="space-y-4">
                 <h3 className="text-2xl font-black leading-tight text-white">"{topPost?.title || "Tomato Farming Tips"}"</h3>
                 <p className="text-white/60 text-sm font-medium leading-relaxed line-clamp-4">
                    {topPost?.content || "Tomato grows best in 20-30°C with well-drained soil. Seedlings are transplanted after 20-30 days. Regular watering and proper spacing are..."}
                 </p>
              </div>
           </div>

           <div className="mt-12 flex items-center justify-between relative z-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex items-center justify-center text-xs font-black shadow-lg">S</div>
                 <p className="text-sm font-black text-white/90">Saikumar</p>
              </div>
              <button 
                onClick={() => window.location.href = '/app/community'}
                className="text-xs font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
              >
                View Discussion &rarr;
              </button>
           </div>
        </div>

      </div>

    </div>
    </div>
  );
}

function StatCard({ icon, label, value, iconBg }) {
  return (
    <div className="bg-white/15 backdrop-blur-2xl border border-white/30 p-4 md:p-6 rounded-[28px] md:rounded-[32px] hover:scale-[1.02] transition-all group cursor-pointer duration-500 relative overflow-hidden shadow-2xl shadow-black/10">
       {/* Glass Reflection Highlight */}
       <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
       
       {/* High-end decorative glow element */}
       <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
       
       {/* Shimmer line layer */}
       <div className="absolute -inset-x-full top-0 h-[200%] w-[15%] bg-white/15 skew-x-[-35deg] group-hover:animate-[shimmer_1.5s_ease-in-out_infinite] pointer-events-none hidden md:block" />

       <div className={cn(
         "h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-inner", 
         "bg-white/20 border border-white/40"
       )}>
          {icon}
       </div>
       <div className="space-y-0.5 md:space-y-1 relative z-10">
          <p className="text-[9px] md:text-[10px] font-black text-white/50 bg-white/5 px-2 py-0.5 rounded-full w-fit uppercase tracking-[0.15em] mb-1 group-hover:text-white/70 transition-colors">{label}</p>
          <p className="text-xl md:text-2xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight truncate">{value}</p>
       </div>
    </div>
  );
}
