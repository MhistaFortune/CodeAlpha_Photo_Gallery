import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Sun, Play, Pause } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
}

export function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [brightness, setBrightness] = useState(1); 
  const [showIndicator, setShowIndicator] = useState<{ type: 'volume' | 'brightness' | 'playPause', value?: number | boolean } | null>(null);

  const lastYRef = useRef<number | null>(null);
  const interactionSideRef = useRef<'left' | 'right' | null>(null);
  const indicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);

  const showIconIndicator = (type: 'volume' | 'brightness' | 'playPause', value?: number | boolean) => {
    setShowIndicator({ type, value });
    if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowIndicator(null);
    }, 1000); 
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLVideoElement>) => {
    if (!e.isPrimary) return;

    // We don't want to interfere if they are clicking the bottom 20% (native controls area)
    const rect = videoRef.current?.getBoundingClientRect();
    if (rect) {
      const y = e.clientY - rect.top;
      if (y > rect.height * 0.8) {
        return;
      }
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      togglePlayPause();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (rect) {
      const x = e.clientX - rect.left;
      interactionSideRef.current = x < rect.width / 2 ? 'left' : 'right';
      lastYRef.current = e.clientY;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLVideoElement>) => {
    if (lastYRef.current === null || interactionSideRef.current === null) return;
    if (!e.isPrimary) return;

    const deltaY = lastYRef.current - e.clientY;
    lastYRef.current = e.clientY;

    const containerHeight = videoRef.current?.clientHeight || 500;
    const sensitivity = 1.5;
    const change = (deltaY / containerHeight) * sensitivity;

    if (interactionSideRef.current === 'right') {
      if (videoRef.current) {
        let newVol = videoRef.current.volume + change;
        newVol = Math.max(0, Math.min(1, newVol));
        videoRef.current.volume = newVol;
        showIconIndicator('volume', newVol);
      }
    } else if (interactionSideRef.current === 'left') {
      setBrightness((prev) => {
        let newBright = prev + change;
        newBright = Math.max(0.1, Math.min(2, newBright)); 
        showIconIndicator('brightness', newBright);
        return newBright;
      });
    }
  };

  const handlePointerUp = () => {
    lastYRef.current = null;
    interactionSideRef.current = null;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        showIconIndicator('playPause', true);
      } else {
        videoRef.current.pause();
        showIconIndicator('playPause', false);
      }
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        controls
        autoPlay
        playsInline
        className="max-h-full max-w-full object-contain rounded-md shadow-2xl nodrag"
        style={{ 
          filter: `brightness(${brightness})`, 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {showIndicator && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-black/70 backdrop-blur-md rounded-2xl p-6 text-white flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
          {showIndicator.type === 'volume' && (
            <>
              {showIndicator.value === 0 ? <VolumeX className="w-12 h-12 mb-3" /> : <Volume2 className="w-12 h-12 mb-3" />}
              <div className="text-xl font-bold mb-2">{Math.round((showIndicator.value as number) * 100)}%</div>
              <div className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-75" style={{ width: `${(showIndicator.value as number) * 100}%` }} />
              </div>
            </>
          )}
          {showIndicator.type === 'brightness' && (
            <>
              <Sun className="w-12 h-12 mb-3" />
              <div className="text-xl font-bold mb-2">{Math.round(((showIndicator.value as number) / 2) * 100)}%</div>
              <div className="w-32 h-2 bg-gray-600 rounded-full overflow-hidden">
                 <div className="h-full bg-white transition-all duration-75" style={{ width: `${((showIndicator.value as number) / 2) * 100}%` }} />
              </div>
            </>
          )}
          {showIndicator.type === 'playPause' && (
            <>
              {showIndicator.value ? <Play className="w-16 h-16 ml-2" fill="currentColor" /> : <Pause className="w-16 h-16" fill="currentColor" />}
            </>
          )}
        </div>
      )}
    </>
  );
}
