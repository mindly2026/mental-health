import type { Meta, StoryObj } from '@storybook/vue3'
import BaseButton from './BaseButton.vue'

const meta: Meta<typeof BaseButton> = {
  title: 'Components/MdButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    icon: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  render: (args) => ({
    components: { BaseButton },
    setup() {
      return { args }
    },
    template: '<BaseButton v-bind="args">{{ args.icon ? "★" : "Click me" }}</BaseButton>',
  }),
}

export default meta
type Story = StoryObj<typeof BaseButton>

export const Primary: Story = {
  args: { variant: 'primary', size: 'md' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', size: 'md' },
}

export const Outline: Story = {
  args: { variant: 'outline', size: 'md' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', size: 'md' },
}

export const Danger: Story = {
  args: { variant: 'danger', size: 'md' },
}

export const Small: Story = {
  args: { variant: 'primary', size: 'sm' },
}

export const Large: Story = {
  args: { variant: 'primary', size: 'lg' },
}

export const Icon: Story = {
  args: { variant: 'primary', icon: true },
}

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
}

export const Loading: Story = {
  args: { variant: 'primary', loading: true },
}
