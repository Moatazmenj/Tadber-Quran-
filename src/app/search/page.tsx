'use client';

import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="relative mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-headline text-center mb-6 text-primary">Search the Quran</h1>
        <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Surah name, number, or keyword..."
              className="w-full pl-12 h-14 text-lg rounded-full"
              aria-label="Search"
            />
        </div>
      </div>
      {/* Search results will be displayed below */}
    </div>
  );
}
