import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import eventsData from '../data/events.json';
import clubsData from '../data/clubs.json';
import { KEYS, storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { generateTicketId, decodeTicket } from '../utils/ticket';
import { getEventStart, hasEnded } from '../utils/dates';

const EventsContext = createContext(null);

/**
 * Holds events/clubs plus everything that changes: tickets, bookmarks, seats left and check-ins.
 * All persisted to localStorage (there is no backend).
 */
export function EventsProvider({ children }) {
  const { user } = useAuth();

  const [tickets, setTickets] = useState(() => storage.get(KEYS.tickets, []));
  const [bookmarkMap, setBookmarkMap] = useState(() => storage.get(KEYS.bookmarks, {}));
  const [seatsTaken, setSeatsTaken] = useState(() => storage.get(KEYS.seatsTaken, {}));
  const [checkins, setCheckins] = useState(() => storage.get(KEYS.checkins, {}));

  const clubs = clubsData;

  // Events with the live seats-left figure applied.
  const events = useMemo(
    () =>
      eventsData.map((e) => ({
        ...e,
        seatsLeft: Math.max(0, e.seatsLeft - (seatsTaken[e.id] || 0)),
      })),
    [seatsTaken]
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

  /** Cancel a registration and give the seat back (unless already checked in). */
  const cancelRegistration = useCallback(
    (ticketId) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket || checkins[ticketId]) return false;
      const nextTickets = tickets.filter((t) => t.id !== ticketId);
      const nextSeats = { ...seatsTaken, [ticket.eventId]: Math.max(0, (seatsTaken[ticket.eventId] || 0) - 1) };
      setTickets(nextTickets);
      setSeatsTaken(nextSeats);
      storage.set(KEYS.tickets, nextTickets);
      storage.set(KEYS.seatsTaken, nextSeats);
      return true;
    },
    [tickets, seatsTaken, checkins]
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
      const next = { ...checkins, [ticket.id]: at };
      setCheckins(next);
      storage.set(KEYS.checkins, next);
      return { status: 'success', ticket, checkedInAt: at };
    },
    [tickets, checkins]
  );

  const isCheckedIn = useCallback((ticketId) => !!checkins[ticketId], [checkins]);

  const value = useMemo(
    () => ({
      events, clubs, getEvent, getClub,
      myTickets, getMyTicketForEvent, registerForEvent, cancelRegistration,
      bookmarkIds, isBookmarked, toggleBookmark, bookmarkedEvents,
      checkIn, isCheckedIn,
    }),
    [events, clubs, getEvent, getClub, myTickets, getMyTicketForEvent, registerForEvent,
     cancelRegistration, bookmarkIds, isBookmarked, toggleBookmark, bookmarkedEvents, checkIn, isCheckedIn]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>');
  return ctx;
};
