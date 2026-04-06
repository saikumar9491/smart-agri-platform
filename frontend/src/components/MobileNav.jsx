import { NavLink } from 'react-router-dom';
import { Home, Sprout, Bug, TrendingUp, Users, CloudRain, User } from 'lucide-react';
import { cn } from '../utils/utils';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/80 backdrop-blur-md md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 sm:h-20 px-2">
        <NavLink to="/app" end className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
          isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"
        )}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">Home</span>
        </NavLink>
        
        <NavLink to="/app/market" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
          isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"
        )}>
          <TrendingUp className="h-5 w-5" />
          <span className="text-[10px] font-bold">Market</span>
        </NavLink>

        <NavLink to="/app/community" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
          isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"
        )}>
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-bold">Community</span>
        </NavLink>

        

        <NavLink to="/app/profile" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
          isActive ? "text-green-600" : "text-slate-400 hover:text-slate-600"
        )}>
          <User className="h-5 w-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
