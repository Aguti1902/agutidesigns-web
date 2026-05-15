import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate manifest for cache-busting awareness
    manifest: true,
    rollupOptions: {
      // Ensure the SPA entry is named consistently
      input: {
        main: './index.html',
      },
    },
  },
})
