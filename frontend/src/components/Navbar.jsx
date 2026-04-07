import { Bell, Search, UserCircle, LogOut, Menu, X, Info, AlertTriangle, CheckCircle, MessageSquare, Trash2, Trash, Package, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { cn } from '../utils/utils';

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
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  // Click away listener
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
    <nav className="sticky top-0 z-[1000] w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-2 sm:px-4 md:px-6">
        {/* Mobile Hamburger Menu - Forced visibility on small screens */}
        <button 
          onClick={onMenuToggle}
          className="flex md:hidden flex-shrink-0 items-center justify-center rounded-xl p-2 mr-1 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/app" className="flex items-center gap-1 sm:gap-2 font-bold text-lg sm:text-xl text-green-700 flex-shrink-0">
          <span className="text-xl sm:text-2xl">🌾</span> 
          <span className="hidden sm:inline">AgriSmart</span>
        </Link>

        {/* Right-side Icons Group */}
        <div className="ml-auto flex items-center space-x-0.5 sm:space-x-3 relative" ref={dropdownRef}>
          {/* Desktop Search - Hidden on mobile */}
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
              placeholder="Search markets or crops..."
              className="h-9 w-64 rounded-full border border-slate-300 bg-slate-50 pl-9 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </form>

          {/* Mobile Search Toggle - Removed redundant icon to save top-bar space */}
          
          <div className="hidden sm:flex items-center">
            <Link 
              to="/app/sales"
              className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
              title="Farmer Sales"
            >
              <Package className="h-5 w-5" />
            </Link>
          </div>
          {/* Notification Bell Area */}
          <div className="flex items-center">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                {notifications && notifications.length > 0 && (
                  <span className="absolute top-[-2px] right-[-2px] flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
            </button>
          </div>


          {/* Notification Dropdown - Aligned to right of parental relative container */}
          {showNotifications && (
            <div 
              ref={notificationRef}
              className="absolute right-[-2.5rem] sm:right-0 mt-3 w-[calc(100vw-1rem)] sm:w-96 origin-top-right rounded-[32px] border border-slate-200 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-4 duration-300 z-[100] top-full"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[32px]">
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notifications.length} updates pending</p>
                </div>
                {notifLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent"></div>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {!notifications || notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Bell className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div key={notif._id} className="p-5 hover:bg-slate-50 transition-all cursor-pointer group relative">
                        <div className="flex gap-4">
                          <div className="mt-1 flex-shrink-0">
                            {notif.type === 'follow' ? (
                              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center text-white font-black text-sm overflow-hidden shadow-sm">
                                {notif.senderId?.profilePic ? (
                                  <img 
                                    src={notif.senderId.profilePic} 
                                    className="h-full w-full object-cover" 
                                    alt=""
                                  />
                                ) : (
                                  notif.senderId?.name?.charAt(0) || 'U'
                                )}
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                {getNotifIcon(notif.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 group-hover:text-green-700 transition-colors truncate">
                              {notif.title || 'Notification'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 font-medium">
                              {notif.message || ''}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                               <Clock className="h-3 w-3 text-slate-300" />
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                 {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                               </span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteNotif(e, notif._id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all h-8 w-8 flex items-center justify-center shrink-0"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications && notifications.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-b-2xl border-t border-slate-100 text-center">
                  <button 
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                    onClick={handleClearAll}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4 relative" ref={userRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-green-700 transition-colors">{user.name}</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black shadow-md shadow-green-100 overflow-hidden">
                   {user.profilePic ? (
                     <>
                       <img 
                        src={user.profilePic.startsWith('/uploads') 
                          ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                          : user.profilePic
                        } 
                        alt={user.name}
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                       />
                       <div className="hidden h-full w-full items-center justify-center">
                         {user.name.charAt(0)}
                       </div>
                     </>
                   ) : (
                     user.name.charAt(0)
                   )}
                </div>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-[60] overflow-hidden">
                   <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                   </div>
                   <div className="p-2">
                      <Link 
                        to="/app/profile" 
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-green-700 transition-all"
                      >
                        <UserCircle className="h-4 w-4" />
                        View Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                   </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 animate-in slide-in-from-top duration-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/app/market?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
                setShowMobileSearch(false);
              }
            }} 
            className="relative"
          >
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets or crops..."
              className="h-10 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </form>
        </div>
      )}
    </nav>
  );
}
