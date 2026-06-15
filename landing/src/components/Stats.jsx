import { motion } from 'motion/react';
import { Users, BookOpen, Star, Zap } from 'lucide-react';

const stats = [
  { icon: Users, value: '5,000+', label: 'Active Students' },
  { icon: BookOpen, value: '200+', label: 'Courses Available' },
  { icon: Star, value: '4.9/5', label: 'Student Rating' },
  { icon: Zap, value: '24/7', label: 'AI Support' },
];

export default function Stats() {
  return (
    <section className="relative z-10 px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="liquid-glass rounded-2xl md:rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-1">
                  <stat.icon className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-white/40 text-[12px] md:text-[13px] font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
