import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend runs on http://localhost:5195 (see backend/Properties/launchSettings.json).
// Dev-proxy the REST resources so the SPA can call them same-origin without CORS
// concerns. Override the target with VITE_API_TARGET when needed (e.g. Docker).
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:5195'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': { target: apiTarget, changeOrigin: true },
      '/labels': { target: apiTarget, changeOrigin: true },
    },
  },
})
