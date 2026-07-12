import { useState, useCallback } from 'react';
import { useForm, UseFormReturn, FieldError, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../schemas/auth.schema';

type Mode = 'login' | 'register';

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  name?: string;
  server?: string;
};

export type UseAuthFormOptions = {
  mode?: Mode;
};

export type UseAuthFormReturn = {
  form: UseFormReturn<LoginInput | RegisterInput>;
  isLoading: boolean;
  serverError: string;
  setServerError: (error: string) => void;
  clearServerError: () => void;
  handleSubmit: () => Promise<LoginInput | RegisterInput | null>;
  reset: () => void;
  fieldErrors: AuthFieldErrors;
  hasFieldErrors: boolean;
  setLoading: (loading: boolean) => void;
};

const FIELD_KEYS = ['email', 'password', 'name'] as const;

const extractFieldErrors = (errors: FieldErrors<LoginInput | RegisterInput>): AuthFieldErrors => {
  const mapped: AuthFieldErrors = {};
  for (const key of FIELD_KEYS) {
    const fieldErrors = errors as Record<string, FieldError | undefined>;
    const err = fieldErrors[key];
    if (err?.message) mapped[key] = err.message;
  }
  return mapped;
};

export function useAuthForm({ mode = 'login' }: UseAuthFormOptions = {}): UseAuthFormReturn {
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'register' ? { name: '' } : {}),
    },
  });

  const { handleSubmit: rhfHandleSubmit } = form;

  const clearServerError = useCallback(() => setServerError(''), []);

  const handleSubmit = useCallback(async (): Promise<LoginInput | RegisterInput | null> => {
    return new Promise((resolve) => {
      rhfHandleSubmit(
          (values) => {
            setFieldErrors({});
            setServerError('');
            setIsLoading(true);
            resolve(values);
          },
          (errors) => {
            setFieldErrors(extractFieldErrors(errors as FieldErrors<LoginInput | RegisterInput>));
            setIsLoading(false);
            resolve(null);
          }
      )();
    });
  }, [rhfHandleSubmit]);

  const reset = useCallback(() => {
    form.reset();
    setFieldErrors({});
    setServerError('');
  }, [form]);

  const setLoading = useCallback((loading: boolean) => setIsLoading(loading), []);

  return {
    form,
    isLoading,
    serverError,
    setServerError,
    clearServerError,
    handleSubmit,
    reset,
    fieldErrors,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
    setLoading,
  };
}
