
'use client';

import { useMemo } from 'react';
import { surahs, juzs } from '@/lib/quran';
import { SurahList } from '@/components/SurahList';
import { Header } from '@/components/Header';
import { VerseOfTheDayDialog } from '@/components/VerseOfTheDayDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { SpiritualClinicDialog } from '@/components/SpiritualClinicDialog';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { translationOptions } from '@/lib/translations';

const pageTranslations: Record<string, Record<string, string>> = {
  en: {
    subtitle: "Browse, read, and reflect upon the Holy Quran.",
    clinicButton: "Go to the Spiritual Clinic",
  },
  ar: {
    subtitle: "تصفح واقرأ وتدبر القرآن الكريم.",
    clinicButton: "اذهب إلى العيادة الروحية",
  },
  fr: {
    subtitle: "Parcourez, lisez et méditez sur le Saint Coran.",
    clinicButton: "Aller à la Clinique Spirituelle",
  },
  es: {
    subtitle: "Navega, lee y reflexiona sobre el Sagrado Corán.",
    clinicButton: "Ir a la Clínica Espiritual",
  },
  id: {
    subtitle: "Jelajahi, baca, dan renungkan Al-Qur'an.",
    clinicButton: "Pergi ke Klinik Spiritual",
  },
  ru: {
    subtitle: "Просматривайте, читайте и размышляйте над Священным Кораном.",
    clinicButton: "Перейти в Духовную Клинику",
  },
  ur: {
    subtitle: "قرآن پاک کو براؤز کریں، پڑھیں اور اس پر غور کریں۔",
    clinicButton: "روحانی کلینک پر جائیں",
  },
};

export default function Home() {
  const { settings } = useQuranSettings();

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return pageTranslations[langCode] ? langCode : 'en';
  }, [settings.translationId]);
  
  const t = useMemo(() => pageTranslations[lang] || pageTranslations['en'], [lang]);

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <p className="text-center text-lg text-muted-foreground mb-4">
          {t.subtitle}
        </p>
        <div className="flex justify-center mb-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/spiritual-clinic">
                    {t.clinicButton}
                    <Image src="https://i.postimg.cc/T3mTt8kc/ai.png" alt="AI Icon" width={20} height={20} className="ml-2" />
                </Link>
            </Button>
        </div>
        <SurahList surahs={surahs} juzs={juzs} />
      </div>
      <VerseOfTheDayDialog />
      <SpiritualClinicDialog />
    </>
  );
}
