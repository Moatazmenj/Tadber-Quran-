import { notFound } from 'next/navigation';
import { surahs } from '@/lib/quran';
import type { Ayah, Surah } from '@/types';
import { SurahView } from '@/components/SurahView';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface SurahPageProps {
  params: {
    id: string;
  };
}

async function getSurahData(id: number): Promise<{ surahInfo: Surah, verses: Ayah[], surahText: string }> {
  const surahInfo = surahs.find((s) => s.id === id);
  if (!surahInfo) {
    notFound();
  }

  const localVersesData = getLocalVersesForSurah(id);
  if (localVersesData) {
    const surahText = localVersesData.map(v => v.text_uthmani).join(' ');
    const verses: Ayah[] = localVersesData.map(v => ({...v, translation: undefined}));
    return { surahInfo, verses, surahText };
  }

  try {
    const versesResponse = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`);
    
    if (!versesResponse.ok) {
        throw new Error('Failed to fetch surah data');
    }
    
    const versesData = await versesResponse.json();

    const verses: Ayah[] = versesData.verses.map((verse: any) => ({
      ...verse,
      translation: undefined
    }));

    const surahText = verses.map(v => v.text_uthmani).join(' ');
    
    return { surahInfo, verses, surahText };
  } catch (error) {
    console.error(error);
    return { 
        surahInfo, 
        verses: [], 
        surahText: '' 
    };
  }
}

export async function generateMetadata({ params }: SurahPageProps) {
  const id = parseInt(params.id, 10);
  const surahInfo = surahs.find((s) => s.id === id);
  
  if (!surahInfo) {
    return {
      title: 'Surah Not Found',
    };
  }

  return {
    title: `Surah ${surahInfo.name} - Tadber Quran`,
    description: `Read and listen to Surah ${surahInfo.name} (${surahInfo.arabicName}).`,
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 1 || id > 114) {
    notFound();
  }

  const { surahInfo, verses, surahText } = await getSurahData(id);

  return (
    <>
      <header className="sticky top-0 z-20 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent">
        <div className="container mx-auto grid grid-cols-3 items-center h-16 px-4">
          <div className="justify-self-start">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground">
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground text-center truncate">
            {surahInfo.name}
          </h1>
          <div className="justify-self-end text-sm text-primary-foreground/80">
            {surahInfo.versesCount} verses
          </div>
        </div>
      </header>
      <div className="surah-page-background flex-grow p-4 sm:p-6 md:p-8">
        <SurahView surahInfo={surahInfo} verses={verses} surahText={surahText} />
      </div>
    </>
  );
}

export async function generateStaticParams() {
    return surahs.map((surah) => ({
      id: surah.id.toString(),
    }));
}
