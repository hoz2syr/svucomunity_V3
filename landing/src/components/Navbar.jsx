import { motion } from 'motion/react';
import { GraduationCap, Users, BookOpen, Calendar, Brain, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-20 px-6 py-6 w-full"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-white" />
            <span className="text-white font-semibold text-lg">SVU Community</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-white/80 transition-colors text-sm font-medium cursor-pointer">
            Join Now
          </button>
          <button className="liquid-glass rounded-full px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer">
            Sign In
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
