import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test-only config, kept separate from vite.config.ts so the production build's
// tsc pass never sees Vitest's `test` key (Vite 8/Rolldown and Vitest bundle
// different Vite type versions, which clash when merged in one typed config).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
