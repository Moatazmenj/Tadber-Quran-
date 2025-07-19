import { surahs, juzs } from '@/lib/quran';
import { SurahList } from '@/components/SurahList';
import { Header } from '@/components/Header';
import { VerseOfTheDayDialog } from '@/components/VerseOfTheDayDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <p className="text-center text-lg text-muted-foreground mb-4">
          Browse, read, and reflect upon the Holy Quran.
        </p>
        <div className="flex justify-center mb-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/spiritual-clinic">
                    <Sparkles className="mr-2 h-5 w-5" />
                    اذهب إلى العيادة الروحية
                </Link>
            </Button>
        </div>
        <SurahList surahs={surahs} juzs={juzs} />
      </div>
      <VerseOfTheDayDialog />
    </>
  );
}
