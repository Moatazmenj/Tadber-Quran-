
'use client';

import { cn, toArabicNumerals } from '@/lib/utils';
import type { Ayah, WordTiming } from '@/types';
import type { FontStyleOption } from '@/hooks/use-quran-settings';

interface KaraokeVerseProps {
  verse: Ayah;
  wordTimings: WordTiming[];
  currentWordIndex: number;
  fontStyle: FontStyleOption;
  fontSize: number;
  isKaraokeDisabled: boolean;
  translation?: string;
}

export function KaraokeVerse({ verse, wordTimings, currentWordIndex, fontStyle, fontSize, isKaraokeDisabled, translation }: KaraokeVerseProps) {
  const words = verse.text_uthmani.split(' ');
  const verseNumber = verse.verse_key.split(':')[1];
  const verseEndSymbol = toArabicNumerals(verseNumber);

  const renderArabicText = (isHighlighting: boolean) => {
    if (!isHighlighting) {
      return (
        <>
          {verse.text_uthmani}
          <span 
              className="relative inline-flex items-center justify-center w-8 h-8"
              style={{ fontSize: `${fontSize * 0.5}px` }}
          >
              <svg viewBox="0 0 40 40" className="absolute w-full h-full text-primary">
                  <path fill="currentColor" d="M20,3c9.389,0,17,7.611,17,17s-7.611,17-17,17S3,29.389,3,20S10.611,3,20,3 M20,0C8.954,0,0,8.954,0,20s8.954,20,20,20s20-8.954,20-20S31.046,0,20,0L20,0z"/>
              </svg>
              <span className="relative text-white">{verseEndSymbol}</span>
          </span>
        </>
      );
    }

    return (
      <>
        {wordTimings.map((word, index) => (
          <span
            key={index}
            className={cn(
              "transition-colors duration-300",
              currentWordIndex > index ? 'text-white/40' : 
              currentWordIndex === index ? 'text-primary' : 'text-white/70'
            )}
          >
            {word.text_uthmani}
          </span>
        ))}
        <span 
          className="relative inline-flex items-center justify-center w-8 h-8"
          style={{ fontSize: `${fontSize * 0.5}px` }}
        >
          <svg viewBox="0 0 40 40" className="absolute w-full h-full text-primary">
              <path fill="currentColor" d="M20,3c9.389,0,17,7.611,17,17s-7.611,17-17,17S3,29.389,3,20S10.611,3,20,3 M20,0C8.954,0,0,8.954,0,20s8.954,20,20,20s20-8.954,20-20S31.046,0,20,0L20,0z"/>
          </svg>
          <span className="relative text-white">{verseEndSymbol}</span>
        </span>
      </>
    );
  }

  const useHighlighting = !isKaraokeDisabled && wordTimings.length > 0;

  return (
    <div className="text-center">
        <div
          dir="rtl"
          className={cn(
            "leading-loose text-center text-white flex flex-wrap justify-center items-center gap-x-2",
            fontStyle === 'indopak' ? 'font-arabic-indopak' : (fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
          )}
          style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
        >
          {renderArabicText(useHighlighting)}
        </div>
        {translation && (
            <p className="text-white/70 text-base mt-4 max-w-2xl mx-auto">
                {translation}
            </p>
        )}
    </div>
  );
}
