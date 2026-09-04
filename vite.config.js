import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ---------------------------------------------------------------------------
// PWA bylo tu zakomentowane, przez co "Dodaj do ekranu glownego" dawalo sam
// skrot do strony: bez zasiegu appka nie wstawala w ogole. Teraz service
// worker trzyma cala aplikacje i biblioteke u siebie lokalnie, wiec w lesie
// otwiera sie natychmiast i dziala — brakuje wylacznie rozpoznawania ze
// zdjecia, ktore i tak wymaga serwera (i ma na to kolejke).
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "Czaro-Zielnik",
        short_name: "Czaro-Zielnik",
        description:
          "Zielnik ziol polskich z tradycja ludowa, kalendarzem zbioru i rozpoznawaniem roslin. Dziala bez zasiegu.",
        lang: "pl",
        theme_color: "#EAE4DA",
        background_color: "#EAE4DA",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cala appka plus wbudowane zdjecia ziol ida do precache — po pierwszym
        // otwarciu w domu wszystko jest juz na telefonie.
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: "index.html",
        // /api/* nigdy nie moze isc z cache — rozpoznanie ma byc swieze
        // albo ma trafic do kolejki.
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Fonty: raz pobrane zostaja na rok. Bez tego kazde otwarcie
            // appki w terenie czeka na siec, zanim narysuje tekst.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "czaro-fonty",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Zdjecia dociagane z sieci dla gatunkow spoza pelnych hasel —
            // raz obejrzane zostaja na telefonie.
            urlPattern:
              /^https:\/\/(upload\.wikimedia\.org|images\.unsplash\.com|pl\.wikipedia\.org)\//,
            handler: "CacheFirst",
            options: {
              cacheName: "czaro-zdjecia",
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 120 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
