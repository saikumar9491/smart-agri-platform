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

      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-green-700">
            <motion.span 
              initial={{ rotate: -15 }}
              animate={{ rotate: 0 }}
              className="text-3xl"
            >🌾</motion.span>
            <span>AGRISMART</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/app"
                className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
              >
                Go to App
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-black text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Sign In</Link>
                <Link
                  to="/signup"
                  className="rounded-2xl bg-green-600 px-6 py-2.5 text-sm font-black text-white shadow-xl shadow-green-500/20 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* MARKET TICKER BAR */}
        <div className="h-10 bg-slate-900 overflow-hidden flex items-center">
            <div className="whitespace-nowrap flex animate-marquee py-2">
                {[...tickerData, ...tickerData].map((ticker, i) => (
                    <span key={i} className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mx-10 flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500" />
                       {ticker}
                    </span>
                ))}
            </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-green-400/5 blur-[120px] rounded-full -mr-48 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-emerald-400/10 blur-[100px] rounded-full -ml-32 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-green-700 mb-8 border border-green-100 shadow-sm">
                <Leaf className="h-3.5 w-3.5 animate-pulse" /> Precision Agriculture 4.0
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95]">
              FUTURE OF<br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent italic">
                FARMING.
              </span>
            </h1>
            <p className="mt-8 text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
              AgriSmart provides Indian farmers with AI-driven guidance, real-time market insights, 
              and precision tools to maximize every acre.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-5">
              <Link
                to="/signup"
                className="group relative flex items-center gap-2 rounded-3xl bg-slate-900 px-10 py-5 text-base font-black text-white shadow-2xl shadow-slate-900/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">Start Your Harvest <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <button
                onClick={() => handleFeatureClick('/app')}
                className="flex items-center gap-2 rounded-3xl border-2 border-slate-200 px-10 py-5 text-base font-black text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
              >
                Live Demo <PlayCircle className="h-5 w-5 text-green-600" />
              </button>
            </div>

            <div className="mt-16 flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-green-500" /> Enterprise Secure</div>
               <div className="flex items-center gap-3"><Globe2 className="h-5 w-5 text-blue-500" /> Pan-India Data</div>
            </div>
          </motion.div>

          {/* 3D FLOATING COMPONENT */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
             <div className="absolute inset-0 bg-green-500/10 blur-[100px] h-[500px] w-[500px] rounded-full mx-auto" />
             <div className="relative z-10 p-12">
                <div className="relative h-[550px] w-full rounded-[60px] bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                   <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex gap-1.5">
                         <div className="h-2 w-2 rounded-full bg-slate-300" />
                         <div className="h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dashboard Preview</span>
                   </div>
                   <div className="flex-1 p-8 space-y-6">
                      <div className="h-24 w-full rounded-[30px] bg-green-50 p-6 flex justify-between items-center group cursor-pointer hover:bg-green-100 transition-colors">
                         <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Growth Status</p>
                            <p className="text-2xl font-black text-slate-900">Optimal (82%)</p>
                         </div>
                         <Sprout className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-32 rounded-[30px] bg-blue-50 p-6">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Moisture</p>
                            <p className="text-xl font-black text-slate-900">45%</p>
                            <Droplets className="h-6 w-6 text-blue-500 mt-4" />
                         </div>
                         <div className="h-32 rounded-[30px] bg-amber-50 p-6">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Market</p>
                            <p className="text-xl font-black text-slate-900">₹2,8k/q</p>
                            <TrendingUp className="h-6 w-6 text-amber-500 mt-4" />
                         </div>
                      </div>
                      <div className="h-40 w-full rounded-[30px] bg-slate-900 p-8 flex flex-col justify-end">
                         <p className="text-white text-lg font-black leading-tight">AI Diagnostic:<br /><span className="text-green-400">No Pests Detected</span></p>
                      </div>
                   </div>
                </div>
                {/* Floating Elements */}
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-12 -left-8 h-20 w-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center border border-slate-50"><Star className="h-8 w-8 text-amber-400 fill-amber-400" /></motion.div>
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.5 }} className="absolute -bottom-8 -right-8 h-16 w-16 rounded-2xl bg-green-600 shadow-2xl flex items-center justify-center"><Zap className="h-6 w-6 text-white" /></motion.div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION (Animated) ── */}
      <StatSection />

      {/* ── FEATURE TILES (GLASSMORPHISM) ── */}
      <section className="py-32 px-6 bg-slate-50/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20 space-y-4">
             <span className="text-[11px] font-black text-green-600 uppercase tracking-[0.3em]">Full Toolkit</span>
             <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">Powered by <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Agri-Intelligence</span></h2>
             <p className="text-slate-500 font-medium max-w-2xl mx-auto">Six enterprise-grade tools designed for the modern Indian farm.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[360px] cursor-pointer overflow-hidden rounded-[48px] bg-white border border-slate-100 p-10 transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2"
                onClick={() => handleFeatureClick(f.path)}
              >
                <div className={`h-16 w-16 rounded-[22px] bg-gradient-to-br ${f.color} shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 mb-8`}>
                   <f.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-green-700 transition-colors uppercase tracking-tight">{f.title}</h3>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                
                <div className="absolute bottom-10 right-10 flex items-center gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                   <span className="text-xs font-black uppercase text-green-600 tracking-widest">Connect App</span>
                   <ChevronRight className="h-4 w-4 text-green-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA DIVIDER (SVG WAVE) ── */}
      <section className="relative px-6 py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-x-0 top-0 pointer-events-none -mt-px translate-y-[-99%]">
          <svg viewBox="0 0 1440 120" className="w-full fill-slate-900 transform scale-y-[-1]">
             <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative mx-auto max-w-4xl text-center space-y-8">
           <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">READY FOR THE<br /><span className="text-green-500 italic">NEXT HARVEST?</span></h2>
           <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">Join the digital revolution in farming. Scale your yields with AgriSmart today.</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
             <Link
                to="/signup"
                className="w-full sm:w-auto rounded-3xl bg-green-600 px-12 py-6 text-lg font-black text-white shadow-2xl shadow-green-500/20 hover:bg-green-700 active:scale-[0.97] transition-all uppercase tracking-widest"
             >
                Create Free Account
             </Link>
             <button className="w-full sm:w-auto text-white font-black uppercase tracking-[0.2em] hover:text-green-400 transition-colors">Compare Plans &rarr;</button>
           </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 border-t border-white/5 py-12 px-6 text-center">
         <div className="flex items-center justify-center gap-2 font-black text-xl text-green-500 tracking-tighter mb-4">
            🌾 AGRISMART
         </div>
         <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Precision Agriculture Platform. Built for Indian Farmers.</p>
      </footer>
    </div>
  );
}

function StatSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: 50, suffix: 'K+', label: 'Active Farmers' },
    { value: 28, suffix: '', label: 'Indian States' },
    { value: 95, suffix: '%', label: 'Detection Accuracy' },
    { value: 24, suffix: '/7', label: 'Support' },
  ];

  return (
    <section className="border-y border-slate-100 bg-white py-16 px-6" ref={ref}>
       <div className="mx-auto max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((s, i) => (
            <div key={i} className="text-center group">
               <div className="flex items-center justify-center text-5xl font-black text-slate-900 tracking-tighter transition-transform group-hover:scale-110">
                  {isInView ? <Counter value={s.value} /> : '0'}{s.suffix}
               </div>
               <p className="mt-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-green-600 transition-colors">{s.label}</p>
            </div>
          ))}
       </div>
    </section>
  );
}

function Counter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = Math.ceil(value / (duration / 16));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}
