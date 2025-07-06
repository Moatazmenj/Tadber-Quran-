'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Ayah, Surah } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getSurahSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SurahViewProps {
  surahInfo: Surah;
  verses: Ayah[];
  surahText: string;
}

export function SurahView({ surahInfo, verses, surahText }: SurahViewProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);

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

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-4 bg-card/50">
        <CardHeader>
            <div>
                <h1 className="text-3xl md:text-4xl font-headline text-primary">
                {surahInfo.id}. {surahInfo.name}
                </h1>
                <h2 className="text-4xl md:text-5xl font-arabic text-primary">{surahInfo.arabicName}</h2>
                <p className="text-muted-foreground">{surahInfo.revelationPlace} - {surahInfo.versesCount} verses</p>
            </div>
        </CardHeader>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button onClick={handleSummarize} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <BookOpenCheck className="mr-2 h-4 w-4" />
                )}
                Summarize Surah
            </Button>
            <div className="flex items-center space-x-2">
                <Switch id="translation-toggle" checked={showTranslation} onCheckedChange={setShowTranslation} />
                <Label htmlFor="translation-toggle" className="cursor-pointer">Show Translation</Label>
            </div>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      {isLoading && !summary && (
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

      <div className="bg-muted rounded-lg p-4 md:p-8">
        {verses.length === 0 && (
            <Alert variant="destructive">
                <AlertTitle>Could Not Load Verses</AlertTitle>
                <AlertDescription>The text for this Surah could not be loaded. Please check your internet connection and try again.</AlertDescription>
            </Alert>
        )}
        
        {surahInfo.id !== 1 && surahInfo.id !== 9 && (
            <p className="text-center font-arabic text-3xl mb-8">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        )}

        <div className="space-y-8">
          {verses.map((ayah) => (
            <div key={ayah.id} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0">
              <p dir="rtl" className="font-arabic text-2xl md:text-3xl leading-loose text-foreground mb-4">
                {ayah.text_uthmani}
                <span className="text-primary font-sans font-bold text-lg mx-2">({ayah.verse_key.split(':')[1]})</span>
              </p>
              {showTranslation && (
                <div className="text-muted-foreground text-lg leading-relaxed">
                  <p><span className="text-primary font-bold mr-2">{ayah.verse_key.split(':')[1]}</span>{ayah.translation_en}</p>
                </div>
              )}
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
