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
  CloudSun,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn, resolveImageUrl } from '../utils/utils';
import { API_URL } from '../config';
const DEFAULT_BG = "https://images.unsplash.com/photo-1592150621344-824c2889a246?q=80&w=2070&auto=format&fit=crop";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
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
    tiles: {
      crop_guide: null,
      disease_ml: null,
      irrigation: null,
      market_prices: null,
      marketplace: null
    },
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
        const [
          weatherRes, irrigationRes, communityRes, marketRes, camResRes, 
          notifRes, spotlightRes, bgRes, bgMobileRes,
          tCropRes, tDiseaseRes, tIrrRes, tMarketRes, tSalesRes
        ] = await Promise.all([
          fetch(`${API_URL}/api/weather/current`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/irrigation/advice`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/community/posts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/agriCamUrl`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/spotlights`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/user_dashboard_bg`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/user_dashboard_bg_mobile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/tile_crop_guide`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/tile_disease_ml`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/tile_irrigation`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/tile_market_prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/tile_marketplace`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [
          weather, irrigation, community, market, camData, 
          notif, spotlight, bgData, bgMobileData,
          tCrop, tDisease, tIrr, tMarket, tSales
        ] = await Promise.all([
          weatherRes.json(), irrigationRes.json(), communityRes.json(), marketRes.json(), camResRes.json(), 
          notifRes.json(), spotlightRes.json(), bgRes.json(), bgMobileRes.json(),
          tCropRes.json(), tDiseaseRes.json(), tIrrRes.json(), tMarketRes.json(), tSalesRes.json()
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
          tiles: {
            crop_guide: tCrop.success ? tCrop.data : null,
            disease_ml: tDisease.success ? tDisease.data : null,
            irrigation: tIrr.success ? tIrr.data : null,
            market_prices: tMarket.success ? tMarket.data : null,
            marketplace: tSales.success ? tSales.data : null
          },
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
      {/* ── PROFESSIONAL DEEP FOREST BACKGROUND ── */}
      <div 
        className="fixed inset-0 z-[-10] bg-gradient-to-br from-[#064e3b] via-[#022c22] to-black"
      />
      <div className="fixed inset-0 z-[-5] pointer-events-none overflow-hidden">
        <img 
          src={resolveImageUrl(
            isMobile ? (data.dashboardBgMobile || data.dashboardBg) : data.dashboardBg, 
            DEFAULT_BG
          )}
          alt=""
          className="w-full h-full object-cover opacity-50 transition-opacity duration-1000"
          onError={(e) => {
            // Revert to default if custom fails, instead of hiding
            if (e.target.src !== DEFAULT_BG) {
              e.target.src = DEFAULT_BG;
            }
          }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10 pb-20 px-4 sm:px-6 pt-10">
      
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
          Farm Overview
        </h1>
        <p className="text-white/80 font-medium tracking-tight drop-shadow-md flex items-center gap-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}. Here's a summary of your farm's status today.
          <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase tracking-tighter">V3-Fixed</span>
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
                  "relative flex-none w-full md:w-[600px] h-[320px] rounded-[40px] overflow-hidden group snap-center border border-white/10 shadow-sm",
                  spot.color === 'indigo-600' ? 'bg-indigo-600' : 
                  spot.color === 'green-600' ? 'bg-green-600' : 
                  spot.color === 'amber-600' ? 'bg-amber-600' : 
                  spot.color === 'rose-600' ? 'bg-rose-600' : 'bg-slate-900'
                )}
              >
                <div className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-110">
                  <img 
                    src={resolveImageUrl(spot.imageUrl, '')} 
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
                  </div>
                </div>
                {spot.secondaryImageUrl && (
                  <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 opacity-100 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <img src={resolveImageUrl(spot.secondaryImageUrl, '')} className="w-full h-full object-contain" alt="" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── TOP STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            icon={<Droplets className="h-6 w-6 text-blue-500" />}
            label="Soil Moisture"
            value={`${data.irrigation?.['Zone A']?.moisture || 34}%`}
            onClick={() => navigate('/app/irrigation')}
        />
        <StatCard 
            icon={<Sprout className="h-6 w-6 text-green-500" />}
            label="Crop Health"
            value="Excellent"
            onClick={() => navigate('/app/crops')}
        />
        <StatCard 
            icon={<TrendingUp className="h-6 w-6 text-amber-500" />}
            label="Wheat Price"
            value={`Rs. ${data.market?.[0]?.pricePerKg || '2,100'}/q`}
            onClick={() => navigate('/app/market')}
        />
        <StatCard 
            icon={<CloudSun className="h-6 w-6 text-orange-500" />}
            label="Weather Alerts"
            value={data.weather?.condition || "Stable Conditions"}
            onClick={() => navigate('/app/weather')}
        />
      </div>

      {/* ── PLATFORM TOOLS (2-COLUMN MOBILE GRID) ── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-md">Platform Tools</h2>
          <div className="h-px flex-1 bg-white/10 mx-6" />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <ToolTile 
            label="Crop Guide"
            description="Find best crops"
            image={data.tiles?.crop_guide}
            defaultImage="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop"
            icon={<Sprout className="h-5 w-5 md:h-6 md:w-6 text-green-400" />}
            onClick={() => navigate('/app/crops')}
          />
          <ToolTile 
             label="Disease ML"
             description="Ai detection"
             image={data.tiles?.disease_ml}
             defaultImage="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2000&auto=format&fit=crop"
             icon={<ShieldAlert className="h-5 w-5 md:h-6 md:w-6 text-rose-400" />}
             onClick={() => navigate('/app/disease')}
          />
          <ToolTile 
             label="Irrigation"
             description="Watering plans"
             image={data.tiles?.irrigation}
             defaultImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=2000&auto=format&fit=crop"
             icon={<Droplets className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />}
             onClick={() => navigate('/app/irrigation')}
          />
          <ToolTile 
             label="Market"
             description="Live prices"
             image={data.tiles?.market_prices}
             defaultImage="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop"
             icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />}
             onClick={() => navigate('/app/market')}
          />
          <ToolTile 
             label="Marketplace"
             description="Buy & Sell produce"
             image={data.tiles?.marketplace}
             defaultImage="https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=2000&auto=format&fit=crop"
             icon={<ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />}
             onClick={() => navigate('/app/sales')}
             className="col-span-2 lg:col-span-2"
          />
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glassmorphic rounded-[32px] p-5 md:p-8">
           <h2 className="text-lg font-black text-white/90 mb-6 px-2">Irrigation Schedule</h2>
           <div className="space-y-3 md:space-y-4">
              {irrigationTasks.length > 0 ? irrigationTasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 group hover:bg-white/15 transition-all cursor-pointer">
                   <div className="flex items-center gap-4 md:gap-5">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                         <Droplets className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                         <p className="font-black text-white tracking-tight text-sm md:text-base truncate">{task.name} ({task.crop || 'Wheat'})</p>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Active • Optimal</p>
                         </div>
                      </div>
                   </div>
                   <span className="shrink-0 ml-2 px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] bg-blue-500/10 text-blue-200 border border-blue-500/20">
                     OPTIMAL
                   </span>
                </div>
              )) : (
                <p className="text-center py-10 italic text-white/40">No active schedules.</p>
              )}
           </div>
        </div>

        <div className="glassmorphic rounded-[32px] p-10 flex flex-col justify-between text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="h-24 w-24" />
           </div>
           <div className="relative z-10 space-y-6">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Community Focus</span>
              {topPost?.image && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                   <img src={resolveImageUrl(topPost.image, '')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Featured Post" />
                </div>
              )}
              <div className="space-y-4">
                 <h3 className="text-2xl font-black leading-tight text-white">"{topPost?.title || "Tomato Farming Tips"}"</h3>
                 <p className="text-white/60 text-sm font-medium leading-relaxed line-clamp-4">
                    {topPost?.content || "Tomato grows best in 20-30°C with well-drained soil. Seedlings are transplanted after 20-30 days."}
                 </p>
              </div>
           </div>
           <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex items-center justify-center text-xs font-black">S</div>
                 <p className="text-sm font-black text-white/90">Saikumar</p>
              </div>
              <button onClick={() => window.location.href = '/app/community'} className="text-xs font-black text-green-400 hover:text-green-300 transition-colors flex items-center gap-2">
                View &rarr;
              </button>
           </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function StatCard({ icon, label, value, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-[28px] md:rounded-[32px] hover:scale-[1.02] transition-all group cursor-pointer duration-500 relative overflow-hidden shadow-2xl shadow-black/10"
    >
       <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
       <div className={cn("h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 bg-white/20 border border-white/30")}>
          {icon}
       </div>
       <div className="space-y-0.5 md:space-y-1 relative z-10">
          <p className="text-[9px] md:text-[10px] font-black text-white/50 bg-white/5 px-2 py-0.5 rounded-full w-fit uppercase tracking-[0.15em] mb-1 group-hover:text-white/70 transition-colors uppercase">{label}</p>
          <p className="text-xl md:text-2xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight truncate">{value}</p>
       </div>
    </div>
  );
}

function ToolTile({ label, description, image, icon, to, onClick, className, defaultImage }) {
  const imageUrl = resolveImageUrl(image, defaultImage || DEFAULT_BG);

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl p-px transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] h-48 md:h-64 border border-white/10 shadow-2xl bg-[#0f172a]",
        className
      )}
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
        style={{ 
          backgroundImage: `url('${imageUrl}'), url('${DEFAULT_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>
      <div className="relative h-full p-4 md:p-8 flex flex-col justify-between items-start z-10 backdrop-blur-sm group-hover:backdrop-blur-none transition-all duration-500">
        <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          {icon}
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <h3 className="text-sm md:text-2xl font-black text-white tracking-tight drop-shadow-lg leading-tight line-clamp-2">{label}</h3>
          <p className="text-white/60 text-[8px] md:text-xs font-bold uppercase tracking-widest hidden md:block">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-white/10 rounded-3xl pointer-events-none group-hover:border-white/30 transition-colors" />
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
