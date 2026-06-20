import { useState, useCallback } from 'react';
import { useForm, SubmitHandler, UseFormReturn, FieldError } from 'react-hook-form';
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
};

export function useAuthForm({ mode = 'login' }: UseAuthFormOptions = {}): UseAuthFormReturn {
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const form = useForm<LoginInput | RegisterInput>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
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
          const mapped: AuthFieldErrors = {};
          const mapError = (err: FieldError | undefined, key: 'email' | 'password' | 'name') => {
            if (err?.message) mapped[key] = err.message;
          };
          const allErrors = errors as Record<string, FieldError | undefined>;
          mapError(allErrors.email, 'email');
          mapError(allErrors.password, 'password');
          mapError(allErrors.name, 'name');
          setFieldErrors(mapped);
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
  };
}
