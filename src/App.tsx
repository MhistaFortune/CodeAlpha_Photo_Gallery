import { useState, useEffect } from 'react';
import { Sun, Moon, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ImageUpload } from './components/ImageUpload';
import { ImageCard } from './components/ImageCard';
import { Lightbox } from './components/Lightbox';
import { ConfirmModal } from './components/ConfirmModal';
import { FilterBar } from './components/FilterBar';
import { useFilteredImages } from './hooks/useFilteredImages';
import type { ImageItem, ImageFilter } from './types';
import './index.css';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ImageItem | null>(null);
  const [filter, setFilter] = useState<ImageFilter>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFilter = localStorage.getItem('gallery_filter');
        if (savedFilter && ['all', 'favorites', 'recent', 'grayscale'].includes(savedFilter)) {
          return savedFilter as ImageFilter;
        }
      } catch (e) {
        console.error("Failed to load filter from localStorage", e);
      }
    }
    return 'all';
  });

  useEffect(() => {
    try {
      localStorage.setItem('gallery_filter', filter);
    } catch (e) {
      console.error("Failed to save filter to localStorage", e);
    }
  }, [filter]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gallery_images');
      if (saved) {
        setImages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load images from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const saveToLocalStorage = (items: ImageItem[]) => {
    try {
      localStorage.setItem('gallery_images', JSON.stringify(items.map(img => ({
        id: img.id,
        name: img.name,
        previewUrl: img.previewUrl,
        size: img.size,
        isFavorite: img.isFavorite,
        uploadDate: img.uploadDate,
        type: img.type
      }))));
    } catch (e) {
      console.warn("Storage quota exceeded or error saving to localStorage.", e);
      alert("Browser storage quota exceeded! Large images cannot be fully saved to local storage.");
    }
  };

  const getPreviewUrl = async (file: File): Promise<string> => {
    // Prevent browser crash and quota limit issues for large files or videos
    if (file.type.startsWith('video/') || file.size > 2 * 1024 * 1024) {
      return URL.createObjectURL(file);
    }
    return await fileToDataUrl(file);
  };

  const handleUpload = async (files: File[]) => {
    const newImages: ImageItem[] = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: await getPreviewUrl(file), // Convert to base64 or ObjectURL
        name: file.name,
        size: file.size,
        uploadDate: Date.now(),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }))
    );

    setImages(prev => {
      const updated = [...newImages, ...prev]; // Prepend new images to start
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const handleDeleteClick = (img: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageToDelete(img);
  };

  const confirmDelete = () => {
    if (!imageToDelete) return;
    setImages(prev => {
      const updated = prev.filter(i => i.id !== imageToDelete.id);
      saveToLocalStorage(updated);
      return updated;
    });
    setImageToDelete(null);
  };

  const handleDownload = (img: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = img.previewUrl;
    a.download = img.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleToggleFavorite = (img: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => {
      const updated = prev.map(i => i.id === img.id ? { ...i, isFavorite: !i.isFavorite } : i);
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const displayedImages = useFilteredImages(images, filter);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 shadow-sm transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-inner">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Photo Gallery</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 active:scale-95 text-gray-600 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-10">
        <ImageUpload onUpload={handleUpload} />

        {images.length > 0 ? (
          <div className="flex flex-col gap-6">
            <FilterBar currentFilter={filter} onFilterChange={setFilter} />

            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8 min-h-[50vh] content-start transition-all duration-500">
              <AnimatePresence mode="popLayout">
                {displayedImages.map((img, index) => (
                  <ImageCard 
                    key={img.id} 
                    image={img} 
                    onClick={() => setSelectedIndex(index)} 
                    onDelete={handleDeleteClick}
                    onDownload={handleDownload}
                    onToggleFavorite={handleToggleFavorite}
                    isGrayscale={filter === 'grayscale'}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm">
            <div className="relative mb-6">
               <div className="absolute inset-0 block rounded-full bg-blue-500/10 blur-xl dark:bg-blue-400/10"></div>
               <ImageIcon className="relative h-20 w-20 text-blue-500/40 dark:text-blue-400/40" />
            </div>
            <p className="text-2xl font-medium text-gray-800 dark:text-gray-200">No media yet</p>
            <p className="text-base mt-2 max-w-sm text-center">Upload some awesome pictures or videos above to bring your gallery to life!</p>
          </div>
        )}
      </main>

      {selectedIndex !== null && (
        <Lightbox
          images={displayedImages}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}

      <AnimatePresence>
        {imageToDelete && (
          <ConfirmModal
            title="Delete Image"
            message={`Are you sure you want to remove "${imageToDelete.name}" from your gallery?`}
            onConfirm={confirmDelete}
            onCancel={() => setImageToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
