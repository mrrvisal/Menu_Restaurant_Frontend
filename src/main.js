import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useThemeStore } from "./stores/theme";
import { initPwaInstall } from "./utils/pwaInstall";

import "./assets/main.css";
import "./assets/selection.css";
import "./assets/select.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// Restore saved theme before mount
useThemeStore().load();

// Capture PWA install prompt early before views mount
initPwaInstall();

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.warn("Service worker registration failed:", err);
  });
}

app.mount("#app");
