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

// This function safely gets settings from localStorage. It should only be called on the client.
const getSettingsFromStorage = (): QuranSettings => {
  // This function will only be called on the client, so window is available.
  try {
    const item = window.localStorage.getItem(SETTINGS_KEY);
    return item ? { ...defaultSettings, ...JSON.parse(item) } : defaultSettings;
  } catch (error) {
    console.warn(`Error reading localStorage key “${SETTINGS_KEY}”:`, error);
    return defaultSettings;
  }
};

export function useQuranSettings() {
  // Start with default settings on the server and for the initial client render.
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);

  // After the component mounts on the client, load the settings from localStorage.
  useEffect(() => {
    setSettings(getSettingsFromStorage());

    const handleSettingsChange = () => {
      setSettings(getSettingsFromStorage());
    };
    
    // Listen for changes from other tabs or from our own `setSetting` call.
    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('quran-settings-change', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('quran-settings-change', handleSettingsChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleans up on unmount.
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    // This function only writes to localStorage and dispatches an event.
    // The state update is handled by the listener in the useEffect above.
    // This ensures a single source of truth for state updates.
    try {
      const currentSettings = getSettingsFromStorage();
      const newSettings = { ...currentSettings, [key]: value };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      window.dispatchEvent(new Event('quran-settings-change'));
    } catch (error) {
      console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
    }
  }, []);

  return { settings, setSetting };
}
