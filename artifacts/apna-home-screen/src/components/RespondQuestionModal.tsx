import React, { useState } from 'react';
import { getCharacterImage } from '@/lib/characters';
import { X, ArrowLeft, Send } from 'lucide-react';

interface RespondQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLocation: () => void;
  onSubmit: (data: { story: string; placeName?: string; cues?: string }) => void;
  characterId: number;
  location: { x: number; y: number };
}

export function RespondQuestionModal({
  isOpen,
  onClose,
  onBackToLocation,
  onSubmit,
  characterId,
  location,
}: RespondQuestionModalProps) {
  const [story, setStory] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [cuesNotes, setCuesNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const characterImg = getCharacterImage(characterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      setError('Please share a few words about what happened here.');
      return;
    }
    setError('');
    onSubmit({
      story: story.trim(),
      placeName: placeName.trim() || undefined,
      cues: cuesNotes.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-title"
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

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-14 shrink-0 flex items-center justify-center">
            <img
              src={characterImg}
              alt=""
              className="max-h-full max-w-full object-contain drop-shadow-xs"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#353b67]/60">
              Step 3 of 3 • Kala Ghoda Memory
            </div>
            <div className="text-xs text-[#353b67]/75">
              Spot at {Math.round(location.x)}%, {Math.round(location.y)}%
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h2
              id="question-title"
              className="font-serif text-2xl font-bold tracking-tight text-[#353b67] leading-snug"
            >
              Tell us about something that happened here.
            </h2>

            {/* Scaffolding cues */}
            <div className="mt-2 text-xs leading-relaxed text-[#353b67]/65 flex flex-wrap gap-x-3 gap-y-1">
              <span>Who were you with?</span>
              <span>•</span>
              <span>What were you doing?</span>
              <span>•</span>
              <span>What did you notice?</span>
              <span>•</span>
              <span>What do you remember?</span>
            </div>
          </div>

          <div>
            <textarea
              rows={4}
              value={story}
              onChange={(e) => {
                setStory(e.target.value);
                if (error) setError('');
              }}
              placeholder="Write naturally in your own words, language, or style..."
              className="w-full rounded-xl border border-[#dcdad0] bg-[#fbfaf6] p-3.5 text-sm text-[#353b67] placeholder-[#353b67]/40 focus:border-[#353b67] focus:outline-none focus:ring-1 focus:ring-[#353b67] resize-none font-serif leading-relaxed"
              autoFocus
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-[#353b67]/70 mb-1">
                Spot or landmark name (optional)
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g. Outside Wayside Inn"
                className="w-full rounded-lg border border-[#dcdad0] bg-[#fbfaf6] px-3 py-1.5 text-xs text-[#353b67] placeholder-[#353b67]/40 focus:border-[#353b67] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#353b67]/70 mb-1">
                Any quick detail or year (optional)
              </label>
              <input
                type="text"
                value={cuesNotes}
                onChange={(e) => setCuesNotes(e.target.value)}
                placeholder="e.g. Afternoon stroll • 2022"
                className="w-full rounded-lg border border-[#dcdad0] bg-[#fbfaf6] px-3 py-1.5 text-xs text-[#353b67] placeholder-[#353b67]/40 focus:border-[#353b67] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#eae8df]">
            <button
              type="button"
              onClick={onBackToLocation}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#353b67]/75 hover:text-[#353b67]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change spot</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm transition-opacity"
            >
              <span>Add to Map</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
