import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.svg"],
    //   manifest: {
    //     name: "Czaro-Zielnik",
    //     short_name: "Czaro-Zielnik",
    //     description: "Zielnik ziół polskich z tradycją ludową i kalendarzem zbioru",
    //     theme_color: "#3E4443",
    //     background_color: "#EAE4DA",
    //     display: "standalone",
    //     icons: [
    //       { src: "icon-192.png", sizes: "192x192", type: "image/png" },
    //       { src: "icon-512.png", sizes: "512x512", type: "image/png" },
    //     ],
    //   },
    // }),
  ],
});
