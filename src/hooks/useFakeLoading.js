import { useEffect, useState } from 'react';

/** Returns true for `ms` milliseconds on mount; used to show skeleton loaders. */
export default function useFakeLoading(ms = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return loading;
}
