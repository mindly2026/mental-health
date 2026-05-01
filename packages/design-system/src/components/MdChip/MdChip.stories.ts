import type { Meta, StoryObj } from '@storybook/vue3'
import MdChip from './MdChip.vue'

const meta: Meta<typeof MdChip> = {
  title: 'Components/MdChip',
  component: MdChip,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    components: { MdChip },
    setup() {
      return { args }
    },
    template: '<MdChip v-bind="args">Anxiety</MdChip>',
  }),
}

export default meta
type Story = StoryObj<typeof MdChip>

export const Default: Story = { args: { active: false } }
export const Active: Story = { args: { active: true } }
export const Disabled: Story = { args: { disabled: true } }
