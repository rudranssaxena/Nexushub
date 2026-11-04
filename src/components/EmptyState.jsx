import Icon from './Icon';

/** Friendly "nothing here" panel. */
export default function EmptyState({ icon = 'search', title, children, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
