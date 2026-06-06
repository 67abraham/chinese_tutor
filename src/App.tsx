import { useState } from 'react';
import DashboardLayout, { type ViewID } from './components/DashboardLayout';
import DashboardView from './components/DashboardView';
import LearnView from './components/LearnView';
import AITutorView from './components/AITutorView';
import PracticeView from './components/PracticeView';
import VocabularyView from './components/VocabularyView';
import HSKView from './components/HSKView';
import ProgressView from './components/ProgressView';
import WritingView from './components/WritingView';
import ProfileView from './components/ProfileView';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewID>('dashboard');
  const [user, setUser] = useState<{ name: string; studentId: string; cohort: string } | null>(() => {
    const saved = localStorage.getItem('hanyu_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: { name: string; studentId: string; cohort: string }) => {
    localStorage.setItem('hanyu_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('hanyu_user');
    setUser(null);
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <DashboardLayout currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={handleLogout}>
      {currentView === 'dashboard' && <DashboardView user={user} onViewChange={setCurrentView} />}
      {currentView === 'learn' && <LearnView />}
      {currentView === 'tutor' && <AITutorView user={user} />}
      {currentView === 'practice' && <PracticeView />}
      {currentView === 'vocabulary' && <VocabularyView />}
      {currentView === 'hsk' && <HSKView />}
      {currentView === 'progress' && <ProgressView user={user} />}
      {currentView === 'writing' && <WritingView />}
      {currentView === 'grammar' && (
        <div className="p-8 text-center text-slate-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Grammar Reference</h2>
          <p>Grammar lessons are integrated directly into our AI Tutor and Learn modules. Ask the AI Tutor any grammar question!</p>
        </div>
      )}
      {currentView === 'profile' && (
        <ProfileView
          user={user}
          onLogout={handleLogout}
          onUpdateUser={(updated) => {
            setUser(updated);
            localStorage.setItem('hanyu_user', JSON.stringify(updated));
          }}
        />
      )}
    </DashboardLayout>
  );
}