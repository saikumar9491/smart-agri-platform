import { NavLink } from 'react-router-dom';
import { Home, Sprout, Bug, Droplets, TrendingUp, Users, CloudRain } from 'lucide-react';
import { cn } from '../utils/utils';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'Crop Guide', icon: Sprout, path: '/crops' },
  { name: 'Disease ML', icon: Bug, path: '/disease' },
  { name: 'Irrigation', icon: Droplets, path: '/irrigation' },
  { name: 'Market', icon: TrendingUp, path: '/market' },
  { name: 'Community', icon: Users, path: '/community' },
  { name: 'Weather', icon: CloudRain, path: '/weather' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-green-50 text-green-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5", 
              )} />
              {item.name}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto">
          <div className="rounded-xl bg-gradient-to-br from-green-400 to-green-600 p-4 text-white shadow-md">
            <h4 className="font-semibold text-sm">AgriSmart Premium</h4>
            <p className="mt-1 text-xs text-green-50 opacity-90">Unlock advanced ML features and real-time API integrations.</p>
            <button className="mt-3 w-full rounded-lg bg-white/20 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
