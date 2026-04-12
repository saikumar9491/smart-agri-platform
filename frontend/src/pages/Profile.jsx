import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { User, MapPin, Mail, Calendar, Edit3, Save, X, Camera, Sprout, Ruler, Info, Navigation, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../utils/utils';

export default function Profile() {
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

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        bio: user.bio || '',
        profilePic: user.profilePic || '',
        farmSize: user.farmSize || '',
        soilType: user.soilType || ''
      });
    }
  }, [user]);

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
    <PageBackground className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 px-4 sm:px-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 backdrop-blur-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
        <div className="h-40 bg-gradient-to-r from-green-600/30 to-indigo-600/30 backdrop-blur-xl" />
        <div className="px-6 md:px-10 pb-10 relative z-10">
          <div className="relative -mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="relative inline-block">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] border-[4px] border-[#15201A] bg-black/60 shadow-[0_0_30px_rgba(34,197,94,0.3)] backdrop-blur-md overflow-hidden flex items-center justify-center">
                {user.profilePic && !imageError ? (
                  <img 
                    key={user.profilePic}
                    src={localPreview || (user.profilePic.startsWith('/uploads') 
                      ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                      : user.profilePic)
                    } 
                    alt={user.name}
                    className="h-full w-full object-cover" 
                    onError={() => {
                       console.error("Image load error for:", user.profilePic);
                       if (!localPreview) setImageError(true);
                    }}
                  />
                ) : (
                  <User className="h-16 w-16 text-white/30" />
                )}
              </div>
              <label className="absolute bottom-[-5px] right-[-5px] h-12 w-12 bg-green-500 rounded-2xl shadow-[0_4px_16px_rgba(34,197,94,0.6)] text-slate-900 hover:bg-green-400 hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center border-2 border-[#15201A]">
                <Camera className="h-5 w-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.heic,.heif"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            
            <div className="pb-2 w-full sm:w-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-white/20 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/90 active:scale-95 transition-all shadow-xl group"
                >
                  <Edit3 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 w-full sm:w-auto">
                   <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 sm:flex-none px-6 py-3.5 bg-black/40 border border-white/20 text-white/70 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/60 hover:text-white transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                   <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-green-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95"
                  >
                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" /> : <Save className="h-4 w-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">{user.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-white/80">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <MapPin className="h-4 w-4 text-green-400" />
                {user.location || 'Location not set'}
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <Mail className="h-4 w-4 text-indigo-400" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md hidden sm:flex">
                <Calendar className="h-4 w-4 text-amber-400" />
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <p className="mt-8 text-white/70 leading-relaxed font-medium italic max-w-2xl bg-black/20 p-5 rounded-2xl border-l-[6px] border-green-500/50 shadow-inner">
              "{user.bio || 'No bio provided. Farmers who share their story build better community trust!'}"
            </p>

            {/* Social Stats Row */}
            <div className="mt-10 flex items-center gap-8 py-6 border-t border-white/10 max-w-md">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{user.followers?.length || 0}</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Followers</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white">{user.following?.length || 0}</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={cn(
          "p-5 rounded-2xl border flex items-center gap-4 backdrop-blur-xl animate-in zoom-in-95 duration-300 shadow-2xl",
          message.type === 'success' ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-rose-500/20 border-rose-500/40 text-rose-300"
        )}>
          {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          <span className="font-black text-sm tracking-tight">{message.text}</span>
        </div>
      )}

      {/* Profile Details Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form / Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphic p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-black text-white mb-8 flex items-center gap-3 relative z-10">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
                <Info className="h-4 w-4 text-indigo-400" />
              </div>
              {isEditing ? 'Update Details' : 'Professional Profile'}
            </h2>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Display Name</label>
                    <input 
                      type="text" name="name"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl text-white px-5 py-4 placeholder-white/30 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">
                      Location
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        className="text-[9px] text-green-300 hover:text-green-200 flex items-center gap-1 bg-green-500/20 px-2.5 py-1 rounded-lg transition-colors border border-green-500/30"
                      >
                        <Navigation className="h-3 w-3" />
                        Use GPS
                      </button>
                    </label>
                    <input 
                      type="text" name="location"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl text-white px-5 py-4 placeholder-white/30 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Personal Bio</label>
                    <textarea 
                      name="bio" rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl text-white px-5 py-4 placeholder-white/30 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-bold resize-none"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                 <div className="space-y-6">
                    <div className="bg-black/30 p-6 rounded-3xl border border-white/5 shadow-inner">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Farm Size</h4>
                      <p className="text-xl font-black text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Ruler className="h-5 w-5" /></div>
                        {user.farmSize ? `${user.farmSize} Hectares` : 'Not specified'}
                      </p>
                    </div>
                    <div className="bg-black/30 p-6 rounded-3xl border border-white/5 shadow-inner">
                      <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Soil Type</h4>
                      <p className="text-xl font-black text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30"><Sprout className="h-5 w-5" /></div>
                        {user.soilType || 'Not identified'}
                      </p>
                    </div>
                 </div>
                 <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 p-8 rounded-3xl border border-green-500/30 flex flex-col justify-center relative overflow-hidden group shadow-2xl">
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-[1.2] transition-transform duration-1000 rotate-12">
                       <CheckCircle className="h-48 w-48" />
                    </div>
                    <h4 className="font-black text-white mb-2 relative z-10 text-xl tracking-tight">Community Status</h4>
                    <div className="flex items-center gap-3 relative z-10 mb-5">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_15px_rgba(74,222,128,1)]" />
                      <span className="text-xs font-black text-green-300 uppercase tracking-[0.2em]">Verified Farmer</span>
                    </div>
                    <p className="text-xs text-white/70 font-bold leading-relaxed relative z-10">
                      You are a verified member. You have full access to publish community posts and receive high-priority AI disease scanning.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Stats */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 p-8 rounded-[2.5rem] border border-indigo-500/40 text-white shadow-2xl relative overflow-hidden group backdrop-blur-xl">
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => window.location.href = '/app/sales'} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all font-bold text-sm group/btn">
                    Marketplace Ads <span className="transform group-hover/btn:translate-x-1 transition-transform text-indigo-400">&rarr;</span>
                  </button>
                  <button onClick={() => window.location.href = '/app/disease'} className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all font-bold text-sm group/btn">
                    Scan New Crop <span className="transform group-hover/btn:translate-x-1 transition-transform text-indigo-400">&rarr;</span>
                  </button>
                </div>
              </div>
              <div className="absolute -top-20 -right-20 h-64 w-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
           </div>

           <div className="bg-black/30 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-xl text-center flex flex-col items-center">
              <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/10">
                <Info className="h-5 w-5 text-white/50" />
              </div>
              <h3 className="font-black text-white text-xs uppercase tracking-widest leading-tight">Privacy Active</h3>
              <p className="mt-3 text-[11px] text-white/50 font-bold leading-relaxed max-w-[200px]">
                Your contact details remain shielded from the public and are only exposed upon mutual marketplace agreement.
              </p>
           </div>
        </div>
      </div>
          <p>user.profilePic: {user.profilePic}</p>
          <p>Final Image src: {localPreview || (user.profilePic.startsWith('/uploads') ? `${API_URL}${user.profilePic}` : user.profilePic)}</p>
          <p>isLocal (config): {String(window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.'))}</p>
        </div>
      )}
    </div>
  );
}
