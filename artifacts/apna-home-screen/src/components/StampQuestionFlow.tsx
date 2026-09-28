import React, { useState } from 'react';
import type { StampColor } from '@/types';
import { STAMP_THEMES, getStampThemeForCharacter } from '@/lib/stamp-assets';
import { getCharacterImage } from '@/lib/characters';
import { X, ArrowLeft, ArrowRight, Send, MapPin, Sparkles } from 'lucide-react';

interface StampQuestionFlowProps {
  isOpen: boolean;
  step: 'question-stamp' | 'write-response';
  onClose: () => void;
  onBackToLocation: () => void;
  onGoToWrite: () => void;
  onBackToQuestion: () => void;
  onSubmit: (data: { story: string; placeName?: string; stampColor: StampColor }) => void;
  characterId: number;
  location: { x: number; y: number };
}

export function StampQuestionFlow({
  isOpen,
  step,
  onClose,
  onBackToLocation,
  onGoToWrite,
  onBackToQuestion,
  onSubmit,
  characterId,
  location,
}: StampQuestionFlowProps) {
  const [selectedColor, setSelectedColor] = useState<StampColor>(
    getStampThemeForCharacter(characterId),
  );
  const [story, setStory] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentTheme = STAMP_THEMES[selectedColor];
  const characterImg = getCharacterImage(characterId);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  console.log('ADD TO MAP BUTTON CLICKED');

  if (!story.trim()) {
    setError('Please write a memory on the card before adding to the map.');
    return;
  }

  setError('Saving...');

  onSubmit({
      story: story.trim(),
      placeName: placeName.trim() || undefined,
      stampColor: selectedColor,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="APNA memory stamp interaction"
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-[#fdfcf9] border border-[#e5e4de] shadow-2xl p-4 sm:p-6 text-[#353b67] animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#353b67]/60 hover:text-[#353b67] hover:bg-[#eceae3] transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header info */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-11 shrink-0 flex items-center justify-center">
              <img
                src={characterImg}
                alt=""
                className="max-h-full max-w-full object-contain drop-shadow-xs"
              />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[#353b67]/60">
                {step === 'question-stamp' ? 'Step 3 of 4 • Question' : 'Step 4 of 4 • Memory Card'}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#353b67] font-medium">
                <MapPin className="w-3 h-3 text-[#353b67]/70" />
                <span>
                  {placeName || `Kala Ghoda (${Math.round(location.x)}%, ${Math.round(location.y)}%)`}
                </span>
              </div>
            </div>
          </div>

          {/* Color theme selectors for the 3 PNG variations */}
          <div className="flex items-center gap-1.5 pr-8 sm:pr-0">
            {(['blue', 'magenta', 'lime'] as StampColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                  selectedColor === c ? 'scale-115 border-[#353b67] ring-2 ring-[#353b67]/30' : 'border-white opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    c === 'blue'
                      ? '#1354bb'
                      : c === 'magenta'
                        ? '#c73373'
                        : '#c8ea29',
                }}
                aria-label={`Switch to ${c} stamp`}
                title={`Switch to ${c} stamp`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: QUESTION STAMP PNG */}
        {/* ========================================================================= */}
        {step === 'question-stamp' && (
          <div className="w-full flex flex-col items-center">
            {/* The exact Question PNG Artwork */}
            <div
              className="relative w-full max-w-[480px] aspect-[800/620] cursor-pointer group my-2 select-none"
              onClick={onGoToWrite}
              title="Click to write your memory"
            >
              <img
                src={currentTheme.questionPng}
                alt="What makes this place special to you?"
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-[1.01] transition-transform duration-200"
                draggable="false"
              />

              {/* Dynamic location label placed seamlessly next to the printed 'location' tag */}
              <div
                className="absolute top-[10.5%] left-[27%] text-xs sm:text-sm font-bold tracking-tight truncate max-w-[55%] pointer-events-none"
                style={{
                  color: selectedColor === 'lime' ? '#1354bb' : '#ffffff',
                }}
              >
                {placeName ? `— ${placeName}` : `• Kala Ghoda`}
              </div>

              {/* Subtle hover invitation overlay */}
              <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="px-3.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span>Click stamp to write response</span>
                </span>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="w-full flex items-center justify-between pt-3 mt-2 border-t border-[#eae8df]">
              <button
                type="button"
                onClick={onBackToLocation}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#353b67]/75 hover:text-[#353b67] px-2 py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change spot</span>
              </button>

              <button
                type="button"
                onClick={onGoToWrite}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm transition-opacity"
              >
                <span>Write your response</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: WRITE RESPONSE ON EXACT PNG STAMP */}
        {/* ========================================================================= */}
        {step === 'write-response' && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* The exact Response PNG with Interactive Input Aligned on Printed Lines */}
            <div className="relative w-full max-w-[480px] aspect-[800/620] my-2 select-none">
              <img
                src={currentTheme.responsePng}
                alt="Write your memory on this stamp"
                className="w-full h-full object-contain drop-shadow-md pointer-events-none"
                draggable="false"
              />

              {/* Dynamic location label next to printed 'location' */}
              <div
                className="absolute top-[10.5%] left-[27%] text-xs sm:text-sm font-bold tracking-tight truncate max-w-[55%] pointer-events-none"
                style={{
                  color: selectedColor === 'lime' ? '#1354bb' : '#ffffff',
                }}
              >
                {placeName ? `— ${placeName}` : `• Kala Ghoda`}
              </div>

              {/* Textarea placed exactly over the stamp's printed writing lines */}
              <div
                className="absolute inset-x-[15%] top-[24%] bottom-[16%] flex flex-col justify-start"
              >
                <textarea
                  rows={currentTheme.lineCount}
                  value={story}
                  onChange={(e) => {
                    setStory(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Write what happened here... who you were with, what you noticed, what you remember..."
                  autoFocus
                  className="w-full h-full bg-transparent resize-none border-none outline-none font-sans font-semibold text-sm sm:text-base focus:ring-0 leading-[2.6rem] sm:leading-[3.35rem] placeholder:font-normal placeholder:italic placeholder:opacity-50"
                  style={{
                    color: currentTheme.textColor,
                  }}
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-medium mb-2">{error}</p>}

            {/* Optional spot name input below the stamp */}
            <div className="w-full max-w-[480px] flex items-center gap-2 mb-3">
              <label className="text-[11px] font-semibold text-[#353b67]/70 whitespace-nowrap">
                Spot name (optional):
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g. Rampart Row corner, Wayside Inn steps..."
                className="flex-1 rounded-full border border-[#dcdad0] bg-[#fbfaf6] px-3 py-1 text-xs text-[#353b67] placeholder-[#353b67]/40 focus:border-[#353b67] focus:outline-none"
              />
            </div>

            {/* Controls */}
            <div className="w-full flex items-center justify-between pt-3 border-t border-[#eae8df]">
              <button
                type="button"
                onClick={onBackToQuestion}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#353b67]/75 hover:text-[#353b67] px-2 py-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to question</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm transition-opacity"
              >
                <span>Add to Kala Ghoda Map</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
