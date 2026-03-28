import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'MentalHealthDS',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      // Vue is provided by the consumer
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
