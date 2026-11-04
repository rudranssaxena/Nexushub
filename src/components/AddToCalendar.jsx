import { googleCalendarUrl } from '../utils/calendar';
import { useEvents } from '../context/EventsContext';
import Icon from './Icon';

/** Opens Google Calendar with the event pre-filled. */
export default function AddToCalendar({ event, className = 'btn-secondary', short = false }) {
  const { getClub } = useEvents();
  const club = getClub(event.club);
  return (
    <a
      href={googleCalendarUrl(event, club?.name)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`Add ${event.title} to Google Calendar`}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon name="calendar-plus" className="h-4 w-4" />
      {short ? 'Calendar' : 'Add to Google Calendar'}
    </a>
  );
}
