// hooks/useLocalStorage.js
import { useState, useEffect } from "react";

function getStorageValue(key, defaultValue) {
  // Check if window is defined (for SSR compatibility)
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    // Parse the stored JSON string back into an object
    const initial = saved ? JSON.parse(saved) : defaultValue;
    return initial;
  }
  return defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // Store the current value to localStorage whenever it changes
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]); // Dependency array ensures this runs when key or value changes

  return [value, setValue];
};
