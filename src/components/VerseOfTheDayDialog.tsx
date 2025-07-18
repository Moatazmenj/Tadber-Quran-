
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const verses = [
    { surah: "Al-Baqarah", verse: "2:255", text: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ ...", translation: "Allah! There is no god but He, the Living, the Self-subsisting, Eternal..." },
    { surah: "Ar-Rahman", verse: "55:13", text: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "Then which of the favors of your Lord will you deny?" },
    { surah: "Ash-Sharh", verse: "94:5", text: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", translation: "For indeed, with hardship [will be] ease." },
    { surah: "Az-Zumar", verse: "39:53", text: "قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا", translation: "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah.'" },
    { surah: "Al-Asr", verse: "103:2", text: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", translation: "Indeed, mankind is in loss." },
];

function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-only">
      {children}
    </div>
  );
}

export function VerseOfTheDayDialog() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState(verses[0]);

    useEffect(() => {
        const hasSeenDialogToday = sessionStorage.getItem('hasSeenVerseDialog');
        if (!hasSeenDialogToday) {
            const randomIndex = Math.floor(Math.random() * verses.length);
            const randomVerse = verses[randomIndex];
            
            if (randomVerse) {
              setSelectedVerse(randomVerse);
            }
            
            setIsOpen(true);
            sessionStorage.setItem('hasSeenVerseDialog', 'true');
        }
    }, []);

    const handleShare = async () => {
        if (!selectedVerse || !navigator.share) return;

        const fullShareText = `Verse of the Day:\n"${selectedVerse.text}"\n- Quran ${selectedVerse.surah}:${selectedVerse.verse.split(':')[1]}\n\n"${selectedVerse.translation}"`;

        try {
            await navigator.share({
                title: 'Verse of the Day',
                text: fullShareText,
            });
            setIsOpen(false);
        } catch (error) {
            // The user cancelled the share operation.
            // We can safely ignore this error.
            if ((error as DOMException).name === 'AbortError') {
                return;
            }
            console.error('Failed to share:', error);
            toast({
                variant: 'destructive',
                title: 'Share Failed',
                description: 'Could not share the verse. Please try again.'
            });
        }
    };

    if (!selectedVerse) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[250px] rounded-xl" dir="rtl">
                <DialogHeader className="text-right pt-4">
                    <VisuallyHidden>
                        <DialogTitle>رسالة اليوم</DialogTitle>
                    </VisuallyHidden>
                    <DialogDescription>
                        شارك هذه الآية لتكون صدقة جارية لك.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 text-center space-y-4 py-4">
                    <p className="font-arabic text-lg text-foreground leading-loose">
                        {selectedVerse.text}
                    </p>
                    <p className="text-muted-foreground italic text-sm">
                        "{selectedVerse.translation}"
                    </p>
                    <p className="text-xs text-primary font-semibold">
                        - سورة {selectedVerse.surah}، الآية {selectedVerse.verse.split(':')[1]} -
                    </p>
                </div>
                <DialogFooter className="sm:justify-start">
                    <div className="flex w-full gap-2">
                        <Button type="button" className="w-full" onClick={handleShare}>
                            <Share2 className="ml-2 h-4 w-4" />
                            مشاركة
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
