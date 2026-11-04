import { useEffect, useState } from 'react';

/** Debounce a fast-changing value (e.g. search box text). */
export default function useDebounce(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
