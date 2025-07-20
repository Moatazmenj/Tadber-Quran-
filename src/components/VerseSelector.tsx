
'use client';

import type { Ayah } from '@/types';
import { cn, toArabicNumerals } from '@/lib/utils';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { ScrollArea } from './ui/scroll-area';

interface VerseSelectorProps {
  verses: Ayah[];
  onVerseSelect: (verseKey: string) => void;
  fontStyle: 'default' | 'uthmanic' | 'indopak';
  fontSize: number;
}

export function VerseSelector({ verses, onVerseSelect, fontStyle, fontSize }: VerseSelectorProps) {

  return (
    <ScrollArea className="h-[300px] w-full bg-black/20 rounded-lg p-4">
      <div 
        dir="rtl"
        className={cn(
            "leading-loose text-center text-white/80 flex flex-wrap justify-center items-center gap-x-2",
            fontStyle === 'indopak' ? 'font-arabic-indopak' : (fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
      >
        {verses.map((ayah) => {
          const verseNumber = toArabicNumerals(ayah.verse_key.split(':')[1]);
          const verseEndSymbol = `\u06dd${verseNumber}`;
          return (
            <span 
                key={ayah.verse_key}
                onClick={() => onVerseSelect(ayah.verse_key)}
                className={cn(
                    "cursor-pointer transition-colors duration-200 p-1 rounded-md",
                    ayah.isActive ? "text-primary bg-primary/10" : "hover:bg-white/10"
                )}
            >
              {ayah.text_uthmani}
              <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${fontSize * 0.8}px` }}>{verseEndSymbol}</span>
            </span>
          );
        })}
      </div>
    </ScrollArea>
  );
}
