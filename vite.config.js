import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is '/' locally and '/<repo-name>/' on GitHub Pages.
// The Actions workflow sets VITE_BASE_URL automatically.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL ?? '/',
})
