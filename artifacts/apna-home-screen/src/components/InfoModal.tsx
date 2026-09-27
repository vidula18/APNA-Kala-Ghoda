import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#fdfcf9] border border-[#e5e4de] shadow-2xl p-6 sm:p-8 text-[#353b67] animate-in fade-in zoom-in-95 duration-180"
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

        <h2
          id="info-modal-title"
          className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#353b67] mb-3"
        >
          Apna
        </h2>

        <p className="text-sm font-medium text-[#353b67]/75 uppercase tracking-wider mb-6">
          Kala Ghoda • Participatory Memory Map
        </p>

        <div className="space-y-4 text-sm leading-relaxed text-[#353b67]/85 font-sans">
          <p>
            APNA is a shared map of personal experiences, observations, and living memories across the historic Kala Ghoda neighbourhood in Mumbai.
          </p>
          <p>
            Every illustrated figure placed on this map represents someone who walked these streets—pausing by a gallery, listening to music on Rampart Row, or sitting on library steps in the evening breeze.
          </p>

          <div className="py-3 px-4 rounded-xl bg-[#f4f2ea] border border-[#e4e1d5] text-xs font-medium text-[#353b67] space-y-1">
            <div className="font-semibold text-[#353b67] uppercase tracking-wider text-[11px] mb-1">
              The Journey
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#353b67]/90 font-serif">
              <span>PERSON</span>
              <span>&rarr;</span>
              <span>PLACE</span>
              <span>&rarr;</span>
              <span>EXPERIENCE</span>
              <span>&rarr;</span>
              <span>MEMORY</span>
              <span>&rarr;</span>
              <span>SHARED NEIGHBOURHOOD</span>
            </div>
          </div>

          <p className="text-xs text-[#353b67]/70">
            Click any character on the map to read their memory, or tap &ldquo;Add a memory&rdquo; to contribute your own story to the neighbourhood.
          </p>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 transition-opacity"
          >
            Explore Map
          </button>
        </div>
      </div>
    </div>
  );
}
