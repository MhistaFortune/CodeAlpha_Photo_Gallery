export type ImageFilter = 'all' | 'favorites' | 'recent' | 'grayscale';

export interface ImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size?: number;
  isFavorite?: boolean;
  uploadDate?: number;
  type?: 'image' | 'video';
}
