import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import useDebounce from '../hooks/useDebounce';
import useFakeLoading from '../hooks/useFakeLoading';
import { getEventStart, hasEnded, isOnDate, isThisWeek } from '../utils/dates';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { SkeletonGrid } from '../components/Skeletons';

/** Events listing with search + filters (club, category, date, this week). State lives in the URL. */
export default function Events() {
  const { events, clubs } = useEvents();
  const [params, setParams] = useSearchParams();
  const loading = useFakeLoading(450);

  const q = params.get('q') || '';
  const club = params.get('club') || '';
  const category = params.get('category') || '';
  const date = params.get('date') || '';
  const week = params.get('week') === '1';
  const debouncedQ = useDebounce(q, 200);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const categories = useMemo(() => [...new Set(events.map((e) => e.category))].sort(), [events]);

  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase();
    return events
      .filter((e) => !hasEnded(e))
      .filter((e) => !club || e.club === club)
      .filter((e) => !category || e.category === category)
      .filter((e) => isOnDate(e, date))
      .filter((e) => !week || isThisWeek(e))
      .filter((e) => {
        if (!needle) return true;
        const clubName = clubs.find((c) => c.id === e.club)?.name || '';
        return [e.title, e.description, e.venue, e.category, clubName, ...e.tags].join(' ').toLowerCase().includes(needle);
      })
      .sort((a, b) => getEventStart(a) - getEventStart(b));
  }, [events, clubs, debouncedQ, club, category, date, week]);

  const hasFilters = q || club || category || date || week;
  const clear = () => setParams({}, { replace: true });

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Events</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Search, filter and find your next experience.</p>

      {/* Filter bar */}
      <div className="glass mt-6 rounded-2xl p-4">
        <div className="relative">
          <label htmlFor="event-search" className="sr-only">Search events</label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="event-search"
            type="search"
            value={q}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="Search by title, club, venue or tag…"
            className="input !pl-10"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="f-club" className="mb-1 block text-xs font-semibold text-slate-500">Club</label>
            <select id="f-club" value={club} onChange={(e) => setParam('club', e.target.value)} className="input">
              <option value="">All clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-cat" className="mb-1 block text-xs font-semibold text-slate-500">Category</label>
            <select id="f-cat" value={category} onChange={(e) => setParam('category', e.target.value)} className="input">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-date" className="mb-1 block text-xs font-semibold text-slate-500">Date</label>
            <input id="f-date" type="date" value={date} onChange={(e) => setParam('date', e.target.value)} className="input" />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              aria-pressed={week}
              onClick={() => setParam('week', week ? '' : '1')}
              className={`btn w-full border ${
                week
                  ? 'border-brand-500 bg-brand-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200'
              }`}
            >
              <Icon name="calendar" className="h-4 w-4" /> This week
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          {loading ? 'Loading events…' : `${filtered.length} event${filtered.length === 1 ? '' : 's'} found`}
        </p>
        {hasFilters && (
          <button type="button" onClick={clear} className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No events match"
            action={hasFilters && <button type="button" className="btn-primary" onClick={clear}>Clear filters</button>}
          >
            Try a different search or remove a filter.
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
