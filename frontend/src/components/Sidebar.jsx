import { NavLink } from 'react-router-dom';
import { Home, Sprout, Bug, Droplets, TrendingUp, Users, CloudRain, X, ShieldCheck, User, Package } from 'lucide-react';
import { cn } from '../utils/utils';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/app' },
  { name: 'Crop Guide', icon: Sprout, path: '/app/crops' },
  { name: 'Disease ML', icon: Bug, path: '/app/disease' },
  { name: 'Irrigation', icon: Droplets, path: '/app/irrigation' },
  { name: 'Market', icon: TrendingUp, path: '/app/market' },
  { name: 'Farmer Sales', icon: Package, path: '/app/sales' },
  { name: 'Community', icon: Users, path: '/app/community' },
  { name: 'Weather', icon: CloudRain, path: '/app/weather' },
  { name: 'Profile', icon: User, path: '/app/profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-50 h-[calc(100dvh-4rem)] w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out",
        // Desktop: always visible
        "md:translate-x-0",
        // Mobile: slide in/out
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
          {/* Mobile close button */}
          <div className="flex justify-end mb-2 md:hidden">
            <button 
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-green-50 text-green-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}

            {/* Admin only link */}
            {user?.role === 'admin' && (
              <NavLink
                to="/app/admin"
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mt-4 border border-dashed border-red-200",
                  isActive 
                    ? "bg-red-50 text-red-700 border-red-300 shadow-sm" 
                    : "text-slate-600 hover:bg-red-50 hover:text-red-900 hover:border-red-300"
                )}
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Dashboard
              </NavLink>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <>
                        <img 
                          src={user.profilePic.startsWith('/uploads') 
                            ? `${API_URL}${user.profilePic}${user.profilePic.includes('?') ? '&' : '?' }t=${new Date().getTime()}` 
                            : user.profilePic
                          } 
                          alt=""
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden h-full w-full items-center justify-center">
                          {user?.name?.charAt(0) || 'F'}
                        </div>
                      </>
                    ) : (
                      user?.name?.charAt(0) || 'F'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{user?.name || 'Farmer Guest'}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{user?.location?.split(',')[0] || 'Unknown Location'}</p>
                  </div>
               </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-700 p-4 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-16 w-16" />
              </div>
              <h4 className="font-bold text-sm flex items-center gap-2">
                AgriSmart Pro
              </h4>
              <p className="mt-1 text-[11px] text-green-50 opacity-90 leading-relaxed">Unlock advanced ML detection and real-time regional insights.</p>
              <button className="mt-3 w-full rounded-lg bg-white/20 py-1.5 text-xs font-bold backdrop-blur-sm transition-all hover:bg-white/30 active:scale-[0.98]">
                Upgrade &rarr;
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
