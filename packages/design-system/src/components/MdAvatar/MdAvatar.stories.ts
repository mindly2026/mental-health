import type { Meta, StoryObj } from '@storybook/vue3'
import MdAvatar from './MdAvatar.vue'

const meta: Meta<typeof MdAvatar> = {
  title: 'Components/MdAvatar',
  component: MdAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    color: {
      control: 'select',
      options: ['blue', 'teal', 'navy', 'blend'],
    },
    ringColor: {
      control: 'select',
      options: ['blue', 'teal'],
    },
    status: {
      control: 'select',
      options: ['online', 'away', 'offline', undefined],
    },
    ring: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof MdAvatar>

export const Default: Story = {
  args: { initials: 'JD', size: 'md', color: 'blue' },
}

export const WithRing: Story = {
  args: { initials: 'SK', size: 'lg', color: 'teal', ring: true, ringColor: 'teal' },
}

export const Online: Story = {
  args: { initials: 'AM', size: 'md', color: 'blue', status: 'online' },
}

export const Away: Story = {
  args: { initials: 'RP', size: 'md', color: 'navy', status: 'away' },
}

export const Offline: Story = {
  args: { initials: 'LB', size: 'md', color: 'blend', status: 'offline' },
}

export const ExtraLarge: Story = {
  args: { initials: 'VW', size: '2xl', color: 'blue', ring: true },
}
