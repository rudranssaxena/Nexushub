// Tiny safe wrappers around localStorage (it can throw in private mode / when blocked).
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore quota / privacy errors */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

// All localStorage keys used by the app, in one place.
export const KEYS = {
  user: 'nexus_user',
  theme: 'nexus_theme',
  tickets: 'nexus_tickets', // every ticket issued on this device
  bookmarks: 'nexus_bookmarks', // { [email]: eventId[] }
  interests: 'nexus_interests', // { [email]: string[] }
  checkins: 'nexus_checkins', // { [ticketId]: ISO timestamp }
  seatsTaken: 'nexus_seats_taken', // { [eventId]: number }
};
