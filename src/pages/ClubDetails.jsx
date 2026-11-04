import { Link, useParams } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { getEventStart, hasEnded } from '../utils/dates';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import NotFound from './NotFound';

export default function ClubDetails() {
  const { id } = useParams();
  const { getClub, events } = useEvents();
  const club = getClub(id);

  if (!club) return <NotFound message="We couldn't find that club." />;

  const clubEvents = events
    .filter((e) => e.club === club.id && !hasEnded(e))
    .sort((a, b) => getEventStart(a) - getEventStart(b));

  return (
    <div>
      <div className={`bg-gradient-to-br ${club.gradient}`}>
        <div className="container-page py-12 text-white sm:py-16">
          <Link to="/clubs" className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30">
            <Icon name="arrow-left" className="h-4 w-4" /> All clubs
          </Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white text-5xl shadow-xl" aria-hidden="true">
              {club.emoji}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold sm:text-5xl">{club.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90">
                <span className="inline-flex items-center gap-1.5"><Icon name="users" className="h-4 w-4" /> {club.members} members</span>
                <span>{club.category}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <section className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">About</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{club.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {club.tags.map((t) => (
              <span key={t} className="chip bg-brand-50 capitalize text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">#{t}</span>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Upcoming events by {club.name}</h2>
          {clubEvents.length === 0 ? (
            <EmptyState icon="calendar" title="No upcoming events">Check back soon for new events from this club.</EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clubEvents.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
