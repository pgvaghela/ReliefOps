import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageShell } from './components/layout/PageShell';
import { PageTransition } from './components/PageTransition';
import { Overview } from './routes/Overview';
import { Shelters } from './routes/Shelters';
import { ShelterDetail } from './routes/ShelterDetail';
import { Alerts } from './routes/Alerts';
import { Incidents } from './routes/Incidents';
import { IncidentDetail } from './routes/IncidentDetail';
import { CaseStudy } from './routes/CaseStudy';

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Overview />
            </PageTransition>
          }
        />
        <Route
          path="/overview"
          element={
            <PageTransition>
              <Overview />
            </PageTransition>
          }
        />
        <Route
          path="/shelters"
          element={
            <PageTransition>
              <Shelters />
            </PageTransition>
          }
        />
        <Route
          path="/shelters/:id"
          element={
            <PageTransition>
              <ShelterDetail />
            </PageTransition>
          }
        />
        <Route
          path="/alerts"
          element={
            <PageTransition>
              <Alerts />
            </PageTransition>
          }
        />
        <Route
          path="/incidents"
          element={
            <PageTransition>
              <Incidents />
            </PageTransition>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <PageTransition>
              <IncidentDetail />
            </PageTransition>
          }
        />
        <Route
          path="/case-study"
          element={
            <PageTransition>
              <CaseStudy />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PageShell>
          <AppRoutes />
        </PageShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
