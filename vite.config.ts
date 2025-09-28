import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
