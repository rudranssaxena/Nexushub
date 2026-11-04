import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import eventsData from '../data/events.json';
import clubsData from '../data/clubs.json';
import { KEYS, storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { generateTicketId, decodeTicket } from '../utils/ticket';
import { getEventStart, hasEnded } from '../utils/dates';

const EventsContext = createContext(null);

const EMPTY_STORE = { added: [], edited: {}, deleted: [] };
const loadStore = (key) => ({ ...EMPTY_STORE, ...storage.get(key, {}) });

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';
const uid = (name) => `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

/**
 * Overlay admin changes on the seed JSON: seed items can be edited or deleted, and new items added.
 * Keeping the seed data untouched means a "reset" is just clearing localStorage.
 */
function applyStore(seed, store) {
  const base = seed.filter((x) => !store.deleted.includes(x.id)).map((x) => store.edited[x.id] || x);
  return [...base, ...store.added];
}

/**
 * Holds events/clubs plus everything that changes: tickets, bookmarks, seats left and check-ins,
 * and the admin operations that create/edit/delete events and clubs.
 * All persisted to localStorage (there is no backend).
 */
export function EventsProvider({ children }) {
  const { user, isAdmin } = useAuth();

  const [tickets, setTickets] = useState(() => storage.get(KEYS.tickets, []));
  const [bookmarkMap, setBookmarkMap] = useState(() => storage.get(KEYS.bookmarks, {}));
  const [seatsTaken, setSeatsTaken] = useState(() => storage.get(KEYS.seatsTaken, {}));
  const [checkins, setCheckins] = useState(() => storage.get(KEYS.checkins, {}));
  const [eventStore, setEventStore] = useState(() => loadStore(KEYS.adminEvents));
  const [clubStore, setClubStore] = useState(() => loadStore(KEYS.adminClubs));

  const clubs = useMemo(() => applyStore(clubsData, clubStore), [clubStore]);

  // Events with the live seats-left figure applied.
  const events = useMemo(
    () =>
      applyStore(eventsData, eventStore).map((e) => ({
        ...e,
        seatsLeft: Math.max(0, e.seatsLeft - (seatsTaken[e.id] || 0)),
      })),
    [eventStore, seatsTaken]
  );

  const getEvent = useCallback((id) => events.find((e) => e.id === id), [events]);
  const getClub = useCallback((id) => clubs.find((c) => c.id === id), [clubs]);

  // ---- Tickets -------------------------------------------------------------
  const myTickets = useMemo(
    () => (user ? tickets.filter((t) => t.userEmail === user.email) : []),
    [tickets, user]
  );

  const getMyTicketForEvent = useCallback(
    (eventId) => myTickets.find((t) => t.eventId === eventId),
    [myTickets]
  );

  /** Register the signed-in user. Returns { ok, ticket?, error? } */
  const registerForEvent = useCallback(
    (eventId) => {
      if (!user) return { ok: false, error: 'Please sign in first.' };
      const event = events.find((e) => e.id === eventId);
      if (!event) return { ok: false, error: 'Event not found.' };
      if (hasEnded(event)) return { ok: false, error: 'This event has already ended.' };
      if (tickets.some((t) => t.eventId === eventId && t.userEmail === user.email))
        return { ok: false, error: 'You are already registered for this event.' };
      if (event.seatsLeft <= 0) return { ok: false, error: 'Sorry, this event is full.' };

      const ticket = {
        id: generateTicketId(),
        eventId: event.id,
        eventTitle: event.title,
        eventDateISO: getEventStart(event).toISOString(),
        venue: event.venue,
        clubId: event.club,
        userName: user.name,
        userEmail: user.email,
        issuedAt: new Date().toISOString(),
      };

      const nextTickets = [ticket, ...tickets];
      const nextSeats = { ...seatsTaken, [eventId]: (seatsTaken[eventId] || 0) + 1 };
      setTickets(nextTickets);
      setSeatsTaken(nextSeats);
      storage.set(KEYS.tickets, nextTickets);
      storage.set(KEYS.seatsTaken, nextSeats);
      return { ok: true, ticket };
    },
    [user, events, tickets, seatsTaken]
  );

  /** Remove a ticket and give the seat back. Shared by student cancel and admin remove. */
  const removeTicket = useCallback(
    (ticketId) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) return false;
      const nextTickets = tickets.filter((t) => t.id !== ticketId);
      const nextSeats = { ...seatsTaken, [ticket.eventId]: Math.max(0, (seatsTaken[ticket.eventId] || 0) - 1) };
      setTickets(nextTickets);
      setSeatsTaken(nextSeats);
      storage.set(KEYS.tickets, nextTickets);
      storage.set(KEYS.seatsTaken, nextSeats);
      if (checkins[ticketId]) {
        const { [ticketId]: _removed, ...rest } = checkins;
        setCheckins(rest);
        storage.set(KEYS.checkins, rest);
      }
      return true;
    },
    [tickets, seatsTaken, checkins]
  );

  /** Student cancels their own registration (not allowed once checked in). */
  const cancelRegistration = useCallback(
    (ticketId) => {
      if (checkins[ticketId]) return false;
      return removeTicket(ticketId);
    },
    [checkins, removeTicket]
  );

  // ---- Bookmarks -----------------------------------------------------------
  const bookmarkIds = useMemo(() => (user ? bookmarkMap[user.email] || [] : []), [bookmarkMap, user]);
  const isBookmarked = useCallback((id) => bookmarkIds.includes(id), [bookmarkIds]);

  const toggleBookmark = useCallback(
    (eventId) => {
      if (!user) return false;
      setBookmarkMap((prev) => {
        const cur = prev[user.email] || [];
        const next = {
          ...prev,
          [user.email]: cur.includes(eventId) ? cur.filter((x) => x !== eventId) : [...cur, eventId],
        };
        storage.set(KEYS.bookmarks, next);
        return next;
      });
      return true;
    },
    [user]
  );

  const bookmarkedEvents = useMemo(() => events.filter((e) => bookmarkIds.includes(e.id)), [events, bookmarkIds]);

  // ---- Check-in ------------------------------------------------------------
  const saveCheckins = (next) => {
    setCheckins(next);
    storage.set(KEYS.checkins, next);
  };

  /**
   * Validate scanned/pasted ticket text and check the attendee in.
   * Returns { status: 'success' | 'duplicate' | 'invalid', ticket?, checkedInAt? }
   */
  const checkIn = useCallback(
    (rawText) => {
      const payload = decodeTicket(rawText);
      if (!payload) return { status: 'invalid', message: "That doesn't look like a Nexus ticket." };

      const stored = tickets.find((t) => t.id === payload.ticketId);
      // Fall back to the QR payload so tickets issued on another device still scan.
      const ticket = stored || (payload.event ? {
        id: payload.ticketId,
        eventId: payload.eventId,
        eventTitle: payload.event,
        eventDateISO: payload.date,
        venue: payload.venue,
        userName: payload.name,
        userEmail: payload.email,
      } : null);

      if (!ticket) return { status: 'invalid', message: 'Ticket not found on this device.' };

      if (checkins[ticket.id]) {
        return { status: 'duplicate', ticket, checkedInAt: checkins[ticket.id] };
      }
      const at = new Date().toISOString();
      saveCheckins({ ...checkins, [ticket.id]: at });
      return { status: 'success', ticket, checkedInAt: at };
    },
    [tickets, checkins]
  );

  const isCheckedIn = useCallback((ticketId) => !!checkins[ticketId], [checkins]);

  // ---- Admin operations (all no-ops for non-admins) ---------------------------
  const guard = () => (isAdmin ? null : { ok: false, error: 'Admins only.' });

  const persistEvents = (updater) =>
    setEventStore((prev) => {
      const next = updater(prev);
      storage.set(KEYS.adminEvents, next);
      return next;
    });
  const persistClubs = (updater) =>
    setClubStore((prev) => {
      const next = updater(prev);
      storage.set(KEYS.adminClubs, next);
      return next;
    });

  /** `data.seatsLeft` is the number of seats open right now. */
  const addEvent = (data) => {
    const denied = guard();
    if (denied) return denied;
    const event = { ...data, id: uid(data.title) };
    persistEvents((prev) => ({ ...prev, added: [...prev.added, event] }));
    return { ok: true, event };
  };

  const updateEvent = (id, data) => {
    const denied = guard();
    if (denied) return denied;
    // The context subtracts online registrations from the stored figure, so add them back
    // here so the admin's "seats open now" number is what attendees will actually see.
    const event = { ...data, id, seatsLeft: Number(data.seatsLeft) + (seatsTaken[id] || 0) };
    persistEvents((prev) =>
      prev.added.some((e) => e.id === id)
        ? { ...prev, added: prev.added.map((e) => (e.id === id ? event : e)) }
        : { ...prev, edited: { ...prev.edited, [id]: event } }
    );
    return { ok: true, event };
  };

  const deleteEvent = (id) => {
    const denied = guard();
    if (denied) return denied;
    persistEvents((prev) => {
      const { [id]: _drop, ...edited } = prev.edited;
      return prev.added.some((e) => e.id === id)
        ? { ...prev, added: prev.added.filter((e) => e.id !== id), edited }
        : { ...prev, deleted: [...prev.deleted, id], edited };
    });
    // Drop its tickets and seat counter so nothing is left pointing at a missing event.
    const nextTickets = tickets.filter((t) => t.eventId !== id);
    const { [id]: _seats, ...nextSeats } = seatsTaken;
    const gone = new Set(tickets.filter((t) => t.eventId === id).map((t) => t.id));
    const nextCheckins = Object.fromEntries(Object.entries(checkins).filter(([k]) => !gone.has(k)));
    setTickets(nextTickets);
    setSeatsTaken(nextSeats);
    saveCheckins(nextCheckins);
    storage.set(KEYS.tickets, nextTickets);
    storage.set(KEYS.seatsTaken, nextSeats);
    return { ok: true };
  };

  const addClub = (data) => {
    const denied = guard();
    if (denied) return denied;
    const club = { ...data, id: uid(data.name) };
    persistClubs((prev) => ({ ...prev, added: [...prev.added, club] }));
    return { ok: true, club };
  };

  const updateClub = (id, data) => {
    const denied = guard();
    if (denied) return denied;
    const club = { ...data, id };
    persistClubs((prev) =>
      prev.added.some((c) => c.id === id)
        ? { ...prev, added: prev.added.map((c) => (c.id === id ? club : c)) }
        : { ...prev, edited: { ...prev.edited, [id]: club } }
    );
    return { ok: true, club };
  };

  const deleteClub = (id) => {
    const denied = guard();
    if (denied) return denied;
    if (events.some((e) => e.club === id))
      return { ok: false, error: 'This club still has events. Delete or move them first.' };
    persistClubs((prev) => {
      const { [id]: _drop, ...edited } = prev.edited;
      return prev.added.some((c) => c.id === id)
        ? { ...prev, added: prev.added.filter((c) => c.id !== id), edited }
        : { ...prev, deleted: [...prev.deleted, id], edited };
    });
    return { ok: true };
  };

  /** Manual check-in / undo from the registrations table. */
  const adminCheckIn = (ticketId) => {
    if (!isAdmin || checkins[ticketId]) return false;
    saveCheckins({ ...checkins, [ticketId]: new Date().toISOString() });
    return true;
  };
  const adminUndoCheckIn = (ticketId) => {
    if (!isAdmin || !checkins[ticketId]) return false;
    const { [ticketId]: _removed, ...rest } = checkins;
    saveCheckins(rest);
    return true;
  };
  const adminRemoveTicket = (ticketId) => (isAdmin ? removeTicket(ticketId) : false);

  const value = {
    events, clubs, getEvent, getClub,
    myTickets, getMyTicketForEvent, registerForEvent, cancelRegistration,
    bookmarkIds, isBookmarked, toggleBookmark, bookmarkedEvents,
    checkIn, isCheckedIn,
    // admin
    allTickets: tickets, checkins,
    addEvent, updateEvent, deleteEvent, addClub, updateClub, deleteClub,
    adminCheckIn, adminUndoCheckIn, adminRemoveTicket,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>');
  return ctx;
};
