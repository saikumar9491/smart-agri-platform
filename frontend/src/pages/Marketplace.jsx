import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Search, Filter, Plus, X, Loader2, 
  MapPin, Phone, Mail, Tag, Package, Trash2, 
  ChevronRight, ArrowRight, Image as ImageIcon, Power, CheckCircle2, Edit,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { cn } from '../utils/utils';

const CATEGORIES = ['All', 'Crops', 'Vegetables', 'Fruits', 'Seeds', 'Fertilizers', 'Tools', 'Land', 'Other'];

/**
 * Reusable Product Card Component (v1.0.1)
 */
const ProductCard = ({ item, user, API_URL, onEdit, onDelete, onToggleStatus, className, hideCategoryProp = false }) => (
  <div className={cn(
    "group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 transition-all hover:-translate-y-1 relative h-full flex flex-col",
    item.status === 'out_of_stock' && "opacity-75 grayscale-[0.5]",
    className
  )}>
    <div className="aspect-square relative overflow-hidden bg-slate-100">
      {item.image ? (
        <img 
          src={item.image.startsWith('/uploads') ? `${API_URL}${item.image}` : item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <ImageIcon className="h-12 w-12" />
        </div>
      )}

      {item.status === 'out_of_stock' && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
          <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter shadow-xl">
            Out of Stock
          </span>
        </div>
      )}

      {!hideCategoryProp && (
        <div className="absolute top-4 left-4 z-20">
          <span className={cn(
            "backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
            item.status === 'available' ? "bg-white/90 text-indigo-600" : "bg-slate-900/90 text-white"
          )}>
            {item.category}
          </span>
        </div>
      )}
    </div>
    
    <div className="p-3 space-y-2.5 flex-1 flex flex-col">
      <div className="flex-1">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.title}</h3>
        <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
          <MapPin className="h-2.5 w-2.5" />
          <span className="text-[10px] font-bold line-clamp-1">{item.location}</span>
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto pt-1">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Price</span>
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">
            ₹{item.price.toLocaleString()}
            {item.priceUnit && <span className="text-[10px] font-bold text-slate-400 ml-0.5">/ {item.priceUnit === 'piece' ? 'unit' : item.priceUnit === 'quintals' ? 'qunt' : item.priceUnit}</span>}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Quantity</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded-lg border border-slate-100">
            {item.quantity} {item.quantityUnit === 'units' ? 'units' : item.quantityUnit === 'quintals' ? 'qunt' : item.quantityUnit}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 space-y-3">
        <Link to={`/app/user/${item.seller?._id}`} className="flex items-center gap-3 group/seller hover:bg-slate-50 p-1 rounded-xl transition-all">
           <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 ring-2 ring-transparent group-hover/seller:ring-indigo-500/20 transition-all">
              {item.seller?.profilePic ? (
                <img src={item.seller.profilePic} alt={item.seller.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                  {item.seller?.name?.charAt(0) || 'U'}
                </div>
              )}
           </div>
           <span className="text-xs font-bold text-slate-600 border-b border-transparent group-hover/seller:text-indigo-600 group-hover/seller:border-indigo-600 transition-all">{item.seller?.name || 'User'}</span>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          {item.contactPhone && (
            <a 
              href={item.status === 'available' ? `tel:${item.contactPhone}` : '#'} 
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-xl transition-colors text-[10px] font-bold",
                item.status === 'available' ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <Phone className="h-3 w-3" /> Call
            </a>
          )}
          {item.contactEmail && (
            <a 
              href={item.status === 'available' ? `mailto:${item.contactEmail}` : '#'} 
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-xl transition-colors text-[10px] font-bold",
                item.status === 'available' ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <Mail className="h-3 w-3" /> Email
            </a>
          )}
        </div>

        {item.seller?._id === user?._id && (
          <div className="pt-2 border-t border-slate-50 flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={() => onEdit(item)} className="flex-1 flex items-center justify-center gap-2 p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-[10px] font-bold">
                <Edit className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => onToggleStatus(item._id, item.status)} className={cn("flex-1 flex items-center justify-center gap-2 p-2 rounded-xl transition-colors text-[10px] font-bold border", item.status === 'available' ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-slate-900 border-slate-900 text-white hover:bg-slate-800")}>
                <Power className="h-3 w-3" /> {item.status === 'available' ? 'Out' : 'Stock'}
              </button>
            </div>
            <button onClick={() => onDelete(item._id)} className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors text-[10px] font-bold">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * Category Section with Carousel Navigation
 */
const CategoryCarousel = ({ category, items, onViewAll, user, API_URL, onEdit, onDelete, onToggleStatus }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{category}</h2>
          <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
            {items.length}
          </span>
        </div>
        <button 
          onClick={() => onViewAll(category)}
          className="group flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
        >
          View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative group/carousel">
        {/* Navigation Arrows - Only visible on desktop hover */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-indigo-600 hover:text-white hidden lg:flex items-center justify-center active:scale-90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl border border-slate-100 opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-indigo-600 hover:text-white hidden lg:flex items-center justify-center active:scale-90"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex justify-start items-stretch gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {items.map((item) => (
            <div key={item._id} className="w-[150px] sm:w-[220px] shrink-0 grow-0 snap-start">
              <ProductCard 
                item={item} 
                user={user} 
                API_URL={API_URL} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onToggleStatus={onToggleStatus} 
                hideCategoryProp={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Marketplace() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  
  // New Listing State
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    priceUnit: 'kg',
    category: 'Crops',
    quantity: '',
    quantityUnit: 'quintals',
    location: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: category,
        search: search
      }).toString();
      
      const res = await fetch(`${API_URL}/api/listings?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewListing({ ...newListing, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    Object.keys(newListing).forEach(key => {
      formData.append(key, newListing[key]);
    });

    try {
      const url = editingListingId 
        ? `${API_URL}/api/listings/${editingListingId}`
        : `${API_URL}/api/listings`;
        
      const res = await fetch(url, {
        method: editingListingId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (editingListingId) {
          setListings(listings.map(l => l._id === editingListingId ? data.data : l));
        } else {
          setListings([data.data, ...listings]);
        }
        setShowModal(false);
        setEditingListingId(null);
        setNewListing({
          title: '', description: '', price: '', priceUnit: 'kg', category: 'Crops',
          quantity: '', quantityUnit: 'quintals', location: '', contactPhone: user?.phone || '',
          contactEmail: user?.email || '', image: null
        });
        setImagePreview(null);
      }
    } catch (err) {
      console.error(editingListingId ? 'Update failed:' : 'Create failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (listing) => {
    setEditingListingId(listing._id);
    setNewListing({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      priceUnit: listing.priceUnit || 'kg',
      category: listing.category,
      quantity: listing.quantity,
      quantityUnit: listing.quantityUnit || 'quintals',
      location: listing.location,
      contactPhone: listing.contactPhone || user?.phone || '',
      contactEmail: listing.contactEmail || user?.email || '',
      image: null
    });
    setImagePreview(listing.image ? (listing.image.startsWith('/uploads') ? `${API_URL}${listing.image}` : listing.image) : null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListings(listings.filter(l => l._id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'out_of_stock' : 'available';
      const res = await fetch(`${API_URL}/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setListings(listings.map(l => l._id === id ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Toggle status failed:', err);
    }
  };

  const handleViewAll = (cat) => {
    setCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            Marketplace
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium max-w-lg">Buy and sell agricultural products directly with other farmers.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 sm:px-6 sm:py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          List Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search products, crops, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
            />
          </form>

          {/* Categories Tab-style */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                  category === cat 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-xl leading-tight">Farmer's Trust</h3>
              <p className="mt-2 text-sm text-indigo-50 opacity-90 leading-relaxed">
                Connect directly with verified farmers. No middlemen, better prices.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all cursor-pointer">
                Learn more <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <ShoppingBag className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12 group-hover:scale-110 transition-all" />
          </div>
        </div>
      </div>

      {/* Listings Grid or Categorized Scrolls */}
      <div className="space-y-12 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-100 animate-pulse space-y-4">
                <div className="aspect-square bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
               <ShoppingBag className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No listings found</h3>
            <p className="text-slate-500 mt-2">Be the first to list a product!</p>
          </div>
        ) : category === 'All' ? (
          /* Grouped Categorized View with Horizontal Carousel */
          CATEGORIES.filter(cat => cat !== 'All').map(cat => {
            const catItems = listings.filter(l => l.category === cat);
            if (catItems.length === 0) return null;
            
            return (
              <CategoryCarousel 
                key={cat}
                category={cat}
                items={catItems}
                onViewAll={handleViewAll}
                user={user}
                API_URL={API_URL}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            );
          })
        ) : (
          /* Regular Grid View for Filtered Category */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {listings.map((item) => (
              <ProductCard 
                key={item._id} 
                item={item} 
                user={user} 
                API_URL={API_URL} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onToggleStatus={handleToggleStatus} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add Product */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <ShoppingBag className="h-5 w-5" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-900">{editingListingId ? 'Edit Product Details' : 'List Your Product'}</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
 
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* Product Title */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Product Title</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., Organic Red Onions"
                    value={newListing.title}
                    onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  />
                </div>
 
                {/* Category */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Category</label>
                  <select 
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
 
                {/* Price & Quantity */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Price (₹)</label>
                    <div className="flex gap-3">
                      <input 
                        required type="number"
                        placeholder="2500"
                        value={newListing.price}
                        onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                      />
                      <select
                        value={newListing.priceUnit}
                        onChange={(e) => setNewListing({ ...newListing, priceUnit: e.target.value })}
                        className="w-32 px-3 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs font-black cursor-pointer"
                      >
                        <option value="kg">/ kg</option>
                        <option value="quintals">/ quintal</option>
                        <option value="tonnes">/ tonne</option>
                        <option value="piece">/ unit</option>
                      </select>
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Quantity</label>
                    <div className="flex gap-3">
                      <input 
                        required type="text"
                        placeholder="50"
                        value={newListing.quantity}
                        onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                      />
                      <select
                        value={newListing.quantityUnit}
                        onChange={(e) => setNewListing({ ...newListing, quantityUnit: e.target.value })}
                        className="w-32 px-3 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs font-black cursor-pointer"
                      >
                        <option value="kg">kg</option>
                        <option value="quintals">quintals</option>
                        <option value="tonnes">tonnes</option>
                        <option value="units">units</option>
                      </select>
                    </div>
                  </div>
                </div>
 
                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Product Description</label>
                  <textarea 
                    required rows="4"
                    placeholder="Tell buyers more about your product..."
                    value={newListing.description}
                    onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium resize-none"
                  ></textarea>
                </div>
 
                {/* Location */}
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Location / APMC</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        required type="text"
                        placeholder="e.g., Nashik, Maharashtra"
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                      />
                    </div>
                </div>
 
                {/* Image */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Product Image</label>
                  <div className="relative aspect-video rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-indigo-400 transition-colors cursor-pointer group">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-slate-300 mx-auto" />
                          <p className="mt-2 text-xs font-bold text-slate-400">Click to upload photo</p>
                        </div>
                      )}
                      <input 
                      type="file" accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {imagePreview && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="text-white text-xs font-bold">Change Image</span>
                        </div>
                      )}
                  </div>
                </div>
 
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                  <button 
                    type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={submitting}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingListingId ? 'Save Changes' : 'Create Listing')}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
