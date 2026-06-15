import { motion } from 'motion/react';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative z-10 px-6 py-24 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl md:rounded-[40px] p-10 md:p-16 flex flex-col items-center gap-8"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white/80" />
          </div>

          <h2 className="text-3xl md:text-[40px] font-medium tracking-[-0.01em] leading-[1.15] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent font-serif max-w-2xl">
            Ready to transform your student experience?
          </h2>

          <p className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed">
            Join thousands of students already using SVU Community to learn smarter, collaborate better, and achieve more.
          </p>

          <motion.button
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="px-10 py-4 text-[15px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer flex items-center gap-2"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <p className="text-white/30 text-[12px]">
            No credit card required · Free forever for students
          </p>
        </motion.div>
      </div>
    </section>
  );
}
