import React, { useState, useEffect } from 'react';
import { Target, BookOpen, PenTool, Headphones, Trophy, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const hskLevels = ['1', '2', '3'];

export default function HSKView() {
  const [level, setLevel] = useState('1');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/hsk-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setQuestions(json);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setAnswered(false);
      setFinished(false);
      setQuizStarted(true);
    } catch {
      setError('Could not generate quiz. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === questions[currentQ].correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const restart = () => { setQuizStarted(false); setFinished(false); setQuestions([]); };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm text-center space-y-6">
          <Trophy className="w-16 h-16 text-brand-gold" />
          <h2 className="text-3xl font-display font-black text-slate-800">Quiz Complete!</h2>
          <div className="text-6xl font-black text-brand-red">{pct}%</div>
          <p className="text-slate-500">{score} out of {questions.length} correct on HSK {level}</p>
          <p className="text-sm font-bold px-4 py-2 rounded-xl inline-block" style={{ background: pct >= 70 ? '#dcfce7' : '#ffedd5', color: pct >= 70 ? '#16a34a' : '#f97316' }}>
            {pct >= 80 ? 'Excellent! Ready for next level.' : pct >= 60 ? 'Good effort! Keep practicing.' : 'Keep studying — you\'ll get there!'}
          </p>
          <div className="flex gap-3">
            <button onClick={fetchQuiz} className="px-6 py-3 bg-brand-red text-white rounded-xl font-bold cursor-pointer hover:bg-brand-red-dark transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> New Quiz
            </button>
            <button onClick={restart} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button onClick={restart} className="text-sm text-slate-500 hover:text-brand-red font-bold cursor-pointer transition-colors">← Back</button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">HSK {level} · Question {currentQ + 1} / {questions.length}</span>
          <span className="text-sm font-bold text-brand-success">{score} correct</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-red rounded-full transition-all duration-500" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800">{q.question}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400';
              if (answered) {
                if (opt === q.correctAnswer) style = 'bg-green-50 border-green-400 text-green-700';
                else if (opt === selected) style = 'bg-red-50 border-red-400 text-red-700';
                else style = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  disabled={answered}
                  className={`p-4 rounded-2xl border-2 text-sm font-semibold text-left transition-all cursor-pointer flex items-center gap-3 ${style}`}
                >
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black shrink-0">{['A','B','C','D'][i]}</span>
                  {opt}
                  {answered && opt === q.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 text-green-600" />}
                  {answered && opt === selected && opt !== q.correctAnswer && <XCircle className="w-4 h-4 ml-auto shrink-0 text-red-500" />}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600">
              <span className="font-bold text-slate-800">Explanation: </span>{q.explanation}
            </div>
          )}
          {answered && (
            <button onClick={handleNext} className="w-full py-3 bg-brand-red text-white rounded-xl font-bold cursor-pointer hover:bg-brand-red-dark transition-colors">
              {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-8 bg-brand-red text-white rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10" />
        <div className="space-y-4">
          <div className="bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest inline-block rounded-lg">Exam Prep Center</div>
          <h2 className="text-3xl font-display font-black tracking-tight">HSK {level} Standard</h2>
          <p className="text-red-100 max-w-md">AI-generated exam questions tailored to your level. Fresh questions every attempt.</p>
        </div>
        <div className="mt-6 md:mt-0 bg-white text-slate-800 p-5 rounded-2xl flex flex-col items-center min-w-40 z-10">
          <Trophy className="w-8 h-8 text-brand-gold mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Level</span>
          <div className="flex gap-2 mt-2">
            {hskLevels.map(l => (
              <button key={l} onClick={() => setLevel(l)} className={`w-9 h-9 rounded-xl font-black text-sm cursor-pointer transition-colors ${level === l ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, title: 'Vocabulary Quiz', type: 'Multiple Choice', count: '5 Qs' },
          { icon: Target, title: 'Reading Test', type: 'Comprehension', count: 'AI gen' },
          { icon: Headphones, title: 'Listening Test', type: 'Audio & Match', count: 'AI gen' },
          { icon: PenTool, title: 'Writing Test', type: 'Sentence Assembly', count: 'AI gen' },
        ].map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} onClick={i === 0 ? fetchQuiz : undefined} className={`bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm flex flex-col h-48 ${i === 0 ? 'cursor-pointer' : 'cursor-default opacity-70'} group`}>
              <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-auto group-hover:bg-brand-red group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{t.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-500">{t.type}</p>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">{t.count}</span>
                </div>
                {i === 0 && <p className="text-xs text-brand-red font-bold mt-2">Click to start →</p>}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
          <p className="text-sm font-medium">AI is generating your HSK {level} quiz...</p>
        </div>
      )}
    </div>
  );
}
