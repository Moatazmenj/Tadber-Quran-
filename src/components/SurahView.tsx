
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Ayah, Surah, AudioFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2, RefreshCw, BookText, PlayCircle, Copy, Share2 } from 'lucide-react';
import { getSurahSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { useToast } from '@/hooks/use-toast';
import { translationOptions } from '@/lib/translations';
import { reciters } from '@/lib/reciters';
import { AudioPlayerBar } from './AudioPlayerBar';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SurahViewProps {
  surahInfo: Surah;
  verses: Ayah[];
  surahText: string;
}

export function SurahView({ surahInfo, verses: initialVerses, surahText }: SurahViewProps) {
  const { settings, setSetting } = useQuranSettings();
  const { toast } = useToast();
  
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  
  const [displayVerses, setDisplayVerses] = useState<Ayah[]>(initialVerses);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState('');

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activePopoverKey, setActivePopoverKey] = useState<string | null>(null);

  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [textToShare, setTextToShare] = useState('');

  useEffect(() => {
    setDisplayVerses(initialVerses);
    setCurrentVerseIndex(0);
    setIsPlaying(false);
    setActivePopoverKey(null);
  }, [initialVerses]);
  
  const fetchTranslations = useCallback(async () => {
    if (initialVerses.length === 0) return;

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
      if (!response.ok) throw new Error(`Failed to fetch translation: ${response.statusText}`);
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
    if (settings.showTranslation) {
      fetchTranslations();
    } else {
      setDisplayVerses(initialVerses);
    }
  }, [fetchTranslations, settings.showTranslation, initialVerses]);

  const fetchAudio = useCallback(async () => {
    // Stop any currently playing audio and reset state
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    setAudioFiles([]);
    setIsPlaying(false);
    setActivePopoverKey(null);
    setCurrentVerseIndex(0); // Reset verse index on new audio fetch

    setIsLoadingAudio(true);
    setAudioError('');
    try {
      const response = await fetch(`https://api.quran.com/api/v4/recitations/${settings.reciterId}/by_chapter/${surahInfo.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audio data');
      }
      const data = await response.json();
      setAudioFiles(data.audio_files || []);
    } catch (e: any) {
      console.error('Failed to fetch audio', e);
      setAudioError('Could not load audio. Please check your connection or try a different reciter.');
      setAudioFiles([]);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [surahInfo.id, settings.reciterId]);


  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);


  const handleSummarize = async () => {
    setIsLoadingSummary(true);
    setSummaryError('');
    setSummary('');
    try {
      if (!surahText) throw new Error("Surah text is not available to summarize.");
      const result = await getSurahSummary(surahInfo.name, surahText);
      setSummary(result);
    } catch (e) {
      setSummaryError('Failed to generate summary. Please try again later.');
      console.error(e);
    }
    setIsLoadingSummary(false);
  };
  
  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The verse has been copied successfully.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy the text.",
      });
    });
  };

  const handleShareIconClick = (text: string) => {
    setTextToShare(text);
    setIsShareSheetOpen(true);
    setActivePopoverKey(null);
  };

  const handleShare = async (textToShare: string) => {
    const shareData = {
      title: `Quran - Surah ${surahInfo.name}`,
      text: textToShare,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to share:', err);
          toast({
            variant: "destructive",
            title: "Share Failed",
            description: "Could not share. Copied to clipboard instead.",
          });
          handleCopy(textToShare);
        }
      }
    } else {
      toast({
        title: "Share Not Available",
        description: "Web Share is not supported on your browser. Copied to clipboard instead.",
      });
      handleCopy(textToShare);
    }
  };

  const playVerse = useCallback((index: number) => {
    if (index >= 0 && index < audioFiles.length) {
      const audioUrl = audioFiles[index]?.audio_url;
      if (audioRef.current && audioUrl) {
        audioRef.current.src = `https://verses.quran.com/${audioUrl}`;
        audioRef.current.play().catch(e => {
            console.error("Audio play failed:", e);
            toast({
              variant: 'destructive',
              title: 'Audio Error',
              description: 'Could not play the audio file.'
            });
            setIsPlaying(false);
        });
        setCurrentVerseIndex(index);
        setIsPlaying(true);
        const verseNum = audioFiles[index].verse_key.split(':')[1];
        const verseElement = document.getElementById(`verse-${verseNum}`);
        verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!audioUrl) {
        toast({
          variant: 'destructive',
          title: 'Audio Not Available',
          description: 'Audio for this verse is not available with the current reciter.',
        });
      }
    } else {
      setIsPlaying(false);
      // If we reach the end, reset index but don't auto-set to 0
    }
  }, [audioFiles, toast]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioFiles.length > 0) {
        // If no verse is selected (index 0) or it's paused, play current/first verse.
        playVerse(currentVerseIndex);
      }
    }
  }, [isPlaying, audioFiles, currentVerseIndex, playVerse]);

  const handleNext = useCallback(() => {
    const nextIndex = currentVerseIndex + 1;
    if (nextIndex < audioFiles.length) {
      playVerse(nextIndex);
    } else {
      // Reached the end of the surah
      setIsPlaying(false);
      setCurrentVerseIndex(0); // Optional: reset to beginning
    }
  }, [currentVerseIndex, playVerse, audioFiles.length]);

  const handlePrev = useCallback(() => {
    const prevIndex = currentVerseIndex - 1;
    if (prevIndex >= 0) {
      playVerse(prevIndex);
    }
  }, [currentVerseIndex, playVerse]);


  const handleAudioEnded = () => {
    handleNext();
  };

  const handleVerseSelect = (index: number) => {
    setCurrentVerseIndex(index);
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  };

  const VerseSkeleton = () => (
    <div className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0 animate-pulse">
        <div className="h-8 bg-muted-foreground/10 rounded w-full mb-4"></div>
        {settings.showTranslation && <div className="h-6 bg-muted-foreground/10 rounded w-3/4 mx-auto"></div>}
    </div>
  );

  const selectedReciter = reciters.find(r => r.id === settings.reciterId);
  const currentVerseNumber = audioFiles[currentVerseIndex] 
    ? parseInt(audioFiles[currentVerseIndex].verse_key.split(':')[1], 10) 
    : 1;
    
  const [arabicPart, translationPart] = textToShare.split('\n\n');

  return (
    <>
      <div className="max-w-4xl mx-auto pb-28">
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
                  {displayVerses.map((ayah, index) => {
                      const verseNumber = ayah.verse_key.split(':')[1];
                      const verseEndSymbol = `\u06dd${Number(verseNumber).toLocaleString('ar-EG')}`;
                      const isSelectedOrPlayingVerse = index === currentVerseIndex;
                      const textToShareAndCopy = `${ayah.text_uthmani} (${surahInfo.name}:${verseNumber}) \n\n${ayah.translation || ''}`;
                      
                      return (
                        <Popover 
                            key={ayah.id}
                            open={activePopoverKey === ayah.verse_key}
                            onOpenChange={(isOpen) => {
                                setActivePopoverKey(isOpen ? ayah.verse_key : null);
                                if (isOpen) handleVerseSelect(index);
                            }}
                        >
                          <PopoverTrigger asChild>
                            <div 
                                id={`verse-${verseNumber}`} 
                                className={cn("border-b border-border/50 pb-6 last:border-b-0 last:pb-0 scroll-mt-24 transition-colors duration-300 rounded-lg cursor-pointer", isSelectedOrPlayingVerse && "bg-orange-500/20 p-4")}
                            >
                                <p 
                                    dir="rtl" 
                                    className="font-arabic leading-loose text-foreground mb-4 text-center"
                                    style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                                >
                                    {ayah.text_uthmani}
                                    <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                                </p>
                              <div className="text-muted-foreground text-lg leading-relaxed text-center">
                                  {ayah.translation ? (
                                    <p><span className="text-primary font-bold mr-2">{verseNumber}</span>{ayah.translation}</p>
                                  ) : (
                                    !translationError && <p className="text-sm">Loading translation...</p>
                                  )}
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1" side="bottom" align="center">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => playVerse(index)}>
                                    <PlayCircle className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                                    <BookText className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleCopy(textToShareAndCopy); setActivePopoverKey(null); }}>
                                    <Copy className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleShareIconClick(textToShareAndCopy)}>
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                      const verseEndSymbol = `\u06dd${Number(verseNumber).toLocaleString('ar-EG')}`;
                      const isSelectedOrPlayingVerse = index === currentVerseIndex;
                      const textToShareAndCopy = `${ayah.text_uthmani} (${surahInfo.name}:${verseNumber})`;

                      return (
                        <Popover 
                            key={ayah.id}
                            open={activePopoverKey === ayah.verse_key}
                            onOpenChange={(isOpen) => {
                                setActivePopoverKey(isOpen ? ayah.verse_key : null);
                                if (isOpen) handleVerseSelect(index);
                            }}
                        >
                            <PopoverTrigger asChild>
                                <span 
                                    id={`verse-${verseNumber}`} 
                                    className={cn("scroll-mt-24 transition-colors duration-300 p-1 rounded-md cursor-pointer", isSelectedOrPlayingVerse && "bg-orange-500/20")}
                                >
                                    {ayah.text_uthmani}
                                    <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                                    {' '}
                                </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1" side="bottom" align="center">
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => playVerse(index)}>
                                        <PlayCircle className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                                        <BookText className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleCopy(textToShareAndCopy); setActivePopoverKey(null); }}>
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleShareIconClick(textToShareAndCopy)}>
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
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

          {audioError && (
              <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Audio Error</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                      <span>{audioError}</span>
                      <Button variant="secondary" size="sm" onClick={fetchAudio}>
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
      <audio ref={audioRef} onEnded={handleAudioEnded} />
      {audioFiles && audioFiles.length > 0 && (
        <AudioPlayerBar
          surah={surahInfo}
          isPlaying={isPlaying}
          currentVerse={currentVerseNumber}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          reciterName={selectedReciter?.name || 'Loading...'}
        />
      )}
      <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-lg max-w-4xl mx-auto border-none bg-card/90 backdrop-blur-md p-6">
          <SheetHeader className="text-center mb-4">
            <SheetTitle className="text-2xl">Share Verse</SheetTitle>
          </SheetHeader>
          <div className="py-4 px-2 rounded-md bg-background/50 text-center text-lg max-h-48 overflow-y-auto">
              <p className="font-arabic">{arabicPart}</p>
              {translationPart && <p className="text-base text-muted-foreground mt-2">{translationPart}</p>}
          </div>
          <div className="pt-6">
            <Button size="lg" className="w-full" onClick={() => {
              handleShare(textToShare);
              setIsShareSheetOpen(false);
            }}>
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
