import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 px-6 py-12 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-white/60" />
          <span className="text-white/60 font-medium text-sm">SVU Community</span>
        </div>

        <div className="flex items-center gap-8 text-white/30 text-[12px] font-medium">
          <a href="#" className="hover:text-white/60 transition-colors duration-300">
            About
          </a>
          <a href="#" className="hover:text-white/60 transition-colors duration-300">
            Features
          </a>
          <a href="#" className="hover:text-white/60 transition-colors duration-300">
            Contact
          </a>
          <a href="#" className="hover:text-white/60 transition-colors duration-300">
            Privacy
          </a>
        </div>

        <p className="text-white/20 text-[12px]">
          © {new Date().getFullYear()} SVU Community. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
