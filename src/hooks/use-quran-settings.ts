'use client';

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'quranAppSettings';

export type FontStyleOption = 'default' | 'uthmanic';

interface QuranSettings {
  fontSize: number;
  fontStyle: FontStyleOption;
  showTranslation: boolean;
  translationId: string;
  theme: string;
  reciterId: number;
}

const defaultSettings: QuranSettings = {
  fontSize: 28,
  fontStyle: 'default',
  showTranslation: true,
  translationId: 'en',
  theme: 'theme1',
  reciterId: 4, // Maher Al Muaiqly
};

// This function safely gets settings from localStorage.
const getSettingsFromStorage = (): QuranSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  try {
    const item = window.localStorage.getItem(SETTINGS_KEY);
    // Merge stored settings with defaults to ensure all keys are present
    return item ? { ...defaultSettings, ...JSON.parse(item) } : defaultSettings;
  } catch (error) {
    console.warn(`Error reading localStorage key “${SETTINGS_KEY}”:`, error);
    return defaultSettings;
  }
};

export function useQuranSettings() {
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);
  // isMounted ensures we only access localStorage on the client after initial render.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // On mount, read settings from storage and update the state.
    setSettings(getSettingsFromStorage());
    setIsMounted(true);

    // This listener handles updates from other tabs.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_KEY) {
        setSettings(getSettingsFromStorage());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    // Update the state immediately using the functional form to avoid stale state.
    setSettings(currentSettings => {
      const newSettings = { ...currentSettings, [key]: value };
      try {
        // Persist the new state to localStorage.
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
      }
      return newSettings;
    });
  }, []);

  // Return default settings on server and during initial client render to prevent hydration mismatch.
  // Return the true settings once the component has mounted on the client.
  return { settings: isMounted ? settings : defaultSettings, setSetting };
}
