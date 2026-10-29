/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_BUILD_ID__: string | undefined;
declare const __APP_BUILD_TIME__: string | undefined;

interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}
