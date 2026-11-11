import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative paths so GitHub Pages / any static host works
  base: './',
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
})
