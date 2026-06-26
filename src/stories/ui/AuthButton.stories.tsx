import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from '../../components/ui/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'auth',
    children: 'تسجيل الدخول',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AuthDefault: Story = {};

export const AuthLoading: Story = {
  args: {
    isLoading: true,
    loadingText: 'جاري التسجيل...',
  },
};

export const AuthDisabled: Story = {
  args: {
    disabled: true,
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'إجراء',
    onClick: fn(),
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'حذف',
    onClick: fn(),
  },
};
