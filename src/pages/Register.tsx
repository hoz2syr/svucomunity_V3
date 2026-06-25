import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import { RegisterInput } from '../schemas/auth.schema';
import { AuthCard } from '../components/shared/AuthCard';
import { InputField } from '../components/ui/InputField';
import { GuestButton } from '../components/shared/GuestButton';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '../services/environment.service';
import { loginWithGoogle, registerWithEmail } from '../services/auth.service';
import { useGuest } from '../contexts/GuestContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const auth = useAuthForm({ mode: 'register' });
  const { disableGuestMode } = useGuest();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    auth.clearServerError();

    if (!hasSupabaseEnv()) {
      auth.setServerError(missingSupabaseEnvMessage);
      return;
    }

    const values = await auth.handleSubmit();
    if (!values) return;
    const registerValues = values as RegisterInput;

    try {
      const { error } = await registerWithEmail(registerValues.name, registerValues.email, registerValues.password);

      if (error) {
        auth.setServerError(error.message || 'فشل إنشاء الحساب. حاول مرة أخرى.');
        auth.setLoading(false);
        return;
      }

      disableGuestMode();
      navigate('/dashboard');
    } catch {
      auth.setServerError('حدث خطأ غير متوقع أثناء إنشاء الحساب.');
      auth.setLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        auth.setServerError(error.message || 'فشل إنشاء الحساب بواسطة Google.');
      }
    } catch {
      auth.setServerError('حدث خطأ غير متوقع أثناء إنشاء الحساب.');
    }
  };

  const { form } = auth;

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      subtitle="انضم إلى SVU Community اليوم"
      submitText="إنشاء الحساب"
      loadingText="جاري إنشاء الحساب..."
      isLoading={auth.isLoading}
      serverError={auth.serverError}
      logoGradient="from-cyan-400 to-indigo-500"
        googleButtonText="إنشاء حساب عبر Google"
        onGoogleClick={handleGoogleSignIn}
        footerText="لديك حساب بالفعل؟"
      footerLinkText="سجل دخولك"
      footerLinkTo="/login"
      onSubmit={onSubmit}
    >
      <InputField
        label="الاسم الكامل"
        type="text"
        id="name"
        name="name"
        value={form.watch('name')}
        onChange={(e) => form.setValue('name', e.target.value)}
         onBlur={() => {
           form.trigger('name');
           auth.clearServerError();
         }}
        placeholder="أدخل اسمك الكامل"
        error={auth.fieldErrors.name || ''}
        showSuccessIndicator={!!form.watch('name') && !auth.fieldErrors.name}
        autoComplete="name"
        required
      />

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

      <div className="relative">
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
          autoComplete="new-password"
          required
        />
        {!auth.fieldErrors.password && (
          <p className="text-slate-500 text-xs mt-2">
            8 أحرف على الأقل، حرف كبير، حرف صغير، رقم ورمز خاص
          </p>
        )}

        <GuestButton className="w-full" label="المتابعة كزائر" />
        </div>
      </AuthCard>
  );
};
