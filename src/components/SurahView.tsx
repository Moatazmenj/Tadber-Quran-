
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

// Helper function to wrap text on canvas
function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    setAudioFiles([]);
    setIsPlaying(false);
    setActivePopoverKey(null);
    setCurrentVerseIndex(0); 

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
    setGeneratedImage(null); // Reset on each open
    setIsShareSheetOpen(true);
    setActivePopoverKey(null);
  };

  const handleShare = async (textToShare: string) => {
    const shareData = {
      title: `Quran - Surah ${surahInfo.name}`,
      text: textToShare,
      url: window.location.href,
    };
    if (navigator.share) {
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

  useEffect(() => {
    const generateImage = async () => {
      if (!isShareSheetOpen || !textToShare) {
        return;
      }
      setIsGeneratingImage(true);
      try {
        const [arabicPartFull, translationPart] = textToShare.split('\n\n');
        
        const arabicMatch = arabicPartFull.match(/(.+) \((.+:.+)\)/);
        if (!arabicMatch) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not parse verse text for image generation.' });
            setIsGeneratingImage(false);
            return;
        }
        const arabicText = arabicMatch[1];
        const verseReference = arabicMatch[2];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = 'https://i.postimg.cc/kGrQGn9N/White-and-Blue-Delicate-Minimalist-Isra-Miraj-Personal-Instagram-Post.png';

        image.onload = () => {
            canvas.width = 1080;
            canvas.height = 1080;
            ctx.drawImage(image, 0, 0, 1080, 1080);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const arabicFont = '56px Noto Kufi Arabic';
            const refFont = '28px Alegreya';
            const translationFont = '32px PT Sans';

            ctx.font = arabicFont;
            const arabicLines = wrapText(ctx, arabicText, canvas.width - 200);
            
            ctx.font = translationFont;
            const hasTranslation = !!translationPart;
            const translationLines = hasTranslation ? wrapText(ctx, translationPart, canvas.width - 250) : [];
            
            const arabicLineHeight = 70;
            const refLineHeight = 40;
            const translationLineHeight = 45;
            const totalTextHeight = (arabicLines.length * arabicLineHeight) + refLineHeight + (translationLines.length * translationLineHeight);
            let currentY = (canvas.height - totalTextHeight) / 2 + 30;

            ctx.font = arabicFont;
            ctx.fillStyle = '#0B345B';
            ctx.direction = 'rtl';
            arabicLines.forEach((line) => {
                ctx.fillText(line, canvas.width / 2, currentY);
                currentY += arabicLineHeight;
            });

            currentY += refLineHeight / 2 - 15;
            ctx.font = refFont;
            ctx.fillStyle = '#3E6B8E';
            ctx.direction = 'ltr';
            ctx.fillText(`- ${verseReference} -`, canvas.width / 2, currentY);
            currentY += refLineHeight / 2;

            if (hasTranslation) {
                currentY += 25;
                ctx.font = translationFont;
                ctx.fillStyle = '#3E6B8E';
                translationLines.forEach((line) => {
                    ctx.fillText(line, canvas.width / 2, currentY);
                    currentY += translationLineHeight;
                });
            }

            const dataUrl = canvas.toDataURL('image/png');
            setGeneratedImage(dataUrl);
            setIsGeneratingImage(false);
        };

        image.onerror = () => {
             toast({ variant: 'destructive', title: 'Image Load Error', description: 'Could not load the background image.' });
             setIsGeneratingImage(false);
        }

      } catch (error: any) {
          console.error('Error generating image:', error);
          toast({ variant: 'destructive', title: 'Image Generation Failed', description: error.message || 'An unknown error occurred.' });
          setIsGeneratingImage(false);
      }
    };

    generateImage();
  }, [isShareSheetOpen, textToShare, toast]);

  const handleShareGeneratedImage = async () => {
    if (!generatedImage || isGeneratingImage) return;

    try {
        const blob = await fetch(generatedImage).then(res => res.blob());
        const verseReference = textToShare.match(/\((.+:.+)\)/)?.[1] || 'verse';
        const file = new File([blob], `verse-${verseReference.replace(':', '_')}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: `Quran - ${verseReference}`,
            });
        } else {
            toast({ variant: 'destructive', title: 'Cannot Share Image', description: 'Your browser does not support sharing images.' });
        }
        setIsShareSheetOpen(false);
    } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to share:', err);
          toast({
            variant: "destructive",
            title: "Share Failed",
            description: "Could not share image. Please try again.",
          });
        }
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
    }
  }, [audioFiles, toast]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioFiles.length > 0) {
        playVerse(currentVerseIndex);
      }
    }
  }, [isPlaying, audioFiles, currentVerseIndex, playVerse]);

  const handleNext = useCallback(() => {
    const nextIndex = currentVerseIndex + 1;
    if (nextIndex < audioFiles.length) {
      playVerse(nextIndex);
    } else {
      setIsPlaying(false);
      setCurrentVerseIndex(0);
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

  const handleVerseClick = (index: number) => {
    setCurrentVerseIndex(index);
    if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
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
                      const isPlayingVerse = index === currentVerseIndex && isPlaying;
                      const isSelectedVerse = index === currentVerseIndex;
                      const textToShareAndCopy = `${ayah.text_uthmani} (${surahInfo.name}:${verseNumber}) \n\n${ayah.translation || ''}`;
                      
                      return (
                        <Popover 
                            key={ayah.id}
                            open={activePopoverKey === ayah.verse_key}
                            onOpenChange={(isOpen) => {
                                setActivePopoverKey(isOpen ? ayah.verse_key : null);
                                if (isOpen) handleVerseClick(index);
                            }}
                        >
                          <PopoverTrigger asChild>
                            <div 
                                id={`verse-${verseNumber}`} 
                                className={cn(
                                  "border-b border-border/50 pb-6 last:border-b-0 last:pb-0 scroll-mt-24 transition-colors duration-300 rounded-lg p-4 -m-4 cursor-pointer", 
                                  (isSelectedVerse || isPlayingVerse) && "bg-orange-500/20"
                                )}
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
                      const isPlayingVerse = index === currentVerseIndex && isPlaying;
                      const isSelectedVerse = index === currentVerseIndex;
                      const textToShareAndCopy = `${ayah.text_uthmani} (${surahInfo.name}:${verseNumber})`;

                      return (
                        <Popover 
                            key={ayah.id}
                            open={activePopoverKey === ayah.verse_key}
                            onOpenChange={(isOpen) => {
                                setActivePopoverKey(isOpen ? ayah.verse_key : null);
                                if (isOpen) handleVerseClick(index);
                            }}
                        >
                            <PopoverTrigger asChild>
                                <span 
                                    id={`verse-${verseNumber}`} 
                                    className={cn("scroll-mt-24 transition-colors duration-300 p-1 rounded-md cursor-pointer", (isSelectedVerse || isPlayingVerse) && "bg-orange-500/20")}
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
            <SheetTitle className="text-2xl">Share as Image</SheetTitle>
          </SheetHeader>
          <div
            className="py-4 px-2 rounded-md bg-background/50 flex justify-center items-center min-h-[300px] cursor-pointer group"
            onClick={handleShareGeneratedImage}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShareGeneratedImage(); }}
          >
            {isGeneratingImage && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
            {!isGeneratingImage && generatedImage && (
              <div className="relative">
                  <img src={generatedImage} alt="Verse share preview" className="rounded-md w-full object-contain max-h-96" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <Share2 className="h-12 w-12 text-white" />
                  </div>
              </div>
            )}
            {!isGeneratingImage && !generatedImage && (
              <div className="text-center text-muted-foreground">
                <p>Could not generate image preview.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
