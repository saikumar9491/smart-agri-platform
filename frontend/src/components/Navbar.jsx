import { Bell, Search, UserCircle, LogOut, Menu, Info, AlertTriangle, CheckCircle, Trash2, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { resolveImageUrl } from '../utils/utils';

export default function Navbar({ onMenuToggle }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const dropdownRef = useRef(null);
  const userRef = useRef(null);
  const notificationRef = useRef(null);

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
    <nav className="fixed top-0 left-0 z-[1000] w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <button 
          onClick={onMenuToggle}
          className="flex md:hidden items-center justify-center rounded-xl p-2 mr-2 text-slate-700 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/app" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <span>🌾</span> 
          <span className="hidden sm:inline">AgriSmart</span>
        </Link>

        {/* Right-side Icons Group */}
        <div className="ml-auto flex items-center space-x-1 sm:space-x-3 relative" ref={dropdownRef}>
          {/* Desktop Search */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/app/market?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }} 
            className="relative hidden md:flex"
          >
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 w-48 lg:w-64 rounded-full border border-slate-300 bg-slate-50 pl-9 pr-4 text-sm focus:border-green-500 focus:outline-none"
            />
          </form>

          <Link to="/app/sales" className="hidden sm:flex p-1.5 text-slate-500 hover:bg-slate-100 rounded-full">
            <Package className="h-5 w-5" />
          </Link>

          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-full"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] top-full overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-sm">Notifications</div>
               <div className="max-h-64 overflow-y-auto">
                 {notifications.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 text-xs">No updates</div>
                 ) : (
                   notifications.map(n => (
                     <div key={n._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 flex gap-3 text-sm">
                        <div className="mt-1">{getNotifIcon(n.type)}</div>
                        <div className="flex-1">
                           <p className="font-bold text-slate-900">{n.title}</p>
                           <p className="text-xs text-slate-500">{n.message}</p>
                        </div>
                        <button onClick={(e) => handleDeleteNotif(e, n._id)} className="text-slate-300 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                     </div>
                   ))
                 )}
               </div>
               {notifications.length > 0 && (
                 <button onClick={handleClearAll} className="w-full p-2 text-xs font-bold text-rose-600 bg-slate-50 hover:bg-rose-50">Clear all</button>
               )}
            </div>
          )}

          {user && (
            <div className="relative" ref={userRef}>
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl">
                 <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold">{user.name}</span>
                 </div>
                 <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                    {user.profilePic ? <img src={resolveImageUrl(user.profilePic)} className="h-full w-full object-cover rounded-lg" /> : user.name.charAt(0)}
                 </div>
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] top-full p-1">
                   <Link to="/app/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm">
                      <UserCircle className="h-4 w-4" /> Profile
                   </Link>
                   <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-lg text-sm">
                      <LogOut className="h-4 w-4" /> Sign Out
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showMobileSearch && (
        <div className="md:hidden p-4 border-t border-slate-100 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/app/market?search=${encodeURIComponent(searchQuery.trim())}`); setShowMobileSearch(false); } }}>
            <input type="search" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full p-2 rounded-lg border border-slate-200 outline-none focus:border-green-500" />
          </form>
        </div>
      )}
    </nav>
  );
}
