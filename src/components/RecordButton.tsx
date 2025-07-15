'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function RecordButton() {
  const pathname = usePathname();
  const isRecordPage = pathname === '/record';
  const isAnalysisPage = pathname.startsWith('/record/analysis');
  const isSearchPage = pathname === '/search';

  if (isRecordPage || isAnalysisPage || isSearchPage) {
    return null;
  }

  return (
    <Link
      href="/record"
      passHref
      className={cn("fixed right-4 bottom-4 z-50")}
    >
      <Button
        asChild
        variant="destructive"
        className="rounded-full w-14 h-14 shadow-lg p-0 flex items-center justify-center"
        aria-label="Record"
      >
        <span>
            <Image src="https://i.postimg.cc/ht9MRmDZ/microphone.png" alt="Record" width={28} height={28} className="w-7 h-7" />
        </span>
      </Button>
    </Link>
  );
}
