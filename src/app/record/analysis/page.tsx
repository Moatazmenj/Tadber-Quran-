'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Loader2, AlertCircle, Award, MessageSquareQuote } from 'lucide-react';
import { getRecitationAnalysis } from '@/lib/actions';
import type { AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ANALYSIS_STORAGE_KEY = 'recitationAnalysisData';

export default function AnalysisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeRecitationOutput | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [surahName, setSurahName] = useState('');

  useEffect(() => {
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

      const performAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await getRecitationAnalysis({ audioDataUri, originalText, surahName });
          setAnalysis(result);
        } catch (e: any) {
          console.error('Analysis error:', e);
          setError(e.message || 'حدث خطأ غير معروف أثناء التحليل.');
        } finally {
          setIsLoading(false);
          // Clean up storage after analysis attempt to prevent re-use
          localStorage.removeItem(ANALYSIS_STORAGE_KEY);
        }
      };
      
      performAnalysis();

    } catch (err) {
      console.error('Failed to parse analysis data', err);
      setError('تعذر قراءة بيانات التلاوة. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
      // Clean up potentially corrupt storage data
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    }
  }, []);

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
        <Alert variant="destructive" className="max-w-lg mx-auto text-right" dir="rtl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>فشل التحليل</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (analysis) {
      return (
        <div className="space-y-8" dir="rtl">
          <Card>
            <CardHeader className="text-right">
                <div className="flex items-center gap-4">
                    <Award className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>تقييم التلاوة</CardTitle>
                        <CardDescription>التقييم الإجمالي بناءً على تحليل الذكاء الاصطناعي.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">{analysis.score}%</span>
                <Progress value={analysis.score} className="h-4 flex-grow" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-right">
                <div className="flex items-center gap-4">
                    <MessageSquareQuote className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>ملاحظات المعلم الآلي</CardTitle>
                        <CardDescription>تعليقات بناءة لمساعدتك على التحسين.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
              <p dir="rtl" className="text-lg leading-relaxed whitespace-pre-wrap font-arabic text-right">{analysis.feedback}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-right">
                <CardTitle>النص الأصلي</CardTitle>
                <CardDescription>الآية التي تلوتها من سورة {surahName}.</CardDescription>
            </CardHeader>
            <CardContent>
                <p dir="rtl" className="font-arabic text-2xl leading-loose text-justify text-foreground">
                    {originalText}
                </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6 rotate-180" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold w-full text-center">تحليل التلاوة</h1>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer className="mt-12 text-center">
        <Button onClick={() => router.push('/record')}>تسجيل آخر</Button>
      </footer>
    </div>
  );
}
