'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Loader2, AlertCircle, MessageSquareQuote, BookText, RefreshCw } from 'lucide-react';
import { getRecitationAnalysis } from '@/lib/actions';
import type { AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuranSettings } from '@/hooks/use-quran-settings';

const ANALYSIS_STORAGE_KEY = 'recitationAnalysisData';

export default function AnalysisPage() {
  const router = useRouter();
  const { settings } = useQuranSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeRecitationOutput | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [surahName, setSurahName] = useState('');

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const storedData = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!storedData) {
      setError('لم يتم العثور على بيانات التلاوة. يرجى محاولة التسجيل مرة أخرى.');
      setIsLoading(false);
      return;
    }

    try {
      const { audioDataUri, originalText, surahName } = JSON.parse(storedData);
      setOriginalText(originalText);
      setSurahName(surahName);

      const result = await getRecitationAnalysis({ audioDataUri, originalText, surahName });
      setAnalysis(result);

      // IMPORTANT: Clean up storage only on success
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);

    } catch (e: any) {
      console.error('Analysis error:', e);
      // Do not remove item from storage on error, to allow for retry.
      setError(e.message || 'حدث خطأ غير معروف أثناء التحليل.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-bold">...جاري تحليل تلاوتك</h2>
          <p className="text-muted-foreground">قد يستغرق هذا بعض الوقت. يقوم خبير ذكاء اصطناعي بمراجعة تجويدك.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center" dir="rtl">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>فشل التحليل</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={performAnalysis} className="mt-4">
                إعادة المحاولة
                <RefreshCw className="mr-2 h-4 w-4" />
            </Button>
        </div>
      );
    }

    if (analysis) {
      return (
        <div dir="rtl">
          <Card className="w-full overflow-hidden shadow-lg bg-transparent relative border-none">
            <div className="absolute top-0 left-0 h-28 w-28 pointer-events-none">
              <Image
                src="https://i.postimg.cc/05BYGNLJ/muslim-1.png"
                width={112}
                height={112}
                alt="Decorative illustration"
                className="opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-card"></div>
            </div>

            <div className="relative z-10">
              <CardHeader className="p-6 text-right">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">تقرير تحليل التلاوة</CardTitle>
                    <CardDescription>بناءً على تلاوتك لسورة {surahName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 w-full sm:w-auto justify-center">
                    <div className="text-right">
                        <p className="text-sm font-medium text-primary">التقييم النهائي</p>
                        <p className="text-4xl font-bold text-primary">{analysis.score}</p>
                    </div>
                    <Progress value={analysis.score} className="w-24 h-3" />
                  </div>
                </div>
              </CardHeader>
      
              <CardContent className="p-6 md:p-8 space-y-8">
                  <div className="bg-transparent">
                      <h3 className="text-base font-semibold flex items-center gap-3 mb-4 text-primary">
                          <MessageSquareQuote className="h-5 w-5 text-primary" />
                          ملاحظات المعلم الآلي
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap font-arabic text-foreground/90">
                          {analysis.feedback}
                      </p>
                  </div>
      
                  <div className="bg-transparent">
                      <h3 className="text-base font-semibold flex items-center gap-3 mb-4 text-primary">
                          <BookText className="h-5 w-5 text-primary" />
                          النص الأصلي الذي تمت تلاوته
                      </h3>
                      <div className="p-4">
                        <p
                          className="font-arabic leading-loose text-justify text-foreground"
                          style={{ fontSize: `${settings.fontSize * 0.7}px`, lineHeight: `${settings.fontSize * 1.6}px` }}
                        >
                            {originalText}
                        </p>
                      </div>
                  </div>
              </CardContent>
            </div>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div className="w-10 h-10"></div>
          <h1 className="text-2xl font-bold text-center flex-grow">تحليل التلاوة</h1>
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6 rotate-180" />
              <span className="sr-only">Back</span>
          </Button>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
