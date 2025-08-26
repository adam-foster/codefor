import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  appType: 'mpa',
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        theHunt: resolve(__dirname, 'the-hunt/index.html'),
      },
    },
  },
})