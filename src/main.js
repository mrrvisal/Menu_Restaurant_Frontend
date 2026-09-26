// frontend/src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import './assets/selection.css';
import './assets/select.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// Restore the logged-in user's saved theme color before mounting
import { useThemeStore } from './stores/theme';
useThemeStore().load();

// ─── PWA: capture "Install app" as early as possible ───────
// Chrome fires `beforeinstallprompt` ONCE per page load, usually before a
// lazily-loaded view (the dashboard) has mounted — a listener registered
// inside a component misses it and the install button then waits (spins)
// forever. Attach the listener here, before the first paint, and share the
// captured event with the UI through @/utils/pwaInstall.
import { initPwaInstall } from './utils/pwaInstall';
initPwaInstall();

// ─── PWA: register the service worker at startup ───────────
// Chrome only offers "Install app" / fires beforeinstallprompt when an
// active service worker exists AND the manifest is served as JSON
// (see public/manifest.json — the file is intentionally NOT named
// *.webmanifest: Render serves that extension as binary/octet-stream,
// which makes Chrome ignore the manifest and skip the install prompt).
// Register IMMEDIATELY (not on window.load) so installability is ready as
// early as possible. sw.js does not intercept fetch() (safe: it never
// caches app requests).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('Service worker registration failed:', err);
  });
}

app.mount('#app');
