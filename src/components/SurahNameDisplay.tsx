import { cn } from '@/lib/utils';
import type { Surah } from '@/types';

const Ornament = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 800 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn("text-primary/50", className)}
    >
        <path d="M400 60 L550 60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
        <path d="M400 60 L250 60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
        
        {/* Right Ornament */}
        <path d="M550 60 C 580 60, 590 40, 620 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M550 60 C 580 60, 590 80, 620 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M620 40 C 650 40, 660 60, 640 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M620 80 C 650 80, 660 60, 640 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="640" cy="60" r="3" fill="currentColor" />
        <path d="M640 60 C 660 60, 670 50, 680 55" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M640 60 C 660 60, 670 70, 680 65" stroke="currentColor" strokeWidth="1" fill="none" />

        {/* Left Ornament */}
        <path d="M250 60 C 220 60, 210 40, 180 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M250 60 C 220 60, 210 80, 180 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M180 40 C 150 40, 140 60, 160 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M180 80 C 150 80, 140 60, 160 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="160" cy="60" r="3" fill="currentColor" />
        <path d="M160 60 C 140 60, 130 50, 120 55" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M160 60 C 140 60, 130 70, 120 65" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
);


export function SurahNameDisplay({ surahInfo }: { surahInfo: Surah }) {
  return (
    <div className="flex items-center justify-center w-full my-8 h-24 relative">
      <Ornament className="h-full w-full absolute inset-0" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h2
          className={cn(
            'text-4xl font-bold text-gray-300 px-4 z-10 bg-transparent',
            'font-arabic-uthmanic'
          )}
        >
          {surahInfo.arabicName}
        </h2>
      </div>
    </div>
  );
}
