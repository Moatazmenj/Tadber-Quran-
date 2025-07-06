
'use client';

import { Play, Pause, SkipBack, SkipForward, Headphones } from 'lucide-react';
import { Button } from './ui/button';
import type { Surah } from '@/types';
import { Card } from './ui/card';

interface AudioPlayerBarProps {
  surah: Surah;
  isPlaying: boolean;
  currentVerse: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  reciterName: string;
}

export function AudioPlayerBar({
  surah,
  isPlaying,
  currentVerse,
  onPlayPause,
  onNext,
  onPrev,
  reciterName,
}: AudioPlayerBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <Card className="bg-card/90 backdrop-blur-md p-3 flex items-center justify-between border-border/20 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full h-10 w-10">
                <Headphones className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{`Surah ${surah.name}`}</p>
                <p className="text-xs text-muted-foreground">{`Verse ${currentVerse}`}</p>
            </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPrev} className="h-10 w-10" disabled={currentVerse <= 1}>
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12" onClick={onPlayPause}>
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} className="h-10 w-10" disabled={currentVerse >= surah.versesCount}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
