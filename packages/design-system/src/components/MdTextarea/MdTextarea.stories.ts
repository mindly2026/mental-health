import type { Meta, StoryObj } from '@storybook/vue3'
import MdTextarea from './MdTextarea.vue'

const meta: Meta<typeof MdTextarea> = {
  title: 'Components/MdTextarea',
  component: MdTextarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    rows: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof MdTextarea>

export const Default: Story = {
  args: {
    label: 'Journal entry',
    placeholder: 'How are you feeling today?',
    rows: 4,
  },
}

export const WithHint: Story = {
  args: {
    label: 'Notes',
    placeholder: 'Add notes…',
    hint: 'This is private and only visible to you.',
    rows: 3,
  },
}

export const WithError: Story = {
  args: {
    label: 'Reflection',
    placeholder: 'Write here…',
    error: 'This field is required.',
  },
}

export const Disabled: Story = {
  args: {
    label: 'Archived note',
    modelValue: 'This entry has been archived.',
    disabled: true,
  },
}
