import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  MessageSquare, 
  Mic2, 
  BookOpen, 
  BookType, 
  Award, 
  LineChart, 
  User,
  LogOut,
  Sparkles,
  PenLine
} from 'lucide-react';
import { motion } from 'motion/react';

export type ViewID = 'dashboard' | 'learn' | 'tutor' | 'practice' | 'vocabulary' | 'grammar' | 'hsk' | 'progress' | 'profile' | 'writing';

interface LayoutProps {
  currentView: ViewID;
  setCurrentView: (view: ViewID) => void;
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ currentView, setCurrentView, user, onLogout, children }: LayoutProps) {
  const navItems = [
    { id: 'dashboard' as ViewID, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learn' as ViewID, label: 'Learn', icon: GraduationCap },
    { id: 'tutor' as ViewID, label: 'AI Tutor', icon: MessageSquare },
    { id: 'practice' as ViewID, label: 'Practice', icon: Mic2 },
    { id: 'vocabulary' as ViewID, label: 'Vocabulary', icon: BookOpen },
    { id: 'grammar' as ViewID, label: 'Grammar', icon: BookType },
    { id: 'hsk' as ViewID, label: 'HSK Prep', icon: Award },
    { id: 'writing' as ViewID, label: 'Writing', icon: PenLine },
    { id: 'progress' as ViewID, label: 'Progress', icon: LineChart },
    { id: 'profile' as ViewID, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen shrink-0">
        <div className="p-6 shrink-0 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-chinese font-bold text-xl shadow-sm">
            汉
          </div>
          <div className="leading-tight">
            <h1 className="font-display font-black text-slate-800 tracking-tight text-lg">
              HanYu AI
            </h1>
            <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">
              Learn Chinese
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer ${
                  isActive 
                    ? 'bg-brand-red text-white shadow-sm shadow-red-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-chinese font-bold text-lg shadow-sm">
              汉
            </div>
            <h1 className="font-display font-black text-slate-800 tracking-tight">HanYu AI</h1>
          </div>
        </header>

        {/* Scrollable Layout Content */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
