import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerPwa.ts';
import { initAiStudioLiveSync } from './utils/aiStudioSync.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Initialize PWA auto-updating service worker
setupServiceWorker();

// Initialize continuous background AI Studio build detector
initAiStudioLiveSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
