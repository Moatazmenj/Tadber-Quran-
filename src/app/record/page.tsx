import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function RecordPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl flex flex-col h-full">
      <header className="flex items-center flex-shrink-0">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center">
      </main>
    </div>
  );
}
