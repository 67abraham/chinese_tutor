import React, { useState, useRef, useEffect } from 'react';
import { Coffee, Plane, Building2, ShoppingBag, Briefcase, GraduationCap, Mic2, ArrowLeft, Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

const scenarios = [
  { id: 'restaurant', title: 'Restaurant', icon: Coffee, desc: 'Ordering food, asking for the bill' },
  { id: 'airport', title: 'Airport', icon: Plane, desc: 'Check-in, finding your gate' },
  { id: 'hotel', title: 'Hotel', icon: Building2, desc: 'Check-in, requesting room service' },
  { id: 'university', title: 'University', icon: GraduationCap, desc: 'Meeting classmates, asking professors' },
  { id: 'shopping', title: 'Shopping Mall', icon: ShoppingBag, desc: 'Bargaining, asking for sizes' },
  { id: 'business', title: 'Business Meeting', icon: Briefcase, desc: 'Introductions, polite exchanges' },
];

export default function PracticeView() {
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null);

  if (selectedScenario) {
    return (
      <PracticeSession
        scenario={selectedScenario}
        onBack={() => setSelectedScenario(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Conversation Practice</h2>
        <p className="text-slate-500 mt-1">Select a real-world scenario to practice speaking with our AI roleplayer.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <button 
              key={s.id}
              onClick={() => setSelectedScenario(s)}
              className="bg-white border border-slate-200 hover:border-brand-red rounded-3xl p-6 text-left transition-all hover:shadow-lg hover:shadow-red-50 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-red-light text-red-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{s.desc}</p>
              
              <div className="mt-6 flex items-center text-xs font-bold text-red-900 uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Mic2 className="w-4 h-4" /> Start Practice
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}

function PracticeSession({ scenario, onBack }: { scenario: typeof scenarios[0], onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial prompt to start the conversation
    const startConversation = async () => {
      setLoading(true);
      const prompt = `Let's practice a conversation in a ${scenario.title} setting. The scenario focus is: ${scenario.desc}. Start the roleplay by saying something appropriate in Chinese to a customer or person in this scenario, followed by the English translation and pinyin. Ask a question to invite my response.`;
      
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             prompt,
             systemInstruction: "You are a professional Chinese language tutor acting as a roleplay partner. Keep responses concise, natural, and friendly. Provide Pinyin and English translations. Correct the user if they make grammatical mistakes."
          })
        });

        if (res.ok) {
          const data = await res.json();
          setMessages([{ role: 'ai', content: data.text }]);
        }
      } catch (err) {
        console.error(err);
        setMessages([{ role: 'ai', content: "Sorry, I couldn't connect. Please try again." }]);
      } finally {
        setLoading(false);
      }
    };

    startConversation();
  }, [scenario]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role === 'ai' ? 'Tutor' : 'Student'}: ${m.content}`).join('\n');
      const prompt = `Scenario Context: ${scenario.title} (${scenario.desc})\n\nCurrent Chat:\n${chatHistory}\nStudent: ${userMsg}\nTutor (React naturalistically in-character, then provide feedback/translation):`;
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          systemInstruction: "You are a professional Chinese language tutor acting as a roleplay partner. Always include Pinyin and English translations for your Chinese text. Formulate your response as the character in the scenario." 
        })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const Icon = scenario.icon;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red-light text-brand-red flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-slate-800 tracking-tight leading-none">{scenario.title} Practice</h2>
              <p className="text-xs text-slate-500 mt-1">{scenario.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && loading && (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
               <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
               <p className="text-sm font-medium">Starting roleplay scenario...</p>
           </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-brand-red text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-sm' 
                : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <div>{msg.content}</div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-display prose-headings:text-slate-800 prose-strong:text-slate-800">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length > 0 && loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2 text-slate-400">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="text-xs font-semibold uppercase tracking-widest">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
         <form 
           onSubmit={(e) => { e.preventDefault(); handleSend(); }}
           className="relative flex items-center"
         >
           <input 
             type="text"
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Type your response in English, Pinyin, or Chinese..."
             className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all text-sm"
           />
           <button 
             type="submit"
             disabled={!input.trim() || loading}
             className="absolute right-2 p-2 bg-brand-red text-white rounded-xl hover:bg-brand-red-dark disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors cursor-pointer"
           >
             <Send className="w-4 h-4" />
           </button>
         </form>
      </div>
    </div>
  );
}
