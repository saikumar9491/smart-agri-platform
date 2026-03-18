import { Droplets, Sprout, TrendingUp, SunSnow, Users, CheckCircle2, Play, ExternalLink, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    weather: null,
    irrigation: null,
    community: null,
    market: null,
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, irrigationRes, communityRes, marketRes] = await Promise.all([
          fetch('/api/weather/current'),
          fetch('/api/irrigation/advice'),
          fetch('/api/community/posts'),
          fetch('/api/market/prices')
        ]);

        const [weather, irrigation, community, market] = await Promise.all([
          weatherRes.json(),
          irrigationRes.json(),
          communityRes.json(),
          marketRes.json()
        ]);

        setData({
          weather: weather.success ? weather.data : null,
          irrigation: irrigation.success ? irrigation.data : null,
          community: community.success ? community.data : null,
          market: market.success ? market.data : null,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  // Derive stats from fetched data
  const userState = user?.location ? user.location.split(',').pop().trim() : 'Maharashtra';
  const wheatPrice = data.market?.find(p => p.crop === 'Wheat' && p.state === userState)?.price || 'Rs. 2,100/q';
  const weatherAlert = data.weather?.alerts?.[0]?.type || 'Clear';
  const soilMoisture = data.irrigation?.['Zone A']?.moisture || '45%';

  const stats = [
    { name: 'Soil Moisture', value: `${soilMoisture}${typeof soilMoisture === 'number' ? '%' : ''}`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Crop Health', value: 'Excellent', icon: Sprout, color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'Wheat Price', value: wheatPrice, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Weather Alerts', value: weatherAlert, icon: SunSnow, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  // Get only pending/critical irrigation tasks
  const irrigationTasks = Object.entries(data.irrigation || {})
    .filter(([key, val]) => key.startsWith('Zone'))
    .map(([key, val]) => ({ name: key, ...val }))
    .sort((a, b) => (a.status === 'Critical' ? -1 : 1));

  // Get most liked community post
  const topPost = data.community?.sort((a, b) => b.likes - a.likes)[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Farm Overview</h1>
        <p className="mt-2 text-slate-500">Welcome back, {user?.name || 'Farmer'}. Here's a summary of your farm's status today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-slate-500">{stat.name}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Irrigation Schedule</h2>
          <div className="space-y-4">
             {irrigationTasks.slice(0, 2).map((task, idx) => (
               <div key={idx} className={`flex items-center justify-between rounded-xl p-4 border transition-colors ${task.status === 'Critical' ? 'bg-rose-50/50 border-rose-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <div className="flex items-center gap-4">
                     <div className={`rounded-full p-2 ${task.status === 'Critical' ? 'bg-rose-100' : 'bg-blue-100'}`}>
                       <Droplets className={`h-5 w-5 ${task.status === 'Critical' ? 'text-rose-600' : 'text-blue-600'}`} />
                     </div>
                     <div>
                       <p className="font-semibold text-slate-800">{task.name} ({task.crop})</p>
                       <p className="text-sm text-slate-500">{task.status === 'Critical' ? `Irrigate ${task.nextWatering}` : 'Status: Optimal'}</p>
                     </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-wider ${task.status === 'Critical' ? 'bg-rose-100/50 text-rose-700' : 'bg-blue-100/50 text-blue-700'}`}>
                    {task.status}
                  </span>
               </div>
             ))}
             {!irrigationTasks.length && <p className="text-sm text-slate-500 text-center py-4 italic">No pending irrigation tasks.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-sm text-white flex flex-col justify-between group overflow-hidden relative">
           <div className="absolute right-0 top-0 opacity-10 -mr-8 -mt-8 transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
              <Users className="h-32 w-32" />
           </div>
           
           <div className="relative z-10">
              <h2 className="text-lg font-semibold text-white/90">Community Focus</h2>
              {topPost ? (
                <div className="mt-4">
                   <h3 className="font-bold text-white text-xl leading-tight line-clamp-2">"{topPost.title}"</h3>
                   <p className="mt-2 text-sm text-slate-300 line-clamp-3">
                     {topPost.content}
                   </p>
                </div>
              ) : (
                <p className="mt-4 text-slate-400 italic">No community posts yet.</p>
              )}
           </div>
           
           <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-xs">
                    {topPost?.author?.charAt(0) || 'U'}
                 </div>
                 <span className="text-sm font-medium">{topPost?.author || 'Unknown'}</span>
              </div>
              <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                View Discussion &rarr;
              </button>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
            Market Spotlight
          </h2>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sponsored Content</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Ad 1: Mahindra Tractors */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <video autoPlay muted loop playsInline className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110">
                <source src="/assets/ads/tractor_vid.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Seasonal Offer</span>
                <span className="text-xs font-bold text-indigo-600">Mahindra & Mahindra</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Save up to ₹50,000 on New Tractors</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">Upgrade your farm with the latest tech. Test drive available at all major dealerships across India.</p>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-all">
                Book Test Drive <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ad 2: Organic Fertilizer */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img src="/assets/ads/fertilizer.png" alt="Organic Fertilizer" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">Eco-Friendly</span>
                <span className="text-xs font-bold text-indigo-600">BioGrow Solutions</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">Premium 100% Organic Fertilizer</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">Increase your yield by 25% with our natural nutrient-rich formula. Safe for soil and crops.</p>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-all">
                Shop BioGrow <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ad 3: Smart Irrigation */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="aspect-[16/10] overflow-hidden">
              <img src="/assets/ads/kit.png" alt="Irrigation Kit" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">New Launch</span>
                <span className="text-xs font-bold text-indigo-600">AquaSmart Tech</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Next-Gen IoT Irrigation Kits</h3>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">Automate your watering schedule based on soil moisture. Save up to 50% on water bills monthly.</p>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-all">
                Learn More <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Live Video Section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2 overflow-hidden flex flex-col group">
           <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                 <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
                 <h2 className="font-bold text-slate-800">Live Agri-Cam</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Kisan TV Live Feed</span>
           </div>
           
           <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
               <video 
                 className="absolute inset-0 w-full h-full object-cover"
                 autoPlay 
                 muted 
                 loop 
                 playsInline
               >
                 <source src="/assets/ads/tractor_vid.mp4" type="video/mp4" />
                 Your browser does not support the video tag.
               </video>
            </div>
        </div>
    </div>
  );
}
