import type { Meta, StoryObj } from '@storybook/vue3'
import MdToggle from './MdToggle.vue'

const meta: Meta<typeof MdToggle> = {
  title: 'Components/MdToggle',
  component: MdToggle,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof MdToggle>

export const Off: Story = {
  args: { label: 'Daily reminders', modelValue: false },
}

export const On: Story = {
  args: { label: 'Daily reminders', modelValue: true },
}

export const Disabled: Story = {
  args: { label: 'Notifications (disabled)', modelValue: false, disabled: true },
}
