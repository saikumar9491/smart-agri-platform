import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Loader2, MapPin, FileText, ArrowLeft, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import FollowModal from '../components/FollowModal';
import PageBackground from '../components/PageBackground';

export default function UserProfile() {
  const { id } = useParams();
  const { token, user: currentUser, updateFollowing } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers'); // 'followers', 'following', 'mutuals'

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setPosts(data.posts);
      } else {
        alert(data.message || 'Profile not found');
        navigate('/app/community');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      navigate('/app/community');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.followersCount
        }));
        if (currentUser) {
          updateFollowing(id, data.isFollowing);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
        
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="h-32 bg-slate-100 animate-pulse"></div>
          <div className="px-6 sm:px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-12 sm:-mt-16 mb-4">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-slate-200 animate-pulse shadow-md" />
              <div className="flex-1 space-y-3 mb-2">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            <div className="flex gap-8 border-t border-slate-100 pt-6 mt-6">
              <div className="space-y-2">
                <div className="h-6 w-8 bg-slate-200 rounded mx-auto animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-8 bg-slate-200 rounded mx-auto animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-8 bg-slate-200 rounded mx-auto animate-pulse" />
                <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Posts Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse ml-1" />
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-6 w-2/3 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-100 rounded-md animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUser && currentUser._id === profile._id;

  return (
    <PageBackground className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl shadow-lg border border-white/10 w-max backdrop-blur-md uppercase tracking-wider text-[10px] font-black"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </button>

      {/* Profile Header (Glassmorphism) */}
      <div className="relative rounded-[3rem] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group pb-8">
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-green-500/30 to-transparent opacity-50 pointer-events-none" />
        
        <div className="pt-12 px-8 flex flex-col items-center text-center relative z-10">
          <div className="relative mb-6 group/avatar perspective-1000">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-[6px] border-[#0F172A] bg-black/80 shadow-[0_0_40px_rgba(34,197,94,0.4)] backdrop-blur-md overflow-hidden flex items-center justify-center transform transition-transform duration-700 group-hover/avatar:rotate-y-12">
              {profile.profilePic ? (
                <>
                  <img 
                    src={profile.profilePic.startsWith('/uploads') 
                      ? `${API_URL}${profile.profilePic}${profile.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                      : profile.profilePic
                    } 
                    alt={profile.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden h-full w-full items-center justify-center text-4xl md:text-6xl font-black text-white">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <span className="text-4xl md:text-6xl font-black text-white/50">{profile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">{profile.name}</h1>
          {profile.location && (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-[0.3em] mb-6">
              <MapPin className="h-4 w-4" />
              {profile.location}
            </div>
          )}

          <div className="mb-8 flex flex-col sm:flex-row gap-2 w-full justify-center px-4">
            {!isOwnProfile && (
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all sm:w-auto w-full border ${
                  profile.isFollowing 
                    ? 'bg-transparent border-white/20 text-white/70 hover:bg-white/10' 
                    : 'bg-green-500 border-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-400'
                } disabled:opacity-50`}
              >
                {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                  profile.isFollowing ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>
                }
              </button>
            )}
            {isOwnProfile && (
              <button onClick={() => navigate('/app/profile')} className="px-8 py-3.5 border border-white/20 bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all sm:w-auto w-full">
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-2 sm:gap-4 w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-white">{posts.length}</span>
              <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mt-1">Posts</span>
            </div>
            <div 
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }}
            >
              <span className="text-xl sm:text-2xl font-black text-white">{profile.followersCount}</span>
              <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mt-1">Followers</span>
            </div>
            <div 
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }}
            >
              <span className="text-xl sm:text-2xl font-black text-white">{profile.followingCount}</span>
              <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mt-1">Following</span>
            </div>
            {!isOwnProfile && profile.mutualsCount !== undefined && (
              <div 
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => { setFollowModalType('mutuals'); setIsFollowModalOpen(true); }}
              >
                <span className="text-xl sm:text-2xl font-black text-white">{profile.mutualsCount}</span>
                <span className="text-[9px] font-black tracking-[0.2em] text-white/40 uppercase mt-1">Friends</span>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <p className="mt-8 text-sm text-white/60 font-medium leading-relaxed italic max-w-lg">
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-black flex items-center gap-3 text-white px-2 tracking-wide">
          <span className="h-2 w-8 bg-green-500 rounded-full" />
          {profile.name}'s Activity
        </h2>
        
        {posts.length === 0 ? (
          <div className="relative bg-black/40 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-12 text-center text-white/50 shadow-2xl">
            <div className="bg-white/5 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FileText className="h-8 w-8 text-white/30" />
            </div>
            <p className="font-bold text-sm tracking-widest uppercase">No Intel Found</p>
            <p className="text-xs mt-1">This user hasn't broadcasted anything yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="relative bg-black/40 border border-white/10 backdrop-blur-3xl p-6 md:p-8 rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] hover:border-green-500/30 transition-all cursor-pointer group" 
                onClick={() => navigate('/app/community')}
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="font-black text-xl text-white group-hover:text-green-300 transition-colors leading-tight">{post.title}</h3>
                  <span className="text-[10px] font-black text-white/40 shrink-0 bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">{post.time}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 font-medium">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 font-black px-3 py-1.5 rounded-xl tracking-[0.2em] uppercase shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FollowModal 
        isOpen={isFollowModalOpen} 
        onClose={() => setIsFollowModalOpen(false)} 
        userId={profile._id} 
        type={followModalType} 
        title={followModalType === 'mutuals' ? 'Friends & Mutuals' : followModalType} 
      />
    </PageBackground>
  );
}
