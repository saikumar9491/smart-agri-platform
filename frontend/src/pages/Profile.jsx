import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { User, MapPin, Mail, Calendar, Edit3, Save, X, Camera, Sprout, Ruler, Info, Navigation, CheckCircle, AlertCircle, FileText, Store } from 'lucide-react';
import { cn } from '../utils/utils';
import PageBackground from '../components/PageBackground';
import FollowModal from '../components/FollowModal';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || '',
    farmSize: user?.farmSize || '',
    soilType: user?.soilType || ''
  });
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers'); 

  // Additional data for the public face of the profile
  const [posts, setPosts] = useState([]);
  const [marketItems, setMarketItems] = useState([]);

  useEffect(() => {
    if (user && token) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
        farmSize: user.farmSize || '',
        soilType: user.soilType || ''
      });
      // Fetch public items (Posts and Market Items)
      fetch(`${API_URL}/api/auth/profile/${user._id || user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setPosts(data.posts || []);
            setMarketItems(data.marketItems || []);
          }
        })
        .catch(console.error);
    }
  }, [user, token]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setImageError(false);

    const formData = new FormData();
    formData.append('photo', file);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setLocalPreview(null); // Clear preview to use server URL
        setImageError(false);
        setMessage({ type: 'success', text: 'Photo updated!' });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const state = data.address.state || '';
            const country = data.address.country || '';
            const locationStr = [city, state, country].filter(Boolean).join(', ');
            
            setFormData(prev => ({ ...prev, location: locationStr }));
            setMessage({ type: 'success', text: `Location detected: ${locationStr}` });
          } else {
            setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setMessage({ type: 'error', text: 'Failed to resolve address. Using coordinates.' });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setMessage({ type: 'error', text: 'Location access denied or unavailable' });
        setLoading(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Update Profile Error:', error);
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PageBackground className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      
      {message.text && (
        <div className={cn(
          "mb-8 p-5 rounded-2xl border flex items-center gap-4 backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl z-50",
          message.type === 'success' ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-rose-500/20 border-rose-500/40 text-rose-300"
        )}>
          {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <span className="font-black tracking-widest text-sm uppercase">{message.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* LEFT COLUMN: The Sticky "Identity Badge" */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-24 space-y-8">
          
          <div className="relative rounded-[3rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group pb-8">
            {/* Ambient Background Glow inside the card */}
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-green-500/30 to-transparent opacity-50 pointer-events-none" />
            
            <div className="pt-12 px-8 flex flex-col items-center text-center relative z-10">
              {/* Massive Avatar */}
              <div className="relative mb-6 group/avatar perspective-1000">
                <div className="h-40 w-40 rounded-full border-[6px] border-[#0F172A] bg-black/80 shadow-[0_0_40px_rgba(34,197,94,0.4)] backdrop-blur-md overflow-hidden flex items-center justify-center transform transition-transform duration-700 group-hover/avatar:rotate-y-12">
                  {user.profilePic && !imageError ? (
                    <img 
                      key={user.profilePic}
                      src={localPreview || (user.profilePic.startsWith('/uploads') ? `${API_URL}${user.profilePic}?t=${Date.now()}` : user.profilePic)} 
                      alt={user.name}
                      className="h-full w-full object-cover" 
                      onError={() => { if(!localPreview) setImageError(true); }}
                    />
                  ) : (
                    <User className="h-20 w-20 text-white/20" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-14 w-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)] text-slate-900 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center border-4 border-[#0F172A]">
                  <Camera className="h-6 w-6" />
                  <input type="file" className="hidden" accept="image/*,.heic,.heif" onChange={handlePhotoUpload} />
                </label>
              </div>

              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">{user.name}</h1>
              
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-xs uppercase tracking-[0.3em] mb-6">
                <MapPin className="h-4 w-4" />
                {user.location || 'Unknown Sector'}
              </div>

              <p className="text-sm text-white/60 font-medium leading-relaxed italic mb-8 px-2 max-w-[300px]">
                "{user.bio || 'Your agricultural story begins here. Complete your bio to connect with peers.'}"
              </p>

              {/* Social Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                <div 
                  className="group bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.05)] transition-all duration-300"
                  onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }}
                >
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:scale-110 group-hover:text-green-300 transition-all">{user.followers?.length || 0}</span>
                  <span className="text-[8px] sm:text-[9px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-white/40 uppercase mt-1">Followers</span>
                </div>
                <div 
                  className="group bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.05)] transition-all duration-300"
                  onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }}
                >
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:scale-110 group-hover:text-green-300 transition-all">{user.following?.length || 0}</span>
                  <span className="text-[8px] sm:text-[9px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-white/40 uppercase mt-1">Following</span>
                </div>
                <div 
                  className="group bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.05)] transition-all duration-300"
                  onClick={() => { setFollowModalType('mutuals'); setIsFollowModalOpen(true); }}
                >
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:scale-110 group-hover:text-green-300 transition-all">
                    {(user.following || []).filter(f => (user.followers || []).includes(f)).length}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-white/40 uppercase mt-1">Friends</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 border border-white/5 rounded-[2rem] p-6 text-center backdrop-blur-xl">
            <Calendar className="h-5 w-5 text-indigo-400 mx-auto mb-3" />
            <p className="text-[11px] uppercase tracking-[0.2em] font-black text-white/40">Member Since</p>
            <p className="text-lg font-black text-white mt-1">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
          </div>

        </div>

        {/* RIGHT COLUMN: The Command Center */}
        <div className="flex-1 space-y-8 w-full">
          
          {/* Main Action Bar */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-4 flex-wrap gap-4 shadow-xl">
            <div className="flex items-center gap-4 px-4">
              <div className="h-12 w-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-indigo-300 uppercase">Secure Contact</p>
                <p className="text-sm font-black text-white">{user.email}</p>
              </div>
            </div>
            
            <div className="ml-auto w-full sm:w-auto">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3">
                  <Edit3 className="h-4 w-4" /> Edit Configuration
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setIsEditing(false)} className="flex-1 px-6 py-4 bg-transparent border border-white/20 text-white/70 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Cancel</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 px-8 py-4 bg-green-500 text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
                    {loading ? <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form / Detail Area */}
          <div className="relative bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden min-h-[400px]">
            {/* Decorative BG element */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-10 flex items-center gap-4 relative z-10">
              <span className="h-2 w-10 bg-green-500 rounded-full" />
              {isEditing ? 'System Overwrite' : 'Operational Specs'}
            </h2>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2">Radar Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-2xl text-white px-6 py-5 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold text-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2">
                      Coordinates
                      <button type="button" onClick={handleGetLocation} className="text-green-400 hover:text-green-300 flex items-center gap-1 font-black">
                        <Navigation className="h-3 w-3" /> Auto-Lock
                      </button>
                    </label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-2xl text-white px-6 py-5 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold text-lg" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2">Mission Log (Bio)</label>
                    <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-2xl text-white px-6 py-5 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold text-lg resize-none" />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="group bg-white/5 border border-white/10 hover:border-emerald-500/50 p-8 rounded-[2rem] transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Area of Governance</p>
                  <p className="text-3xl font-black text-white tracking-tight">{user.farmSize ? `${user.farmSize} Hectares` : 'N/A'}</p>
                </div>
                
                <div className="group bg-white/5 border border-white/10 hover:border-amber-500/50 p-8 rounded-[2rem] transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                  <div className="h-12 w-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Sprout className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Primary Soil Profile</p>
                  <p className="text-3xl font-black text-white tracking-tight">{user.soilType || 'Unanalyzed'}</p>
                </div>
                
                <div className="md:col-span-2 bg-gradient-to-r from-green-900/60 to-emerald-900/20 border border-green-500/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
                  <div className="absolute right-0 top-0 bottom-0 w-64 bg-green-500/10 blur-[50px] rotate-45 pointer-events-none" />
                  <div className="shrink-0 relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-[20px] animate-pulse opacity-50" />
                    <CheckCircle className="h-20 w-20 text-green-400 relative z-10" />
                  </div>
                  <div className="text-center md:text-left relative z-10">
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.1em] mb-3">Clearance: Verified</h3>
                    <p className="text-white/60 font-bold leading-relaxed text-sm">
                      Level 1 Community Access granted. You are authorized to broadcast locally, initiate Secure Marketplace transactions, and utilize deep-learning Disease ML scans without quota restrictions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Posts & Activity section appended below settings */}
            {!isEditing && (
              <div className="mt-12 space-y-6 relative z-10">
                <h2 className="text-xl font-black flex items-center gap-3 text-white tracking-wide">
                  <span className="h-2 w-8 bg-green-500 rounded-full" />
                  Your Activity Feed
                </h2>
                {posts.length === 0 ? (
                  <div className="bg-black/30 border border-white/5 rounded-3xl p-6 text-center">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No Posts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.slice(0, 3).map(post => (
                       <div 
                         key={post.id} 
                         className="group bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] hover:border-green-500/40 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
                         onClick={() => navigate('/app/community', { state: { scrollToPost: post.id } })}
                       >
                         <h3 className="font-black text-white group-hover:text-green-300 transition-colors mb-2">{post.title}</h3>
                         <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{post.content}</p>
                       </div>
                    ))}
                    {posts.length > 3 && (
                       <button onClick={() => navigate('/app/community')} className="w-full text-center text-xs font-bold text-green-400 uppercase tracking-widest hover:text-green-300">View All In Community</button>
                    )}
                  </div>
                )}

                <h2 className="text-xl font-black flex items-center gap-3 text-white tracking-wide mt-10">
                  <span className="h-2 w-8 bg-green-500 rounded-full" />
                  Your Market Listings
                </h2>
                {marketItems.length === 0 ? (
                  <div className="bg-black/30 border border-white/5 rounded-3xl p-6 text-center">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No Listings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {marketItems.map(item => (
                       <div 
                         key={item._id} 
                         className="group relative bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-5 shadow-xl hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] hover:border-green-500/40 hover:-translate-y-1 transition-all duration-500 cursor-pointer flex items-center gap-4"
                         onClick={() => navigate('/app/sales', { state: { scrollToItem: item._id } })}
                       >
                         {item.image ? (
                           <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                             <img src={item.image.startsWith('/uploads') ? `${API_URL}${item.image}` : item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                         ) : (
                           <div className="w-16 h-16 shrink-0 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl"><Store className="h-6 w-6 text-white/30"/></div>
                         )}
                         <div className="flex-1 overflow-hidden">
                           <h3 className="font-black text-sm text-white truncate group-hover:text-green-300 transition-colors">{item.title}</h3>
                           <p className="text-green-400 font-bold text-xs mt-1">₹{item.price}</p>
                         </div>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <FollowModal 
        isOpen={isFollowModalOpen} 
        onClose={() => setIsFollowModalOpen(false)} 
        userId={user._id} 
        type={followModalType} 
        title={followModalType} 
      />
    </PageBackground>
  );
}
