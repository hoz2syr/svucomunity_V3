import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServerError } from '../../components/ui/ServerError';

const meta = {
  title: 'Components/ServerError',
  component: ServerError,
  tags: ['autodocs'],
  args: {
    error: 'حدث خطأ أثناء الاتصال بالخدمة.',
  },
} satisfies Meta<typeof ServerError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    error: '',
  },
};
