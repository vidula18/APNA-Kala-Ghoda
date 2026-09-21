import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import kalaGhodaMap from '@assets/kala-ghoda-map_1790011542618.png';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
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
        <img
          className="apna-map"
          src={kalaGhodaMap}
          alt="Illustrated map of Kala Ghoda"
          draggable="false"
          data-testid="img-kala-ghoda-map"
        />
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
