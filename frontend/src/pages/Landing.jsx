import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, Sprout, Bug, Droplets, TrendingUp, CloudRain,
  Users, ArrowRight, ShieldCheck, Zap, Globe2, Star
} from 'lucide-react';

const features = [
  {
    icon: Sprout,
    title: 'Crop Recommendation',
    desc: 'AI-powered crop suggestions based on your soil type, location, and season.',
    color: 'from-green-400 to-emerald-600',
    path: '/app/crops',
  },
  {
    icon: Bug,
    title: 'Disease Detection',
    desc: 'Upload a photo and our ML model identifies crop diseases instantly.',
    color: 'from-rose-400 to-pink-600',
    path: '/app/disease',
  },
  {
    icon: Droplets,
    title: 'Smart Irrigation',
    desc: 'Get zone-by-zone irrigation schedules based on real-time soil moisture.',
    color: 'from-blue-400 to-cyan-600',
    path: '/app/irrigation',
  },
  {
    icon: TrendingUp,
    title: 'Market Prices',
    desc: 'Live APMC market prices from all Indian states — updated daily.',
    color: 'from-amber-400 to-orange-500',
    path: '/app/market',
  },
  {
    icon: CloudRain,
    title: 'Weather Forecast',
    desc: '5-day agricultural weather with rainfall and harvest alerts.',
    color: 'from-indigo-400 to-violet-600',
    path: '/app/weather',
  },
  {
    icon: Users,
    title: 'Farmer Community',
    desc: 'Connect with 50,000+ farmers. Share tips, ask questions, and grow together.',
    color: 'from-teal-400 to-green-500',
    path: '/app/community',
  },
];

const stats = [
  { value: '50K+', label: 'Active Farmers' },
  { value: '28', label: 'Indian States' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '24/7', label: 'Live Support' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-green-700">
            <span className="text-2xl">🌾</span>
            <span>AgriSmart</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/20 hover:bg-green-700 transition-all"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/20 hover:bg-green-700 transition-all"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-white py-24 px-4">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700 shadow-sm mb-6">
            <Leaf className="h-3.5 w-3.5" /> Smart Farming Platform
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-tight">
            Farm Smarter,
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Grow Better
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            AgriSmart gives Indian farmers AI-powered crop guidance, real-time market prices, 
            weather forecasts, and a thriving community — all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.97]"
            >
              Start for Free <ArrowRight className="h-5 w-5" />
            </Link>
            <button
              onClick={() => handleFeatureClick('/app')}
              className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]"
            >
              Explore Dashboard
            </button>
          </div>

          {/* Floating trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> Secure & Private</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> Real-Time Data</span>
            <span className="flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-blue-500" /> Pan-India Coverage</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500" /> 4.9/5 Rating</span>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-green-700">{s.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-slate-900">Everything you need to farm effectively</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">Six powerful tools — built specifically for Indian farmers, available on any device.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <button
                key={f.title}
                onClick={() => handleFeatureClick(f.path)}
                className="group text-left rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} shadow-lg`}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 group-hover:text-green-700 transition-colors">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-green-600 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 to-emerald-800 p-12 text-center relative shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">Ready to transform your farm?</h2>
          <p className="relative mt-4 text-green-100 max-w-lg mx-auto">Join 50,000+ farmers already using AgriSmart to increase their yields and income.</p>
          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-green-700 shadow-xl hover:bg-green-50 transition-all active:scale-[0.97]"
            >
              Create Free Account <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all active:scale-[0.97]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8 px-4 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-2 font-bold text-green-700 mb-2">
          <span className="text-lg">🌾</span> AgriSmart
        </div>
        <p>© {new Date().getFullYear()} AgriSmart. Empowering Indian farmers with technology.</p>
      </footer>
    </div>
  );
}
