import { TrendingUp, TrendingDown, Minus, Search, MapPin, Loader2, Navigation, Trash2, Plus, X, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import PageBackground from '../components/PageBackground';
import { cn } from '../utils/utils';



export default function MarketPrices() {
  const { user, token } = useAuth();
  const { setIsSearchActive } = useUI();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [mockPrices, setMockPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialSearch ? 'all' : 'near_you');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newProduct, setNewProduct] = useState({
    crop: '', variety: '', price: '', location: '', state: '', trend: 'stable', change: '0%'
  });
  
  useEffect(() => {
    fetch(`${API_URL}/api/market/prices`, {
       headers: { Authorization: `Bearer ${token}` }
    })

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMockPrices(data.data);
          setIsFallback(!!data.isFallback);
          setErrorCode(data.error_code);
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

  // Reset search UI state on unmount
  useEffect(() => {
    return () => setIsSearchActive(false);
  }, [setIsSearchActive]);

  const userLocationStr = user?.location ? user.location.toLowerCase() : 'maharashtra';
  const userFirstWord = userLocationStr.split(/[\s,]+/)[0];

  // Filter based on tab and searching
  const filteredPrices = mockPrices.filter(p => {
    // 1. Text Search matches crop or location
    const matchesSearch = p.crop.toLowerCase().includes(search.toLowerCase()) || 
                          p.location.toLowerCase().includes(search.toLowerCase());
    
    // 2. Tab Filter
    const matchesTab = activeTab === 'all' || (
      activeTab === 'near_you' && (
        userLocationStr.includes(p.state.toLowerCase()) || 
        p.state.toLowerCase().includes(userLocationStr) ||
        p.location.toLowerCase().includes(userFirstWord) ||
        userLocationStr.includes(p.location.toLowerCase().split(' ')[0])
      )
    );
    
    return matchesSearch && matchesTab;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this market record?')) return;
    try {
      const res = await fetch(`${API_URL}/api/market/prices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMockPrices(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Error deleting price:', err);
    }
  };

  const handleEditProduct = (item) => {
    setEditingPrice(item);
    setNewProduct({
      crop: item.crop,
      variety: item.variety,
      price: item.price,
      location: item.location,
      state: item.state,
      trend: item.trend,
      change: item.change
    });
    setShowModal(true);
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const isEdit = !!editingPrice;
    const url = isEdit ? `${API_URL}/api/market/prices/${editingPrice._id}` : `${API_URL}/api/market/prices`;
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (data.success) {
        if (isEdit) {
           setMockPrices(prev => prev.map(p => p._id === data.data._id ? data.data : p));
        } else {
           setMockPrices(prev => [data.data, ...prev]);
        }
        setShowModal(false);
        setEditingPrice(null);
        setNewProduct({ crop: '', variety: '', price: '', location: '', state: '', trend: 'stable', change: '0%' });
      }
    } catch (err) {
      console.error('Error saving market price:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageBackground className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-2xl">
            <TrendingUp className="h-8 w-8 text-indigo-400" />
            Live Market Prices
            {!loading && (
              <span className={cn(
                "ml-2 px-2 py-0.5 text-[10px] uppercase tracking-tighter font-black rounded-md",
                isFallback ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
              )}>
                {isFallback ? 'Offline Mode' : 'Live Feed'}
              </span>
            )}
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base font-medium">
            {isFallback 
              ? (
                <span className="flex items-center gap-2">
                  {errorCode === 'invalid_key' ? '⚠️ Your API key appears to be invalid or unauthorized.' : 
                   errorCode === 'missing_key' ? 'Connect your API key in Vercel to enable live updates.' :
                   errorCode === 'fetch_failure' ? 'Government servers are temporarily unreachable. Using cache.' :
                   errorCode?.startsWith('API_PAYLOAD') ? `⚠️ Gov API Response: ${errorCode}` :
                   'Showing cached or community-added prices.'}
                </span>
              )
              : 'Tracking real-time commodity prices across India via Data.gov.in.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
              <input
                type="text"
                placeholder="Search crop or market..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
           </div>
           {user?.role === 'admin' && (
             <button 
               onClick={() => setShowModal(true)}
               className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-2.5 text-sm font-black text-white uppercase tracking-widest transition-all hover:bg-indigo-600 active:scale-[0.98]"
             >
               <Plus className="h-4 w-4" /> Add Price
             </button>
           )}
        </div>
      </div>


      <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-full overflow-x-auto sm:w-fit no-scrollbar border border-white/10">
        <div className="flex min-w-max gap-1">
        <button 
          onClick={() => setActiveTab('near_you')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'near_you' ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-white/40 hover:text-white/60'}`}
        >
          <Navigation className="h-4 w-4" /> Near {user?.location ? user.location.split(',')[0] : 'You'}
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white/10 text-white shadow-lg border border-white/20' : 'text-white/40 hover:text-white/60'}`}
        >
          All India Markets
        </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block glassmorphic rounded-[32px] overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-[0.2em] text-[10px]">
               <tr>
                  <th scope="col" className="px-6 py-6 font-black text-white/40">Commodity</th>
                  <th scope="col" className="px-6 py-6 font-black text-white/40">Market</th>
                   <th scope="col" className="px-6 py-6 font-black text-white/40">Price</th>
                   <th scope="col" className="px-6 py-6 font-black text-white/40">Trend</th>
                   {user?.role === 'admin' && <th scope="col" className="px-6 py-6 font-black text-white/40 text-right">Actions</th>}
                </tr>
             </thead>
            <tbody className="divide-y divide-white/5">
               {loading ? (
                  <>
                    <MarketRowSkeleton />
                    <MarketRowSkeleton />
                    <MarketRowSkeleton />
                    <MarketRowSkeleton />
                    <MarketRowSkeleton />
                  </>
               ) : filteredPrices.length === 0 ? (
                  <tr>
                     <td colSpan={user?.role === 'admin' ? "5" : "4"} className="px-6 py-12 text-center text-slate-500">
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
                           {item.trend === 'stable' ? '0%' : item.change}
                        </div>
                     </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditProduct(item)}
                              className="p-1 px-3 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Entry"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="p-1 px-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      {/* Mobile Card-based View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="space-y-4">
            <MarketCardSkeleton />
            <MarketCardSkeleton />
            <MarketCardSkeleton />
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 px-6">
            <Search className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No market data found</p>
            <p className="text-sm text-slate-400 mt-1">Try searching for a different crop or location.</p>
          </div>
        ) : (
          filteredPrices.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.crop}</h3>
                  <p className="text-xs text-slate-500 font-medium">{item.variety}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{item.price}</div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Unit Specified Above</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-medium">{item.location}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 ml-5">{item.state}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold
                    ${item.trend === 'up' ? 'bg-green-100 text-green-700' : 
                      item.trend === 'down' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {item.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {item.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {item.trend === 'stable' && <Minus className="h-3 w-3" />}
                    {item.trend === 'stable' ? '0%' : item.change}
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleEditProduct(item)}
                         className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors active:bg-indigo-100"
                       >
                         <Edit3 className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(item._id)}
                         className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors active:bg-rose-100"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-slate-900">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{editingPrice ? 'Update Market Price' : 'Add Market Price'}</h3>
              <button onClick={() => { setShowModal(false); setEditingPrice(null); setNewProduct({ crop: '', variety: '', price: '', location: '', state: '', trend: 'stable', change: '0%' }); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Crop Name</label>
                  <input 
                    type="text" required
                    value={newProduct.crop}
                    onChange={(e) => setNewProduct({...newProduct, crop: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="e.g. Wheat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Variety</label>
                  <input 
                    type="text" required
                    value={newProduct.variety}
                    onChange={(e) => setNewProduct({...newProduct, variety: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="e.g. Sharbati"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Price (with Unit)</label>
                  <input 
                    type="text" required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="e.g. ₹2,200/Q or ₹80/kg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Trend</label>
                  <select 
                    value={newProduct.trend}
                    onChange={(e) => setNewProduct({...newProduct, trend: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  >
                    <option value="up">Trending Up</option>
                    <option value="down">Trending Down</option>
                    <option value="stable">Stable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Market Location / APMC</label>
                <input 
                  type="text" required
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. Nashik APMC"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">State</label>
                  <input 
                    type="text" required
                    value={newProduct.state}
                    onChange={(e) => setNewProduct({...newProduct, state: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Price Change (%)</label>
                  <input 
                    type="text"
                    value={newProduct.change}
                    onChange={(e) => setNewProduct({...newProduct, change: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    placeholder="e.g. +2.5%"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingPrice ? 'Update Entry' : 'Add Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageBackground>
  );
}

function MarketRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-100 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 bg-slate-100 rounded mb-2" />
        <div className="h-3 w-24 bg-slate-50 rounded" />
      </td>
      <td className="px-6 py-4 font-bold text-slate-900">
        <div className="h-5 w-20 bg-slate-200 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-slate-100 rounded-full" />
      </td>
    </tr>
  );
}

function MarketCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-16 bg-slate-200 rounded" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-50 rounded" />
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}
