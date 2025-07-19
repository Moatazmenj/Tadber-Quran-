
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Loader2, AlertCircle, RefreshCw, Share2 } from 'lucide-react';
import { getVerseMessage } from '@/lib/actions';
import { surahs } from '@/lib/quran';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import type { Ayah, Surah } from '@/types';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface UthmaniVerseApiResponse {
    verses: UthmaniVerse[];
}

export default function MessagePage() {
  const { toast } = useToast();
  const { settings } = useQuranSettings();
  const params = useParams();
  const verseKey = params.verse_key as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [verse, setVerse] = useState<Ayah | null>(null);
  const [surah, setSurah] = useState<Surah | null>(null);

  useEffect(() => {
    const fetchVerseData = async () => {
      if (!verseKey) return;

      try {
        const [surahIdStr, verseIdStr] = verseKey.split(':');
        const surahId = parseInt(surahIdStr, 10);
        
        const surahInfo = surahs.find(s => s.id === surahId);
        if (!surahInfo) throw new Error("Surah not found.");
        setSurah(surahInfo);

        let verseData: Omit<Ayah, 'translation'> | undefined;
        let localVerses = getLocalVersesForSurah(surahId);

        if (localVerses) {
          verseData = localVerses.find(v => v.verse_key === verseKey);
        } else {
          const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`);
          const data: UthmaniVerseApiResponse = await res.json();
          verseData = data.verses.find(v => v.verse_key === verseKey);
        }

        if (!verseData) throw new Error("Verse not found.");
        setVerse(verseData);

      } catch (e: any) {
        console.error("Error fetching verse data:", e);
        setError(e.message || "Could not load verse data.");
        setIsLoading(false);
      }
    };
    
    fetchVerseData();
  }, [verseKey]);

  useEffect(() => {
    if (!verse || !surah) return;

    const performGeneration = async () => {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const result = await getVerseMessage({
          surahName: surah.name,
          verseNumber: verse.verse_key.split(':')[1],
          verseText: verse.text_uthmani,
        });
        setMessage(result.message);
      } catch (e: any) {
        console.error('Message generation error:', e);
        setError(e.message || 'An unknown error occurred while generating the message.');
      } finally {
        setIsLoading(false);
      }
    };

    performGeneration();
  }, [verse, surah]);

  const handleShare = () => {
    if (!message || !verse || !surah) return;

    const shareText = `${message}\n\n- رسالة من القرآن (${surah.name}:${verse.verse_key.split(':')[1]})`;

    navigator.share({
        title: 'رسالة من القرآن',
        text: shareText,
    }).catch((err) => {
        if (err.name !== 'AbortError') {
            toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not share the message.'});
        }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-bold">...لحظات من التأمل</h2>
          <p className="text-muted-foreground">يتم إعداد رسالتك القرآنية الآن</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center" dir="rtl">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>فشل الحصول على الرسالة</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
      );
    }

    if (message && verse && surah) {
      return (
        <div dir="rtl">
          <Card className="w-full overflow-hidden shadow-lg bg-transparent relative border-none">
             <CardHeader className="p-6 text-center">
                <CardTitle className={cn(
                    "text-3xl pb-4 font-arabic-uthmanic text-primary",
                    settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : (settings.fontStyle === 'uthmanic' ? 'font-arabic-uthmanic' : 'font-arabic')
                    )}
                    style={{ fontSize: `${settings.fontSize * 1.2}px`, lineHeight: `${settings.fontSize * 2}px` }}
                >
                    {verse.text_uthmani}
                </CardTitle>
                <CardDescription>
                    سورة {surah.name}، الآية {verse.verse_key.split(':')[1]}
                </CardDescription>
              </CardHeader>
      
              <CardContent className="p-6 md:p-8 space-y-8">
                  <div className="bg-card/50 p-6 rounded-lg shadow-inner">
                      <p className="text-lg leading-loose whitespace-pre-wrap font-arabic text-foreground/90 text-center">
                          {message}
                      </p>
                  </div>

                  {navigator.share && (
                    <div className="flex justify-center">
                        <Button onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            شارك هذه الرسالة
                        </Button>
                    </div>
                  )}
              </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-background min-h-screen" style={{
        backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'hsl(var(--background))'
    }}>
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
        <header className="flex items-center justify-between mb-8">
          <div className="w-10 h-10"></div>
          <h1 className="text-2xl font-bold text-center flex-grow">رسالة من القرآن</h1>
          <Button asChild variant="ghost" size="icon" className="h-10 w-10">
              <Link href={surah ? `/surah/${surah.id}` : '/'}>
                <ChevronLeft className="h-6 w-6 rotate-180" />
                <span className="sr-only">Back</span>
              </Link>
          </Button>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

