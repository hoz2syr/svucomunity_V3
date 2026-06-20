import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardSkeleton, Skeleton } from '../../components/ui/Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    className: 'w-full h-6',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Card: Story = {
  render: () => <CardSkeleton />,
};
