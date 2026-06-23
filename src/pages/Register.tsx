import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthForm } from '../hooks/useAuthForm';
import { RegisterInput } from '../schemas/auth.schema';
import { AuthCard } from '../components/shared/AuthCard';
import { InputField } from '../components/ui/InputField';
import { GuestButton } from '../components/shared/GuestButton';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '../services/environment.service';
import { loginWithGoogle, registerWithEmail } from '../services/auth.service';

export const RegisterPage = () => {
  const [success, setSuccess] = useState(false);
  const auth = useAuthForm({ mode: 'register' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    auth.clearServerError();
    setSuccess(false);

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

      setSuccess(true);
      auth.reset();
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f2e] relative overflow-hidden font-sans" dir="rtl">
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <a href="/" className="inline-flex items-center justify-center mb-5 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-105 group-hover:-rotate-3 duration-300">
                <span className="text-white font-extrabold text-2xl font-display">SVU</span>
              </div>
            </a>
            <h1 className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">إنشاء حساب جديد</h1>
            <p className="text-slate-400 text-sm mt-2 tracking-wide font-display">انضم إلى SVU Community اليوم</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative"
          >
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">تم إنشاء الحساب بنجاح!</h3>
              <p className="text-slate-400 leading-relaxed mb-8">
                مرحباً بك في <span className="text-cyan-400 font-medium">SVU Community</span>.
                يمكنك الآن تسجيل الدخول والدخول إلى لوحة التحكم.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                الدخول إلى لوحة التحكم
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                العودة لإنشاء حساب آخر
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-6"
          >
            <Link to="/" className="text-slate-400 flex items-center justify-center gap-2 hover:text-white transition-colors text-sm group">
              <ArrowRight size={16} className="transition-transform group-hover:-translate-x-1" />
              العودة للرئيسية
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

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
