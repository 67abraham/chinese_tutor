import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Target, Book, Mic2, Loader2, RefreshCw } from 'lucide-react';
import { type ViewID } from './DashboardLayout';

interface DashboardData {
  hskLevel: string;
  streakDays: number;
  wordsLearned: number;
  currentLesson: { number: number; title: string; subtitle: string; progressPercent: number };
  todayGoals: { label: string; status: 'complete' | 'in_progress' | 'pending'; detail: string }[];
  dailyTip: { chinese: string; pinyin: string; english: string };
}

const statusColor = (s: string) => {
  if (s === 'complete') return 'text-green-600';
  if (s === 'in_progress') return 'text-brand-red';
  return 'text-slate-400';
};
const statusLabel = (s: string) => {
  if (s === 'complete') return 'Done';
  if (s === 'in_progress') return 'In Progress';
  return 'Pending';
};

export default function DashboardView({ user, onViewChange }: { user: any; onViewChange: (view: ViewID) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      });
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Could not load dashboard. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      <p className="text-sm font-medium">AI is preparing your dashboard...</p>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-sm text-red-500">{error}</p>
      <button onClick={fetchDashboard} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold cursor-pointer">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-2xl">
          <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight flex gap-2 items-center flex-wrap">
            Welcome Back, {user?.name || 'Student'}
            <span className="text-brand-red font-chinese">你好</span>
          </h2>
          <p className="text-slate-500 mt-2">You're doing great! Let's keep the momentum going.</p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Level</span>
              <span className="text-xl font-bold text-slate-800">{data.hskLevel}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Learning Streak</span>
              <span className="text-xl font-bold text-brand-warning flex items-center gap-1">
                {data.streakDays} Days <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Words Learned</span>
              <span className="text-xl font-bold text-brand-success">{data.wordsLearned} Words</span>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Tip from AI */}
      <section className="bg-gradient-to-r from-brand-red to-red-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-red-200 mb-2">Today's Phrase</p>
        <p className="text-3xl font-chinese font-bold mb-1">{data.dailyTip.chinese}</p>
        <p className="text-sm text-red-200 font-mono mb-1">{data.dailyTip.pinyin}</p>
        <p className="text-white/80 text-sm">{data.dailyTip.english}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <section className="space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-800">Continue Learning</h3>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-56">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest bg-brand-red-light px-2 py-1 rounded inline-block">
                Resume Lesson {data.currentLesson.number}
              </span>
              <h4 className="text-xl font-black text-slate-800">{data.currentLesson.title}</h4>
              <p className="text-sm text-slate-500">{data.currentLesson.subtitle}</p>
            </div>
            <div className="space-y-4 mt-auto">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-brand-red">{data.currentLesson.progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-red rounded-full transition-all duration-700" style={{ width: `${data.currentLesson.progressPercent}%` }} />
                </div>
              </div>
              <button onClick={() => onViewChange('learn')} className="w-full py-3 bg-brand-red text-white flex items-center justify-center gap-2 rounded-xl font-bold hover:bg-brand-red-dark transition-colors cursor-pointer shadow-md shadow-red-100">
                <Play className="w-4 h-4 fill-current" /> Continue Learning
              </button>
            </div>
          </div>
        </section>

        {/* Today's Goal */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-800">Today's Goals</h3>
            <button onClick={fetchDashboard} className="text-slate-400 hover:text-brand-red transition-colors cursor-pointer" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col">
            {data.todayGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${goal.status === 'complete' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {i === 0 ? <Book className="w-4 h-4" /> : i === 1 ? <Target className="w-4 h-4" /> : <Mic2 className="w-4 h-4" />}
                </div>
                <div className="flex-1 text-sm font-medium text-slate-700">{goal.label}</div>
                <div className={`text-xs font-bold ${statusColor(goal.status)}`}>{statusLabel(goal.status)}</div>
              </div>
            ))}
            <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => onViewChange('tutor')} className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold" /> AI Tutor
              </button>
              <button onClick={() => onViewChange('practice')} className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Mic2 className="w-3.5 h-3.5 text-slate-500" /> Practice
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
