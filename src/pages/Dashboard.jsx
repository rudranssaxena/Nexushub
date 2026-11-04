import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { recommendEvents, INTERESTS, scoreEvent } from '../utils/recommend';
import EventCard from '../components/EventCard';
import TicketCard from '../components/TicketCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';

/** Signed-in home: profile, interests, recommendations, My Tickets and saved events. */
export default function Dashboard() {
  const { user, interests, saveInterests } = useAuth();
  const { events, myTickets, bookmarkedEvents, isCheckedIn } = useEvents();

  const recommended = recommendEvents(events, interests, 3);
  const attended = myTickets.filter((t) => isCheckedIn(t.id)).length;

  const toggleInterest = (id) =>
    saveInterests(interests.includes(id) ? interests.filter((x) => x !== id) : [...interests, id]);

  const stats = [
    ['Registered', myTickets.length, 'ticket'],
    ['Saved', bookmarkedEvents.length, 'bookmark'],
    ['Attended', attended, 'check-circle'],
  ];

  return (
    <div className="container-page py-10">
      {/* Profile header */}
      <div className="glass flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center">
        <img src={user.avatar} alt={`${user.name}'s avatar`} className="h-20 w-20 rounded-full shadow-lg ring-4 ring-white dark:ring-white/10" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">Welcome back 👋</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <dl className="grid grid-cols-3 gap-3">
          {stats.map(([label, value, icon]) => (
            <div key={label} className="rounded-2xl bg-white/70 px-4 py-3 text-center dark:bg-white/5">
              <dt className="flex items-center justify-center gap-1 text-xs text-slate-500">
                <Icon name={icon} className="h-3.5 w-3.5" /> {label}
              </dt>
              <dd className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Interests */}
      <section className="mt-8" aria-labelledby="interests-h">
        <h2 id="interests-h" className="text-sm font-bold uppercase tracking-wider text-slate-500">Your interests</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Your interests">
          {INTERESTS.map((i) => {
            const on = interests.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(i.id)}
                className={`chip !px-3.5 !py-2 text-sm transition ${
                  on
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10'
                }`}
              >
                <span aria-hidden="true">{i.emoji}</span> {i.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Recommended */}
      <section className="mt-12" aria-labelledby="rec-h">
        <h2 id="rec-h" className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Icon name="sparkles" className="h-6 w-6 text-brand-500" /> Recommended for you
        </h2>
        <div className="mt-6">
          {interests.length === 0 ? (
            <EmptyState icon="sparkles" title="Pick some interests">
              Select a few interests above and we'll recommend events that match.
            </EmptyState>
          ) : recommended.length === 0 ? (
            <EmptyState icon="calendar" title="Nothing matches yet" action={<Link to="/events" className="btn-primary">Browse all events</Link>}>
              No upcoming events match your interests right now.
            </EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((e, i) => {
                const n = scoreEvent(e, interests);
                return <EventCard key={e.id} event={e} index={i} reason={`${n} interest match${n > 1 ? 'es' : ''}`} />;
              })}
            </div>
          )}
        </div>
      </section>

      {/* My Tickets (the user's registered events) */}
      <section id="tickets" className="mt-14 scroll-mt-24" aria-labelledby="tickets-h">
        <h2 id="tickets-h" className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Icon name="ticket" className="h-6 w-6 text-brand-500" /> My Tickets
        </h2>
        <div className="mt-6">
          {myTickets.length === 0 ? (
            <EmptyState icon="ticket" title="No tickets yet" action={<Link to="/events" className="btn-primary">Find an event</Link>}>
              Register for an event and your QR ticket will show up here.
            </EmptyState>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {myTickets.map((t) => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Saved events */}
      <section className="mt-14" aria-labelledby="saved-h">
        <h2 id="saved-h" className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Icon name="bookmark" className="h-6 w-6 text-brand-500" /> Saved events
        </h2>
        <div className="mt-6">
          {bookmarkedEvents.length === 0 ? (
            <EmptyState icon="bookmark" title="Nothing saved" action={<Link to="/events" className="btn-primary">Browse events</Link>}>
              Tap the bookmark icon on any event to keep it here.
            </EmptyState>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarkedEvents.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
