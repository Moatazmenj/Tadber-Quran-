
'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import type { Surah } from '@/types';
import { SoundWave } from './SoundWave';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AudioPlayerBarProps {
  surah: Surah;
  isPlaying: boolean;
  currentVerse: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  reciterName: string;
  reciterImage: string | null;
}

export function AudioPlayerBar({
  surah,
  isPlaying,
  currentVerse,
  onPlayPause,
  onNext,
  onPrev,
  onClose,
  reciterName,
  reciterImage,
}: AudioPlayerBarProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-2xl border-t border-white/10",
        "bg-gradient-to-br from-primary/80 to-primary/95 backdrop-blur-lg text-primary-foreground"
      )}>
        <SoundWave isRecording={isPlaying} />

        <div className="relative z-10 flex items-center justify-between p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
                <button onClick={onClose} className="relative group">
                    <Avatar className="w-10 h-10 border-2 border-white/20 group-hover:border-white/50 transition-colors">
                        <AvatarImage src={reciterImage || undefined} alt={reciterName} />
                        <AvatarFallback>{reciterName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Close Player</span>
                </button>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{`Surah ${surah.name}`}</p>
              <p className="text-xs text-primary-foreground/80 truncate">{`${reciterName} - Verse ${currentVerse}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="translucent" size="icon" onClick={onPrev} className="h-10 w-10" disabled={currentVerse <= 1}>
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            <Button variant="translucent" size="icon" className="w-12 h-12" onClick={onPlayPause}>
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
            <Button variant="translucent" size="icon" onClick={onNext} className="h-10 w-10" disabled={currentVerse >= surah.versesCount}>
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
