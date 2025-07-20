'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function RecordButton() {
  const pathname = usePathname();

  // Don't show the button on the record page itself, or the analysis page
  if (pathname.startsWith('/record')) {
    return null;
  }

  return (
    <div className={cn(
        "fixed bottom-6 right-6 z-50 record-button-container",
        "transition-transform duration-300 hover:scale-110"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80">
              <Link href="/record">
                <Mic className="h-8 w-8 text-primary-foreground" />
                <span className="sr-only">Practice Recitation</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Practice Recitation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
