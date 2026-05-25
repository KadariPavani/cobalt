import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useUrlFilters = (defaults = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const v = searchParams.get(key);
      if (v !== null) out[key] = v;
    }
    return out;
  }, [searchParams, defaults]);

  const setValue = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value === undefined || value === null || value === '') next.delete(key);
      else next.set(key, value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setMany = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === '') next.delete(k);
        else next.set(k, v);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const clear = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeCount = useMemo(() => {
    let n = 0;
    for (const [k, v] of searchParams.entries()) {
      if (defaults[k] !== undefined && v) n++;
    }
    return n;
  }, [searchParams, defaults]);

  return { values, setValue, setMany, clear, activeCount };
};
