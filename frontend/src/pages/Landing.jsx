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
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      
      {/* ── PROGRESS BAR ── */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-green-600 z-[100] origin-left" style={{ scaleX }} />

      {/* ── NAVIGATION (Header) ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo and Name */}
          <Link to="/" className="flex items-center gap-4 font-black text-3xl tracking-tighter text-slate-900">
            <div className="h-12 w-12 flex items-center justify-center rounded-lg border-2 border-slate-900 overflow-hidden p-1">
              <img src={logo} alt="logo" className="h-full w-full object-contain" />
            </div>
            <span className="uppercase">website name</span>
          </Link>
          
          {/* Right: Login/Signup */}
          <div className="flex items-center gap-8 text-sm font-black tracking-widest uppercase text-slate-900">
            {user ? (
              <Link to="/app" className="hover:text-green-600 transition-colors">Go to App</Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-600 transition-colors">LOGIN</Link>
                <span className="text-slate-300">|</span>
                <Link to="/signup" className="hover:text-green-600 transition-colors">SIGNUP</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── TICKER BAR (Animation) ── */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 overflow-hidden flex items-center">
          <div className="whitespace-nowrap flex animate-marquee py-2">
              {[...tickerData, ...tickerData].map((ticker, i) => (
                  <span key={i} className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mx-12 flex items-center gap-3">
                     <span className="h-2 w-2 rounded-full bg-slate-900" />
                     {ticker}
                  </span>
              ))}
          </div>
      </div>

      {/* ── HERO SECTION (Premium Dark Theme) ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-[#050505] text-white">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl w-full flex flex-col items-center justify-center py-10">
          
          {/* Centered Circular Logo with Premium Effects */}
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsing Glow */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-[550px] w-[550px] rounded-full bg-green-500/20 blur-3xl"
            />

            {/* Rotating Technical Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute h-[520px] w-[520px] rounded-full border border-white/5 border-dashed"
            />
            
            {/* Main Circle (Glassmorphism) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="relative h-[420px] w-[420px] rounded-full border border-white/10 flex flex-col items-center justify-center bg-white/5 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] z-10 overflow-hidden"
            >
              {/* Inner Glow Rim */}
              <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              
              {/* Central Illustration */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-20"
              >
                <img 
                  src={logo} 
                  alt="FARM" 
                  className="h-44 w-44 object-contain filter drop-shadow-[0_0_30px_rgba(34,197,94,0.3)] brightness-125" 
                />
              </motion.div>

              <h2 className="mt-6 text-6xl font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-2xl">
                LOGO
              </h2>
              
              {/* Subtle Animation Text */}
              <motion.div 
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mt-4 text-[10px] font-bold uppercase tracking-[1em] text-green-500/50"
              >
                processing data
              </motion.div>
            </motion.div>

            {/* Side Indicator (Animation Label) */}
            <div className="absolute -right-64 top-1/2 -translate-y-1/2 flex items-center gap-8 group">
              <motion.div 
                 animate={{ scaleX: [0.5, 1.2, 0.5], opacity: [0.2, 1, 0.2] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="h-[1px] w-24 bg-gradient-to-r from-green-500 to-transparent origin-left" 
              />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-[0.5em] text-green-500">Live AI</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Animation Active</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar (Sophisticated Footer) */}
          <div className="absolute bottom-0 left-0 w-full flex flex-col px-12 pb-12">
             <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
             <div className="flex justify-end items-center">
                <div className="text-right">
                   <p className="text-2xl font-black uppercase tracking-[0.2em] text-white group cursor-pointer">
                     <span className="text-green-500">Your Wish</span> What You Want Add
                   </p>
                   <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 mt-2 italic">Smart Agri Precision v4.0</p>
                </div>
             </div>
          </div>

        </div>
      </section>

    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

