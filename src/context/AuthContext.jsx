import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { KEYS, storage } from '../utils/storage';
import { makeAvatar } from '../utils/avatar';

const AuthContext = createContext(null);

// The "Google accounts" a mock sign-in can return.
const MOCK_PROFILES = {
  student: { name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', role: 'student' },
  admin: { name: 'Campus Admin', email: 'admin@college.edu', role: 'admin' },
};

/**
 * Mock Google auth. `signIn(role)` stores a fake profile in localStorage; there is no real OAuth.
 * `role` is 'student' (default) or 'admin'. Admins get the /admin panel.
 * Interests (used for "For You") are stored per-user so a returning student skips onboarding.
 * Also owns the sign-in modal's open/closed state so any page can ask the user to sign in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(KEYS.user, null));
  const [interestsMap, setInterestsMap] = useState(() => storage.get(KEYS.interests, {}));
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const signIn = useCallback((role = 'student') => {
    // Simulate the Google popup round-trip.
    return new Promise((resolve) => {
      setTimeout(() => {
        const base = MOCK_PROFILES[role] || MOCK_PROFILES.student;
        const profile = { ...base, avatar: makeAvatar(base.name) };
        storage.set(KEYS.user, profile);
        setUser(profile);
        setAuthModalOpen(false);
        resolve(profile);
      }, 700);
    });
  }, []);

  const signOut = useCallback(() => {
    storage.remove(KEYS.user);
    setUser(null);
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const isAdmin = user?.role === 'admin';
  const interests = user ? interestsMap[user.email] || null : null;
  // First login = this student has never picked interests (admins skip onboarding).
  const needsOnboarding = !!user && !isAdmin && interests === null;

  const saveInterests = useCallback(
    (list) => {
      if (!user) return;
      setInterestsMap((prev) => {
        const next = { ...prev, [user.email]: list };
        storage.set(KEYS.interests, next);
        return next;
      });
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin,
      signIn,
      signOut,
      interests: interests || [],
      needsOnboarding,
      saveInterests,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [user, isAdmin, signIn, signOut, interests, needsOnboarding, saveInterests, authModalOpen, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
