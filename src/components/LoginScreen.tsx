import React, { useState } from 'react';
import { GraduationCap, Sparkles, BookOpen, Key, ChevronRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: { name: string; studentId: string; cohort: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [cohort, setCohort] = useState('Freshman (Year 1)');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please provide your English or Pinyin name.');
      return;
    }

    if (!studentId.trim()) {
      setError('Please provide your university Student ID.');
      return;
    }

    // Standard simulated university credentials validation
    setError('');
    const userData = {
      name: name.trim(),
      studentId: studentId.trim().toUpperCase(),
      cohort
    };

    localStorage.setItem('hanyu_user', JSON.stringify(userData));
    onLogin(userData);
  };

  // Quick fill helper for hackathon live-demoing
  const handleQuickDemo = () => {
    setName('Alex Chen');
    setStudentId('UNI-2026-6188');
    setCohort('Language Cohort A');
    setError('');
  };

  return (
    <article className="min-h-screen bg-bg-base text-slate-900 flex flex-col justify-between font-sans selection:bg-brand-red/10 selection:text-brand-red">
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top minimalistic header bar */}
      <header className="h-16 shrink-0 border-b border-slate-100 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-chinese font-bold text-base shadow-xs">
            汉
          </div>
          <span className="font-display font-black text-slate-800 tracking-tight text-sm sm:text-base">
            HanYu AI 汉语
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
          EST. 2026
        </div>
      </header>

      {/* Main card viewport */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden space-y-6">
          
          {/* Top red header banner emblem */}
          <div className="text-center space-y-3">
            <div className="h-14 w-14 bg-brand-red rounded-2xl flex items-center justify-center text-white mx-auto shadow-sm shadow-red-100">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-display font-black text-slate-800 tracking-tight">
                HanYu AI
              </h1>
              <p className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em] leading-none">
                Learn Chinese with out Limited
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Ready to learn Chinese? Standard matriculation is required. Activate your training deck below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error banner */}
            {error && (
              <div className="p-3.5 bg-brand-red-light border border-brand-red/10 rounded-xl text-brand-red text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Form field: Full Name */}
            <div className="space-y-1.5Packed">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                Student Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold-light placeholder-slate-300 font-medium"
                id="login-name-input"
              />
            </div>

            {/* Form field: Student ID */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                Matriculation / Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. UNI-2026-6188"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold-light placeholder-slate-300 font-mono"
                  id="login-id-input"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-300" />
              </div>
            </div>

            {/* Form field: Cohort Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                University Language Cohort
              </label>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold-light text-slate-700 bg-white cursor-pointer font-medium"
                id="login-cohort-select"
              >
                <option value="Freshman (Year 1)">Freshman Cohort &bull; HSK 1 Basic</option>
                <option value="Language Study Program">HSK 2</option>
                <option value="Exchange Semester Team">HSK 3</option>
              </select>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-md shadow-red-100 hover:shadow-lg hover:shadow-red-200 active:scale-98 transition duration-150 cursor-pointer flex items-center justify-center gap-2"
              id="login-submit-btn"
            >
              <span>Initialize Training Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-400">University Hackathon evaluator?</span>
            <button
              onClick={handleQuickDemo}
              className="text-brand-red hover:text-brand-red-dark font-bold underline cursor-pointer"
              id="btn-quick-demo"
            >
              Quick Match Demo
            </button>
          </div>

        </div>
      </main>

      {/* Decorative footer indicators */}
      <footer className="h-14 border-t border-slate-100 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
        <div>HACKATHON_MODE: ACTIVE</div>
        <div className="flex gap-4 sm:gap-8">
          <span>PORT: 3000 INGRESS</span>
          <span>VER: 1.0.4-PROD</span>
        </div>
      </footer>
    </article>
  );
}
