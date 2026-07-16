import { useState } from 'react';
import { SUCCESS_MESSAGE_TIMEOUT_MS } from '@/src/lib/constants';
import type { SecurityInput } from '../types/auth';

export const useSecuritySettings = (onSubmit: (data: SecurityInput) => Promise<string | null>, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (data: SecurityInput) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await onSubmit(data);
      if (result) {
        setErrorMsg(result);
      } else {
        setSuccessMsg('تم تحديث كلمة المرور بنجاح');
        onSuccess?.();
        setTimeout(() => setSuccessMsg(''), SUCCESS_MESSAGE_TIMEOUT_MS);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, successMsg, errorMsg, submit };
};
