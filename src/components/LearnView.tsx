import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Lock, PlayCircle, Loader2, RefreshCw } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'locked';
  xp: number;
  chineseWord: string;
  pinyin: string;
}

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function LearnView() {
  const [activeLevel, setActiveLevel] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLessons = async (level: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setLessons(json);
    } catch {
      setError('Could not load lessons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLessons(levels[activeLevel]); }, [activeLevel]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Learning Path</h2>
          <p className="text-slate-500 mt-1">AI-generated curriculum, one step at a time.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
          {levels.map((level, i) => (
            <button
              key={level}
              onClick={() => setActiveLevel(i)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${i === activeLevel ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10" />

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
            <p className="text-sm font-medium">AI is building your {levels[activeLevel]} curriculum...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 h-64 justify-center">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => fetchLessons(levels[activeLevel])} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="mb-8 text-center">
              <h3 className="text-xl font-bold text-slate-800">{levels[activeLevel]} Track</h3>
              <p className="text-sm text-slate-500">AI-curated Chinese learning path</p>
            </div>
            <div className="relative border-l-2 border-slate-100 ml-6 pl-8 space-y-8 pb-4">
              {lessons.map((lesson) => {
                const isCompleted = lesson.status === 'completed';
                const isCurrent = lesson.status === 'current';
                return (
                  <div key={lesson.id} className="relative group">
                    <div className={`absolute -left-[41px] top-4 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all ${isCompleted ? 'bg-brand-success text-white' : isCurrent ? 'bg-brand-red text-white ring-4 ring-brand-red/10' : 'bg-slate-100 text-slate-400'}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : lesson.status === 'locked' ? <Lock className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`p-5 rounded-2xl border transition-all ${isCompleted ? 'bg-slate-50 border-slate-200' : isCurrent ? 'bg-white border-brand-red shadow-md shadow-red-100 scale-[1.02]' : 'bg-white border-slate-100 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lesson {lesson.id}</div>
                          <h4 className={`text-lg font-bold ${isCurrent ? 'text-brand-red' : 'text-slate-800'}`}>{lesson.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{lesson.subtitle}</p>
                          {lesson.chineseWord && (
                            <p className="text-xl font-chinese text-brand-red mt-2">{lesson.chineseWord} <span className="text-sm font-sans text-slate-400 font-mono">{lesson.pinyin}</span></p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isCompleted && (
                            <div className="text-xs font-bold text-brand-success bg-brand-success-light px-2.5 py-1 rounded-full">+{lesson.xp} XP</div>
                          )}
                          {isCurrent && (
                            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-red text-white hover:bg-brand-red-dark transition-colors cursor-pointer shadow-sm">
                              <PlayCircle className="w-5 h-5 fill-current" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
