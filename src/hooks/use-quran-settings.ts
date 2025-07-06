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
    return item ? { ...defaultSettings, ...JSON.parse(item) } : defaultSettings;
  } catch (error) {
    console.warn(`Error reading localStorage key “${SETTINGS_KEY}”:`, error);
    return defaultSettings;
  }
};

export function useQuranSettings() {
  // Use state that is initialized on the client after mount to avoid hydration mismatch.
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSettings(getSettingsFromStorage());

    const handleStorageChange = () => {
      setSettings(getSettingsFromStorage());
    };
    
    // Listen for changes from other tabs.
    window.addEventListener('storage', handleStorageChange);
    // Custom event to sync settings across components in the same tab.
    window.addEventListener('quran-settings-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quran-settings-change', handleStorageChange);
    };
  }, []);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    try {
      // Get current settings directly from storage to avoid stale state.
      const currentSettings = getSettingsFromStorage();
      const newSettings = { ...currentSettings, [key]: value };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      // Dispatch custom event to notify other components/hooks in the same tab.
      window.dispatchEvent(new Event('quran-settings-change'));
    } catch (error)
      {
      console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
    }
  }, []);

  // Return default settings on server and during initial client render.
  // Return loaded settings only after the component has mounted to prevent hydration errors.
  return { settings: isMounted ? settings : defaultSettings, setSetting };
}
