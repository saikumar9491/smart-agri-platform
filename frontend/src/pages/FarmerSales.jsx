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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Crops', 'Vegetables', 'Fruits', 'Seeds', 'Equipment', 'Livestock', 'Other'];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="grid grid-cols-[1fr_48px] gap-3 items-center">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 bg-green-600 rounded-xl text-white shadow-lg shadow-green-100 flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <span className="truncate">Farmer Sales</span>
          </h1>
        </div>
        
        <button 
          onClick={() => {
            setEditingItem(null);
            setFormData({ title: '', description: '', price: '', category: 'Crops', location: '', image: null });
            setShowModal(true);
          }}
          className="flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-all w-12 h-12 flex-shrink-0"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-50 bg-slate-50 py-2 border-b border-slate-100 md:static md:bg-transparent md:p-0 md:border-none">
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_48px] gap-3 w-full items-center">
            <div className="relative group min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold text-sm"
              />
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-all w-12 h-12 flex-shrink-0"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-wider border",
                  category === cat 
                    ? "bg-slate-900 border-slate-900 text-white" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-12 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 italic text-slate-400">
            No products found matching your criteria.
          </div>
        ) : category === 'All' ? (
          <div className="space-y-10">
            {CATEGORIES.filter(c => c !== 'All').map(cat => {
              const catItems = filteredListings.filter(l => l.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                       <span className="w-2 h-8 bg-green-500 rounded-full" />
                       {cat}
                    </h2>
                    <button onClick={() => setCategory(cat)} className="text-sm font-bold text-green-600 flex items-center gap-1">
                      See all <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Side Scrolling Section */}
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-proximity scroll-smooth px-1">
                    {catItems.map(item => (
                      <ProductCard key={item._id} item={item} user={user} onEdit={() => setEditingItem(item)} onDelete={() => handleDelete(item._id)} onStock={() => toggleStock(item)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredListings.map(item => (
              <ProductCard key={item._id} item={item} user={user} onEdit={() => setEditingItem(item)} onDelete={() => handleDelete(item._id)} onStock={() => toggleStock(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {editingItem ? 'Update Listing' : 'List New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                 <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Price</label>
                  <input 
                    required
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 active:scale-[0.98] transition-all">
                {editingItem ? 'Save Changes' : 'Post for Sale'}
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
    <div className="min-w-[280px] w-[280px] md:min-w-0 md:w-full bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 relative snap-start">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={item.image?.startsWith('/uploads') ? `${API_URL}${item.image}` : (item.image || 'https://via.placeholder.com/400')} 
          alt={item.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
            !item.inStock && "grayscale opacity-60"
          )}
        />
        {!item.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <span className="bg-white text-slate-900 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider text-green-700 shadow-sm border border-white/50">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-black text-slate-900 text-lg group-hover:text-green-700 transition-colors leading-tight truncate">
            {item.title}
          </h3>
          <p className="text-green-600 font-black text-xl mt-0.5">₹{item.price}</p>
        </div>

        {/* Management Controls for Owner */}
        {isOwner ? (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-green-50 hover:text-green-700 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onStock(); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all",
                item.inStock ? "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700" : "bg-amber-100 text-amber-700"
              )}
            >
              <Archive className="h-3.5 w-3.5" /> {item.inStock ? 'Stock' : 'In'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate(`/app/chat/${item.sellerId?._id || item.sellerId}`)}
            disabled={!item.inStock}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95"
          >
            <MessageCircle className="h-4 w-4" /> Contact Seller
          </button>
        )}
      </div>
    </div>
  );
}
