'use client';

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'quranAppSettings';

export type FontStyleOption = 'default' | 'uthmanic' | 'indopak';

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
  translationId: 'ar',
  theme: 'theme1',
  reciterId: 5, // Adjusted to Maher Al Muaiqly
};

export function useQuranSettings() {
  // Start with default settings to ensure server and client match on first render.
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);

  // After the component mounts on the client, read from localStorage.
  useEffect(() => {
    const item = window.localStorage.getItem(SETTINGS_KEY);
    if (item) {
      try {
        const storedSettings = JSON.parse(item);
        // Merge with defaults to ensure no missing keys if settings structure changes
        setSettings(current => ({...defaultSettings, ...storedSettings}));
      } catch (e) {
        console.warn('Could not parse stored settings.', e);
        // If parsing fails, we stick with defaults.
      }
    }

    // This listener handles updates from other tabs.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_KEY && event.newValue) {
         try {
            const newSettings = JSON.parse(event.newValue);
            setSettings(current => ({...defaultSettings, ...newSettings}));
         } catch (e) {
            console.warn('Could not parse new settings from storage event.', e);
         }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    // Update the state immediately, and persist to localStorage.
    setSettings(currentSettings => {
      const newSettings = { ...currentSettings, [key]: value };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  // The component will initially render with default settings, then re-render
  // with the user's stored settings after mount. This avoids hydration errors.
  return { settings, setSetting };
}
