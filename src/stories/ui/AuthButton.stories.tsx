import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AuthButton } from '../../components/ui/AuthButton';

const meta = {
  title: 'Components/AuthButton',
  component: AuthButton,
  tags: ['autodocs'],
  args: {
    defaultText: 'تسجيل الدخول',
    onClick: fn(),
  },
} satisfies Meta<typeof AuthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
    loadingText: 'جاري التسجيل...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
