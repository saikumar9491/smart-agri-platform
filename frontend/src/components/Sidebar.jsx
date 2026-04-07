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
          className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-[1001] h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out underline-none",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6 pb-32">
          {/* Mobile close button */}
          <div className="flex justify-end mb-2 md:hidden">
            <button 
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all transition-colors",
                  isActive 
                    ? "bg-green-50 text-green-700 font-bold" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <NavLink
                to="/app/admin"
                onClick={onClose}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all mt-4 border border-dashed border-red-100",
                  isActive ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-red-50"
                )}
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Dashboard
              </NavLink>
            )}
          </div>

          <div className="mt-auto pt-8">
             <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                     {user?.name?.charAt(0) || 'F'}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{user?.name || 'Farmer Guest'}</p>
                     <p className="text-[10px] font-semibold text-slate-500 uppercase">{user?.location?.split(',')[0] || 'Member'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
}
