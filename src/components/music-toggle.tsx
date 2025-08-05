'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const playAudio = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Autoplay failed:', err);
        }
      };
      playAudio();
    }
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              className="text-white hover:bg-accent/20 hover:text-accent"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              <span className="sr-only">Toggle Music</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? 'Pause Music' : 'Play Music'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <audio ref={audioRef} src="/audio/lofi.mp3" loop preload="auto" />
    </>
  );
}
