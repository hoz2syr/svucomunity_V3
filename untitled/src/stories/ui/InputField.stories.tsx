import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputField } from '../../components/ui/InputField';

const meta = {
  title: 'Components/InputField',
  component: InputField,
  tags: ['autodocs'],
  args: {
    id: 'story-email',
    label: 'البريد الإلكتروني',
    type: 'email',
    placeholder: 'email@example.com',
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'صيغة البريد غير صحيحة',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
