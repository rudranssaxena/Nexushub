// Builds a pre-filled "Add to Google Calendar" link for an event.
import { getEventStart, getEventEnd } from './dates';

// Google wants UTC timestamps like 20261104T093000Z
const toGCal = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarUrl(event, clubName = '') {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGCal(getEventStart(event))}/${toGCal(getEventEnd(event))}`,
    details: `${event.description}${clubName ? `\n\nOrganised by ${clubName} via Nexus: Club & Event Hub.` : ''}`,
    location: event.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
