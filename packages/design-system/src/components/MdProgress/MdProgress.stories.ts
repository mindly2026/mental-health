import type { Meta, StoryObj } from '@storybook/vue3'
import MdProgress from './MdProgress.vue'

const meta: Meta<typeof MdProgress> = {
  title: 'Components/MdProgress',
  component: MdProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof MdProgress>

export const Primary: Story = {
  args: { value: 65, max: 100, variant: 'primary', size: 'md' },
}

export const Secondary: Story = {
  args: { value: 40, max: 100, variant: 'secondary', size: 'md' },
}

export const Gradient: Story = {
  args: { value: 80, max: 100, variant: 'gradient', size: 'md' },
}

export const Small: Story = {
  args: { value: 50, max: 100, variant: 'primary', size: 'sm' },
}

export const Complete: Story = {
  args: { value: 100, max: 100, variant: 'primary', size: 'md' },
}
