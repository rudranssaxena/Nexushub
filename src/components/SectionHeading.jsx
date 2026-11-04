/** Eyebrow + title + subtitle block used above content sections. */
export default function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">{eyebrow}</p>
        )}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
