import { useEffect, useState } from 'react';
import { splitDuration } from '../utils/dates';

/** Live countdown to `target` (a Date). Ticks every second. */
export default function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return splitDuration(target.getTime() - now);
}
