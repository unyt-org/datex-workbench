import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'DATEX Workbench',
      short_name: 'Workbench',
      description: 'Developer tooling UI for the DATEX runtime',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['window-controls-overlay'],
      theme_color: '#0f172a',
      background_color: '#0f172a',
      icons: [
        { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
        { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
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
})
