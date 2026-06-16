import { useEffect, useState } from "react";

/**
 * Belirtilen süre boyunca değer değişmezse güncellenen debounced değer döner.
 * @param value - Debounce uygulanacak değer
 * @param delayMs - Gecikme süresi (ms), varsayılan 500ms
 */
export function useDebounce<T>(value: T, delayMs = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debouncedValue;
}
