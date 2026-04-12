import { NavLink, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Users, User, LayoutGrid, ScanText } from 'lucide-react';
import { cn } from '../utils/utils';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const location = useLocation();
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1002] w-[92%] max-w-md md:hidden">
      <nav className={cn(
        "rounded-[2.5rem] px-2 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500",
        isDashboard ? "glassmorphic border-white/20" : "bg-slate-900/95 backdrop-blur-xl border border-slate-700/50"
      )}>
        <NavItem to="/app" icon={<Home className="h-5 w-5" />} label="Home" />
        <NavItem to="/app/market" icon={<TrendingUp className="h-5 w-5" />} label="Market" />
        
        {/* CENTERPIECE ACTION BUTTON */}
        <div className="relative -top-8 px-1">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = '/app/disease'}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(34,197,94,0.4)] border-4 border-slate-900/10"
          >
            <ScanText className="h-7 w-7" />
          </motion.button>
        </div>

        <NavItem to="/app/community" icon={<Users className="h-5 w-5" />} label="Forum" />
        <NavItem to="/app/profile" icon={<User className="h-5 w-5" />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} end={to === '/app'} className={({ isActive }) => cn(
      "flex flex-col items-center justify-center flex-1 gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300",
      isActive ? "text-green-400 bg-white/5" : "text-white/60 hover:text-white"
    )}>
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {icon}
      </motion.div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </NavLink>
  );
}
