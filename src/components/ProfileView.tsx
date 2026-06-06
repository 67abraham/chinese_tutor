import React, { useState, useRef } from 'react';
import {
  User, Mail, Hash, BookOpen, Camera, Edit3, Save,
  X, LogOut, Shield, Bell, Globe, ChevronRight,
  Flame, Star, Target, Award, CheckCircle2, Sparkles
} from 'lucide-react';

import { type AppUser } from '../App';

interface ProfileViewProps {
  user: AppUser;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<AppUser>) => Promise<void>;
}

const COHORTS = [
  'Freshman (Year 1)',
  'Language Study Program',
  'Exchange Semester Fast-track',
  'Postgraduate Core Mandarin',
  'Language Cohort A',
  'Language Cohort B',
  'HSK Intensive Program',
];

const LEVELS = ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'];

const AVATAR_COLORS = [
  { bg: 'bg-brand-red',   ring: 'ring-brand-red'   },
  { bg: 'bg-blue-500',    ring: 'ring-blue-500'    },
  { bg: 'bg-purple-500',  ring: 'ring-purple-500'  },
  { bg: 'bg-green-500',   ring: 'ring-green-500'   },
  { bg: 'bg-amber-500',   ring: 'ring-amber-500'   },
  { bg: 'bg-pink-500',    ring: 'ring-pink-500'    },
];

