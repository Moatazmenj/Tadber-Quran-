
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { surahs } from '@/lib/quran';
import { Card } from '@/components/ui/card';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(SpeechRecognitionAPI != null);
  
  const [searchResult, setSearchResult] = useState<VerseSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
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
    if (!isSupported || !SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';

    recognition.onresult = (event) => {
        const transcriptArray = Array.from(event.results);
        
        const finalTranscript = transcriptArray
            .filter(result => result.isFinal)
            .map(result => result[0].transcript)
            .join(' ');
            
        const interimTranscript = transcriptArray
            .filter(result => !result.isFinal)
            .map(result => result[0].transcript)
            .join('');

        finalTranscriptRef.current = finalTranscript + (finalTranscript ? ' ' : '') + interimTranscript;
    };

    recognition.onend = () => {
      if (isStoppingRef.current) {
        setIsRecording(false);
        if (finalTranscriptRef.current.trim()) {
          performSearch(finalTranscriptRef.current.trim());
        }
      } else if (isRecording) {
        // If it was an automatic stop, restart recognition to keep listening
        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        } catch (error) {
          console.error("Speech recognition restart failed:", error);
          setIsRecording(false); // Fallback to stopping if restart fails
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
      setSearchResult(null);
      setSearchError(null);
      setIsSearching(false);
      
      isStoppingRef.current = false;
      setIsRecording(true); // Set recording to true before starting
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
            <div className="flex flex-col items-center justify-center gap-4">
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
        const verseNumberDisplay = searchResult.verseNumber.toLocaleString('ar-EG');
        const verseEndSymbol = `\u06dd${verseNumberDisplay}`;

        return (
            <Link href={`/surah/${searchResult.surahId}#verse-${searchResult.verseNumber}`} passHref className="w-full max-w-2xl">
                <Card className="text-center p-6 hover:bg-card/80 transition-colors w-full">
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

    if (isRecording) {
      return (
          <div className="flex flex-col items-center justify-center text-center gap-6">
              <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-destructive/20" />
                  <div className="w-24 h-24 rounded-full bg-destructive/20 animate-ping absolute" />
                  <Mic className="h-10 w-10 text-destructive-foreground absolute" />
              </div>
              <p dir="rtl" className="text-2xl font-arabic text-foreground/80 leading-relaxed">
                  جارِ الاستماع...
              </p>
          </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center gap-4">
            <Mic className="h-16 w-16 text-muted-foreground" />
            <p dir="rtl" className="text-2xl font-arabic text-foreground/80 leading-relaxed max-w-md">
                انقر على الميكروفون لبدء تلاوة الآية التي تريد البحث عنها
            </p>
        </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl flex flex-col h-screen">
      <header className="flex items-center flex-shrink-0">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="w-full flex-grow flex items-center justify-center p-4">
            {renderContent()}
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
            <Button 
                variant="destructive" 
                size="icon" 
                className="w-20 h-20 rounded-full"
                onClick={handleStartRecording}
                disabled={isRecording || !isSupported}
            >
                <Mic className="h-8 w-8" />
                <span className="sr-only">Record</span>
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full"
                onClick={handleStopRecording}
                disabled={!isRecording || !isSupported}
            >
                <Square className="h-6 w-6" />
                <span className="sr-only">Stop</span>
            </Button>
        </div>
      </main>
    </div>
  );
}
