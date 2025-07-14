'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show splash screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
            <h1 className="text-5xl font-headline font-bold text-white">Tadber Quran</h1>
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mt-8" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
