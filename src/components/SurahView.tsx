'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Ayah, Surah } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { getSurahSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { translationOptions } from '@/lib/translations';

interface SurahViewProps {
  surahInfo: Surah;
  verses: Ayah[];
  surahText: string;
}

export function SurahView({ surahInfo, verses: initialVerses, surahText }: SurahViewProps) {
  const { settings, setSetting } = useQuranSettings();
  
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const [displayVerses, setDisplayVerses] = useState<Ayah[]>(initialVerses);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState('');

  // This effect ensures that if the user navigates between Surahs (changing initialVerses),
  // the component's state is correctly reset before fetching new data.
  useEffect(() => {
    setDisplayVerses(initialVerses);
    // When verses change, also fetch new translations.
    fetchTranslations();
  }, [initialVerses]);

  const fetchTranslations = useCallback(async () => {
    if (initialVerses.length === 0) {
        return;
    }

    setIsLoadingTranslation(true);
    setTranslationError('');

    const selectedTranslation = translationOptions.find(t => t.id === settings.translationId);
    if (!selectedTranslation) {
      setTranslationError('Selected translation not found.');
      setIsLoadingTranslation(false);
      setDisplayVerses(initialVerses.map(v => ({ ...v, translation: undefined })));
      return;
    }

    try {
      const response = await fetch(`https://api.quran.com/api/v4/quran/translations/${selectedTranslation.apiId}?chapter_number=${surahInfo.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch translation: ${response.statusText}`);
      }
      const translationData = await response.json();
      
      const versesWithTranslations = initialVerses.map((verse, index) => ({
        ...verse,
        translation: translationData.translations[index]?.text.replace(/<sup.*?<\/sup>/g, '') || 'Translation not available.'
      }));

      setDisplayVerses(versesWithTranslations);

    } catch (e: any) {
      console.error('Translation fetch error:', e);
      setTranslationError('Could not load translation. Please check your connection and try again.');
      setDisplayVerses(initialVerses.map(v => ({ ...v, translation: undefined })));
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [settings.translationId, initialVerses, surahInfo.id]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  const handleSummarize = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    setSummary('');
    try {
        if (!surahText) {
            throw new Error("Surah text is not available to summarize.");
        }
      const result = await getSurahSummary(surahInfo.name, surahText);
      setSummary(result);
    } catch (e) {
      setSummaryError('Failed to generate summary. Please try again later.');
      console.error(e);
    }
    setIsLoadingSummary(false);
  };

  const VerseSkeleton = () => (
    <div className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0 animate-pulse">
        <div className="h-8 bg-muted-foreground/10 rounded w-full mb-4"></div>
        {settings.showTranslation && <div className="h-6 bg-muted-foreground/10 rounded w-3/4 mx-auto"></div>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8 surah-view-card">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button onClick={handleSummarize} disabled={isLoadingSummary} className="w-full sm:w-auto">
                {isLoadingSummary ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <BookOpenCheck className="mr-2 h-4 w-4" />
                )}
                Summarize Surah
            </Button>
            <div className="flex items-center space-x-2">
                <Switch 
                  id="translation-toggle" 
                  checked={settings.showTranslation} 
                  onCheckedChange={(checked) => setSetting('showTranslation', checked)} 
                />
                <Label htmlFor="translation-toggle" className="cursor-pointer">Show Translation</Label>
            </div>
        </CardContent>
      </Card>

      {summaryError && <Alert variant="destructive" className="mb-4"><AlertTitle>Error</AlertTitle><AlertDescription>{summaryError}</AlertDescription></Alert>}
      {isLoadingSummary && !summary && (
         <Card className="mb-4 animate-pulse surah-view-card">
            <CardContent className="p-6 space-y-2">
                <div className="h-4 bg-muted-foreground/10 rounded w-full"></div>
                <div className="h-4 bg-muted-foreground/10 rounded w-5/6"></div>
                <div className="h-4 bg-muted-foreground/10 rounded w-3/4"></div>
            </CardContent>
        </Card>
      )}
      {summary && (
        <Card className="mb-8 surah-view-card">
           <CardContent className="p-6">
             <p className="text-lg leading-relaxed">{summary}</p>
           </CardContent>
         </Card>
      )}

      <div className="surah-view-card rounded-lg p-4 md:p-8">
        {initialVerses.length === 0 && !isLoadingTranslation && (
            <Alert variant="destructive">
                <AlertTitle>Could Not Load Verses</AlertTitle>
                <AlertDescription>The text for this Surah could not be loaded. Please check your internet connection and try again.</AlertDescription>
            </Alert>
        )}
        
        {surahInfo.id !== 1 && surahInfo.id !== 9 && (
            <p className="text-center font-arabic text-3xl mb-8">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        )}

        {(isLoadingTranslation || (displayVerses.length === 0 && initialVerses.length > 0)) && (
            <div className="space-y-8">
                {Array.from({ length: 5 }).map((_, i) => <VerseSkeleton key={i} />)}
            </div>
        )}
        
        {!isLoadingTranslation && displayVerses.length > 0 && settings.showTranslation && (
            <div className="space-y-8">
                {displayVerses.map((ayah) => {
                    const verseNumber = ayah.verse_key.split(':')[1];
                    const verseNumberArabic = Number(verseNumber).toLocaleString('ar-EG');
                    const verseEndSymbol = `\u06dd${verseNumberArabic}`;
                    
                    return (
                        <div key={ayah.id} id={`verse-${verseNumber}`} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0 scroll-mt-24">
                        <p 
                            dir="rtl" 
                            className="font-arabic leading-loose text-foreground mb-4 text-center"
                            style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                        >
                            {ayah.text_uthmani}
                            <span 
                                className="text-primary font-sans font-normal mx-1"
                                style={{ fontSize: `${settings.fontSize * 0.8}px` }}
                            >{verseEndSymbol}</span>
                        </p>
                        <div className="text-muted-foreground text-lg leading-relaxed text-center">
                            {ayah.translation ? (
                                <p><span className="text-primary font-bold mr-2">{verseNumber}</span>{ayah.translation}</p>
                            ) : (
                                !translationError && <p className="text-sm">Loading translation...</p>
                            )}
                        </div>
                        </div>
                    );
                })}
            </div>
        )}

        {!isLoadingTranslation && displayVerses.length > 0 && !settings.showTranslation && (
             <div
                dir="rtl"
                className="font-arabic leading-loose text-foreground text-justify"
                style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
            >
                {displayVerses.map((ayah, index) => {
                    const verseNumber = ayah.verse_key.split(':')[1];
                    const verseNumberArabic = Number(verseNumber).toLocaleString('ar-EG');
                    const verseEndSymbol = `\u06dd${verseNumberArabic}`;
                    return (
                        <span key={ayah.id} id={`verse-${verseNumber}`} className="scroll-mt-24">
                            {ayah.text_uthmani}
                            <span 
                                className="text-primary font-sans font-normal mx-1"
                                style={{ fontSize: `${settings.fontSize * 0.8}px` }}
                            >
                                {verseEndSymbol}
                            </span>
                            {' '}
                        </span>
                    );
                })}
            </div>
        )}

        {translationError && (
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Translation Error</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                    <span>{translationError}</span>
                    <Button variant="secondary" size="sm" onClick={fetchTranslations}>
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        )}
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
