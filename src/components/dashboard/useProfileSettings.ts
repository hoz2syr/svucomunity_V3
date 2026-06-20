import { useState } from 'react';
import type { ProfileInput } from '../../types/auth';

export const useProfileSettings = (onSubmit: (data: ProfileInput) => Promise<string | null>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (data: ProfileInput) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await onSubmit(data);
      if (result) {
        setErrorMsg(result);
      } else {
        setSuccessMsg('تم حفظ التغييرات بنجاح');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, successMsg, errorMsg, submit };
};
