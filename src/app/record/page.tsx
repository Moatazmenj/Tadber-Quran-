'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff, Loader2, AlertCircle, ChevronRight, Baseline } from 'lucide-react';
import { cn, toArabicNumerals } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { surahs } from '@/lib/quran';
import type { Surah } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { Slider } from '@/components/ui/slider';
import { SoundWave } from '@/components/SoundWave';
import { useToast } from '@/hooks/use-toast';

const ANALYSIS_STORAGE_KEY = 'recitationAnalysisData';

interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface UthmaniVerseApiResponse {
    verses: UthmaniVerse[];
}

export default function RecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings, setSetting } = useQuranSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<UthmaniVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [verseFetchError, setVerseFetchError] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFontSizeSheetOpen, setIsFontSizeSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Select Al-Fatiha by default
    const alFatiha = surahs.find(s => s.id === 1);
    if (alFatiha) {
        setSelectedSurah(alFatiha);
    }
  }, []);

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    const isApiSupported = isClient && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    setIsSupported(!!isApiSupported);
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
      setCurrentPage(0);
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

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // onstop event will handle the rest
    }
  }, [isRecording]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording || !isSupported) return;

    audioChunksRef.current = []; // Clear previous chunks

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64Audio = reader.result as string;
                const originalText = verses.map(v => v.text_uthmani).join(' ');

                if (!originalText || !selectedSurah) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not get the Surah text to analyze.' });
                    return;
                }

                // Store data in localStorage to pass to the analysis page
                localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify({
                    audioDataUri: base64Audio,
                    originalText: originalText,
                    surahName: selectedSurah.name,
                }));

                router.push('/record/analysis');
            };
            
            // Clean up the stream tracks
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        };
        
        mediaRecorderRef.current.onerror = (event: Event) => {
            console.error('MediaRecorder error:', event);
            toast({ variant: 'destructive', title: 'Recording Error', description: 'Something went wrong during recording.' });
            setIsRecording(false);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);

    } catch (err) {
        console.error("Error starting recording:", err);
        toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access microphone. Please check permissions and try again.' });
        setIsRecording(false);
    }
  }, [isRecording, isSupported, verses, selectedSurah, router, toast]);

  const renderContent = () => {
    if (!isSupported) {
        return (
            <Alert variant="destructive" className="max-w-md">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Browser Not Supported</AlertTitle>
                <AlertDescription>
                    Audio recording is not supported by your browser. Please try using a modern browser like Chrome or Safari.
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
                          return (
                              <span key={verse.id} id={`verse-${verseNumberStr}`} className="transition-colors duration-500 rounded-md p-1 scroll-mt-24">
                                  <span>{verse.text_uthmani}</span>
                                  <span 
                                      className="inline-block text-center mx-1 font-sans text-xs w-6 h-6 leading-6 rounded-full border-2 border-primary text-primary"
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

    return (
        <div className="w-full max-w-7xl flex-grow flex items-center justify-center" style={{minHeight: '60vh'}}>
            {/* Empty by default, or can show a prompt to select a surah */}
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
        <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>Juz {selectedSurah.juz[0]} | Page {currentPage + 1}</span>
          <span>{totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : ''}</span>
        </div>
      )}


      <main className="flex-grow flex flex-col items-center justify-start overflow-y-auto pt-4">
        {renderContent()}
      </main>

      <SoundWave isRecording={isRecording} />

      <footer className="flex items-center justify-center p-2 border-t border-border flex-shrink-0 z-50">
        <div className="flex items-center justify-center gap-4">
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
                size="lg" 
                className="w-14 h-14 rounded-full"
                onClick={handleStopRecording}
                disabled={!isRecording || !isSupported}
            >
                <Square className="h-6 w-6" />
                <span className="sr-only">Stop</span>
            </Button>
        </div>
      </footer>
    </div>
  );
}
