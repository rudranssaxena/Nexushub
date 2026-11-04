import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEvents } from '../context/EventsContext';
import { formatDate, formatTime, getEventStart } from '../utils/dates';
import SeatsBadge from './SeatsBadge';
import Countdown from './Countdown';
import RegisterButton from './RegisterButton';
import BookmarkButton from './BookmarkButton';
import AddToCalendar from './AddToCalendar';
import Icon from './Icon';

/** Event tile used in grids on Landing, Events, Dashboard and Club pages. */
export default function EventCard({ event, index = 0, reason }) {
  const { getClub } = useEvents();
  const club = getClub(event.club);
  const start = getEventStart(event);
  const [imgOk, setImgOk] = useState(true);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05 }}
      whileHover={{ y: -6 }}
      className="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-soft"
    >
      {/* Poster */}
      <Link to={`/events/${event.id}`} className="relative block aspect-[16/10] overflow-hidden" aria-label={`View ${event.title}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`} aria-hidden="true" />
        {imgOk && (
          <img
            src={event.poster}
            alt={`${event.title} poster`}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" aria-hidden="true" />
        <span className="chip absolute left-3 top-3 bg-white/90 text-slate-800 backdrop-blur">{event.category}</span>
        {reason && (
          <span className="chip absolute bottom-3 left-3 bg-brand-600/90 text-white backdrop-blur">
            <Icon name="sparkles" className="h-3.5 w-3.5" /> {reason}
          </span>
        )}
      </Link>
      <BookmarkButton eventId={event.id} className="absolute right-3 top-3 z-10" />

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {club && (
          <Link
            to={`/clubs/${club.id}`}
            className="mb-1 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            <span aria-hidden="true">{club.emoji}</span> {club.name}
          </Link>
        )}
        <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white">
          <Link to={`/events/${event.id}`} className="hover:text-brand-600 dark:hover:text-brand-300">
            {event.title}
          </Link>
        </h3>

        <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <Icon name="calendar" className="h-4 w-4 shrink-0" />
            {formatDate(start, { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(start)}
          </li>
          <li className="flex items-center gap-2">
            <Icon name="pin" className="h-4 w-4 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </li>
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <SeatsBadge seatsLeft={event.seatsLeft} capacity={event.capacity} />
          <Countdown event={event} />
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <RegisterButton event={event} className="flex-1 !py-2" />
          <AddToCalendar event={event} className="btn-secondary !px-3 !py-2" short />
        </div>
      </div>
    </motion.article>
  );
}
