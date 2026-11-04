// Date helpers. Seed events store a `dayOffset` (days from today) + `time`, so the demo
// always shows genuinely upcoming events no matter when it is opened. Events created or
// edited by an admin store an absolute `startISO` instead.

/** Real start Date of an event. */
export function getEventStart(event) {
  // Admin-created/edited events carry an absolute start time.
  if (event.startISO) return new Date(event.startISO);
  const [h, m] = event.time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setDate(d.getDate() + event.dayOffset);
  return d;
}

/** Real end Date of an event. */
export function getEventEnd(event) {
  return new Date(getEventStart(event).getTime() + event.durationHours * 3600 * 1000);
}

export const formatDate = (date, opts) =>
  date.toLocaleDateString('en-IN', opts || { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatTime = (date) =>
  date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

export const formatDateTime = (date) => `${formatDate(date)} · ${formatTime(date)}`;

/** True when the event starts within the next 7 days (and hasn't ended). */
export function isThisWeek(event) {
  const now = Date.now();
  const start = getEventStart(event).getTime();
  return getEventEnd(event).getTime() >= now && start - now <= 7 * 24 * 3600 * 1000;
}

/** True when the event is on the given yyyy-mm-dd date (local time). */
export function isOnDate(event, yyyyMmDd) {
  if (!yyyyMmDd) return true;
  const d = getEventStart(event);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === yyyyMmDd;
}

export const hasEnded = (event) => getEventEnd(event).getTime() < Date.now();

/** Break a millisecond difference into d/h/m/s parts. */
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total === 0,
  };
}
