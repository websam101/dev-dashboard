// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from "#q-app/wrappers";
import { fileURLToPath } from "node:url";

export default defineConfig((ctx) => {
  return {
    boot: ["i18n", "axios"],
    css: ["app.sass"],
    extras: [
      "mdi-v7",
      "roboto-font",
      "material-icons",
    ],
    build: {
      target: {
        browser: ["es2022", "firefox115", "chrome115", "safari14"],
        node: "node20",
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: "hash",
      vitePlugins: [
        [
          "@intlify/unplugin-vue-i18n/vite",
          {
            ssr: ctx.modeName === "ssr",
            include: [fileURLToPath(new URL("./src/i18n", import.meta.url))],
          },
        ],
        [
          "vite-plugin-checker",
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
            overlay: { initialIsOpen: false, position: "bl" },
          },
          { server: false },
        ],
      ],
    },
    devServer: {
      open: false,
      port: 8083,
      hmr: { port: 8084 },
    },
    framework: {
      config: {
        dark: true,
        brand: {
          primary: "#82B1FF",
          secondary: "#64FFDA",
          accent: "#EA80FC",
          dark: "#1E293B",
          "dark-page": "#0F172A",
          positive: "#69F0AE",
          negative: "#FF5252",
          info: "#40C4FF",
          warning: "#FFFF00",
        },
      },
      plugins: ["Notify", "Loading", "Dialog", "Dark"],
    },
    animations: [],
    ssr: {
      prodPort: 3000,
      middlewares: ["api", "render"],
    },
    pwa: { workboxMode: "GenerateSW" },
    capacitor: { hideSplashscreen: true },
    electron: {
      preloadScripts: ["electron-preload"],
      inspectPort: 5858,
      bundler: "packager",
      builder: { appId: "dev-dashboard" },
    },
  };
});
