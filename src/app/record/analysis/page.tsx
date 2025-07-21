
'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { analyzeRecitation } from '@/lib/actions';
import type { AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Mic, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { QuotaBanner } from '@/components/QuotaBanner';

const STORAGE_KEY_AUDIO = 'recitationAudio';
const STORAGE_KEY_TEXT = 'recitationText';

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verseText = searchParams.get('verseText');
  
  const [analysis, setAnalysis] = useState<AnalyzeRecitationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const audioDataUri = localStorage.getItem(STORAGE_KEY_AUDIO);
        const originalVerseText = localStorage.getItem(STORAGE_KEY_TEXT);

        if (!audioDataUri || !originalVerseText) {
            throw new Error("Recitation data not found. Please record again.");
        }

        const result = await analyzeRecitation({ audioDataUri, originalVerseText });
        setAnalysis(result);

        // Clear storage only on success
        localStorage.removeItem(STORAGE_KEY_AUDIO);
        localStorage.removeItem(STORAGE_KEY_TEXT);

    } catch (e: any) {
        console.error("Analysis failed:", e);
        setError(e.message || 'An unknown error occurred during analysis.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[400px]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-2xl font-bold mt-4">Analyzing Your Recitation...</h2>
        <p className="text-muted-foreground">This may take a few moments. We're listening carefully to your tilaawah.</p>
      </div>
    );
  }

  if (error) {
    if (error.includes('exceeded the daily limit')) {
        return <QuotaBanner onRetry={performAnalysis} />;
    }
    return (
        <div className="text-center p-4">
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-4 justify-center">
                <Button onClick={performAnalysis}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/record">
                        <Mic className="mr-2 h-4 w-4" />
                        Record Again
                    </Link>
                </Button>
            </div>
        </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center p-4">
        <p>No analysis data available.</p>
      </div>
    );
  }

  const score = analysis.score || 0;

  return (
    <div className="space-y-8">
        {/* Original Text */}
        <Card>
            <CardHeader>
                <CardTitle>Original Verse</CardTitle>
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
                <CardTitle>Recitation Score: {score}/100</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={score} className="h-4" />
                <div>
                    <h3 className="font-semibold mb-2">Feedback:</h3>
                    <p className="text-muted-foreground">{analysis.feedback}</p>
                </div>
            </CardContent>
        </Card>

        {/* Word-by-word Analysis */}
        <Card>
            <CardHeader>
                <CardTitle>Detailed Tajweed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div dir="rtl" className="flex flex-wrap gap-x-2 gap-y-4">
                    {analysis.tajweedAnalysis.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span className={`text-3xl font-arabic px-2 py-1 rounded-md ${item.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {item.word}
                            </span>
                             <span className={`text-xs mt-1 ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                {item.assessment}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <div className="text-center">
            <Button asChild>
                <Link href="/record">
                    <Mic className="mr-2 h-4 w-4" />
                    Practice Another Verse
                </Link>
            </Button>
        </div>
    </div>
  );
}

export default function AnalysisPage() {
    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
            <header className="flex items-center mb-8 relative">
                <Link href="/record" passHref>
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Back</span>
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold w-full text-center">Recitation Analysis</h1>
            </header>
            <main>
                <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                    <AnalysisContent />
                </Suspense>
            </main>
        </div>
    );
}
