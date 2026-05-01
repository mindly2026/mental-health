import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { StorybookConfig } from '@storybook/vue3-vite'

const require = createRequire(import.meta.url)
const dsRoot = dirname(require.resolve('@mental-health/design-system/package.json'))

const config: StorybookConfig = {
  stories: [join(dsRoot, 'src/**/*.stories.@(js|jsx|ts|tsx)')],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')
    const { default: vue } = await import('@vitejs/plugin-vue')
    return mergeConfig(config, {
      plugins: [vue()],
    })
  },
}

export default config
