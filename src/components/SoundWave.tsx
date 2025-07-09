'use client';

import { cn } from '@/lib/utils';

interface SoundWaveProps {
  isRecording: boolean;
}

export function SoundWave({ isRecording }: SoundWaveProps) {
  return (
    <div
      className={cn(
        'fixed bottom-[72px] left-0 right-0 flex justify-center items-center h-12 pointer-events-none transition-opacity duration-300 z-40',
        isRecording ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-center justify-center space-x-1.5 h-full">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 bg-primary rounded-full animate-wave origin-bottom"
            style={{
              animationDelay: `${i * 0.05}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
