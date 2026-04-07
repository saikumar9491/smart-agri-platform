import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Leaf, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { API_URL } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect to original page or default to dashboard
      const from = location.state?.from || '/app';
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError('');

    const result = await googleLogin(credentialResponse.credential);

    if (result.success) {
      // Redirect to original page or default to dashboard
      const from = location.state?.from || '/app';
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Google login failed');
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-6 sm:p-10 shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <Leaf className="h-8 w-8 text-white" />
          </div>

          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your smart farm
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>

              <Link to="/forgot-password" className="text-xs text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />

              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 pr-11 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3 text-white font-semibold hover:bg-green-700 transition disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          OR CONTINUE WITH
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError('Google Login Failed')}
          />
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-green-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}