import { defineConfig } from 'vitest/config';

// Estos casos usan streams y HTTP de Node; no pertenecen al navegador.
export default defineConfig({
  envDir: false,
  test: {
    name: 'servidor-node',
    environment: 'node',
    include: ['server/**/*.test.js'],
    restoreMocks: true,
    reporters: ['default', 'json'],
    outputFile: { json: 'docs/resultados-vitest-servidor.json' },
    coverage: {
      provider: 'v8',
      include: ['server/chat.js'],
      reportsDirectory: 'coverage/server',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
    },
  },
});
