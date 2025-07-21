
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { translationOptions } from '@/lib/translations';
import { QuotaBanner } from '@/components/QuotaBanner';
import { toastTranslations } from '@/lib/toast-translations';

const translations: Record<string, Record<string, string>> = {
    en: {
        title: "Spiritual Clinic",
        subtitle: "Let the Quran be your doctor.",
        placeholder: "Describe how you feel... e.g., I feel anxious, sad, lost...",
        button: "Find My Spiritual Remedy",
        loading: "Preparing your spiritual remedy...",
        errorTitle: "An error occurred",
        retry: "Try Again",
        remedyTitle: "Your Spiritual Remedy",
        versesTitle: "Verses of Serenity",
        tafsirTitle: "Gentle Interpretation",
        duaTitle: "Prophetic Dua",
        recitationTitle: "Listening Recommendation",
        recitationText: "We recommend listening to {surahName} by reciter {reciterName} for your heart's comfort.",
        newRemedy: "Find Another Remedy",
        share: "Share Remedy",
        shareTitle: "Spiritual Remedy - Tadber Quran",
        shareVerses: "Verses of Serenity",
        shareTafsir: "Gentle Interpretation",
        shareDua: "Prophetic Dua",
        shareRecitation: "Listening Recommendation",
        shareApp: "Tadber Quran App"
    },
    fr: {
        title: "Clinique Spirituelle",
        subtitle: "Laissez le Coran être votre médecin.",
        placeholder: "Décrivez ce que vous ressentez... ex: je me sens anxieux, triste, perdu...",
        button: "Trouver Mon Remède Spirituel",
        loading: "Préparation de votre remède spirituel...",
        errorTitle: "Une erreur est survenue",
        retry: "Réessayer",
        remedyTitle: "Votre Remède Spirituel",
        versesTitle: "Versets de Sérénité",
        tafsirTitle: "Interprétation Douce",
        duaTitle: "Dua Prophétique",
        recitationTitle: "Recommandation d'Écoute",
        recitationText: "Nous vous recommandons d'écouter {surahName} par le récitateur {reciterName} pour apaiser votre cœur.",
        newRemedy: "Trouver un autre remède",
        share: "Partager le Remède",
        shareTitle: "Remède Spirituel - Tadber Quran",
        shareVerses: "Versets de Sérénité",
        shareTafsir: "Interprétation Douce",
        shareDua: "Dua Prophétique",
        shareRecitation: "Recommandation d'Écoute",
        shareApp: "Application Tadber Quran"
    },
    ar: {
        title: "العيادة الروحية",
        subtitle: "هنا تجد السكينة لقلبك والشفاء لروحك.",
        placeholder: "صف شعورك هنا... مثلاً: أشعر بالقلق، بالحزن، بالضياع...",
        button: "ابحث عن وصفتي الإيمانية",
        loading: "...جاري تحضير وصفتك الإيمانية",
        errorTitle: "حدث خطأ",
        retry: "حاول مرة أخرى",
        remedyTitle: "وصفتك الإيمانية",
        versesTitle: "آيات السكينة",
        tafsirTitle: "تفسير ميسّر",
        duaTitle: "دعاء نبوي",
        recitationTitle: "توصية استماع",
        recitationText: "ننصحك بالاستماع إلى {surahName} بصوت القارئ {reciterName} لراحة قلبك.",
        newRemedy: "البحث عن وصفة أخرى",
        share: "مشاركة الوصفة",
        shareTitle: "وصفة إيمانية - تدبر القرآن",
        shareVerses: "آيات السكينة",
        shareTafsir: "تفسير ميسّر",
        shareDua: "دعاء نبوي",
        shareRecitation: "توصية استماع",
        shareApp: "تطبيق تدبر القرآن"
    },
     es: {
        title: "Clínica Espiritual",
        subtitle: "Deja que el Corán sea tu médico.",
        placeholder: "Describe cómo te sientes... ej: me siento ansioso, triste, perdido...",
        button: "Encontrar Mi Remedio Espiritual",
        loading: "Preparando tu remedio espiritual...",
        errorTitle: "Ocurrió un error",
        retry: "Intentar de nuevo",
        remedyTitle: "Tu Remedio Espiritual",
        versesTitle: "Versos de Serenidad",
        tafsirTitle: "Interpretación Suave",
        duaTitle: "Dua Profética",
        recitationTitle: "Recomendación de Escucha",
        recitationText: "Te recomendamos escuchar {surahName} por el recitador {reciterName} para el consuelo de tu corazón.",
        newRemedy: "Buscar Otro Remedio",
        share: "Compartir Remedio",
        shareTitle: "Remedio Espiritual - Tadber Quran",
        shareVerses: "Versos de Serenidad",
        shareTafsir: "Interpretación Suave",
        shareDua: "Dua Profética",
        shareRecitation: "Recomendación de Escucha",
        shareApp: "Aplicación Tadber Quran"
    },
    id: {
        title: "Klinik Spiritual",
        subtitle: "Biarkan Al-Qur'an menjadi dokter Anda.",
        placeholder: "Jelaskan perasaan Anda... misal: Saya merasa cemas, sedih, tersesat...",
        button: "Temukan Obat Spiritual Saya",
        loading: "Menyiapkan obat spiritual Anda...",
        errorTitle: "Terjadi kesalahan",
        retry: "Coba Lagi",
        remedyTitle: "Obat Spiritual Anda",
        versesTitle: "Ayat-ayat Ketenangan",
        tafsirTitle: "Tafsir Lembut",
        duaTitle: "Doa Kenabian",
        recitationTitle: "Rekomendasi Mendengarkan",
        recitationText: "Kami merekomendasikan mendengarkan {surahName} oleh qari {reciterName} untuk ketenangan hati Anda.",
        newRemedy: "Cari Obat Lain",
        share: "Bagikan Obat",
        shareTitle: "Obat Spiritual - Tadber Quran",
        shareVerses: "Ayat-ayat Ketenangan",
        shareTafsir: "Tafsir Lembut",
        shareDua: "Doa Kenabian",
        shareRecitation: "Rekomendasi Mendengarkan",
        shareApp: "Aplikasi Tadber Quran"
    },
    ru: {
        title: "Духовная Клиника",
        subtitle: "Пусть Коран будет вашим врачом.",
        placeholder: "Опишите, что вы чувствуете... например: я чувствую тревогу, грусть, растерянность...",
        button: "Найти Мое Духовное Лекарство",
        loading: "Подготовка вашего духовного лекарства...",
        errorTitle: "Произошла ошибка",
        retry: "Попробовать снова",
        remedyTitle: "Ваше Духовное Лекарство",
        versesTitle: "Аяты Спокойствия",
        tafsirTitle: "Мягкое Толкование",
        duaTitle: "Пророческое Дуа",
        recitationTitle: "Рекомендация к Прослушиванию",
        recitationText: "Мы рекомендуем слушать {surahName} в исполнении чтеца {reciterName} для успокоения вашего сердца.",
        newRemedy: "Найти Другое Лекарство",
        share: "Поделиться Лекарством",
        shareTitle: "Духовное Лекарство - Tadber Quran",
        shareVerses: "Аяты Спокойствия",
        shareTafsir: "Мягкое Толкование",
        shareDua: "Пророческое Дуа",
        shareRecitation: "Рекомендация к Прослушиванию",
        shareApp: "Приложение Tadber Quran"
    },
    ur: {
        title: "روحانی کلینک",
        subtitle: "قرآن کو اپنا معالج بننے دیں۔",
        placeholder: "بیان کریں کہ آپ کیسا محسوس کر رہے ہیں... مثال کے طور پر: میں پریشان، اداس، کھویا ہوا محسوس کر رہا ہوں...",
        button: "میرا روحانی علاج تلاش کریں",
        loading: "آپ کا روحانی علاج تیار کیا جا رہا ہے...",
        errorTitle: "ایک خامی پیش آگئی",
        retry: "دوبارہ کوشش کریں",
        remedyTitle: "آپ کا روحانی علاج",
        versesTitle: "آیاتِ سکون",
        tafsirTitle: "نرم تفسیر",
        duaTitle: "مسنون دعا",
        recitationTitle: "سننے کی تجویز",
        recitationText: "ہم آپ کو قاری {reciterName} کی آواز میں {surahName} سننے کی تجویز کرتے ہیں تاکہ آپ کے دل کو سکون ملے۔",
        newRemedy: "دوسرا علاج تلاش کریں",
        share: "علاج شیئر کریں",
        shareTitle: "روحانی علاج - تدبر قرآن",
        shareVerses: "آیاتِ سکون",
        shareTafsir: "نرم تفسیر",
        shareDua: "مسنون دعا",
        shareRecitation: "سننے کی تجویز",
        shareApp: "تدبر قرآن ایپ"
    }
};

