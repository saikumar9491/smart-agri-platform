import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  Leaf,
  Loader2,
  Mail,
  Lock,
  User,
  MapPin,
  Ruler,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { API_URL } from '../config';

export default function Signup() {
  const [step, setStep] = useState(1);
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

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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
        setSuccess('OTP sent to your email.');
        startCooldown();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'signup' })
      });

      const data = await res.json();

      if (data.success) {
        setStep(3);
        setSuccess('Email verified successfully.');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoogleSignup = async (credentialResponse) => {
    setLoading(true);
    setError('');

    const result = await googleLogin(credentialResponse.credential);

    if (result.success) {
      navigate('/app');
    } else {
      setError(result.message || 'Google signup failed');
      setLoading(false);
    }
  };


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
        setSuccess('OTP resent successfully.');
        startCooldown();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Join AgriSmart</h2>
          <p className="mt-2 text-sm text-slate-500">Create your account in 3 steps</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-8 rounded-full ${
                    step > s ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="text-center text-sm text-slate-400">OR</div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => setError('Google signup failed')}
              />
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border border-slate-300 p-3 pl-10 text-center tracking-[0.3em] outline-none focus:border-green-500"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Sent to {email}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError('');
                  setSuccess('');
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify OTP <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm font-medium text-green-600 disabled:text-slate-400"
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
                required
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input
                name="location"
                placeholder="Farm Location"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <Ruler className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  name="farmSize"
                  type="number"
                  placeholder="Farm Size"
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
                />
              </div>

              <div className="relative">
                <FlaskConical className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-green-500"
                >
                  <option value="Loamy">Loamy</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Silty">Silty</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}