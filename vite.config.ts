import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildTimestamp = Date.now().toString();
const buildIsoTime = new Date().toISOString();

export default defineConfig(() => {
  return {
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildTimestamp),
      __APP_BUILD_TIME__: JSON.stringify(buildIsoTime),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'GCap - Investment & Daily Returns Platform',
          short_name: 'GCap',
          description: 'GCap - Smart Investment & Daily Returns Platform with Live Auto-Accrual',
          theme_color: '#064e3b',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MiB limit to allow all app assets to be safely precached
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/version\.json/, /^\/api/],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.includes('version.json') || url.pathname.startsWith('/api'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
                networkTimeoutSeconds: 1.5,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'aistudio-version-endpoint',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && (req.url.startsWith('/manifest.json') || req.url.startsWith('/manifest.webmanifest'))) {
              res.setHeader('Content-Type', 'application/manifest+json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.end(
                JSON.stringify({
                  short_name: 'GCap',
                  name: 'GCap - Investment & Daily Returns Platform',
                  description: 'GCap - Smart Investment & Daily Returns Platform with Daily Returns and Auto-Accrual',
                  icons: [
                    {
                      src: '/pwa-192x192.png',
                      type: 'image/png',
                      sizes: '192x192',
                      purpose: 'any'
                    },
                    {
                      src: '/pwa-512x512.png',
                      type: 'image/png',
                      sizes: '512x512',
                      purpose: 'any'
                    },
                    {
                      src: '/pwa-maskable-512x512.png',
                      type: 'image/png',
                      sizes: '512x512',
                      purpose: 'maskable'
                    },
                    {
                      src: '/icon.svg',
                      type: 'image/svg+xml',
                      sizes: '512x512',
                      purpose: 'any'
                    }
                  ],
                  start_url: '/',
                  background_color: '#020617',
                  theme_color: '#064e3b',
                  display: 'standalone',
                  orientation: 'portrait',
                  scope: '/'
                })
              );
              return;
            }
            if (req.url && req.url.startsWith('/version.json')) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
              res.end(
                JSON.stringify({
                  buildId: buildTimestamp,
                  buildTime: buildIsoTime,
                  appVersion: '2.5.1',
                  source: 'Google AI Studio',
                  message: 'Live AI Studio Dev Server - Auto-Update Active without Reinstall',
                  autoReloadEnabled: true,
                })
              );
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio dev environment to prevent WebSocket reconnect errors
      hmr: false,
      watch: null,
    },
    build: {
      chunkSizeWarningLimit: 3500,
      outDir: 'dist',
    },
  };
});
