
'use client';

import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Surah } from '@/types';
import { SoundWave } from './SoundWave';
import { cn } from '@/lib/utils';

interface AudioPlayerBarProps {
  surah: Surah;
  isPlaying: boolean;
  currentVerse: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  reciterName: string;
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
              <Button
                variant="translucent"
                size="icon"
                className="w-10 h-10"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close Player</span>
              </Button>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{`Surah ${surah.name}`}</p>
              <p className="text-xs text-primary-foreground/80">{`Verse ${currentVerse}`}</p>
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
