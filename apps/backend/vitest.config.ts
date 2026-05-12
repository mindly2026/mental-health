import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    isolate: false,
    hookTimeout: 60_000,
    testTimeout: 10_000,
  },
})
