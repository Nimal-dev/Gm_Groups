'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // The track is ~5 MB. Create the element lazily on first play, with preload="none",
  // so visitors who never press play don't download it (saves Netlify bandwidth).
  const getAudio = () => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = 'none';
    audio.src = '/audio/lofi.mp3';
    audio.loop = true;
    audio.volume = volume;
    audio.muted = isMuted;

    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    audioRef.current = audio;
    return audio;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Silently fail if playback is blocked
      });
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    if (audioRef.current) audioRef.current.muted = next;
    setIsMuted(next);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMusic}
              className="text-white hover:bg-accent/20 hover:text-accent"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              <span className="sr-only">{isPlaying ? 'Pause Music' : 'Play Music'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPlaying ? 'Pause Music' : 'Play Music'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-accent/20 hover:text-accent"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? 'Unmute' : 'Mute'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Volume slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </TooltipProvider>
  );
}
