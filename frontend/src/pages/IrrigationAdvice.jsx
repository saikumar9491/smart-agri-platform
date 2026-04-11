import { Droplets, CloudRain, Sun, CalendarClock, Beaker, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/PageBackground';



export default function IrrigationAdvice() {
  const { token } = useAuth();
  const [activeZone, setActiveZone] = useState('Zone A');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/irrigation/advice`, {
      headers: { Authorization: `Bearer ${token}` }
    })

      .then(res => res.json())
      .then(responseData => {
        if (responseData.success) {
          setData(responseData.data);
        }
      })
      .catch(err => console.error('Error fetching irrigation advice:', err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !data) {
    return (
      <div className="flex h-[80dvh] items-center justify-center">
        {!token ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Login Required</h3>
            <p className="text-slate-500 mb-6 text-sm">Please sign in to access personalized irrigation advice for your farm zones.</p>
            <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Sign In</a>
          </div>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  const zones = {
     'Zone A': data['Zone A'],
     'Zone B': data['Zone B'],
     'Zone C': data['Zone C'],
  };
  
  const current = data[activeZone];
  const weather = data.WeatherImpact;

  return (
    <PageBackground className="mx-auto max-w-5xl space-y-8">
      <div className="px-2">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-2xl">
          <Droplets className="h-8 w-8 text-blue-400" />
          Smart Irrigation Advice
        </h1>
        <p className="mt-2 text-white/60 font-medium">
          Optimize your water usage based on real-time soil moisture and hyper-local weather forecasts.
        </p>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-px">
         {Object.keys(zones).map(zone => (
            <button 
               key={zone}
               onClick={() => setActiveZone(zone)}
               className={`pb-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all px-4 ${activeZone === zone ? 'border-blue-400 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
            >
               {zone}
            </button>
         ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         {/* Status Card */}
         <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
               <svg viewBox="0 0 200 200" className="w-64 h-64" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFFFFF" d="M49.2,-70.7C62.7,-61.6,71.8,-45.5,77.9,-28.9C84,-12.3,87.1,4.7,82.8,20.2C78.4,35.7,66.6,49.7,52.3,58C38,66.4,21.1,69.1,4.1,63.1C-12.8,57.1,-29.6,42.4,-45.1,29.1C-60.6,15.8,-74.8,3.9,-76.3,-8.9C-77.8,-21.7,-66.6,-35.4,-53.2,-44.6C-39.8,-53.8,-24.1,-58.5,-7.9,-47.9C8.3,-37.3,24.6,-11.2,35.6,-79.8" transform="translate(100 100)" />
               </svg>
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                       Current Status
                     </span>
                     {current.status === 'Critical' && (
                        <span className="flex items-center gap-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
                           <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                           Needs Attention
                        </span>
                     )}
                  </div>
                  <h2 className="text-5xl font-black mt-4">{current.moisture}%</h2>
                  <p className="text-blue-200 text-lg font-medium">Soil Moisture Level</p>
               </div>
               
               <div className="mt-10 grid grid-cols-2 gap-4 border-t border-blue-500/30 pt-6">
                  <div>
                     <p className="text-xs text-blue-300 font-medium mb-1">RECOMMENDED ACTION</p>
                     <p className="font-semibold">{current.nextWatering}</p>
                  </div>
                  <div>
                     <p className="text-xs text-blue-300 font-medium mb-1">WATER AMOUNT</p>
                     <p className="font-semibold">{current.needed}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Weather impact & schedule */}
         <div className="space-y-6">
            <div className="glassmorphic rounded-[32px] p-8">
               <h3 className="text-[11px] font-black text-white/50 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-white/40" />
                  Weather Impact
               </h3>
               <div className="flex items-center gap-6 text-white text-white">
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">Rain Probability</span>
                        <span className="text-lg font-black">{weather.rainProbability}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{width: `${weather.rainProbability}%`}}></div>
                     </div>
                  </div>
               </div>
               <p className="mt-8 text-sm font-medium text-white/60 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                  {weather.summary}
               </p>
            </div>

            <button 
               onClick={() => setShowSchedule(!showSchedule)}
               className={`w-full py-4 rounded-2xl font-semibold border-2 border-dashed transition-all flex items-center justify-center gap-2 ${showSchedule ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
            >
               <CalendarClock className="h-5 w-5" />
               {showSchedule ? 'Hide Weekly Schedule' : 'View Full Weekly Schedule'}
            </button>
         </div>
      </div>

      {/* Weekly Schedule Grid */}
      {showSchedule && (
         <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
               <CalendarClock className="h-6 w-6 text-blue-500" />
               7-Day Irrigation Forecast: {activeZone}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
               {current.weeklySchedule.map((day, idx) => (
                  <div key={idx} className={`rounded-2xl border p-4 flex flex-col items-center text-center transition-all hover:shadow-md ${day.needsWater ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-200'}`}>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{day.day}</span>
                     {day.needsWater ? (
                        <Droplets className="h-8 w-8 text-blue-500 mb-3 animate-bounce" />
                     ) : (
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-3" />
                     )}
                     <span className={`text-sm font-bold ${day.needsWater ? 'text-blue-700' : 'text-slate-700'}`}>{day.status}</span>
                  </div>
               ))}
            </div>
            <p className="mt-6 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl italic">
               * Schedule is automatically adjusted based on soil moisture trends and regional precipitation forecasts.
            </p>
         </div>
      )}
    </PageBackground>
  );
}
