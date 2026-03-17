import { Droplets, Sprout, TrendingUp, SunSnow, Users, CheckCircle2, Play, ExternalLink } from 'lucide-react';

const stats = [
  { name: 'Soil Moisture', value: '45%', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Crop Health', value: 'Excellent', icon: Sprout, color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'Wheat Price', value: '₹2,100/q', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Weather Alerts', value: 'Clear', icon: SunSnow, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Farm Overview</h1>
        <p className="mt-2 text-slate-500">Welcome back. Here's a summary of your farm's status today.</p>
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
             <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                <div className="flex items-center gap-4">
                   <div className="rounded-full bg-blue-100 p-2">
                     <Droplets className="h-5 w-5 text-blue-600" />
                   </div>
                   <div>
                     <p className="font-semibold text-slate-800">Zone A (Wheat)</p>
                     <p className="text-sm text-slate-500">Irrigate today at 5:00 PM</p>
                   </div>
                </div>
                <span className="rounded-full bg-blue-100/50 px-3 py-1 font-semibold text-blue-700">Pending</span>
             </div>
             
             <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100 opacity-70">
                <div className="flex items-center gap-4">
                   <div className="rounded-full bg-green-100 p-2">
                     <CheckCircle2 className="h-5 w-5 text-green-600" />
                   </div>
                   <div>
                     <p className="font-semibold text-slate-800">Zone B (Corn)</p>
                     <p className="text-sm text-slate-500">Irrigated yesterday</p>
                   </div>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">Completed</span>
             </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-sm text-white flex flex-col justify-between">
           <div>
              <h2 className="text-lg font-semibold text-white/90">Community Top Post</h2>
              <div className="mt-4">
                 <h3 className="font-bold text-white text-xl leading-tight">"New pest resistant seeds are amazing!"</h3>
                 <p className="mt-2 text-sm text-slate-300 line-clamp-3">
                   I recently tried the new variation of seeds recommended here and they are doing wonders against aphids...
                 </p>
              </div>
           </div>
           
           <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                 </div>
                 <span className="text-sm font-medium">Rajesh K.</span>
              </div>
              <button className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors">
                Read More &rarr;
              </button>
           </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3 mt-8">
        {/* Ads Section */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 shadow-sm flex flex-col justify-between group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sprout className="h-24 w-24 text-indigo-500" />
           </div>
           
           <div className="relative z-10">
              <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-3">Sponsored</span>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">Up to 40% Off on Mahindra Tractors</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">Exclusive seasonal offer for verified farmers. Book your test drive today at your nearest dealership.</p>
           </div>
           
           <button className="relative z-10 mt-6 flex w-fit items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
              Claim Offer <ExternalLink className="h-4 w-4" />
           </button>
        </div>

        {/* Live Video Section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
           <div className="border-b border-slate-100 p-4 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                 <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
                 <h2 className="font-bold text-slate-800">Live Agri-Cam</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Kisan TV Live Feed</span>
           </div>
           
           <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
              <iframe 
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/8-n8R7vD8kY?autoplay=1&mute=1&loop=1&playlist=8-n8R7vD8kY" 
                title="Smart Agriculture Live Feed" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
           </div>
        </div>
      </div>
    </div>
  );
}
