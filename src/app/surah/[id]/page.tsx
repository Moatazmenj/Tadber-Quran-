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
  searchParams: {
    autoplay?: string;
    reciter?: string;
  };
}

async function getSurahData(id: number): Promise<{ surahInfo: Surah, verses: Ayah[], surahText: string }> {
  const surahInfo = surahs.find((s) => s.id === id);
  if (!surahInfo) {
    notFound();
  }

  const fetchVerses = async (): Promise<Ayah[]> => {
    const localVersesData = getLocalVersesForSurah(id);
    if (localVersesData) {
      return localVersesData.map(v => ({...v, translation: undefined}));
    }

    try {
        const versesResponse = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`);
        if (!versesResponse.ok) {
            throw new Error('Failed to fetch surah data');
        }
        const versesData = await versesResponse.json();
        return versesData.verses.map((verse: any) => ({ ...verse, translation: undefined }));
    } catch (e) {
        console.error('Failed to fetch verses', e);
        return [];
    }
  };

  try {
    const verses = await fetchVerses();

    const surahText = verses.map(v => v.text_uthmani).join(' ');
    
    return { surahInfo, verses, surahText };
  } catch (error) {
    console.error(error);
    return { 
        surahInfo, 
        verses: [], 
        surahText: '',
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

export default async function SurahPage({ params, searchParams }: SurahPageProps) {
  const id = parseInt(params.id, 10);
  if (isNaN(id) || id < 1 || id > 114) {
    notFound();
  }

  const { surahInfo, verses, surahText } = await getSurahData(id);

  const autoplay = searchParams.autoplay === 'true';
  const reciterId = searchParams.reciter ? parseInt(searchParams.reciter, 10) : undefined;


  return (
    <div className="flex flex-col min-h-screen">
      <SurahView 
        surahInfo={surahInfo} 
        verses={verses} 
        surahText={surahText}
        autoplay={autoplay}
        reciterId={reciterId}
      />
    </div>
  );
}

export async function generateStaticParams() {
    return surahs.map((surah) => ({
      id: surah.id.toString(),
    }));
}
