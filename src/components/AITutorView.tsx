import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function AITutorView({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `你好! I am your HanYu AI Tutor. What would you like to learn today, ${user?.name || 'student'}?\n\n*You can ask me to explain grammar, translate phrases, or quiz your vocabulary.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Build previous context
      const chatHistory = messages.map(m => `${m.role === 'ai' ? 'Tutor' : 'Student'}: ${m.content}`).join('\n');
      
      const prompt = `Current Chat Context:\n${chatHistory}\n\nStudent: ${userMsg}\n\nTutor:`;
      const systemInstruction = "You are HanYu AI, a supportive and intelligent Chinese language tutor. You help students learn Mandarin. Always include Pinyin and English translations when teaching Chinese words or phrases. Provide clear structure. Use markdown.";

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction })
      });

      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Let's try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-black text-slate-800 text-lg">AI Tutor</h2>
            <p className="text-xs text-slate-500">24/7 Personalized Mandarin Guidance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-brand-red text-white' : 'bg-brand-gold text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm ${
              msg.role === 'user' 
                ? 'bg-brand-red text-white rounded-tr-sm' 
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
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-brand-gold text-white flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2 text-slate-400">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="text-xs font-semibold uppercase tracking-widest">Generating Response...</span>
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
             placeholder="Ask anything about Chinese..."
             className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold transition-all text-sm"
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
