import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { formatDate, formatTime, getEventEnd, getEventStart } from '../utils/dates';
import Countdown from '../components/Countdown';
import SeatsBadge from '../components/SeatsBadge';
import RegisterButton from '../components/RegisterButton';
import BookmarkButton from '../components/BookmarkButton';
import AddToCalendar from '../components/AddToCalendar';
import EventCard from '../components/EventCard';
import Icon from '../components/Icon';
import NotFound from './NotFound';

export default function EventDetails() {
  const { id } = useParams();
  const { getEvent, getClub, events } = useEvents();
  const event = getEvent(id);
  const [imgOk, setImgOk] = useState(true);

  if (!event) return <NotFound message="We couldn't find that event." />;

  const club = getClub(event.club);
  const start = getEventStart(event);
  const end = getEventEnd(event);
  const taken = event.capacity - event.seatsLeft;
  const pct = Math.round((taken / event.capacity) * 100);
  const related = events
    .filter((e) => e.id !== event.id && (e.club === event.club || e.tags.some((t) => event.tags.includes(t))))
    .slice(0, 3);

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`} aria-hidden="true" />
        {imgOk && event.poster && (
          <img src={event.poster} alt={`${event.title} poster`} onError={() => setImgOk(false)} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" aria-hidden="true" />
        <div className="container-page relative flex h-full flex-col justify-between py-5">
          <Link to="/events" className="glass inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-slate-800 dark:text-white">
            <Icon name="arrow-left" className="h-4 w-4" /> All events
          </Link>
          <div>
            <span className="chip bg-white/90 text-slate-800">{event.category}</span>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-5xl">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {club && (
            <Link to={`/clubs/${club.id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-soft">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${club.gradient} text-2xl`}>
                <span aria-hidden="true">{club.emoji}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organised by</p>
                <p className="font-bold text-slate-900 dark:text-white">{club.name}</p>
              </div>
              <Icon name="arrow" className="ml-auto h-4 w-4 text-slate-400" />
            </Link>
          )}

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">About this event</h2>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {event.tags.map((t) => (
                <span key={t} className="chip bg-brand-50 capitalize text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">#{t}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Starts in</h2>
            <Countdown event={event} variant="boxes" />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-5 p-5">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Icon name="calendar" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDate(start)}</p>
                  <p className="text-slate-500">{formatTime(start)} – {formatTime(end)}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Icon name="pin" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <p className="font-semibold text-slate-900 dark:text-white">{event.venue}</p>
              </li>
            </ul>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <SeatsBadge seatsLeft={event.seatsLeft} capacity={event.capacity} />
                <span className="text-xs text-slate-500">{taken}/{event.capacity} registered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Seats filled">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <RegisterButton event={event} full className="!py-3" />
            <AddToCalendar event={event} className="btn-secondary w-full" />
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
              <span className="text-slate-600 dark:text-slate-300">Save for later</span>
              <BookmarkButton eventId={event.id} />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-6">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
