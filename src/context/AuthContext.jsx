import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { KEYS, storage } from '../utils/storage';
import { makeAvatar } from '../utils/avatar';

const AuthContext = createContext(null);

// The "Google account" every mock sign-in returns.
const MOCK_PROFILE = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@college.edu',
};

/**
 * Mock Google auth. `signIn()` stores a fake profile in localStorage; there is no real OAuth.
 * Interests (used for "For You") are stored per-user so a returning user skips onboarding.
 * Also owns the sign-in modal's open/closed state so any page can ask the user to sign in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get(KEYS.user, null));
  const [interestsMap, setInterestsMap] = useState(() => storage.get(KEYS.interests, {}));
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const signIn = useCallback(() => {
    // Simulate the Google popup round-trip.
    return new Promise((resolve) => {
      setTimeout(() => {
        const profile = { ...MOCK_PROFILE, avatar: makeAvatar(MOCK_PROFILE.name) };
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

  const interests = user ? interestsMap[user.email] || null : null;
  // First login = this user has never picked interests.
  const needsOnboarding = !!user && interests === null;

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
      signIn,
      signOut,
      interests: interests || [],
      needsOnboarding,
      saveInterests,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [user, signIn, signOut, interests, needsOnboarding, saveInterests, authModalOpen, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
