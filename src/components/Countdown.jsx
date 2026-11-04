import useCountdown from '../hooks/useCountdown';
import { getEventEnd, getEventStart } from '../utils/dates';
import Icon from './Icon';

/**
 * Live countdown to an event's start.
 * variant="chip" → small inline text; variant="boxes" → big d/h/m/s tiles (event page).
 */
export default function Countdown({ event, variant = 'chip' }) {
  const start = getEventStart(event);
  const end = getEventEnd(event);
  const t = useCountdown(start);
  const now = Date.now();
  const live = now >= start.getTime() && now < end.getTime();
  const ended = now >= end.getTime();

  if (variant === 'chip') {
    let label;
    if (ended) label = 'Ended';
    else if (live) label = 'Happening now';
    else if (t.days > 0) label = `Starts in ${t.days}d ${t.hours}h ${t.minutes}m`;
    else label = `Starts in ${t.hours}h ${String(t.minutes).padStart(2, '0')}m ${String(t.seconds).padStart(2, '0')}s`;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
        <Icon name="clock" className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }

  if (ended) return <p className="text-sm font-semibold text-slate-500">This event has ended.</p>;
  if (live) return <p className="text-sm font-semibold text-emerald-600">🔴 Happening right now!</p>;

  const units = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Minutes', t.minutes],
    ['Seconds', t.seconds],
  ];
  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Time until the event starts">
      {units.map(([label, value]) => (
        <div key={label} className="glass rounded-xl py-3 text-center">
          <div className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white sm:text-3xl">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        </div>
      ))}
    </div>
  );
}
