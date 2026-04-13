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
  ShoppingBag,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn, resolveImageUrl } from '../utils/utils';
import { API_URL } from '../config';
const DEFAULT_BG = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"; // Better, more stable farm background

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
  const [showNotifications, setShowNotifications] = useState(false);

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;

    // Optimistic UI Update
    setData(prev => ({ ...prev, notifications: [] }));

    try {
      await fetch(`${API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();

    // Optimistic UI Update immediately hides it from screen
    setData(prev => ({ ...prev, notifications: prev.notifications.filter(n => n._id !== id) }));

    // Stop if it's just our test UI notification
    if (String(id).startsWith('preview_')) return;

    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

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

  // Dynamic Tile Configuration for Responsive Ordering
  const availableTiles = [
    {
      id: 'marketplace',
      label: "Marketplace",
      description: "Buy & Sell produce",
      image: data.tiles?.marketplace,
      defaultImage: "https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=2000&auto=format&fit=crop",
      icon: <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />,
      onClick: () => navigate('/app/sales')
    },
    {
      id: 'disease_ml',
      label: "Disease ML",
      description: "Ai detection",
      image: data.tiles?.disease_ml,
      defaultImage: "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=2000&auto=format&fit=crop",
      icon: <ShieldAlert className="h-5 w-5 md:h-6 md:w-6 text-rose-400" />,
      onClick: () => navigate('/app/disease')
    },
    {
      id: 'irrigation',
      label: "Irrigation",
      description: "Watering plans",
      image: data.tiles?.irrigation,
      defaultImage: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=2000&auto=format&fit=crop",
      icon: <Droplets className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />,
      onClick: () => navigate('/app/irrigation')
    },
    {
      id: 'market_prices',
      label: "Market",
      description: "Live prices",
      image: data.tiles?.market_prices,
      defaultImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop",
      icon: <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />,
      onClick: () => navigate('/app/market')
    },
    {
      id: 'crop_guide',
      label: "Crop Guide",
      description: "Find best crops",
      image: data.tiles?.crop_guide,
      defaultImage: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop",
      icon: <Sprout className="h-5 w-5 md:h-6 md:w-6 text-green-400" />,
      onClick: () => navigate('/app/crops')
    }
  ];

  // Swap "Marketplace" and "Crop Guide" on Desktop only
  const displayTiles = !isMobile
    ? [availableTiles[4], ...availableTiles.slice(1, 4), availableTiles[0]]
    : availableTiles;

  return (
    <div className="relative min-h-screen">
      {/* ── PROFESSIONAL DEEP FOREST BACKGROUND ── */}
      <div
        className="fixed z-[-5] pointer-events-none overflow-hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        }}
      >
        <img
          src={resolveImageUrl(
            isMobile ? (data.dashboardBgMobile || data.dashboardBg) : data.dashboardBg,
            DEFAULT_BG
          )}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-1000"
          style={{ objectPosition: 'center center' }}
          onError={(e) => {
            if (e.target.src !== DEFAULT_BG) {
              e.target.src = DEFAULT_BG;
            }
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10 pb-20 px-4 sm:px-6 pt-4 md:pt-10">

        {/* ── MOBILE INTEGRATED HEADER ── */}
        {isMobile && (
          <div className="flex items-center justify-between py-4 px-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <h1 className="text-2xl min-[370px]:text-[28px] font-black text-white drop-shadow-lg whitespace-nowrap tracking-tight">Farm Overview</h1>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest truncate">Active Monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="h-10 w-10 rounded-full glassmorphic flex items-center justify-center text-white relative"
                >
                  <Bell className="h-5 w-5" />
                  {data.notifications?.length > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-rose-500 border-2 border-[#2F4F4F]"></span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowNotifications(false)} />
                    <div className="fixed top-[90px] left-4 right-4 sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-[400px] bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 rounded-[2rem] shadow-2xl z-[100] overflow-hidden">
                      <div className="p-5 border-b border-white/10 bg-slate-800/40 text-white flex justify-between items-center">
                        <span className="font-black tracking-tight">Notifications</span>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-[10px] font-black text-rose-400">
                          {data.notifications?.length || 0}
                        </span>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                        {data.notifications?.length === 0 ? (
                          <div className="p-8 text-center text-white/50 text-xs">No updates</div>
                        ) : (
                          data.notifications?.map(n => (
                            <div key={n._id} className="p-4 border-b border-white/5 hover:bg-white/5 flex gap-3 text-sm">
                              <div className="mt-1">
                                {n.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
                                  n.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                                    <Info className="h-4 w-4 text-blue-400" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-white tracking-tight">{n.title}</p>
                                <p className="text-xs text-white/60">{n.message}</p>
                              </div>
                              <button onClick={(e) => handleDeleteNotif(e, n._id)} className="text-white/30 hover:text-rose-400"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          ))
                        )}
                      </div>
                      {data.notifications?.length > 0 && (
                        <button onClick={handleClearAll} className="w-full p-3 text-xs font-black uppercase tracking-widest text-rose-400 bg-black/40 hover:bg-black/60 transition-colors rounded-b-[2rem]">Clear all</button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <Link to="/app/profile" className="h-10 w-10 rounded-full bg-green-500/20 border-2 border-green-400 overflow-hidden shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                {user?.profilePic ? (
                  <img src={resolveImageUrl(user.profilePic, '')} className="h-full w-full object-cover" alt="" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-black text-xs">
                    {user?.name?.charAt(0) || 'F'}
                  </div>
                )}
              </Link>
            </div>
          </div>
        )}

        {/* ── HEADER (DESKTOP) ── */}
        {!isMobile && (
          <div className="space-y-1 relative">
            <h1 className="text-4xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Farm Overview
            </h1>
            <p className="text-white/90 font-medium tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}. Here's a summary of your farm's status today.
            </p>
          </div>
        )}

        {/* ── STAT CARDS SECTION ── */}
        {isMobile ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x -mx-4 px-4">
            <div className="shrink-0 w-64 snap-center">
              <StatCard
                icon={<Droplets className="h-6 w-6 text-blue-500" />}
                label="Soil Moisture"
                value={`${data.irrigation?.['Zone A']?.moisture || 34}%`}
                onClick={() => navigate('/app/irrigation')}
              />
            </div>
            <div className="shrink-0 w-64 snap-center">
              <StatCard
                icon={<Sprout className="h-6 w-6 text-green-500" />}
                label="Crop Health"
                value="Excellent"
                onClick={() => navigate('/app/crops')}
              />
            </div>
            <div className="shrink-0 w-64 snap-center">
              <StatCard
                icon={<TrendingUp className="h-6 w-6 text-amber-500" />}
                label="Wheat Price"
                value={`Rs. ${data.market?.[0]?.pricePerKg || '2,100'}/q`}
                onClick={() => navigate('/app/market')}
              />
            </div>
            <div className="shrink-0 w-64 snap-center">
              <StatCard
                icon={<CloudSun className="h-6 w-6 text-orange-500" />}
                label="Weather Alerts"
                value={data.weather?.condition || "Stable Conditions"}
                onClick={() => navigate('/app/weather')}
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
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
          </motion.div>
        )}

        {/* ── PLATFORM TOOLS (2-COLUMN MOBILE GRID) ── */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4
              }
            }
          }}
          className="space-y-6 pt-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayTiles.map((tile, idx) => (
              <ToolTile
                key={tile.id}
                {...tile}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className={cn(
                  idx === 0 ? (isMobile ? "col-span-2 h-44" : "") :
                    idx === 4 ? (isMobile ? "col-span-1" : "col-span-2 lg:col-span-2") :
                      idx === 3 ? (isMobile ? "col-span-1" : "") : ""
                )}
              />
            ))}
          </div>
        </motion.section>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[32px] p-5 md:p-8 shadow-2xl">
            <h2 className="text-lg font-black text-white/90 mb-6 px-2">Irrigation Schedule</h2>
            <div className="space-y-3 md:space-y-4">
              {irrigationTasks.length > 0 ? irrigationTasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/20 group hover:bg-white/10 transition-all cursor-pointer shadow-xl">
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

          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-10 flex flex-col justify-between text-white relative overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-black/40">
            {/* Moving background glow */}
            <div className="absolute -top-[50%] -right-[50%] w-full h-full bg-green-500/10 blur-[120px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-150" />

            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
              <Users className="h-24 w-24 group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] group-hover:text-white/60 transition-colors">Community Focus</span>
              </div>

              {topPost?.image && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/img">
                  <img src={resolveImageUrl(topPost.image, '')} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Featured Post" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight text-white group-hover:text-green-50 transition-colors">"{topPost?.title || "Tomato Farming Tips"}"</h3>
                <p className="text-white/60 text-sm font-medium leading-relaxed line-clamp-4 group-hover:text-white/80 transition-colors">
                  {topPost?.content || "Tomato grows best in 20-30°C with well-drained soil. Seedlings are transplanted after 20-30 days."}
                </p>
                <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-xs font-black shadow-lg overflow-hidden">
                      {user?.profilePic ? (
                        <img
                          src={resolveImageUrl(user.profilePic)}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{user?.name?.charAt(0) || 'F'}</span>
                      )}
                    </div>
                    <p className="text-sm font-black text-white/90">{user?.name || 'Farmer'}</p>
                  </div>
                  <button
                    onClick={() => window.location.href = '/app/community'}
                    className="group/btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-green-400 hover:text-green-300 transition-all flex items-center gap-2"
                  >
                    View <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CLEAN E-COMMERCE SPOTLIGHT SECTION ── */}
        {data.spotlights && data.spotlights.length > 0 && (
          <>
            <section className="relative w-full pb-16 pt-6 md:hidden">
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 w-full no-scrollbar pb-8 pt-2">
                {data.spotlights.map((spot, idx) => (
                  <SpotlightCard key={spot._id} spot={spot} idx={idx} isMobileView={true} />
                ))}
              </div>
            </section>
            
            <section className="hidden md:block relative w-full pb-16 pt-16 mt-12 bg-slate-50 rounded-[40px] shadow-2xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/60 before:to-transparent before:-z-10">
              <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-6 md:px-10">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Market Spotlight</h2>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:block">Sponsored Content</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 px-6 md:px-10 w-full max-w-7xl mx-auto pb-10">
                {data.spotlights.map((spot, idx) => (
                  <SpotlightCard key={spot._id} spot={spot} idx={idx} isMobileView={false} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SpotlightCard({ spot, idx, isMobileView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative rounded-[24px] bg-white border transition-shadow duration-300 flex flex-col overflow-hidden",
        isMobileView 
          ? "shrink-0 snap-center w-[85vw] border-slate-100 shadow-[0_4px_24px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]" 
          : "w-full border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)]"
      )}
    >
      {/* Flush Image Showcase */}
      <div className={cn(
        "relative w-full overflow-hidden shrink-0",
        isMobileView ? "aspect-[4/3] bg-slate-50" : "aspect-[16/9] bg-slate-100"
      )}>
        <img
          src={resolveImageUrl(spot.imageUrl, '')}
          className="w-full h-full object-cover"
          alt={spot.title}
        />
        {/* Floating Accessory/Badge */}
        {spot.secondaryImageUrl && (
          <div className="absolute top-4 right-4 w-12 h-12 z-20">
            <img
              src={resolveImageUrl(spot.secondaryImageUrl, '')}
              className="w-full h-full object-contain filter drop-shadow-sm"
              alt=""
            />
          </div>
        )}
      </div>

      {/* Content Box */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col items-start text-left bg-white z-10 w-full">

        {/* Tags cluster */}
        <div className="flex justify-between items-center w-full mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-wider">
             {spot.badge || 'New'}
          </span>
          {spot.brand && (
            <span className="text-sm font-bold text-indigo-600">
              {spot.brand}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[22px] font-black text-indigo-700 leading-tight mb-3">
          {spot.title}
        </h3>

        {/* Description */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer mb-6 w-full group"
        >
          <p className={cn(
            "text-[#5f6368] text-base leading-relaxed w-full transition-all duration-300",
            !expanded ? "line-clamp-2" : ""
          )}>
            {spot.description}
          </p>
          {spot.description?.length > 90 && (
            <div className="font-bold text-[#1da055] text-xs uppercase tracking-wide mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              {expanded ? "Show less" : "Read more"}
            </div>
          )}
        </div>

        {/* Standard Green Button */}
        <div className="mt-auto w-full pt-1">
          <a
            href={spot.link || '#'}
            className="flex items-center justify-center w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-[14px] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 outline-none"
          >
            <span className="flex items-center gap-2 text-base">
              {spot.buttonText || 'Learn More'}
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, onClick }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-[28px] md:rounded-[32px] transition-all group cursor-pointer duration-500 relative overflow-hidden shadow-2xl shadow-black/20"
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -3, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn("h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_4px_12px_rgba(255,255,255,0.1)] group-hover:border-white/50")}
      >
        <motion.div
          whileHover={{ scale: 1.2, rotate: 12 }}
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        >
          {icon}
        </motion.div>
      </motion.div>
      <div className="space-y-0.5 md:space-y-1 relative z-10">
        <p className="text-[9px] md:text-[10px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full w-fit uppercase tracking-[0.15em] mb-1 group-hover:text-white/60 transition-colors">{label}</p>
        <p className="text-xl md:text-2xl font-black text-white tracking-tighter drop-shadow-2xl leading-tight truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function ToolTile({ label, description, image, icon, to, onClick, className, defaultImage, variants }) {
  const imageUrl = resolveImageUrl(image, defaultImage || DEFAULT_BG);
  const isMobile = window.innerWidth < 768;

  const content = (
    <motion.div
      variants={variants}
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative overflow-hidden rounded-[40px] p-px transition-all duration-500 cursor-pointer h-40 md:h-60 border border-white/20 shadow-2xl",
        className
      )}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-100 group-hover:scale-110 transition-transform duration-1000"
        style={{
          backgroundImage: `url('${imageUrl}'), url('${DEFAULT_BG}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>
      <div className="relative h-full p-4 md:p-6 flex flex-col justify-between items-start z-10 transition-all duration-500">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="h-9 w-9 md:h-11 md:w-11 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl group-hover:border-white/60"
        >
          <div className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
            {icon}
          </div>
        </motion.div>
        <div className="space-y-1 relative">
          <h3 className="text-lg md:text-2xl font-black text-white tracking-tight drop-shadow-2xl leading-tight line-clamp-2 transition-transform duration-500 group-hover:translate-x-1">{label}</h3>
          <div className="flex items-center gap-2 overflow-hidden">
            <p className="text-white/60 text-[8px] md:text-xs font-bold uppercase tracking-widest hidden md:block drop-shadow-md group-hover:text-white/80 transition-all duration-500 translate-y-2 group-hover:translate-y-0">{description}</p>
            <ChevronRight className="h-3 w-3 text-white/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Premium glowing border */}
      <div className="absolute inset-0 border border-white/20 rounded-[40px] pointer-events-none group-hover:border-white/40 transition-all duration-500 shadow-inner group-hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
    </motion.div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