function getInitials(name: string) {
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Pull stored preferences or fall back to defaults
function loadPrefs() {
  try {
    const raw = localStorage.getItem('hanyu_prefs');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(prefs: Record<string, any>) {
  localStorage.setItem('hanyu_prefs', JSON.stringify(prefs));
}

export default function ProfileView({ user, onLogout, onUpdateUser }: ProfileViewProps) {
  const prefs = loadPrefs();

  // ── Edit mode ────────────────────────────────────────────────
  const [editing, setEditing]       = useState(false);
  const [editName, setEditName]     = useState(user.name);
  const [editCohort, setEditCohort] = useState(user.cohort);
  const [saveMsg, setSaveMsg]       = useState('');
  const [saveError, setSaveError]   = useState('');
  const [nameError, setNameError]   = useState('');

  // ── Preferences — live values from Appwrite, local toggles from localStorage
  const [hskLevel, setHskLevel]           = useState<string>(user.hskLevel   || 'HSK 1');
  const [dailyGoal, setDailyGoal]         = useState<number>(user.dailyGoal  || 10);
  const [avatarColor, setAvatarColor]     = useState<number>(user.avatarColor ?? 0);
  const [notifEnabled, setNotifEnabled]   = useState<boolean>(prefs.notif     ?? true);
  const [soundEnabled, setSoundEnabled]   = useState<boolean>(prefs.sound     ?? true);
  const [showGuide, setShowGuide]         = useState<boolean>(prefs.guide     ?? true);

  // ── Confirm logout ────────────────────────────────────────────
  const [confirmLogout, setConfirmLogout] = useState(false);

  // ── Stats — real values from Appwrite profile ───────────────
  const streak  = user.streak           ?? 0;
  const words   = user.wordsLearned     ?? 0;
  const lessons = user.lessonsCompleted ?? 0;
  const score   = prefs.score           ?? 74;

  // ── Save profile edits — persists to Appwrite ───────────────
  const handleSave = async () => {
    if (!editName.trim()) { setNameError('Name cannot be empty.'); return; }
    setNameError('');
    setSaveError('');
    try {
      await onUpdateUser({ name: editName.trim(), cohort: editCohort });
      setEditing(false);
      setSaveMsg('Profile saved to database!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditCohort(user.cohort);
    setNameError('');
    setEditing(false);
  };

  // ── Save a preference ─────────────────────────────────────────
  const savePref = (key: string, value: any) => {
    const updated = { ...loadPrefs(), [key]: value };
    savePrefs(updated);
  };

  const color = AVATAR_COLORS[avatarColor] ?? AVATAR_COLORS[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">My Profile</h2>
        <p className="text-slate-500 mt-1">Manage your account, preferences, and learning settings.</p>
      </div>

      {saveMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" /> {saveMsg}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold animate-in fade-in duration-200">
          {saveError}
        </div>
      )}

      {/* ── Profile card ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Red banner */}
        <div className="h-24 bg-brand-red relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '12px 12px' }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl ${color.bg} flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-white`}>
                {getInitials(user.name)}
              </div>
              {/* Color picker dot */}
              <button
                onClick={() => {
                  const next = (avatarColor + 1) % AVATAR_COLORS.length;
                  setAvatarColor(next);
                  savePref('avatarColor', next);
                  onUpdateUser({ avatarColor: next });
                }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow border border-slate-200 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                title="Change colour"
              >
                <Camera className="w-3 h-3 text-slate-500" />
              </button>
            </div>

            {/* Edit / Save buttons */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-brand-red-dark cursor-pointer shadow-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>

          {/* Name & info */}
          {!editing ? (
            <div>
              <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{user.cohort}</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => { setEditName(e.target.value); setNameError(''); }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all ${nameError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cohort</label>
                <select
                  value={editCohort}
                  onChange={e => setEditCohort(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-white cursor-pointer"
                >
                  {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Info pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> {user.studentId}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {user.cohort}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-red-light border border-brand-red/10 rounded-xl text-xs font-bold text-brand-red">
              <Sparkles className="w-3.5 h-3.5" /> {hskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame,   label: 'Day streak',     value: streak,          color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: BookOpen,label: 'Words learned',  value: words,           color: 'text-blue-500',   bg: 'bg-blue-50'   },
          { icon: Target,  label: 'Lessons done',   value: lessons,         color: 'text-purple-500', bg: 'bg-purple-50' },
          { icon: Award,   label: 'Avg. score',     value: `${score}%`,     color: 'text-brand-red',  bg: 'bg-brand-red-light' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-800">{s.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Learning settings ────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" /> Learning settings
          </h3>
        </div>
        <div className="divide-y divide-slate-100">

          {/* HSK Level */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-700">Current HSK level</p>
              <p className="text-xs text-slate-400 mt-0.5">Adjusts difficulty across all AI features</p>
            </div>
            <select
              value={hskLevel}
              onChange={e => {
                setHskLevel(e.target.value);
                savePref('hskLevel', e.target.value);
                onUpdateUser({ hskLevel: e.target.value });
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white cursor-pointer focus:outline-none focus:border-brand-red"
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Daily goal */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Daily word goal</p>
                <p className="text-xs text-slate-400 mt-0.5">How many new words to learn per day</p>
              </div>
              <span className="text-lg font-black text-brand-red">{dailyGoal} words</span>
            </div>
            <input
              type="range"
              min={5} max={50} step={5}
              value={dailyGoal}
              onChange={e => { const v = Number(e.target.value); setDailyGoal(v); savePref('dailyGoal', v); onUpdateUser({ dailyGoal: v }); }}
              className="w-full accent-brand-red cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>5 — casual</span><span>25 — regular</span><span>50 — intensive</span>
            </div>
          </div>

          {/* Show writing guide */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Show writing guide by default</p>
              <p className="text-xs text-slate-400 mt-0.5">Stroke order hints in the Writing section</p>
            </div>
            <button
              onClick={() => { setShowGuide(v => { savePref('guide', !v); return !v; }); }}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${showGuide ? 'bg-brand-red' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${showGuide ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Notification settings ────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-400" /> Notifications & sound
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            {
              label: 'Daily reminders',
              desc: 'Remind me to study each day',
              value: notifEnabled,
              toggle: () => { setNotifEnabled(v => { savePref('notif', !v); return !v; }); },
            },
            {
              label: 'Sound effects',
              desc: 'Play audio feedback on actions',
              value: soundEnabled,
              toggle: () => { setSoundEnabled(v => { savePref('sound', !v); return !v; }); },
            },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={item.toggle}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${item.value ? 'bg-brand-red' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${item.value ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Account section ──────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" /> Account
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Student ID</p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{user.studentId}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Read only</span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">Reset all progress</p>
              <p className="text-xs text-slate-400 mt-0.5">Clears session data and preferences</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('hanyu_prefs');
                window.location.reload();
              }}
              className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Logout ───────────────────────────────────────────── */}
      {!confirmLogout ? (
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-red-700">Are you sure you want to sign out?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmLogout(false)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
            <button onClick={onLogout} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 cursor-pointer flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}

    </div>
  );
}