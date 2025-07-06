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

export function useQuranSettings() {
  const [settings, setSettings] = useState<QuranSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to load settings from localStorage on initial client-side mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(SETTINGS_KEY);
      if (item) {
        setSettings({ ...defaultSettings, ...JSON.parse(item) });
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${SETTINGS_KEY}”:`, error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.warn(`Error setting localStorage key “${SETTINGS_KEY}”:`, error);
      }
    }
  }, [settings, isInitialized]);
  
  const setSetting = useCallback(<K extends keyof QuranSettings>(key: K, value: QuranSettings[K]) => {
    setSettings((prev) => ({
        ...prev,
        [key]: value,
    }));
  }, []);

  return { settings, setSetting };
}
