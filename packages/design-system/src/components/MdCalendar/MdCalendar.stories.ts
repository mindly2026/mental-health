import type { Meta, StoryObj } from '@storybook/vue3'
import MdCalendar from './MdCalendar.vue'

const today = new Date()
today.setHours(0, 0, 0, 0)

function daysAgo(n: number) {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d
}

const meta: Meta<typeof MdCalendar> = {
  title: 'Components/MdCalendar',
  component: MdCalendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MdCalendar>

export const Default: Story = {
  args: {
    modelValue: today,
    markedDates: [],
  },
}

export const WithMarkedDates: Story = {
  args: {
    modelValue: today,
    markedDates: [daysAgo(1), daysAgo(3), daysAgo(5), daysAgo(7), daysAgo(10)],
  },
}

export const NoSelection: Story = {
  args: {
    markedDates: [daysAgo(2), daysAgo(4), daysAgo(6)],
  },
}
