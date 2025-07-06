"use client";

import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <BookMarked className="w-8 h-8" />
            <h1 className="text-2xl font-headline font-bold">
              Al-Quran Explorer
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
