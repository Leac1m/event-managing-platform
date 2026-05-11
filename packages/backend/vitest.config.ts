import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 10000,
    hookTimeout: 10000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'sqlite.db',
    },
  },
});
