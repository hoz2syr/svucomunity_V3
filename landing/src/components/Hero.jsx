import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

export default function Hero() {
  const [showForm, setShowForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const typewriterRef = useRef(null);

  useEffect(() => {
    if (!showForm) return;

    const text = isSubmitted
      ? 'You Will Receive Notifications By Email'
      : 'Enter Your Email Here For Early Access';

    setDisplayedPlaceholder('');
    let index = 0;
    typewriterRef.current = setInterval(() => {
      index++;
      setDisplayedPlaceholder(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(typewriterRef.current);
      }
    }, 60);

    return () => clearInterval(typewriterRef.current);
  }, [showForm, isSubmitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setIsSubmitted(false);
      setInputValue('');
      setDisplayedPlaceholder('');
    }, 4000);
  };

  return (
    <section className="relative flex-1 flex flex-col items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
        >
          BUILD A NO-CODE AI APP IN MINUTES
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl font-serif"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          A new way to think and create with computers
          <br className="hidden md:block" />
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="min-h-[50px] mt-2 flex flex-col items-center"
        >
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.button
                key="cta-button"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowForm(true)}
                className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer"
              >
                Get early access
              </motion.button>
            ) : (
              <motion.form
                key="cta-form"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300"
              >
                <input
                  type="email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={displayedPlaceholder}
                  autoFocus
                  className="bg-transparent text-white placeholder-white/45 outline-none flex-1 min-w-0 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  {isSubmitted ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button className="text-white/80 hover:text-white/40 transition-colors duration-300 text-[13px] font-medium tracking-wide cursor-pointer">
            Play Video Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}
