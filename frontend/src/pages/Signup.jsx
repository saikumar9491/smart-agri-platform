import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import {
  Leaf, Loader2, Mail, Lock, User,
  MapPin, Ruler, FlaskConical,
  ShieldCheck, ArrowRight, ArrowLeft
} from 'lucide-react';

const API_URL = "https://smart-agri-platform.onrender.com";

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

  const { register } = useAuth();
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

  // ================= SEND OTP =================
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
        setSuccess('OTP sent to your email 📩');
        startCooldown();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error. Backend issue.');
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
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
        setSuccess('Email verified ✅');
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({ ...formData, email });

    if (result.success) {
      navigate('/app');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  // ================= GOOGLE SIGNUP =================
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('agri_token', data.token);
        navigate('/app');
      } else {
        throw new Error(data.message);
      }

    } catch (err) {
      setError('Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'signup' })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('OTP resent 📩');
        startCooldown();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl space-y-6">

        <div className="text-center">
          <Leaf className="mx-auto h-10 w-10 text-green-600" />
          <h2 className="text-2xl font-bold mt-3">Join AgriSmart</h2>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="w-full bg-green-600 text-white py-3 rounded-xl">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Send OTP"}
            </button>

            {/* GOOGLE BUTTON */}
            <div className="text-center text-sm text-gray-400">OR</div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => setError("Google signup failed")}
              />
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded-xl text-center"
              required
            />

            <button className="w-full bg-green-600 text-white py-3 rounded-xl">
              Verify OTP
            </button>

            <button type="button" onClick={handleResend} className="text-sm text-blue-500">
              Resend OTP
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-3 rounded-xl" required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-3 rounded-xl" required />

            <button className="w-full bg-green-600 text-white py-3 rounded-xl">
              Create Account
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          Already have account? <Link to="/login" className="text-green-600">Login</Link>
        </p>

      </div>
    </div>
  );
}