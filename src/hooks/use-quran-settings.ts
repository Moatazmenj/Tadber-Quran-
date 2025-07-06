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
  reciterId: 7,
};

// This function safely gets settings from localStorage. It should only be called on the client.
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

  useEffect(() => {
    setSettings(getSettingsFromStorage());

    const handleSettingsChange = () => {
      setSettings(getSettingsFromStorage());
    };
    
    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('quran-settings-change', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('quran-settings-change', handleSettingsChange);
    };
  }, []);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
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
