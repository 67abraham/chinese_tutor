import { Client, Account, Databases, ID, AppwriteException } from 'appwrite';

// ─── Config ───────────────────────────────────────────────────────────────────
const APPWRITE_ENDPOINT   = import.meta.env.VITE_APPWRITE_ENDPOINT   || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const DATABASE_ID         = import.meta.env.VITE_APPWRITE_DATABASE_ID    || '';
const COLLECTION_ID       = import.meta.env.VITE_APPWRITE_COLLECTION_ID  || '';

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account   = new Account(client);
export const databases = new Databases(client);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  studentId: string;
  cohort: string;
  hskLevel: string;
  dailyGoal: number;
  avatarColor: number;
  streak: number;
  wordsLearned: number;
  lessonsCompleted: number;
  lastActiveAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultProfile(name: string, studentId = '', cohort = 'Freshman (Year 1)'): UserProfile {
  return {
    name,
    studentId,
    cohort,
    hskLevel:         'HSK 1',
    dailyGoal:        10,
    avatarColor:      0,
    streak:           0,
    wordsLearned:     0,
    lessonsCompleted: 0,
    lastActiveAt:     todayISO(),
  };
}

function docToProfile(doc: Record<string, any>): UserProfile {
  return {
    name:             doc.name             ?? '',
    studentId:        doc.studentId        ?? '',
    cohort:           doc.cohort           ?? 'Freshman (Year 1)',
    hskLevel:         doc.hskLevel         ?? 'HSK 1',
    dailyGoal:        doc.dailyGoal        ?? 10,
    avatarColor:      doc.avatarColor      ?? 0,
    streak:           doc.streak           ?? 0,
    wordsLearned:     doc.wordsLearned     ?? 0,
    lessonsCompleted: doc.lessonsCompleted ?? 0,
    lastActiveAt:     doc.lastActiveAt     ?? todayISO(),
  };
}

// Safely extract a human-readable message from any Appwrite error
function parseError(err: unknown): string {
  if (err instanceof AppwriteException) {
    const code = err.code;
    const msg  = err.message ?? '';
    if (code === 401 || msg.toLowerCase().includes('invalid credentials')) {
      return 'Incorrect email or password.';
    }
    if (code === 409 || msg.toLowerCase().includes('already exists')) {
      return 'An account with this email already exists.';
    }
    if (code === 400 || msg.toLowerCase().includes('password')) {
      return 'Password must be at least 8 characters.';
    }
    if (msg) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
}

// ─── Get or create profile ────────────────────────────────────────────────────
async function getOrCreateProfile(userId: string, fallbackName: string): Promise<UserProfile> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
    return docToProfile(doc);
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 404) {
      // User exists in Auth but has no profile doc — create one now
      const profile = defaultProfile(fallbackName);
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, profile);
      } catch (createErr) {
        console.warn('[Appwrite] Could not create profile doc:', createErr);
      }
      return profile;
    }
    throw err;
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────
export async function registerUser(
  email: string,
  password: string,
  name: string,
  studentId: string,
  cohort: string
): Promise<AuthUser> {
  try {
    // 1. Create Appwrite auth account
    const acct = await account.create(ID.unique(), email, password, name);

    // 2. Open a session immediately
    await account.createEmailPasswordSession(email, password);

    // 3. Create the profile document
    const profile = defaultProfile(name, studentId, cohort);
    try {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, acct.$id, profile);
    } catch (dbErr) {
      console.warn('[Appwrite] Profile doc creation failed (DB may not be set up yet):', dbErr);
    }

    return { id: acct.$id, email: acct.email, profile };
  } catch (err) {
    throw new Error(parseError(err));
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<AuthUser> {
  try {
    // Delete any stale session first to avoid "session already active" errors
    try { await account.deleteSession('current'); } catch { /* no active session — fine */ }

    await account.createEmailPasswordSession(email, password);
    const acct    = await account.get();
    const profile = await getOrCreateProfile(acct.$id, acct.name);
    return { id: acct.$id, email: acct.email, profile };
  } catch (err) {
    throw new Error(parseError(err));
  }
}

// ─── Restore session ──────────────────────────────────────────────────────────
export async function restoreSession(): Promise<AuthUser | null> {
  try {
    const acct    = await account.get();
    const profile = await getOrCreateProfile(acct.$id, acct.name);
    return { id: acct.$id, email: acct.email, profile };
  } catch {
    return null;
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch {
    // Already expired
  }
}

// ─── Update profile ───────────────────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      userId,
      { ...updates, lastActiveAt: todayISO() }
    );
    return docToProfile(doc);
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 404) {
      // Document missing — create it
      const profile = { ...defaultProfile(''), ...updates, lastActiveAt: todayISO() };
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, profile);
      return profile;
    }
    throw err;
  }
}

// ─── Streak helper ────────────────────────────────────────────────────────────
export async function tickStreak(userId: string, profile: UserProfile): Promise<number> {
  const today     = todayISO();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (profile.lastActiveAt === today) return profile.streak;

  const newStreak = profile.lastActiveAt === yesterday ? profile.streak + 1 : 1;

  try {
    await updateProfile(userId, { streak: newStreak, lastActiveAt: today });
  } catch {
    // Don't block login if streak update fails
  }
  return newStreak;
}