import { NavLink } from 'react-router-dom';
import { Home, Sprout, Bug, TrendingUp, Users, CloudRain, User, Package } from 'lucide-react';
import { cn } from '../utils/utils';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-200 bg-white/80 backdrop-blur-md md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 sm:h-20 px-2">
        <NavLink to="/app" end className={({ isActive }) => cn(
          "flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all active:scale-90",
          isActive ? "text-green-600" : "text-slate-400"
        )}>
          <div className={cn("p-1 rounded-lg", isActive && "bg-green-50")}>
            <Home className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </NavLink>
        
        <NavLink to="/app/market" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all active:scale-90",
          isActive ? "text-green-600" : "text-slate-400"
        )}>
          <div className={cn("p-1 rounded-lg", isActive && "bg-green-50")}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Market</span>
        </NavLink>

        <NavLink to="/app/community" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all active:scale-90",
          isActive ? "text-green-600" : "text-slate-400"
        )}>
          <div className={cn("p-1 rounded-lg", isActive && "bg-green-50")}>
            <Users className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Forum</span>
        </NavLink>

        <NavLink to="/app/sales" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all active:scale-90",
          isActive ? "text-green-600" : "text-slate-400"
        )}>
          <div className={cn("p-1 rounded-lg", isActive && "bg-green-50")}>
            <Package className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Sales</span>
        </NavLink>

        <NavLink to="/app/profile" className={({ isActive }) => cn(
          "flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all active:scale-90",
          isActive ? "text-green-600" : "text-slate-400"
        )}>
          <div className={cn("p-1 rounded-lg", isActive && "bg-green-50")}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
