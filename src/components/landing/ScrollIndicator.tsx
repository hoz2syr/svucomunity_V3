import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const ScrollIndicator = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setHidden(true);
      else setHidden(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hidden) return null;

  return (
    <a href="#problems" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cyan-500/70 hover:text-cyan-400 animate-bounce transition-colors duration-300 z-20 pointer-events-auto">
      <ChevronDown size={32} />
    </a>
  );
};
