'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Surah, Juz } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { cn } from '@/lib/utils';

interface SurahListProps {
  surahs: Surah[];
  juzs: { id: number; name: string }[];
}

export function SurahList({ surahs, juzs }: SurahListProps) {
  const [selectedJuz, setSelectedJuz] = useState('all');
  const { settings } = useQuranSettings();

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
            <SelectValue placeholder="Filter by Juz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Juz</SelectItem>
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
                    <div className="w-10 h-10 flex items-center justify-center bg-accent/20 text-accent-foreground rounded-full font-bold">
                        {surah.id}
                    </div>
                    <div>
                        <CardTitle className="font-headline text-lg">{surah.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{surah.revelationPlace}</p>
                    </div>
                </div>
                <p className={cn(
                  "text-xl text-primary",
                  settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : 'font-arabic'
                )}>{surah.arabicName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{surah.versesCount} verses</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
