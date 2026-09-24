import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png',
        'maskable-icon-192x192.png',
        'maskable-icon-512x512.png',
        'logo_leralscolaire.png'
      ],
      manifest: {
        name: 'LeralScolaire - Livret Scolaire & Baccalauréat National',
        short_name: 'LeralScolaire',
        description: 'Plateforme nationale de gestion et sécurisation du parcours scolaire et du Baccalauréat au Sénégal',
        start_url: '/',
        id: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        lang: 'fr',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Les documents (PDF, exports, fichiers envoyés) ouverts par lien ne sont pas des pages de l'application
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    // Backend cible en développement (modifiable avec la variable d'environnement API_PROXY_TARGET)
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:5002',
      '/uploads': process.env.API_PROXY_TARGET || 'http://localhost:5002'
    }
  }
})
