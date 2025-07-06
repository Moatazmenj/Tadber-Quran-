'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2, Octagon } from 'lucide-react';
import { surahs } from '@/lib/quran';

// API response from quran.com search
interface ApiSearchResult {
  verse_key: string;
  text: string;
}

interface SearchApiResponse {
  search: {
    results: ApiSearchResult[];
  }
}

// Our custom type for displaying results
interface VerseSearchResult {
  verse_key: string;
  text_ar: string;
  surahId: number;
  surahName: string;
  arabicName: string;
  verseNumber: number;
}

// Type for the API response of uthmani verses
interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface UthmaniVerseApiResponse {
    verses: UthmaniVerse[];
}


export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [verseResults, setVerseResults] = useState<VerseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 3) {
        setVerseResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      try {
        const response = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(debouncedQuery)}&language=en`);
        if (!response.ok) {
          setVerseResults([]);
          setIsSearching(false);
          return;
        }

        const data: SearchApiResponse = await response.json();
        const searchResults = data.search.results.slice(0, 25);

        if (searchResults.length === 0) {
            setVerseResults([]);
            setIsSearching(false);
            return;
        }

        const versesBySurah = searchResults.reduce((acc, result) => {
            const [surahIdStr] = result.verse_key.split(':');
            const surahId = parseInt(surahIdStr, 10);
            if (!acc[surahId]) acc[surahId] = [];
            acc[surahId].push(result);
            return acc;
        }, {} as Record<number, ApiSearchResult[]>);

        const surahIds = Object.keys(versesBySurah).map(Number);
        const arabicTextsPromises = surahIds.map(id => 
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
                .then(res => res.json() as Promise<UthmaniVerseApiResponse>)
        );
        const arabicTextsResults = await Promise.all(arabicTextsPromises);

        const arabicTextMap = arabicTextsResults.reduce((acc, surahData) => {
            surahData.verses.forEach((verse) => {
                acc[verse.verse_key] = verse.text_uthmani;
            });
            return acc;
        }, {} as Record<string, string>);

        const mappedVerses = searchResults.map(result => {
            const [surahIdStr, verseNumStr] = result.verse_key.split(':');
            const surahId = parseInt(surahIdStr, 10);
            const surahInfo = surahs.find(s => s.id === surahId);
            return {
              verse_key: result.verse_key,
              text_ar: arabicTextMap[result.verse_key] || 'Could not load text.',
              surahId: surahId,
              surahName: surahInfo?.name || 'Unknown Surah',
              arabicName: surahInfo?.arabicName || '',
              verseNumber: parseInt(verseNumStr, 10),
            };
        });

        setVerseResults(mappedVerses);
      } catch (error) {
        console.error('Search API error:', error);
        setVerseResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="relative my-8 max-w-2xl mx-auto">
        <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Surah name or keywords..."
              className="w-full pl-12 h-10 text-base rounded-full bg-card"
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-8">
        {debouncedQuery.trim().length >= 3 && !isSearching && verseResults.length === 0 && (
          <p className="text-center text-muted-foreground">No results found for "{debouncedQuery}".</p>
        )}

        {verseResults.map((verse) => (
            <Link key={verse.verse_key} href={`/surah/${verse.surahId}#verse-${verse.verseNumber}`} passHref>
                <div className="p-3 hover:bg-white/5 transition-colors cursor-pointer w-full flex items-start gap-3 border-b border-border/20">
                    {/* 1. Icon (left) */}
                    <div className="relative flex-shrink-0 flex items-center justify-center h-8 w-8">
                        <Octagon className="absolute h-full w-full text-gray-700/50" fill="currentColor" />
                        <span className="relative font-bold text-white text-xs">{verse.surahId}</span>
                    </div>

                    {/* 2. Main content (middle) */}
                    <div className="flex-grow min-w-0">
                        <div className="flex items-baseline gap-2">
                            <p className="text-white font-semibold text-xs">{verse.surahName}</p>
                            <p className="font-arabic text-primary text-xs">{verse.arabicName}</p>
                        </div>
                        <p dir="rtl" className="font-arabic text-white/90 text-sm text-left w-full mt-0.5 truncate">
                            {verse.text_ar}
                        </p>
                    </div>

                    {/* 3. Verse number (right) */}
                    <div className="text-muted-foreground text-xs pt-0">
                        {verse.verseNumber}
                    </div>
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}
