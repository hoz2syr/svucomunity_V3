import { useEffect } from 'react';

type UseClickOutsideOptions = {
  enabled?: boolean;
};

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: Event) => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
