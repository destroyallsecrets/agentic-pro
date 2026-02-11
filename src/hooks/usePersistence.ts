"use client";

import { useState, useEffect } from 'react';

export function usePersistence<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.warn(`Error writing localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  const clearPersistentState = () => {
    setState(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  };

  return [state, setState, clearPersistentState] as const;
}
