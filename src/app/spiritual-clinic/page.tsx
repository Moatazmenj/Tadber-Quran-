
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getSpiritualRemedy } from '@/lib/actions';
import type { SpiritualRemedyOutput } from '@/ai/flows/get-spiritual-remedy';
import { Loader2, AlertCircle, BookOpen, ScrollText, Headphones, HeartPulse, RefreshCw, ChevronLeft, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toArabicNumerals } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function SpiritualClinicPage() {
  const searchParams = useSearchParams();
  const initialFeeling = searchParams.get('feeling');
  const { toast } = useToast();

  const [feeling, setFeeling] = useState(initialFeeling || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remedy, setRemedy] = useState<SpiritualRemedyOutput | null>(null);

  const fetchRemedy = useCallback(async (currentFeeling: string) => {
    if (!currentFeeling.trim()) return;

    setIsLoading(true);
    setError(null);
    setRemedy(null);

    try {
      const result = await getSpiritualRemedy({ feeling: currentFeeling });
      setRemedy(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFeeling) {
      fetchRemedy(initialFeeling);
    }
  }, [initialFeeling, fetchRemedy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRemedy(feeling);
  };

  const handleReset = () => {
    setFeeling('');
    setRemedy(null);
    setError(null);
    setIsLoading(false);
    // Clear the query param from URL without reloading
    window.history.replaceState(null, '', '/spiritual-clinic');
  };

  const handleShare = async () => {
    if (!remedy) return;

    const versesText = remedy.verses
      .map(v => `${v.text} (${toArabicNumerals(v.verse_key)})`)
      .join('\n');

    const shareText = `وصفة إيمانية من العيادة الروحية:\n\n📖 *آيات السكينة:*\n${versesText}\n\n📜 *تفسير ميسّر:*\n${remedy.tafsir}\n\n🤲 *دعاء نبوي:*\n${remedy.dua}\n\n🎧 *توصية استماع:*\nننصحك بالاستماع إلى ${remedy.recitationSuggestion.surahName} بصوت القارئ ${remedy.recitationSuggestion.reciterName} لراحة قلبك.\n\nتطبيق تدبر القرآن`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: 'وصفة إيمانية - تدبر القرآن',
                text: shareText,
            });
        } else {
            // Fallback for browsers that don't support navigator.share
            await navigator.clipboard.writeText(shareText);
            toast({
                title: 'تم النسخ',
                description: 'تم نسخ الوصفة الإيمانية إلى الحافظة.',
            });
        }
    } catch (err) {
        console.error('Share failed:', err);
        toast({
            variant: 'destructive',
            title: 'فشلت المشاركة',
            description: 'لم نتمكن من مشاركة الوصفة. يرجى المحاولة مرة أخرى.',
        });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold">...جاري تحضير وصفتك الإيمانية</h2>
          <p className="text-muted-foreground">لحظات من فضلك...</p>
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="text-center p-4 min-h-[300px]" dir="rtl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>حدث خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={handleReset} className="mt-4">
                    <RefreshCw className="ml-2 h-4 w-4" />
                    حاول مرة أخرى
                </Button>
            </div>
        )
    }

    if (remedy) {
      return (
        <div dir="rtl" className="p-2 space-y-8">
            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <BookOpen className="h-6 w-6"/>
                    آيات السكينة
                </h3>
                <div className="space-y-4 rounded-lg">
                    {remedy.verses.map(v => (
                         <p key={v.verse_key} className="font-arabic leading-loose text-right text-foreground" style={{fontSize: '20px'}}>
                            {v.text} <span className="text-sm text-primary font-sans">({toArabicNumerals(v.verse_key)})</span>
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <ScrollText className="h-6 w-6"/>
                    تفسير ميسّر
                </h3>
                <p className="leading-relaxed text-right text-foreground" style={{fontSize: '20px'}}>{remedy.tafsir}</p>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <HeartPulse className="h-6 w-6"/>
                    دعاء نبوي
                </h3>
                <p className="leading-loose font-medium text-right text-foreground" style={{fontSize: '20px'}}>{remedy.dua}</p>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <Headphones className="h-6 w-6"/>
                    توصية استماع
                </h3>
                <div className="text-right rounded-lg">
                    <p className="mb-2 text-foreground" style={{fontSize: '20px'}}>
                        {`ننصحك بالاستماع إلى ${remedy.recitationSuggestion.surahName} بصوت القارئ ${remedy.recitationSuggestion.reciterName} لراحة قلبك.`}
                    </p>
                </div>
            </div>

            <div className="text-center pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleReset} className="w-full sm:w-auto">
                    <RefreshCw className="ml-2 h-4 w-4" />
                    البحث عن وصفة أخرى
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto">
                    <Share2 className="ml-2 h-4 w-4" />
                    مشاركة الوصفة
                </Button>
            </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} dir="rtl">
        <div className="my-6">
          <label htmlFor="feeling" className="text-lg font-medium mb-3 block">ماذا تشعر به الآن؟</label>
          <Textarea
            id="feeling"
            placeholder="صف شعورك هنا... مثلاً: أشعر بالقلق، بالحزن، بالضياع..."
            rows={4}
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            className="text-base"
          />
        </div>
        <Button type="submit" className="w-full" disabled={!feeling.trim()}>
          ابحث عن وصفتي الإيمانية
        </Button>
      </form>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="w-full text-center">
            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Image src="https://i.postimg.cc/T3mTt8kc/ai.png" alt="AI Icon" width={24} height={24} />
                العيادة الروحية
            </h1>
            <p className="text-muted-foreground mt-1">هنا تجد السكينة لقلبك والشفاء لروحك.</p>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
