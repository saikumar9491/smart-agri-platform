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
    <div className="min-h-screen bg-[#FDFDFD] text-[#0A1128] font-sans overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      
      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 md:gap-4 group">
            <div className="relative h-8 w-8 md:h-12 md:w-12 flex items-center justify-center">
              {/* Animated Logo Border */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-green-500/30 rounded-xl" 
              />
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative h-6 w-6 md:h-9 md:w-9 overflow-hidden rounded-lg shadow-sm bg-white"
              >
                <img src={logo} alt="F" className="h-full w-full object-cover" />
              </motion.div>
            </div>
            <span className="font-black text-lg md:text-2xl tracking-tighter text-[#0A1128]">FARM</span>
          </Link>
          
          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <Link to="/app" className="bg-[#0A1128] text-white px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase hover:bg-slate-800 transition-all">
                App
              </Link>
            ) : (
              <div className="flex items-center gap-2 md:gap-8">
                <Link to="/login" className="hidden md:block text-[10px] md:text-sm font-bold uppercase tracking-widest hover:text-green-600 transition-colors">Login</Link>
                <Link to="/signup" className="bg-[#0A1128] text-white px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MARKET TICKER BAR ── */}
      <div className="bg-[#0A1128] text-white/90 h-10 flex items-center overflow-hidden border-b border-white/5 relative z-40">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerData, ...tickerData].map((t, i) => (
            <span key={i} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mx-5 md:mx-10 flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-green-400" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <main className="relative py-10 md:py-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[80vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center w-full">
          {/* Left: Content */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 md:gap-8 text-center lg:text-left items-center lg:items-start"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full w-fit">
               <Leaf className="h-3 w-3" />
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Agri 4.0</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-[#0A1128]">
              FUTURE OF <br />
              <span className="text-[#22C55E]">FARMING.</span>
            </h1>
            
            <p className="max-w-md text-slate-500 text-sm md:text-lg font-medium leading-relaxed px-4 md:px-0">
              AI-driven guidance and real-time market insights for Indian farmers.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-2 w-full px-4 sm:px-0 sm:w-auto">
               <button onClick={() => handleFeatureClick('/app')} className="w-full sm:w-auto bg-[#0A1128] text-white px-8 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm tracking-widest flex items-center justify-center gap-3">
                 Get Started
                 <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
               </button>
               <button className="flex items-center gap-3 text-[#0A1128] font-black uppercase tracking-widest text-[10px] md:text-sm">
                 <div className="h-8 w-8 md:h-12 md:w-12 rounded-full border border-slate-200 flex items-center justify-center">
                    <PlayCircle className="h-4 w-4 md:h-5 md:w-5" />
                 </div>
                 Demo
               </button>
            </div>
          </motion.div>

          {/* Right: Interactive Dashboard Preview */}
          <div className="relative">
             {/* Background Floating Elements */}
             <motion.div 
                animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-20 right-0 opacity-10"
             >
                <Leaf className="h-40 w-40 text-green-600" />
             </motion.div>
             
             {/* Floating Star Icon */}
             <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 left-20 z-20 h-16 w-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-50"
             >
                <div className="h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center shadow-inner">
                   <Star className="text-white h-5 w-5 fill-current" />
                </div>
             </motion.div>

             {/* Main Dashboard Card */}
             <motion.div
               initial={{ scale: 0.9, opacity: 0, x: 20 }}
               animate={{ scale: 1, opacity: 1, x: 0 }}
               transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
               className="relative z-10 w-full max-w-[520px] ml-auto bg-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-slate-100/50 overflow-hidden"
             >
                <div className="p-10 flex flex-col gap-10">
                   <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                         <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                         <div className="h-2 w-8 rounded-full bg-slate-100" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Live Telemetry</span>
                   </div>

                   {/* Growth Status Widget */}
                   <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="bg-green-50/50 rounded-3xl p-8 border border-green-100 flex items-center justify-between group hover:bg-green-50 transition-all cursor-default"
                   >
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Growth Status</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[#0A1128]">Optimal</span>
                            <span className="text-xl font-bold text-green-500">(82%)</span>
                         </div>
                      </div>
                      <div className="relative h-16 w-16 flex items-center justify-center">
                         {/* Animated Orbital Ring inside the dashboard */}
                         <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border border-green-500/20 rounded-full border-dashed" 
                         />
                         <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-10 w-10 bg-white rounded-xl shadow-md border border-green-100 flex items-center justify-center overflow-hidden"
                         >
                            <img src={logo} alt="F" className="h-full w-full object-cover" />
                         </motion.div>
                      </div>
                   </motion.div>

                   {/* Stats Grid */}
                   <div className="grid grid-cols-2 gap-8">
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex flex-col gap-4 group"
                      >
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Moisture</span>
                         <span className="text-3xl font-black text-[#0A1128]">45%</span>
                         <Droplets className="h-6 w-6 text-blue-400 group-hover:animate-bounce" />
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100 flex flex-col gap-4 group"
                      >
                         <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Market</span>
                         <span className="text-3xl font-black text-[#0A1128]">₹2.8k</span>
                         <TrendingUp className="h-6 w-6 text-amber-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </motion.div>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </main>

      {/* ── FEATURES GRID ── */}
      <section className="py-32 px-8 bg-slate-50/30">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4 mb-20">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: 80 }}
                 className="h-1 bg-green-500" 
               />
               <h2 className="text-4xl font-black uppercase tracking-tighter text-[#0A1128]">Everything you need to <span className="text-green-500">grow.</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {features.slice(0, 3).map((f, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex flex-col gap-8 p-12 bg-white rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-3 transition-all group cursor-pointer"
                  >
                     <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-green-500 transition-all group-hover:rotate-6">
                        <f.icon className="h-10 w-10 text-slate-400 group-hover:text-white transition-colors" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-[#0A1128] mb-4">{f.title}</h3>
                        <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
                     </div>
                     <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="h-3 w-3" />
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-8 bg-white border-t border-slate-100 relative overflow-hidden">
         <div className="absolute bottom-0 right-0 opacity-[0.03] -rotate-12 translate-x-1/4 translate-y-1/4">
            <Leaf className="h-[600px] w-[600px] text-green-900" />
         </div>
         
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 relative z-10">
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-xl shadow-md border border-white">
                     <img src={logo} alt="F" className="h-full w-full object-cover" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter text-[#0A1128]">FARM.ai</span>
               </div>
               <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
                 Digitizing the future of soil through precision technology and real-time intelligence.
               </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-8">
               <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
                  <a href="#" className="hover:text-green-600 transition-colors">Contact</a>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold text-slate-300">
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                  © 2026 PRECISION FARMING SYSTEMS
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

// Stats and Counter components removed to match minimal wireframe

