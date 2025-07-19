
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { Ayah, Surah, Reciter, TranslationOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpenCheck, ChevronLeft, ChevronRight, Loader2, RefreshCw, BookText, Copy, Share2, Languages, X, Bookmark, Play, Pause, Headphones, Check } from 'lucide-react';
import { getVerseTafsir, getSurahSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { useToast } from '@/hooks/use-toast';
import { translationOptions } from '@/lib/translations';
import { reciters } from '@/lib/reciters';
import { cn, toArabicNumerals } from '@/lib/utils';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SurahViewProps {
  surahInfo: Surah;
  verses: Ayah[];
  surahText: string;
}

const BOOKMARKS_KEY = 'quranBookmarks';

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
  const [selectedVerseForTafsir, setSelectedVerseForTafsir] = useState<Ayah | null>(null);
  const [tafsirLanguage, setTafsirLanguage] = useState('English');
  const [isLangPopoverOpen, setIsLangPopoverOpen] = useState(false);

  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>([]);
  
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [isReciterSheetOpen, setIsReciterSheetOpen] = useState(false);

  const tafsirLanguages = [
    { id: 'english', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { id: 'arabic', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    ...translationOptions
      .filter(t => t.id !== 'en' && t.id !== 'fr')
      .map(t => ({ id: t.language.toLowerCase(), name: t.language, nativeName: t.nativeName, flag: t.flag })),
    { id: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ];


  useEffect(() => {
    const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    if (savedBookmarks) {
      setBookmarkedVerses(JSON.parse(savedBookmarks));
    }
  }, []);

  useEffect(() => {
    const currentReciter = reciters.find(r => r.id === settings.reciterId) || reciters[0];
    setReciter(currentReciter);
  }, [settings.reciterId]);


  useEffect(() => {
    if (showAudioPlayer) {
      document.body.classList.add('audio-player-visible');
    } else {
      document.body.classList.remove('audio-player-visible');
    }

    return () => {
      document.body.classList.remove('audio-player-visible');
    };
  }, [showAudioPlayer]);
  
  
  const playVerse = useCallback((verseNumber: number, reciterToUse?: Reciter | null) => {
    const currentReciter = reciterToUse || reciter;
    if (!audioRef.current || !currentReciter?.server) return;
    
    setAudioError(null);
    const surahNumPadded = String(surahInfo.id).padStart(3, '0');
    const verseNumPadded = String(verseNumber).padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/${currentReciter.server}/${surahNumPadded}${verseNumPadded}.mp3`;
    
    if (audioRef.current.src !== audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.error("Audio play error", e);
        setAudioError('Could not play audio. The file might not be available.');
        setIsPlaying(false);
      });
    }

    const verseElement = document.getElementById(`verse-${verseNumber}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [reciter, surahInfo.id]);

  
  const handleNextVerse = useCallback(() => {
    setCurrentVerse(v => {
      if (v < surahInfo.versesCount) {
        const nextVerse = v + 1;
        playVerse(nextVerse);
        return nextVerse;
      }
      setIsPlaying(false);
      return v;
    });
  }, [surahInfo.versesCount, playVerse]);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    const audio = audioRef.current;
  
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => handleNextVerse();
    const handleError = (e: Event) => {
        const mediaError = (e.target as HTMLAudioElement).error;
        console.error('Audio Element Error:', mediaError);
        setAudioError('Could not play audio. The file might not be available.');
        setIsPlaying(false);
    };
  
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
  
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleNextVerse]);
  
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      playVerse(currentVerse);
    }
  };
  
  const handleStartPlaybackFromVerse = (verseNumber: number) => {
    setActivePopoverKey(null);
    setShowAudioPlayer(true);
    setCurrentVerse(verseNumber);
    // Let the state update then trigger playVerse
    setTimeout(() => playVerse(verseNumber), 0);
  };

  const handleNext = () => {
    if (currentVerse < surahInfo.versesCount) {
      const nextVerse = currentVerse + 1;
      setCurrentVerse(nextVerse);
      playVerse(nextVerse);
    }
  };

  const handlePrev = () => {
    if (currentVerse > 1) {
      const prevVerse = currentVerse - 1;
      setCurrentVerse(prevVerse);
      playVerse(prevVerse);
    }
  };

  const handleStopAndClosePlayer = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
    }
    setShowAudioPlayer(false);
    setIsPlaying(false);
  };

  const handleChangeReciter = (reciterId: number) => {
    setSetting('reciterId', reciterId);
    setIsReciterSheetOpen(false);
    setAudioError(null);
    const newReciter = reciters.find(r => r.id === reciterId);

    if (showAudioPlayer && isPlaying) {
        if (audioRef.current) {
            audioRef.current.pause();
            setTimeout(() => {
              playVerse(currentVerse, newReciter);
            }, 100);
        }
    }
  };

  const toggleBookmark = (verseKey: string) => {
    let updatedBookmarks;
    if (bookmarkedVerses.includes(verseKey)) {
        updatedBookmarks = bookmarkedVerses.filter((key) => key !== verseKey);
        toast({
            title: "Bookmark Removed",
        });
    } else {
        updatedBookmarks = [...bookmarkedVerses, verseKey];
        toast({
            title: "Verse Bookmarked",
        });
    }
    setBookmarkedVerses(updatedBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    setActivePopoverKey(null);
  };

  const shareBackgrounds = [
    'https://i.postimg.cc/kGrQGn9N/White-and-Blue-Delicate-Minimalist-Isra-Miraj-Personal-Instagram-Post.png',
    'https://i.postimg.cc/bwwg0Q43/20250708-005544.png',
    'https://i.postimg.cc/pTn91NnB/20250708-005053.png',
  ];

  useEffect(() => {
    setDisplayVerses(initialVerses);
    setFullVerseData(initialVerses);
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
      const versesWithoutTranslation = initialVerses.map(v => ({ ...v, translation: 'Translation not available.' }));
      setFullVerseData(versesWithoutTranslation);
      setDisplayVerses(versesWithoutTranslation);
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
      setDisplayVerses(versesWithTranslations);

    } catch (e: any) {
      console.error('Translation fetch error:', e);
      setTranslationError('Could not load translation. Please check your connection and try again.');
      const versesWithFetchError = initialVerses.map(v => ({ ...v, translation: 'Translation not available.' }));
      setFullVerseData(versesWithFetchError);
      setDisplayVerses(versesWithFetchError);
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [settings.translationId, initialVerses, surahInfo.id]);

  useEffect(() => {
    fetchAndStoreTranslations();
  }, [fetchAndStoreTranslations]);


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

          // Calculate aspect ratio and dimensions to fit within canvas
          const aspectRatio = image.width / image.height;
          let newWidth = canvas.width;
          let newHeight = canvas.height;

          if (aspectRatio > 1) { // Image is wider than tall
            newHeight = canvas.width / aspectRatio;
          } else { // Image is taller than wide or square
            newWidth = canvas.height * aspectRatio;
          }

          // Calculate center position
          const x = (canvas.width - newWidth) / 2;
          const y = (canvas.height - newHeight) / 2;
          ctx.drawImage(image, x, y, newWidth, newHeight);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const arabicFont = `56px ${settings.fontStyle === 'indopak' ? "'Noto Naskh Arabic'" : (settings.fontStyle === 'uthmanic' ? "'Noto Naskh Arabic'" : "'Noto Kufi Arabic'")}`;
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
  }, [isShareSheetOpen, verseToShare, selectedShareBackground, toast, surahInfo.name, fullVerseData, settings.fontStyle]);


  useEffect(() => {
    if (!isTafsirSheetOpen || !selectedVerseForTafsir) {
      return;
    }

    const fetchTafsir = async () => {
      setIsLoadingTafsir(true);
      setTafsirContent('');
      setTafsirError('');

      try {
        const verseNumber = selectedVerseForTafsir.verse_key.split(':')[1];
        const fullVerse = fullVerseData.find(v => v.id === selectedVerseForTafsir.id) || selectedVerseForTafsir;

        const result = await getVerseTafsir({
          surahName: surahInfo.name,
          verseNumber: verseNumber,
          verseText: fullVerse.text_uthmani,
          verseTranslation: fullVerse.translation || 'No translation available.',
          targetLanguage: tafsirLanguage,
        });
        setTafsirContent(result.tafsir);
      } catch (e: any) {
        setTafsirError(e.message || 'Failed to generate Tafsir. Please try again later.');
        console.error(e);
      } finally {
        setIsLoadingTafsir(false);
      }
    };

    fetchTafsir();
  }, [isTafsirSheetOpen, selectedVerseForTafsir, tafsirLanguage, fullVerseData, surahInfo.name]);


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

  const handleTafsir = (ayah: Ayah) => {
    setSelectedVerseForTafsir(ayah);
    setTafsirLanguage('Arabic'); // Always default to Arabic when opening
    setIsTafsirSheetOpen(true);
  };

  const VerseSkeleton = () => (
    <div className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0 animate-pulse">
        <div className="h-8 bg-muted-foreground/10 rounded w-full mb-4"></div>
        {settings.showTranslation && <div className="h-6 bg-muted-foreground/10 rounded w-3/4 mx-auto"></div>}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-20 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent">
        <div className="container mx-auto grid grid-cols-3 items-center h-16 px-4">
          <div className="justify-self-start">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground">
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground text-center truncate">
            {surahInfo.name}
          </h1>
          <div className="justify-self-end text-sm text-primary-foreground/80 flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground" onClick={() => setShowAudioPlayer(s => !s)}>
                <Headphones className="h-5 w-5" />
                <span className="sr-only">Listen</span>
            </Button>
            {surahInfo.versesCount} verses
          </div>
        </div>
      </header>

      <div className="surah-page-background flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto pb-28">
          <Card className="mb-8 surah-view-card">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSummarize} disabled={isLoadingSummary} className="w-full sm:w-auto">
                      {isLoadingSummary ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                      <BookOpenCheck className="mr-2 h-4 w-4" />
                      )}
                      Summarize Surah
                  </Button>
                  {bookmarkedVerses.length > 0 && (
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/settings/bookmarks">
                            <Bookmark className="mr-2 h-4 w-4" />
                            Bookmarked Verses
                        </Link>
                    </Button>
                  )}
                </div>
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
            <Card className="mb-8 surah-view-card relative">
              <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSummary('')}
              >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close summary</span>
              </Button>
              <CardContent className="p-6 pt-8">
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
                <p className={cn("text-center text-3xl mb-8", settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : (settings.fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic'))}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
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
                        const verseEndSymbol = `\u06dd${toArabicNumerals(verseNumber)}`;

                        const fullAyah = fullVerseData[index] || ayah;
                        const textToCopy = `${fullAyah.text_uthmani} (${surahInfo.name}:${verseNumber}) \n\n${fullAyah.translation || ''}`;
                        const isBookmarked = bookmarkedVerses.includes(ayah.verse_key);
                        const isCurrentlyPlaying = isPlaying && currentVerse === parseInt(verseNumber, 10);
                        
                        return (
                          <Popover 
                              key={ayah.id}
                              open={activePopoverKey === ayah.verse_key}
                              onOpenChange={(isOpen) => setActivePopoverKey(isOpen ? ayah.verse_key : null)}
                          >
                            <PopoverTrigger asChild>
                              <div 
                                  id={`verse-${verseNumber}`} 
                                  className={cn(
                                    "border-b border-border/50 pb-6 last:border-b-0 last:pb-0 scroll-mt-24 transition-colors duration-300 rounded-lg p-4 -m-4 cursor-pointer",
                                    isBookmarked && "bg-orange-500/20",
                                    isCurrentlyPlaying && "bg-primary/20"
                                  )}
                              >
                                  <p 
                                      dir="rtl" 
                                      className={cn(
                                        "leading-loose text-foreground mb-4 text-center",
                                        settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : (settings.fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
                                      )}
                                      style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                                  >
                                      {ayah.text_uthmani}
                                      <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                                  </p>
                                <div className="text-muted-foreground text-lg leading-relaxed text-center">
                                    {(settings.showTranslation && ayah.translation) ? (
                                      <p><span className="text-primary font-bold mr-2">{verseNumber}</span>{ayah.translation}</p>
                                    ) : (
                                      (settings.showTranslation && !translationError) ? <p className="text-sm">Loading translation...</p> : null
                                    )}
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1" side="bottom" align="center">
                              <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleStartPlaybackFromVerse(parseInt(verseNumber, 10))}>
                                      <Play className="h-5 w-5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toggleBookmark(ayah.verse_key)}>
                                      <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current text-orange-500")} />
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
                className={cn(
                  "leading-loose text-foreground text-justify",
                  settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : (settings.fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
                )}
                style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
              >
                  {displayVerses.map((ayah) => {
                      const verseNumber = ayah.verse_key.split(':')[1];
                      const verseEndSymbol = `\u06dd${toArabicNumerals(verseNumber)}`;

                      const fullAyah = fullVerseData.find(v => v.id === ayah.id) || ayah;
                      const textToCopy = `${fullAyah.text_uthmani} (${surahInfo.name}:${verseNumber})`;
                      const isBookmarked = bookmarkedVerses.includes(ayah.verse_key);
                      const isCurrentlyPlaying = isPlaying && currentVerse === parseInt(verseNumber, 10);
                      
                      return (
                        <Popover 
                            key={ayah.id}
                            open={activePopoverKey === ayah.verse_key}
                            onOpenChange={(isOpen) => setActivePopoverKey(isOpen ? ayah.verse_key : null)}
                        >
                          <PopoverTrigger asChild>
                            <span 
                                id={`verse-${verseNumber}`}
                                className={cn(
                                  "scroll-mt-24 transition-colors duration-300 rounded-md p-1 -m-1 cursor-pointer hover:bg-primary/10",
                                  isBookmarked && "bg-orange-500/20",
                                  isCurrentlyPlaying && "bg-primary/20"
                                )}
                            >
                                {ayah.text_uthmani}
                                <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                                {' '}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1" side="bottom" align="center">
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleStartPlaybackFromVerse(parseInt(verseNumber, 10))}>
                                    <Play className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toggleBookmark(ayah.verse_key)}>
                                    <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current text-orange-500")} />
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

            {translationError && settings.showTranslation && (
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
                  <ChevronRight className="ml-2 h-4" />
                </Button>
              </Link>
            ): <div />}
          </div>
        </div>
      </div>
      
      {audioError && showAudioPlayer && (
        <Alert variant="destructive" className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto z-[60]">
            <AlertTitle>Audio Error</AlertTitle>
            <AlertDescription>{audioError}</AlertDescription>
        </Alert>
      )}

      {showAudioPlayer && reciter && (
        <AudioPlayerBar
          surah={surahInfo}
          isPlaying={isPlaying}
          currentVerse={currentVerse}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onReciterClick={() => setIsReciterSheetOpen(true)}
          reciterName={reciter.name}
          reciterImage={reciter.imageUrl}
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
                                    className="object-cover transition-transform group-hover:scale-105 w-full h-auto"
                                    style={{ width: '100%', height: 'auto' }}
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
            <SheetHeader className="text-center pb-4 border-b border-border/20 relative" dir={tafsirLanguage === 'Arabic' ? 'rtl' : 'ltr'}>
                <div className="absolute top-0 left-4">
                  <Popover open={isLangPopoverOpen} onOpenChange={setIsLangPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Languages className="h-5 w-5" />
                          <span className="sr-only">Translate</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex flex-col gap-1">
                          {tafsirLanguages.map((lang) => (
                              <Button
                                key={lang.id}
                                variant="ghost"
                                className="w-full justify-start gap-2"
                                onClick={() => {
                                  setTafsirLanguage(lang.name);
                                  setIsLangPopoverOpen(false);
                                }}
                              >
                                {tafsirLanguage === lang.name ? <Check className="h-4 w-4" /> : <div className="w-4 h-4" />}
                                <span>{lang.flag}</span>
                                {lang.nativeName}
                              </Button>
                          ))}
                        </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <SheetTitle className="text-center">
                  {tafsirLanguage === 'Arabic' ? `تفسير الآية: ${selectedVerseForTafsir?.verse_key}` : `Tafsir for Verse: ${selectedVerseForTafsir?.verse_key}`}
                </SheetTitle>
                <SheetDescription className={cn(
                  "text-lg text-foreground/90 text-center pt-2",
                  settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : (settings.fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
                )}>
                    {selectedVerseForTafsir?.text_uthmani}
                </SheetDescription>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto p-6" dir={tafsirLanguage === 'Arabic' ? 'rtl' : 'ltr'}>
                {isLoadingTafsir ? (
                    <div className="space-y-4 pt-4">
                        <div className="h-4 bg-muted-foreground/10 rounded w-full animate-pulse mx-auto"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-5/6 animate-pulse mx-auto"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-full animate-pulse mx-auto"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-3/4 animate-pulse mx-auto"></div>
                        <div className="h-4 bg-muted-foreground/10 rounded w-5/6 animate-pulse mx-auto"></div>
                    </div>
                ) : tafsirError ? (
                    <Alert variant="destructive" className="text-center">
                        <AlertTitle>{tafsirLanguage === 'Arabic' ? 'خطأ' : 'Error'}</AlertTitle>
                        <AlertDescription>{tafsirError}</AlertDescription>
                    </Alert>
                ) : (
                    <p className={cn(
                        "whitespace-pre-wrap",
                        tafsirLanguage === 'Arabic' ? "font-arabic text-right text-lg" : "font-body text-left text-base",
                        "text-foreground/90 leading-relaxed"
                    )}>
                        {tafsirContent}
                    </p>
                )}
            </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isReciterSheetOpen} onOpenChange={setIsReciterSheetOpen}>
        <SheetContent side="bottom" className="w-full max-w-xl mx-auto h-[60vh] flex flex-col rounded-t-2xl">
          <SheetHeader className="text-center pb-4 border-b">
            <SheetTitle>Choose Reciter</SheetTitle>
            <SheetDescription>Select your preferred reciter for listening.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-2">
              {reciters.map((r) => (
                <button
                  key={r.id}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors",
                    settings.reciterId === r.id ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
                  )}
                  onClick={() => handleChangeReciter(r.id)}
                >
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={r.imageUrl || undefined} alt={r.name} />
                    <AvatarFallback>{r.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold text-base text-foreground">{r.name}</p>
                    {r.style && <p className="text-sm text-muted-foreground">{r.style}</p>}
                  </div>
                  {settings.reciterId === r.id && <Check className="h-6 w-6 text-primary" />}
                </button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

    
