import { cn } from '@/lib/utils';
import type { Surah } from '@/types';

const Ornament = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 400 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={cn("text-primary/40", className)}
    >
        <path d="M50 50 L150 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M250 50 L350 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="155" cy="50" r="3" fill="currentColor" />
        <circle cx="245" cy="50" r="3" fill="currentColor" />
        <path d="M165 50 C175 35, 225 35, 235 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M165 50 C175 65, 225 65, 235 50" stroke="currentColor" strokeWidth="1.5" fill="none" />
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
