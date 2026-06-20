import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { AuthCard } from '../components/shared/AuthCard';
import { ForgotPasswordModal } from '../components/shared/ForgotPasswordModal';
import { InputField } from '../components/ui/InputField';
import { GuestButton } from '../components/shared/GuestButton';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '../services/environment.service';
import { loginWithGoogle, loginWithPassword } from '../services/auth.service';
import { useRateLimit } from '../hooks/useRateLimit';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const auth = useAuthForm({ mode: 'login' });
  const rateLimiter = useRateLimit({ storageKey: 'login_rate_limit' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    auth.clearServerError();

    if (!hasSupabaseEnv()) {
      auth.setServerError(missingSupabaseEnvMessage);
      return;
    }

    const status = rateLimiter.status;
    if (status.blocked) {
      auth.setServerError('تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.');
      return;
    }

    const values = await auth.handleSubmit();
    if (!values) {
      rateLimiter.limiter.recordAttempt(true);
      return;
    }

    try {
      const { error } = await loginWithPassword(values.email, values.password);

      if (error) {
        auth.setServerError(error.message || 'فشل تسجيل الدخول. تحقق من البيانات.');
        rateLimiter.limiter.recordAttempt(true);
        return;
      }

      rateLimiter.limiter.recordAttempt(false);
      navigate('/dashboard');
    } catch {
      auth.setServerError('حدث خطأ غير متوقع.');
      rateLimiter.limiter.recordAttempt(true);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        auth.setServerError(error.message || 'فشل تسجيل الدخول بواسطة Google.');
      }
    } catch {
      auth.setServerError('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
    }
  };

  const { form } = auth;

  return (
    <>
      <AuthCard
        title="تسجيل الدخول"
        subtitle="SVU Community"
        submitText="تسجيل الدخول"
        loadingText="جاري تسجيل الدخول..."
        isLoading={auth.isLoading}
        serverError={auth.serverError}
        logoGradient="from-cyan-400 to-indigo-500"
        googleButtonText="تسجيل الدخول عبر Google"
        onGoogleClick={handleGoogleSignIn}
        footerText="ليس لديك حساب؟"
        footerLinkText="إنشاء حساب جديد"
        footerLinkTo="/register"
        onSubmit={onSubmit}
      >
        <InputField
          label="البريد الإلكتروني"
          type="email"
          id="email"
          name="email"
          value={form.watch('email')}
          onChange={(e) => form.setValue('email', e.target.value)}
           onBlur={() => {
             form.trigger('email');
             auth.clearServerError();
           }}
          placeholder="أدخل بريدك الإلكتروني"
          error={auth.fieldErrors.email || ''}
          showSuccessIndicator={!!form.watch('email') && !auth.fieldErrors.email}
          autoComplete="email"
          required
        />

        <InputField
          label="كلمة المرور"
          type="password"
          id="password"
          name="password"
          value={form.watch('password')}
          onChange={(e) => form.setValue('password', e.target.value)}
           onBlur={() => {
             form.trigger('password');
             auth.clearServerError();
           }}
          placeholder="أدخل كلمة المرور"
          error={auth.fieldErrors.password || ''}
          autoComplete="current-password"
          required
        />

        <GuestButton className="w-full" label="الدخول كزائر" />

        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors hover:underline underline-offset-4 decoration-cyan-400/30"
        >
          نسيت كلمة المرور؟
        </button>
      </AuthCard>

      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </>
  );
};
