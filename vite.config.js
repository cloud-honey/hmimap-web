import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:4003',
    }
  },
  build: {
    outDir: 'dist',
  }
})