import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { X, User, MapPin } from 'lucide-react';
import { cn } from '../utils/utils';

export default function FollowModal({ isOpen, onClose, userId, type, title }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId && type) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${userId}/${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleUserClick = (id) => {
    onClose();
    navigate(`/app/user/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal panel */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 capitalize">
            {title || type}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              No users found.
            </div>
          ) : (
            <div className="space-y-1">
              {users.map(user => (
                <div 
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 border-2 border-slate-100 overflow-hidden flex items-center justify-center text-slate-400 group-hover:border-teal-200 transition-colors">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic.startsWith('/uploads') ? `${API_URL}${user.profilePic}` : user.profilePic} 
                        alt={user.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                      {user.name}
                    </h4>
                    {user.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{user.location}</span>
                      </p>
                    )}
                  </div>
                  
                  {/* Role badge (optional) */}
                  {user.role === 'admin' && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
