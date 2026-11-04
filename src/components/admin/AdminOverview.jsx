import { Link } from 'react-router-dom';
import { useEvents } from '../../context/EventsContext';
import { getEventStart, hasEnded } from '../../utils/dates';
import Icon from '../Icon';

/** Admin tab: headline numbers plus simple bar charts built with plain divs. */
export default function AdminOverview() {
  const { events, clubs, allTickets, checkins } = useEvents();

  const upcoming = events.filter((e) => !hasEnded(e)).sort((a, b) => getEventStart(a) - getEventStart(b));
  const checkedIn = allTickets.filter((t) => checkins[t.id]).length;
  const rate = allTickets.length ? Math.round((checkedIn / allTickets.length) * 100) : 0;
  const totalSeats = upcoming.reduce((n, e) => n + e.capacity, 0);
  const filledSeats = upcoming.reduce((n, e) => n + (e.capacity - e.seatsLeft), 0);
  const fill = totalSeats ? Math.round((filledSeats / totalSeats) * 100) : 0;

  const stats = [
    ['Upcoming events', upcoming.length, 'calendar', `${events.length} total`],
    ['Clubs', clubs.length, 'users', `${clubs.reduce((n, c) => n + c.members, 0)} members`],
    ['Registrations', allTickets.length, 'ticket', 'in this browser'],
    ['Check-in rate', `${rate}%`, 'check-circle', `${checkedIn} checked in`],
    ['Seats filled', `${fill}%`, 'chart', `${filledSeats}/${totalSeats} upcoming`],
  ];

  const topClubs = [...clubs].sort((a, b) => b.members - a.members).slice(0, 6);
  const maxMembers = Math.max(1, ...topClubs.map((c) => c.members));

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, value, icon, sub]) => (
          <div key={label} className="card p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Icon name={icon} className="h-4 w-4 text-brand-500" /> {label}
            </dt>
            <dd className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{value}</dd>
            <dd className="text-xs text-slate-500">{sub}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="fill-h">
          <h3 id="fill-h" className="font-bold text-slate-900 dark:text-white">Seats filled by upcoming event</h3>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No upcoming events.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {upcoming.slice(0, 8).map((e) => {
                const filled = e.capacity - e.seatsLeft;
                const pct = Math.round((filled / e.capacity) * 100);
                return (
                  <li key={e.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">{e.title}</span>
                      <span className="shrink-0 text-xs text-slate-500">{filled}/{e.capacity}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${e.title} seats filled`}>
                      <div className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-500 to-accent-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="clubs-h">
          <h3 id="clubs-h" className="font-bold text-slate-900 dark:text-white">Largest clubs by members</h3>
          <ul className="mt-4 space-y-4">
            {topClubs.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-700 dark:text-slate-200"><span aria-hidden="true">{c.emoji}</span> {c.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">{c.members}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10" aria-hidden="true">
                  <div className={`h-full rounded-full bg-gradient-to-r ${c.gradient}`} style={{ width: `${Math.round((c.members / maxMembers) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Event day?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Open the scanner to check attendees in at the door.</p>
        </div>
        <Link to="/scan" className="btn-primary"><Icon name="scan" className="h-4 w-4" /> Open QR check-in</Link>
      </section>
    </div>
  );
}
