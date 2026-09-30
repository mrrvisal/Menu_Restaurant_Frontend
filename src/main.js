import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import { useThemeStore } from "./stores/theme";
import { useI18nStore } from "./stores/i18n";
import { initPwaInstall } from "./utils/pwaInstall";
import { installApiErrorHandling } from "./utils/apiErrors";
import { installNativeFormValidation } from "./utils/formValidation";

import "./assets/main.css";
import "./assets/selection.css";
import "./assets/select.css";
import "./assets/admin-ui.css";

const app = createApp(App);
installApiErrorHandling(axios);
const pinia = createPinia();
app.use(pinia);
installNativeFormValidation(useI18nStore(pinia));
app.use(router);

// Restore saved theme before mount
useThemeStore(pinia).load();

// Capture PWA install prompt early before views mount
initPwaInstall();

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.warn("Service worker registration failed:", err);
  });
}

app.mount("#app");
