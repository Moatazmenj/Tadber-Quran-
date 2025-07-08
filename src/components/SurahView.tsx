
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Ayah, Surah, AudioFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2, RefreshCw, BookText, PlayCircle, Copy, Share2 } from 'lucide-react';
import { getSurahSummary, getVerseTafsir } from '@/lib/actions';
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
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import Image from 'next/image';

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
  const [fullVerseData, setFullVerseData] = useState<Ayah[]>(initialVerses);
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
  const [verseToShare, setVerseToShare] = useState<Ayah | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedShareBackground, setSelectedShareBackground] = useState<string | null>(null);

  const [isTafsirSheetOpen, setIsTafsirSheetOpen] = useState(false);
  const [tafsirContent, setTafsirContent] = useState('');
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);
  const [tafsirError, setTafsirError] = useState('');
  const [selectedVerseForTafsir, setSelectedVerseForTafsir] = useState<{ text: string; key: string } | null>(null);

  const shareBackgrounds = [
    'https://i.postimg.cc/kGrQGn9N/White-and-Blue-Delicate-Minimalist-Isra-Miraj-Personal-Instagram-Post.png',
    'https://i.postimg.cc/bwwg0Q43/20250708-005544.png',
    'https://i.postimg.cc/pTn91NnB/20250708-005053.png',
  ];

  useEffect(() => {
    setDisplayVerses(initialVerses);
    setFullVerseData(initialVerses);
    setCurrentVerseIndex(0);
    setIsPlaying(false);
    setActivePopoverKey(null);
  }, [initialVerses]);
  
  const fetchAndStoreTranslations = useCallback(async () => {
    if (initialVerses.length === 0) return;

    setIsLoadingTranslation(true);
    setTranslationError('');

    const selectedTranslation = translationOptions.find(t => t.id === settings.translationId);
    if (!selectedTranslation) {
      setTranslationError('Selected translation not found.');
      setIsLoadingTranslation(false);
      setFullVerseData(initialVerses.map(v => ({ ...v, translation: undefined })));
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
      setFullVerseData(versesWithTranslations);
    } catch (e: any) {
      console.error('Translation fetch error:', e);
      setTranslationError('Could not load translation. Please check your connection and try again.');
      setFullVerseData(initialVerses.map(v => ({ ...v, translation: undefined })));
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [settings.translationId, initialVerses, surahInfo.id]);

  useEffect(() => {
    fetchAndStoreTranslations();
  }, [fetchAndStoreTranslations]);

  useEffect(() => {
    if (settings.showTranslation) {
      setDisplayVerses(fullVerseData);
    } else {
      setDisplayVerses(initialVerses);
    }
  }, [settings.showTranslation, fullVerseData, initialVerses]);


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

  useEffect(() => {
    const generateImage = async () => {
      if (isShareSheetOpen && verseToShare && selectedShareBackground) {
        setIsGeneratingImage(true);
        setGeneratedImageUrl(null);

        try {
          const verseNumber = verseToShare.verse_key.split(':')[1];
          const fullVerse = fullVerseData.find(v => v.id === verseToShare.id) || verseToShare;
          
          const arabicText = fullVerse.text_uthmani;
          const translationText = fullVerse.translation || '';
          const verseReference = `${surahInfo.name}: ${verseNumber}`;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Could not load background image.'));
            img.src = selectedShareBackground;
          });

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
          const hasTranslation = !!translationText;
          const translationLines = hasTranslation ? wrapText(ctx, translationText, canvas.width - 250) : [];
          
          const arabicLineHeight = 70;
          const refLineHeight = 40;
          const translationLineHeight = 45;
          const totalTextHeight = (arabicLines.length * arabicLineHeight) + (hasTranslation ? 25 : 0) + (translationLines.length * translationLineHeight) + refLineHeight;
          let currentY = (canvas.height - totalTextHeight) / 2 + 30;

          // Draw Arabic
          ctx.font = arabicFont;
          ctx.fillStyle = '#0B345B';
          ctx.direction = 'rtl';
          arabicLines.forEach((line) => {
              ctx.fillText(line, canvas.width / 2, currentY);
              currentY += arabicLineHeight;
          });

          // Draw Translation
          if (hasTranslation) {
              currentY += 25;
              ctx.font = translationFont;
              ctx.fillStyle = '#3E6B8E';
              ctx.direction = 'ltr';
              translationLines.forEach((line) => {
                  ctx.fillText(line, canvas.width / 2, currentY);
                  currentY += translationLineHeight;
              });
          }

          // Draw Reference (Surah Name and Verse Number)
          currentY += refLineHeight;
          ctx.font = refFont;
          ctx.fillStyle = '#3E6B8E';
          ctx.direction = 'ltr';
          ctx.fillText(`- ${verseReference} -`, canvas.width / 2, currentY);
          
          setGeneratedImageUrl(canvas.toDataURL('image/png'));
        } catch (err) {
            console.error("Image generation failed:", err);
            toast({
                variant: 'destructive',
                title: 'Image Generation Failed',
                description: 'Could not create the image. Please try again.'
            });
            setIsShareSheetOpen(false);
        } finally {
            setIsGeneratingImage(false);
        }
      }
    };

    generateImage();
  }, [isShareSheetOpen, verseToShare, selectedShareBackground, toast, surahInfo.name, fullVerseData]);


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

  const handlePerformShare = async () => {
    if (!generatedImageUrl || !verseToShare) return;
  
    const verseReference = verseToShare.verse_key.replace(':', '_');
  
    try {
      const blob = await (await fetch(generatedImageUrl)).blob();
      const file = new File([blob], `verse-${verseReference}.png`, { type: 'image/png' });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Quran - ${verseToShare.verse_key}`,
        });
      } else {
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `verse-${verseReference}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast({
          title: "Image Downloaded",
          description: "Direct sharing is not supported, so the image was downloaded instead.",
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to share:', err);
        toast({
          variant: "destructive",
          title: "Share Failed",
          description: err.message || "Could not share image. Please try again.",
        });
      }
    } finally {
      setIsShareSheetOpen(false);
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

  const handleTafsir = async (ayah: Ayah) => {
    const verseNumber = ayah.verse_key.split(':')[1];
    const fullAyah = fullVerseData.find(v => v.id === ayah.id) || ayah;

    if (!fullAyah) return;
    
    setSelectedVerseForTafsir({
        text: fullAyah.text_uthmani,
        key: `${surahInfo.name}:${verseNumber}`
    });
    setIsTafsirSheetOpen(true);
    setIsLoadingTafsir(true);
    setTafsirContent('');
    setTafsirError('');

    try {
      const result = await getVerseTafsir({
        surahName: surahInfo.name,
        verseNumber: verseNumber,
        verseText: fullAyah.text_uthmani,
        verseTranslation: fullAyah.translation || 'No translation available.',
      });
      setTafsirContent(result);
    } catch (e) {
      setTafsirError('Failed to generate Tafsir. Please try again later.');
      console.error(e);
    } finally {
      setIsLoadingTafsir(false);
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

          {(isLoadingTranslation && settings.showTranslation) && (
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
                      const fullAyah = fullVerseData[index] || ayah;
                      const textToCopy = `${fullAyah.text_uthmani} (${surahInfo.name}:${verseNumber}) \n\n${fullAyah.translation || ''}`;
                      
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
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleTafsir(fullAyah); setActivePopoverKey(null); }}>
                                    <BookText className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleCopy(textToCopy); setActivePopoverKey(null); }}>
                                    <Copy className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setVerseToShare(fullAyah); setIsShareSheetOpen(true); setActivePopoverKey(null); }}>
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
                      const fullAyah = fullVerseData[index] || ayah;
                      const textToCopy = `${fullAyah.text_uthmani} (${surahInfo.name}:${verseNumber}) \n\n${fullAyah.translation || ''}`;

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
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleTafsir(fullAyah); setActivePopoverKey(null); }}>
                                        <BookText className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { handleCopy(textToCopy); setActivePopoverKey(null); }}>
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setVerseToShare(fullAyah); setIsShareSheetOpen(true); setActivePopoverKey(null); }}>
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
                      <Button variant="secondary" size="sm" onClick={fetchAndStoreTranslations}>
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

      <Sheet 
        open={isShareSheetOpen} 
        onOpenChange={(isOpen) => {
          setIsShareSheetOpen(isOpen);
          if (!isOpen) {
            setGeneratedImageUrl(null);
            setSelectedShareBackground(null);
            setVerseToShare(null);
          }
        }}
      >
        <SheetContent side="bottom" className="w-full max-w-xl mx-auto h-[90vh] flex flex-col rounded-t-2xl">
            <SheetHeader className="text-center">
                <SheetTitle>Share Verse</SheetTitle>
                <SheetDescription>
                    {generatedImageUrl || isGeneratingImage ? 'Your image is ready to share.' : 'Choose a style for your shareable image.'}
                </SheetDescription>
            </SheetHeader>
            <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-0">
                {isGeneratingImage ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generating Image...</p>
                    </div>
                ) : generatedImageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={generatedImageUrl}
                            alt="Generated verse to share"
                            className="object-contain max-w-full max-h-full rounded-lg shadow-lg"
                        />
                    </div>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        {shareBackgrounds.map((bg, index) => (
                            <div 
                                key={index} 
                                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 group"
                                onClick={() => setSelectedShareBackground(bg)}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedShareBackground(bg)}}
                            >
                                <Image
                                    src={bg}
                                    alt={`Background option ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
            <SheetFooter className="p-4 border-t border-border/20">
                {generatedImageUrl && !isGeneratingImage && (
                    <div className="w-full space-y-2">
                        <Button onClick={handlePerformShare} className="w-full">
                            Share Now
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setGeneratedImageUrl(null);
                                setSelectedShareBackground(null);
                            }} 
                            className="w-full"
                        >
                            Change Style
                        </Button>
                    </div>
                )}
            </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isTafsirSheetOpen} onOpenChange={setIsTafsirSheetOpen}>
        <SheetContent side="bottom" className="w-full max-w-2xl mx-auto h-[75vh] flex flex-col rounded-t-2xl">
            <SheetHeader className="text-left pb-4 border-b border-border/20" dir="rtl">
                <SheetTitle className="text-right">تفسير الآية: {selectedVerseForTafsir?.key}</SheetTitle>
                <SheetDescription className="font-arabic text-lg text-foreground/90 text-right pt-2">
                    {selectedVerseForTafsir?.text}
                </SheetDescription>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto p-4" dir="rtl">
                {isLoadingTafsir ? (
                    <div className="space-y-4 pt-4">
                        <div className="h-4 bg-muted-foreground/10 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-5/6 animate-pulse"></div>
                    </div>
                ) : tafsirError ? (
                    <Alert variant="destructive">
                        <AlertTitle>خطأ</AlertTitle>
                        <AlertDescription>{tafsirError}</AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-lg leading-relaxed whitespace-pre-wrap font-arabic text-right">
                        {tafsirContent}
                    </p>
                )}
            </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
