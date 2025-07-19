
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getSpiritualRemedy } from '@/lib/actions';
import type { SpiritualRemedyOutput } from '@/ai/flows/get-spiritual-remedy';
import { Loader2, AlertCircle, Sparkles, BookOpen, ScrollText, Headphones, HeartPulse, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toArabicNumerals } from '@/lib/utils';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import Link from 'next/link';

export function SpiritualClinicDialog() {
  const { settings } = useQuranSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remedy, setRemedy] = useState<SpiritualRemedyOutput | null>(null);

  useEffect(() => {
    // This dialog should appear on every visit to the home page.
    setIsOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling.trim()) return;

    setIsLoading(true);
    setError(null);
    setRemedy(null);

    try {
      const result = await getSpiritualRemedy({ feeling });
      setRemedy(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFeeling('');
    setRemedy(null);
    setError(null);
    setIsLoading(false);
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
        <div dir="rtl" className="p-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <BookOpen className="h-5 w-5"/>
                        آيات السكينة
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {remedy.verses.map(v => (
                         <p key={v.verse_key} className="font-arabic text-lg leading-loose text-center">
                            {v.text} <span className="text-sm text-primary">({toArabicNumerals(v.verse_key)})</span>
                        </p>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <ScrollText className="h-5 w-5"/>
                        تفسير ميسّر
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="leading-relaxed">{remedy.tafsir}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <HeartPulse className="h-5 w-5"/>
                        دعاء نبوي
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="leading-loose font-medium text-center">{remedy.dua}</p>
                </CardContent>
            </Card>

            <Card className="bg-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary">
                        <Headphones className="h-5 w-5"/>
                        توصية استماع
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-2">
                        ننصحك بالاستماع إلى <span className="font-bold">{remedy.recitationSuggestion.surahName}</span> بصوت القارئ <span className="font-bold">{remedy.recitationSuggestion.reciterName}</span> لراحة قلبك.
                    </p>
                </CardContent>
            </Card>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            العيادة الروحية
          </DialogTitle>
          <DialogDescription>
            هنا تجد السكينة لقلبك والشفاء لروحك.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter className="sm:justify-start">
          <Button type="submit" className="w-full" disabled={!feeling.trim()}>
            ابحث عن وصفتي الإيمانية
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg rounded-xl max-h-[90vh] flex flex-col">
        <div className="flex-grow overflow-y-auto -mx-6 px-6 pt-2 pb-6">
            {renderContent()}
        </div>
        {remedy && (
             <DialogFooter className="border-t pt-4 -mx-6 px-6">
                <Button onClick={handleReset} className="w-full">
                    <RefreshCw className="ml-2 h-4 w-4" />
                    البحث عن وصفة أخرى
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
