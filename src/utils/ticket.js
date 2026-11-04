// Ticket helpers. The QR code encodes a small JSON payload so the scanner works offline.

/** Unique, human-friendly ticket id, e.g. NXS-K3F9-82QD */
export function generateTicketId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alike characters
  const part = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NXS-${part(4)}-${part(4)}`;
}

/** Text that goes inside the QR code. */
export function encodeTicket(ticket) {
  return JSON.stringify({
    app: 'nexus',
    ticketId: ticket.id,
    event: ticket.eventTitle,
    date: ticket.eventDateISO,
    venue: ticket.venue,
    name: ticket.userName,
    email: ticket.userEmail,
    eventId: ticket.eventId,
  });
}

/** Parse scanned/pasted text. Returns the payload object or null if it isn't a Nexus ticket. */
export function decodeTicket(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    const data = JSON.parse(trimmed);
    if (data && data.app === 'nexus' && data.ticketId) return data;
  } catch {
    /* not JSON: maybe they pasted just the ticket id */
  }
  if (/^NXS-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(trimmed)) {
    return { app: 'nexus', ticketId: trimmed.toUpperCase() };
  }
  return null;
}
