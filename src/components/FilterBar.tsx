import type { ImageFilter } from '../types';

interface FilterBarProps {
  currentFilter: ImageFilter;
  onFilterChange: (filter: ImageFilter) => void;
}

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const filters: ImageFilter[] = ['all', 'favorites', 'recent', 'grayscale'];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all duration-300 ${
            currentFilter === f
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-500'
              : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-0.5'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
