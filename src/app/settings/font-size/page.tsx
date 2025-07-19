'use client';

import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import { surahs } from '@/lib/quran';
import type { Ayah } from '@/types';
import { useQuranSettings, type FontStyleOption } from '@/hooks/use-quran-settings';
import { cn, toArabicNumerals } from '@/lib/utils';
import { SurahNameDisplay } from '@/components/SurahNameDisplay';

const FontStyleItem = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between py-4 cursor-pointer px-4 hover:bg-card/80 transition-colors">
    <p className="text-lg text-foreground">{label}</p>
    {selected && <Check className="h-5 w-5 text-primary" />}
  </div>
);

export default function FontSizePage() {
  const { settings, setSetting } = useQuranSettings();
  
  const surahInfo = surahs.find(s => s.id === 1);
  if (!surahInfo) {
    return null; // Or some fallback UI
  }
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
        <h1 className="text-2xl font-bold w-full text-center">Font & Size</h1>
      </header>
      
      <main className="space-y-8">
        <div>
            <h3 className="text-base font-medium text-muted-foreground mb-4 px-4">
              Font Size
            </h3>
            <div className="bg-card rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <span className="text-lg">A</span>
                    <Slider
                        value={[settings.fontSize]}
                        min={18}
                        max={48}
                        step={2}
                        onValueChange={(value) => setSetting('fontSize', value[0])}
                    />
                    <span className="text-3xl">A</span>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-base font-medium text-muted-foreground mb-2 px-4">
              Font Style
            </h3>
            <div className="bg-card rounded-lg">
                <FontStyleItem 
                    label="Default font"
                    selected={settings.fontStyle === 'default'}
                    onClick={() => setSetting('fontStyle', 'default')}
                />
                <Separator className="bg-border/20 mx-4" />
                <FontStyleItem 
                    label="Uthmanic Hafs"
                    selected={settings.fontStyle === 'uthmanic'}
                    onClick={() => setSetting('fontStyle', 'uthmanic')}
                />
                <Separator className="bg-border/20 mx-4" />
                <FontStyleItem 
                    label="IndoPak"
                    selected={settings.fontStyle === 'indopak'}
                    onClick={() => setSetting('fontStyle', 'indopak')}
                />
            </div>
        </div>

        <div>
            <h3 className="text-base font-medium text-muted-foreground mb-2 px-4">
              Preview
            </h3>
            <Card className="bg-card/50">
                <CardContent className="p-6">
                    <SurahNameDisplay surahInfo={surahInfo} fontStyle={settings.fontStyle} />
                    
                    <div className="space-y-8">
                        {verses.map((ayah, index) => {
                            const verseNumber = toArabicNumerals(ayah.verse_key.split(':')[1]);
                            const verseEndSymbol = `\u06dd${verseNumber}`;

                            return (
                                <div key={ayah.id} className={`${index < verses.length -1 ? 'border-b border-border/20' : ''} pb-6 last:pb-0`}>
                                    <p 
                                      dir="rtl" 
                                      className={cn(
                                        "leading-loose text-foreground mb-3 text-center",
                                        settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : 'font-arabic',
                                        settings.fontStyle === 'uthmanic' && 'font-arabic-uthmanic'
                                      )}
                                      style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                                    >
                                        {ayah.text_uthmani}
                                        <span className="text-primary font-sans font-normal mx-1" style={{ fontSize: `${settings.fontSize * 0.8}px` }}>{verseEndSymbol}</span>
                                    </p>
                                    <div className="text-muted-foreground text-base leading-relaxed text-center">
                                        <p>{ayah.translation}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
