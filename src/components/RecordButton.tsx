'use client';

import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function RecordButton() {
  const pathname = usePathname();
  const isSurahPage = pathname.startsWith('/surah/');

  const handleRecord = () => {
    alert('ميزة التسجيل لم تُنفذ بعد. ماذا تريد أن يفعل هذا الزر؟ على سبيل المثال، يمكنني جعله يسجل تلاوتك.');
  };

  return (
    <div className={cn(
      "fixed right-4 z-50",
      isSurahPage ? "bottom-28" : "bottom-4"
    )}>
      <Button
        variant="destructive"
        className="rounded-full w-14 h-14 shadow-lg"
        onClick={handleRecord}
        aria-label="Record"
      >
        <Mic className="h-6 w-6" />
      </Button>
    </div>
  );
}
