import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerPwa.ts';
import { initAiStudioLiveSync } from './utils/aiStudioSync.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// 1. Mount React UI immediately so page renders with zero delay or blocking
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// 2. Safely initialize background PWA Service Worker & Live Sync non-blockingly
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      setupServiceWorker();
    } catch (err) {
      console.warn('[PWA Init Warning]:', err);
    }

    try {
      initAiStudioLiveSync();
    } catch (err) {
      console.warn('[LiveSync Init Warning]:', err);
    }
  }, 100);
}
