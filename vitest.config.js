import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude the build folder and other files you don't want to include
    exclude: ['dist/**', 'build/**', 'node_modules/**'],
  },
});
