
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const verses = [
    { surah: "Al-Baqarah", verse: "2:255", text: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ ...", translation: "Allah! There is no god but He, the Living, the Self-subsisting, Eternal..." },
    { surah: "Ar-Rahman", verse: "55:13", text: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "Then which of the favors of your Lord will you deny?" },
    { surah: "Ash-Sharh", verse: "94:5", text: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", translation: "For indeed, with hardship [will be] ease." },
    { surah: "Az-Zumar", verse: "39:53", text: "قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا", translation: "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah.'" },
    { surah: "Al-Asr", verse: "103:2", text: "إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ", translation: "Indeed, mankind is in loss." },
];

export function VerseOfTheDayDialog() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    // Initialize with a default verse to prevent mismatch during SSR
    const [selectedVerse, setSelectedVerse] = useState(verses[0]);

    useEffect(() => {
        // This code runs only on the client
        const randomIndex = Math.floor(Math.random() * verses.length);
        const randomVerse = verses[randomIndex];
        
        // This might not even be necessary if we always want a new verse
        if (randomVerse) {
          setSelectedVerse(randomVerse);
        }
        
        setIsOpen(true);
    }, []); // Empty dependency array ensures this runs on every mount

    const handleShare = async () => {
        if (!selectedVerse) return;
        const shareText = `Verse of the Day:\n\n"${selectedVerse.text}"\n\n- Quran (${selectedVerse.surah}, ${selectedVerse.verse})\n\n"${selectedVerse.translation}"`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Verse of the Day',
                    text: shareText,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(shareText).then(() => {
                toast({
                    title: "Copied to Clipboard",
                    description: "Share text has been copied. You can paste it to share.",
                });
            });
        }
        setIsOpen(false);
    };

    if (!selectedVerse) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[280px] rounded-xl" dir="rtl">
                <DialogHeader className="text-right pt-4">
                    <DialogDescription>
                        شارك هذه الآية لتكون صدقة جارية لك.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 text-center space-y-4 py-4">
                    <p className="font-arabic text-xl text-foreground leading-loose">
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
