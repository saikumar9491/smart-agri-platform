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

      {/* ── HERO SECTION (Centered with Circle Logo) ── */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-white border-b border-slate-900">
        <div className="relative mx-auto max-w-7xl w-full flex flex-col items-center justify-center">
          
          {/* Centered Circular Logo with Animation */}
          <div className="relative flex items-center justify-center">
            {/* The outer rotating border/animation */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute h-[450px] w-[450px] rounded-full border-[3px] border-dashed border-slate-200"
            />
            
            {/* The main logo circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative h-[400px] w-[400px] rounded-full border-[8px] border-slate-900 flex flex-col items-center justify-center bg-white shadow-2xl z-10 overflow-hidden"
            >
              <img src={logo} alt="LOGO" className="h-40 w-40 object-contain mb-4" />
              <span className="text-4xl font-black uppercase tracking-[0.2em] text-slate-900">LOGO</span>
              
              {/* Internal animation label */}
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400"
              >
                animation
              </motion.div>
            </motion.div>

            {/* External Animation Label (Floating) */}
            <motion.div 
              animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-24 top-1/2 -translate-y-1/2 text-sm font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-4"
            >
              <div className="h-px w-12 bg-slate-900" />
              animation
            </motion.div>
          </div>

          {/* Bottom Wish Bar */}
          <div className="mt-20 w-full border-t border-slate-900 pt-8 flex justify-center items-center">
             <p className="text-xl font-black uppercase tracking-[0.3em] text-slate-900">
               your wish what you want add
             </p>
          </div>

        </div>
      </section>

    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

