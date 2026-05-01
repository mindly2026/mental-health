import type { Meta, StoryObj } from '@storybook/vue3'
import BaseCard from './BaseCard.vue'

const meta: Meta<typeof BaseCard> = {
  title: 'Components/MdCard',
  component: BaseCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'feature', 'mood', 'streak', 'accent'],
    },
    interactive: { control: 'boolean' },
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p style="margin:0;color:var(--color-text-body,#4a5568)">Card content goes here.</p>
      </BaseCard>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof BaseCard>

export const Default: Story = {
  args: { variant: 'default' },
}

export const Feature: Story = {
  args: { variant: 'feature', title: 'Feature Card' },
}

export const Mood: Story = {
  args: { variant: 'mood', title: 'Mood' },
}

export const Streak: Story = {
  args: { variant: 'streak', title: '7-day streak' },
}

export const Accent: Story = {
  args: { variant: 'accent', title: 'Accent' },
}

export const Interactive: Story = {
  args: { variant: 'default', title: 'Interactive Card', interactive: true },
}
