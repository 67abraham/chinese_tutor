import React, { useState } from 'react';
import { GraduationCap, Key, ChevronRight, Loader2, Mail, User, AlertCircle } from 'lucide-react';
import { registerUser, loginUser, type AuthUser } from '../lib/appwrite';

interface LoginScreenProps {
  onLogin: (authUser: AuthUser) => void;
}

const COHORTS = [
  'Freshman (Year 1)',
  'Language Study Program',
  'Exchange Semester Fast-track',
  'Postgraduate Core Mandarin',
  'Language Cohort A',
  'Language Cohort B',
];

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tab, setTab]             = useState<'login' | 'register'>('login');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName]         = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regCohort, setRegCohort]     = useState('Freshman (Year 1)');

  const clearError = () => setError('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) { setError('Please enter your email and password.'); return; }
    setLoading(true); clearError();
    try {
      const authUser = await loginUser(loginEmail.trim(), loginPassword);
      onLogin(authUser);
    } catch (err: any) {
      setError(err?.message?.includes('Invalid credentials')
        ? 'Incorrect email or password.'
        : err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim())      { setError('Please enter your full name.'); return; }
    if (!regStudentId.trim()) { setError('Please enter your student ID.'); return; }
    if (!regEmail.trim())     { setError('Please enter your email.'); return; }
    if (regPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); clearError();
    try {
      const authUser = await registerUser(
        regEmail.trim(),
        regPassword,
        regName.trim(),
        regStudentId.trim().toUpperCase(),
        regCohort
      );
      onLogin(authUser);
    } catch (err: any) {
      const msg = err?.message || '';
      setError(
        msg.includes('already exists') ? 'An account with this email already exists. Please log in.' :
        msg.includes('password')       ? 'Password must be at least 8 characters.' :
        msg.includes('email')          ? 'Please enter a valid email address.' :
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick demo fill
  const quickDemo = () => {
    if (tab === 'register') {
      setRegName('Alex Chen'); setRegEmail('alex.demo@hanyu.ai');
      setRegPassword('demo12345'); setRegStudentId('UNI-2026-DEMO');
      setRegCohort('Language Cohort A');
    } else {
      setLoginEmail('alex.demo@hanyu.ai'); setLoginPassword('demo12345');
    }
    clearError();
  };

  return (
    <article className="min-h-screen bg-bg-base text-slate-900 flex flex-col justify-between font-sans">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <header className="h-16 shrink-0 border-b border-slate-100 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-chinese font-bold text-base">汉</div>
          <span className="font-display font-black text-slate-800 tracking-tight text-sm sm:text-base">HanYu AI 汉语</span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">EST. 2026</div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

          {/* Top emblem */}
          <div className="bg-brand-red px-8 pt-8 pb-6 text-center text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-black tracking-tight">HanYu Academy</h1>
            <p className="text-red-200 text-xs mt-1">Chinese learning platform powered by AI</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); clearError(); }}
                className={`flex-1 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  tab === t
                    ? 'text-brand-red border-b-2 border-brand-red'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="p-8 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* ── Login form ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="your@email.com" autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••" autoComplete="current-password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                    />
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-red hover:bg-brand-red-dark disabled:opacity-60 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-red-100 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ChevronRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}

            {/* ── Register form ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full name</label>
                    <div className="relative">
                      <input
                        type="text" value={regName} onChange={e => setRegName(e.target.value)}
                        placeholder="Alex Chen" autoComplete="name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student ID</label>
                    <input
                      type="text" value={regStudentId} onChange={e => setRegStudentId(e.target.value)}
                      placeholder="UNI-2026-XXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cohort</label>
                    <select
                      value={regCohort} onChange={e => setRegCohort(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red bg-white cursor-pointer"
                    >
                      {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      placeholder="your@email.com" autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      placeholder="min. 8 characters" autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 placeholder-slate-300"
                    />
                    <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
                  </div>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-red hover:bg-brand-red-dark disabled:opacity-60 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-red-100 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create account</span><ChevronRight className="h-4 w-4" /></>}
                </button>
              </form>
            )}

            {/* Quick demo */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">Hackathon evaluator?</span>
              <button onClick={quickDemo} className="text-brand-red hover:text-brand-red-dark font-bold underline cursor-pointer">
                Quick demo fill
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-14 border-t border-slate-100 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
        <div>Powered by Appwrite + OpenAI</div>
        <div className="flex gap-4 sm:gap-8"><span>VER: 2.0.0</span></div>
      </footer>
    </article>
  );
}