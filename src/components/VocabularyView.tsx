import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Heart, Volume2, Loader2, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

const categories = ['Food', 'Travel', 'Business', 'School', 'Daily Life', 'Shopping', 'Health', 'Sports', 'Technology', 'Nature', 'Family', 'Emotions'];

const difficultyStyle: Record<string, string> = {
  beginner:     'bg-green-50 text-green-700 border-green-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced:     'bg-red-50 text-red-700 border-red-200',
};

interface Word {
  char: string;
  pinyin: string;
  en: string;
  example: string;
  exampleEn: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export default function VocabularyView() {
  const [activeCat, setActiveCat]   = useState('Food');
  const [words, setWords]           = useState<Word[]>([]);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError]           = useState('');
  const [saved, setSaved]           = useState<Set<string>>(new Set());
  const [liked, setLiked]           = useState<Set<string>>(new Set());
  // track all chars seen so AI never repeats within a session
  const seenRef = useRef<Record<string, string[]>>({});
  const topRef  = useRef<HTMLDivElement>(null);

  const fetchWords = async (category: string, pg: number, isNext = false) => {
    isNext ? setLoadingNext(true) : setLoading(true);
    setError('');

    const seen = seenRef.current[category] || [];

    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, page: pg, seenWords: seen }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const newWords: Word[] = json.words || json;

      // Record chars as seen so next page avoids them
      seenRef.current[category] = [
        ...seen,
        ...newWords.map((w: Word) => w.char),
      ];

      setWords(newWords);
      setPage(pg);
      // Scroll back to top of the section smoothly
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setError('Could not load vocabulary. Please try again.');
    } finally {
      setLoading(false);
      setLoadingNext(false);
    }
  };

  // When category changes reset page + seen history for that category
  const handleCategoryChange = (cat: string) => {
    setActiveCat(cat);
    setPage(1);
    fetchWords(cat, 1, false);
  };

  useEffect(() => { fetchWords(activeCat, 1, false); }, []);

  const handleNext = () => fetchWords(activeCat, page + 1, true);
  const handlePrev = () => { if (page > 1) fetchWords(activeCat, page - 1, false); };

  const handleReset = () => {
    seenRef.current[activeCat] = [];
    setPage(1);
    fetchWords(activeCat, 1, false);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'zh-CN';
      utt.rate = 0.75;
      window.speechSynthesis.speak(utt);
    }
  };

  const toggleSaved = (char: string) => setSaved(prev => { const n = new Set(prev); n.has(char) ? n.delete(char) : n.add(char); return n; });
  const toggleLiked = (char: string) => setLiked(prev => { const n = new Set(prev); n.has(char) ? n.delete(char) : n.add(char); return n; });

  const seenCount = (seenRef.current[activeCat] || []).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300" ref={topRef}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Vocabulary Builder</h2>
          <p className="text-slate-500 mt-1">
            AI generates a fresh set of words every time you press <span className="font-bold text-slate-700">Next</span>. No repeats.
          </p>
        </div>
        {seenCount > 6 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-400 hover:text-brand-red transition-colors cursor-pointer"
            title="Start over from page 1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCat === cat
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Page indicator */}
      {!loading && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Page {page} · {activeCat}
          </span>
          {seenCount > 0 && (
            <span className="text-xs text-slate-400">
              {seenCount} words learned this session
            </span>
          )}
        </div>
      )}

      {/* Word grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-72 gap-4 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          <p className="text-sm font-medium">AI is generating {activeCat} vocabulary...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 h-48 justify-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => fetchWords(activeCat, page, false)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {words.map((w, i) => (
            <div
              key={`${w.char}-${i}`}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                {/* Chinese character — large and prominent */}
                <div className="flex justify-between items-start mb-3">
                  <div className="text-5xl text-brand-red font-chinese font-bold leading-none">{w.char}</div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => toggleSaved(w.char)} className={`transition-colors cursor-pointer ${saved.has(w.char) ? 'text-brand-gold' : 'text-slate-300 hover:text-brand-gold'}`}>
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button onClick={() => toggleLiked(w.char)} className={`transition-colors cursor-pointer ${liked.has(w.char) ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}>
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Pinyin + TTS */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-slate-500">{w.pinyin}</span>
                  <button
                    onClick={() => speak(w.char)}
                    className="text-slate-400 hover:text-brand-red cursor-pointer transition-colors"
                    title="Hear pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* English */}
                <h3 className="text-lg font-bold text-slate-800">{w.en}</h3>

                {/* Difficulty badge */}
                {w.difficulty && (
                  <span className={`inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${difficultyStyle[w.difficulty] || difficultyStyle.beginner}`}>
                    {w.difficulty}
                  </span>
                )}

                {/* Example sentence */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Example</p>
                  <p
                    className="text-base text-slate-700 font-chinese leading-relaxed cursor-pointer hover:text-brand-red transition-colors"
                    onClick={() => speak(w.example)}
                    title="Tap to hear example"
                  >
                    {w.example}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">{w.exampleEn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination bar */}
      {!loading && !error && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">

          {/* Previous */}
          <button
            onClick={handlePrev}
            disabled={page === 1 || loadingNext}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              page === 1
                ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                : 'text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(page + 1, 5) }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === page - 1
                    ? 'w-6 h-2 bg-brand-red'
                    : 'w-2 h-2 bg-slate-200'
                }`}
              />
            ))}
            {page > 4 && <span className="text-xs text-slate-400 font-bold ml-1">···</span>}
          </div>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={loadingNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-red text-white hover:bg-brand-red-dark transition-colors cursor-pointer shadow-sm shadow-red-100 disabled:opacity-60"
          >
            {loadingNext ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is thinking...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
