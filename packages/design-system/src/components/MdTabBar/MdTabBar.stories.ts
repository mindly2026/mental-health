import type { Meta, StoryObj } from '@storybook/vue3'
import MdTabBar from './MdTabBar.vue'

const meta: Meta<typeof MdTabBar> = {
  title: 'Components/MdTabBar',
  component: MdTabBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MdTabBar>

export const Default: Story = {
  args: {
    tabs: ['Daily', 'Weekly', 'Monthly'],
    modelValue: 'Daily',
  },
}

export const WeeklyActive: Story = {
  args: {
    tabs: ['Daily', 'Weekly', 'Monthly'],
    modelValue: 'Weekly',
  },
}

export const ManyTabs: Story = {
  args: {
    tabs: ['All', 'Anxiety', 'Depression', 'Sleep', 'Stress'],
    modelValue: 'All',
  },
}
