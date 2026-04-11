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
    <div className="relative min-h-screen -mt-10 pt-10 pb-20 px-4 sm:px-6">
      {/* ── BACKGROUND IMAGE ── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Card (Glassy) */}
        <div className="relative overflow-hidden rounded-[40px] border border-white/40 bg-white/40 backdrop-blur-3xl shadow-2xl">
          <div className="h-40 bg-gradient-to-r from-green-600/80 to-indigo-600/80 backdrop-blur-md" />
          <div className="px-6 sm:px-10 pb-10">
            <div className="relative -mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="relative">
                <div className="h-40 w-40 rounded-[32px] border-4 border-white/50 bg-white/20 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center group">
                  {user.profilePic && !imageError ? (
                    <img 
                      key={user.profilePic}
                      src={localPreview || (user.profilePic.startsWith('/uploads') 
                        ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                        : user.profilePic)
                      } 
                      alt={user.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={() => {
                         console.error("Image load error for:", user.profilePic);
                         if (!localPreview) setImageError(true);
                      }}
                    />
                  ) : (
                    <User className="h-20 w-20 text-white/40" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 p-3 bg-white text-green-600 rounded-2xl shadow-xl hover:scale-110 transition-all cursor-pointer border border-green-100">
                  <Camera className="h-5 w-5" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.heic,.heif"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
              <div className="pb-4">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 group"
                  >
                    <Edit3 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                     <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                     <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                    >
                      {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight">{user.name}</h1>
                <p className="text-white/70 font-bold tracking-tight text-lg">Verified Farmer Platform Member</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/10">
                  <MapPin className="h-4 w-4 text-green-400" />
                  {user.location || 'Location not set'}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/10">
                  <Mail className="h-4 w-4 text-blue-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/10">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
              </div>

              <p className="mt-6 text-white/80 text-lg font-medium leading-relaxed max-w-3xl drop-shadow-sm italic">
                "{user.bio || 'No bio provided. Farmers who share their story build better community trust!'}"
              </p>

              {/* Social Stats Row */}
              <div className="mt-8 flex items-center gap-12 py-8 border-t border-white/10">
                <div className="text-left flex flex-col">
                  <span className="text-3xl font-black text-white">{user.followers?.length || 0}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Followers</span>
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-3xl font-black text-white">{user.following?.length || 0}</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={cn(
            "p-5 rounded-[24px] border flex items-center gap-3 animate-in fade-in zoom-in-95 duration-500 backdrop-blur-xl",
            message.type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-200" : "bg-red-500/20 border-red-500/30 text-red-200"
          )}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-black text-sm uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        {/* Profile Details Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form / Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/40 backdrop-blur-3xl p-8 md:p-10 rounded-[40px] border border-white/40 shadow-2xl">
              <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                <Info className="h-6 w-6 text-indigo-400" /> 
                {isEditing ? 'Update Professional Details' : 'Professional Profile'}
              </h2>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Display Name</label>
                      <input 
                        type="text" name="name"
                        className="w-full bg-white/10 border-white/20 rounded-2xl text-white py-3 focus:ring-2 focus:ring-green-500 transition-all font-bold placeholder:text-white/20"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Farmer Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                        Location
                        <button 
                          type="button"
                          onClick={handleGetLocation}
                          className="text-[9px] text-green-400 hover:text-green-300 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg transition-all font-black uppercase tracking-tighter"
                        >
                          <Navigation className="h-3 w-3" />
                          Auto detect
                        </button>
                      </label>
                      <input 
                        type="text" name="location"
                        className="w-full bg-white/10 border-white/20 rounded-2xl text-white py-3 focus:ring-2 focus:ring-green-500 transition-all font-bold"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Personal Bio</label>
                      <textarea 
                        name="bio" rows={4}
                        className="w-full bg-white/10 border-white/20 rounded-2xl text-white p-4 focus:ring-2 focus:ring-green-500 transition-all font-bold"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Share your agricultural journey..."
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Farm Management</h4>
                        <p className="text-xl font-black text-white flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-indigo-400" />
                          {user.farmSize ? `${user.farmSize} Hectares` : 'Not specified'}
                        </p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Soil Type</h4>
                        <p className="text-xl font-black text-white flex items-center gap-3">
                          <Sprout className="h-5 w-5 text-green-400" />
                          {user.soilType || 'Not identified'}
                        </p>
                      </div>
                   </div>
                   <div className="bg-indigo-500/10 p-8 rounded-[32px] border border-indigo-500/20 backdrop-blur-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <h4 className="font-black text-white text-lg tracking-tight uppercase">Community Status</h4>
                        </div>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                          Verified farmers can publish community posts and receive advisory from our AI disease models.
                        </p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em]">Verified Member Since 2026</span>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Mini Stats */}
          <div className="space-y-8">
             <div className="bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[40px] text-white shadow-2xl border border-white/10 group overflow-hidden relative">
                <div className="relative z-10 space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-widest text-white/90">Quick Portal</h3>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest group-hover:translate-x-1 duration-300 border border-white/5">
                      My Marketplace <span>&rarr;</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest group-hover:translate-x-1 duration-300 border border-white/5">
                      Disease History <span>&rarr;</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest group-hover:translate-x-1 duration-300 border border-white/5">
                      Weather Alerts <span>&rarr;</span>
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl" />
             </div>

             <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-6">
                <div className="mx-auto h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <Info className="h-8 w-8 text-white/60" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-white text-lg uppercase tracking-tight">Privacy Shield</h3>
                  <p className="text-white/40 text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                    Your contact details remain encrypted. Only public profile info is shared with the AgriSmart network.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Development Debug Info */}
        {(window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.')) && (
          <div className="mt-10 p-6 bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/10 text-[10px] font-mono text-white/30 overflow-x-auto">
            <p className="font-black mb-2 text-white/50 uppercase tracking-widest underline">System Node Info:</p>
            <p>Node: {window.location.hostname}</p>
            <p>Path: {API_URL}</p>
            <p>Asset: {user.profilePic}</p>
          </div>
        )}
      </div>
    </div>
  );
}
