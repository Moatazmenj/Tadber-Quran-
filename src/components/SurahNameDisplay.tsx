import { cn } from '@/lib/utils';
import type { Surah } from '@/types';

const Ornament = ({ className }: { className?: string }) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 250 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("flex-shrink-0 text-gray-400", className)}
  >
    <path
      d="M110 9C110 9 110 1 125 1C140 1 140 9 140 9"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M140 241C140 241 140 249 125 249C110 249 110 241 110 241"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M241 110C241 110 249 110 249 125C249 140 241 140 241 140"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 140C9 140 1 140 1 125C1 110 9 110 9 110"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M125 249C125 249 125 229.435 115.215 219.65C105.43 209.865 85.8652 200.08 85.8652 200.08"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M125 1C125 1 125 20.5652 115.215 30.35C105.43 40.1348 85.8652 49.92 85.8652 49.92"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M1 125C1 125 20.5652 125 30.35 115.215C40.1348 105.43 49.92 85.8652 49.92 85.8652"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M249 125C249 125 229.435 125 219.65 115.215C209.865 105.43 200.08 85.8652 200.08 85.8652"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M125 249C125 249 125 229.435 134.785 219.65C144.57 209.865 164.135 200.08 164.135 200.08"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M125 1C125 1 125 20.5652 134.785 30.35C144.57 40.1348 164.135 49.92 164.135 49.92"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M1 125C1 125 20.5652 125 30.35 134.785C40.1348 144.57 49.92 164.135 49.92 164.135"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M249 125C249 125 229.435 125 219.65 134.785C209.865 144.57 200.08 164.135 200.08 164.135"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M200.08 49.92C200.08 49.92 209.865 40.1348 219.65 30.35C229.435 20.5652 249 1 249 1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M49.92 200.08C49.92 200.08 40.1348 209.865 30.35 219.65C20.5652 229.435 1 249 1 249"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M49.92 49.92C49.92 49.92 40.1348 40.1348 30.35 30.35C20.5652 20.5652 1 1 1 1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M200.08 200.08C200.08 200.08 209.865 209.865 219.65 219.65C229.435 229.435 249 249 249 249"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export function SurahNameDisplay({ surahInfo }: { surahInfo: Surah }) {
  return (
    <div className="flex items-center justify-center w-full my-8">
      <Ornament />
      <div className="flex-grow text-center mx-[-12px] relative h-20 flex items-center justify-center">
        <div className="absolute inset-0 border-y-2 border-gray-400"></div>
        <h2
          className={cn(
            'text-4xl font-bold text-gray-300 px-4 z-10 bg-transparent',
            'font-arabic-uthmanic'
          )}
        >
          {surahInfo.arabicName}
        </h2>
      </div>
      <Ornament className="transform -scale-x-100" />
    </div>
  );
}
