import { useEffect, useState } from "react";

/**
 * Custom hook to store and retrieve data from session storage.
 * @param key The key under which the data is stored in session storage.
 * @param initialValue The initial value to be stored.
 */
export default function useSessionStorage<T>(key: string, initialValue: T) {
  // Try to get stored value from session storage
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  // Update session storage when state changes
  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}