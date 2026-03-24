import { Upload } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
      if (files.length > 0) {
        onUpload(files);
      }
    }
  };

  return (
    <div className="flex justify-center w-full">
      <label 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-10 transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20 scale-[1.02]' 
            : 'border-transparent bg-white/50 hover:bg-gray-50 hover:border-blue-300 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 dark:hover:border-blue-500/50 shadow-sm'
        }`}
      >
        <div className={`rounded-full p-5 transition-all duration-300 ${isDragging ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-lg' : 'bg-gray-100/80 text-gray-500 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 shadow-sm'}`}>
          <Upload className={`h-8 w-8 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1 group-hover:scale-110'}`} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Add to your collection</h2>
          <span className="font-semibold text-blue-600 dark:text-blue-400">Click to browse</span>
          <span className="text-gray-500 dark:text-gray-400 font-medium"> or drag and drop</span>
          <p className="mt-2 text-xs font-medium text-gray-400 dark:text-gray-500">Supports JPG, PNG, WEBP, GIF, MP4, WEBM</p>
        </div>
        <input
          type="file"
          className="sr-only"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
