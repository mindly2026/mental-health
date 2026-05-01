import type { Meta, StoryObj } from '@storybook/vue3'
import MdBottomNav from './MdBottomNav.vue'

const NAV_ITEMS = [
  { label: 'Home', icon: '🏠', value: 'home' },
  { label: 'Journal', icon: '📓', value: 'journal' },
  { label: 'Mood', icon: '😊', value: 'mood' },
  { label: 'Profile', icon: '👤', value: 'profile' },
]

const meta: Meta<typeof MdBottomNav> = {
  title: 'Components/MdBottomNav',
  component: MdBottomNav,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MdBottomNav>

export const Default: Story = {
  args: {
    items: NAV_ITEMS,
    modelValue: 'home',
  },
}

export const JournalActive: Story = {
  args: {
    items: NAV_ITEMS,
    modelValue: 'journal',
  },
}

export const MoodActive: Story = {
  args: {
    items: NAV_ITEMS,
    modelValue: 'mood',
  },
}
