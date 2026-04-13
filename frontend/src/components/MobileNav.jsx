import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Users, User, LayoutGrid, ScanText } from 'lucide-react';
import { cn } from '../utils/utils';
import { motion } from 'framer-motion';
import { useRef } from 'react';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';

  const handleScan = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear the input so the same file could be selected again if needed
      e.target.value = '';
      navigate('/app/disease', { state: { autoScanImage: file } });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1002] w-[92%] max-w-md md:hidden">
      <nav className={cn(
        "rounded-[2.5rem] px-2 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 border border-white/10",
        isDashboard ? "glassmorphic" : "bg-slate-900/95 backdrop-blur-2xl border-slate-700/50"
      )}>
        <NavItem to="/app" icon={<Home className="h-5 w-5" />} label="Home" />
        <NavItem to="/app/market" icon={<TrendingUp className="h-5 w-5" />} label="Market" />
        
        {/* CENTERPIECE ACTION BUTTON - SCANNER */}
        <div className="relative -top-8 px-1">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              boxShadow: [
                "0 0 0 0px rgba(34, 197, 94, 0.4)",
                "0 0 0 15px rgba(34, 197, 94, 0)",
              ]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            className="rounded-full"
          >
            <motion.button 
              whileHover={{ 
                scale: 1.15,
                rotate: 5,
                boxShadow: "0 15px 30px rgba(34, 197, 94, 0.5)"
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white border-4 border-white/20 relative overflow-hidden group"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              <ScanText className="h-7 w-7 drop-shadow-lg" />
            </motion.button>
          </motion.div>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef}
            onChange={handleScan}
            className="hidden" 
          />
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
      "flex flex-col items-center justify-center flex-1 gap-1 px-1 py-2 rounded-[1.5rem] transition-all duration-500 relative group",
      isActive ? "text-green-400" : "text-white/50 hover:text-white"
    )}>
      {({ isActive }) => (
        <>
          {/* Glassy Pill Background for Active State */}
          {isActive && (
            <motion.div 
              layoutId="nav-pill"
              className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-[1.5rem] border border-white/20 shadow-inner"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          <motion.div
            className="relative z-10"
            animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            {icon}
          </motion.div>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-widest relative z-10 transition-transform duration-300",
            isActive ? "opacity-100" : "opacity-60 scale-90"
          )}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
