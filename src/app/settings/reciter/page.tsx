'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { reciters } from '@/lib/reciters';
import type { Reciter } from '@/types';

const ReciterItem = ({ 
    reciter, 
    isSelected, 
    onClick 
}: { 
    reciter: Reciter; 
    isSelected: boolean; 
    onClick: () => void;
}) => (
  <div onClick={onClick} className="flex items-center justify-between py-4 cursor-pointer px-4 hover:bg-card/80 transition-colors">
    <div>
        <p className="text-lg text-foreground">{reciter.name}</p>
        {reciter.style && <p className="text-sm text-muted-foreground">{reciter.style}</p>}
    </div>
    {isSelected && <Check className="h-5 w-5 text-primary" />}
  </div>
);

export default function ReciterSettingsPage() {
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
        <h1 className="text-2xl font-bold w-full text-center">Reciter</h1>
      </header>
      
      <main>
        <div className="bg-card rounded-lg">
            {reciters.map((reciter, index) => {
                const isSelected = settings.reciterId === reciter.id;
                return (
                    <React.Fragment key={reciter.id}>
                        <ReciterItem
                            reciter={reciter}
                            isSelected={isSelected}
                            onClick={() => setSetting('reciterId', reciter.id)}
                        />
                        {index < reciters.length - 1 && <Separator className="bg-border/20 mx-4" />}
                    </React.Fragment>
                )
            })}
        </div>
      </main>
    </div>
  );
}
