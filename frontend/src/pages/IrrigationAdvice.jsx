import { Droplets, CloudRain, Sun, CalendarClock, Beaker, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';



export default function IrrigationAdvice() {
  const [activeZone, setActiveZone] = useState('Zone A');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/irrigation/advice`)

      .then(res => res.json())
      .then(responseData => {
        if (responseData.success) {
          setData(responseData.data);
        }
      })
      .catch(err => console.error('Error fetching irrigation advice:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Droplets className="h-8 w-8 text-blue-500" />
          Smart Irrigation Advice
        </h1>
        <p className="mt-2 text-slate-500">
          Optimize your water usage based on real-time soil moisture and hyper-local weather forecasts.
        </p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px">
         {Object.keys(zones).map(zone => (
            <button 
               key={zone}
               onClick={() => setActiveZone(zone)}
               className={`pb-3 font-semibold text-sm border-b-2 transition-all px-2 ${activeZone === zone ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               {zone} - {zones[zone].crop}
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
               <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <CloudRain className="h-5 w-5 text-indigo-500" />
                  Weather Impact
               </h3>
               <div className="flex items-center gap-6">
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-500">Rain Probability</span>
                        <span className="text-lg font-bold text-slate-800">{weather.rainProbability}%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{width: `${weather.rainProbability}%`}}></div>
                     </div>
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-slate-500">Water Loss (Evap)</span>
                        <span className="text-lg font-bold text-slate-800">{weather.evaporation}</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 w-[85%] rounded-full"></div>
                     </div>
                  </div>
               </div>
               <p className="mt-5 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">
                  {weather.summary}
               </p>
            </div>

            <button className="w-full py-4 rounded-2xl bg-blue-50 text-blue-700 font-semibold border-2 border-blue-200 border-dashed hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
               <CalendarClock className="h-5 w-5" />
               View Full Weekly Schedule
            </button>
         </div>
      </div>
    </div>
  );
}
