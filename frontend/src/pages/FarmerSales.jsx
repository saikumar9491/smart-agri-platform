import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Loader2,
  Package,
  MapPin,
  Mail,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn } from '../utils/utils';

const CATEGORIES = ['All', 'Crops', 'Vegetables', 'Fruits', 'Seeds', 'Fertilizers', 'Other'];

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
    quantity: '',
    category: 'Crops',
    image: null,
    location: ''
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
    
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      // Only append image if it's a File object (not a URL string)
      if (key === 'image') {
        if (formData[key] instanceof File) {
          form.append(key, formData[key]);
        }
      } else if (formData[key] !== null) {
        form.append(key, formData[key]);
      }
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
        setFormData({ title: '', description: '', price: '', quantity: '', category: 'Crops', image: null, location: '' });
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

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price,
      quantity: item.quantity || '',
      category: item.category,
      image: item.image || null,
      location: item.location || ''
    });
    setShowModal(true);
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
      {/*BLINKIT HEADER STYLE*/}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[100] px-4 pt-3 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                Smart Agri Platform <Package className="h-4 w-4 text-green-600" />
              </p>
            </div>
          <button 
            onClick={() => {
              setEditingItem(null);
              setFormData({ title: '', description: '', price: '', quantity: '', category: 'Crops', image: null, location: '' });
              setShowModal(true);
            }}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all font-black text-xl"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/*BIG SEARCH BAR*/}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-yellow-500 transition-colors" />
          <input 
            type="text"
            placeholder='Search "Fresh Vegetables"'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-1 focus:ring-yellow-400 outline-none transition-all font-bold text-sm shadow-inner"
          />
        </div>

        {/* PILL-STYLE SIDE-SCROLLING CATEGORIES - INTEGRATED */}
        <div className="flex gap-2.5 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4 py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shrink-0 border whitespace-nowrap active:scale-95",
                category === cat 
                  ? "bg-yellow-400 text-black border-yellow-400 shadow-sm" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 space-y-8 animate-in fade-in duration-500">
        
        {/*BANNERS*/}
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


        {/*RESULTS CONTENT*/}
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
          {CATEGORIES.filter(c => c !== 'All').map(cat => {
            const catItems = filteredListings.filter(l => l.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                     {cat}
                  </h2>
                  <button onClick={() => setCategory(cat)} className="text-xs font-black text-yellow-600 flex items-center gap-1 uppercase">
                    View All <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                      {catItems.map(item => (
                        <ProductCard 
                          key={item._id} 
                          item={item} 
                          user={user} 
                          onEdit={() => handleEdit(item)} 
                          onDelete={() => handleDelete(item._id)} 
                          onStock={() => toggleStock(item)} 
                          className="min-w-[180px] w-[180px] md:min-w-[220px] md:w-[220px]"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredListings.map(item => (
                <ProductCard 
                  key={item._id} 
                  item={item} 
                  user={user} 
                  onEdit={() => handleEdit(item)} 
                  onDelete={() => handleDelete(item._id)} 
                  onStock={() => toggleStock(item)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal using Portal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {editingItem ? 'Update Listing' : 'Sell Your Product'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingItem(null); setFormData({ title: '', description: '', price: '', quantity: '', category: 'Crops', image: null, location: '' }); }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Organic Wheat"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price / Unit (e.g. ₹2500/kg)</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="2500/kg"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantity/Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="100 KG / 50 Bags"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell buyers more about your harvest..."
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Farm Location (Optional)</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Punjab, India"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-400 font-bold text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Image</label>
                <div className="group relative w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] flex items-center justify-center overflow-hidden hover:border-yellow-400 hover:bg-yellow-50/30 transition-all cursor-pointer">
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={typeof formData.image === 'string' ? `${API_URL}${formData.image}` : URL.createObjectURL(formData.image)} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ShoppingBag className="h-6 w-6 text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Upload Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-yellow-400 text-black rounded-2xl font-black shadow-lg shadow-yellow-100 hover:bg-yellow-500 active:scale-[0.98] transition-all uppercase tracking-widest mt-4">
                {editingItem ? 'Update Listing' : 'Confirm & Post'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ProductCard({ item, user, onEdit, onDelete, onStock, className }) {
  const isOwner = user?._id && item.seller && String(user._id) === String(item.seller._id || item.seller);
  const navigate = useNavigate();
  const isAvailable = item.status === 'available';

  return (
    <div className={cn("bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group relative snap-start hover:shadow-md transition-all flex flex-col", className)}>
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
           <button 
             onClick={(e) => { e.stopPropagation(); navigate(`/app/user/${item.seller?._id || item.seller}`); }}
             className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white hover:border-yellow-400 transition-all shrink-0 active:scale-90"
           >
              <img src={item.seller?.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} className="w-full h-full object-cover" alt="Seller" />
           </button>
           <div className="flex flex-col min-w-0">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/app/user/${item.seller?._id || item.seller}`); }}
                className="text-[12px] font-black text-slate-800 truncate hover:text-yellow-600 transition-colors text-left"
              >
                {item.seller?.name || 'Farmer'}
              </button>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/app/chat/${item.seller?._id || item.seller}`); }}
                  className="text-[10.5px] text-slate-500 font-bold truncate hover:text-yellow-500 transition-colors text-left"
                >
                  {item.seller?.email || 'No Email'}
                </button>
                {item.seller?.email && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${item.seller.email}`; }}
                    className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-green-600 transition-all active:scale-90"
                    title="Email Seller"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        {isOwner ? (
           <div className="grid grid-cols-2 gap-2 pt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }} 
                className="flex items-center justify-center gap-1.5 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-100 transition-colors border border-yellow-100"
              >
                  <Edit3 className="h-3 w-3" /> Edit
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
                  {isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
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