export default function SpiritualClinicPage() {
  const searchParams = useSearchParams();
  const initialFeeling = searchParams.get('feeling');
  const { toast } = useToast();
  const { settings } = useQuranSettings();

  const [feeling, setFeeling] = useState(initialFeeling || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remedy, setRemedy] = useState<SpiritualRemedyOutput | null>(null);

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return translations[langCode] ? langCode : 'ar';
  }, [settings.translationId]);

  const t = useMemo(() => translations[lang] || translations['ar'], [lang]);
  const isRtl = lang === 'ar' || lang === 'ur';

  const tToast = useMemo(() => toastTranslations[lang] || toastTranslations['en'], [lang]);

  const fetchRemedy = useCallback(async (currentFeeling: string) => {
    if (!currentFeeling.trim()) return;

    setIsLoading(true);
    setError(null);
    setRemedy(null);

    try {
      const targetLanguage = translationOptions.find(opt => opt.id === lang)?.language || 'Arabic';
      const result = await getSpiritualRemedy({ feeling: currentFeeling, language: targetLanguage });
      setRemedy(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

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
    window.history.replaceState(null, '', '/spiritual-clinic');
  };

  const handleShare = async () => {
    if (!remedy) return;

    const versesText = remedy.verses
      .map(v => `${v.text} (${isRtl ? toArabicNumerals(v.verse_key) : v.verse_key})`)
      .join('\n');

    const shareText = `${t.shareTitle}:\n\n📖 *${t.shareVerses}:*\n${versesText}\n\n📜 *${t.shareTafsir}:*\n${remedy.tafsir}\n\n🤲 *${t.shareDua}:*\n${remedy.dua}\n\n🎧 *${t.shareRecitation}:*\n${remedy.recitationSuggestion.surahName} - ${remedy.recitationSuggestion.reciterName}\n\n${t.shareApp}`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: t.shareTitle,
                text: shareText,
            });
        } else {
            await navigator.clipboard.writeText(shareText);
            toast({
                title: tToast.shareSuccess,
                description: tToast.shareSuccessDescription,
            });
        }
    } catch (err) {
        console.error('Share failed:', err);
        toast({
            variant: 'destructive',
            title: tToast.shareFailed,
            description: tToast.shareFailedDescription,
        });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 gap-4 min-h-[300px]">
          <h1 className="text-3xl font-headline font-bold text-primary animate-pulse">
            Tadber Quran
          </h1>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      );
    }
    
    if (error) {
        if (error.includes('exceeded the daily limit')) {
            return <QuotaBanner onRetry={() => fetchRemedy(feeling)} isRtl={isRtl} />;
        }
        return (
            <div className="text-center p-4 min-h-[300px]" dir={isRtl ? "rtl" : "ltr"}>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t.errorTitle}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={handleReset} className="mt-4">
                    <RefreshCw className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    {t.retry}
                </Button>
            </div>
        )
    }

    if (remedy) {
      return (
        <div dir={isRtl ? "rtl" : "ltr"} className="p-2 space-y-8">
            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <BookOpen className="h-6 w-6"/>
                    {t.versesTitle}
                </h3>
                <div className="space-y-4 text-right">
                    {remedy.verses.map(v => (
                         <p key={v.verse_key} className="font-arabic leading-loose text-foreground" style={{fontSize: '20px'}}>
                            {v.text} <span className="text-sm text-primary font-sans">({toArabicNumerals(v.verse_key)})</span>
                        </p>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <ScrollText className="h-6 w-6"/>
                    {t.tafsirTitle}
                </h3>
                <p className="leading-relaxed text-foreground" style={{fontSize: '20px'}}>{remedy.tafsir}</p>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <HeartPulse className="h-6 w-6"/>
                    {t.duaTitle}
                </h3>
                <p className="leading-loose font-medium text-foreground" style={{fontSize: '20px'}}>{remedy.dua}</p>
            </div>

            <div>
                <h3 className="flex items-center gap-3 text-primary text-xl font-bold mb-4">
                    <Headphones className="h-6 w-6"/>
                    {t.recitationTitle}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-foreground" style={{fontSize: '20px'}}>
                        {t.recitationText
                            .replace('{surahName}', remedy.recitationSuggestion.surahName)
                            .replace('{reciterName}', remedy.recitationSuggestion.reciterName)}
                    </p>
                    <Link href={`/surah/${remedy.recitationSuggestion.surahId}?autoplay=true&reciter=${remedy.recitationSuggestion.reciterId}`} passHref>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                            <Image src="https://i.postimg.cc/bwjXgmZX/ecoute-du-lecteur-audio.png" alt="Play" width={24} height={24} />
                            <span className="sr-only">Play</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="text-center pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={handleReset} className="w-full sm:w-auto">
                    <RefreshCw className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    {t.newRemedy}
                </Button>
                <Button onClick={handleShare} variant="outline" className="w-full sm:w-auto">
                    <Share2 className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    {t.share}
                </Button>
            </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} dir={isRtl ? "rtl" : "ltr"}>
        <div className="my-6">
          <label htmlFor="feeling" className="text-lg font-medium mb-3 block">{t.subtitle}</label>
          <Textarea
            id="feeling"
            placeholder={t.placeholder}
            rows={4}
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            className="text-base"
          />
        </div>
        <Button type="submit" className="w-full" disabled={!feeling.trim()}>
          {t.button}
        </Button>
      </form>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-2xl" dir={isRtl ? "rtl" : "ltr"}>
      <header className="flex items-center mb-8 relative">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className={!isRtl ? "" : "rotate-180"} />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="w-full text-center">
            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Image src="https://i.postimg.cc/T3mTt8kc/ai.png" alt="AI Icon" width={24} height={24} />
                {t.title}
            </h1>
            <p className="text-muted-foreground mt-1">{isRtl ? "هنا تجد السكينة لقلبك والشفاء لروحك." : "Here you find serenity for your heart and healing for your soul."}</p>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
