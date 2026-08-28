import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShoppingBag, User, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import supabase from '../lib/supabase.js';

const TABS = { SIGN_IN: 'signin', SIGN_UP: 'signup', VERIFY: 'verify' };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, verifySignUpCode, resendSignUpCode, user, userRole, loading } = useAuth();

  const [tab, setTab] = useState(TABS.SIGN_IN);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign-in form
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');

  // Sign-up form
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suRole, setSuRole] = useState('student');
  const [suClubId, setSuClubId] = useState('');
  const [clubs, setClubs] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');

  const from = location.state?.from?.pathname || null;

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      if (userRole === 'admin') navigate('/admin', { replace: true });
      else if (userRole === 'club_exec') navigate('/club', { replace: true });
      else navigate(from ?? '/listings', { replace: true });
    }
  }, [user, userRole, loading, navigate, from]);

  // Fetch clubs for exec signup
  useEffect(() => {
    if (suRole === 'club_exec') {
      supabase.from('clubs').select('id, name').order('name').then(({ data }) => {
        setClubs(data ?? []);
      });
    }
  }, [suRole]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(siEmail, siPass);
    } catch (err) {
      setError(err.message ?? 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (suName.trim().length < 2) return setError('Please enter your name.');
    if (suPass !== suConfirm) return setError('Passwords do not match.');
    if (suPass.length < 6) return setError('Password must be at least 6 characters.');
    if (suRole === 'club_exec' && !suClubId) return setError('Please select your club.');
    setSubmitting(true);
    try {
      await signUp(suEmail, suPass, suName, suRole, suClubId || null);
      setVerifyEmail(suEmail);
      setVerificationCode('');
      setTab(TABS.VERIFY);
      setSuccess(
        suRole === 'club_exec'
          ? 'We sent a verification code to your email. An admin will also review your vendor access.'
          : 'We sent a verification code to your email.'
      );
    } catch (err) {
      setError(err.message ?? 'Could not create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!verifyEmail) return setError('Please return to create your account first.');
    if (verificationCode.trim().length < 6) return setError('Enter the 6-digit verification code from your email.');
    setSubmitting(true);
    try {
      await verifySignUpCode(verifyEmail, verificationCode.trim());
      setSuccess('Email verified. Signing you in…');
    } catch (err) {
      setError(err.message ?? 'That verification code could not be confirmed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSubmitting(true);
    try {
      await resendSignUpCode(verifyEmail);
      setSuccess(`A new verification code was sent to ${verifyEmail}.`);
    } catch (err) {
      setError(err.message ?? 'Could not resend the verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center p-4">
      {/* Subtle grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1e3a5f 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Apparel</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Student marketplace for campus club merch</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            {[
              { key: TABS.SIGN_IN, label: 'Sign In' },
              { key: TABS.SIGN_UP, label: 'Create Account' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'text-gray-900 border-b-2 border-gray-900 -mb-px bg-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Alert messages */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* ── SIGN IN ── */}
            {tab === TABS.SIGN_IN && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={siEmail}
                      onChange={e => setSiEmail(e.target.value)}
                      required
                      placeholder="you@university.ca"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={siPass}
                      onChange={e => setSiPass(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Signing in…' : 'Sign In'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  No account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab(TABS.SIGN_UP); setError(''); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGN UP ── */}
            {tab === TABS.SIGN_UP && (
              <form onSubmit={handleSignUp} className="space-y-5">
                {/* Role selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a…</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: 'student', label: 'User', desc: 'Browse & buy merch' },
                      { val: 'club_exec', label: 'Vendor', desc: 'Manage organization listings' },
                    ].map(({ val, label, desc }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSuRole(val)}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                          suRole === val
                            ? 'border-gray-900 bg-gray-900/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${suRole === val ? 'text-gray-900' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={suName}
                      onChange={e => setSuName(e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={suEmail}
                      onChange={e => setSuEmail(e.target.value)}
                      required
                      placeholder="you@university.ca"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={suPass}
                        onChange={e => setSuPass(e.target.value)}
                        required
                        placeholder="Min. 6 chars"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={suConfirm}
                        onChange={e => setSuConfirm(e.target.value)}
                        required
                        placeholder="Repeat password"
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPassToggle"
                    checked={showPass}
                    onChange={e => setShowPass(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showPassToggle" className="text-sm text-gray-500 select-none cursor-pointer">Show password</label>
                </div>

                {suRole === 'club_exec' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Organization</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={suClubId}
                        onChange={e => setSuClubId(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition appearance-none bg-white"
                      >
                        <option value="">— Select your organization —</option>
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      An admin will verify your organization membership before your account is activated.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Creating account…' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab(TABS.SIGN_IN); setError(''); }}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {tab === TABS.VERIFY && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Verify your email</h3>
                  <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code sent to <span className="font-medium text-gray-700">{verifyEmail}</span>.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="verification-code">Verification code</label>
                  <input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-[0.35em] font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">{submitting ? 'Verifying…' : 'Verify email'}</button>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <button type="button" onClick={handleResendCode} disabled={submitting} className="text-primary font-medium hover:underline disabled:opacity-50">Send another code</button>
                  <button type="button" onClick={() => { setTab(TABS.SIGN_UP); setSuccess(''); setError(''); }} className="text-gray-500 hover:text-gray-700">Back to sign up</button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Admin?{' '}
          <Link to="/admin/login" className="hover:text-gray-600 underline">
            Admin portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
