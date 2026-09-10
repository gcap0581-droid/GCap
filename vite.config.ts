import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

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
        includeAssets: ['favicon.ico', 'icon.svg', 'icon-192.svg', 'icon-512.svg'],
        manifest: {
          id: '/',
          name: 'GCap - Investment & Daily Returns Platform',
          short_name: 'GCap',
          description: 'GCap - Smart Investment & Daily Returns Platform with Live AI Studio Auto-Update',
          theme_color: '#064e3b',
          background_color: '#020617',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/version\.json/],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.includes('version.json'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
                networkTimeoutSeconds: 3,
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
                      src: '/icon-192.svg',
                      type: 'image/svg+xml',
                      sizes: '192x192',
                      purpose: 'any'
                    },
                    {
                      src: '/icon-512.svg',
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
