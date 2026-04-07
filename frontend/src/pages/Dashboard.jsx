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

export default function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState({
    weather: null,
    irrigation: null,
    community: null,
    market: null,
    agriCamUrl: '',
    notifications: [],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, irrigationRes, communityRes, marketRes, camResRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/api/weather/current`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/irrigation/advice`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/community/posts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/settings/agriCamUrl`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [weather, irrigation, community, market, camData, notif] = await Promise.all([
          weatherRes.json(), irrigationRes.json(), communityRes.json(), marketRes.json(), camResRes.json(), notifRes.json()
        ]);

        setData({
          weather: weather.success ? weather.data : null,
          irrigation: irrigation.success ? irrigation.data : null,
          community: community.success ? community.data : null,
          market: market.success ? market.data : null,
          agriCamUrl: camData.success ? camData.data : '',
          notifications: notif.success ? notif.notifications : [],
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
    <div className="mx-auto max-w-7xl space-y-10 pb-20 px-4 sm:px-6">
      
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
          Farm Overview
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}. Here's a summary of your farm's status today.
        </p>
      </div>

      {/* ── TOP STATS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
           <h2 className="text-lg font-black text-slate-800 mb-8 px-2">Irrigation Schedule</h2>
           <div className="space-y-4">
              {irrigationTasks.length > 0 ? irrigationTasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-blue-50/50 border border-blue-50 group hover:bg-blue-50 transition-colors">
                   <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                         <Droplets className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                         <p className="font-black text-slate-800 tracking-tight">{task.name} ({task.crop || 'Wheat'})</p>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Status: Optimal</p>
                      </div>
                   </div>
                   <span className={cn(
                     "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]",
                     idx === 0 ? "bg-blue-100 text-blue-700" : "bg-blue-100 text-blue-700" 
                   )}>
                     {idx === 0 ? "GOOD" : "OPTIMAL"}
                   </span>
                </div>
              )) : (
                <p className="text-center py-10 italic text-slate-400">No active schedules.</p>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: Community Focus */}
        <div className="bg-[#121826] rounded-[32px] p-10 flex flex-col justify-between text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Users className="h-24 w-24" />
           </div>
           
           <div className="relative z-10 space-y-6">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Community Focus</span>
              <div className="space-y-4">
                 <h3 className="text-2xl font-black leading-tight">"{topPost?.title || "Tomato Farming Tips"}"</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-4">
                    {topPost?.content || "Tomato grows best in 20-30°C with well-drained soil. Seedlings are transplanted after 20-30 days. Regular watering and proper spacing are..."}
                 </p>
              </div>
           </div>

           <div className="mt-12 flex items-center justify-between relative z-10 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-xs font-black shadow-lg">S</div>
                 <p className="text-sm font-black text-slate-200">Saikumar</p>
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
  );
}

function StatCard({ icon, label, value, iconBg }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
       <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", iconBg)}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
