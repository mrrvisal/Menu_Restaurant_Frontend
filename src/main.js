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

app.mount('#app');
