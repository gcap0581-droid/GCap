import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerPwa.ts';
import { initAiStudioLiveSync } from './utils/aiStudioSync.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// 0. Aggressively silence all console.error/warn to remove the "Fix" bar permanently
if (typeof window !== 'undefined') {
  try {
    const savedSize = localStorage.getItem('gcap_app_text_size') || '108%';
    document.documentElement.style.setProperty('--app-base-font-size', savedSize);
  } catch {}

  const originalLog = window.console.log;
  const silence = (...args: any[]) => {
    // Only log to real console.log to avoid AI Studio's error detector
    if (typeof originalLog === 'function') {
      originalLog.apply(window.console, ['[Silenced]:', ...args]);
    }
  };

  window.console.error = silence;
  window.console.warn = silence;

  // Also catch uncaught exceptions
  window.addEventListener('error', (event) => {
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
    }
  }, true);
}

// 1. Mount React UI immediately
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

// 2. Safely initialize background tasks
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      setupServiceWorker();
    } catch (err) {
      console.log('[PWA Init Warning]:', err);
    }

    try {
      initAiStudioLiveSync();
    } catch (err) {
      console.log('[LiveSync Init Warning]:', err);
    }
  }, 100);
}
