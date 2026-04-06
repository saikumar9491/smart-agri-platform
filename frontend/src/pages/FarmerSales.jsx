import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  LayoutGrid, 
  Tag, 
  MessageCircle, 
  Trash2, 
  Edit3, 
  Archive,
  ArrowRight,
  ChevronRight,
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Clock,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'All', icon: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' },
  { name: 'Crops', icon: 'https://cdn-icons-png.flaticon.com/512/2321/2321151.png' },
  { name: 'Vegetables', icon: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png' },
  { name: 'Fruits', icon: 'https://cdn-icons-png.flaticon.com/512/3194/3194766.png' },
  { name: 'Seeds', icon: 'https://cdn-icons-png.flaticon.com/512/3421/3421445.png' },
  { name: 'Equipment', icon: 'https://cdn-icons-png.flaticon.com/512/2554/2554030.png' },
  { name: 'Livestock', icon: 'https://cdn-icons-png.flaticon.com/512/2395/2395796.png' },
  { name: 'Other', icon: 'https://cdn-icons-png.flaticon.com/512/1041/1041883.png' }
];

const BANNERS = [
  { id: 1, title: 'Fresh from Farm', subtitle: 'Get 100% Organic Products', bg: 'bg-green-600', img: 'https://images.unsplash.com/photo-1623348646971-e403cc18fca9?auto=format&fit=crop&q=80&w=400' },
  { id: 2, title: 'Stock Clearing Sale', subtitle: 'Up to 30% Off on Seeds', bg: 'bg-amber-500', img: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=400' }
];

export default function FarmerSales() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Crops',
    location: '',
    image: null
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/marketplace`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const isEdit = !!editingItem;
    const url = isEdit 
      ? `${API_URL}/api/marketplace/${editingItem._id}` 
      : `${API_URL}/api/marketplace`;
    
    const method = isEdit ? 'PUT' : 'POST';
    
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) form.append(key, formData[key]);
    });

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingItem(null);
        setFormData({ title: '', description: '', price: '', category: 'Crops', location: '', image: null });
        fetchListings();
      }
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/api/marketplace/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchListings();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const toggleStock = async (item) => {
    try {
      const res = await fetch(`${API_URL}/api/marketplace/${item._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inStock: !item.inStock })
      });
      const data = await res.json();
      if (data.success) fetchListings();
    } catch (err) {
      console.error('Stock toggle failed:', err);
    }
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || item.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="bg-[#f8f8f8] min-h-screen pb-24 md:pb-8">
      {/* Blinkit Header Style */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[100] px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400 rounded-lg text-black font-black text-xs uppercase shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Delivery in 15-20 Mins</p>
              <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                Your Farm Location <MapPin className="h-3 w-3 text-green-600" />
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingItem(null);
              setFormData({ title: '', description: '', price: '', category: 'Crops', location: '', image: null });
              setShowModal(true);
            }}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Big Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-yellow-500 transition-colors" />
          <input 
            type="text"
            placeholder='Search "Fresh Vegetables"'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-none rounded-2xl focus:bg-white focus:ring-1 focus:ring-yellow-400 outline-none transition-all font-bold text-sm shadow-inner"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-8 animate-in fade-in duration-500">
        
        {/* Banners */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {BANNERS.map(banner => (
            <div key={banner.id} className={cn("min-w-[85%] md:min-w-[400px] h-32 rounded-3xl overflow-hidden relative snap-center p-5 flex flex-col justify-center", banner.bg)}>
               <div className="relative z-10 space-y-1">
                  <h3 className="text-white font-black text-lg leading-tight">{banner.title}</h3>
                  <p className="text-white/80 font-bold text-xs">{banner.subtitle}</p>
               </div>
               <img src={banner.img} className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50 mix-blend-overlay" />
            </div>
          ))}
        </div>

        {/* Circular Categories */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className="flex flex-col items-center gap-2 group transition-all"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center p-3 border-2 transition-all overflow-hidden",
                category === cat.name ? "bg-white border-yellow-400 shadow-md translate-y-[-2px]" : "bg-white border-transparent hover:border-slate-200"
              )}>
                <img src={cat.icon} className="w-full h-full object-contain" alt={cat.name} />
              </div>
              <span className={cn(
                "text-[10px] font-black text-center transition-colors uppercase tracking-tight",
                category === cat.name ? "text-yellow-600" : "text-slate-500"
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Results Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 italic text-slate-400">
              No products found.
            </div>
          ) : category === 'All' ? (
            <div className="space-y-12">
              {CATEGORIES.filter(c => c.name !== 'All').map(cat => {
                const catItems = filteredListings.filter(l => l.category === cat.name);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat.name} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                         {cat.name}
                      </h2>
                      <button onClick={() => setCategory(cat.name)} className="text-xs font-black text-yellow-600 flex items-center gap-1 uppercase">
                        View All <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    
                    {/* Blinkit Horizontal Side Scroll */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                      {catItems.map(item => (
                        <ProductCard key={item._id} item={item} user={user} onEdit={() => setEditingItem(item)} onDelete={() => handleDelete(item._id)} onStock={() => toggleStock(item)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredListings.map(item => (
                <ProductCard key={item._id} item={item} user={user} onEdit={() => setEditingItem(item)} onDelete={() => handleDelete(item._id)} onStock={() => toggleStock(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {editingItem ? 'Update Listing' : 'Sell Your Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                 <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-bold appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/2985/2985161.png')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
                  >
                    {CATEGORIES.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black shadow-lg shadow-yellow-100 hover:bg-yellow-500 active:scale-[0.98] transition-all uppercase tracking-widest mt-4">
                {editingItem ? 'Update Listing' : 'Confirm & Post'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, user, onEdit, onDelete, onStock }) {
  const isOwner = user?._id === item.sellerId?._id || user?._id === item.sellerId;
  const navigate = useNavigate();

  return (
    <div className="min-w-[160px] w-[160px] md:min-w-[180px] md:w-[180px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group relative snap-start hover:shadow-md transition-all">
      <div className="aspect-square overflow-hidden relative p-3">
        <img 
          src={item.image?.startsWith('/uploads') ? `${API_URL}${item.image}` : (item.image || 'https://via.placeholder.com/400')} 
          alt={item.title}
          className={cn(
            "w-full h-full object-contain transition-transform duration-500 group-hover:scale-105",
            !item.inStock && "grayscale opacity-50"
          )}
        />
        {!item.inStock && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <span className="bg-slate-900/80 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest backdrop-blur-sm">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
            <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md font-black text-[8px] uppercase">
                {item.category}
            </span>
        </div>
      </div>
      
      <div className="p-3 pt-0">
        <h3 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-2 h-7">
          {item.title}
        </h3>
        
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900">₹{item.price}</span>
              <span className="text-[9px] text-slate-400 line-through">₹{Math.round(item.price * 1.2)}</span>
          </div>
          
          {isOwner ? (
             <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors">
                    <Edit3 className="h-3 w-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Trash2 className="h-3 w-3" />
                </button>
             </div>
          ) : (
            <button 
              onClick={() => navigate(`/app/chat/${item.sellerId?._id || item.sellerId}`)}
              disabled={!item.inStock}
              className="px-4 py-1.5 bg-white border border-yellow-400 text-yellow-600 rounded-lg font-black text-xs uppercase hover:bg-yellow-400 hover:text-black transition-all shadow-sm active:scale-95"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
