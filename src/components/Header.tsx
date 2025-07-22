"use client";

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80 transition-colors">
            <h1 className="text-2xl font-headline font-bold">
              Tadber
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground" size="icon">
              <Link href="/search">
                <Search className="w-6 h-6" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground" size="icon">
              <Link href="/settings">
                <Image src="https://i.postimg.cc/fLkmKd12/bouton-de-reglage-de-la-roue-dentee.png" alt="Settings" width={20} height={20} className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
