'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This effect runs only on the client
    // Since I cannot add assets, I will not create the Audio object.
    // The logic to play/pause would be here.
  }, []);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleMusic} className="text-white hover:bg-accent/20 hover:text-accent">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            <span className="sr-only">Toggle Music</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isPlaying ? 'Pause Music' : 'Play Music'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
