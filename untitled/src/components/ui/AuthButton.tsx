import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface AuthButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  isLoading?: boolean;
  loadingText?: string;
  defaultText: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  isLoading = false, 
  loadingText, 
  defaultText, 
  disabled, 
  className = "",
  ...props 
}) => {
  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || disabled}
      className={`w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <span className="relative z-10 transition-transform group-hover:scale-105 flex items-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {isLoading ? (loadingText || defaultText) : defaultText}
      </span>
    </motion.button>
  );
};
