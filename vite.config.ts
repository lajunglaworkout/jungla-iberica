import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@lib': path.resolve(__dirname, './src/lib')
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir advertencias de TypeScript durante el build
        if (warning.code === 'PLUGIN_WARNING') return
        warn(warning)
      }
    }
  },
  esbuild: {
    // Ignorar errores de TypeScript durante el build
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
