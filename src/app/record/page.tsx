
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/lib/quran';
import { getLocalWordTimings } from '@/lib/quran-verses';
import type { Ayah, Surah } from '@/types';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { KaraokeVerse } from '@/components/KaraokeVerse';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VerseSelector } from '@/components/VerseSelector';
import { SoundWave } from '@/components/SoundWave';
import { toastTranslations } from '@/lib/toast-translations';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';
const ENGLISH_TRANSLATION_ID = '131'; // Sahih International

export default function RecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings } = useQuranSettings();
  
  const [selectedSurahId, setSelectedSurahId] = useState('1');
  const [selectedVerseKey, setSelectedVerseKey] = useState('1:1');
  const [versesForSurah, setVersesForSurah] = useState<Ayah[]>([]);
  const [surahInfo, setSurahInfo] = useState<Surah | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wordTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // State for Karaoke feature
  const [wordTimings, setWordTimings] = useState<any[]>([]);
  const [karaokeDisabled, setKaraokeDisabled] = useState(false);

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return toastTranslations[langCode] ? langCode : 'en';
  }, [settings.translationId]);
  
  const t = useMemo(() => toastTranslations[lang] || toastTranslations['en'], [lang]);

  useEffect(() => {
    const surah = surahs.find(s => s.id === parseInt(selectedSurahId, 10));
    setSurahInfo(surah || null);
  }, [selectedSurahId]);

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

    // Try to get local timings first
    const localTimings = getLocalWordTimings(verseKey);
    if (localTimings) {
        setWordTimings(localTimings);
        if (audioPlayerRef.current) {
            const audioUrl = localTimings[0].audio_url; // Assuming this is now a full path
            audioPlayerRef.current.src = audioUrl;
        }
        return;
    }

    try {
        const reciterId = settings.reciterId || 7; // Default to Alafasy
        const response = await fetch(`https://api.quran.com/api/v4/quran/recitations/${reciterId}/by_verse/${verseKey}?word_fields=text_uthmani,timestamps`);
        
        if (!response.ok) {
          toast({ variant: 'destructive', title: t.karaokeUnavailable, description: t.karaokeVerseReciterUnavailable });
          setKaraokeDisabled(true);
          return;
        }
        
        const data = await response.json();
        const timings = data.audio_files[0]?.words;

        if (timings && timings.length > 0 && timings[0].audio_url) {
            setWordTimings(timings);
            if (audioPlayerRef.current) {
                const audioUrl = `https://verses.quran.com/${timings[0].audio_url}`;
                audioPlayerRef.current.src = audioUrl;
            }
        } else {
            toast({ variant: 'destructive', title: t.karaokeUnavailable, description: t.karaokeVerseReciterUnavailable });
            setKaraokeDisabled(true);
        }

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: t.karaokeDisabled, description: t.karaokeLoadError });
        setKaraokeDisabled(true);
    }
  }, [settings.reciterId, toast, t]);

  const fetchVerses = useCallback(async (surahId: number) => {
    try {
      const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=en&words=false&translations=${ENGLISH_TRANSLATION_ID}&fields=text_uthmani,juz_number,page_number`);
      if (!response.ok) {
        throw new Error('Failed to fetch verse data.');
      }
      const data = await response.json();

      const combinedVerses: Ayah[] = data.verses.map((v: any) => ({
        id: v.id,
        verse_key: v.verse_key,
        text_uthmani: v.text_uthmani,
        juz: v.juz_number,
        page: v.page_number,
        translation: v.translations?.[0]?.text.replace(/<sup.*?<\/sup>/g, '') || t.translationNotAvailable
      }));

      setVersesForSurah(combinedVerses);

      const firstVerseKey = combinedVerses[0]?.verse_key || '';
      if (firstVerseKey) {
        setSelectedVerseKey(firstVerseKey);
        await fetchWordTimings(firstVerseKey);
      }

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: t.error, description: t.versesLoadError });
      setVersesForSurah([]);
    }
  }, [toast, fetchWordTimings, t]);


  useEffect(() => {
    fetchVerses(parseInt(selectedSurahId, 10));
  }, [selectedSurahId, fetchVerses]);

  const handleSurahChange = (surahId: string) => {
    setSelectedSurahId(surahId);
  }

  const handleVerseSelect = (verseKey: string) => {
    setSelectedVerseKey(verseKey);
    setShowTranslation(false);
    fetchWordTimings(verseKey);
  }


  const startRecording = async () => {
    if (wordTimings.length === 0 && !karaokeDisabled) {
      toast({ variant: 'destructive', title: t.timingsNotLoaded, description: t.waitTimings });
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: t.error, description: t.audioRecordingNotSupported });
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

        // Check if the recording is empty
        if (audioBlob.size < 1000) { // Less than 1KB is likely empty/silent
            toast({
                variant: 'destructive',
                title: t.emptyRecording,
                description: t.noAudioDetected,
            });
            setIsRecording(false);
            setIsProcessing(false);
            return;
        }

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
                 toast({ variant: 'destructive', title: t.error, description: t.verseTextNotFound });
                 setIsProcessing(false);
            }
        };
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({ variant: 'destructive', title: t.micError, description: t.micAccessError });
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
    <div className="bg-black text-white min-h-screen flex flex-col">
       <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm p-2">
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
                <div className="flex items-center gap-1 w-10">
                </div>
            </div>
       </header>
      
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
                    translation={showTranslation ? selectedVerse.translation : undefined}
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
            <div className="absolute bottom-full mb-2 text-center w-full flex justify-center items-center gap-4">
                <p className="text-xs text-white/60">Practice verse: {selectedVerseKey}</p>
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTranslation(s => !s)}
                    className="text-white/60 hover:text-white hover:bg-white/10 h-8 rounded-full"
                    aria-label="Toggle Translation"
                  >
                    {showTranslation ? "Hide" : "Show"} Translation
                 </Button>
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

    