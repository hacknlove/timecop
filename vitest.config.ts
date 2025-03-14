import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}); 