import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic } from 'lucide-react';

export default function RecordPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">Record Recitation</h1>
      </header>
      <main className="flex flex-col items-center justify-center text-center space-y-8 mt-16">
        <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-destructive/10 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-destructive/20 rounded-full animate-ping delay-200"></div>
            <Button variant="destructive" className="rounded-full w-32 h-32 shadow-lg relative">
                <Mic className="h-16 w-16" />
            </Button>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
            Tap the microphone to start recording
        </h2>
        <p className="text-muted-foreground max-w-md">
            Your recitation will be saved for you to listen back to later. This feature is coming soon.
        </p>
      </main>
    </div>
  );
}
