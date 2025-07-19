
import { cn } from '@/lib/utils';
import type { Surah } from '@/types';
import Image from 'next/image';

export function SurahNameDisplay({ surahInfo }: { surahInfo: Surah }) {
  return (
    <div className="flex items-center justify-center w-full my-8 h-40 relative">
      <Image
        src="https://i.postimg.cc/hvcj1QGq/20250719-132856.png"
        alt="Decorative frame"
        fill
        className="object-contain"
        priority
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <h2
          className={cn(
            'text-3xl font-bold text-white px-4 z-10 bg-transparent',
            'font-arabic-uthmanic'
          )}
        >
          {surahInfo.arabicName}
        </h2>
      </div>
    </div>
  );
}
