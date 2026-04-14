import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Loader2, MapPin, FileText, ArrowLeft, UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import FollowModal from '../components/FollowModal';

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
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-xl shadow-sm border border-slate-200 w-max"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Community
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-12 sm:-mt-16 mb-4">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-white flex items-center justify-center text-4xl font-black text-teal-600 shadow-md overflow-hidden relative">
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
                  <div className="hidden h-full w-full items-center justify-center">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 space-y-1 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{profile.name}</h1>
              {profile.location && (
                <p className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin className="h-4 w-4 text-teal-500" /> {profile.location}
                </p>
              )}
            </div>

            <div className="mb-2 flex flex-col sm:flex-row gap-2">
              {!isOwnProfile && (
                <button 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all sm:w-auto w-full ${
                    profile.isFollowing 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-teal-500/25'
                  } disabled:opacity-70`}
                >
                  {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    profile.isFollowing ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>
                  }
                </button>
              )}
              {isOwnProfile && (
                <button onClick={() => navigate('/app/profile')} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all sm:w-auto w-full">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-8 border-t border-slate-100 pt-6 mt-6">
            <div className="text-center">
              <span className="block text-2xl font-black text-slate-800">{posts.length}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posts</span>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -m-2"
              onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }}
            >
              <span className="block text-2xl font-black text-slate-800">{profile.followersCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Followers</span>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -m-2"
              onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }}
            >
              <span className="block text-2xl font-black text-slate-800">{profile.followingCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Following</span>
            </div>
            {!isOwnProfile && profile.mutualsCount !== undefined && (
              <div 
                className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors -m-2"
                onClick={() => { setFollowModalType('mutuals'); setIsFollowModalOpen(true); }}
              >
                <span className="block text-2xl font-black text-slate-800">{profile.mutualsCount}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mutuals</span>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
              <p className="text-slate-700 italic relative z-10 w-full">"{profile.bio}"</p>
            </div>
          )}
        </div>
      </div>

      {/* User's Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 px-1">
          <FileText className="h-5 w-5 text-teal-500" /> {profile.name}'s Posts
        </h2>
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 shadow-sm">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group" 
                onClick={() => navigate('/app/community')}
              >
                <div className="flex justify-between items-start mb-3 gap-4">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-600 transition-colors">{post.title}</h3>
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 bg-slate-50 px-2 py-1 rounded-lg">{post.time}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{post.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-1 rounded-md tracking-wider uppercase">
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
    </div>
  );
}
