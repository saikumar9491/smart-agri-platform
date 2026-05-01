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
    <div className="min-h-screen bg-[#020202] text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* ── UNIFIED BACKGROUND: DIGITAL GRID & AMBIENT GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Digital Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }} 
        />
        {/* Dynamic Glows */}
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] bg-green-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── STICKY NAV (Ultra-Glass) ── */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-2xl border-b border-white/5">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center overflow-hidden group-hover:border-emerald-500/50 transition-all">
              <img src={logo} alt="F" className="h-7 w-7 object-contain" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">FARM.ai</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Technology</a>
            <a href="#market" className="hover:text-emerald-400 transition-colors">Market</a>
            <a href="#community" className="hover:text-emerald-400 transition-colors">Network</a>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Link to="/app" className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all">
                Console
              </Link>
            ) : (
              <Link to="/login" className="px-6 py-2 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white/5 transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO: ASYMMETRIC COMMAND CENTER ── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-8">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Bold Typo & CTA */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-3 text-emerald-500">
               <div className="h-px w-8 bg-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-[1em]">The Future of Soil</span>
            </div>
            <h1 className="text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              Digitizing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">The Earth.</span>
            </h1>
            <p className="max-w-md text-white/40 text-lg leading-relaxed font-medium">
              A hyper-precision agricultural platform leveraging satellite AI to maximize yields and minimize waste.
            </p>
            <div className="flex items-center gap-6 mt-4">
               <button onClick={() => handleFeatureClick('/app')} className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all active:scale-95">
                 Get Started
                 <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
               </button>
               <div className="flex flex-col">
                  <span className="text-2xl font-black">50K+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Active Users</span>
               </div>
            </div>
          </motion.div>

          {/* Right Side: The Interactive Core */}
          <div className="relative flex items-center justify-center">
            {/* Background Parallax Icons */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-20 -left-10 h-16 w-16 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl flex items-center justify-center"
            >
              <Sprout className="text-emerald-500 h-8 w-8" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 -right-5 h-20 w-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl flex items-center justify-center"
            >
              <CloudRain className="text-blue-400 h-10 w-10" />
            </motion.div>

            {/* Central Animated Core */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="relative h-[500px] w-[500px] flex items-center justify-center"
            >
              {/* Spinning Rings */}
              <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow" />
              <div className="absolute inset-10 border border-emerald-500/10 rounded-full animate-reverse-spin" />
              
              {/* Glass Core */}
              <div className="relative h-[360px] w-[360px] rounded-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center shadow-2xl">
                 <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                 <div className="h-44 w-44 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <img src={logo} alt="FARM" className="h-full w-full object-cover scale-110" />
                 </div>
                 <div className="mt-8 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[1em] text-emerald-500/50 mb-2">Core Status</span>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                       <span className="text-xs font-black uppercase tracking-widest text-white/80">OPTIMIZED</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURE GRID ── */}
      <section id="features" className="py-32 px-8 relative bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 mb-20">
               <span className="text-emerald-500 font-black uppercase tracking-[1em] text-[10px]">Capabilities</span>
               <h2 className="text-5xl font-black uppercase tracking-tighter">Everything to <span className="text-white/20 italic">scale.</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Large Card */}
               <div onClick={() => handleFeatureClick('/app/crops')} className="md:col-span-2 group relative h-96 rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className="absolute top-12 left-12 z-10">
                     <h3 className="text-3xl font-black uppercase mb-4 group-hover:text-emerald-400 transition-colors">Satellite Crop Analysis</h3>
                     <p className="max-w-sm text-white/40 leading-relaxed">Leveraging Sentinel-2 imagery to provide NPK soil health data and precise harvest windows.</p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3/4 h-3/4 opacity-20 group-hover:opacity-40 transition-opacity">
                     <TrendingUp className="w-full h-full text-emerald-500 p-12" />
                  </div>
               </div>
               {/* Small Card */}
               <div onClick={() => handleFeatureClick('/app/market')} className="group relative rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer p-12 flex flex-col justify-between">
                  <TrendingUp className="h-12 w-12 text-blue-400" />
                  <div>
                     <h3 className="text-2xl font-black uppercase mb-2">Real-time APMC</h3>
                     <p className="text-white/40 text-sm">Direct link to national market price APIs.</p>
                  </div>
               </div>
               {/* Secondary Bento Items */}
               {features.slice(1, 4).map((f, i) => (
                  <div key={i} onClick={() => handleFeatureClick(f.path)} className="group relative rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-10 flex flex-col gap-6 cursor-pointer transition-all">
                     <f.icon className="h-8 w-8 text-white/40 group-hover:text-emerald-500 transition-colors" />
                     <h3 className="text-xl font-black uppercase">{f.title}</h3>
                     <p className="text-sm text-white/30">{f.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── FOOTER: DIGITAL SIGNATURE ── */}
      <footer className="py-20 border-t border-white/5 bg-black/60 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="flex flex-col gap-8">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 border border-white/10 rounded-lg flex items-center justify-center">
                    <img src={logo} alt="F" className="h-6 w-6 opacity-50" />
                  </div>
                  <span className="text-xl font-black uppercase italic tracking-tighter">FARM.ai</span>
               </div>
               <p className="max-w-xs text-white/20 text-sm leading-relaxed">
                 Architecting the future of sustainable agriculture through data-driven precision.
               </p>
            </div>
            <div className="flex flex-col items-end gap-6 text-right">
               <span className="text-[10px] font-black uppercase tracking-[1em] text-white/10">Protocol Version 4.0.1</span>
               <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <a href="#" className="hover:text-emerald-500">Security</a>
                  <a href="#" className="hover:text-emerald-500">API</a>
                  <a href="#" className="hover:text-emerald-500">Open Source</a>
               </div>
               <span className="text-[10px] font-medium text-white/10">© 2026 DIGITAL FARMING SYSTEMS</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

