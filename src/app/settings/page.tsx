'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { themes } from '@/lib/themes';

const SettingsListItem = ({ label, value, href = '#' }: { label: string; value?: string; href?: string }) => (
    <Link href={href} className="block">
      <div className="flex items-center justify-between py-4 cursor-pointer px-4">
        <p className="text-lg text-foreground">{label}</p>
        <div className="flex items-center gap-4 text-muted-foreground">
          {value && <p className="text-base">{value}</p>}
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
);
  
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-base font-medium text-muted-foreground mt-8 mb-2 px-4">
        {children}
    </h3>
);

export default function SettingsPage() {
  const { settings, setSetting } = useQuranSettings();

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">Quran Settings</h1>
      </header>
      
      <main>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {themes.map((theme) => {
            const isActive = settings.theme === theme.id;
            return (
              <Card key={theme.id} className={`aspect-[3/4] flex flex-col justify-end p-3 bg-card overflow-hidden ${isActive ? 'border-primary' : ''}`}>
                  <div className="flex-grow rounded relative">
                    <Image
                      src={theme.previewImage}
                      alt={`${theme.name} preview`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    className="w-full mt-3"
                    variant={isActive ? 'secondary' : 'default'}
                    disabled={isActive}
                    onClick={() => setSetting('theme', theme.id)}
                  >
                    {isActive ? 'In Use' : 'Use'}
                  </Button>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col">
            <SectionTitle>Recitation Mode</SectionTitle>
            <div className="bg-card rounded-lg">
                <SettingsListItem label="Page" value="Turn by Page" />
                <Separator className="bg-border/20 mx-4" />
                <SettingsListItem label="Translation Display" value="Arabic & Translation" href="/settings/translation-display" />
            </div>
            
            <SectionTitle>Content</SectionTitle>
            <div className="bg-card rounded-lg">
                <SettingsListItem label="Font & Size" href="/settings/font-size" />
                <Separator className="bg-border/20 mx-4" />
                <SettingsListItem label="Translation" href="/settings/translation" />
            </div>

            <SectionTitle>Audio</SectionTitle>
             <div className="bg-card rounded-lg">
                <SettingsListItem label="Reciter" />
            </div>

            <SectionTitle>Settings</SectionTitle>
             <div className="bg-card rounded-lg">
                <SettingsListItem label="Settings" />
            </div>
        </div>
      </main>
    </div>
  );
}
