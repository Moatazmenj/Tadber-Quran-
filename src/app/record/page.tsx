
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff, Loader2, BookOpen, AlertCircle, List, ChevronRight, Info, Baseline } from 'lucide-react';
import { cn, toArabicNumerals } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { surahs } from '@/lib/quran';
import { Card } from '@/components/ui/card';
import type { Surah } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

// --- API Types ---
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
  text_ar: string;
  surahId: number;
  surahName: string;
  arabicName: string;
  verseNumber: number;
}

interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface UthmaniVerseApiResponse {
    verses: UthmaniVerse[];
}
// --- End of API Types ---

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function RecordPage() {
  const { settings, setSetting } = useQuranSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(SpeechRecognitionAPI != null);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const [searchResult, setSearchResult] = useState<VerseSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<UthmaniVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [verseFetchError, setVerseFetchError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFontSizeSheetOpen, setIsFontSizeSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const isStoppingRef = useRef(false);

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    
    try {
      const response = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&language=ar`);
      if (!response.ok) {
        throw new Error("Could not reach the search service.");
      }

      const responseText = await response.text();
      if (!responseText) {
          setSearchError("No matching verse found for your recitation.");
          setIsSearching(false);
          return;
      }
      
      const data: SearchApiResponse = JSON.parse(responseText);
      const topResult = data.search.results[0];

      if (!topResult) {
          setSearchError("No matching verse found for your recitation.");
          setIsSearching(false); // Make sure to stop searching
          return;
      }
      
      const [surahIdStr, verseNumStr] = topResult.verse_key.split(':');
      const surahId = parseInt(surahIdStr, 10);

      const arabicTextResponse = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`);
      if (!arabicTextResponse.ok) {
        throw new Error("Could not fetch the verse text.");
      }
      const arabicTextData: UthmaniVerseApiResponse = await arabicTextResponse.json();
      const verseInfo = arabicTextData.verses.find(v => v.verse_key === topResult.verse_key);
      const surahInfo = surahs.find(s => s.id === surahId);
      
      if (verseInfo && surahInfo) {
        setSearchResult({
          verse_key: verseInfo.verse_key,
          text_ar: verseInfo.text_uthmani,
          surahId: surahId,
          surahName: surahInfo.name,
          arabicName: surahInfo.arabicName,
          verseNumber: parseInt(verseNumStr, 10),
        });
      } else {
        throw new Error("Could not assemble verse information.");
      }
    } catch (error) {
      console.error('Verse search error:', error);
      if (error instanceof SyntaxError) {
        setSearchError("Received an invalid response from the search service. Please try again.");
      } else {
        setSearchError(error instanceof Error ? error.message : "An unknown error occurred during search.");
      }
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

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

  useEffect(() => {
    if (!isSupported || !SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';

    recognition.onresult = (event) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      finalTranscriptRef.current = final_transcript;
      setLiveTranscript(finalTranscriptRef.current + interim_transcript);
    };

    recognition.onend = () => {
      if (isStoppingRef.current) {
        setIsRecording(false);
        if (finalTranscriptRef.current.trim()) {
          performSearch(finalTranscriptRef.current.trim());
        }
      } else if (isRecording) {
        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        } catch (error) {
          console.error("Speech recognition restart failed:", error);
          setIsRecording(false);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
       if (event.error !== 'no-speech') {
        setSearchError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isStoppingRef.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, performSearch, isRecording]);

  const handleStartRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      finalTranscriptRef.current = '';
      setLiveTranscript('');
      setSearchResult(null);
      setSearchError(null);
      setIsSearching(false);
      
      isStoppingRef.current = false;
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        setIsRecording(false);
        setSearchError("Could not start microphone. Please check permissions.");
      }
    }
  }, [isRecording]);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      isStoppingRef.current = true;
      recognitionRef.current.stop();
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

    if (isSearching) {
        return (
            <div className="w-full max-w-7xl p-8 text-center flex flex-col items-center justify-center gap-4 min-h-[450px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Searching for matching verse...</p>
            </div>
        );
    }

    if (searchError) {
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

    if (searchResult) {
        const verseNumberDisplay = toArabicNumerals(String(searchResult.verseNumber));
        const verseEndSymbol = `\u06dd${verseNumberDisplay}`;

        return (
            <Link href={`/surah/${searchResult.surahId}#verse-${searchResult.verseNumber}`} passHref className="w-full max-w-7xl">
                <Card className="text-center p-6 hover:bg-card/80 transition-colors w-full bg-background/80">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <BookOpen className="h-6 w-6 text-primary"/>
                        <p className="text-xl font-bold text-foreground">{searchResult.surahName} ({searchResult.verseNumber})</p>
                    </div>
                    <p dir="rtl" className="font-arabic text-2xl leading-loose text-foreground/90">
                        {searchResult.text_ar}
                        <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: '1.2rem' }}>{verseEndSymbol}</span>
                    </p>
                </Card>
            </Link>
        )
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
                          <p className="font-arabic text-center text-3xl mb-6">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                      )}
                      <div 
                        dir="rtl" 
                        className={cn(
                          "font-arabic text-justify leading-loose transition-opacity duration-300",
                          isRecording ? "opacity-0" : "opacity-100"
                        )}
                        style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                      >
                          {versesForCurrentPage.map((verse) => {
                              const verseNumberDisplay = toArabicNumerals(String(verse.verse_key.split(':')[1]));
                              const verseEndSymbol = `\u06dd${verseNumberDisplay}`;
                              return (
                                  <span key={verse.id}>
                                      {verse.text_uthmani}
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
                    </div>
                    {totalPages > 1 && (
                      <div className={cn(
                        "flex items-center justify-center mt-4 px-4 w-full transition-opacity duration-300",
                        isRecording ? "opacity-0 pointer-events-none" : "opacity-100"
                        )}>
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
    
    if (isRecording) {
      return (
        <div className="w-full flex-grow flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-destructive/20" />
                <div className="w-14 h-14 rounded-full bg-destructive/20 animate-ping absolute" />
                <Mic className="h-6 w-6 text-destructive-foreground absolute" />
            </div>
            <p dir="rtl" className="font-arabic text-2xl text-foreground/80 leading-relaxed max-w-2xl mt-4">
                {liveTranscript || ''}
            </p>
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
                                    setSearchResult(null);
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


      <main className="flex-grow flex flex-col items-center justify-center text-center overflow-y-auto">
        {renderContent()}
      </main>

      <footer className="flex items-center justify-center gap-6 py-4 border-t border-border flex-shrink-0">
          <Button 
              variant="destructive" 
              size="lg" 
              className="w-16 h-16 rounded-full"
              onClick={handleStartRecording}
              disabled={isRecording || !isSupported}
          >
              <Mic className="h-7 w-7" />
              <span className="sr-only">Record</span>
          </Button>
          <Button 
              variant="outline" 
              size="icon" 
              className="w-12 h-12 rounded-full"
              onClick={handleStopRecording}
              disabled={!isRecording || !isSupported}
          >
              <Square className="h-5 w-5" />
              <span className="sr-only">Stop</span>
          </Button>
      </footer>
    </div>
  );
}
