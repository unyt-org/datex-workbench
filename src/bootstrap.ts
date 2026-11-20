import './assets/main.css';
import 'vue-sonner/style.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { usePreferences } from '@/preferences';

// Initialize preferences (theme + locale) on startup
usePreferences();

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount('#app');

// PWA file association: handle .dx / .dxb files opened from the OS
if ('launchQueue' in window) {
    // @ts-expect-error launchQueue is not yet in the DOM lib types
    window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files?.length) return;

        const fileHandle = launchParams.files[0];
        const file = await fileHandle.getFile();

        const { setPendingLaunchedFile } = await import('@/lib/pwaLaunch');
        setPendingLaunchedFile(file);

        router.push('/block');
    });
}
