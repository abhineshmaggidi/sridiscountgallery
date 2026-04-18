'use client';

import { useState } from 'react';
import { X, LogOut, Shield, Loader2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginModal() {
  const { isLoginOpen, login, signup, toggleLogin, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');

  if (!isLoginOpen) return null;

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (isSignup && !form.name) { setError('Please enter your name'); return; }

    const err = isSignup
      ? await signup(form.name, form.email, form.phone, form.password)
      : await login(form.email, form.password);

    if (err) { setError(err); }
    else { setForm({ name: '', email: '', phone: '', password: '' }); setError(''); }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-end md:items-center justify-center" onClick={toggleLogin}>
      <div className="w-full md:max-w-md bg-white md:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden animate-modal-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="relative p-5 pb-3 md:p-6 md:pb-4 bg-gradient-to-r from-[#1E3A8A] to-[#2548a8]">
          <button type="button" onClick={toggleLogin} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 text-white/70 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-blue-200 text-sm mt-1">{isSignup ? 'Sign up to start shopping' : 'Log in to your account'}</p>
        </div>

        <div className="p-5 md:p-6 space-y-3.5">
          {error && <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">{error}</div>}

          {isSignup && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none focus:border-[#1E3A8A] transition-all" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none focus:border-[#1E3A8A] transition-all" />
          </div>
          {isSignup && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none focus:border-[#1E3A8A] transition-all" />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 outline-none focus:border-[#1E3A8A] transition-all" />
          </div>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#F97316] text-white font-bold text-[15px] disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignup ? 'Create Account' : 'Log In'}
          </button>
          <p className="text-center text-sm text-gray-400 pb-2">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); }} className="text-[#1E3A8A] font-semibold">
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProfileButton() {
  const { user, logout, toggleLogin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (user) {
    return (
      <>
        <button type="button" onClick={() => setShowProfile(!showProfile)}
          className="w-10 h-10 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </button>
        {showProfile && (
          <div className="fixed inset-0 z-[200] bg-black/30 flex items-start justify-center md:justify-end pt-16 md:pt-20 px-4 md:pr-4" onClick={() => setShowProfile(false)}>
            <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-modal-in" onClick={e => e.stopPropagation()}>
              <div className="p-5 bg-gradient-to-r from-[#1E3A8A] to-[#2548a8]">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold mb-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-bold text-lg">{user.name}</p>
                <p className="text-blue-200 text-sm">{user.email}</p>
              </div>
              <div className="p-3">
                {user.is_admin && (
                  <a href="/admin" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#1E3A8A] text-sm">
                    <Shield className="w-4 h-4" /><span className="font-medium">Admin Dashboard</span>
                  </a>
                )}
                <button type="button" onClick={() => { logout(); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-500 text-sm mt-1">
                  <LogOut className="w-4 h-4" /><span className="font-medium">Log out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button type="button" onClick={toggleLogin}
      className="h-10 px-3 md:px-4 rounded-lg border border-gray-200 bg-white text-gray-600 flex items-center justify-center gap-1.5 text-sm font-medium">
      <User className="w-4 h-4" />
      <span className="text-[13px]">Login</span>
    </button>
  );
}
