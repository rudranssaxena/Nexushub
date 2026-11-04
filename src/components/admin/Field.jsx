/** Label + control + inline error, used by the admin forms. */
export default function Field({ label, htmlFor, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Row of toggle chips for picking tags. */
export function TagPicker({ options, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tags">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.id)}
            className={`chip !px-3 !py-1.5 text-sm transition ${
              on
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Row of gradient swatches. */
export function GradientPicker({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour theme">
      {options.map((g) => (
        <button
          key={g}
          type="button"
          role="radio"
          aria-checked={value === g}
          aria-label={g.replace('from-', '').replace(' to-', ' to ')}
          onClick={() => onChange(g)}
          className={`h-8 w-8 rounded-full bg-gradient-to-br ${g} ${
            value === g ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-[#121833]' : ''
          }`}
        />
      ))}
    </div>
  );
}
