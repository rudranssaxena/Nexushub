import { useMemo, useState } from 'react';
import { useEvents } from '../context/EventsContext';
import useFakeLoading from '../hooks/useFakeLoading';
import ClubCard from '../components/ClubCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { ClubCardSkeleton, SkeletonGrid } from '../components/Skeletons';

export default function Clubs() {
  const { clubs } = useEvents();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const loading = useFakeLoading(450);

  const categories = useMemo(() => [...new Set(clubs.map((c) => c.category))], [clubs]);
  const filtered = clubs.filter(
    (c) =>
      (!category || c.category === category) &&
      [c.name, c.description, ...c.tags].join(' ').toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Clubs</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Find your community on campus.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="club-search" className="sr-only">Search clubs</label>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="club-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clubs…" className="input !pl-10" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={`chip !px-3.5 !py-2 text-sm transition ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10'
              }`}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid count={8} Item={ClubCardSkeleton} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No clubs found">Try a different search.</EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((c, i) => (
              <ClubCard key={c.id} club={c} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
