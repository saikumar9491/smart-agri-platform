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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="h-32 bg-gradient-to-r from-green-600 to-indigo-600" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl border-4 border-white bg-slate-100 shadow-lg overflow-hidden flex items-center justify-center">
                {user.profilePic && !imageError ? (
                  <img 
                    key={user.profilePic}
                    src={user.profilePic.startsWith('/uploads') 
                      ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                      : user.profilePic
                    } 
                    alt={user.name} 
                    className="h-full w-full object-cover" 
                    onError={() => {
                       console.error("Image load error for:", user.profilePic);
                       setImageError(true);
                    }}
                  />
                ) : (
                  <User className="h-16 w-16 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-white rounded-xl shadow-md text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.heic,.heif"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div className="pb-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md group"
                >
                  <Edit3 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                   <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-md shadow-green-100"
                  >
                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
                {user.location || 'Location not set'}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                <Mail className="h-4 w-4 text-indigo-600" />
                {user.email}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 text-amber-600" />
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>
            <p className="mt-4 text-slate-600 leading-relaxed max-w-2xl font-medium italic">
              {user.bio || 'No bio provided. Farmers who share their story build better community trust!'}
            </p>

            {/* Social Stats Row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-8 py-5 border-y border-slate-100 max-w-md">
              <div className="text-center flex flex-col">
                <span className="text-2xl font-black text-slate-900">{user.followers?.length || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Followers</span>
              </div>
              <div className="text-center flex flex-col">
                <span className="text-2xl font-black text-slate-900">{user.following?.length || 0}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300",
          message.type === 'success' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
        )}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* Profile Details Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form / Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" /> 
              {isEditing ? 'Update Professional Details' : 'Professional Profile'}
            </h2>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" name="name"
                      className="w-full rounded-xl border-slate-200 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                      Location
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        className="text-[10px] text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md transition-all font-black"
                      >
                        <Navigation className="h-3 w-3" />
                        Use Current
                      </button>
                    </label>
                    <input 
                      type="text" name="location"
                      className="w-full rounded-xl border-slate-200 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Personal Bio</label>
                    <textarea 
                      name="bio" rows={4}
                      className="w-full rounded-xl border-slate-200 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Farm Management</h4>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-slate-400" />
                        {user.farmSize ? `${user.farmSize} Hectares` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Soil Type</h4>
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-slate-400" />
                        {user.soilType || 'Not identified'}
                      </p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2">Community Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-bold text-slate-600">Verified Farmer</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 font-medium leading-relaxed">
                      Verified farmers can publish community posts and receive advisory from our AI disease models.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Stats */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 group overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-bold">Quick Actions</h3>
                <div className="mt-6 space-y-3">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm group-hover:translate-x-1 duration-300">
                    My Posts <span>&rarr;</span>
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm group-hover:translate-x-1 duration-300">
                    Disease Reports <span>&rarr;</span>
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
           </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900">Privacy Control</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                Only your name and location are visible to other community members. Your contact details remain private.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

