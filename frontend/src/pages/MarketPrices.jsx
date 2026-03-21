import { TrendingUp, TrendingDown, Minus, Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';



export default function MarketPrices() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [mockPrices, setMockPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialSearch ? 'all' : 'near_you');
  
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/api/market/prices`)

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMockPrices(data.data);
        }
      })
      .catch(err => console.error('Error fetching market prices:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setSearch(querySearch);
      setActiveTab('all');
    }
  }, [searchParams]);

  const userState = user?.location ? user.location.split(',').pop().trim() : 'Maharashtra';

  // Filter based on tab and searching
  const filteredPrices = mockPrices.filter(p => {
    // 1. Text Search matches crop or location
    const matchesSearch = p.crop.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    
    // 2. Tab Filter
    const matchesTab = activeTab === 'all' || (activeTab === 'near_you' && p.state === userState);
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            Live Market Prices
          </h1>
          <p className="mt-2 text-slate-500">
            Track real-time commodity prices across major agricultural markets (Prices per Quintal).
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
           <input
             type="text"
             placeholder="Search by crop or market name..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
           />
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('near_you')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'near_you' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Navigation className="h-4 w-4" /> Near You ({userState})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All India Markets
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
         <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
               <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Commodity</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Market</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Price (per Q)</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Trend</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? (
                  <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
                        Loading market data...
                     </td>
                  </tr>
               ) : filteredPrices.length === 0 ? (
                  <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No market data found for your search.
                     </td>
                  </tr>
               ) : (
                 filteredPrices.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.crop}</div>
                        <div className="text-xs text-slate-500">{item.variety}</div>
                     </td>
                     <td className="px-6 py-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                           <MapPin className="h-3.5 w-3.5 text-slate-400" /> {item.location}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 ml-5 mt-0.5">{item.state}</div>
                     </td>
                     <td className="px-6 py-4 font-bold text-slate-900">{item.price}</td>
                     <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold
                           ${item.trend === 'up' ? 'bg-green-100 text-green-700' : 
                             item.trend === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}
                        >
                           {item.trend === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
                           {item.trend === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
                           {item.trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
                           {item.change}
                        </div>
                     </td>
                  </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
