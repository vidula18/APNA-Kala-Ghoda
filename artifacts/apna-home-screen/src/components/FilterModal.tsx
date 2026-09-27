import React from 'react';
import { CHARACTERS } from '@/lib/characters';
import { X, Check } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: number | null; // null means all
  onSelectFilter: (characterId: number | null) => void;
  totalMemoriesCount: number;
}

export function FilterModal({
  isOpen,
  onClose,
  selectedFilter,
  onSelectFilter,
  totalMemoriesCount,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#fdfcf9] border border-[#e5e4de] shadow-2xl p-6 text-[#353b67] animate-in fade-in zoom-in-95 duration-180"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#353b67]/60 hover:text-[#353b67] hover:bg-[#eceae3] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3
          id="filter-modal-title"
          className="font-serif text-xl font-bold tracking-tight text-[#353b67] mb-1"
        >
          Filter Memories
        </h3>
        <p className="text-xs text-[#353b67]/65 mb-5">
          Showing {totalMemoriesCount} {totalMemoriesCount === 1 ? 'memory' : 'memories'} across Kala Ghoda
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onSelectFilter(null);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              selectedFilter === null
                ? 'bg-[#353b67] text-[#fdfcf9] border-[#353b67]'
                : 'bg-transparent text-[#353b67] border-[#e5e4de] hover:bg-[#f4f2ea]'
            }`}
          >
            <span>All Memories</span>
            {selectedFilter === null && <Check className="w-4 h-4" />}
          </button>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {CHARACTERS.map((char) => {
              const isSelected = selectedFilter === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    onSelectFilter(char.id);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ece8dc] border-[#353b67] ring-1 ring-[#353b67]'
                      : 'bg-[#f8f7f2] border-[#e5e4de] hover:border-[#353b67]/40 hover:bg-[#f2efe6]'
                  }`}
                  aria-label="Filter by this figure"
                >
                  <div className="w-14 h-16 flex items-center justify-center mb-1">
                    <img
                      src={char.image}
                      alt=""
                      draggable="false"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#353b67]">
                    {isSelected ? 'Selected' : 'View memories'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
