import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
    allowedHosts: [
      'music-animation-generator-production.up.railway.app',
      '.railway.app',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'tone']
  }
})
