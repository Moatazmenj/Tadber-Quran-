import { surahs, juzs } from '@/lib/quran';
import { SurahList } from '@/components/SurahList';

export default function Home() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl md:text-5xl font-headline text-primary mb-2 text-center">
        Al-Quran Explorer
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-8">
        Browse, read, and reflect upon the Holy Quran.
      </p>
      <SurahList surahs={surahs} juzs={juzs} />
    </div>
  );
}
