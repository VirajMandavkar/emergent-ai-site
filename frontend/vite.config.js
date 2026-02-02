import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Enable health check based on environment variable
    __ENABLE_HEALTH_CHECK__: process.env.ENABLE_HEALTH_CHECK === 'true',
  },
})