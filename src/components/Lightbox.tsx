import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import type { ImageItem } from '../types';

interface LightboxProps {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [isVisible, setIsVisible] = useState(false);
  const currentImage = images[currentIndex];

  useEffect(() => {
    // Trigger fade-in after mount for smooth transition
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition to finish before fully removing
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  if (!currentImage) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 transition-opacity duration-300 transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 backdrop-blur-sm"
        aria-label="Close modal"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      <div 
        className={`relative h-full w-full max-w-6xl flex flex-col items-center justify-center transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: currentImage.type === 'video' }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
                <button
                  onClick={() => zoomIn()}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
              <TransformComponent wrapperStyle={{ width: "100%", height: "85vh" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {currentImage.type === 'video' ? (
                  <CustomVideoPlayer src={currentImage.previewUrl} />
                ) : (
                  <img
                    src={currentImage.previewUrl}
                    alt={currentImage.name}
                    className="max-h-full max-w-full object-contain rounded-md shadow-2xl select-none"
                  />
                )}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
        <p className="mt-4 text-center text-sm font-medium text-white/80 select-none drop-shadow-md">
          {currentIndex + 1} / {images.length} - {currentImage.name}
        </p>
      </div>
    </div>
  );
}
