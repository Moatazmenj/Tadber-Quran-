
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/lib/quran';
import { getLocalVersesForSurah, getLocalWordTimings } from '@/lib/quran-verses';
import type { Ayah, Surah, WordTiming } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2, ChevronLeft, Info, Settings, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { KaraokeVerse } from '@/components/KaraokeVerse';
import { useQuranSettings } from '@/hooks/use-quran-settings';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';

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
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [karaokeDisabled, setKaraokeDisabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const wordTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

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

    if (timings) {
        setWordTimings(timings);
        if (audioPlayerRef.current) {
            const audioUrl = `https://verses.quran.com/${timings[0].audio_url}`;
            audioPlayerRef.current.src = audioUrl;
        }
    } else {
        setKaraokeDisabled(true);
    }
  }, [settings.reciterId, toast]);

  useEffect(() => {
    const fetchVerses = async () => {
        const surahId = parseInt(selectedSurahId, 10);
        let verses = getLocalVersesForSurah(surahId);

        if (!verses) {
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
        }
        
        setVersesForSurah(verses || []);
        const firstVerseKey = verses?.[0]?.verse_key || '';
        setSelectedVerseKey(firstVerseKey);
        fetchWordTimings(firstVerseKey);
    };
    fetchVerses();
  }, [selectedSurahId, toast, fetchWordTimings]);

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
  const verseNumber = selectedVerseKey.split(':')[1];

  return (
    <div className="bg-[#243431] text-white min-h-screen flex flex-col">
       <header className="sticky top-0 z-20 bg-[#12211F] p-2">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="text-center">
                    <h1 className="font-semibold">{surahInfo?.id}. {surahInfo?.name}</h1>
                    <p className="text-xs text-white/70">{surahInfo?.revelationPlace}</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <Info className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="hover:bg-white/10">
                        <Settings className="h-5 w-5" />
                    </Button>
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
        <div className="w-full">
            {selectedVerse && (
                <KaraokeVerse 
                    verse={selectedVerse}
                    wordTimings={wordTimings}
                    currentWordIndex={currentWordIndex}
                    fontStyle={settings.fontStyle}
                    fontSize={settings.fontSize}
                    isKaraokeDisabled={karaokeDisabled}
                />
            )}
        </div>
      </main>
      
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-[#12211F]/80 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-center max-w-4xl relative">
            <Button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!selectedVerseKey || isProcessing || (wordTimings.length === 0 && !karaokeDisabled)}
                size="icon"
                className="rounded-full h-16 w-16 transition-all duration-300 shadow-lg z-10 bg-primary hover:bg-primary/90"
            >
                {isProcessing ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                ) : isRecording ? (
                    <Square className="h-7 w-7" />
                ) : (
                    <Mic className="h-7 w-7" />
                )}
            </Button>
        </div>
      </footer>
      <audio ref={audioPlayerRef} onEnded={() => setCurrentWordIndex(-1)} className="hidden" />
    </div>
  );
}
