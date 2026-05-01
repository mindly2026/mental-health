import type { Meta, StoryObj } from '@storybook/vue3'
import MdTopBar from './MdTopBar.vue'

const meta: Meta<typeof MdTopBar> = {
  title: 'Components/MdTopBar',
  component: MdTopBar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MdTopBar>

export const Default: Story = {
  args: {
    greeting: 'Good morning',
    subtitle: 'How are you feeling today?',
    avatarInitials: 'JD',
  },
}

export const Evening: Story = {
  args: {
    greeting: 'Good evening',
    subtitle: 'Time to reflect on your day.',
    avatarInitials: 'SK',
  },
}

export const NoSubtitle: Story = {
  args: {
    greeting: 'Welcome back',
    avatarInitials: 'AM',
  },
}
