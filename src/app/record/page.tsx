
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff, Loader2, AlertCircle, ChevronRight, Baseline, Octagon, ChevronDown, Check } from 'lucide-react';
import { cn, toArabicNumerals } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { surahs } from '@/lib/quran';
import type { Surah, Ayah } from '@/types';
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
  const [verses, setVerses] = useState<Ayah[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  
  const [isSurahSheetOpen, setIsSurahSheetOpen] = useState(false);
  const [isFontSizeSheetOpen, setIsFontSizeSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isStoppingRef = useRef(false);

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

  const fetchContent = useCallback(async () => {
    if (!selectedSurah) {
      setVerses([]);
      return;
    }

    setIsLoadingContent(true);
    setContentError(null);
    setVerses([]);
    setCurrentPage(0);
    setSelectedVerseKey(null);

    try {
      const versesResponse = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah.id}`);
      if (!versesResponse.ok) {
        throw new Error("Could not fetch verses for the selected Surah.");
      }
      const versesData: UthmaniVerseApiResponse = await versesResponse.json();
      setVerses(versesData.verses);

    } catch (error) {
      console.error("Content fetch error:", error);
      setContentError(error instanceof Error ? error.message : "An unknown error occurred while loading content.");
    } finally {
      setIsLoadingContent(false);
    }
  }, [selectedSurah]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleVerseClick = (verseKey: string) => {
    setSelectedVerseKey(prevKey => prevKey === verseKey ? null : verseKey);
  };

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      isStoppingRef.current = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording || !isSupported || isStoppingRef.current) return;
  
    if (!selectedVerseKey) {
        toast({
            variant: 'destructive',
            title: 'No Verse Selected',
            description: 'Please select a verse to practice before recording.',
        });
        return;
    }
  
    audioChunksRef.current = [];
  
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
  
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };
  
        recorder.onstop = () => {
            isStoppingRef.current = false;
            setIsProcessing(true);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            
            const cleanup = () => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
              }
              setIsProcessing(false);
            };
  
            reader.onloadend = () => {
                const base64Audio = reader.result as string;
                
                const selectedVerseObject = verses.find(v => v.verse_key === selectedVerseKey);
                const originalText = selectedVerseObject?.text_uthmani;
  
                if (!originalText || !selectedSurah) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not get the Surah text to analyze.' });
                    cleanup();
                    return;
                }
  
                try {
                  localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify({
                      audioDataUri: base64Audio,
                      originalText: originalText,
                      surahName: selectedSurah.name,
                  }));
                  router.push('/record/analysis');
                } catch (e) {
                  console.error("Failed to save recording data to localStorage", e);
                  toast({
                    variant: 'destructive',
                    title: 'Storage Error',
                    description: 'Could not save the recording. Your device storage might be full.'
                  });
                  cleanup();
                }
            };
            
            reader.onerror = () => {
              console.error('FileReader error');
              toast({ variant: 'destructive', title: 'Processing Error', description: 'Could not process the recorded audio.' });
              cleanup();
            };
  
            reader.readAsDataURL(audioBlob);
        };
        
        recorder.onerror = (event: Event) => {
            console.error('MediaRecorder error:', event);
            toast({ variant: 'destructive', title: 'Recording Error', description: 'Something went wrong during recording.' });
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            setIsRecording(false);
            isStoppingRef.current = false;
        };
  
        recorder.start();
        setIsRecording(true);
  
    } catch (err) {
        console.error("Error starting recording:", err);
        toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access microphone. Please check permissions and try again.' });
    }
  }, [isRecording, isSupported, verses, selectedSurah, router, toast, selectedVerseKey]);

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
    
    if (!selectedSurah || isLoadingContent) {
        return (
            <div className="w-full flex-grow flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (contentError) {
        return (
          <div className="w-full flex-grow flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Content</AlertTitle>
              <AlertDescription>{contentError}</AlertDescription>
              <Button onClick={fetchContent} className="mt-4">Retry</Button>
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
            <div className="w-full max-w-5xl flex-grow p-4 md:p-6" style={{minHeight: '60vh'}}>
                {currentPage === 0 && selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
                    <p className="font-arabic text-center text-3xl mb-8 pb-4">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                )}
                <div 
                  dir="rtl"
                  className="font-arabic leading-loose text-foreground text-center text-justify"
                  style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                >
                  {versesForCurrentPage.map((verse) => {
                      const verseNumberStr = verse.verse_key.split(':')[1];
                      const isSelected = selectedVerseKey === verse.verse_key;
                      const verseEndSymbol = `\u06dd${toArabicNumerals(verseNumberStr)}`;

                      return (
                          <span 
                            key={verse.id} 
                            id={`verse-${verseNumberStr}`} 
                            className={cn(
                                "transition-colors duration-300 rounded-md p-1 cursor-pointer hover:bg-primary/10",
                                isSelected && "bg-primary/20"
                            )}
                            onClick={() => handleVerseClick(verse.verse_key)}
                          >
                            {verse.text_uthmani}
                            <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                            {' '}
                          </span>
                      );
                  })}
                </div>
            </div>
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
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-foreground">...جاري معالجة تلاوتك</p>
        </div>
      )}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent text-primary-foreground p-2">
        <div className="flex items-center justify-between w-full">
            <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Back</span>
                </Button>
            </Link>

            <Sheet open={isSurahSheetOpen} onOpenChange={setIsSurahSheetOpen}>
                <SheetTrigger asChild>
                    <div className="flex items-center justify-center gap-2 text-center cursor-pointer p-2 rounded-md hover:bg-primary/80">
                        <div>
                            <p className="font-bold text-lg">{selectedSurah ? `${selectedSurah.id}. ${selectedSurah.name}` : 'Select Surah'}</p>
                            {selectedSurah && <p className="text-sm opacity-80">{selectedSurah.revelationPlace} - {selectedSurah.versesCount} verses</p>}
                        </div>
                        <ChevronDown className="h-5 w-5" />
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
                                    setIsSurahSheetOpen(false);
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

      <div className="flex-grow flex flex-col items-center justify-start overflow-y-auto pt-4 relative">
          <main className="w-full flex-grow flex flex-col items-center justify-start">
            <div className="text-center text-muted-foreground mb-4 px-4">
                <p>Select a verse to begin your recitation practice.</p>
            </div>
            {renderContent()}
          </main>
          {totalPages > 1 && (
            <>
              <div className="fixed left-0 md:left-2 top-1/2 -translate-y-1/2 z-30">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full backdrop-blur-sm bg-background/20" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Previous Page</span>
                </Button>
              </div>
              <div className="fixed right-0 md:right-2 top-1/2 -translate-y-1/2 z-30">
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full backdrop-blur-sm bg-background/20" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </>
          )}
      </div>


      <footer className="relative flex items-center justify-center px-4 pt-12 pb-4 flex-shrink-0 z-50 bg-gradient-to-t from-background to-transparent overflow-hidden">
        <SoundWave isRecording={isRecording} />
        <div className="relative z-10 flex items-center justify-center">
            {isRecording ? (
                <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-16 h-16 rounded-full text-primary-foreground hover:bg-transparent hover:text-primary-foreground/80 -translate-y-2"
                    onClick={handleStopRecording}
                    disabled={!isRecording || isProcessing || !isSupported}
                >
                    <Square className="h-7 w-7 fill-current" />
                    <span className="sr-only">Stop</span>
                </Button>
            ) : (
                <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-16 h-16 rounded-full"
                    onClick={handleStartRecording}
                    disabled={isRecording || isProcessing || !isSupported}
                >
                    <Mic className="h-7 w-7" />
                    <span className="sr-only">Record</span>
                </Button>
            )}
        </div>
      </footer>
    </div>
  );
}

