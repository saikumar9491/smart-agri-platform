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
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Left: Logo Box and Name */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 border border-slate-900 flex items-center justify-center rounded-sm overflow-hidden">
              <img src={logo} alt="L" className="h-full w-full object-cover" />
            </div>
            <span className="font-black text-2xl uppercase tracking-tighter text-slate-900">FARM</span>
          </div>
          
          {/* Right: Login/Signup */}
          <div className="flex items-center gap-8 text-sm font-black tracking-widest uppercase text-slate-900">
            {user ? (
              <Link to="/app" className="hover:underline text-slate-600">Go to App</Link>
            ) : (
              <>
                <Link to="/login" className="hover:underline text-slate-600">LOGIN</Link>
                <span className="text-slate-300">|</span>
                <Link to="/signup" className="hover:underline text-slate-600">SIGNUP</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── SECOND STRIP (Ticker) ── */}
      <div className="relative h-12 bg-white border-b border-slate-100 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 whitespace-nowrap flex animate-marquee py-2 opacity-50">
              {[...tickerData, ...tickerData].map((ticker, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mx-12 flex items-center gap-3">
                     <span className="h-1 w-1 rounded-full bg-slate-200" />
                     {ticker}
                  </span>
              ))}
          </div>
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 bg-white px-6">
             Market Data
          </span>
      </div>

      {/* ── MAIN HERO SECTION ── */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 bg-white relative">
        <div className="relative flex items-center justify-center">
            {/* The outer rotating border (Thinner) */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute h-[420px] w-[420px] rounded-full border border-slate-100 border-dashed"
            />
            
            {/* The main logo circle (Thinner Borders) */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-[340px] w-[340px] rounded-full border border-slate-900 flex flex-col items-center justify-center bg-white z-10"
            >
              <div className="absolute inset-[8px] rounded-full border border-slate-100 pointer-events-none" />
              
              <img src={logo} alt="FARM" className="h-44 w-44 object-contain" />
              
              <motion.span 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mt-4 text-[8px] font-bold uppercase tracking-[0.8em] text-slate-300"
              >
                precision agri
              </motion.span>
            </motion.div>

            {/* Side animation line (Subtle) */}
            <div className="absolute -right-48 top-1/2 -translate-y-1/2 flex items-center gap-4 opacity-20">
              <div className="h-px w-12 bg-slate-900" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live</span>
            </div>
        </div>
      </main>

      {/* ── BOTTOM SECTION ── */}
      <footer className="w-full border-t border-slate-100 py-12 bg-white flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <p className="text-xl font-black uppercase tracking-[0.3em] text-center px-10 text-slate-900">
              your wish what you want add
            </p>
            <div className="h-1 w-20 bg-slate-900" />
         </div>
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

