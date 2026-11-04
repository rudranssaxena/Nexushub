import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import AdminOverview from '../components/admin/AdminOverview';
import EventManager from '../components/admin/EventManager';
import ClubManager from '../components/admin/ClubManager';
import RegistrationsManager from '../components/admin/RegistrationsManager';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'chart', Panel: AdminOverview },
  { id: 'events', label: 'Events', icon: 'calendar', Panel: EventManager },
  { id: 'clubs', label: 'Clubs', icon: 'users', Panel: ClubManager },
  { id: 'registrations', label: 'Registrations', icon: 'list', Panel: RegistrationsManager },
];

/** Administrator window (route is guarded by <ProtectedRoute adminOnly>). The active tab lives in the URL. */
export default function Admin() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const active = TABS.find((t) => t.id === params.get('tab')) || TABS[0];
  const { Panel } = active;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
          <Icon name="shield" className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin panel</h1>
          <p className="text-sm text-slate-500">Signed in as {user.name}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Admin sections" className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10">
        {TABS.map((t) => {
          const on = t.id === active.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              onClick={() => setParams({ tab: t.id }, { replace: true })}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                on
                  ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="mt-6">
        <Panel />
      </div>
    </div>
  );
}
