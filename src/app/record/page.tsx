
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/lib/quran';
import { getLocalWordTimings } from '@/lib/quran-verses';
import type { Ayah, Surah, WordTiming, TranslationOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, ChevronLeft, Languages, Bookmark, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { KaraokeVerse } from '@/components/KaraokeVerse';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VerseSelector } from '@/components/VerseSelector';
import { SoundWave } from '@/components/SoundWave';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { translationOptions } from '@/lib/translations';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';

export default function RecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings, setSetting } = useQuranSettings();
  
  const [selectedSurahId, setSelectedSurahId] = useState('1');
  const [selectedVerseKey, setSelectedVerseKey] = useState('1:1');
  const [versesForSurah, setVersesForSurah] = useState<Ayah[]>([]);
  const [surahInfo, setSurahInfo] = useState<Surah | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [karaokeDisabled, setKaraokeDisabled] = useState(false);
  const [isTranslationSheetOpen, setIsTranslationSheetOpen] = useState(false);
  const [activeTranslationOptions, setActiveTranslationOptions] = useState<TranslationOption[]>([]);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wordTimeoutsRef = useRef<NodeJS.Timeout[]>([]);


  useEffect(() => {
    const surah = surahs.find(s => s.id === parseInt(selectedSurahId, 10));
    setSurahInfo(surah || null);
  }, [selectedSurahId]);

  useEffect(() => {
    setActiveTranslationOptions(
      translationOptions.map(opt => ({ ...opt, isActive: settings.translationId === opt.id }))
    );
  }, [settings.translationId]);

  const clearWordTimeouts = () => {
    wordTimeoutsRef.current.forEach(clearTimeout);
    wordTimeoutsRef.current = [];
  };

  const fetchWordTimings = useCallback(async (verseKey: string) => {
    if (!verseKey) return;
    clearWordTimeouts();
    setCurrentWordIndex(-1);
    setWordTimings([]);
    setKaraokeDisabled(false);

    let timings = getLocalWordTimings(verseKey);
    
    if (!timings) {
        try {
            const reciterId = settings.reciterId || 7; // Default to Alafasy
            const response = await fetch(`https://api.quran.com/api/v4/quran/recitations/${reciterId}/by_verse/${verseKey}?word_fields=text_uthmani,timestamps`);
            if (!response.ok) throw new Error('Failed to fetch word timings');
            const data = await response.json();
            timings = data.audio_files[0].words;
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Karaoke Disabled', description: 'Could not load word timings for this verse. Karaoke highlighting is disabled.' });
            setKaraokeDisabled(true);
            return;
        }
    }

    if (timings && timings.length > 0 && timings[0].audio_url) {
        setWordTimings(timings);
        if (audioPlayerRef.current) {
            const audioUrl = `https://verses.quran.com/${timings[0].audio_url}`;
            audioPlayerRef.current.src = audioUrl;
        }
    } else {
        setKaraokeDisabled(true);
    }
  }, [settings.reciterId, toast]);

  const fetchVerses = useCallback(async (surahId: number, translationId: string) => {
    let verses: Omit<Ayah, 'translation'>[] | undefined;

    try {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`);
        if (!res.ok) throw new Error('Failed to fetch verses');
        const data = await res.json();
        verses = data.verses;
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load verses for this Surah.'});
        setVersesForSurah([]);
        return;
    }

    if (!verses) return;

    const selectedTranslation = translationOptions.find(t => t.id === translationId);
    if (selectedTranslation) {
        try {
            const transRes = await fetch(`https://api.quran.com/api/v4/quran/translations/${selectedTranslation.apiId}?chapter_number=${surahId}`);
            if (!transRes.ok) throw new Error('Failed to fetch translations');
            const transData = await transRes.json();
            const translationsMap = transData.translations.reduce((acc: any, t: any) => {
                acc[t.verse_key] = t.text.replace(/<sup.*?<\/sup>/g, '');
                return acc;
            }, {});

            const versesWithTranslations = verses.map(v => ({
                ...v,
                translation: translationsMap[v.verse_key] || 'Translation not available.'
            }));
            
            setVersesForSurah(versesWithTranslations);
        } catch (error) {
             console.error(error);
             toast({ variant: 'destructive', title: 'Error', description: 'Could not load translations.'});
             setVersesForSurah(verses.map(v => ({...v, translation: 'Translation not available'})));
        }
    } else {
      setVersesForSurah(verses.map(v => ({...v, translation: undefined})));
    }
    
    const firstVerseKey = verses?.[0]?.verse_key || '';
    if (firstVerseKey) {
        setSelectedVerseKey(firstVerseKey);
        await fetchWordTimings(firstVerseKey);
    }
  }, [toast, fetchWordTimings]);

  useEffect(() => {
    fetchVerses(parseInt(selectedSurahId, 10), settings.translationId);
  }, [selectedSurahId, settings.translationId, fetchVerses]);

  const handleSurahChange = (surahId: string) => {
    setSelectedSurahId(surahId);
  }

  const handleVerseSelect = (verseKey: string) => {
    setSelectedVerseKey(verseKey);
    fetchWordTimings(verseKey);
  }

  const handleTranslationChange = (langId: string) => {
    setSetting('translationId', langId);
    setIsTranslationSheetOpen(false);
  }

  const startRecording = async () => {
    if (wordTimings.length === 0 && !karaokeDisabled) {
      toast({ variant: 'destructive', title: 'Timings not loaded', description: 'Please wait for word timings to load before recording.' });
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: 'Error', description: 'Audio recording is not supported in your browser.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setCurrentWordIndex(-1);
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play();
      }

      clearWordTimeouts();
      wordTimings.forEach((word, index) => {
        const timeout = setTimeout(() => {
          setCurrentWordIndex(index);
        }, word.timestamp_from);
        wordTimeoutsRef.current.push(timeout);
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        if (audioPlayerRef.current) audioPlayerRef.current.pause();
        clearWordTimeouts();
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Audio = reader.result as string;
            const originalVerseText = versesForSurah.find(v => v.verse_key === selectedVerseKey)?.text_uthmani;
            if (originalVerseText) {
                localStorage.setItem(STORAGE_KEY_AUDIO, base64Audio);
                localStorage.setItem(STORAGE_KEY_TEXT, originalVerseText);
                router.push(`/record/analysis?verseText=${encodeURIComponent(originalVerseText)}`);
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not find the verse text to analyze.'});
                 setIsProcessing(false);
            }
        };
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access microphone. Please check permissions.'});
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const selectedVerse = versesForSurah.find(v => v.verse_key === selectedVerseKey);
  const verseNumber = selectedVerse?.verse_key?.split(':')[1] || '';

  return (
    <div className="bg-[#12211F] text-white min-h-screen flex flex-col">
       <header className="sticky top-0 z-20 bg-black p-2">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="text-center">
                    <Select value={selectedSurahId} onValueChange={handleSurahChange}>
                        <SelectTrigger className="w-auto bg-transparent border-0 text-white font-semibold text-lg focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {surahs.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.id}. {s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-white/70">{surahInfo?.revelationPlace}</p>
                </div>
                <div className="flex items-center gap-1">
                     <Sheet open={isTranslationSheetOpen} onOpenChange={setIsTranslationSheetOpen}>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="hover:bg-white/10">
                                <Languages className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="w-full max-w-xl mx-auto h-[60vh] flex flex-col rounded-t-2xl">
                            <SheetHeader className="text-center pb-4 border-b">
                                <SheetTitle>Choose Translation</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-grow">
                                <div className="p-4 space-y-1">
                                    {activeTranslationOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleTranslationChange(opt.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{opt.flag}</span>
                                                <div>
                                                    <p className="text-lg text-foreground">{opt.nativeName}</p>
                                                    <p className="text-sm text-muted-foreground">{opt.translator}</p>
                                                </div>
                                            </div>
                                            {opt.isActive && <Check className="h-5 w-5 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </SheetContent>
                     </Sheet>
                </div>
            </div>
       </header>

       <div className="bg-[#2B3B38] p-2 shadow-md">
            <div className="container mx-auto flex justify-between items-center text-xs text-white/80">
                <span>Juz {selectedVerse?.juz || '...'} | Page {selectedVerse?.page || '...'}</span>
                <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>{verseNumber}/{surahInfo?.versesCount}</span>
                </div>
            </div>
       </div>
      
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
        <div className="w-full mb-8">
            {selectedVerse && (
                <KaraokeVerse 
                    verse={selectedVerse}
                    wordTimings={wordTimings}
                    currentWordIndex={currentWordIndex}
                    fontStyle={settings.fontStyle}
                    fontSize={settings.fontSize}
                    isKaraokeDisabled={karaokeDisabled}
                    translation={selectedVerse.translation}
                />
            )}
        </div>
        <div className="w-full flex-grow">
          <VerseSelector 
            verses={versesForSurah.map(v => ({...v, isActive: v.verse_key === selectedVerseKey}))}
            onVerseSelect={handleVerseSelect} 
            fontStyle={settings.fontStyle}
            fontSize={settings.fontSize * 0.75} // Smaller font for the list
          />
        </div>
      </main>
      
      <footer className="sticky bottom-0 left-0 right-0 p-2 bg-transparent">
        <div className="container mx-auto flex flex-col items-center justify-center max-w-4xl relative">
            <div className="absolute bottom-full mb-2 text-center w-full">
                <p className="text-xs text-white/60">Practice verse: {selectedVerseKey}</p>
            </div>
            <div className="relative w-full h-16 flex justify-center items-center">
                <SoundWave isRecording={isRecording} />
                <Button 
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!selectedVerseKey || isProcessing || (wordTimings.length === 0 && !karaokeDisabled)}
                    size="icon"
                    className="relative rounded-full h-14 w-14 transition-all duration-300 shadow-lg z-10 bg-primary hover:bg-primary/90"
                >
                    {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isRecording ? (
                        <Square className="h-6 w-6" />
                    ) : (
                        <Mic className="h-6 w-6" />
                    )}
                </Button>
            </div>
        </div>
      </footer>
      <audio ref={audioPlayerRef} onEnded={() => setCurrentWordIndex(-1)} className="hidden" />
    </div>
  );
}
