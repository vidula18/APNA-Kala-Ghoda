import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import kalaGhodaMap from '@assets/Asset_1_1790012101847.svg';
import characterOne from '@character-assets/character_1_1790011497388.PNG';
import characterTwo from '@character-assets/character_2_1790011497388.PNG';
import characterThree from '@character-assets/character_3_1790011497388.PNG';
import characterFour from '@character-assets/character_4_1790011497389.PNG';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const characterMarkers = [
  { id: 1, image: characterOne, x: 32, y: 25 },
  { id: 2, image: characterTwo, x: 63, y: 36 },
  { id: 3, image: characterThree, x: 37, y: 58 },
  { id: 4, image: characterFour, x: 61, y: 73 },
];

function Home() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<
    number | null
  >(null);

  return (
    <main className="apna-home" data-testid="home-screen">
      <header className="apna-header" data-testid="home-header">
        <h1 className="apna-wordmark" data-testid="text-apna-wordmark">
          Apna
        </h1>
        <div className="apna-tools" data-testid="home-tools">
          <button
            type="button"
            className="apna-tool"
            disabled
            aria-label="Information"
            data-testid="button-info"
          >
            Info
          </button>
          <button
            type="button"
            className="apna-tool"
            disabled
            aria-label="Filter"
            data-testid="button-filter"
          >
            Filter
          </button>
        </div>
      </header>

      <section className="apna-map-stage" aria-label="Kala Ghoda map">
        <div className="apna-map-wrap">
          <img
            className="apna-map"
            src={kalaGhodaMap}
            alt="Illustrated map of Kala Ghoda"
            draggable="false"
            data-testid="img-kala-ghoda-map"
          />
          <div className="apna-character-layer" aria-label="Character markers">
            {characterMarkers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                className={`apna-character-marker${
                  selectedCharacterId === marker.id ? ' is-selected' : ''
                }`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-label="Character marker"
                aria-pressed={selectedCharacterId === marker.id}
                onClick={() => setSelectedCharacterId(marker.id)}
                data-testid={`character-marker-${marker.id}`}
              >
                <img
                  src={marker.image}
                  alt=""
                  draggable="false"
                  data-testid={`character-image-${marker.id}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
