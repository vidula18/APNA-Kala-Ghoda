import { type ReactNode, useState, useRef, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import kalaGhodaMap from '@assets/Asset_1_1790012101847.svg';
import { getCharacterImage } from '@/lib/characters';
import {
  getStoredMemories,
  fetchRemoteMemories,
  saveUserMemory,
} from '@/lib/memory-store';
import { StoryCard } from '@/components/StoryCard';
import { InfoModal } from '@/components/InfoModal';
import { FilterModal } from '@/components/FilterModal';
import { ChooseCharacterModal } from '@/components/ChooseCharacterModal';
import { StampQuestionFlow } from '@/components/StampQuestionFlow';
import type { Memory, ContributionStep, StampColor } from '@/types';
import { Plus, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Participatory Flow state
  const [flowStep, setFlowStep] = useState<ContributionStep>('none');
  const [participantCharacterId, setParticipantCharacterId] = useState<number>(1);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ x: number; y: number } | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [newlyAddedMemoryId, setNewlyAddedMemoryId] = useState<string | null>(null);

  const mapWrapRef = useRef<HTMLDivElement | null>(null);

  // Load memories on mount and check for remote updates
  useEffect(() => {
    setMemories(getStoredMemories());

    fetchRemoteMemories()
      .then((remotes) => {
        if (remotes.length > 0) {
          setMemories((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMemories = remotes.filter(
              (r) => !existingIds.has(r.id)
            );
            return [...prev, ...newMemories];
          });
        }
      })
      .catch(() => {
        // Graceful fallback to stored memories
      });
  }, []);

  // Handle map click during place selection
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flowStep !== 'choose-place') return;
    if (!mapWrapRef.current) return;

    const rect = mapWrapRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setTempLocation({
      x: Math.max(6, Math.min(94, clickX)),
      y: Math.max(6, Math.min(94, clickY)),
    });
  };

  // Start contribution flow: repeat contributor jumps straight to place selection
  const handleStartContribution = () => {
    setSelectedMemoryId(null);

    if (hasSelectedCharacter) {
      if (!tempLocation) {
        setTempLocation({ x: 50, y: 50 });
      }

      setFlowStep('choose-place');
    } else {
      setFlowStep('choose-character');
    }
  };

  // When character is chosen in step 1
  const handleCharacterSelected = (charId: number) => {
    setParticipantCharacterId(charId);
    setHasSelectedCharacter(true);

    if (!tempLocation) {
      setTempLocation({ x: 50, y: 50 });
    }

    setFlowStep('choose-place');
  };

  // When story question is submitted from StampQuestionFlow
  const handleStampStorySubmit = ({
    story,
    placeName,
    stampColor,
  }: {
    story: string;
    placeName?: string;
    stampColor: StampColor;
  }) => {
    if (!tempLocation) return;

    // Save locally FIRST.
    // This keeps the map working immediately and does not depend on Supabase.
    const created = saveUserMemory({
      characterId: participantCharacterId,
      x: tempLocation.x,
      y: tempLocation.y,
      story,
      placeName,
      stampColor,
    });

    // Update memory list immediately
    setMemories(getStoredMemories());
    setFlowStep('none');
    setTempLocation(null);
    setNewlyAddedMemoryId(created.id);

    // Show feedback
    setToastNotification(
      'Your memory is now part of Kala Ghoda. Tap your marker to view it.'
    );

    setTimeout(() => {
      setToastNotification(null);
    }, 5500);
  };

  // Filtered memories to display
  const displayedMemories = selectedFilter
    ? memories.filter((m) => m.characterId === selectedFilter)
    : memories;

  const activeMemory = memories.find(
    (m) => m.id === selectedMemoryId
  );

  return (
    <main className="apna-home" data-testid="home-screen">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#353b67] text-[#fdfcf9] text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2 max-w-[90vw] text-center">
          <Check className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Header with APNA wordmark & Controls */}
      <header className="apna-header" data-testid="home-header">
        <h1 className="apna-wordmark" data-testid="text-apna-wordmark">
          Apna
        </h1>

        <div className="apna-tools" data-testid="home-tools">
          <button
            type="button"
            className="apna-tool"
            onClick={() => setIsInfoOpen(true)}
            aria-label="Information about Apna"
            data-testid="button-info"
          >
            Info
          </button>

          <button
            type="button"
            className={`apna-tool ${
              selectedFilter !== null ? 'ring-2 ring-[#353b67]' : ''
            }`}
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filter memories"
            data-testid="button-filter"
          >
            {selectedFilter
              ? `Filter (${displayedMemories.length})`
              : 'Filter'}
          </button>

          <button
            type="button"
            className="apna-tool apna-tool-action inline-flex items-center justify-center gap-1 cursor-pointer"
            onClick={handleStartContribution}
            aria-label="Add your memory to the map"
            data-testid="button-add-memory"
          >
            <Plus className="w-3.5 h-3.5 inline" />
            <span>Add Memory</span>
          </button>
        </div>
      </header>

      {/* Map Stage */}
      <section
        className={`apna-map-stage ${
          flowStep === 'choose-place' ? 'cursor-crosshair' : ''
        }`}
        aria-label="Kala Ghoda map"
      >
        <div
          ref={mapWrapRef}
          className="apna-map-wrap"
          onClick={handleMapClick}
        >
          <img
            className="apna-map"
            src={kalaGhodaMap}
            alt="Illustrated map of Kala Ghoda"
            draggable="false"
            data-testid="img-kala-ghoda-map"
          />

          {/* Character Layer for existing / saved memories */}
          <div
            className="apna-character-layer"
            aria-label="Character markers"
          >
            {displayedMemories.map((memory) => {
              const isSelected = selectedMemoryId === memory.id;
              const isNewlyAdded = newlyAddedMemoryId === memory.id;
              const charImg = getCharacterImage(memory.characterId);

              return (
                <button
                  key={memory.id}
                  type="button"
                  className={`apna-character-marker${
                    isSelected ? ' is-selected' : ''
                  }${isNewlyAdded ? ' is-newly-added' : ''}`}
                  style={{
                    left: `${memory.x}%`,
                    top: `${memory.y}%`,
                    opacity:
                      flowStep === 'choose-place' ? 0.35 : 1,
                  }}
                  aria-label={
                    memory.placeName
                      ? `Memory at ${memory.placeName}`
                      : 'Community memory in Kala Ghoda'
                  }
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    if (flowStep === 'choose-place') return;

                    e.stopPropagation();
                    setSelectedMemoryId(memory.id);

                    if (newlyAddedMemoryId === memory.id) {
                      setNewlyAddedMemoryId(null);
                    }
                  }}
                  data-testid={`character-marker-${memory.id}`}
                >
                  <img
                    src={charImg}
                    alt=""
                    draggable="false"
                    data-testid={`character-image-${memory.id}`}
                  />
                </button>
              );
            })}

            {/* Temporary Placement Marker during Step 2 */}
            {flowStep === 'choose-place' && tempLocation && (
              <div
                className="apna-temp-marker"
                style={{
                  left: `${tempLocation.x}%`,
                  top: `${tempLocation.y}%`,
                }}
              >
                <div className="apna-temp-pulse" />

                <img
                  src={getCharacterImage(participantCharacterId)}
                  alt="Your temporary position on Kala Ghoda map"
                  draggable="false"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Place Selection Floating Guidance Bar */}
      {flowStep === 'choose-place' && (
        <aside
          className="apna-place-banner"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={() => setFlowStep('choose-character')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#353b67]/80 hover:text-[#353b67] px-2 py-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change figure</span>
          </button>

          <span className="hidden sm:inline text-xs text-[#353b67]/40">
            •
          </span>

          <span className="text-xs text-[#353b67] font-medium">
            Tap anywhere on the map to place your memory
          </span>

          {tempLocation && (
            <button
              type="button"
              onClick={() => setFlowStep('question-stamp')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm transition-opacity ml-auto cursor-pointer"
            >
              <span>Confirm place</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setFlowStep('none');
              setTempLocation(null);
            }}
            className="text-xs text-[#353b67]/60 hover:text-[#353b67] px-2 cursor-pointer"
          >
            Cancel
          </button>
        </aside>
      )}

      {/* Empty State when no memories exist for selected filter */}
      {flowStep === 'none' &&
        !selectedMemoryId &&
        selectedFilter !== null &&
        displayedMemories.length === 0 && (
          <aside
            className="apna-place-banner"
            role="status"
          >
            <span className="text-xs text-[#353b67] font-medium">
              No memories found for this figure yet.
            </span>

            <button
              type="button"
              onClick={() => setSelectedFilter(null)}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#353b67] text-[#fdfcf9] hover:opacity-90 shadow-sm cursor-pointer"
            >
              <span>Show all</span>
            </button>
          </aside>
        )}

      {/* Quiet hint footer during idle exploration */}
      {flowStep === 'none' &&
        !selectedMemoryId &&
        displayedMemories.length > 0 && (
          <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-center px-4">
            <p className="text-[11px] sm:text-xs text-[#353b67]/60 font-sans tracking-wide">
              Tap any character to read their memory • Tap
              &ldquo;+ Add Memory&rdquo; to contribute
            </p>
          </footer>
        )}

      {/* Story Card Modal on exact Response PNG stamp when exploring */}
      {activeMemory && (
        <StoryCard
          memory={activeMemory}
          onClose={() => setSelectedMemoryId(null)}
          onContribute={handleStartContribution}
        />
      )}

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        totalMemoriesCount={memories.length}
      />

      {/* Step 1: Choose Character Modal */}
      <ChooseCharacterModal
        isOpen={flowStep === 'choose-character'}
        onClose={() => setFlowStep('none')}
        onSelectCharacter={handleCharacterSelected}
        initialCharacterId={participantCharacterId}
      />

      {/* Step 3 & 4: Question & Response Stamp Flow */}
      {tempLocation && (
        <StampQuestionFlow
          isOpen={
            flowStep === 'question-stamp' ||
            flowStep === 'write-response'
          }
          step={
            flowStep === 'write-response'
              ? 'write-response'
              : 'question-stamp'
          }
          onClose={() => {
            setFlowStep('none');
            setTempLocation(null);
          }}
          onBackToLocation={() =>
            setFlowStep('choose-place')
          }
          onGoToWrite={() =>
            setFlowStep('write-response')
          }
          onBackToQuestion={() =>
            setFlowStep('question-stamp')
          }
          onSubmit={handleStampStorySubmit}
          characterId={participantCharacterId}
          location={tempLocation}
        />
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, '')}
        >
          <Router />
        </WouterRouter>

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
