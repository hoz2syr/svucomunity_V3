import { type ClassValue } from 'clsx';
import { cn } from './utils';

interface VariantConfig {
  variants?: Record<string, { [key: string]: ClassValue[] }>;
  defaultVariants?: Record<string, string | boolean>;
}

export function cva(base: ClassValue[], config?: VariantConfig) {
  return (props?: { [key: string]: string | boolean }) => {
    const variantClasses: ClassValue[] = [];
    if (config?.variants && props) {
      for (const [key, value] of Object.entries(props)) {
        const keyStr = String(key);
        const variantValues = config.variants?.[keyStr];
        if (variantValues && typeof value === 'boolean') {
          const boolKey = String(value);
          if (variantValues[boolKey]) {
            variantClasses.push(...variantValues[boolKey]);
          }
        } else if (variantValues && typeof value === 'string') {
          if (variantValues[value]) {
            variantClasses.push(...variantValues[value]);
          }
        }
      }
    }
    return cn(...base, ...variantClasses);
  };
}
