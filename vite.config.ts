import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import type { Plugin } from "vite";

// Plugin to replace environment variables in index.html
const htmlEnvPlugin = (): Plugin => ({
  name: 'html-env-replace',
  transformIndexHtml(html) {
    return html
      .replace(/%VITE_APP_TITLE%/g, process.env.VITE_APP_TITLE || 'CycleScope')
      .replace(/%VITE_APP_LOGO%/g, process.env.VITE_APP_LOGO || '/logo.svg')
      .replace(/%VITE_ANALYTICS_ENDPOINT%/g, process.env.VITE_ANALYTICS_ENDPOINT || '')
      .replace(/%VITE_ANALYTICS_WEBSITE_ID%/g, process.env.VITE_ANALYTICS_WEBSITE_ID || '');
  },
});

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), htmlEnvPlugin()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
