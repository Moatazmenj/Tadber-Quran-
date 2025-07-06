'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { translationOptions } from '@/lib/translations';
import type { TranslationOption } from '@/types';

const TranslationItem = ({ 
    option, 
    isSelected, 
    onClick 
}: { 
    option: TranslationOption; 
    isSelected: boolean; 
    onClick: () => void;
}) => (
  <div onClick={onClick} className="flex items-center justify-between py-3 cursor-pointer px-4 hover:bg-card/80 transition-colors">
    <div className="flex items-center gap-4">
        <span className="text-2xl">{option.flag}</span>
        <div>
            <p className="text-lg text-foreground">{option.nativeName}</p>
            <p className="text-sm text-muted-foreground">{option.translator}</p>
        </div>
    </div>
    {isSelected && <Check className="h-5 w-5 text-primary" />}
  </div>
);

export default function TranslationSettingsPage() {
  const { settings, setSetting } = useQuranSettings();

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/settings" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">Translation</h1>
      </header>
      
      <main>
        <div className="bg-card rounded-lg">
            {translationOptions.map((option, index) => {
                const isSelected = settings.translationId === option.id;
                return (
                    <React.Fragment key={option.id}>
                        <TranslationItem
                            option={option}
                            isSelected={isSelected}
                            onClick={() => setSetting('translationId', option.id)}
                        />
                        {index < translationOptions.length - 1 && <Separator className="bg-border/20 mx-4" />}
                    </React.Fragment>
                )
            })}
        </div>
      </main>
    </div>
  );
}
