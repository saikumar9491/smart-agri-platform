import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Loader2, Mail, Lock, User, MapPin, Ruler, FlaskConical, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
const API_URL = "https://smart-agri-platform.onrender.com";
export default function Signup() {
  const [step, setStep] = useState(1); // 1 = email+OTP, 2 = verify OTP, 3 = fill details
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    location: '',
    farmSize: '',
    soilType: 'Loamy'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(2);
        setSuccess('Verification code sent! Enter it below to continue.');
        startCooldown();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`,  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'signup' })
      });
      const data = await res.json();
      
      if (data.success) {
        setStep(3);
        setSuccess('Email verified! Complete your profile below.');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register({ ...formData, email });
    if (result.success) {
      navigate('/app');
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('New code sent!');
        startCooldown();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-10 shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Join AgriSmart
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your account in 3 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                step >= s 
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/25' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-green-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
          <span className={step >= 1 ? 'text-green-600' : ''}>Email</span>
          <span className={step >= 2 ? 'text-green-600' : ''}>Verify</span>
          <span className={step >= 3 ? 'text-green-600' : ''}>Details</span>
        </div>
        
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">We'll send a 6-digit verification code to this email</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-emerald-700 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Send Verification Code</span> <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 text-center text-lg font-mono tracking-[0.5em] focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">Sent to <span className="font-semibold text-slate-600">{email}</span></p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-xs font-semibold text-green-600 hover:text-green-500 disabled:text-slate-400 transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-emerald-700 disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Verify Code</span> <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Profile */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input type="text" name="name" required
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                    placeholder="Your full name"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input type="password" name="password" required
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                    placeholder="Create a strong password"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Farm Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input type="text" name="location"
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                    placeholder="State, City"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Farm Size (Acres)</label>
                <div className="relative">
                  <Ruler className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <input type="number" name="farmSize"
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                    placeholder="e.g. 5"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Soil Type</label>
                <div className="relative">
                  <FlaskConical className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                  <select name="soilType"
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm appearance-none"
                    onChange={handleChange}
                    value={formData.soilType}
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Silty">Silty</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-emerald-700 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🌱 Create My Farm Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
