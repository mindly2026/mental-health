import type { Meta, StoryObj } from '@storybook/vue3'
import MdBadge from './MdBadge.vue'

const meta: Meta<typeof MdBadge> = {
  title: 'Components/MdBadge',
  component: MdBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blue', 'teal', 'success', 'warning', 'error', 'neutral'],
    },
  },
  render: (args) => ({
    components: { MdBadge },
    setup() {
      return { args }
    },
    template: '<MdBadge v-bind="args">{{ args.variant }}</MdBadge>',
  }),
}

export default meta
type Story = StoryObj<typeof MdBadge>

export const Blue: Story = { args: { variant: 'blue' } }
export const Teal: Story = { args: { variant: 'teal' } }
export const Success: Story = { args: { variant: 'success' } }
export const Warning: Story = { args: { variant: 'warning' } }
export const Error: Story = { args: { variant: 'error' } }
export const Neutral: Story = { args: { variant: 'neutral' } }
