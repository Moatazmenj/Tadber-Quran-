
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, AlertCircle, MessageSquareQuote, BookText, RefreshCw } from 'lucide-react';
import { getRecitationAnalysis } from '@/lib/actions';
import type { AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { translationOptions } from '@/lib/translations';

const ANALYSIS_STORAGE_KEY = 'recitationAnalysisData';

const translations: Record<string, Record<string, string>> = {
    en: {
        title: "Recitation Analysis",
        loadingTitle: "Tadber Quran",
        loadingDescription: "Analyzing your recitation, this may take a moment...",
        errorTitle: "Analysis Failed",
        retry: "Retry",
        reportTitle: "Recitation Analysis Report",
        reportDescription: "Based on your recitation of Surah {surahName}",
        finalScore: "Final Score",
        teacherFeedback: "AI Teacher's Feedback",
        originalTextTitle: "Original Text Recited",
        back: "Back",
        noDataError: "Recitation data not found. Please try recording again.",
        unknownError: "An unknown error occurred during analysis.",
    },
    ar: {
        title: "تحليل التلاوة",
        loadingTitle: "Tadber Quran",
        loadingDescription: "...جاري تحليل تلاوتك، قد يستغرق هذا بعض الوقت",
        errorTitle: "فشل التحليل",
        retry: "إعادة المحاولة",
        reportTitle: "تقرير تحليل التلاوة",
        reportDescription: "بناءً على تلاوتك لسورة {surahName}",
        finalScore: "التقييم النهائي",
        teacherFeedback: "ملاحظات المعلم الآلي",
        originalTextTitle: "النص الأصلي الذي تمت تلاوته",
        back: "رجوع",
        noDataError: "لم يتم العثور على بيانات التلاوة. يرجى محاولة التسجيل مرة أخرى.",
        unknownError: "حدث خطأ غير معروف أثناء التحليل.",
    },
    fr: {
        title: "Analyse de la Récitation",
        loadingTitle: "Tadber Quran",
        loadingDescription: "Analyse de votre récitation en cours, cela peut prendre un moment...",
        errorTitle: "L'analyse a échoué",
        retry: "Réessayer",
        reportTitle: "Rapport d'Analyse de la Récitation",
        reportDescription: "Basé sur votre récitation de la Sourate {surahName}",
        finalScore: "Score Final",
        teacherFeedback: "Commentaires de l'enseignant IA",
        originalTextTitle: "Texte Original Récité",
        back: "Retour",
        noDataError: "Données de récitation non trouvées. Veuillez essayer d'enregistrer à nouveau.",
        unknownError: "Une erreur inconnue s'est produite lors de l'analyse.",
    },
    es: {
        title: "Análisis de Recitación",
        loadingTitle: "Tadber Quran",
        loadingDescription: "Analizando tu recitación, esto puede tardar un momento...",
        errorTitle: "El Análisis Falló",
        retry: "Reintentar",
        reportTitle: "Informe de Análisis de Recitación",
        reportDescription: "Basado en tu recitación de la Sura {surahName}",
        finalScore: "Puntuación Final",
        teacherFeedback: "Comentarios del Profesor de IA",
        originalTextTitle: "Texto Original Recitado",
        back: "Atrás",
        noDataError: "No se encontraron datos de recitación. Por favor, intenta grabar de nuevo.",
        unknownError: "Ocurrió un error desconocido durante el análisis.",
    },
    id: {
        title: "Analisis Bacaan",
        loadingTitle: "Tadber Quran",
        loadingDescription: "Menganalisis bacaan Anda, ini mungkin memakan waktu sejenak...",
        errorTitle: "Analisis Gagal",
        retry: "Coba Lagi",
        reportTitle: "Laporan Analisis Bacaan",
        reportDescription: "Berdasarkan bacaan Anda dari Surah {surahName}",
        finalScore: "Skor Akhir",
        teacherFeedback: "Umpan Balik Guru AI",
        originalTextTitle: "Teks Asli yang Dibacakan",
        back: "Kembali",
        noDataError: "Data bacaan tidak ditemukan. Silakan coba merekam lagi.",
        unknownError: "Terjadi kesalahan yang tidak diketahui saat analisis.",
    },
    ru: {
        title: "Анализ Чтения",
        loadingTitle: "Tadber Quran",
        loadingDescription: "Анализ вашего чтения, это может занять некоторое время...",
        errorTitle: "Анализ не удался",
        retry: "Повторить",
        reportTitle: "Отчет по Анализу Чтения",
        reportDescription: "На основе вашего чтения Суры {surahName}",
        finalScore: "Итоговый балл",
        teacherFeedback: "Отзыв от ИИ-учителя",
        originalTextTitle: "Оригинальный Текст",
        back: "Назад",
        noDataError: "Данные о чтении не найдены. Пожалуйста, попробуйте записать снова.",
        unknownError: "Во время анализа произошла неизвестная ошибка.",
    },
    ur: {
        title: "تلاوت کا تجزیہ",
        loadingTitle: "Tadber Quran",
        loadingDescription: "آپ کی تلاوت کا تجزیہ کیا جا رہا ہے، اس میں کچھ وقت لگ سکتا ہے۔۔۔",
        errorTitle: "تجزیہ ناکام",
        retry: "دوبارہ کوشش کریں",
        reportTitle: "تلاوت کے تجزیہ کی رپورٹ",
        reportDescription: "سورہ {surahName} کی آپ کی تلاوت کی بنیاد پر",
        finalScore: "حتمی سکور",
        teacherFeedback: "اے آئی استاد کے تاثرات",
        originalTextTitle: "اصل متن جو تلاوت کیا گیا",
        back: "واپس",
        noDataError: "تلاوت کا ڈیٹا نہیں ملا۔ براہ کرم دوبارہ ریکارڈ کرنے کی کوشش کریں۔",
        unknownError: "تجزیہ کے دوران ایک نامعلوم خرابی واقع ہوئی۔",
    }
};

export default function AnalysisPage() {
  const router = useRouter();
  const { settings } = useQuranSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeRecitationOutput | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [surahName, setSurahName] = useState('');

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    // Fallback to 'ar' if the selected language isn't in our translation dictionary
    return translations[langCode] ? langCode : 'ar';
  }, [settings.translationId]);
  
  const t = useMemo(() => translations[lang] || translations['ar'], [lang]);
  const isRtl = lang === 'ar' || lang === 'ur';

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const storedData = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!storedData) {
      setError(t.noDataError);
      setIsLoading(false);
      return;
    }

    try {
      const { audioDataUri, originalText, surahName } = JSON.parse(storedData);
      setOriginalText(originalText);
      setSurahName(surahName);

      const targetLanguage = translationOptions.find(opt => opt.id === lang)?.language || 'Arabic';
      const result = await getRecitationAnalysis({ audioDataUri, originalText, surahName, language: targetLanguage });
      setAnalysis(result);

      // IMPORTANT: Clean up storage only on success
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);

    } catch (e: any) {
      console.error('Analysis error:', e);
      // Do not remove item from storage on error, to allow for retry.
      setError(e.message || t.unknownError);
    } finally {
      setIsLoading(false);
    }
  }, [t, lang]);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
            <h1 className="text-3xl font-headline font-bold text-primary animate-pulse">
              Tadber Quran
            </h1>
            <p className="text-muted-foreground">{t.loadingDescription}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center" dir={isRtl ? "rtl" : "ltr"}>
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t.errorTitle}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={performAnalysis} className="mt-4">
                <RefreshCw className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                {t.retry}
            </Button>
        </div>
      );
    }

    if (analysis) {
      return (
        <div dir={isRtl ? 'rtl' : 'ltr'}>
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
              <CardHeader className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">{t.reportTitle}</CardTitle>
                    <CardDescription>{t.reportDescription.replace('{surahName}', surahName)}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 w-full sm:w-auto justify-center">
                    <div className="text-right">
                        <p className="text-sm font-medium text-primary">{t.finalScore}</p>
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
                          {t.teacherFeedback}
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
                          {analysis.feedback}
                      </p>
                  </div>
      
                  <div className="bg-transparent">
                      <h3 className="text-base font-semibold flex items-center gap-3 mb-4 text-primary">
                          <BookText className="h-5 w-5 text-primary" />
                          {t.originalTextTitle}
                      </h3>
                      <div className="p-4" dir="rtl">
                        <p
                          className="font-arabic leading-loose text-justify text-foreground"
                          style={{ fontSize: `${settings.fontSize * 0.8}px`, lineHeight: `${settings.fontSize * 1.6}px` }}
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
        <header className="flex items-center justify-between mb-8" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="w-10 h-10"></div>
          <h1 className="text-2xl font-bold text-center flex-grow">{t.title}</h1>
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.back()}>
              <ChevronLeft className={isRtl ? 'h-6 w-6 rotate-180' : 'h-6 w-6'} />
              <span className="sr-only">{t.back}</span>
          </Button>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
