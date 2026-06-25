"use client";

import type { ReactNode } from 'react';
import { Button } from './Button';

interface PrimaryButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  icon?: ReactNode;
  to?: string;
}

export function PrimaryButton(props: PrimaryButtonProps) {
  return <Button {...props} variant="primary" />;
}
