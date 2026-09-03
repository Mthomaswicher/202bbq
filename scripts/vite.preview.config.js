// Single-file preview build: one JS chunk, images from a data-URI manifest,
// relative base — used to bundle the whole site into one HTML file for sharing.
//   PREVIEW_IMAGES=/path/images.preview.json PREVIEW_OUT=/path/dist \
//   npx vite build --config scripts/vite.preview.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const IMAGES = process.env.PREVIEW_IMAGES || path.join(ROOT, 'src/data/images.json');
const OUT = process.env.PREVIEW_OUT || path.join(ROOT, 'dist-preview');

export default defineConfig({
  root: ROOT,
  base: './',
  plugins: [react()],
  resolve: { alias: [{ find: /^.*data\/images\.json$/, replacement: IMAGES }] },
  build: {
    outDir: OUT,
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: { output: { manualChunks: undefined, inlineDynamicImports: true } },
  },
});
