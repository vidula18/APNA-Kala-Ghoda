import React, { useState } from 'react';
import { CHARACTERS } from '@/lib/characters';
import { X, ArrowRight } from 'lucide-react';

interface ChooseCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (characterId: number) => void;
  initialCharacterId?: number | null;
}

export function ChooseCharacterModal({
  isOpen,
  onClose,
  onSelectCharacter,
  initialCharacterId,
}: ChooseCharacterModalProps) {
  const [selectedId, setSelectedId] = useState<number>(initialCharacterId || 1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="choose-char-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#fdfcf9] border border-[#e5e4de] shadow-2xl p-6 sm:p-8 text-[#353b67] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#353b67]/60 hover:text-[#353b67] hover:bg-[#eceae3] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#353b67]/60 mb-1">
            Step 1 of 3
          </div>
          <h2
            id="choose-char-title"
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#353b67]"
          >
            Choose how you appear
          </h2>
          <p className="text-xs sm:text-sm text-[#353b67]/75 mt-1">
            Select an illustrated figure to represent your presence in Kala Ghoda.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
          {CHARACTERS.map((char) => {
            const isSelected = selectedId === char.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => setSelectedId(char.id)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#353b67] bg-[#f4f1e6] shadow-sm scale-102 ring-2 ring-[#353b67]/20'
                    : 'border-[#eae8df] bg-[#fbfaf6] hover:border-[#353b67]/40 hover:bg-[#f6f4ec]'
                }`}
                aria-pressed={isSelected}
                aria-label={`Select character ${char.id}`}
              >
                <div className="w-20 h-24 sm:w-20 sm:h-26 flex items-center justify-center">
                  <img
                    src={char.image}
                    alt=""
                    draggable="false"
                    className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
                      isSelected ? 'scale-105 drop-shadow-md' : 'group-hover:scale-103 drop-shadow-xs'
                    }`}
                  />
                </div>
                <div
                  className={`mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                    isSelected
                      ? 'bg-[#353b67] text-[#fdfcf9]'
                      : 'text-[#353b67]/60 group-hover:text-[#353b67]'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#eae8df]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-[#353b67]/70 hover:text-[#353b67]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelectCharacter(selectedId)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm transition-opacity"
          >
            <span>Continue to map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
