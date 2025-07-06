'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { surahs } from '@/lib/quran';
import type { Surah } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ApiSearchResult {
  verse_key: string;
  text: string;
}

interface SearchApiResponse {
  search: {
    results: ApiSearchResult[];
  }
}

interface VerseSearchResult {
  verse_key: string;
  text_en: string;
  surahId: number;
  surahName: string;
  verseNumber: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [surahResults, setSurahResults] = useState<Surah[]>([]);
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
        setSurahResults([]);
        setVerseResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      
      const lowerCaseQuery = debouncedQuery.toLowerCase();
      const filteredSurahs = surahs.filter(s => 
        s.name.toLowerCase().includes(lowerCaseQuery) ||
        s.arabicName.includes(debouncedQuery)
      );
      setSurahResults(filteredSurahs);

      try {
        const response = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(debouncedQuery)}&language=en`);
        if (response.ok) {
          const data: SearchApiResponse = await response.json();
          const mappedVerses = data.search.results.map(result => {
            const [surahIdStr, verseNumStr] = result.verse_key.split(':');
            const surahId = parseInt(surahIdStr, 10);
            const surahInfo = surahs.find(s => s.id === surahId);
            return {
              verse_key: result.verse_key,
              text_en: result.text.replace(/<sup.*?<\/sup>/g, ''),
              surahId: surahId,
              surahName: surahInfo?.name || 'Unknown Surah',
              verseNumber: parseInt(verseNumStr, 10),
            };
          }).slice(0, 20);
          setVerseResults(mappedVerses);
        } else {
          setVerseResults([]);
        }
      } catch (error) {
        console.error('Search API error:', error);
        setVerseResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, `<strong class="text-primary">$1</strong>`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="relative my-8 max-w-2xl mx-auto">
        <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search Surah name or keywords in translation..."
              className="w-full pl-12 h-14 text-lg rounded-full"
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-8 space-y-8">
        {debouncedQuery.trim().length >= 3 && !isSearching && surahResults.length === 0 && verseResults.length === 0 && (
          <p className="text-center text-muted-foreground">No results found for "{debouncedQuery}".</p>
        )}

        {surahResults.length > 0 && (
          <section>
            <h2 className="text-2xl font-headline font-bold mb-4 text-primary">Surahs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surahResults.map((surah) => (
                <Link key={surah.id} href={`/surah/${surah.id}`} passHref>
                  <Card className="h-full hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-accent/20 text-accent-foreground rounded-full font-bold">
                                {surah.id}
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg">{surah.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{surah.revelationPlace}</p>
                            </div>
                        </div>
                        <p className="font-arabic text-xl text-primary">{surah.arabicName}</p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {surahResults.length > 0 && verseResults.length > 0 && <Separator className="my-8" />}

        {verseResults.length > 0 && (
          <section>
            <h2 className="text-2xl font-headline font-bold mb-4 text-primary">Verses</h2>
            <div className="space-y-4">
              {verseResults.map((verse) => (
                <Link key={verse.verse_key} href={`/surah/${verse.surahId}#verse-${verse.verseNumber}`} passHref>
                  <Card className="hover:bg-primary/5 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                        <p 
                          className="text-lg text-foreground mb-2" 
                          dangerouslySetInnerHTML={{ __html: highlightMatch(verse.text_en, debouncedQuery) }} 
                        />
                        <p className="text-sm text-muted-foreground">{verse.surahName} {verse.verse_key}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
