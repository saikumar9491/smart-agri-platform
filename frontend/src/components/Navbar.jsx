import { Bell, Search, UserCircle, LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Hamburger */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <span className="text-2xl">🌾</span> 
          <span>AgriSmart</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
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
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          {user ? (
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-bold text-slate-900">{user.name}</span>
                <span className="text-xs font-semibold text-green-600">{user.location || 'Farmer'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center rounded-xl bg-slate-100 p-2 text-rose-600 hover:bg-rose-50 transition-colors group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
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
    </nav>
  );
}
