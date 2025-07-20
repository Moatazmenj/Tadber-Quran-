
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/lib/quran';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import type { Ayah, Surah } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';

export default function RecordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [selectedSurahId, setSelectedSurahId] = useState('1');
  const [selectedVerseKey, setSelectedVerseKey] = useState('');
  const [versesForSurah, setVersesForSurah] = useState<Ayah[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch verses for the selected surah
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
        setSelectedVerseKey(verses?.[0]?.verse_key || '');
    };
    fetchVerses();
  }, [selectedSurahId, toast]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ variant: 'destructive', title: 'Error', description: 'Audio recording is not supported in your browser.'});
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
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

  const selectedVerseText = versesForSurah.find(v => v.verse_key === selectedVerseKey)?.text_uthmani;

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
       <header className="flex items-center mb-8 relative">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div className="w-full text-center">
            <h1 className="text-2xl font-bold">Recitation Practice</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a verse, record, and get AI feedback.</p>
          </div>
        </header>

      <Card className="mb-8">
        <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="surah-select" className="text-sm font-medium text-muted-foreground">Surah</label>
                    <Select value={selectedSurahId} onValueChange={setSelectedSurahId}>
                        <SelectTrigger id="surah-select">
                            <SelectValue placeholder="Select a Surah" />
                        </SelectTrigger>
                        <SelectContent>
                            {surahs.map(surah => (
                                <SelectItem key={surah.id} value={surah.id.toString()}>
                                    {surah.id}. {surah.name} ({surah.arabicName})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <label htmlFor="verse-select" className="text-sm font-medium text-muted-foreground">Verse</label>
                    <Select value={selectedVerseKey} onValueChange={setSelectedVerseKey} disabled={versesForSurah.length === 0}>
                        <SelectTrigger id="verse-select">
                            <SelectValue placeholder="Select a Verse" />
                        </SelectTrigger>
                        <SelectContent>
                             {versesForSurah.map(verse => (
                                <SelectItem key={verse.verse_key} value={verse.verse_key}>
                                    Verse {verse.verse_key.split(':')[1]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedVerseText && (
                <div className="pt-4 text-center border-t border-border/50">
                    <p dir="rtl" className="font-arabic text-3xl leading-loose">
                        {selectedVerseText}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!selectedVerseKey || isProcessing}
            size="lg"
            className={cn(
                "rounded-full h-20 w-20 transition-all duration-300 shadow-lg",
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-primary'
            )}
        >
            {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
                <Square className="h-8 w-8" />
            ) : (
                <Mic className="h-8 w-8" />
            )}
        </Button>
        <p className="text-muted-foreground mt-4">
            {isProcessing ? 'Processing...' : (isRecording ? 'Tap to Stop Recording' : 'Tap to Start Recording')}
        </p>
      </div>
    </div>
  );
}
