import React, { useState, useEffect } from 'react';
import { Flame, Star, BookOpen, Clock, Award, Target, Loader2, RefreshCw } from 'lucide-react';

interface ProgressData {
  wordsLearned: number;
  lessonsCompleted: number;
  studyHours: number;
  currentStreak: number;
  achievements: { title: string; desc: string; done: boolean }[];
  weeklyActivity: { day: string; minutes: number }[];
  activeDays: number[];
}

export default function ProgressView({ user }: { user?: any }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Could not load progress data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      <p className="text-sm font-medium">AI is analysing your progress...</p>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center gap-4 h-64 justify-center">
      <p className="text-sm text-red-500">{error}</p>
      <button onClick={fetchProgress} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold cursor-pointer">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const stats = [
    { label: 'Words Learned', value: data.wordsLearned.toString(), icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Lessons Done', value: data.lessonsCompleted.toString(), icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Study Hours', value: `${data.studyHours}h`, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Current Streak', value: data.currentStreak.toString(), icon: Flame, color: 'text-brand-red', bg: 'bg-brand-red-light' },
  ];

  const maxMinutes = Math.max(...data.weeklyActivity.map(d => d.minutes), 1);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Your Progress</h2>
          <p className="text-slate-500 mt-1">AI-powered analytics, updated in real time.</p>
        </div>
        <button onClick={fetchProgress} className="text-slate-400 hover:text-brand-red transition-colors cursor-pointer" title="Refresh">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${s.bg} ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800">{s.value}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-6">This Week's Study Time</h3>
        <div className="flex items-end gap-3 h-32">
          {data.weeklyActivity.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">{d.minutes}m</span>
              <div className="w-full rounded-t-lg bg-red-700 transition-all duration-700" style={{ height: `${(d.minutes / maxMinutes) * 80}px`, minHeight: d.minutes > 0 ? '4px' : '0' }} />
              <span className="text-xs text-slate-400 font-bold">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Achievements */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-gold" /> Badges & Achievements
          </h3>
          <div className="space-y-4">
            {data.achievements.map((badge, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${badge.done ? 'bg-slate-50 border-slate-100' : 'bg-transparent border-slate-100 opacity-50 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badge.done ? 'bg-brand-gold text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{badge.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Calendar */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Learning Calendar</h3>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {['M','T','W','T','F','S','S'].map((day, i) => (
              <div key={`h-${i}`} className="text-center text-xs font-bold text-slate-400">{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const isActive = data.activeDays.includes(i);
              const isToday = i === data.activeDays[data.activeDays.length - 1];
              return (
                <div key={i} className={`aspect-square rounded-lg sm:rounded-xl border flex items-center justify-center text-xs font-medium cursor-default transition-all ${isToday ? 'border-brand-red bg-brand-red text-white shadow-md shadow-red-100' : isActive ? 'border-brand-red/20 bg-brand-red-light text-brand-red' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                  {i < 30 ? i + 1 : ''}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-50 border border-slate-100"></div> No Study</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-red-light border border-brand-red/20"></div> Studied</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-brand-red"></div> Today</div>
          </div>
        </section>
      </div>
    </div>
  );
}
