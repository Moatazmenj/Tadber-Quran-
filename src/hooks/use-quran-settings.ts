'use client';

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'quranAppSettings';

export type FontStyleOption = 'default' | 'uthmanic';

interface QuranSettings {
  fontSize: number;
  fontStyle: FontStyleOption;
  showTranslation: boolean;
  translationId: string;
}

const defaultSettings: QuranSettings = {
  fontSize: 28,
  fontStyle: 'default',
  showTranslation: true,
  translationId: 'en',
};

// This function safely gets settings from localStorage.
// It's defined outside the hook to be used in the initial state.
const getInitialSettings = (): QuranSettings => {
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
  const [settings, setSettings] = useState<QuranSettings>(getInitialSettings);

  // This effect listens for changes in localStorage and updates the component's state.
  // This is crucial for synchronizing settings across different pages or tabs.
  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getInitialSettings());
    };
    
    // Listen for storage events (changes in other tabs)
    window.addEventListener('storage', handleSettingsChange);
    // Listen for custom events (changes in the same tab, e.g., navigating back to a cached page)
    window.addEventListener('quran-settings-change', handleSettingsChange);

    // Initial sync when component mounts, in case it was cached.
    handleSettingsChange();

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('quran-settings-change', handleSettingsChange);
    };
  }, []);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    // We update the state optimistically for a responsive UI
    setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        
        // Then, we save to localStorage and notify other components
        try {
          window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
          window.dispatchEvent(new Event('quran-settings-change'));
        } catch (error) {
          console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
        }

        return newSettings;
    });
  }, []);

  return { settings, setSetting };
}
