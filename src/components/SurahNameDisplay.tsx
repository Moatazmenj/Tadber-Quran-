import { cn } from '@/lib/utils';
import type { Surah } from '@/types';

const Ornament = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 400 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("text-gray-400", className)}
    preserveAspectRatio="none"
  >
    <path
      d="M38.5 20 H361.5 V80 H38.5 V20 Z M38.5 18 C27.178 18 18 27.178 18 38.5 V61.5 C18 72.822 27.178 82 38.5 82 H361.5 C372.822 82 382 72.822 382 61.5 V38.5 C382 27.178 372.822 18 361.5 18 H38.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <g transform="translate(38, 50)">
        <path d="M-6.505 13.25c0-1.285-1.01-2.295-2.295-2.295s-2.295 1.01-2.295 2.295c0 1.285 1.01 2.295 2.295 2.295s2.295-1.01 2.295-2.295z" fill="currentColor"/>
        <path d="M-21.285 5.51c0-1.12-0.91-2.03-2.03-2.03s-2.03 0.91-2.03 2.03c0 1.12 0.91 2.03 2.03 2.03s2.03-0.91 2.03-2.03z" fill="currentColor"/>
        <path d="M-21.285 -5.51c0-1.12-0.91-2.03-2.03-2.03s-2.03 0.91-2.03 2.03c0 1.12 0.91 2.03 2.03 2.03s2.03-0.91 2.03-2.03z" fill="currentColor"/>
        <path d="M-6.505 -13.25c0-1.285-1.01-2.295-2.295-2.295s-2.295 1.01-2.295 2.295c0 1.285 1.01 2.295 2.295 2.295s2.295-1.01 2.295-2.295z" fill="currentColor"/>
        <path d="M-13.895 0c0-1.19-0.96-2.15-2.15-2.15s-2.15 0.96-2.15 2.15c0 1.19 0.96 2.15 2.15 2.15s2.15-0.96 2.15-2.15z" fill="currentColor"/>
        <path d="M0.325 30.64c-5.96-2.92-9.62-9.080-9.62-15.93v-0.02c0-6.85 3.66-13.01 9.62-15.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M-10.455 24.32c-3.1-2.48-4.9-6.22-4.9-10.2v-0.02c0-3.98 1.8-7.72 4.9-10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M2.995 26c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.65 0 3 1.35 3 3s-1.35 3-3 3z" fill="currentColor"/>
        <path d="M2.995 -20c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.65 0 3 1.35 3 3s-1.35 3-3 3z" fill="currentColor"/>
        <path d="M-1.405 15.63c-3.23-0.89-5.4-3.89-5.4-7.22v-0.02c0-3.33 2.17-6.33 5.4-7.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12.795 20.93c-1.92-6.42-1.92-13.48 0-19.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19.395 22.93c-1.5-6.37-1.5-13.43 0-19.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M25.895 24.93c-1.08-6.32-1.08-13.48 0-19.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M26.295 25c-0.12 0-0.23-0.040-0.33-0.11c-4.47-3.11-7.2-8.38-7.2-14.21v-0.02c0-5.83 2.73-11.1 7.2-14.21c0.1-0.07 0.21-0.11 0.33-0.11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
    <g transform="translate(362, 50) scale(-1, 1)">
        <path d="M-6.505 13.25c0-1.285-1.01-2.295-2.295-2.295s-2.295 1.01-2.295 2.295c0 1.285 1.01 2.295 2.295 2.295s2.295-1.01 2.295-2.295z" fill="currentColor"/>
        <path d="M-21.285 5.51c0-1.12-0.91-2.03-2.03-2.03s-2.03 0.91-2.03 2.03c0 1.12 0.91 2.03 2.03 2.03s2.03-0.91 2.03-2.03z" fill="currentColor"/>
        <path d="M-21.285 -5.51c0-1.12-0.91-2.03-2.03-2.03s-2.03 0.91-2.03 2.03c0 1.12 0.91 2.03 2.03 2.03s2.03-0.91 2.03-2.03z" fill="currentColor"/>
        <path d="M-6.505 -13.25c0-1.285-1.01-2.295-2.295-2.295s-2.295 1.01-2.295 2.295c0 1.285 1.01 2.295 2.295 2.295s2.295-1.01 2.295-2.295z" fill="currentColor"/>
        <path d="M-13.895 0c0-1.19-0.96-2.15-2.15-2.15s-2.15 0.96-2.15 2.15c0 1.19 0.96 2.15 2.15 2.15s2.15-0.96 2.15-2.15z" fill="currentColor"/>
        <path d="M0.325 30.64c-5.96-2.92-9.62-9.080-9.62-15.93v-0.02c0-6.85 3.66-13.01 9.62-15.93" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M-10.455 24.32c-3.1-2.48-4.9-6.22-4.9-10.2v-0.02c0-3.98 1.8-7.72 4.9-10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M2.995 26c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.65 0 3 1.35 3 3s-1.35 3-3 3z" fill="currentColor"/>
        <path d="M2.995 -20c-1.65 0-3-1.35-3-3s1.35-3 3-3c1.65 0 3 1.35 3 3s-1.35 3-3 3z" fill="currentColor"/>
        <path d="M-1.405 15.63c-3.23-0.89-5.4-3.89-5.4-7.22v-0.02c0-3.33 2.17-6.33 5.4-7.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12.795 20.93c-1.92-6.42-1.92-13.48 0-19.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19.395 22.93c-1.5-6.37-1.5-13.43 0-19.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M25.895 24.93c-1.08-6.32-1.08-13.48 0-19.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M26.295 25c-0.12 0-0.23-0.040-0.33-0.11c-4.47-3.11-7.2-8.38-7.2-14.21v-0.02c0-5.83 2.73-11.1 7.2-14.21c0.1-0.07 0.21-0.11 0.33-0.11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
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
