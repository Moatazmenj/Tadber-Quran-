
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Surah, Juz } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { cn } from '@/lib/utils';
import { translationOptions } from '@/lib/translations';

interface SurahListProps {
  surahs: Surah[];
  juzs: { id: number; name: string }[];
}

const listTranslations: Record<string, Record<string, string>> = {
  en: {
    filterPlaceholder: "Filter by Juz",
    allJuz: "All Juz",
    verses: "verses",
  },
  ar: {
    filterPlaceholder: "تصفية حسب الجزء",
    allJuz: "كل الأجزاء",
    verses: "آيات",
  },
  fr: {
    filterPlaceholder: "Filtrer par Juz",
    allJuz: "Tous les Juz",
    verses: "versets",
  },
  es: {
    filterPlaceholder: "Filtrar por Juz",
    allJuz: "Todos los Juz",
    verses: "versos",
  },
  id: {
    filterPlaceholder: "Saring berdasarkan Juz",
    allJuz: "Semua Juz",
    verses: "ayat",
  },
  ru: {
    filterPlaceholder: "Фильтр по джузу",
    allJuz: "Все джузы",
    verses: "стихов",
  },
  ur: {
    filterPlaceholder: "جزء کے لحاظ سے فلٹر کریں۔",
    allJuz: "تمام اجزاء",
    verses: "آیات",
  },
};


export function SurahList({ surahs, juzs }: SurahListProps) {
  const [selectedJuz, setSelectedJuz] = useState('all');
  const { settings } = useQuranSettings();

  const lang = useMemo(() => {
    const langCode = settings.translationId;
    return listTranslations[langCode] ? langCode : 'en';
  }, [settings.translationId]);
  
  const t = useMemo(() => listTranslations[lang] || listTranslations['en'], [lang]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const matchesJuz =
        selectedJuz === 'all' || surah.juz.includes(parseInt(selectedJuz));
        
      return matchesJuz;
    });
  }, [surahs, selectedJuz]);

  return (
    <div>
      <div className="mb-8 flex justify-end">
        <Select value={selectedJuz} onValueChange={setSelectedJuz}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card">
            <SelectValue placeholder={t.filterPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allJuz}</SelectItem>
            {juzs.map((juz) => (
              <SelectItem key={juz.id} value={juz.id.toString()}>
                {juz.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSurahs.map((surah) => (
          <Link key={surah.id} href={`/surah/${surah.id}`} passHref>
            <Card className="h-full hover:shadow-lg hover:border-primary transition-all duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/20 text-primary rounded-full font-bold">
                        {surah.id}
                    </div>
                    <div>
                        <CardTitle className="font-headline text-lg">{surah.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {(surah.revelationPlaceTranslations as any)[lang] || surah.revelationPlace}
                        </p>
                    </div>
                </div>
                <p className={cn(
                  "text-xl text-primary",
                  settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : 'font-arabic',
                  settings.fontStyle === 'uthmanic' && 'font-arabic-uthmanic'
                )}>{surah.arabicName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{surah.versesCount} {t.verses}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
