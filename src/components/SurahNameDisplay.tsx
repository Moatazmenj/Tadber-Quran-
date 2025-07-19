import { cn } from '@/lib/utils';
import type { Surah } from '@/types';
import type { FontStyleOption } from '@/hooks/use-quran-settings';

interface SurahNameDisplayProps {
  surahInfo: Surah;
  fontStyle: FontStyleOption;
}

const Ornament = ({ className }: { className?: string }) => (
  <svg
    width="80"
    height="88"
    viewBox="0 0 80 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("flex-shrink-0 text-gray-400", className)}
  >
    <path
      d="M61.09 44C61.09 52.84 54.99 62.53 45.42 62.53C35.85 62.53 29.75 52.84 29.75 44C29.75 35.16 35.85 25.47 45.42 25.47C54.99 25.47 61.09 35.16 61.09 44Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M29.75 44C24.71 44 18.04 41.01 18.04 35.31C18.04 29.61 24.71 26.62 29.75 26.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M29.75 44C24.71 44 18.04 46.99 18.04 52.69C18.04 58.39 24.71 61.38 29.75 61.38"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.04 35.31C15.8 35.31 12.01 34.48 12.01 30.93C12.01 27.38 15.8 26.55 18.04 26.55"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.04 52.69C15.8 52.69 12.01 53.52 12.01 57.07C12.01 60.62 15.8 61.45 18.04 61.45"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M61.09 44C66.13 44 72.8 41.01 72.8 35.31C72.8 29.61 66.13 26.62 61.09 26.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M61.09 44C66.13 44 72.8 46.99 72.8 52.69C72.8 58.39 66.13 61.38 61.09 61.38"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M72.8 35.31C75.04 35.31 78.83 34.48 78.83 30.93C78.83 27.38 75.04 26.55 72.8 26.55"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M72.8 52.69C75.04 52.69 78.83 53.52 78.83 57.07C78.83 60.62 75.04 61.45 72.8 61.45"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M26.24 65.5C22.69 68.49 18.04 71.48 18.04 76.1C18.04 80.72 22.69 83.71 26.24 86.7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M26.24 22.5C22.69 19.51 18.04 16.52 18.04 11.9C18.04 7.28 22.69 4.29 26.24 1.3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.04 76.1C14.49 76.1 10.38 74.36 10.38 70.24C10.38 66.12 14.49 64.38 18.04 64.38"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M18.04 11.9C14.49 11.9 10.38 13.64 10.38 17.76C10.38 21.88 14.49 23.62 18.04 23.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M64.6 65.5C68.15 68.49 72.8 71.48 72.8 76.1C72.8 80.72 68.15 83.71 64.6 86.7"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M64.6 22.5C68.15 19.51 72.8 16.52 72.8 11.9C72.8 7.28 68.15 4.29 64.6 1.3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M72.8 76.1C76.35 76.1 80.46 74.36 80.46 70.24C80.46 66.12 76.35 64.38 72.8 64.38"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M72.8 11.9C76.35 11.9 80.46 13.64 80.46 17.76C80.46 21.88 76.35 23.62 72.8 23.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4.62 26.55H12.01V30.93H4.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4.62 57.07H12.01V61.45H4.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4.62 64.38H10.38V70.24H4.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4.62 17.76H10.38V23.62H4.62"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export function SurahNameDisplay({ surahInfo, fontStyle }: SurahNameDisplayProps) {
  return (
    <div className="flex items-center justify-center w-full my-8">
      <Ornament />
      <div className="flex-grow text-center mx-[-12px] relative h-20">
        <div className="absolute inset-0 border-y border-gray-400"></div>
        <h2
          className={cn(
            'h-full flex items-center justify-center text-5xl font-bold text-gray-300',
            fontStyle === 'indopak' ? 'font-arabic-indopak' : 'font-arabic',
            fontStyle === 'uthmanic' && 'font-arabic-uthmanic'
          )}
        >
          {surahInfo.arabicName}
        </h2>
      </div>
      <Ornament className="transform -scale-x-100" />
    </div>
  );
}
