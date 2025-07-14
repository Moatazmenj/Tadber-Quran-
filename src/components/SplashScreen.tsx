'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

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
      <div 
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center text-white bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.postimg.cc/j5y5dR1X/20250714-094701.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center">
            <Image 
              src="https://i.postimg.cc/KcLqFC88/20250707-093634.png"
              alt="Tadber Quran Logo"
              width={250}
              height={94}
              priority
            />
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mt-8" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
