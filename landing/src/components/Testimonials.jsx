import { motion } from 'motion/react';

const testimonials = [
  {
    name: 'Sarah Al-Rashid',
    role: 'Computer Science, Year 3',
    quote: 'SVU Community completely changed how I study. The AI assistant helps me understand complex topics, and the schedule planner keeps me organized.',
  },
  {
    name: 'Ahmed Hassan',
    role: 'Engineering, Year 2',
    quote: 'The peer collaboration tools are incredible. I found my study group here and our grades have improved dramatically.',
  },
  {
    name: 'Layla Mahmoud',
    role: 'Medicine, Year 4',
    quote: 'Having all my courses, notes, and deadlines in one place is a game-changer. The smart notifications alone saved me from missing so many deadlines.',
  },
];

export default function Testimonials() {
  return (
    <section className="relative z-10 px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-white/50 text-[10px] md:text-[11px] font-medium tracking-[0.25em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-[-0.01em] leading-[1.15] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent font-serif max-w-3xl mx-auto">
            Loved by students across the university
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="liquid-glass rounded-2xl p-6 md:p-8 flex flex-col gap-5"
            >
              <p className="text-white/60 text-[14px] md:text-[15px] leading-relaxed flex-1">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium text-[13px]">{testimonial.name}</p>
                  <p className="text-white/40 text-[12px]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
