import { useMemo } from 'react';
import type { ImageItem, ImageFilter } from '../types';

export function useFilteredImages(images: ImageItem[], filter: ImageFilter) {
  return useMemo(() => {
    let result = [...images];

    // Apply filtering
    if (filter === 'favorites') {
      result = result.filter(img => img.isFavorite);
    }

    // Apply sorting
    if (filter === 'recent') {
      result.sort((a, b) => {
        const timeA = a.uploadDate || 0;
        const timeB = b.uploadDate || 0;
        return timeB - timeA; // Descending order (newest first)
      });
    }

    return result;
  }, [images, filter]);
}
