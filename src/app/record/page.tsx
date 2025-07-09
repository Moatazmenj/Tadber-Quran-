'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff, Loader2, BookOpen, AlertCircle, List, ChevronRight, Info, Baseline } from 'lucide-react';
import { cn, toArabicNumerals, normalizeArabic } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { surahs } from '@/lib/quran';
import { Card } from '@/components/ui/card';
import type { Surah } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { SoundWave } from '@/components/SoundWave';

// --- API Types ---
interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface UthmaniVerseApiResponse {
    verses: UthmaniVerse[];
}
// --- End of API Types ---

let SpeechRecognitionAPI: any = null;


export default function RecordPage() {
  const { settings, setSetting } = useQuranSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<UthmaniVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [verseFetchError, setVerseFetchError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFontSizeSheetOpen, setIsFontSizeSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const liveTranscriptRef = useRef('');

  useEffect(() => {
    // Select Al-Fatiha by default
    const alFatiha = surahs.find(s => s.id === 1);
    if (alFatiha) {
        setSelectedSurah(alFatiha);
    }
  }, []);

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    const isApiSupported = isClient && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (isApiSupported) {
        SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    }
    setIsSupported(!!isApiSupported);
  }, []);

  const performSearch = useCallback((query: string) => {
    if (query.trim().length < 3 || !selectedSurah || verses.length === 0) {
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHighlightedVerseKey(null);

    // Use a timeout to allow the UI to update before the search logic runs
    setTimeout(() => {
      const normalizedQuery = normalizeArabic(query);

      if (!normalizedQuery) {
        setIsSearching(false);
        return;
      }

      const potentialMatches = verses
        .map(verse => {
          const normalizedVerseText = normalizeArabic(verse.text_uthmani);
          if (normalizedVerseText.includes(normalizedQuery)) {
            // Simple similarity score: prioritize matches where the query is a larger portion of the verse.
            const score = normalizedQuery.length / normalizedVerseText.length;
            return { verse, score };
          }
          return null;
        })
        .filter((match): match is { verse: UthmaniVerse; score: number } => match !== null);

      if (potentialMatches.length > 0) {
        // Sort by score descending to get the best match first
        potentialMatches.sort((a, b) => b.score - a.score);
        const bestMatch = potentialMatches[0];
        setHighlightedVerseKey(bestMatch.verse.verse_key);
      } else {
        setSearchError("The recited verse was not found in the current Surah.");
      }
      
      setIsSearching(false);
    }, 50);
  }, [selectedSurah, verses]);

  useEffect(() => {
    if (highlightedVerseKey && verses.length > 0) {
      const verseIndex = verses.findIndex(v => v.verse_key === highlightedVerseKey);
      
      if (verseIndex !== -1) {
        const versesPerPage = 10;
        const targetPage = Math.floor(verseIndex / versesPerPage);

        const scrollAndHighlight = () => {
          const verseNum = highlightedVerseKey.split(':')[1];
          const verseElement = document.getElementById(`verse-${verseNum}`);
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        };

        if (currentPage !== targetPage) {
          setCurrentPage(targetPage);
          setTimeout(scrollAndHighlight, 100);
        } else {
          scrollAndHighlight();
        }
      }
    }
  }, [highlightedVerseKey, verses, currentPage]);

  useEffect(() => {
    const fetchVerses = async () => {
      if (!selectedSurah) {
        setVerses([]);
        return;
      }

      setIsLoadingVerses(true);
      setVerseFetchError(null);
      setVerses([]);
      try {
        const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah.id}`);
        if (!response.ok) {
          throw new Error("Could not fetch verses for the selected Surah.");
        }
        const data: UthmaniVerseApiResponse = await response.json();
        setVerses(data.verses);
      } catch (error) {
        console.error("Verse fetch error:", error);
        setVerseFetchError(error instanceof Error ? error.message : "An unknown error occurred.");
      } finally {
        setIsLoadingVerses(false);
      }
    };

    fetchVerses();
  }, [selectedSurah]);

  const setupRecognition = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      return null;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';
    
    recognition.onresult = (event: any) => {
      // Create the full transcript from all results so far
      const fullTranscript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      setLiveTranscript(fullTranscript);
      liveTranscriptRef.current = fullTranscript; // Store the latest full transcript for search
    };

    recognition.onend = () => {
        setIsRecording(false);
        if (liveTranscriptRef.current.trim()) {
          performSearch(liveTranscriptRef.current.trim());
        }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
       if (event.error !== 'no-speech') {
        setSearchError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      }
    };
    
    return recognition;
  }, [performSearch]);

  const handleStartRecording = useCallback(() => {
    if (isRecording || !isSupported) return;

    liveTranscriptRef.current = '';
    setLiveTranscript('');
    setSearchError(null);
    setIsSearching(false);
    setHighlightedVerseKey(null);
    
    const recognition = setupRecognition();
    if (recognition) {
        recognitionRef.current = recognition;
        try {
          recognitionRef.current?.start();
          setIsRecording(true);
        } catch (e) {
          console.error("Error starting recognition:", e);
          setIsRecording(false);
          setSearchError("Could not start microphone. Please check permissions.");
        }
    } else {
         setIsRecording(false);
         setSearchError("Speech recognition is not set up correctly.");
    }
  }, [isRecording, isSupported, setupRecognition]);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false); // Manually set to false here as onend might take time
    }
  }, [isRecording]);

  const renderContent = () => {
    if (!isSupported) {
        return (
            <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Browser Not Supported</AlertTitle>
                <AlertDescription>
                    Speech recognition is not supported by your browser. Please try using Chrome or Safari.
                </AlertDescription>
            </Alert>
        );
    }
    
    if (!selectedSurah) {
        return (
            <div className="w-full flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isRecording) {
      return (
        <div className="w-full max-w-5xl flex-grow p-4 md:p-6 flex items-start justify-center" style={{minHeight: '60vh'}}>
             <div 
              dir="rtl" 
              className="font-arabic text-justify leading-loose w-full"
              style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
            >
                <p>
                    {liveTranscript || <span className="text-muted-foreground">ابدأ التلاوة...</span>}
                </p>
            </div>
        </div>
      );
    }

    if (isSearching) {
        return (
            <div className="w-full max-w-7xl p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[450px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Searching for matching verse...</p>
            </div>
        );
    }

    if (searchError && !isRecording) {
        return (
             <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search Failed</AlertTitle>
                <AlertDescription>
                    {searchError}
                </AlertDescription>
            </Alert>
        );
    }

    if (selectedSurah) {
        if (isLoadingVerses) {
          return (
            <div className="w-full flex-grow flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (verseFetchError) {
          return (
            <div className="w-full flex-grow flex items-center justify-center">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Verses</AlertTitle>
                <AlertDescription>{verseFetchError}</AlertDescription>
              </Alert>
            </div>
          );
        }
        
        if (verses.length > 0) {
            const versesPerPage = 10;
            const totalPages = Math.ceil(verses.length / versesPerPage);
            const startIndex = currentPage * versesPerPage;
            const versesForCurrentPage = verses.slice(startIndex, startIndex + versesPerPage);
            
            return (
                <>
                    <div className="w-full max-w-5xl flex-grow p-4 md:p-6" style={{minHeight: '60vh'}}>
                      {currentPage === 0 && selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
                          <p className="font-arabic text-center text-3xl mb-8 pb-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                      )}
                      <div 
                        dir="rtl" 
                        className="font-arabic text-justify leading-loose"
                        style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                      >
                          {versesForCurrentPage.map((verse) => {
                              const verseNumberStr = verse.verse_key.split(':')[1];
                              const isHighlighted = verse.verse_key === highlightedVerseKey;

                              return (
                                  <span 
                                    key={verse.id} 
                                    id={`verse-${verseNumberStr}`} 
                                    className={cn(
                                        "transition-colors duration-500 rounded-md p-1 scroll-mt-24"
                                    )}
                                  >
                                      <span className={cn(isHighlighted && "bg-primary/20")}>
                                        {verse.text_uthmani}
                                      </span>
                                      <span 
                                          className={cn(
                                            "inline-block text-center mx-1 font-sans text-xs w-6 h-6 leading-6 rounded-full",
                                            "border-2 border-primary text-primary",
                                            isHighlighted && "bg-primary text-primary-foreground"
                                          )}
                                          style={{ fontSize: `${settings.fontSize * 0.6}px` }}
                                      >
                                          {toArabicNumerals(String(verseNumberStr))}
                                      </span>
                                      {' '}
                                  </span>
                              );
                          })}
                      </div>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center mt-4 px-4 w-full">
                          <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                              <ChevronRight className="h-6 w-6" />
                              <span className="sr-only">Previous Page</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                              <ChevronLeft className="h-6 w-6" />
                              <span className="sr-only">Next Page</span>
                          </Button>
                      </div>
                    )}
                </>
            )
        }
  
        // Fallback for when no verses are loaded but a surah is selected
        return (
           <div className="w-full flex-grow flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
      }
    
    return (
        <div className="w-full max-w-7xl flex-grow flex items-center justify-center" style={{minHeight: '60vh'}}>
            {/* Empty by default */}
        </div>
    );
  };

  const totalPages = selectedSurah ? Math.ceil(verses.length / 10) : 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-20 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent text-primary-foreground p-2">
        <div className="flex items-center justify-between w-full">
            <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <div className="text-center cursor-pointer p-2 rounded-md hover:bg-primary/80">
                        <p className="font-bold text-lg">{selectedSurah ? `${selectedSurah.id}. ${selectedSurah.name}` : 'Select Surah'}</p>
                        {selectedSurah && <p className="text-sm opacity-80">{selectedSurah.revelationPlace} - {selectedSurah.versesCount} verses</p>}
                    </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="text-center">Select Surah</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-grow pr-2">
                        <div className="flex flex-col gap-1 py-4">
                            {surahs.map((surah) => (
                            <div
                                key={surah.id}
                                onClick={() => {
                                    setSelectedSurah(surah);
                                    setIsSheetOpen(false);
                                    setHighlightedVerseKey(null);
                                    setCurrentPage(0);
                                }}
                                className="p-3 rounded-lg hover:bg-card/80 transition-colors cursor-pointer border-b border-border/10 last:border-b-0"
                            >
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 flex items-center justify-center bg-accent/20 text-accent-foreground rounded-full font-bold text-sm">
                                    {surah.id}
                                    </div>
                                    <div>
                                    <p className="font-headline text-lg text-foreground">{surah.name}</p>
                                    </div>
                                </div>
                                <p className="font-arabic text-2xl text-primary">{surah.arabicName}</p>
                                </div>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                    <Info className="h-5 w-5" />
                    <span className="sr-only">Info</span>
                </Button>
                <Sheet open={isFontSizeSheetOpen} onOpenChange={setIsFontSizeSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                            <Baseline className="h-5 w-5" />
                            <span className="sr-only">Font Size</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto rounded-t-lg">
                        <SheetHeader>
                            <SheetTitle className="text-center">Font Size</SheetTitle>
                        </SheetHeader>
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <span className="text-lg">A</span>
                                <Slider
                                    value={[settings.fontSize]}
                                    min={18}
                                    max={48}
                                    step={2}
                                    onValueChange={(value) => setSetting('fontSize', value[0])}
                                />
                                <span className="text-3xl">A</span>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </header>
      
      {selectedSurah && (
        <div className={cn(
          "flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b border-border",
          isRecording ? 'invisible' : 'visible'
        )}>
          <span>Juz {selectedSurah.juz[0]} | Page {currentPage + 1}</span>
          <span>{totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : ''}</span>
        </div>
      )}


      <main className="flex-grow flex flex-col items-center justify-center overflow-y-auto">
        {renderContent()}
      </main>

      <SoundWave isRecording={isRecording} />

      <footer className="flex items-center justify-center p-1 border-t border-border flex-shrink-0 z-50">
        <div className="flex items-center justify-center gap-2">
            <Button 
                variant="destructive" 
                size="lg" 
                className="w-12 h-12 rounded-full"
                onClick={handleStartRecording}
                disabled={isRecording || !isSupported}
            >
                <Mic className="h-5 w-5" />
                <span className="sr-only">Record</span>
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                className="w-10 h-10 rounded-full"
                onClick={handleStopRecording}
                disabled={!isRecording || !isSupported}
            >
                <Square className="h-4 w-4" />
                <span className="sr-only">Stop</span>
            </Button>
        </div>
      </footer>
    </div>
  );
}
