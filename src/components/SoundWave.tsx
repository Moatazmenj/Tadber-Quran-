'use client';

import { cn } from '@/lib/utils';

interface SoundWaveProps {
  isRecording: boolean;
}

export function SoundWave({ isRecording }: SoundWaveProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex justify-center items-center h-full w-full pointer-events-none transition-opacity duration-300 overflow-hidden',
        isRecording ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-end justify-center space-x-1.5 h-full">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1 bg-primary/70 rounded-full animate-wave origin-bottom"
            style={{
              animationDelay: `${i * 0.04}s`,
              animationDuration: '1.5s',
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
