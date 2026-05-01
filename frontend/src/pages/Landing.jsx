import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, Sprout, Bug, Droplets, TrendingUp, CloudRain, 
  ArrowRight, ShieldCheck, Zap, Globe2, Star, 
  MapPin, ChevronRight, PlayCircle
} from 'lucide-react';
import { cn } from '../utils/utils';
import logo from '../assets/logo.jpg';

const features = [
  {
    icon: Sprout,
    title: 'Crop Recommendation',
    desc: 'AI-powered suggestions based on your soil type and season.',
    color: 'from-green-500 to-emerald-600',
    path: '/app/crops',
  },
  {
    icon: Bug,
    title: 'Disease Detection',
    desc: 'Upload a photo and identify crop diseases instantly.',
    color: 'from-rose-500 to-pink-600',
    path: '/app/disease',
  },
  {
    icon: Droplets,
    title: 'Smart Irrigation',
    desc: 'Zone-by-zone schedules based on real-time moisture.',
    color: 'from-blue-500 to-cyan-600',
    path: '/app/irrigation',
  },
  {
    icon: TrendingUp,
    title: 'Market Prices',
    desc: 'Live APMC market prices — updated daily.',
    color: 'from-amber-500 to-orange-500',
    path: '/app/market',
  },
  {
    icon: CloudRain,
    title: 'Weather Forecast',
    desc: '5-day forecasts with rainfall and harvest alerts.',
    color: 'from-indigo-500 to-violet-600',
    path: '/app/weather',
  },
  {
    icon: Globe2,
    title: 'Farmer Community',
    desc: 'Connect with 50,000+ farmers nationwide.',
    color: 'from-teal-500 to-green-600',
    path: '/app/community',
  },
];

const tickerData = [
  "🌾 Wheat: ₹2,840 (+1.2%)",
  "🌽 Corn: ₹1,950 (-0.4%)",
  "🧅 Onion: ₹2,400 (+2.1%)",
  "🟢 Cotton: ₹6,750 (+0.8%)",
  "🍚 Rice: ₹3,120 (+0.5%)",
  "🥔 Potato: ₹1,680 (-1.1%)",
];

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const handleFeatureClick = (path) => {
    // If we're already loading auth, wait for it
    if (loading) return; 
    
    // Explicit check: If there's no token in storage AND no user, we are definitely NOT logged in
    const hasToken = !!localStorage.getItem('agri_token');
    
    if (user && hasToken) {
      navigate(path);
    } else {
      // Direct redirect to login for any unauthenticated attempt
      navigate('/login', { state: { from: path } });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-green-500 selection:text-black">
      
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-green-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] bg-lime-500/5 blur-[200px] rounded-full" />
      </div>

      {/* ── NAVIGATION (Premium Header) ── */}
      <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-5 group">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-green-500/30 rounded-xl" 
              />
              <img src={logo} alt="F" className="h-9 w-9 object-contain brightness-125 filter drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <span className="font-black text-3xl uppercase tracking-[-0.05em] text-white group-hover:text-green-400 transition-colors">FARM</span>
          </Link>
          
          {/* Auth Links */}
          <div className="flex items-center gap-10 text-[11px] font-black tracking-[0.3em] uppercase">
            {user ? (
              <Link to="/app" className="hover:text-green-400 transition-colors flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                DASHBOARD
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-400 transition-colors">LOGIN</Link>
                <div className="h-4 w-[1px] bg-white/10" />
                <Link to="/signup" className="text-white/40 hover:text-white transition-colors">SIGNUP</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── TICKER STRIP (Glassmorphism) ── */}
      <div className="relative h-14 bg-white/[0.02] border-b border-white/5 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 whitespace-nowrap flex animate-marquee items-center">
              {[...tickerData, ...tickerData].map((ticker, i) => (
                  <span key={i} className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mx-16 flex items-center gap-4">
                     <span className="h-1 w-1 rounded-full bg-green-500/50" />
                     {ticker}
                  </span>
              ))}
          </div>
          <div className="relative z-10 px-6 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center gap-3">
             <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/80">LIVE MARKET DATA</span>
          </div>
      </div>

      {/* ── MAIN HERO SECTION (Wow Factor) ── */}
      <main className="flex-grow flex flex-col items-center justify-center py-24 relative px-6">
        <div className="relative flex items-center justify-center">
            
            {/* Outer Orbital Rings */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute h-[600px] w-[600px] rounded-full border border-white/5 border-dashed"
            />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute h-[520px] w-[520px] rounded-full border border-green-500/10"
            />
            
            {/* Main Central Circle (Premium Glassmorphism) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[420px] w-[420px] rounded-full flex flex-col items-center justify-center z-10 group"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-green-500/10 blur-[80px] group-hover:bg-green-500/20 transition-all duration-1000" />
              
              {/* Glass Circle Body */}
              <div className="absolute inset-0 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              
              {/* Double Glowing Rim */}
              <div className="absolute inset-[15px] rounded-full border border-white/5 pointer-events-none" />
              
              {/* Content */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-20 flex flex-col items-center"
              >
                <div className="relative h-56 w-56 flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-400/20 blur-3xl rounded-full scale-110" />
                  {/* Circular mask for the square logo */}
                  <div className="relative h-48 w-48 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                    <img src={logo} alt="FARM" className="h-full w-full object-cover brightness-110 contrast-110" />
                  </div>
                </div>
                
                <h2 className="mt-6 text-6xl font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">FARM</h2>
                
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="mt-6 flex items-center gap-4"
                >
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-green-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[1.2em] text-green-400/80">PRECISION AGRI</span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-green-500/50" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Side Status Indicators */}
            <div className="absolute -right-64 top-1/2 -translate-y-1/2 flex items-center gap-10">
              <motion.div 
                animate={{ scaleX: [0.5, 1.2, 0.5], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-[1px] w-32 bg-gradient-to-r from-green-500 to-transparent origin-left" 
              />
              <div className="flex flex-col">
                 <span className="text-xs font-black uppercase tracking-[0.5em] text-green-500">SYSTEM ACTIVE</span>
                 <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">Satellite Link v4.2</span>
              </div>
            </div>
        </div>
      </main>

      {/* ── FOOTER SECTION (Refined) ── */}
      <footer className="w-full border-t border-white/5 py-16 bg-black/40 backdrop-blur-md relative z-10">
         <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center gap-8">
            <div className="flex flex-col items-center">
               <p className="text-3xl font-black uppercase tracking-[0.3em] text-white group cursor-pointer hover:text-green-400 transition-colors">
                 Your Wish <span className="text-green-500">What You Want</span> Add
               </p>
               <motion.div 
                 animate={{ width: [0, 120, 0] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 className="h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent mt-6" 
               />
            </div>
            <div className="flex gap-12 text-[9px] font-bold uppercase tracking-[0.5em] text-white/20">
               <span>Smart Agri Platform © 2026</span>
               <span>Built for Sustainability</span>
               <span>v4.0.1</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

