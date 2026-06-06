import { useState, useEffect } from 'react';
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
import { type AuthUser, restoreSession, logoutUser, tickStreak, updateProfile } from './lib/appwrite';

// Shape passed down to child components (subset of AuthUser for convenience)
export interface AppUser {
  id: string;
  email: string;
  name: string;
  studentId: string;
  cohort: string;
  hskLevel: string;
  dailyGoal: number;
  avatarColor: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
}

function toAppUser(auth: AuthUser): AppUser {
  return {
    id:               auth.id,
    email:            auth.email,
    name:             auth.profile.name,
    studentId:        auth.profile.studentId,
    cohort:           auth.profile.cohort,
    hskLevel:         auth.profile.hskLevel,
    dailyGoal:        auth.profile.dailyGoal,
    avatarColor:      auth.profile.avatarColor,
    streak:           auth.profile.streak,
    wordsLearned:     auth.profile.wordsLearned,
    lessonsCompleted: auth.profile.lessonsCompleted,
  };
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewID>('dashboard');
  const [user, setUser]               = useState<AppUser | null>(null);
  const [authUser, setAuthUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading]         = useState(true); // restoring session

  // ── Restore Appwrite session on mount ────────────────────────
  useEffect(() => {
    restoreSession().then(async (auth) => {
      if (auth) {
        // Tick streak on daily open
        const newStreak = await tickStreak(auth.id, auth.profile).catch(() => auth.profile.streak);
        auth.profile.streak = newStreak;
        setAuthUser(auth);
        setUser(toAppUser(auth));
      }
    }).catch(() => {
      // No session — show login
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // ── Login (called by LoginScreen after register or sign-in) ──
  const handleLogin = async (auth: AuthUser) => {
    const newStreak = await tickStreak(auth.id, auth.profile).catch(() => auth.profile.streak);
    auth.profile.streak = newStreak;
    setAuthUser(auth);
    setUser(toAppUser(auth));
  };

  // ── Logout ───────────────────────────────────────────────────
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setAuthUser(null);
  };

  // ── Update user profile (called by ProfileView on save) ──────
  const handleUpdateUser = async (updates: Partial<AppUser>) => {
    if (!authUser) return;
    try {
      await updateProfile(authUser.id, updates);
      setUser(prev => prev ? { ...prev, ...updates } : prev);
      setAuthUser(prev => prev
        ? { ...prev, profile: { ...prev.profile, ...updates } }
        : prev
      );
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // ── Loading splash ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 bg-brand-red rounded-2xl flex items-center justify-center text-white font-chinese font-bold text-3xl shadow-lg animate-pulse">
          汉
        </div>
        <p className="text-sm text-slate-400 font-medium">Restoring your session...</p>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <DashboardLayout currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={handleLogout}>
      {currentView === 'dashboard'  && <DashboardView user={user} onViewChange={setCurrentView} />}
      {currentView === 'learn'      && <LearnView />}
      {currentView === 'tutor'      && <AITutorView user={user} />}
      {currentView === 'practice'   && <PracticeView />}
      {currentView === 'vocabulary' && <VocabularyView />}
      {currentView === 'hsk'        && <HSKView />}
      {currentView === 'progress'   && <ProgressView user={user} />}
      {currentView === 'writing'    && <WritingView />}
      {currentView === 'grammar'    && (
        <div className="p-8 text-center text-slate-500">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Grammar Reference</h2>
          <p>Grammar lessons are integrated directly into our AI Tutor and Learn modules.</p>
        </div>
      )}
      {currentView === 'profile' && (
        <ProfileView
          user={user}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </DashboardLayout>
  );
}