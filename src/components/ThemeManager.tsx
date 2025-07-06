'use client';

import { useQuranSettings } from '@/hooks/use-quran-settings';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ThemeManager() {
  const { settings } = useQuranSettings();
  const pathname = usePathname();

  useEffect(() => {
    // Clear any existing theme classes
    document.body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });
    if (document.body.classList.contains('theme-active')) {
        document.body.classList.remove('theme-active');
    }
    
    const isSurahPage = pathname.startsWith('/surah/');
    if (isSurahPage) {
      document.body.classList.add(`theme-active`);
      document.body.classList.add(`theme-${settings.theme}`);
    }
  }, [pathname, settings.theme]);

  return null;
}
