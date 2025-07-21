
'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { analyzeRecitation } from '@/lib/actions';
import type { AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Mic, ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { QuotaBanner } from '@/components/QuotaBanner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { analysisTranslations } from '@/lib/analysis-translations';
import { translationOptions } from '@/lib/translations';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verseText = searchParams.get('verseText');
  
  const [analysis, setAnalysis] = useState<AnalyzeRecitationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { settings } = useQuranSettings();
  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return analysisTranslations[langCode] ? langCode : 'en';
  }, [settings.translationId]);
  
  const t = useMemo(() => analysisTranslations[lang] || analysisTranslations['en'], [lang]);
  const isRtl = lang === 'ar' || lang === 'ur';

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const audioDataUri = localStorage.getItem(STORAGE_KEY_AUDIO);
        const originalVerseText = localStorage.getItem(STORAGE_KEY_TEXT);

        if (!audioDataUri || !originalVerseText) {
            throw new Error(t.errorDataNotFound);
        }

        const targetLanguage = translationOptions.find(opt => opt.id === lang)?.language || 'English';
        const result = await analyzeRecitation({ 
          audioDataUri, 
          originalVerseText, 
          language: targetLanguage 
        });
        setAnalysis(result);

        // Clear storage only on success
        localStorage.removeItem(STORAGE_KEY_AUDIO);
        localStorage.removeItem(STORAGE_KEY_TEXT);

    } catch (e: any) {
        console.error("Analysis failed:", e);
        setError(e.message || t.errorUnknown);
    } finally {
        setIsLoading(false);
    }
  }, [t, lang]);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[400px]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-2xl font-bold mt-4">{t.loadingTitle}</h2>
        <p className="text-muted-foreground">{t.loadingDescription}</p>
      </div>
    );
  }

  if (error) {
    if (error.includes('exceeded the daily limit')) {
        return <QuotaBanner onRetry={performAnalysis} isRtl={isRtl} />;
    }
    return (
        <div className="text-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{t.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-4 justify-center">
                <Button onClick={performAnalysis}>
                    <RefreshCw className={isRtl ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                    {t.retryButton}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/record">
                        <Mic className={isRtl ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                        {t.recordAgainButton}
                    </Link>
                </Button>
            </div>
        </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center p-4">
        <p>{t.noAnalysis}</p>
      </div>
    );
  }

  const score = analysis.score || 0;

  return (
    <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Original Text */}
        <Card>
            <CardHeader>
                <CardTitle>{t.originalVerse}</CardTitle>
            </CardHeader>
            <CardContent>
                <p dir="rtl" className="font-arabic text-2xl leading-loose text-center">
                    {verseText}
                </p>
            </CardContent>
        </Card>

        {/* Score and Overall Feedback */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                <CardTitle>{t.recitationScore}: {score}/100</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={score} className="h-4" />
                <div>
                    <h3 className="font-semibold mb-2">{t.feedback}:</h3>
                    <p className="text-muted-foreground">{analysis.overallFeedback}</p>
                </div>
            </CardContent>
        </Card>
        
        {/* Word-by-word Analysis */}
        <Card>
            <CardHeader>
                <CardTitle>{t.wordAnalysis}</CardTitle>
            </CardHeader>
            <CardContent>
                <div dir="rtl" className="flex flex-wrap justify-center items-start gap-x-2 gap-y-6">
                    {analysis.wordByWordAnalysis.map((item, index) => (
                        <TooltipProvider key={index}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <span className={`text-3xl font-arabic px-2 py-1 rounded-md ${item.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {item.word}
                                        </span>
                                        <span className={`text-xs mt-1 ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.assessment}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                {item.details && (
                                    <TooltipContent side="bottom" className="max-w-xs text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
                                        <div className="space-y-2 p-1">
                                            {item.details.makharij && <p><strong>{t.makhraj}:</strong> {item.details.makharij}</p>}
                                            {item.details.sifaat && <p><strong>{t.sifaat}:</strong> {item.details.sifaat}</p>}
                                            {item.details.tajweedRule && <p><strong>{t.tajweed}:</strong> {item.details.tajweedRule}</p>}
                                            {item.details.timing && <p><strong>{t.timing}:</strong> {item.details.timing}</p>}
                                        </div>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        {/* Actionable Tips */}
        <Card>
            <CardHeader>
                <CardTitle>{t.actionableTips}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {analysis.actionableTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        <div className="text-center">
            <Button asChild>
                <Link href="/record">
                    <Mic className={isRtl ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                    {t.practiceAnother}
                </Link>
            </Button>
        </div>
    </div>
  );
}

export default function AnalysisPage() {
    const { settings } = useQuranSettings();
    const lang = useMemo(() => {
        const langCode = settings.translationId;
        return analysisTranslations[langCode] ? langCode : 'en';
    }, [settings.translationId]);

    const t = useMemo(() => analysisTranslations[lang] || analysisTranslations['en'], [lang]);
    const isRtl = lang === 'ar' || lang === 'ur';

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="flex items-center mb-8 relative">
                <Link href="/record" passHref>
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
                        <ChevronLeft className={isRtl ? 'rotate-180' : ''} />
                        <span className="sr-only">{t.back}</span>
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold w-full text-center">{t.pageTitle}</h1>
            </header>
            <main>
                <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                    <AnalysisContent />
                </Suspense>
            </main>
        </div>
    );
}
