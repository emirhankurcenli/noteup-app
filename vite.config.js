import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
      '@features': resolve(__dirname, 'src/features'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@layout': resolve(__dirname, 'src/layout'),
      '@platform': resolve(__dirname, 'src/platform'),
    }
  },
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    target: 'es2015',
    minify: true,
    chunkSizeWarningLimit: 10000,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
        }
      }
    }
  }
})
