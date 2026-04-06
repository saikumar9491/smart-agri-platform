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
  useEffect(() => { alert("DEBUG MODE: VERSION 2.0 ACTIVE"); }, []);
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
    quantity: '',
    category: 'Crops',
    image: null
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.data || []);
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
      ? `${API_URL}/api/listings/${editingItem._id}` 
      : `${API_URL}/api/listings`;
    
    const method = isEdit ? 'PATCH' : 'POST';
    alert(`Sending ${method} to ${url}`);
    
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
        alert(isEdit ? 'SUCCESS: Listing updated!' : 'SUCCESS: Product posted!');
        setShowModal(false);
        setEditingItem(null);
        setFormData({ title: '', description: '', price: '', quantity: '', category: 'Crops', image: null });
        fetchListings();
      } else {
        alert('ERROR: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/api/listings/${id}`, {
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
    const newStatus = item.status === 'available' ? 'out_of_stock' : 'available';
    try {
      const res = await fetch(`${API_URL}/api/listings/${item._id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) fetchListings();
      else alert('Failed to update status: ' + (data.message || 'Error'));
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
            <div>
              <p className="text-lg font-black text-slate-900 flex items-center gap-2">
                Smart Agri Platform <Package className="h-4 w-4 text-green-600" />
              </p>
            </div>
          <button 
            onClick={() => {
              setEditingItem(null);
              setFormData({ title: '', description: '', price: '', quantity: '', category: 'Crops', image: null });
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
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {editingItem ? 'Update Listing' : 'Sell Your Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                 <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g., Organic Red Onions"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Quantity</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g., 50 kg"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Description</label>
                    <textarea 
                      rows={4}
                      placeholder="Tell buyers more about your product..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-bold resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Product Image</label>
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 hover:border-yellow-400 transition-colors bg-slate-50 h-[100px]">
                      <input 
                        type="file"
                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-yellow-600">
                        <ShoppingBag className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-black uppercase">Click to upload photo</span>
                      </div>
                      {formData.image && (
                         <div className="absolute inset-0 bg-yellow-50 flex items-center justify-center">
                            <span className="text-[10px] font-black text-yellow-600 truncate px-4">{formData.image.name || 'Image Selected'}</span>
                         </div>
                      )}
                    </div>
                  </div>
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
  const isOwner = true; // DEBUG: Always show buttons to test functionality
  const navigate = useNavigate();
  const isAvailable = item.status === 'available';

  return (
    <div className="min-w-[200px] w-[200px] md:min-w-[220px] md:w-[220px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group relative snap-start hover:shadow-md transition-all">
      {/* Top Image */}
      <div className="aspect-square overflow-hidden relative p-2 bg-slate-50">
        <img 
          src={item.image?.startsWith('/uploads') ? `${API_URL}${item.image}` : (item.image || 'https://via.placeholder.com/400')} 
          alt={item.title}
          className={cn(
            "w-full h-full object-contain transition-transform duration-500 group-hover:scale-105",
            !isAvailable && "grayscale opacity-50"
          )}
        />
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <span className="bg-slate-900/80 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              {item.status?.replace('_', ' ') || 'Sold Out'}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
            <span className="bg-white/90 backdrop-blur-sm shadow-sm text-slate-500 px-2 py-1 rounded-lg font-black text-[8px] uppercase">
                {item.category}
            </span>
        </div>
      </div>
      
      {/* Content Stack */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-slate-800 text-[13px] leading-tight line-clamp-1">
          {item.title}
        </h3>
        
        {/* Price & Quantity */}
        <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                <span className="text-sm font-black text-slate-900">₹{item.price}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                <span className="text-sm font-bold text-slate-700">{item.quantity || 'N/A'}</span>
            </div>
        </div>

        {/* Location */}
        <div className="space-y-0.5">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
           <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-xs font-bold truncate">{item.location || 'Not Specified'}</span>
           </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
           <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white">
              <img src={item.seller?.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-cover" />
           </div>
           <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-slate-800 truncate">{item.seller?.name || 'Farmer'}</span>
              <span className="text-[9px] text-slate-500 font-bold truncate">{item.seller?.email || 'No Email'}</span>
           </div>
        </div>

        {/* Action Buttons */}
        {isOwner ? (
           <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                className="flex items-center justify-center gap-1.5 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-100 transition-colors border border-yellow-100"
              >
                  <Edit3 className="h-3 w-3" /> DEBUG EDIT
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="flex items-center justify-center gap-1.5 py-2 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
              >
                  <Trash2 className="h-3 w-3" /> Delete
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onStock(); }} 
                className={cn(
                    "col-span-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                    isAvailable 
                        ? "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100" 
                        : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                )}
              >
                  {isAvailable ? 'DEBUG: OUT OF STOCK' : 'DEBUG: AVAILABLE'}
              </button>
           </div>
        ) : (
          <button 
            onClick={() => navigate(`/app/chat/${item.seller?._id || item.seller}`)}
            disabled={!isAvailable}
            className="w-full py-2.5 bg-yellow-400 text-black rounded-xl font-black text-[11px] uppercase hover:bg-yellow-500 transition-all shadow-sm active:scale-95 disabled:grayscale disabled:opacity-50"
          >
            Contact Seller
          </button>
        )}
      </div>
    </div>
  );
}
