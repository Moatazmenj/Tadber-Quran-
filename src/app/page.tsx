import { surahs, juzs } from '@/lib/quran';
import { SurahList } from '@/components/SurahList';
import { Header } from '@/components/Header';
import { VerseOfTheDayDialog } from '@/components/VerseOfTheDayDialog';
import { SpiritualClinicDialog } from '@/components/SpiritualClinicDialog';

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <p className="text-center text-lg text-muted-foreground mb-8">
          Browse, read, and reflect upon the Holy Quran.
        </p>
        <SurahList surahs={surahs} juzs={juzs} />
      </div>
      <VerseOfTheDayDialog />
      <SpiritualClinicDialog />
    </>
  );
}
