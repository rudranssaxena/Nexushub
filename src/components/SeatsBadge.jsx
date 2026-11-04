/** Seats-left pill: green when plenty, amber when few, red when sold out. */
export default function SeatsBadge({ seatsLeft, capacity }) {
  let style = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
  let text = `${seatsLeft} seats left`;
  if (seatsLeft === 0) {
    style = 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300';
    text = 'Sold out';
  } else if (seatsLeft <= 10 || seatsLeft / capacity < 0.15) {
    style = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300';
    text = `Only ${seatsLeft} left!`;
  }
  return <span className={`chip ${style}`}>{text}</span>;
}
