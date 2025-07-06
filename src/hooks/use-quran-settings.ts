'use client';

import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'quranAppSettings';

export type FontStyleOption = 'default' | 'uthmanic';

interface QuranSettings {
  fontSize: number;
  fontStyle: FontStyleOption;
  showTranslation: boolean;
}

const defaultSettings: QuranSettings = {
  fontSize: 28,
  fontStyle: 'default',
  showTranslation: true,
};

function getInitialSettings(): QuranSettings {
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
}

export function useQuranSettings() {
  const [settings, setSettings] = useState<QuranSettings>(getInitialSettings);

  useEffect(() => {
    // This effect ensures that we load settings from localStorage only on the client side.
    setSettings(getInitialSettings());
  }, []);

  useEffect(() => {
    // This effect saves settings to localStorage whenever they change.
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
