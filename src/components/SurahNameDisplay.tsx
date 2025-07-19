import { cn } from '@/lib/utils';
import type { Surah } from '@/types';

const Ornament = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 500 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn("text-primary/50", className)}
    >
        {/* Right Side Ornament */}
        <path d="M350 50 H450" stroke="currentColor" strokeWidth="1.5" />
        <path d="M450 50 C440 50, 440 60, 450 60 L470 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M450 50 C440 50, 440 40, 450 40 L470 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="475" cy="50" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="345" cy="50" r="2" fill="currentColor" />

        {/* Left Side Ornament */}
        <path d="M150 50 H50" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 50 C60 50, 60 60, 50 60 L30 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M50 50 C60 50, 60 40, 50 40 L30 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="25" cy="50" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="155" cy="50" r="2" fill="currentColor" />

        {/* Center decorative element */}
        <path d="M250 25 C240 35, 240 65, 250 75" stroke="currentColor" strokeWidth="1" fill="none"/>
        <path d="M250 25 C260 35, 260 65, 250 75" stroke="currentColor" strokeWidth="1" fill="none"/>
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
