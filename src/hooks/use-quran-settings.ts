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
  // Initialize state directly from localStorage to prevent race conditions.
  const [settings, setSettings] = useState<QuranSettings>(getInitialSettings);

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
    }
  }, [settings]);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    setSettings((prev) => ({
        ...prev,
        [key]: value,
    }));
  }, []);

  return { settings, setSetting };
}
