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
      <section className="relative min-h-[75vh] flex flex-col items-center justify-center px-6 overflow-hidden bg-white border-b-[4px] border-slate-900">
        <div className="relative mx-auto max-w-7xl w-full flex flex-col items-center justify-center py-20">
          
          {/* Centered Circular Logo with Animation */}
          <div className="relative flex items-center justify-center">
            {/* The outer rotating border/animation */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute h-[480px] w-[480px] rounded-full border-[2px] border-slate-200 border-dashed"
            />
            
            {/* The main logo circle - Double border effect */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative h-[400px] w-[400px] rounded-full border-[10px] border-slate-900 flex flex-col items-center justify-center bg-white z-10"
            >
              <div className="absolute inset-[15px] rounded-full border-[2px] border-slate-900/10 pointer-events-none" />
              
              <img src={logo} alt="LOGO" className="h-32 w-32 object-contain mb-2 opacity-20 grayscale" />
              <span className="text-5xl font-black uppercase tracking-[0.2em] text-slate-900">LOGO</span>
              
              {/* Internal animation label */}
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-6 text-[12px] font-bold uppercase tracking-[0.6em] text-slate-400"
              >
                animation
              </motion.div>
            </motion.div>

            {/* External Animation Label (To the right) */}
            <div className="absolute -right-48 top-1/2 -translate-y-1/2 flex items-center gap-6">
              <motion.div 
                 animate={{ scaleX: [1, 1.5, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="h-[2px] w-16 bg-slate-900 origin-left" 
              />
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-900">animation</span>
            </div>
          </div>

          {/* Bottom Bar (Box with text on right) */}
          <div className="absolute bottom-0 left-0 w-full border-t-[4px] border-slate-900 h-24 flex items-center justify-end px-12">
             <p className="text-xl font-black uppercase tracking-[0.1em] text-slate-900">
               your wish what you want add
             </p>
          </div>

        </div>
      </section>

    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

