import React from 'react';
import type { Memory, StampColor } from '@/types';
import { getCharacterImage } from '@/lib/characters';
import { STAMP_THEMES, getStampThemeForCharacter } from '@/lib/stamp-assets';
import { X, MapPin, Plus } from 'lucide-react';

interface StoryCardProps {
  memory: Memory;
  onClose: () => void;
  onContribute?: () => void;
}

export function StoryCard({ memory, onClose, onContribute }: StoryCardProps) {
  const characterImg = getCharacterImage(memory.characterId);
  const stampColor: StampColor =
    memory.stampColor ?? getStampThemeForCharacter(memory.characterId);
  const theme = STAMP_THEMES[stampColor];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-black/35 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Kala Ghoda Memory Stamp"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#fdfcf9] border border-[#e5e4de] shadow-2xl p-4 sm:p-6 text-[#353b67] animate-in fade-in zoom-in-95 duration-180 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#353b67]/60 hover:text-[#353b67] hover:bg-[#eceae3] transition-colors z-20 cursor-pointer"
          aria-label="Close story"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character & Spot info */}
        <div className="w-full flex items-center gap-3.5 mb-3 px-1">
          <div className="w-12 h-14 shrink-0 flex items-center justify-center">
            <img
              src={characterImg}
              alt=""
              draggable="false"
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-[#353b67]/80">
              <MapPin className="w-3.5 h-3.5 text-[#353b67]" />
              <span>{memory.placeName ?? 'Kala Ghoda'}</span>
            </div>
            <div className="text-xs text-[#353b67]/55 mt-0.5">
              {memory.createdAt}
            </div>
          </div>
        </div>

        {/* The Exact Response PNG Stamp displaying the memory */}
        <div className="relative w-full max-w-[460px] aspect-[800/620] my-2 select-none">
          <img
            src={theme.responsePng}
            alt="APNA Memory Stamp"
            className="w-full h-full object-contain drop-shadow-md pointer-events-none"
            draggable="false"
          />

          {/* Location text next to printed 'location' */}
          <div
            className="absolute top-[10.5%] left-[27%] text-xs sm:text-sm font-bold tracking-tight truncate max-w-[55%] pointer-events-none"
            style={{
              color: stampColor === 'lime' ? '#1354bb' : '#ffffff',
            }}
          >
            {memory.placeName ? `— ${memory.placeName}` : `• Kala Ghoda`}
          </div>

          {/* Memory Text aligned over the printed lines of the stamp */}
          <div
            className="absolute inset-x-[15%] top-[24%] bottom-[16%] flex flex-col justify-start overflow-hidden pointer-events-none"
          >
            <p
              className="w-full h-full font-sans font-semibold text-sm sm:text-base leading-[2.6rem] sm:leading-[3.35rem] tracking-tight m-0"
              style={{
                color: theme.textColor,
              }}
            >
              {memory.story}
            </p>
          </div>
        </div>

        {memory.cues && (
          <div className="w-full max-w-[460px] mt-2 text-[11px] text-[#353b67]/70 font-sans px-2 text-center">
            {memory.cues}
          </div>
        )}

        <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-[#eae8df]">
          {onContribute ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onContribute();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#353b67]/80 hover:text-[#353b67] px-2 py-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Contribute your memory</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
}
