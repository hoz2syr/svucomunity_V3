import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlassCard } from '../../components/ui/GlassCard';

const meta = {
  title: 'Components/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  args: {
    children: 'بطاقة شفافة',
    className: 'p-8 text-white',
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  args: {
    children: 'مرّر المؤشر فوق البطاقة',
    className: 'p-8 text-white',
  },
};
