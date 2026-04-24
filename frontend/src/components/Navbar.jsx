import { 
  Bell, UserCircle, LogOut, Info, AlertTriangle, 
  CheckCircle, Trash2, ShieldCheck, Search
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { resolveImageUrl, cn } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';


export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const userRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 z-[1000] w-full transition-all duration-500 ease-in-out",
      isScrolled 
        ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_10px_30px_rgba(0,0,0,0.06)]" 
        : "bg-white border-b border-slate-100 shadow-none"
    )}>
      {/* Integrated Header - Single Row Navigation */}
      <div className="relative flex items-center h-16 px-4 md:px-8 max-w-[1600px] mx-auto w-full">
        {/* Logo Section */}
        <Link to="/app" className="flex items-center gap-2 font-bold text-xl text-green-700 shrink-0 z-10">
          <div className="text-2xl h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 shadow-sm border border-green-100">
            🌾
          </div> 
          <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent hidden xl:inline font-black tracking-tight">AgriSmart</span>
        </Link>

        {/* Search Bar - Absolutely Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block w-full max-w-[320px] lg:max-w-[420px] px-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/app/market?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }} 
            className="relative group transition-all duration-300"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-green-500 transition-colors z-10" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farm records..."
              className="h-10 w-full rounded-2xl border border-slate-200/60 bg-slate-100/50 backdrop-blur-md pl-10 pr-4 text-xs focus:border-green-500/50 focus:bg-white focus:ring-4 focus:ring-green-500/5 transition-all shadow-inner placeholder:text-slate-400"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center space-x-2 z-10" ref={dropdownRef}>
          {user?.role === 'admin' && (
            <Link 
              to="/app/admin"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-200/50 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <Search className="h-4 w-4" />
          </button>

          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] top-full p-0 overflow-hidden"
              >
                 <div className="p-4 border-b border-white/20 bg-white/40 flex items-center justify-between">
                    <span className="font-bold text-sm">Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={handleClearAll} className="text-[10px] font-black uppercase text-rose-600">Clear</button>
                    )}
                 </div>
                 <div className="max-h-80 overflow-y-auto no-scrollbar">
                   {notifications.length === 0 ? (
                     <div className="p-12 text-center text-slate-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold">No updates</p>
                     </div>
                   ) : (
                     notifications.map(n => (
                       <div key={n._id} className="p-4 border-b border-white/10 hover:bg-white/40 flex gap-3 text-sm transition-colors group">
                          <div className="mt-1">{getNotifIcon(n.type)}</div>
                          <div className="flex-1">
                             <p className="font-bold text-slate-900 leading-tight">{n.title}</p>
                             <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          </div>
                          <button onClick={(e) => handleDeleteNotif(e, n._id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                       </div>
                     ))
                   )}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {user && (
            <div className="relative" ref={userRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)} 
                className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-xl transition-all"
              >
                 <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white shadow-md">
                    {user.profilePic ? <img src={resolveImageUrl(user.profilePic)} className="h-full w-full object-cover" /> : user.name.charAt(0)}
                 </div>
              </button>
              
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] top-full p-2"
                  >
                     <Link to="/app/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-colors">
                        <UserCircle className="h-4 w-4" /> Profile
                     </Link>
                     <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                     </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>


      {showMobileSearch && (
        <div className="md:hidden p-4 bg-white border-t border-slate-200">
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/app/market?search=${encodeURIComponent(searchQuery.trim())}`); setShowMobileSearch(false); setSearchQuery(''); } }}>
            <input 
              type="search" 
              autoFocus 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search..." 
              className="w-full p-3 rounded-xl border border-white/40 bg-white/40 outline-none backdrop-blur-md text-sm placeholder:text-slate-500" 
            />
          </form>
        </div>
      )}
    </nav>
  );
}
