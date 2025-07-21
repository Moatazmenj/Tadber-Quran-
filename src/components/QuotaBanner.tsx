
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface QuotaBannerProps {
  onRetry: () => void;
  isRtl?: boolean;
}

export function QuotaBanner({ onRetry, isRtl = false }: QuotaBannerProps) {
  const translations = {
    ar: {
      title: 'لقد وصلت إلى الحد الأقصى للاستخدام اليومي',
      description: 'لقد استنفدت الحصة المجانية لليوم. يُرجى المحاولة مرة أخرى غدًا إن شاء الله.',
      button: 'حاول مرة أخرى',
    },
    en: {
      title: 'You have reached the daily usage limit',
      description: 'You have exhausted the free quota for today. Please try again tomorrow, insha\'Allah.',
      button: 'Try Again',
    }
  };

  const t = isRtl ? translations.ar : translations.en;

  return (
    <div className="w-full max-w-lg mx-auto my-8 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Card className="bg-destructive/10 border-destructive/20 shadow-lg">
            <CardContent className="p-6 sm:p-8 space-y-4">
                <Image 
                    src="https://i.postimg.cc/T3mTt8kc/ai.png" 
                    alt="AI Icon" 
                    width={48} 
                    height={48} 
                    className="mx-auto" 
                />
                <h2 className="text-xl sm:text-2xl font-bold text-destructive-foreground/90">{t.title}</h2>
                <p className="text-destructive-foreground/70 sm:text-lg">
                    {t.description}
                </p>
                <div className="pt-4">
                    <Button onClick={onRetry} variant="destructive">
                        <RefreshCw className={isRtl ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                        {t.button}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
