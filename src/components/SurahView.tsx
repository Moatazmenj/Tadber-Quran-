'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Ayah, Surah } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getSurahSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SurahViewProps {
  surahInfo: Surah;
  verses: Ayah[];
  surahText: string;
}

export function SurahView({ surahInfo, verses, surahText }: SurahViewProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
        if (!surahText) {
            throw new Error("Surah text is not available to summarize.");
        }
      const result = await getSurahSummary(surahInfo.name, surahText);
      setSummary(result);
    } catch (e) {
      setError('Failed to generate summary. Please try again later.');
      console.error(e);
    }
    setIsLoading(false);
  };

  const hasBismillah = surahInfo.id !== 1 && surahInfo.id !== 9;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8 bg-card/50">
        <CardHeader className="flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-headline text-primary">
              {surahInfo.id}. {surahInfo.name}
            </h1>
            <h2 className="text-4xl md:text-5xl font-arabic text-primary">{surahInfo.arabicName}</h2>
            <p className="text-muted-foreground">{surahInfo.revelationPlace} - {surahInfo.versesCount} verses</p>
          </div>
          <Button onClick={handleSummarize} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BookOpenCheck className="mr-2 h-4 w-4" />
            )}
            Summarize Surah
          </Button>
        </CardHeader>
      </Card>

      {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {isLoading && (
         <Card className="mb-4 animate-pulse">
            <CardHeader>
                <CardTitle className="font-headline">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
        </Card>
      )}
      {summary && (
        <Card className="mb-8 bg-primary/5">
           <CardHeader>
             <CardTitle className="font-headline text-primary">Surah Summary</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-lg leading-relaxed">{summary}</p>
           </CardContent>
         </Card>
      )}

      <div className="bg-card rounded-lg p-4 md:p-8">
        {verses.length === 0 && !surahText && (
            <Alert variant="destructive">
                <AlertTitle>Could Not Load Verses</AlertTitle>
                <AlertDescription>The text for this Surah could not be loaded. Please check your internet connection and try again.</AlertDescription>
            </Alert>
        )}
        
        {surahInfo.id !== 1 && surahInfo.id !== 9 && (
            <p className="text-center font-arabic text-3xl mb-8">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        )}

        <div dir="rtl" className="space-y-6">
          {verses.map((ayah) => (
            <div key={ayah.id} className="flex items-start gap-4">
              <span className="text-sm font-bold text-primary">{ayah.verse_key.split(':')[1]}</span>
              <p className="font-arabic text-2xl md:text-3xl leading-loose text-foreground">
                {ayah.text_uthmani}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        {surahInfo.id > 1 ? (
          <Link href={`/surah/${surahInfo.id - 1}`} passHref>
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Surah
            </Button>
          </Link>
        ) : <div />}
        {surahInfo.id < 114 ? (
          <Link href={`/surah/${surahInfo.id + 1}`} passHref>
            <Button variant="outline">
              Next Surah
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ): <div />}
      </div>
    </div>
  );
}
