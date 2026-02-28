import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    // Solo ejecutar tests en src/__tests__/ (excluye src_backup y node_modules)
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['src_backup*/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**', 'src/hooks/**', 'src/utils/**'],
      exclude: [
        'src/types/**',
        'src/__tests__/**',
        'src/**/*.d.ts',
        'src/lib/supabase.ts',
      ],
      thresholds: {
        lines: 3,
        functions: 5,
        branches: 5,
        statements: 3,
      },
    },
  },
});
