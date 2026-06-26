import React, { useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeInputAttrs {
  id?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  ref?: React.Ref<HTMLInputElement>;
}

type InputFieldProps = {
  label: string;
  error?: string;
  showSuccessIndicator?: boolean;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
} & SafeInputAttrs;

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  showSuccessIndicator,
  type = "text",
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  className = "",
  id,
  ref,
  name,
  placeholder,
  autoComplete,
  readOnly,
  disabled,
  required,
  maxLength,
  pattern,
  inputMode,
}: InputFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const baseClasses = [
    'w-full bg-[var(--color-bg-input)]/50 border rounded-xl px-4 py-3',
    'text-white placeholder:text-slate-500',
    'focus:outline-none focus:ring-4 transition-all font-sans',
  ];
  const stateClasses = error
    ? [
        'border-[var(--color-danger)]/50',
        'focus:border-[var(--color-danger)]',
        'focus:ring-[var(--color-danger-light)]/20',
      ]
    : [
        'border-white/10',
        'focus:border-cyan-400',
        'focus:ring-cyan-400/20',
      ];
  const positionClasses = isPassword ? 'pl-11 pr-4' : 'pr-10';
  const mergedClassName = cn(baseClasses, stateClasses, positionClasses, className);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      {label && (
        <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wider" htmlFor={inputId}>
          {label}
        </label>
      )}
      <motion.div
        animate={{ scale: 1 }}
        className="relative"
      >
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          pattern={pattern}
          inputMode={inputMode}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={mergedClassName}
        />
        
        {/* Success Indicator for Text/Email */}
        {!isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pr-1">
            <AnimatePresence>
              {showSuccessIndicator && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Password Toggle Button */}
        {isPassword && (
          <button 
            type="button"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p 
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="text-[var(--color-danger-400)] text-xs mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
