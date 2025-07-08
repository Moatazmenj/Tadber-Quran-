'use client';

import Link from 'next/link';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function RecordButton() {
  const pathname = usePathname();
  const isSurahPage = pathname.startsWith('/surah/');

  return (
    <Link
      href="/record"
      passHref
      className={cn(
        "fixed right-4 z-50",
        isSurahPage ? "bottom-28" : "bottom-4"
      )}
    >
      <Button
        variant="destructive"
        className="rounded-full w-14 h-14 shadow-lg"
        aria-label="Record"
      >
        <Mic className="h-6 w-6" />
      </Button>
    </Link>
  );
}
