import './assets/main.css';
import { createApp } from 'vue';
import ErrorFallback from './ErrorFallback.vue';
import { i18n } from './i18n';
import { usePreferences } from '@/preferences';

// Initialize preferences (theme + locale) on startup
usePreferences();

export function showFallback(error: unknown) {
    console.error('App failed to start:', error);
    const app = createApp(ErrorFallback, { error });
    app.use(i18n);
    app.mount('#app');
}
