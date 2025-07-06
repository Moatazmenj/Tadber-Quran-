import { notFound } from 'next/navigation';
import { surahs } from '@/lib/quran';
import type { Ayah, Surah } from '@/types';
import { SurahView } from '@/components/SurahView';
import { getLocalVersesForSurah } from '@/lib/quran-verses';

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

  // The SurahView component will now handle fetching translations client-side
  // So we just need to provide the Uthmani text.
  // We can optimize by checking for local data first.

  const localVersesData = getLocalVersesForSurah(id);
  if (localVersesData) {
    const surahText = localVersesData.map(v => v.text_uthmani).join(' ');
    // Important: Reset translation when loading local data so it can be fetched fresh
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
    // Return empty verses and text on error to allow page to render with a message
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
    <div className="bg-muted flex-grow p-4 sm:p-6 md:p-8">
      <SurahView surahInfo={surahInfo} verses={verses} surahText={surahText} />
    </div>
  );
}

export async function generateStaticParams() {
    return surahs.map((surah) => ({
      id: surah.id.toString(),
    }));
}
