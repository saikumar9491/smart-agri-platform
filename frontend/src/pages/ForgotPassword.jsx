import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Loader2,
  Mail,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

import { API_URL } from '../config';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password, 3 = success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

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
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setStep(2);
        setSuccess('Reset code sent! Enter it below along with your new password.');
        startCooldown();
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('Network error. Backend not reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();

      if (data.success) {
        setStep(3);
        setSuccess('');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('New code sent!');
        startCooldown();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-10 shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
            {step === 3 ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : (
              <Lock className="h-8 w-8 text-white" />
            )}
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {step === 3 ? 'Password Reset!' : 'Reset Password'}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {step === 1 && "Enter your email and we'll send you a reset code"}
            {step === 2 && "Enter the code and your new password"}
            {step === 3 && "Your password has been changed successfully"}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {success && step !== 3 && (
          <div className="rounded-xl bg-green-50 p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all sm:text-sm"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700 disabled:opacity-70 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reset Code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 text-slate-900 text-center text-lg font-mono tracking-[0.5em] focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Sent to <span className="font-semibold text-slate-600">{email}</span>
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-500 disabled:text-slate-400 transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 pr-11 text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all sm:text-sm"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pl-11 pr-11 text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all sm:text-sm"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-700 disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 border-2 border-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>

            <p className="text-slate-600">
              You can now sign in with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98]"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step !== 3 && (
          <p className="text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}