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
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-green-600 z-[1      {/* ── NAVIGATION (Header) ── */}
      <nav className="sticky top-0 z-50 bg-white border-b-[4px] border-black">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo Box and Name */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 border-2 border-black flex items-center justify-center font-bold text-[10px] uppercase">
              logo
            </div>
            <span className="font-black text-2xl uppercase tracking-tighter">website name</span>
          </div>
          
          {/* Right: Login/Signup */}
          <div className="flex items-center gap-8 text-sm font-black tracking-widest uppercase text-slate-900">
            {user ? (
              <Link to="/app" className="hover:underline">Go to App</Link>
            ) : (
              <>
                <Link to="/login" className="hover:underline">LOGIN</Link>
                <span className="text-slate-300">|</span>
                <Link to="/signup" className="hover:underline">SIGNUP</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── SECOND STRIP (Animation) ── */}
      <div className="relative h-12 bg-gray-50 border-b-[4px] border-black overflow-hidden flex items-center justify-center">
          <span className="relative z-10 text-sm font-black uppercase tracking-[0.5em] text-slate-900 px-4">
             animation
          </span>
      </div>

      {/* ── MAIN HERO SECTION (Strict Wireframe Style) ── */}
      <main className="flex-grow flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-6xl aspect-video border-[8px] border-black flex flex-col items-center justify-center relative p-20">
          
          {/* Centered Circular Logo Area */}
          <div className="relative flex items-center justify-center">
            {/* The outer rotating border */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute h-[420px] w-[420px] rounded-full border-[2px] border-black border-dashed"
            />
            
            {/* The main logo circle - Double border */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[340px] w-[340px] rounded-full border-[6px] border-black flex flex-col items-center justify-center bg-white z-10"
            >
              <div className="absolute inset-[10px] rounded-full border-[2px] border-black pointer-events-none" />
              
              <span className="text-5xl font-black uppercase tracking-widest text-black">LOGO</span>
              
              <motion.span 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400"
              >
                animation
              </motion.span>
            </motion.div>

            {/* Side animation label */}
            <div className="absolute -right-48 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <div className="h-px w-12 bg-black" />
              <span className="text-xs font-black uppercase tracking-widest">animation</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── BOTTOM SECTION (Footer Strip) ── */}
      <footer className="w-full border-t-[4px] border-black py-12 bg-white flex items-center justify-center">
         <p className="text-2xl font-black uppercase tracking-[0.2em] text-center px-10">
           your wish what you want add
         </p>
      </footer>
    </div>
  );
}          </p>
          </div>

        </div>
      </section>

    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

