
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, Octagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { surahs } from '@/lib/quran';
import { getLocalVersesForSurah } from '@/lib/quran-verses';
import type { Ayah, Surah } from '@/types';
import { useQuranSettings } from '@/hooks/use-quran-settings';
import { cn, toArabicNumerals } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BOOKMARKS_KEY = 'quranBookmarks';

interface BookmarkedVerse extends Ayah {
  surah: Surah;
}

export default function BookmarksPage() {
  const { settings } = useQuranSettings();
  const [bookmarkedVerses, setBookmarkedVerses] = useState<BookmarkedVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarkedVerses = async () => {
      setIsLoading(true);
      const savedKeys = localStorage.getItem(BOOKMARKS_KEY);
      if (savedKeys) {
        const verseKeys: string[] = JSON.parse(savedKeys);
        const verses: BookmarkedVerse[] = [];

        // This is not efficient for a large number of bookmarks,
        // but it's acceptable for this app's scale.
        // A better approach would be to use a proper database or a more optimized local storage structure.
        for (const key of verseKeys) {
          const [surahIdStr, verseIdStr] = key.split(':');
          const surahId = parseInt(surahIdStr, 10);
          
          const surahInfo = surahs.find(s => s.id === surahId);
          if (!surahInfo) continue;
          
          let verseData: Omit<Ayah, 'translation'>[] | undefined = getLocalVersesForSurah(surahId);

          if (!verseData) {
            try {
              const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`);
              const data = await res.json();
              verseData = data.verses;
            } catch (e) {
              console.error("Failed to fetch verse data for bookmark", e);
              continue;
            }
          }

          const verse = verseData?.find(v => v.verse_key === key);
          if (verse) {
            verses.push({ ...verse, surah: surahInfo });
          }
        }
        setBookmarkedVerses(verses);
      }
      setIsLoading(false);
    };

    fetchBookmarkedVerses();
  }, []);

  const removeBookmark = (verseKey: string) => {
    const updatedVerses = bookmarkedVerses.filter(v => v.verse_key !== verseKey);
    const updatedKeys = updatedVerses.map(v => v.verse_key);
    
    setBookmarkedVerses(updatedVerses);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedKeys));
  };
  
  const clearAllBookmarks = () => {
    setBookmarkedVerses([]);
    localStorage.removeItem(BOOKMARKS_KEY);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl">
      <header className="flex items-center mb-8 relative">
        <Link href="/settings" passHref>
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold w-full text-center">Bookmarked Verses</h1>
      </header>

      {bookmarkedVerses.length > 0 && (
        <div className="flex justify-end mb-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete all your bookmarks. This cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAllBookmarks}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      )}

      <main>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-4 bg-muted-foreground/10 rounded w-1/4 mb-4"></div>
                        <div className="h-6 bg-muted-foreground/10 rounded w-full"></div>
                    </CardContent>
                </Card>
            ))}
          </div>
        ) : bookmarkedVerses.length > 0 ? (
          <div className="space-y-4">
            {bookmarkedVerses.map((verse) => (
              <Card key={verse.verse_key} className="bg-card/80">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                            <Link href={`/surah/${verse.surah.id}#verse-${verse.verse_key.split(':')[1]}`}>
                                <div className="flex items-center gap-2 text-primary mb-3 cursor-pointer hover:underline">
                                    <Octagon className="h-4 w-4" />
                                    <p className="font-semibold">{verse.surah.name}, Verse {verse.verse_key.split(':')[1]}</p>
                                </div>
                            </Link>
                            <p
                                dir="rtl"
                                className={cn(
                                    "leading-loose text-foreground",
                                    settings.fontStyle === 'indopak' ? 'font-arabic-indopak' : 'font-arabic'
                                )}
                                style={{ fontSize: `${settings.fontSize}px`, lineHeight: `${settings.fontSize * 1.8}px` }}
                            >
                                {verse.text_uthmani}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeBookmark(verse.verse_key)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                            <span className="sr-only">Remove bookmark</span>
                        </Button>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
            <p className="text-muted-foreground">
              You can bookmark verses from the Surah view to save them here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
