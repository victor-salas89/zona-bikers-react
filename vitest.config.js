import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

// Configuración de pruebas separada de Vite: no inicia el servidor del chat
// ni carga credenciales. El navegador es Chromium de Playwright, no Edge.
export default defineConfig({
  envDir: false,
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    include: ['react', 'react-dom/client', '@testing-library/react'],
  },
  test: {
    name: 'frontend-chromium',
    include: ['src/**/*.spec.{js,jsx}'],
    setupFiles: ['./src/test/setup.js'],
    restoreMocks: true,
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    reporters: ['default', 'json'],
    outputFile: { json: 'docs/resultados-vitest-chromium.json' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/**/*.spec.{js,jsx}', 'src/test/**', 'src/main.jsx'],
      reportsDirectory: 'coverage/frontend',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
    },
  },
});
