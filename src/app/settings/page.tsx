
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { themes } from '@/lib/themes';
import { translationOptions } from '@/lib/translations';

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "Quran Settings",
    inUse: "In Use",
    use: "Use",
    bookmarks: "Bookmarked Verses",
    display: "Display",
    translationDisplay: "Translation Display",
    translationDisplayValue: "Arabic & Translation",
    content: "Content",
    fontAndSize: "Font & Size",
    translation: "Translation",
  },
  ar: {
    title: "إعدادات القرآن",
    inUse: "مستخدم",
    use: "استخدام",
    bookmarks: "الآيات المحفوظة",
    display: "العرض",
    translationDisplay: "عرض الترجمة",
    translationDisplayValue: "العربية والترجمة",
    content: "المحتوى",
    fontAndSize: "الخط والحجم",
    translation: "الترجمة",
  },
  fr: {
    title: "Paramètres du Coran",
    inUse: "Utilisé",
    use: "Utiliser",
    bookmarks: "Versets favoris",
    display: "Affichage",
    translationDisplay: "Affichage de la traduction",
    translationDisplayValue: "Arabe et traduction",
    content: "Contenu",
    fontAndSize: "Police et taille",
    translation: "Traduction",
  },
  es: {
    title: "Configuración del Corán",
    inUse: "En uso",
    use: "Usar",
    bookmarks: "Versos guardados",
    display: "Pantalla",
    translationDisplay: "Visualización de la traducción",
    translationDisplayValue: "Árabe y traducción",
    content: "Contenido",
    fontAndSize: "Fuente y tamaño",
    translation: "Traducción",
  },
  id: {
    title: "Pengaturan Quran",
    inUse: "Digunakan",
    use: "Gunakan",
    bookmarks: "Ayat yang ditandai",
    display: "Tampilan",
    translationDisplay: "Tampilan Terjemahan",
    translationDisplayValue: "Arab & Terjemahan",
    content: "Konten",
    fontAndSize: "Font & Ukuran",
    translation: "Terjemahan",
  },
  ru: {
    title: "Настройки Корана",
    inUse: "Используется",
    use: "Использовать",
    bookmarks: "Закладки",
    display: "Отображение",
    translationDisplay: "Отображение перевода",
    translationDisplayValue: "Арабский и перевод",
    content: "Содержание",
    fontAndSize: "Шрифт и размер",
    translation: "Перевод",
  },
  ur: {
    title: "قرآن کی ترتیبات",
    inUse: "زیر استعمال",
    use: "استعمال کریں",
    bookmarks: "بک مارک شدہ آیات",
    display: "ڈسپلے",
    translationDisplay: "ترجمہ ڈسپلے",
    translationDisplayValue: "عربی اور ترجمہ",
    content: "مواد",
    fontAndSize: "فونٹ اور سائز",
    translation: "ترجمہ",
  },
};

const SettingsListItem = ({ label, value, href = '#' }: { label: string; value?: string; href?: string }) => (
    <Link href={href} className="block">
      <div className="flex items-center justify-between py-4 cursor-pointer px-4">
        <p className="text-lg text-foreground">{label}</p>
        <div className="flex items-center gap-4 text-muted-foreground">
          {value && <p className="text-base">{value}</p>}
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
);
  
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-medium text-muted-foreground mt-8 mb-2 px-4">
        {children}
    </h3>
);

export default function SettingsPage() {
  const { settings, setSetting } = useQuranSettings();

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return translations[langCode] ? langCode : 'en';
  }, [settings.translationId]);

  const t = useMemo(() => translations[lang] || translations['en'], [lang]);
  const isRtl = lang === 'ar' || lang === 'ur';

  const selectedTranslationName = useMemo(() => {
    return translationOptions.find(opt => opt.id === settings.translationId)?.nativeName || 'English';
  }, [settings.translationId]);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="flex items-center mb-8 relative">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className={isRtl ? 'rotate-180' : ''} />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">{t.title}</h1>
      </header>
      
      <main>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {themes.map((theme) => {
            const isActive = settings.theme === theme.id;
            return (
              <Card key={theme.id} className={`aspect-[3/4] flex flex-col justify-end p-3 bg-card overflow-hidden ${isActive ? 'border-primary' : ''}`}>
                  <div className="flex-grow rounded relative">
                    <Image
                      src={theme.previewImage}
                      alt={`${theme.name} preview`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    className="w-full mt-3"
                    variant={isActive ? 'secondary' : 'default'}
                    disabled={isActive}
                    onClick={() => setSetting('theme', theme.id)}
                  >
                    {isActive ? t.inUse : t.use}
                  </Button>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col">
            <Link href="/settings/bookmarks" className="block bg-card rounded-lg mb-4 p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <Bookmark className="h-6 w-6 text-primary" />
                <p className="text-lg text-foreground">{t.bookmarks}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <SectionTitle>{t.display}</SectionTitle>
            <div className="bg-card rounded-lg">
                <SettingsListItem label={t.translationDisplay} value={t.translationDisplayValue} href="/settings/translation-display" />
            </div>
            
            <SectionTitle>{t.content}</SectionTitle>
            <div className="bg-card rounded-lg">
                <SettingsListItem label={t.fontAndSize} href="/settings/font-size" />
                <Separator className="bg-border/20 mx-4" />
                <SettingsListItem label={t.translation} value={selectedTranslationName} href="/settings/translation" />
            </div>
        </div>
      </main>
    </div>
  );
}
