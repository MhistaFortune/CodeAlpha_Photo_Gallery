import { Eye, Image as ImageIcon, Trash2, Download, Heart, Video as VideoIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  onClick?: (image: ImageItem) => void;
  onDelete?: (image: ImageItem, e: React.MouseEvent) => void;
  onDownload?: (image: ImageItem, e: React.MouseEvent) => void;
  onToggleFavorite?: (image: ImageItem, e: React.MouseEvent) => void;
  isGrayscale?: boolean;
}

export function ImageCard({ image, onClick, onDelete, onDownload, onToggleFavorite, isGrayscale }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick?.(image)}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50"
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800 animate-pulse">
           <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2 opacity-50" />
        </div>
      )}

      {/* Top action buttons */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={(e) => onToggleFavorite?.(image, e)}
          className={`rounded-full p-2 backdrop-blur-md transition-all hover:scale-110 active:scale-95 border ${image.isFavorite ? 'bg-red-500/90 text-white border-red-500/20 shadow-sm' : 'bg-black/40 text-white hover:bg-black/60 border-white/10'}`}
          aria-label={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 ${image.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={(e) => onDownload?.(image, e)}
          className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95 border border-white/10"
          aria-label="Download image"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => onDelete?.(image, e)}
          className="rounded-full bg-red-500/80 p-2 text-white backdrop-blur-md transition-all hover:bg-red-600 hover:scale-110 active:scale-95 border border-white/10 shadow-sm"
          aria-label="Delete image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {image.type === 'video' ? (
        <video
          src={image.previewUrl}
          onLoadedData={() => setIsLoading(false)}
          className={`h-full w-full object-cover transition-all duration-700 ${isLoading ? 'scale-110 blur-xl opacity-0' : 'scale-100 blur-0 opacity-100 group-hover:scale-110'} ${isGrayscale ? 'grayscale group-hover:grayscale-0' : ''}`}
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={image.previewUrl}
          alt={image.name}
          onLoad={() => setIsLoading(false)}
          className={`h-full w-full object-cover transition-all duration-700 ${isLoading ? 'scale-110 blur-xl opacity-0' : 'scale-100 blur-0 opacity-100 group-hover:scale-110'} ${isGrayscale ? 'grayscale group-hover:grayscale-0' : ''}`}
        />
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      {/* Centered view icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none">
        <div className="rounded-full bg-white/20 p-3 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 text-white border border-white/30 shadow-lg">
          <Eye className="h-6 w-6 drop-shadow-md" />
        </div>
      </div>

      {/* Bottom text overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 opacity-0 transition-all duration-300 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none flex items-center justify-between">
        <div className="truncate w-full pr-2">
          <p className="truncate text-sm font-semibold text-white shadow-sm leading-tight flex items-center gap-2">
            {image.type === 'video' && <VideoIcon className="h-4 w-4 shrink-0 drop-shadow-md" />}
            {image.name}
          </p>
          <p className="text-xs font-medium text-white/70 mt-1">{image.size ? (image.size / 1024 / 1024).toFixed(2) + ' MB' : 'New File'}</p>
        </div>
        {image.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current ml-2 shrink-0 drop-shadow-md" />}
      </div>
    </motion.div>
  );
}
