import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: 'DATEX Workbench',
                short_name: 'Workbench',
                description: 'Developer tooling UI for the DATEX runtime',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                display_override: ['window-controls-overlay'],
                theme_color: 'oklch(0.145 0 0)',
                background_color: 'oklch(0.145 0 0))',
                icons: [
                    { src: '/icon.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon.png', sizes: '512x512', type: 'image/png' },
                ],
                file_handlers: [
                    {
                        action: '/block',
                        accept: {
                            'application/octet-stream': ['.dx', '.dxb'],
                        },
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            },
        }),
    ],
    cacheDir: 'node_modules/.vite',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
