
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
      <div className="flex items-center justify-center space-x-1 h-full w-full mask-wave">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-full bg-white/50 animate-wave origin-bottom"
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
