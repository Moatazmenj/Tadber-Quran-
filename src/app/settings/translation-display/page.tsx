'use client';

import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import { surahs } from '@/lib/quran';
import type { Ayah } from '@/types';
import { useQuranSettings } from '@/hooks/use-quran-settings';

const OptionItem = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between py-4 cursor-pointer px-4 hover:bg-card/80 transition-colors">
    <p className="text-lg text-foreground">{label}</p>
    {selected && <Check className="h-5 w-5 text-primary" />}
  </div>
);

export default function TranslationDisplayPage() {
  const { settings, setSetting } = useQuranSettings();
  const surahInfo = surahs.find(s => s.id === 1);
  const verses: Ayah[] = getLocalVersesForSurah(1) || [];

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/settings" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">Translation Display</h1>
      </header>
      
      <main>
        <h3 className="text-base font-medium text-muted-foreground mt-8 mb-2 px-4">
          Translation Display
        </h3>
        <div className="bg-card rounded-lg mb-8">
            <OptionItem 
                label="Arabic & Translation"
                selected={settings.showTranslation}
                onClick={() => setSetting('showTranslation', true)}
            />
            <Separator className="bg-border/20 mx-4" />
            <OptionItem 
                label="Without translation"
                selected={!settings.showTranslation}
                onClick={() => setSetting('showTranslation', false)}
            />
        </div>

        <h3 className="text-base font-medium text-muted-foreground mt-8 mb-2 px-4">
          Preview
        </h3>
        <Card className="bg-card/50">
            <CardContent className="p-6">
                <div className="text-center mb-8 border-b-2 border-primary pb-4">
                    <h2 className="font-arabic text-3xl font-bold text-foreground">{surahInfo?.arabicName}</h2>
                </div>
                
                <div className="space-y-6">
                    {verses.map((ayah, index) => {
                        const verseNumber = Number(ayah.verse_key.split(':')[1]).toLocaleString('ar-EG');
                        const verseEndSymbol = `\u06dd${verseNumber}`;

                        return (
                            <div key={ayah.id} className={`${index < verses.length -1 ? 'border-b border-border/20' : ''} pb-6 last:pb-0`}>
                                <p 
                                  dir="rtl" 
                                  className="font-arabic leading-loose text-foreground mb-3 text-center"
                                  style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                                >
                                    {ayah.text_uthmani}
                                    <span 
                                      className="text-primary font-sans font-normal mx-1"
                                      style={{ fontSize: `${settings.fontSize * 0.8}px` }}
                                    >
                                        {verseEndSymbol}
                                    </span>
                                </p>
                                {settings.showTranslation && (
                                <div className="text-muted-foreground text-base leading-relaxed text-center">
                                    <p>{ayah.translation}</p>
                                </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
