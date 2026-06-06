import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Eraser, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft,
  Loader2, RefreshCw, Sparkles, Star, ChevronDown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterData {
  char: string;
  pinyin: string;
  meaning: string;
  strokes: number;
  strokeOrder: string;
  tip: string;
}

interface FeedbackData {
  isCorrect: boolean;
  score: number;
  grade: 'excellent' | 'good' | 'fair' | 'try-again';
  mainFeedback: string;
  improvements: string[];
  strokeFeedback: string;
  encouragement: string;
}

// ─── Grade config ─────────────────────────────────────────────────────────────

const gradeConfig = {
  excellent: { bg: 'bg-green-500',  text: 'Excellent!',   icon: '🏆', bar: 'bg-green-400'  },
  good:      { bg: 'bg-blue-500',   text: 'Good job!',    icon: '👍', bar: 'bg-blue-400'   },
  fair:      { bg: 'bg-amber-500',  text: 'Keep going!',  icon: '💪', bar: 'bg-amber-400'  },
  'try-again': { bg: 'bg-red-500',  text: 'Try again',    icon: '✏️', bar: 'bg-red-400'    },
};

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
type Level = typeof LEVELS[number];

const TOPICS = ['general', 'nature', 'people', 'numbers', 'food', 'time', 'body', 'home'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function WritingView() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const seenRef     = useRef<string[]>([]);

  const [characters, setCharacters]   = useState<CharacterData[]>([]);
  const [activeIdx, setActiveIdx]     = useState(0);
  const [level, setLevel]             = useState<Level>('beginner');
  const [topic, setTopic]             = useState('general');
  const [isDrawing, setIsDrawing]     = useState(false);
  const [hasDrawn, setHasDrawn]       = useState(false);

  // Loading states
  const [loadingChars, setLoadingChars] = useState(true);
  const [checking, setChecking]         = useState(false);
  const [charError, setCharError]       = useState('');

  // Feedback
  const [feedback, setFeedback]   = useState<FeedbackData | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // Session score
  const [sessionScore, setSessionScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const activeChar = characters[activeIdx] ?? null;

  // ─── Canvas setup ───────────────────────────────────────────────────────────

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';
    ctx.lineWidth  = 18;  // thicker strokes = better AI recognition
    ctx.strokeStyle = '#1e293b';
  }, []);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setFeedback(null);
  }, []);

  // ─── Fetch AI characters ─────────────────────────────────────────────────

  const fetchCharacters = async (lvl: Level, tpc: string, reset = false) => {
    setLoadingChars(true);
    setCharError('');
    setFeedback(null);
    if (reset) seenRef.current = [];

    try {
      const res = await fetch('/api/writing/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: lvl, topic: tpc, seenChars: seenRef.current }),
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const chars: CharacterData[] = data.characters || data;
      setCharacters(chars);
      setActiveIdx(0);
      clearCanvas();
      // Track seen chars so next fetch avoids them
      seenRef.current = [...seenRef.current, ...chars.map(c => c.char)];
    } catch {
      setCharError('Could not load characters. Please retry.');
    } finally {
      setLoadingChars(false);
    }
  };

  useEffect(() => { fetchCharacters(level, topic, true); }, []);

  // ─── Drawing handlers ────────────────────────────────────────────────────

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setFeedback(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  // ─── Check writing ────────────────────────────────────────────────────────

  const handleCheck = async () => {
    if (!hasDrawn || !activeChar) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setChecking(true);
    setFeedback(null);

    try {
      // Composite the drawing onto a white background before sending to AI.
      // The canvas is transparent by default — GPT-4o Vision would see a blank image.
      // We blit the drawing onto a white offscreen canvas first.
      // Export at 300x300 — sufficient for GPT-4o Vision, keeps payload small.
      const offscreen = document.createElement('canvas');
      offscreen.width  = 300;
      offscreen.height = 300;
      const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D;
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, 300, 300);
      offCtx.drawImage(canvas, 0, 0, 300, 300);
      const imageBase64 = offscreen.toDataURL('image/jpeg', 0.85).split(',')[1];

      const res = await fetch('/api/writing/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          char:    activeChar.char,
          pinyin:  activeChar.pinyin,
          meaning: activeChar.meaning,
          strokes: activeChar.strokes,
        }),
      });

      if (!res.ok) throw new Error('Check failed');
      const data: FeedbackData = await res.json();
      setFeedback(data);
      setSessionScore(prev => ({
        correct: prev.correct + (data.isCorrect ? 1 : 0),
        total:   prev.total + 1,
      }));
    } catch {
      setFeedback({
        isCorrect: false,
        score: 0,
        grade: 'try-again',
        mainFeedback: 'Could not analyse your writing. Please try again.',
        improvements: [],
        strokeFeedback: '',
        encouragement: 'Keep practising!',
      });
    } finally {
      setChecking(false);
    }
  };

  // ─── Navigate characters ──────────────────────────────────────────────────

  const goToChar = (idx: number) => {
    setActiveIdx(idx);
    clearCanvas();
  };

  const handleNext = () => {
    if (activeIdx < characters.length - 1) {
      goToChar(activeIdx + 1);
    } else {
      // Last character — load a new batch
      fetchCharacters(level, topic, false);
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) goToChar(activeIdx - 1);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Writing Sandbox</h2>
          <p className="text-slate-500 mt-1">AI provides the characters — you write, AI checks your work.</p>
        </div>
        {/* Session score */}
        {sessionScore.total > 0 && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
            <Star className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-bold text-slate-700">
              {sessionScore.correct}/{sessionScore.total} correct this session
            </span>
          </div>
        )}
      </div>

      {/* Level + Topic controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
          {LEVELS.map(l => (
            <button
              key={l}
              onClick={() => { setLevel(l); fetchCharacters(l, topic, true); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                level === l ? 'bg-brand-red text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={topic}
            onChange={e => { setTopic(e.target.value); fetchCharacters(level, e.target.value, true); }}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-xs font-bold text-slate-600 cursor-pointer focus:outline-none focus:border-brand-red"
          >
            {TOPICS.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={() => fetchCharacters(level, topic, true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:border-slate-400 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New characters
        </button>
      </div>

      {/* Loading characters */}
      {loadingChars ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          <p className="text-sm font-medium">AI is selecting characters for you...</p>
        </div>
      ) : charError ? (
        <div className="flex flex-col items-center gap-4 h-48 justify-center">
          <p className="text-sm text-red-500">{charError}</p>
          <button onClick={() => fetchCharacters(level, topic, true)} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : activeChar && (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left panel ──────────────────────────────────────────────── */}
          <div className="lg:w-80 flex flex-col gap-4 shrink-0">

            {/* Character display card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center relative overflow-hidden">
              {/* AI badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-brand-gold bg-brand-gold-light px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> AI
              </div>

              {/* Big character */}
              <div className="text-[110px] leading-none font-chinese text-slate-800 select-none mb-3">
                {activeChar.char}
              </div>
              <p className="font-mono font-bold text-xl text-brand-red mb-1">{activeChar.pinyin}</p>
              <p className="text-slate-600 font-semibold text-sm">{activeChar.meaning}</p>
              <p className="text-slate-400 text-xs mt-1">{activeChar.strokes} {activeChar.strokes === 1 ? 'stroke' : 'strokes'}</p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mt-5">
                {characters.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToChar(i)}
                    className={`rounded-full transition-all cursor-pointer ${
                      i === activeIdx ? 'w-5 h-2 bg-brand-red' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">{activeIdx + 1} of {characters.length}</p>
            </div>

            {/* Stroke guide — toggleable */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowGuide(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Writing guide
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
              </button>
              {showGuide && (
                <div className="px-5 pb-4 space-y-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 mb-1">Stroke order</p>
                    <p className="text-sm text-slate-600">{activeChar.strokeOrder}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Writing tip</p>
                    <p className="text-sm text-slate-600">{activeChar.tip}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Character selector grid */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">All characters</p>
              <div className="grid grid-cols-4 gap-2">
                {characters.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => goToChar(i)}
                    className={`aspect-square rounded-xl flex items-center justify-center font-chinese text-xl transition-all cursor-pointer ${
                      i === activeIdx
                        ? 'bg-brand-red text-white shadow-md'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {c.char}
                  </button>
                ))}
              </div>
            </div>

            {/* General tip */}
            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p><strong>Tip:</strong> Strokes generally go top-to-bottom and left-to-right. Write slowly for best AI recognition.</p>
            </div>
          </div>

          {/* ── Right panel: canvas ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">

              {/* Canvas toolbar */}
              <div className="flex justify-between w-full mb-4 items-center gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={handlePrev} disabled={activeIdx === 0} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${activeIdx === 0 ? 'text-slate-300 border-slate-100' : 'text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    {activeIdx + 1}/{characters.length}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                    <Eraser className="w-4 h-4" /> Clear
                  </button>
                  <button
                    onClick={handleCheck}
                    disabled={!hasDrawn || checking}
                    className="flex items-center gap-1.5 px-4 py-2 bg-brand-success hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {checking ? 'AI is checking...' : 'Check'}
                  </button>
                  <button onClick={handleNext} className="flex items-center gap-1.5 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-sm shadow-red-100">
                    {activeIdx === characters.length - 1 ? 'New set' : 'Next'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 rice-grid-bg bg-white shadow-inner flex items-center justify-center touch-none">
                {/* Faded guide character */}
                <div className="absolute inset-0 flex items-center justify-center text-[220px] font-chinese text-slate-100 select-none pointer-events-none leading-none">
                  {activeChar.char}
                </div>

                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  className="absolute inset-0 cursor-crosshair w-full h-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  onTouchCancel={stopDrawing}
                />

                {/* Checking overlay */}
                {checking && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-red" />
                    <p className="text-sm font-bold text-slate-600">AI is analysing your writing...</p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-400 font-medium">
                {hasDrawn ? 'Press Check when ready for AI feedback.' : 'Use your mouse or touch to write the character above.'}
              </p>
            </div>

            {/* ── AI Feedback card ─────────────────────────────────────── */}
            {feedback && (
              <div className={`rounded-3xl p-6 border shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300 ${
                feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Grade header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black ${gradeConfig[feedback.grade]?.bg ?? 'bg-slate-500'}`}>
                    {gradeConfig[feedback.grade]?.icon ?? '📝'}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-lg">{gradeConfig[feedback.grade]?.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${gradeConfig[feedback.grade]?.bar ?? 'bg-slate-400'}`}
                          style={{ width: `${feedback.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{feedback.score}/100</span>
                    </div>
                  </div>
                </div>

                {/* Main feedback */}
                <p className="text-slate-700 text-sm mb-3">{feedback.mainFeedback}</p>

                {/* Stroke feedback */}
                {feedback.strokeFeedback && (
                  <div className="bg-white rounded-xl p-3 mb-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stroke analysis</p>
                    <p className="text-sm text-slate-600">{feedback.strokeFeedback}</p>
                  </div>
                )}

                {/* Improvements */}
                {feedback.improvements.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To improve</p>
                    {feedback.improvements.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-brand-red font-bold mt-0.5">→</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Encouragement */}
                <p className="text-sm font-bold text-slate-500 italic">{feedback.encouragement}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button onClick={clearCanvas} className="flex-1 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                    Try again
                  </button>
                  <button onClick={handleNext} className="flex-1 py-2 rounded-xl bg-brand-red text-white text-sm font-bold hover:bg-brand-red-dark transition-colors cursor-pointer">
                    Next character →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}